const express = require("express");
const app = express();
const server = require("http").createServer(app);
const { WebSocketServer } = require("ws");
const WebSocket = require("ws");

const wss = new WebSocketServer({ server: server }); //Create a WebSocket server that is attached to the HTTP server

wss.on("connection", function connection(ws) {
  // Event listener that runs when a new WebSocket connection is established
  console.log("A new client Connected"); // Log to the server console that a new client has connected
  ws.send("Welcome New Client!"); // Send a welcome message to the newly connected client
  ws.on("error", console.error); // Event listener for errors on the WebSocket connection

  ws.on("message", function message(data) {
    // Event listener for messages received from the WebSocket client
    console.log("received: %s", data);

    wss.clients.forEach(function each(client) {
      // Check if the client is not the one who sent the message and if the connection is open
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  });
});
// Define a route for the HTTP server
app.get("/", (req, res) => res.send("Hello World!"));

server.listen(3000, () => console.log("Listening on port 3000"));
