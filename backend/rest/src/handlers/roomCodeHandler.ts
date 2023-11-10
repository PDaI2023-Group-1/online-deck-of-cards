import crypto from "crypto";

type Room = {
  roomCode: string;
  timestamp: number;
  maxPlayers: number;
  pinCode: string | null;
  players: number[];
  ownerId: number;
};

const rooms: { [key: string]: Room } = {};

const characters =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

const createCode = (): string => {
  const bytes: Buffer = crypto.randomBytes(6);
  let roomCode: string = "";

  for (let i = 0; i < bytes.length; i++) {
    const index = bytes[i] % characters.length;
    roomCode += characters.charAt(index);
  }

  return roomCode;
};

const createRoomCode = (
  maxPlayers: number,
  pinCode: string | null,
  userId: number
) => {
  const roomCode = createCode();
  if (roomCodeExists(roomCode)) {
    createRoomCode(maxPlayers, pinCode, userId);
  } else {
    const newRoom: Room = {
      roomCode: roomCode,
      timestamp: Date.now(),
      maxPlayers: maxPlayers,
      pinCode: pinCode,
      players: [userId],
      ownerId: userId,
    };
    rooms[newRoom.roomCode] = newRoom;
    return roomCode;
  }
};

const roomCodeExists = (roomCode: string): boolean => {
  return rooms.hasOwnProperty(roomCode);
};

const roomCount = (): number => {
  return Object.keys(rooms).length;
};

const getRoomInfo = (roomCode: string): Room | null => {
  if (roomCodeExists(roomCode)) {
    return rooms[roomCode];
  }
  return null;
};

export { createCode, createRoomCode, roomCodeExists, roomCount, getRoomInfo };
