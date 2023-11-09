import { app } from "../src/app";
import request from "supertest";

import { describe, expect, it } from "vitest";

describe("/room", () => {
  let roomCode: string;

  it("There should not be any rooms", async () => {
    const res = await request(app).get("/room");
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("roomCount");
    expect(res.body.roomCount).toBe(0);
  });

  it("Should not have room info", async () => {
    const res = await request(app).get("/room/roomcode");
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("roomInfo");
    expect(res.body.roomInfo).toBeNull();
  });

  it("Should create room code", async () => {
    const res = await request(app).post("/room");
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("roomCode");
    roomCode = res.body.roomCode;
  });

  it("Should have room created with room code", async () => {
    const res = await request(app).get("/room/" + roomCode);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("roomInfo");
    expect(res.body.roomInfo.roomCode).toBe(roomCode);
    expect(res.body.roomInfo).toHaveProperty("timestamp");
  });

  it("There should be 1 room", async () => {
    const res = await request(app).get("/room");
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("roomCount");
    expect(res.body.roomCount).toBe(1);
  });
});
