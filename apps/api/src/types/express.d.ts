declare global {
  namespace Express {
    interface Request {
      auth?: {
        id: string;
        firebaseUid: string;
        role: "STUDENT" | "INSTRUCTOR" | "ADMIN";
      };
    }
  }
}

export {};
