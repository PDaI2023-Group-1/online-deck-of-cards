import crypto from "crypto";

type Room = {
  roomCode: string;
  timestamp: number;
};

const rooms: { [key: string]: Room } = {};

const characters: string =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

const createCode = (): string => {
  const bytes: Buffer = crypto.randomBytes(6);
  let roomCode: string = "";

  for (let i = 0; i < bytes.length; i++) {
    const index: number = bytes[i] % characters.length;
    roomCode += characters.charAt(index);
  }

  if (roomCodeExists(roomCode)) {
    createCode();
  } else {
    const newRoom: Room = {
      roomCode: roomCode,
      timestamp: Date.now(),
    };
    rooms[newRoom.roomCode] = newRoom;
  }

  return roomCode;
};

const roomCodeExists = (roomCode: string): boolean => {
  return rooms.hasOwnProperty(roomCode);
};

const countRooms = (): number => {
  return Object.keys(rooms).length;
};

const getRoomInfo = (roomCode: string): Room | null => {
  if (roomCodeExists(roomCode)) {
    return rooms[roomCode];
  }
  return null;
};

export { createCode, roomCodeExists, countRooms, getRoomInfo };
