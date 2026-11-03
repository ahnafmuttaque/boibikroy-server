interface User {
  id: number;
  email: string;
  role: "admin" | "moderator" | "student";
}
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export {};
