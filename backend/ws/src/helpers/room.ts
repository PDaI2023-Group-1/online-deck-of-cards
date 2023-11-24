const rooms = new Map<string, Room>();

const getRoomByCode = (code: string): Room | undefined => {
    return rooms.get(code);
};

const setRoomByCode = (code: string, room: Room): void => {
    rooms.set(code, room);
};

export { getRoomByCode, setRoomByCode };
