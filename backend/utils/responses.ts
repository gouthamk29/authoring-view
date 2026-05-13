import type { Response } from "express";
export function successResponse(
  status: number,
  res: Response,
  data: any,
  message: string = "Success",
) {
  return res.status(status).json({
    success: true,
    message,
    data,
  });
}

export function errorResponse(res: Response, status: number, error: any) {
  return res.status(status).json({
    success: false,
    error,
  });
}
