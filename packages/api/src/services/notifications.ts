import prisma from "@homeal/db";
import { getIO } from "./socket";

/**
 * Notify all followers of a chef about an update.
 * Creates Notification records and emits via Socket.IO.
 */
export async function notifyChefFollowers(
  chefId: string,
  title: string,
  body: string,
  data?: Record<string, unknown>
) {
  try {
    const followers = await prisma.chefFollow.findMany({
      where: { chefId },
      select: { userId: true },
    });

    if (followers.length === 0) return;

    await prisma.notification.createMany({
      data: followers.map((f) => ({
        userId: f.userId,
        type: "CHEF_UPDATE" as const,
        title,
        body,
        data: data ? JSON.stringify(data) : null,
      })),
    });

    try {
      const io = getIO();
      for (const f of followers) {
        io.to(`user:${f.userId}`).emit("notification:new", { title, body, type: "CHEF_UPDATE" });
      }
    } catch {
      // Socket.IO may not be initialized in tests
    }
  } catch (err) {
    console.error("[Notifications] Failed to notify followers:", err);
  }
}
