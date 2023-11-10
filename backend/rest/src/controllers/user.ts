import { Request, Response } from "express";
import { createCode } from "../handlers/roomCodeHandler";
import jwt from "jsonwebtoken";

const createGuestUser = (req: Request, res: Response) => {
  const username = "User#" + createCode();
  const secret = process.env.SECRET_KEY;

  if (secret === undefined || secret === null) {
    return res.status(500).send();
  }

  const data = {
    id: Math.round(Math.random() * 10000),
    username: username,
  };

  const token = jwt.sign(data, secret);

  res.status(201).json({ username: username, token: token, userId: data.id });
};

export { createGuestUser };
