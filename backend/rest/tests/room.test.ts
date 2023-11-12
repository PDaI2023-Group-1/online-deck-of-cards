import { app } from "../src/app";
import request from "supertest";
import crypto from "crypto";

process.env.SECRET_KEY = crypto.randomUUID();

import { describe, expect, it } from "vitest";

describe("/room", () => {
  let roomCode: string;
  let token: number;

  it("Should create user ", async () => {
    const resGuest = await request(app).post("/user/guest");
    expect(resGuest.statusCode).toEqual(201);
    expect(resGuest.body.user.username).toBeDefined();
    expect(resGuest.body.user.id).toBeDefined();
    expect(resGuest.body.token).toBeDefined();
    token = resGuest.body.token;
  });

  it("There should not be any rooms", async () => {
    const res = await request(app)
      .get("/room")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("roomCount");
    expect(res.body.roomCount).toBe(0);
  });

  it("Should not have room info", async () => {
    const res = await request(app)
      .get("/room/roomcode")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("roomInfo");
    expect(res.body.roomInfo).toBeNull();
  });

  it("Should not create room code", async () => {
    const res = await request(app).post("/room");
    expect(res.statusCode).toEqual(401);
  });

  it("Should create user and room", async () => {
    const res = await request(app)
      .post("/room")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("roomCode");

    roomCode = res.body.roomCode;
  });

  it("Should have room created with room code", async () => {
    const res = await request(app)
      .get("/room/" + roomCode)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("roomInfo");
    expect(res.body.roomInfo.roomCode).toBe(roomCode);
    expect(res.body.roomInfo).toHaveProperty("timestamp");
    expect(res.body.roomInfo).toHaveProperty("maxPlayers");
    expect(res.body.roomInfo).toHaveProperty("pinCode");
    expect(res.body.roomInfo).toHaveProperty("players");
    expect(res.body.roomInfo).toHaveProperty("ownerId");
  });

  it("There should be 1 room", async () => {
    const res = await request(app)
      .get("/room")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("roomCount");
    expect(res.body.roomCount).toBe(1);
  });

  it("Create custom room", async () => {
    const res = await request(app)
      .post("/room")
      .send({
        maxPlayers: 3,
        pinCode: "7956",
      })
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("roomCode");

    roomCode = res.body.roomCode;
  });

  it("Should have room created with room code and it should have custom data", async () => {
    const res = await request(app)
      .get("/room/" + roomCode)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("roomInfo");
    expect(res.body.roomInfo.roomCode).toBe(roomCode);
    expect(res.body.roomInfo).toHaveProperty("timestamp");
    expect(res.body.roomInfo.maxPlayers).toBe(3);
    expect(res.body.roomInfo.pinCode).toBe("7956");
  });

  it("Should not create room with invalid values", async () => {
    const body = {
      maxPlayers: -1,
      pinCode: "0000",
    };
    let res = await request(app)
      .post("/room")
      .send(body)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toEqual(400);
    expect(res.body.error).toBe("Invalid max player count");
    body.maxPlayers = 10;
    res = await request(app)
      .post("/room")
      .send(body)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toEqual(400);
    expect(res.body.error).toBe("Invalid max player count");
    body.maxPlayers = 2;
    body.pinCode = "2";
    res = await request(app)
      .post("/room")
      .send(body)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toEqual(400);
    expect(res.body.error).toBe("Invalid pin code");
    body.pinCode = "00000";
    res = await request(app)
      .post("/room")
      .send(body)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toEqual(400);
    expect(res.body.error).toBe("Invalid pin code");
  });
});
