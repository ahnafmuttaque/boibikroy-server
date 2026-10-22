import type { Response } from "express";

export class ApiResponse {
  constructor(public statusCode: number, public data?: Record<string, any>) {
  }

  send(res: Response) {
    const statusCode = this.statusCode;
    if (statusCode === 204) {
      res.status(statusCode).end();
      return;
    }
    res.status(this.statusCode).json({
      ...(this.data ? this.data : {})
    })
  }
}

export class PaginatedResponse {
  constructor(public statusCode:number,public data:Record<string, any>, public pagination: {limit: number, totalPages: number, total: number}) {
  }

  send(res: Response) {
    const statusCode = this.statusCode;
    res.status(statusCode).json({
      data: this.data,
      ...this.pagination,
    })
  }
}
