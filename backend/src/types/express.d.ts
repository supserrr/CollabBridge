import { Request } from 'express';
import { users } from '@prisma/client';

export interface AuthRequest extends Request {
  user?: users;
}

export interface CloudinaryResponse {
  secure_url: string;
  public_id: string;
}
