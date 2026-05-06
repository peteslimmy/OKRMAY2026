import { UserRole, Permission, ROLE_PERMISSIONS } from '../types';

describe('Permission System', () => {
  describe('ROLE_PERMISSIONS', () => {
    it('should have SuperAdmin role defined', () => {
      expect(ROLE_PERMISSIONS).toHaveProperty(UserRole.SuperAdmin);
    });

    it('should have Admin role defined', () => {
      expect(ROLE_PERMISSIONS).toHaveProperty(UserRole.Admin);
    });

    it('should have Director role defined', () => {
      expect(ROLE_PERMISSIONS).toHaveProperty(UserRole.Director);
    });

    it('should have Manager role defined', () => {
      expect(ROLE_PERMISSIONS).toHaveProperty(UserRole.Manager);
    });

    it('should have Viewer role defined', () => {
      expect(ROLE_PERMISSIONS).toHaveProperty(UserRole.Viewer);
    });
  });

  describe('Permission assignments', () => {
    it('should assign USERS_CREATE permission to SuperAdmin', () => {
      expect(ROLE_PERMISSIONS[UserRole.SuperAdmin]).toContain(Permission.USERS_CREATE);
    });

    it('should assign KR_CREATE permission to Director and above', () => {
      expect(ROLE_PERMISSIONS[UserRole.SuperAdmin]).toContain(Permission.KR_CREATE);
      expect(ROLE_PERMISSIONS[UserRole.Admin]).toContain(Permission.KR_CREATE);
      expect(ROLE_PERMISSIONS[UserRole.Director]).toContain(Permission.KR_CREATE);
    });

    it('should not assign USERS_DELETE permission to Viewer', () => {
      expect(ROLE_PERMISSIONS[UserRole.Viewer]).not.toContain(Permission.USERS_DELETE);
    });

    it('should not assign SETTINGS_EDIT permission to Viewer', () => {
      expect(ROLE_PERMISSIONS[UserRole.Viewer]).not.toContain(Permission.SETTINGS_EDIT);
    });

    it('should have at least one permission for each role', () => {
      Object.values(UserRole).forEach(role => {
        const perms = ROLE_PERMISSIONS[role];
        if (perms) {
          expect(perms.length).toBeGreaterThan(0);
        }
      });
    });
  });
});