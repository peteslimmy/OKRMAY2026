/**
 * Rate limiting implementation
 */

export class RateLimiter {
  private requests: Map<string, { count: number; resetTime: number }> = new Map();
  private readonly maxRequests: number = 100;
  private readonly windowMs: number = 60000; // 1 minute window

  /**
   * Check if a user has exceeded the rate limit
   */
  isRateLimited(userId: string): boolean {
    const now = Date.now();
    const userRequests = this.requests.get(userId);
    
    // Check if user has exceeded rate limit
    if (!userRequests) {
      return false;
    }
    
    // Reset count if window has passed
    if (now > userRequests.resetTime) {
      this.requests.delete(userId);
      return false;
    }
    
    return userRequests.count >= this.maxRequests;
  }
  
  /**
   * Add a request to tracking
   */
  addRequest(userId: string): void {
    const now = Date.now();
    const userRequests = this.requests.get(userId);
    
    if (!userRequests) {
      this.requests.set(userId, { count: 1, resetTime: now + this.windowMs });
      return;
    }
    
    // Increment count
    userRequests.count++;
    this.requests.set(userId, userRequests);
  }
}