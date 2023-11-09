import { Request, Response } from "express";
import {
  createCode,
  roomCount,
  getRoomInfo,
} from "../handlers/roomCodeHandler";

const createRoomCode = (req: Request, res: Response) => {
  res.status(201).json({ roomCode: createCode() });
};

const roomCapacity = (req: Request, res: Response) => {
  res.json({ roomCount: roomCount() });
};

const roomInfo = (req: Request, res: Response) => {
  const roomCode = req.params.roomCode;
  const roomInfo = getRoomInfo(roomCode);

  res.json({ roomInfo: roomInfo });
};

export { createRoomCode, roomCapacity, roomInfo };
