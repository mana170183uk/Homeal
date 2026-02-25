import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";

let io: Server;

export function initSocketIO(server: HttpServer) {
  io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGINS?.split(",") || [
        "http://localhost:3200",
        "http://localhost:3201",
        "http://localhost:3202",
      ],
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["polling", "websocket"],
    pingInterval: 25000,
    pingTimeout: 20000,
  });

  io.on("connection", (socket: Socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    // Join user-specific room
    socket.on("join:user", (userId: string) => {
      socket.join(`user:${userId}`);
    });

    // Join chef-specific room
    socket.on("join:chef", (chefId: string) => {
      socket.join(`chef:${chefId}`);
    });

    // Chef goes online/offline
    socket.on("chef:online", (chefId: string) => {
      io.emit("chef:status", { chefId, online: true });
    });

    socket.on("chef:offline", (chefId: string) => {
      io.emit("chef:status", { chefId, online: false });
    });

    socket.on("disconnect", () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function getIO(): Server {
  if (!io) throw new Error("Socket.IO not initialized");
  return io;
}

// Emit new order notification to chef
export function notifyChefNewOrder(chefId: string, orderData: Record<string, unknown>) {
  io?.to(`chef:${chefId}`).emit("order:new", orderData);
}

// Emit order status update to customer
export function notifyOrderUpdate(userId: string, orderData: Record<string, unknown>) {
  io?.to(`user:${userId}`).emit("order:update", orderData);
}
