import express from "express";
import {
  createRoom,
  roomInfo,
  roomCapacity,
  joinRoom,
} from "../controllers/room";

const roomRouter = express.Router();

roomRouter.post("/room", createRoom);
roomRouter.put("/room/:roomCode", joinRoom);
roomRouter.get("/room/:roomCode/info", roomInfo);
roomRouter.get("/room", roomCapacity);

export { roomRouter };
