import { User } from '@prisma/client';

export type TJwtPayload = {
  iat: number;
  exp: number;
  user: User;
};
