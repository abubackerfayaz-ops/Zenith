import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface CurrentUserPayload {
  id: string;
  email?: string;
  username: string;
  role: string;
  isVerified: boolean;
}

export const CurrentUser = createParamDecorator(
  (data: keyof CurrentUserPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user: CurrentUserPayload = request.user;

    if (!user) {
      return undefined;
    }

    return data ? user[data] : user;
  },
);
