export const ROLES = {
  USER: 1,
  MANAGER: 2,
  ADMIN: 3
};

export const hasMinimumRole = (userRoleId, requiredRoleId) => {
  return userRoleId >= requiredRoleId;
};

export const isAdmin = (roleId) => roleId >= ROLES.ADMIN;
export const isManager = (roleId) => roleId >= ROLES.MANAGER;
export const isUser = (roleId) => roleId >= ROLES.USER;
