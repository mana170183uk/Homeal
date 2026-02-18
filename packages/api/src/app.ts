import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { API_PREFIX } from "@homeal/shared";
import authRoutes from "./routes/auth";
import userRoutes from "./routes/users";
import chefRoutes from "./routes/chefs";
import menuRoutes from "./routes/menus";
import orderRoutes from "./routes/orders";
import uploadRoutes from "./routes/upload";
import adminRoutes from "./routes/admin";
import productRoutes from "./routes/products";
import approveActionRoutes from "./routes/approveAction";
import reviewRoutes from "./routes/reviews";
import followRoutes from "./routes/follows";
import notificationRoutes from "./routes/notifications";
import templateRoutes from "./routes/templates";
import subscriptionRoutes from "./routes/subscriptions";
import stripeRoutes from "./routes/stripe";
import categoryRoutes from "./routes/categories";
import prisma from "@homeal/db";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

// Security
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGINS?.split(",") || [
      "http://localhost:3000",
      "http://localhost:3200",
      "http://localhost:3201",
      "https://homeal.uk",
    ],
    credentials: true,
  })
);

// Rate limiting
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// Stripe webhook must be mounted BEFORE JSON body parser (needs raw body)
app.use(`${API_PREFIX}/stripe`, stripeRoutes);

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Health check with DB connectivity test
app.get("/health", async (_req, res) => {
  let dbStatus = "ok";
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    dbStatus = "error";
  }
  const status = dbStatus === "ok" ? "ok" : "degraded";
  res.status(dbStatus === "ok" ? 200 : 503).json({
    status,
    service: "homeal-api",
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/users`, userRoutes);
app.use(`${API_PREFIX}/chefs`, chefRoutes);
app.use(`${API_PREFIX}/menus`, menuRoutes);
app.use(`${API_PREFIX}/orders`, orderRoutes);
app.use(`${API_PREFIX}/upload`, uploadRoutes);
app.use(`${API_PREFIX}/admin`, adminRoutes);
app.use(`${API_PREFIX}/products`, productRoutes);
app.use(`${API_PREFIX}/approve-action`, approveActionRoutes);
app.use(`${API_PREFIX}/reviews`, reviewRoutes);
app.use(`${API_PREFIX}/follows`, followRoutes);
app.use(`${API_PREFIX}/notifications`, notificationRoutes);
app.use(`${API_PREFIX}/templates`, templateRoutes);
app.use(`${API_PREFIX}/subscriptions`, subscriptionRoutes);
app.use(`${API_PREFIX}/categories`, categoryRoutes);

// 404 catch-all (return JSON, not Express default HTML)
app.use((_req, res) => {
  res.status(404).json({ success: false, error: "Not found" });
});

// Error handler
app.use(errorHandler);

export default app;
