import { Request } from 'express';

export const getUserInfo = (req: Request) => ({
  isAdmin: !!req['user']?.isAdmin,
  isAuthenticated: !!req['user'],
});
