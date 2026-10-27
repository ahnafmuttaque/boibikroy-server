export class AppError extends Error {
  success: false = false;
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
  }
}
