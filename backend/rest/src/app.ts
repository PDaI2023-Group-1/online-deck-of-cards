import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import express, { Request, Response, NextFunction } from "express";

import { roomRouter } from "./routers/roomRouter";
import { userRouter } from "./routers/userRouter";
import { verifyToken } from "./middleware/authenticate";

const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err.stack);
  res.status(500).send("Internal Server Error");
};

const app = express();

app.use(morgan("dev"));
app.use(helmet());
app.use(express.json());
app.use(cors());

app.use(errorHandler);

app.use(userRouter);

// authenticated routes
app.use(verifyToken);
app.use(roomRouter);

export { app };
