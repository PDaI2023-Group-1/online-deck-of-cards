import { app } from "../src/app";
import request from "supertest";
import crypto from "crypto";

process.env.SECRET_KEY = crypto.randomUUID();

import { describe, expect, it } from "vitest";

describe("/user", () => {
  it("Guest should be created", async () => {
    const res = await request(app).post("/user/guest");
    expect(res.statusCode).toEqual(201);
    expect(res.body.user.username).toBeDefined();
    expect(res.body.token).toBeDefined();
    expect(res.body.user.id).toBeDefined();
  });
});
