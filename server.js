import express from "express";
import cors from "cors";

import bookRouter from "./src/routes/book.js";
import smsRouter from "./src/routes/sms.js";
import emailRouter from "./src/routes/email.js";
import safetyRouter from "./src/routes/safety.js";
import blockRouter from "./src/routes/block.js";

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

// Health check
app.get("/health", (_req, res) => res.json({ ok: true }));

// Routes
app.use("/api/book", bookRouter);
app.use("/api/sms", smsRouter);
app.use("/api/email", emailRouter);
app.use("/api/safety", safetyRouter);
app.use("/api/block", blockRouter);

// 404
app.use((req, res) => res.status(404).json({ ok: false, error: "NOT_FOUND" }));

// Error handler
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ ok: false, error: "SERVER_ERROR" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API listening on port ${PORT}`);
});
