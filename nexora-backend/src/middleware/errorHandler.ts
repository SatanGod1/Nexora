import { Request, Response, NextFunction } from "express";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error("[Error]", err.message, err.stack);

  res.status(500).json({
    success: false,
    message: "An unexpected error occurred",
    error:
      process.env.NODE_ENV === "development" ? err.message : "INTERNAL_ERROR",
  });
}

export function notFound(_req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    message: "Route not found",
    error: "NOT_FOUND",
  });
}
