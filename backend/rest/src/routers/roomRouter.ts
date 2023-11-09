import express from "express";
import { createRoomCode, roomInfo, roomCapacity } from "../controllers/room";

const roomRouter = express.Router();

roomRouter.post("/room", createRoomCode);
roomRouter.get("/room/:roomCode", roomInfo);
roomRouter.get("/room", roomCapacity);

export { roomRouter };
