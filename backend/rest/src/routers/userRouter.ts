import express from "express";
import { createGuestUser } from "../controllers/user";

const userRouter = express.Router();

userRouter.post("/user/guest", createGuestUser);

export { userRouter };
