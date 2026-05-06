import { validatePassword, maskEmail, generateCSRFToken } from '../components/Auth/utils';

describe('Auth Utility Functions', () => {
  describe('validatePassword', () => {
    it('should reject weak passwords', () => {
      const result = validatePassword('weak');
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should accept strong passwords', () => {
      const result = validatePassword('StrongP@ss123');
      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should require minimum length', () => {
      const result = validatePassword('Ab1@');
      expect(result.valid).toBe(false);
    });

    it('should require numeric characters', () => {
      const result = validatePassword('NoNumbers@abc');
      expect(result.valid).toBe(false);
    });

    it('should require special character', () => {
      const result = validatePassword('NoSpecial123Ab');
      expect(result.valid).toBe(false);
    });
  });

  describe('maskEmail', () => {
    it('should mask email properly', () => {
      const result = maskEmail('test@example.com');
      expect(result).toContain('@');
      expect(result).not.toBe('test@example.com');
    });

    it('should handle short local part', () => {
      const result = maskEmail('a@b.com');
      expect(result).toContain('@');
    });
  });

  describe('CSRF Token', () => {
    it('should generate token', () => {
      const token = generateCSRFToken();
      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');
    });

    it('should create token with minimum length', () => {
      const token = generateCSRFToken();
      expect(token.length).toBeGreaterThanOrEqual(16);
    });
  });
});