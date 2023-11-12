import { Request, Response } from "express";
import { createCode } from "../handlers/roomCodeHandler";
import { signToken } from "../middleware/authenticate";
import { User } from "../../types/user";

const createGuestUser = (req: Request, res: Response) => {
  const username = "User#" + createCode();

  const user: User = {
    id: Math.round(Math.random() * 10000),
    username: username,
  };

  const token = signToken(user);
  if (token === null) {
    return res.status(500).json({ error: "Unable to create user" });
  }

  res.status(201).json({ user: user, token: token });
};

export { createGuestUser };
