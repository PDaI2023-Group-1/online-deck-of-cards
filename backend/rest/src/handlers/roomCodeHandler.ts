import crypto from "crypto";

type Room = {
  roomCode: string;
  timestamp: number;
};

const rooms: { [key: string]: Room } = {};

const characters =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

const createCode = (len = 6): string => {
  const bytes = crypto.randomBytes(len);
  let roomCode = "";

  for (let i = 0; i < bytes.length; i++) {
    const index = bytes[i] % characters.length;
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

const roomCount = (): number => {
  return Object.keys(rooms).length;
};

const getRoomInfo = (roomCode: string): Room | null => {
  if (roomCodeExists(roomCode)) {
    return rooms[roomCode];
  }
  return null;
};

export { createCode, roomCodeExists, roomCount, getRoomInfo };
