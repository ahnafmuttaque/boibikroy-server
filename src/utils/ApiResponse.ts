import type { Response } from "express";

export class ApiResponse {
  constructor(
    public statusCode: number,
    public data?: any,
  ) {}

  send(res: Response) {
    const statusCode = this.statusCode;
    res.status(statusCode);
    if (this.data) {
      res.json(this.data);
    } else {
      res.end();
    }
  }
}

export class PaginatedResponse {
  constructor(
    public statusCode: number,
    public data: any[] | Record<string, any>,
    public pagination: {
      page: number;
      limit: number;
      totalPages: number;
      total: number;
    },
  ) {}

  send(res: Response) {
    const statusCode = this.statusCode;
    res.status(statusCode).json({
      data: this.data,
      ...this.pagination,
    });
  }
}
