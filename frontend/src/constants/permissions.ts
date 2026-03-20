export const PERMISSIONS = {
  USER_CREATE: { resource: 'user', action: 'create' },
  USER_READ: { resource: 'user', action: 'read' },
  USER_UPDATE: { resource: 'user', action: 'update' },
  USER_DELETE: { resource: 'user', action: 'delete' },

  ROLE_CREATE: { resource: 'role', action: 'create' },
  ROLE_READ: { resource: 'role', action: 'read' },
  ROLE_UPDATE: { resource: 'role', action: 'update' },
  ROLE_DELETE: { resource: 'role', action: 'delete' },
} as const;
