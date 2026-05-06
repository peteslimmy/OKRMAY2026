// Locking engine for the OKR system
export class LockingEngine {
  // Check if objective is locked
  static isLocked(objective: any): boolean {
    if (!objective) return false;
    const lockDate = new Date(objective.lock_date);
    const now = new Date();
    return objective.status === 'Locked' || (objective.lock_date && now > lockDate);
  }
  
  // Check if current quarter is active (not locked)
  static isCurrentQuarterActive(objective: any): boolean {
    if (!objective) return false;
    // Current implementation considers an objective locked if it's in the past
    const currentQuarter = objective.quarter;
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // Month is 0-indexed in JS
    const currentQuarterMonth = ['Q1', 'Q2', 'Q3', 'Q4'].indexOf(currentQuarter) + 1;
    return objective.year === currentYear && 
           (currentQuarter === 'Q1' && currentQuarterMonth >= 1 && currentQuarterMonth <= 3) ||
           (currentQuarter === 'Q2' && currentQuarterMonth >= 4 && currentQuarterMonth <= 6) ||
           (currentQuarter === 'Q3' && currentQuarterMonth >= 7 && currentQuarterMonth <= 9) ||
           (currentQuarter === 'Q4' && currentQuarterMonth >= 10 && currentQuarterMonth <= 12);
  }
}