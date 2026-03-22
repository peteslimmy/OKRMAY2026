const strongVerbs = ['implement', 'execute', 'launch', 'deploy', 'develop', 'conduct', 'audit', 'analyze', 'configure', 'design', 'establish', 'integrate', 'streamline', 'automate', 'scale', 'optimize', 'complete', 'resolve', 'reduce', 'validate', 'achieve', 'ensure', 'perform', 'deliver', 'create', 'build', 'ship', 'rollout', 'finalize', 'finalise', 'migrate', 'consolidate', 'restructure', 'refactor', 'test', 'debug', 'patch', 'release', 'onboard', 'coordinate', 'facilitate', 'negotiate', 'present', 'document', 'specify', 'architect', 'prototype', 'benchmark', 'calibrate', 'forecast', 'prioritize', 'allocate', 'delegate', 'mandate', 'earn', 'attain', 'obtain', 'acquire', 'secure', 'finish', 'submit', 'pass', 'certify', 'qualify', 'enroll', 'convert', 'close'];
const vagueVerbPatterns = [/\bwork on\b/i, /\blook at\b/i, /\bhelp\b/, /\bassist\b/, /\bsupport\b/, /\bmanage\b/, /\bhandle\b/, /\btouch\b/, /\bthings\b/, /\bstuff\b/, /\btasks\b/, /\bmisc\b/, /\bupdate\b/, /\breview\b/, /\bcheck\b/];
const measurablePatterns = [
  /\b\d+(?:\.\d+)?\s*(%|percent|percentage)(?=\s|$)/i,
  /\b\d+(?:\.\d+)?\s*(users?|leads?|deals?|hours?|days?|weeks?|nodes?|items?|units?|records?|tickets?|seconds?|sec|minutes?|min|hrs?|k|m\b)\b/i,
  /[$£₦€¥]\s?[\d,]+(?:\.\d{2})?/i,
  /[\d,]+(?:\.\d{2})?\s*(usd|gbp|eur|ngn)/i,
  /\b\d{1,3}(?:,\d{3})+(?:\.\d{2})?\b/,
  /\b(zero|none|all|complete[d]?|full|100%|baseline)\b/i,
  /\b(kpi|okr|nps|csat|roi|roe|conversion|sla|mtbf|mttf|rrp|arpu|ltv|churn)\b/i,
  /\bfrom\s+\d+.*?(?:to|and|-)\s+\d+/i,
  /\b(increase|decrease|growth\s+of|improvement\s+of|reduce\s+by|up\s+to|at\s+least|targeting)\b/i,
  /\b(before|after|vs|versus|compared\s+to|delta)\b/i,
  /\b\d+\s*(x|times|twofold|threefold)\b/i,
];
const relevantKeywords = ['revenue', 'efficiency', 'growth', 'strategy', 'cost', 'risk', 'security', 'qa', 'defects', 'access', 'stakeholders', 'performance', 'compliance', 'quality', 'product', 'customer', 'client', 'sales', 'profit', 'loss', 'automation', 'pipeline', 'workflow', 'throughput', 'latency', 'incident', 'deployment', 'release', 'adoption', 'engagement', 'retention', 'churn', 'onboarding', 'migration', 'integration', 'api', 'infrastructure', 'platform', 'operational', 'budget', 'forecast', 'planning', 'objective', 'key result', 'epic', 'feature', 'sprint', 'milestone', 'roadmap', 'stakeholder', 'governance', 'audit', 'policy', 'data', 'analytics', 'reporting', 'documentation', 'training', 'process', 'procedure', 'protocol', 'framework'];
const timePatterns = [
  /\b(q[1-4]|quarter)\b/i,
  /\b(eod|eow|eos|eom|qtd|ytd)\b/i,
  /\b(by\s+|within\s+|before\s+|after\s+|until\s+)\b/i,
  /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i,
  /\b(january|february|march|april|may|june|july|august|september|october|november|december)\b/i,
  /\b(week\s*\d+|wk\s*\d+)\b/i,
  /\b(202[4-9]|203[0-9])\b/,
  /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b/i,
  /\b(daily|weekly|monthly|quarterly|annually|biannually)\b/i,
  /\b(fiscal\s*(year|quarter)|fy\s*\d+|fy\d+)\b/i,
  /\b(end\s+(of\s+)?(week|month|quarter|year)|start\s+(of\s+)?(week|month|quarter|year))\b/i,
  /\b(milestone|deadline|hurdle)\b/i,
];

const getHeuristicHints = (text) => {
  const input = text.toLowerCase().trim();
  const words = input.split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;
  const hasVagueVerb = vagueVerbPatterns.some(p => p.test(input));
  const hasStrongVerb = strongVerbs.some(v => words.slice(0, 6).some(w => w.startsWith(v)));
  const isSpecific = hasStrongVerb && wordCount >= 6 && !hasVagueVerb;
  const isMeasurable = measurablePatterns.some(p => p.test(input));
  const hasRelevantKeyword = words.some(w => relevantKeywords.some(k => w.includes(k)));
  const isRelevant = wordCount >= 4 && hasRelevantKeyword;
  const isAchievable = wordCount >= 4 && wordCount <= 80;
  const isTimebound = timePatterns.some(p => p.test(input));
  return { isSpecific, isMeasurable, isRelevant, isTimebound, isAchievable, wordCount, hasStrongVerb, hasVagueVerb };
};

