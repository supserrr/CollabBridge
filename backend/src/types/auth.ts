import { Request } from 'express';

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthRequest extends Request {
  user?: User;
}
