import express from "express";
import { createRoom, roomInfo, roomCapacity } from "../controllers/room";

const roomRouter = express.Router();

roomRouter.post("/room", createRoom);
roomRouter.get("/room/:roomCode", roomInfo);
roomRouter.get("/room", roomCapacity);

export { roomRouter };
