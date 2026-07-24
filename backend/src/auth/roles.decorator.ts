import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

// Bir endpoint'e hangi rollerin erişebileceğini işaretler, ör. @Roles('ADMIN')
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
