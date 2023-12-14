import { Room } from '../../types/custom';

const rooms = new Map<string, Room>();

const getRoomByCode = (code: string): Room | undefined => {
    return rooms.get(code);
};

const setRoomByCode = (code: string, room: Room): void => {
    rooms.set(code, room);
};

const removeRoomByCode = (code: string): void => {
    rooms.delete(code);
};

export { getRoomByCode, setRoomByCode, removeRoomByCode };