const tests = [
  // SHOULD BE SMART
  { text: 'I will earn the AWS Certified Solutions Architect Associate certification by June 30th. I will achieve this by studying for 5 hours per week and completing two full-length practice exams with a score of 80% or higher to ensure I am prepared for the infrastructure requirements of my current role', expected: 'SMART', notes: 'Reference goal: earn + 5h + 80% + June 30' },
  { text: 'Implement a new customer onboarding process to increase user activation rate from 40% to 65% within Q2 2026, targeting 500 new signups per week', expected: 'SMART', notes: 'strong verb + from-to % + Q2 + signup metric' },
  { text: 'Deploy the new API gateway configuration by March 31 to reduce average response latency from 450ms to under 200ms across all endpoints', expected: 'SMART', notes: 'Deploy + date + from-to ms metric' },
  { text: 'Conduct a security audit of all internal systems by end of Q1, identifying and patching all critical vulnerabilities rated CVSS 7.0 or above', expected: 'SMART', notes: 'Conduct + Q1 + numeric threshold' },
  { text: 'Reduce customer support ticket volume by 20% in the next 3 months by implementing an AI chatbot for tier-1 queries and improving the knowledge base', expected: 'SMART', notes: 'Reduce + 20% + 3 months + method' },
  { text: 'Launch the new mobile app by July 15 to achieve 10,000 downloads in the first 30 days with a 4.5+ star rating', expected: 'SMART', notes: 'Launch + date + downloads + star rating' },
  { text: 'Complete Python programming certification with a score of 85% or higher by attending 8 hours of training per week for 6 weeks', expected: 'SMART', notes: 'Complete cert + 85% + 8h/week + 6 weeks' },
  { text: 'Improve team velocity from 32 to 45 story points per sprint within 3 months by implementing agile ceremonies redesign and removing team bottlenecks', expected: 'SMART', notes: 'From-to story points + 3 months' },
  { text: 'Increase monthly recurring revenue to 50,000 USD by acquiring 15 new enterprise clients by end of Q4 through targeted outreach and partnership proposals', expected: 'SMART', notes: 'Revenue target + 15 clients + Q4' },
  { text: 'Reduce production incidents from 12 per month to fewer than 4 per month by implementing automated monitoring alerts and runbook automation', expected: 'SMART', notes: 'From-to reduction + method' },
  { text: 'Complete the database migration to PostgreSQL 16 by Friday to eliminate end-of-life risk and reduce storage costs by 30%', expected: 'SMART', notes: 'Complete migration + Friday + 30% reduction' },
  { text: 'Automate the CI/CD pipeline to reduce deployment time from 45 minutes to under 10 minutes by EOW', expected: 'SMART', notes: 'Automate + from-to time + EOW' },
  { text: 'Resolve 90% of open support tickets within 48 hours by implementing a new ticketing triage workflow', expected: 'SMART', notes: 'Resolve 90% + 48h SLA + method' },
  { text: 'Design and ship a new checkout flow to increase conversion rate from 2.1% to 3.5% within 6 weeks', expected: 'SMART', notes: 'Design+ship + from-to % + 6 weeks' },
  { text: 'Reduce average incident response time from 4 hours to under 45 minutes by Q3 end through automation and runbook standardization', expected: 'SMART', notes: 'From-to time + Q3 + method' },
  { text: 'Finalize the Q3 budget allocation and submit to finance by September 1, ensuring all department requests are prioritized against the 2.5M total budget', expected: 'SMART', notes: 'Finalize + Sept 1 + 2.5M budget' },
  { text: 'Implement cloud cost optimization by reducing monthly AWS spend from 85,000 to 60,000 by end of Q3', expected: 'SMART', notes: 'Implement + from-to dollar amounts + Q3' },
  { text: 'Establish a disaster recovery site achieving RPO of 15 minutes and RTO of under 1 hour for all production systems by December 31', expected: 'SMART', notes: 'Establish + RPO/RTO metrics + Dec 31' },
  { text: 'Deliver quarterly sales training to 100% of the regional sales team, achieving a minimum 90% assessment pass rate within 2 weeks of session completion', expected: 'SMART', notes: 'Deliver + 100% + 90% pass rate + 2 weeks' },
  { text: 'Create a new hire IT setup checklist and runbook to reduce average provisioning time from 3 days to 4 hours by end of month', expected: 'SMART', notes: 'Create checklist + from-to time + deadline' },

  // SHOULD NOT BE SMART
  { text: 'Work on stuff', expected: 'NOT SMART', notes: 'vague verbs + minimal words' },
  { text: 'Update the system', expected: 'NOT SMART', notes: 'vague verb, no metrics or deadline' },
  { text: 'Review documents', expected: 'NOT SMART', notes: 'vague verb, no context' },
  { text: 'Help the team', expected: 'NOT SMART', notes: 'vague verb, no specifics' },
  { text: 'Check emails and messages', expected: 'NOT SMART', notes: 'routine task, no goal' },
  { text: 'I will do my best', expected: 'NOT SMART', notes: 'no specifics whatsoever' },
  { text: 'Complete the task as soon as possible', expected: 'NOT SMART', notes: 'ASAP is not a real deadline' },
  { text: 'Improve things', expected: 'NOT SMART', notes: 'improve what? by how much? by when?' },
  { text: 'Handle the project management responsibilities', expected: 'NOT SMART', notes: 'vague verb' },
  { text: 'Look into the issues and manage the team tasks', expected: 'NOT SMART', notes: 'multiple vague verbs, no deadline' },
  { text: 'Implement the new feature', expected: 'NOT SMART', notes: 'strong verb but no metric or deadline' },
  { text: 'Deploy to production by end of month', expected: 'NOT SMART', notes: 'verb + vague deadline but no measurable target' },
  { text: 'Improve the process', expected: 'NOT SMART', notes: 'improve what? by how much? by when?' },
  { text: 'Conduct regular team meetings', expected: 'NOT SMART', notes: 'vague frequency' },
  { text: 'Achieve success in all endeavors', expected: 'NOT SMART', notes: 'vague outcome' },
  { text: 'Analyze the data to find insights', expected: 'NOT SMART', notes: 'verb but no metric or deadline' },
  { text: 'Optimize system performance', expected: 'NOT SMART', notes: 'verb but no metric target or deadline' },
  { text: 'Meet with stakeholders to discuss the roadmap', expected: 'NOT SMART', notes: 'vague meeting, no outcome' },
  { text: 'Finish the report', expected: 'NOT SMART', notes: 'no deadline, no context, no metric' },
  { text: 'Manage the backlog items', expected: 'NOT SMART', notes: 'vague verb, no specific scope' },
  { text: 'Complete onboarding for 3 new hires this month', expected: 'NOT SMART', notes: 'count + month but no strong verb, no metric on outcome' },
  { text: 'Ship the feature ASAP', expected: 'NOT SMART', notes: 'ASAP is not a real deadline' },
];

