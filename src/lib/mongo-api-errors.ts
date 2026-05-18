export const MONGO_UNAVAILABLE =
  "Cannot connect to MongoDB. Start MongoDB locally (mongod) or set MONGODB_URI in .env to your Atlas connection string.";

export function isMongoConnectionError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }
  const e = error as { name?: string; code?: string | number; cause?: unknown };
  if (e.name === "MongoServerSelectionError" || e.name === "MongoNetworkError") {
    return true;
  }
  if (e.code === "ECONNREFUSED") {
    return true;
  }
  if (e.cause && typeof e.cause === "object") {
    const c = e.cause as { code?: string };
    return c.code === "ECONNREFUSED";
  }
  return false;
}
