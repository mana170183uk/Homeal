import http from "http";
import app from "./app";
import prisma from "@homeal/db";
import { initSocketIO } from "./services/socket";

const PORT = process.env.PORT || 5200;

const server = http.createServer(app);

// Initialize Socket.IO
initSocketIO(server);

// Cleanup unverified users older than 24 hours (runs every hour)
const CLEANUP_INTERVAL = 60 * 60 * 1000; // 1 hour
async function cleanupUnverifiedUsers() {
  try {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago

    // Find unverified users created more than 24h ago (exclude admins)
    const staleUsers = await prisma.user.findMany({
      where: {
        emailVerifiedAt: null,
        createdAt: { lt: cutoff },
        role: { notIn: ["SUPER_ADMIN", "ADMIN"] },
      },
      select: { id: true, email: true, role: true },
    });

    if (staleUsers.length === 0) return;

    // Delete associated chefs first (cascade won't help with all relations)
    const staleUserIds = staleUsers.map(u => u.id);
    const chefUsers = staleUsers.filter(u => u.role === "CHEF");

    if (chefUsers.length > 0) {
      await prisma.chef.deleteMany({
        where: { userId: { in: chefUsers.map(u => u.id) } },
      });
    }

    // Delete notifications, addresses, cart, favorites, follows
    await prisma.notification.deleteMany({ where: { userId: { in: staleUserIds } } });
    await prisma.address.deleteMany({ where: { userId: { in: staleUserIds } } });
    await prisma.cart.deleteMany({ where: { userId: { in: staleUserIds } } });
    await prisma.favorite.deleteMany({ where: { userId: { in: staleUserIds } } });
    await prisma.chefFollow.deleteMany({ where: { userId: { in: staleUserIds } } });

    // Delete the users
    const deleted = await prisma.user.deleteMany({
      where: { id: { in: staleUserIds } },
    });

    console.log(`[Cleanup] Deleted ${deleted.count} unverified user(s) older than 24h: ${staleUsers.map(u => u.email).join(", ")}`);
  } catch (err) {
    console.error("[Cleanup] Failed to clean up unverified users:", err);
  }
}

server.listen(PORT, () => {
  console.log(`[Homeal API] Server running on port ${PORT}`);
  console.log(`[Homeal API] Environment: ${process.env.NODE_ENV || "development"}`);

  // Start cleanup job (run once at startup, then every hour)
  cleanupUnverifiedUsers();
  setInterval(cleanupUnverifiedUsers, CLEANUP_INTERVAL);
  console.log(`[Homeal API] Unverified user cleanup job started (every ${CLEANUP_INTERVAL / 60000}min)`);
});

export default server;
