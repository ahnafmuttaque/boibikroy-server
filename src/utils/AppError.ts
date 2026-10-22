export class AppError  extends Error {
  success: false = false;
  constructor(public statusCode: number, message: string, public error?: any) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
  }
}
