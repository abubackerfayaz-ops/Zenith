import { SetMetadata } from '@nestjs/common';

type UserRole = 'USER' | 'ADMIN' | 'MODERATOR' | 'SUPER_ADMIN';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
