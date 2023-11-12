import { Request, Response } from "express";
import {
  createRoomCode,
  roomCount,
  getRoomInfo,
  roomCodeExists,
} from "../handlers/roomCodeHandler";
import { signToken } from "../middleware/authenticate";

type User = {
  id: number;
  username: string;
  roomCode: string;
};

const createRoom = (req: Request, res: Response) => {
  type CreateRoomRequest = {
    maxPlayers: number | undefined;
    pinCode: string | undefined;
  };

  const { maxPlayers, pinCode }: CreateRoomRequest = req.body;

  const userId = req.user!.id;

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

const joinRoom = (req: Request, res: Response) => {
  const roomCode = req.params.roomCode;
  if (!roomCodeExists(roomCode)) {
    return res.status(404).json({ error: "Room not found" });
  }

  const user: User = {
    id: req.user!.id,
    username: req.user!.username,
    roomCode: roomCode,
  };
  const newToken = signToken(user);

  if (newToken === null) {
    return res.status(500).json({ error: "Unable to join room" });
  }

  return res.json({ user });
};

export { createRoom, roomCapacity, roomInfo, joinRoom };
