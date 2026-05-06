export interface TestMetrics {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
}

export interface BugMetrics {
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export interface SecurityMetrics {
  criticalVulnerabilities: number;
  highVulnerabilities: number;
  mediumVulnerabilities: number;
  lowVulnerabilities: number;
}

export interface CodeChangeMetrics {
  linesAdded: number;
  linesDeleted: number;
  filesChanged: number;
  commitCount: number;
}

export interface RiskAssessmentInput {
  testMetrics: TestMetrics;
  bugMetrics: BugMetrics;
  securityMetrics: SecurityMetrics;
  codeChangeMetrics: CodeChangeMetrics;
  previousReleaseMetrics?: TestMetrics;
  changeProbability?: number;
}

export interface RiskAssessmentOutput {
  riskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  autoDeploy: boolean;
  gatePasses: boolean;
  breakdown: {
    testFailureScore: number;
    bugFactorScore: number;
    securityVulnScore: number;
    codeChurnScore: number;
    changeProbabilityScore: number;
  };
  recommendations: string[];
  blockers: string[];
  timestamp: string;
}

export interface QualityGate {
  name: string;
  passed: boolean;
  severity: 'BLOCK' | 'WARN';
  message: string;
}

export interface ReleaseDecision {
  approved: boolean;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  riskScore: number;
  gates: QualityGate[];
  requiresApproval: boolean;
  approvers: string[];
  autoDeploy: boolean;
  rollbackRequired: boolean;
  recommendations: string[];
}

export class RiskScoringEngine {

  private readonly WEIGHTS = {
    testFailure: 0.25,
    bugFactor: 0.20,
    securityVuln: 0.30,
    codeChurn: 0.15,
    changeProbability: 0.10,
  };

  private readonly RISK_THRESHOLDS = {
    LOW: 25,
    MEDIUM: 50,
    HIGH: 75,
    CRITICAL: 100,
  };

  calculateTestFailureScore(metrics: TestMetrics): number {
    if (metrics.totalTests === 0) return 0;

    const failureRate = (metrics.failedTests / metrics.totalTests) * 100;

    const skippedPenalty = metrics.skippedTests > 0
      ? Math.min((metrics.skippedTests / metrics.totalTests) * 100, 10)
      : 0;

    return Math.min(failureRate + skippedPenalty, 100);
  }

  calculateBugFactorScore(bugs: BugMetrics): number {
    const score = (bugs.critical * 10) +
                  (bugs.high * 5) +
                  (bugs.medium * 2) +
                  (bugs.low * 0.5);

    return Math.min(score, 100);
  }

  calculateSecurityVulnScore(security: SecurityMetrics): number {
    const score = (security.criticalVulnerabilities * 10) +
                  (security.highVulnerabilities * 5) +
                  (security.mediumVulnerabilities * 2) +
                  (security.lowVulnerabilities * 0.5);

    return Math.min(score, 100);
  }

  calculateCodeChurnScore(changes: CodeChangeMetrics): number {
    const totalChanges = changes.linesAdded + changes.linesDeleted;
    const rawScore = (totalChanges / 500) * 100;

    const volatilityBonus = changes.filesChanged > 20
      ? Math.min((changes.filesChanged - 20) * 2, 20)
      : 0;

    return Math.min(rawScore + volatilityBonus, 100);
  }

  calculateChangeProbabilityScore(probability?: number): number {
    if (probability === undefined) {
      return 50;
    }
    return Math.max(0, Math.min(probability, 100));
  }

