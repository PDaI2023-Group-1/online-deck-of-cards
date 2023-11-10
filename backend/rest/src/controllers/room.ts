import { Request, Response } from "express";
import {
  createRoomCode,
  roomCount,
  getRoomInfo,
} from "../handlers/roomCodeHandler";

const createRoom = (req: Request, res: Response) => {
  type CreateRoomRequest = {
    maxPlayers: number | undefined;
    pinCode: string | undefined;
    userId: number;
  };

  const { maxPlayers, pinCode, userId }: CreateRoomRequest = req.body;

  if (userId === null || userId === undefined || typeof userId !== "number") {
    return res.status(400).json({ error: "Invalid user id" });
  }

  if (maxPlayers) {
    if (maxPlayers < 2 || maxPlayers > 8) {
      return res.status(400).json({ error: "Invalid max player count" });
    }
  }

  if (pinCode) {
    if (typeof pinCode !== "string" || pinCode.length !== 4) {
      return res.status(400).json({ error: "Invalid pin code" });
    }
  }

  res.status(201).json({
    roomCode: createRoomCode(maxPlayers ?? 4, pinCode ?? null, userId),
  });
};

const roomCapacity = (req: Request, res: Response) => {
  res.json({ roomCount: roomCount() });
};

const roomInfo = (req: Request, res: Response) => {
  const roomCode = req.params.roomCode;
  const roomInfo = getRoomInfo(roomCode);

  res.json({ roomInfo: roomInfo });
};

export { createRoom, roomCapacity, roomInfo };
