import { app } from "../src/app";
import request from "supertest";

import { describe, expect, it } from "vitest";

describe("GET /", () => {
  it("Returns hello world", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toEqual(200);
    expect(res.text).toBe("Hello World");
  });
});
