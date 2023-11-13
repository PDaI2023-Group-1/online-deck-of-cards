type User = {
    id: number;
    username: string;
    roomCode?: string;
};

declare module Express {
    interface Request {
        user?: User;
    }
}