let passed = 0, failed = 0;
const results = [];

tests.forEach((t, i) => {
  const h = getHeuristicHints(t.text);
  const coreSMART = h.isSpecific && h.isMeasurable && h.isTimebound;
  const predicted = coreSMART ? 'SMART' : 'NOT SMART';
  const isCorrect = predicted === t.expected;
  if (isCorrect) passed++; else failed++;
  results.push({ i: i + 1, correct: isCorrect, expected: t.expected, predicted, notes: t.notes, text: t.text.slice(0, 65), breakdown: { S: h.isSpecific ? 'P' : 'F', M: h.isMeasurable ? 'P' : 'F', A: h.isAchievable ? 'P' : 'F', R: h.isRelevant ? 'P' : 'F', T: h.isTimebound ? 'P' : 'F', words: h.wordCount } });
});

console.log('================================================================================');
console.log('  SMART CHECK ACCURACY (FIXED)');
console.log('================================================================================');
console.log('Total: ' + tests.length + '  |  PASSED: ' + passed + '  |  FAILED: ' + failed + '  |  Accuracy: ' + ((passed/tests.length)*100).toFixed(1) + '%');
console.log('================================================================================');

results.forEach(r => {
  const tag = r.correct ? '[OK]' : '[XX]';
  console.log((r.correct ? '\x1b[32m' : '\x1b[31m') + tag + '\x1b[0m #' + String(r.i).padStart(2,'0') + '  ' + r.expected.padEnd(10) + '  ' + r.predicted.padEnd(10) + ' S=' + r.breakdown.S + ' M=' + r.breakdown.M + ' A=' + r.breakdown.A + ' R=' + r.breakdown.R + ' T=' + r.breakdown.T + ' (' + r.breakdown.words + 'w)');
  if (!r.correct) {
    console.log('    TEXT: "' + r.text + '..."');
    console.log('    NOTE: ' + r.notes);
  }
});

const perCrit = { S: {pass:0,fail:0}, M: {pass:0,fail:0}, A: {pass:0,fail:0}, R: {pass:0,fail:0}, T: {pass:0,fail:0} };
results.forEach(r => {
  ['S','M','A','R','T'].forEach(c => {
    r.breakdown[c] === 'P' ? perCrit[c].pass++ : perCrit[c].fail++;
  });
});
console.log('\nPer-Criterion Accuracy:');
['S','M','A','R','T'].forEach(c => {
  const total = perCrit[c].pass + perCrit[c].fail;
  const acc = ((perCrit[c].pass / total) * 100).toFixed(1);
  console.log('  ' + c + ': ' + perCrit[c].pass + '/' + total + ' correct = ' + acc + '%');
});
