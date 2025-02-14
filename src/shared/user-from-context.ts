import { ExecutionContext } from '@nestjs/common';

import { User } from '@prisma/client';

export const userFromContext = (context: ExecutionContext) => {
  const contextType = context.getType();

  switch (contextType) {
    case 'http':
      return context.switchToHttp().getRequest().user as User;
    case 'rpc':
    case 'ws':
      return context.switchToWs().getClient().user as User;
    default:
      return context.switchToRpc().getContext().user as User;
  }
};
