import http from "http";
import app from "./app";
import { initSocketIO } from "./services/socket";

const PORT = process.env.PORT || 8080;

const server = http.createServer(app);

// Initialize Socket.IO
initSocketIO(server);

server.listen(PORT, () => {
  console.log(`[Homeal API] Server running on port ${PORT}`);
  console.log(`[Homeal API] Environment: ${process.env.NODE_ENV || "development"}`);
});

export default server;