  assessRisk(input: RiskAssessmentInput): RiskAssessmentOutput {
    const testFailureScore = this.calculateTestFailureScore(input.testMetrics);
    const bugFactorScore = this.calculateBugFactorScore(input.bugMetrics);
    const securityVulnScore = this.calculateSecurityVulnScore(input.securityMetrics);
    const codeChurnScore = this.calculateCodeChurnScore(input.codeChangeMetrics);
    const changeProbabilityScore = this.calculateChangeProbabilityScore(input.changeProbability);

    const riskScore = Math.round(
      (testFailureScore * this.WEIGHTS.testFailure) +
      (bugFactorScore * this.WEIGHTS.bugFactor) +
      (securityVulnScore * this.WEIGHTS.securityVuln) +
      (codeChurnScore * this.WEIGHTS.codeChurn) +
      (changeProbabilityScore * this.WEIGHTS.changeProbability)
    );

    const riskLevel = this.getRiskLevel(riskScore);
    const autoDeploy = riskScore <= this.RISK_THRESHOLDS.LOW;
    const gatePasses = riskLevel !== 'CRITICAL' && securityVulnScore < 50;

    const recommendations: string[] = [];
    const blockers: string[] = [];

    if (testFailureScore > 0) {
      recommendations.push(`Address ${input.testMetrics.failedTests} failing tests before release`);
    }
    if (bugFactorScore > 20) {
      blockers.push(`${input.bugMetrics.critical} critical bugs must be resolved`);
    }
    if (securityVulnScore > 30) {
      blockers.push(`Critical/high security vulnerabilities must be patched`);
    }
    if (codeChurnScore > 60) {
      recommendations.push(`Consider splitting into smaller releases to reduce risk`);
    }

    return {
      riskScore,
      riskLevel,
      autoDeploy,
      gatePasses,
      breakdown: {
        testFailureScore: Math.round(testFailureScore),
        bugFactorScore: Math.round(bugFactorScore),
        securityVulnScore: Math.round(securityVulnScore),
        codeChurnScore: Math.round(codeChurnScore),
        changeProbabilityScore: Math.round(changeProbabilityScore),
      },
      recommendations,
      blockers,
      timestamp: new Date().toISOString(),
    };
  }

  private getRiskLevel(score: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    if (score <= this.RISK_THRESHOLDS.LOW) return 'LOW';
    if (score <= this.RISK_THRESHOLDS.MEDIUM) return 'MEDIUM';
    if (score <= this.RISK_THRESHOLDS.HIGH) return 'HIGH';
    return 'CRITICAL';
  }

  evaluateQualityGates(input: RiskAssessmentInput): QualityGate[] {
    const gates: QualityGate[] = [];

    gates.push({
      name: 'All Tests Pass',
      passed: input.testMetrics.failedTests === 0,
      severity: 'BLOCK',
      message: input.testMetrics.failedTests === 0
        ? 'All tests passing'
        : `${input.testMetrics.failedTests}/${input.testMetrics.totalTests} tests failing`,
    });

    gates.push({
      name: 'No Critical Bugs',
      passed: input.bugMetrics.critical === 0,
      severity: 'BLOCK',
      message: input.bugMetrics.critical === 0
        ? 'No critical bugs'
        : `${input.bugMetrics.critical} critical bugs open`,
    });

    gates.push({
      name: 'No Critical Vulnerabilities',
      passed: input.securityMetrics.criticalVulnerabilities === 0,
      severity: 'BLOCK',
      message: input.securityMetrics.criticalVulnerabilities === 0
        ? 'No critical vulnerabilities'
        : `${input.securityMetrics.criticalVulnerabilities} critical vulnerabilities`,
    });

    gates.push({
      name: 'Security High/Low Vulns Under Threshold',
      passed: input.securityMetrics.highVulnerabilities <= 5,
      severity: input.securityMetrics.highVulnerabilities > 10 ? 'BLOCK' : 'WARN',
      message: input.securityMetrics.highVulnerabilities <= 5
        ? 'High vulnerabilities under threshold'
        : `${input.securityMetrics.highVulnerabilities} high vulnerabilities (threshold: 5)`,
    });

    gates.push({
      name: 'Minimum Coverage',
      passed: input.testMetrics.totalTests > 0 &&
              (input.testMetrics.passedTests / input.testMetrics.totalTests) >= 0.8,
      severity: 'BLOCK',
      message: 'Coverage above 80%',
    });

    gates.push({
      name: 'Code Churn Acceptable',
      passed: this.calculateCodeChurnScore(input.codeChangeMetrics) < 70,
      severity: 'WARN',
      message: this.calculateCodeChurnScore(input.codeChangeMetrics) < 70
        ? 'Code churn acceptable'
        : 'High code churn - consider smaller changes',
    });

    return gates;
  }

