// Role constants for better maintainability
export const ROLES = {
  USER: 1,
  MANAGER: 2,
  ADMIN: 3
};

// Check if user has minimum role level (numeric comparison)
export const hasMinimumRole = (userRoleId, requiredRoleId) => {
  return userRoleId >= requiredRoleId;
};

// Role check functions using numeric IDs
export const isAdmin = (roleId) => roleId >= ROLES.ADMIN;
export const isManager = (roleId) => roleId >= ROLES.MANAGER;
export const isUser = (roleId) => roleId >= ROLES.USER;
