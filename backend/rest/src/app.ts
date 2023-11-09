import express from "express";
import morgan from "morgan";
import helmet from "helmet";

import { helloWorldRouter } from "./routers/helloWorldRouter";
import { roomRouter } from "./routers/roomRouter";

const app = express();

app.use(morgan("dev"));
app.use(helmet());
app.use(express.json());

app.use(helloWorldRouter);
app.use(roomRouter);

export { app };
