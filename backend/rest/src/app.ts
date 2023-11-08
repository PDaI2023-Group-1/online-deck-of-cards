import express from "express";
import morgan from "morgan";
import helmet from "helmet";

import { helloWorldRouter } from "./routers/helloWorldRouter";

const app = express();

app.use(morgan("dev"));
app.use(helmet());
app.use(express.json());

app.use(helloWorldRouter);

export { app };
