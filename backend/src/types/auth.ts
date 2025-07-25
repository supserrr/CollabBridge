import { Request } from 'express';

export interface users {
  id: string;
  email: string;
  name: string;
}

export interface AuthRequest extends Request {
  user?: users;
}
