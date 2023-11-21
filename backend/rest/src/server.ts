import { app } from "./app";
import dotenv from "dotenv";
dotenv.config();

const port = Number(process.env.SERVER_PORT) || 8080;
// start the server and bind to all interfaces
app.listen(port, "0.0.0.0", () => {
  console.log(`Listening at http://127.0.0.1:${port}`);
});
