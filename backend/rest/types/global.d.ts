type User = {
  id: number;
  username: string;
  roomCode?: string;
};

export global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
