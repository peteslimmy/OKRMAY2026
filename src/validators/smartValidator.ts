/**
 * 4CORE SMART Goal Validator
 * Rule-based validation that warns (never blocks) at point of entry
 */

export interface SMARTCheck {
  passed: boolean;
  warnings: string[];
  score: number; // 0-100
  suggestions: string[];
}

export const validateSMARTGoal = (title: string): SMARTCheck => {
  const warnings: string[] = [];
  const suggestions: string[] = [];
  let score = 100;
  const t = title.trim();
  
  // Specific: Check for specific language (action verbs, measurable terms)
  const hasActionVerb = /^(complete|deliver|launch|implement|create|develop|build|deploy|submit|reduce|increase|achieve|obtain|secure|finalize|onboard|establish|design)/i.test(t);
  if (!hasActionVerb) { warnings.push('Missing action verb (Specific)'); score -= 15; suggestions.push('Start with an action verb: Complete, Launch, Implement, Create, Deliver...'); }
  
  // Measurable: Count action words, check for numbers
  const hasNumber = /\d+/.test(t);
  const hasPercentage = /%|percent/i.test(t);
  const hasAmount = /₦|NGN|\$|USD/i.test(t);
  if (!hasNumber && !hasPercentage && !hasAmount) { warnings.push('Not measurable (no number/percentage/amount)'); score -= 20; suggestions.push('Add a measurable target: "by Friday", "95% completion", "₦500,000"...'); }
  
  // Achievable: Check for extreme claims
  const hasExtreme = /100%|impossible|immediate|instant/i.test(t);
  if (hasExtreme) { warnings.push('May not be achievable'); score -= 10; suggestions.push('Verify the target is realistic within the time frame'); }
  
  // Relevant: Check alignment signals (KR-related keywords)
  const hasRelevance = /KR|result|objective|metric|KPI|OKR|goal|task|output/i.test(t);
  if (!hasRelevance) { warnings.push('Goal may not align with KR'); score -= 10; suggestions.push('Tie this to a specific KR or measurable outcome'); }
  
  // Time-bound: Check for time markers
  const hasTimeBound = /monday|tuesday|wednesday|thursday|friday|week|day|EOD|EOW|EOM|Q\d|by end/i.test(t);
  if (!hasTimeBound) { warnings.push('No time frame specified'); score -= 15; suggestions.push('Add a deadline: "by EOW", "by Friday", "within 3 days"...'); }
  
  // Length check
  if (t.length < 20) { warnings.push('Goal title too short'); score -= 10; suggestions.push('Add more detail to make the goal specific and clear'); }
  if (t.length > 200) { warnings.push('Goal title too long (max 200 chars)'); score -= 5; }
  
  // Check for filler words
  const filler = / ongoing| continue| keep | just | try | try to /i;
  if (filler.test(t)) { warnings.push('Contains vague filler language'); score -= 10; suggestions.push('Replace vague words like "ongoing", "try", "keep" with specific actions'); }
  
  score = Math.max(0, Math.min(100, score));
  
  return {
    passed: score >= 60,
    warnings,
    score,
    suggestions
  };
};