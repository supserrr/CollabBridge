import { Request } from 'express';
import { User } from '@prisma/client';

export interface AuthRequest extends Request {
  user?: User;
}

export interface CloudinaryResponse {
  secure_url: string;
  public_id: string;
}