  makeReleaseDecision(input: RiskAssessmentInput): ReleaseDecision {
    const riskAssessment = this.assessRisk(input);
    const gates = this.evaluateQualityGates(input);

    const allGatesPass = gates.every(g => g.passed || g.severity === 'WARN');
    const blockingGatesFail = gates.some(g => !g.passed && g.severity === 'BLOCK');

    const requiresApproval = riskAssessment.riskLevel !== 'LOW';
    const autoDeploy = !requiresApproval && allGatesPass && !blockingGatesFail;

    const approvers: string[] = [];
    if (riskAssessment.riskLevel === 'HIGH' || riskAssessment.riskLevel === 'CRITICAL') {
      approvers.push('Release Manager', 'QA Lead');
    }
    if (riskAssessment.riskLevel === 'CRITICAL') {
      approvers.push('CAB');
    }

    return {
      approved: !blockingGatesFail && gates.filter(g => !g.passed).length <= 2,
      riskLevel: riskAssessment.riskLevel,
      riskScore: riskAssessment.riskScore,
      gates,
      requiresApproval,
      approvers,
      autoDeploy,
      rollbackRequired: blockingGatesFail || riskAssessment.riskLevel === 'CRITICAL',
      recommendations: riskAssessment.recommendations,
    };
  }

  compareReleases(current: RiskAssessmentInput, previous: RiskAssessmentInput): {
    riskDelta: number;
    trend: 'IMPROVING' | 'STABLE' | 'DEGRADING';
    details: string[];
  } {
    const currentRisk = this.assessRisk(current);
    const previousRisk = this.assessRisk(previous);

    const riskDelta = currentRisk.riskScore - previousRisk.riskScore;

    const details: string[] = [];

    if (current.testMetrics.failedTests > previous.testMetrics.failedTests) {
      details.push(`Test failures increased by ${current.testMetrics.failedTests - previous.testMetrics.failedTests}`);
    }
    if (current.securityMetrics.criticalVulnerabilities > previous.securityMetrics.criticalVulnerabilities) {
      details.push(`Critical vulnerabilities increased`);
    }
    if (current.codeChangeMetrics.linesAdded > previous.codeChangeMetrics.linesAdded * 1.5) {
      details.push(`Large code increase detected`);
    }

    let trend: 'IMPROVING' | 'STABLE' | 'DEGRADING';
    if (riskDelta < -5) trend = 'IMPROVING';
    else if (riskDelta > 5) trend = 'DEGRADING';
    else trend = 'STABLE';

    return { riskDelta, trend, details };
  }
}

export const riskEngine = new RiskScoringEngine();

export function generateRiskReport(input: RiskAssessmentInput): string {
  const assessment = riskEngine.assessRisk(input);
  const decision = riskEngine.makeReleaseDecision(input);

  let report = `
═══════════════════════════════════════════════════════════════
                    RISK ASSESSMENT REPORT
═══════════════════════════════════════════════════════════════
Generated: ${assessment.timestamp}

RISK SCORE: ${assessment.riskScore}/100 (${assessment.riskLevel})
${assessment.gatePasses ? '✅ GATES PASS' : '❌ GATES FAIL'}
${assessment.autoDeploy ? '🚀 AUTO-DEPLOY ENABLED' : '⚠️ MANUAL APPROVAL REQUIRED'}

BREAKDOWN:
  Test Failure:    ${assessment.breakdown.testFailureScore}/100 (weight: 25%)
  Bug Factor:      ${assessment.breakdown.bugFactorScore}/100 (weight: 20%)
  Security Vuln:   ${assessment.breakdown.securityVulnScore}/100 (weight: 30%)
  Code Churn:      ${assessment.breakdown.codeChurnScore}/100 (weight: 15%)
  Change Prob:     ${assessment.breakdown.changeProbabilityScore}/100 (weight: 10%)

QUALITY GATES:
`;

  decision.gates.forEach(gate => {
    const icon = gate.passed ? '✅' : (gate.severity === 'BLOCK' ? '❌' : '⚠️');
    report += `  ${icon} ${gate.name}: ${gate.message}\n`;
  });

  if (assessment.blockers.length > 0) {
    report += `\n🚫 BLOCKERS:\n`;
    assessment.blockers.forEach(b => { report += `  - ${b}\n`; });
  }

  if (assessment.recommendations.length > 0) {
    report += `\n📋 RECOMMENDATIONS:\n`;
    assessment.recommendations.forEach(r => { report += `  - ${r}\n`; });
  }

  report += `
═══════════════════════════════════════════════════════════════
`;

  return report;
}