// Progress calculation engine for the OKR system
export class ProgressEngine {
  // Calculate weighted average progress for a KR based on its sub KRs
  static calculateKRProgress(subKRs: { progress: number; weight: number }[]): number {
    if (!subKRs || subKRs.length === 0) return 0;
    
    // Validate that all progress values are valid numbers between 0 and 100
    for (const subKr of subKRs) {
      if (typeof subKr.progress !== 'number' || subKr.progress < 0 || subKr.progress > 100) {
        throw new Error(`Invalid progress value: ${subKr.progress}`);
      }
      if (typeof subKr.weight !== 'number' || subKr.weight < 0) {
        throw new Error(`Invalid weight value: ${subKr.weight}`);
      }
    }
    
    // If all weights are equal (default case)
    const allEqualWeights = subKRs.every(skr => skr.weight === subKRs[0].weight);
    if (allEqualWeights) {
      const total = subKRs.reduce((sum, skr) => sum + skr.progress, 0);
      return Math.round((total / subKRs.length) * 100) / 100;
    }
    
    // Weighted average calculation
    const weightedSum = subKRs.reduce((sum, skr) => sum + (skr.progress * skr.weight), 0);
    const totalWeight = subKRs.reduce((sum, skr) => sum + skr.weight, 0);
    
    if (totalWeight === 0) return 0;
    
    return Math.round((weightedSum / totalWeight) * 100) / 100;
  }
  
  // Calculate objective progress as average of all KR progresses
  static calculateObjectiveProgress(krProgresses: number[]): number {
    if (!krProgresses || krProgresses.length === 0) return 0;
    
    // Validate that all progress values are valid numbers
    for (const progress of krProgresses) {
      if (typeof progress !== 'number' || progress < 0 || progress > 100) {
        throw new Error(`Invalid progress value: ${progress}`);
      }
    }
    
    const total = krProgresses.reduce((sum, progress) => sum + progress, 0);
    return Math.round((total / krProgresses.length) * 100) / 100;
  }
  
  // Determine status based on progress percentage
  static determineStatus(progress: number): 'Green' | 'Amber' | 'Red' {
    if (typeof progress !== 'number') {
      throw new Error(`Invalid progress value: ${progress}`);
    }
    
    if (progress >= 70) return 'Green';
    if (progress >= 40) return 'Amber';
    return 'Red';
  }
  
  // Validate KR slot is unique for an objective
  static validateKRSlot(objectiveId: string, krSlot: string, existingKRs: any[]): boolean {
    if (!objectiveId || !krSlot) {
      throw new Error('Invalid objective ID or KR slot');
    }
    
    return !existingKRs.some(kr => kr.objective_id === objectiveId && kr.kr_slot === krSlot);
  }
  
  // Validate that KR has at least one Sub-KR
  static validateSubKRPresence(subKRs: any[]): boolean {
    return subKRs && subKRs.length > 0;
  }
  
  // Validate progress value is within acceptable range
  static validateProgressValue(progress: number): boolean {
    if (typeof progress !== 'number') {
      throw new Error(`Progress must be a number, got: ${typeof progress}`);
    }
    
    return progress >= 0 && progress <= 100;
  }
}