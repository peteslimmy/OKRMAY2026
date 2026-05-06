export enum AuditEventType {
  CODE_COMMIT = 'CODE_COMMIT',
  CODE_MERGE = 'CODE_MERGE',
  PR_CREATED = 'PR_CREATED',
  PR_APPROVED = 'PR_APPROVED',
  PR_REJECTED = 'PR_REJECTED',
  PR_MERGED = 'PR_MERGED',
  DEPLOYMENT_STARTED = 'DEPLOYMENT_STARTED',
  DEPLOYMENT_SUCCESS = 'DEPLOYMENT_SUCCESS',
  DEPLOYMENT_FAILED = 'DEPLOYMENT_FAILED',
  DEPLOYMENT_ROLLBACK = 'DEPLOYMENT_ROLLBACK',
  TEST_RUN_STARTED = 'TEST_RUN_STARTED',
  TEST_RUN_COMPLETED = 'TEST_RUN_COMPLETED',
  TEST_RUN_FAILED = 'TEST_RUN_FAILED',
  SECURITY_SCAN_STARTED = 'SECURITY_SCAN_STARTED',
  SECURITY_SCAN_COMPLETED = 'SECURITY_SCAN_COMPLETED',
  SECURITY_VULN_DETECTED = 'SECURITY_VULN_DETECTED',
  SECURITY_VULN_FIXED = 'SECURITY_VULN_FIXED',
  USER_LOGIN = 'USER_LOGIN',
  USER_LOGOUT = 'USER_LOGOUT',
  USER_ACTION = 'USER_ACTION',
  CONFIG_CHANGE = 'CONFIG_CHANGE',
  PERMISSION_CHANGE = 'PERMISSION_CHANGE',
  INCIDENT_CREATED = 'INCIDENT_CREATED',
  INCIDENT_UPDATED = 'INCIDENT_UPDATED',
  INCIDENT_RESOLVED = 'INCIDENT_RESOLVED',
  RISK_ASSESSMENT = 'RISK_ASSESSMENT',
  GATE_PASSED = 'GATE_PASSED',
  GATE_FAILED = 'GATE_FAILED',
  RELEASE_APPROVED = 'RELEASE_APPROVED',
  RELEASE_REJECTED = 'RELEASE_REJECTED',
}

export enum AuditSeverity {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL',
}

export interface AuditActor {
  userId: string;
  username: string;
  email: string;
  role: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuditResource {
  type: string;
  id: string;
  name: string;
  metadata?: Record<string, unknown>;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  eventType: AuditEventType;
  severity: AuditSeverity;
  actor: AuditActor;
  resource?: AuditResource;
  action: string;
  outcome: 'SUCCESS' | 'FAILURE' | 'PENDING';
  message: string;
  metadata?: Record<string, unknown>;
  environment: string;
  service: string;
  correlationId?: string;
  parentEventId?: string;
}

export interface AuditLogFilter {
  startDate?: string;
  endDate?: string;
  eventTypes?: AuditEventType[];
  severities?: AuditSeverity[];
  actorId?: string;
  resourceType?: string;
  resourceId?: string;
  outcome?: 'SUCCESS' | 'FAILURE';
  environment?: string;
  search?: string;
}

export interface AuditLogQuery {
  filters: AuditLogFilter;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AuditLogResult {
  events: AuditEvent[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ComplianceReport {
  reportId: string;
  generatedAt: string;
  period: { start: string; end: string };
  summary: {
    totalEvents: number;
    eventsByType: Record<string, number>;
    eventsBySeverity: Record<string, number>;
    complianceStatus: 'COMPLIANT' | 'NON_COMPLIANT' | 'REVIEW_REQUIREED';
  };
  findings: ComplianceFinding[];
  controls: ControlStatus[];
}

export interface ComplianceFinding {
  id: string;
  severity: AuditSeverity;
  controlId: string;
  description: string;
  evidence: string[];
  remediation: string;
  detectedAt: string;
}

export interface ControlStatus {
  controlId: string;
  controlName: string;
  status: 'EFFECTIVE' | 'INEFFECTIVE' | 'NOT_APPLICABLE';
  lastReviewed: string;
  evidenceRef?: string;
}

export class AuditLogger {
  private serviceName: string;
  private environment: string;
  private eventQueue: AuditEvent[] = [];
  private flushInterval: number = 5000;
  private maxQueueSize: number = 100;

  constructor(serviceName: string, environment: string = 'development') {
    this.serviceName = serviceName;
    this.environment = environment;

    if (typeof window === 'undefined') {
      setInterval(() => this.flush(), this.flushInterval);
    }
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  private createAuditEvent(
    eventType: AuditEventType,
    severity: AuditSeverity,
    actor: AuditActor,
    action: string,
    message: string,
    outcome: 'SUCCESS' | 'FAILURE' | 'PENDING',
    metadata?: Record<string, unknown>,
    resource?: AuditResource
  ): AuditEvent {
    return {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      eventType,
      severity,
      actor,
      resource,
      action,
      outcome,
      message,
      metadata,
      environment: this.environment,
      service: this.serviceName,
      correlationId: this.generateId(),
    };
  }

  log(
    eventType: AuditEventType,
    severity: AuditSeverity,
    actor: AuditActor,
    action: string,
    message: string,
    outcome: 'SUCCESS' | 'FAILURE' | 'PENDING' = 'SUCCESS',
    metadata?: Record<string, unknown>,
    resource?: AuditResource
  ): string {
    const event = this.createAuditEvent(
      eventType,
      severity,
      actor,
      action,
      message,
      outcome,
      metadata,
      resource
    );

    this.eventQueue.push(event);

    if (this.eventQueue.length >= this.maxQueueSize) {
      this.flush();
    }

    return event.id;
  }

  async flush(): Promise<void> {
    if (this.eventQueue.length === 0) return;

    const eventsToFlush = [...this.eventQueue];
    this.eventQueue = [];

    try {
      await this.persistEvents(eventsToFlush);
      console.log(`[Audit] Flushed ${eventsToFlush.length} events`);
    } catch (error) {
      console.error('[Audit] Failed to flush events:', error);
      this.eventQueue.unshift(...eventsToFlush);
    }
  }

  private async persistEvents(events: AuditEvent[]): Promise<void> {
    if (typeof window === 'undefined') {
      console.log('[Audit] Persisting events:', JSON.stringify(events, null, 2));
    }
  }

  logCodeCommit(
    actor: AuditActor,
    commitHash: string,
    branch: string,
    message: string,
    filesChanged: number,
    outcome: 'SUCCESS' | 'FAILURE'
  ): string {
    return this.log(
      AuditEventType.CODE_COMMIT,
      AuditSeverity.INFO,
      actor,
      'Code committed',
      `Commit ${commitHash.substring(0, 7)} to ${branch}: ${message}`,
      outcome,
      { commitHash, branch, filesChanged }
    );
  }

  logDeployment(
    actor: AuditActor,
    environment: string,
    version: string,
    status: 'STARTED' | 'SUCCESS' | 'FAILED' | 'ROLLBACK',
    metadata?: Record<string, unknown>
  ): string {
    const eventType = status === 'SUCCESS'
      ? AuditEventType.DEPLOYMENT_SUCCESS
      : status === 'FAILED'
      ? AuditEventType.DEPLOYMENT_FAILED
      : status === 'ROLLBACK'
      ? AuditEventType.DEPLOYMENT_ROLLBACK
      : AuditEventType.DEPLOYMENT_STARTED;

    return this.log(
      eventType,
      status === 'FAILED' || status === 'ROLLBACK' ? AuditSeverity.ERROR : AuditSeverity.INFO,
      actor,
      `Deployment ${status.toLowerCase()}`,
      `Deployment to ${environment} ${status.toLowerCase()} for version ${version}`,
      status === 'SUCCESS' || status === 'STARTED' ? 'SUCCESS' : 'FAILURE',
      { environment, version, ...metadata }
    );
  }

  logTestRun(
    actor: AuditActor,
    testType: string,
    totalTests: number,
    passedTests: number,
    failedTests: number,
    duration: number
  ): string {
    const outcome = failedTests === 0 ? 'SUCCESS' : 'FAILURE';
    const severity = failedTests === 0 ? AuditSeverity.INFO : AuditSeverity.WARNING;

    return this.log(
      failedTests === 0 ? AuditEventType.TEST_RUN_COMPLETED : AuditEventType.TEST_RUN_FAILED,
      severity,
      actor,
      'Test run completed',
      `${testType}: ${passedTests}/${totalTests} passed in ${duration}ms`,
      outcome,
      { testType, totalTests, passedTests, failedTests, duration }
    );
  }

  logSecurityEvent(
    actor: AuditActor,
    eventType: AuditEventType,
    severity: AuditSeverity,
    description: string,
    vulnerabilityId?: string,
    cveId?: string
  ): string {
    return this.log(
      eventType,
      severity,
      actor,
      'Security event',
      description,
      'SUCCESS',
      { vulnerabilityId, cveId }
    );
  }

  logUserAction(
    actor: AuditActor,
    action: string,
    resourceType: string,
    resourceId: string,
    outcome: 'SUCCESS' | 'FAILURE',
    metadata?: Record<string, unknown>
  ): string {
    return this.log(
      AuditEventType.USER_ACTION,
      AuditSeverity.INFO,
      actor,
      action,
      `User performed ${action} on ${resourceType}:${resourceId}`,
      outcome,
      metadata,
      { type: resourceType, id: resourceId, name: resourceId }
    );
  }

  logRiskAssessment(
    actor: AuditActor,
    riskScore: number,
    riskLevel: string,
    autoDeploy: boolean,
    gatesPassed: boolean
  ): string {
    return this.log(
      AuditEventType.RISK_ASSESSMENT,
      riskLevel === 'CRITICAL' ? AuditSeverity.ERROR :
      riskLevel === 'HIGH' ? AuditSeverity.WARNING : AuditSeverity.INFO,
      actor,
      'Risk assessment performed',
      `Release risk: ${riskScore}/100 (${riskLevel}) - ${autoDeploy ? 'Auto-deploy' : 'Manual required'}`,
      gatesPassed ? 'SUCCESS' : 'FAILURE',
      { riskScore, riskLevel, autoDeploy, gatesPassed }
    );
  }

  logGateResult(
    actor: AuditActor,
    gateName: string,
    passed: boolean,
    severity: 'BLOCK' | 'WARN',
    details?: string
  ): string {
    return this.log(
      passed ? AuditEventType.GATE_PASSED : AuditEventType.GATE_FAILED,
      passed ? AuditSeverity.INFO : severity === 'BLOCK' ? AuditSeverity.ERROR : AuditSeverity.WARNING,
      actor,
      `Gate ${passed ? 'passed' : 'failed'}`,
      `${gateName} ${passed ? 'passed' : 'failed'}${details ? ': ' + details : ''}`,
      passed ? 'SUCCESS' : 'FAILURE',
      { gateName, passed, severity, details }
    );
  }

  logIncident(
    actor: AuditActor,
    status: 'CREATED' | 'UPDATED' | 'RESOLVED',
    incidentId: string,
    severity: string,
    description: string,
    metadata?: Record<string, unknown>
  ): string {
    const eventType = status === 'CREATED'
      ? AuditEventType.INCIDENT_CREATED
      : status === 'RESOLVED'
      ? AuditEventType.INCIDENT_RESOLVED
      : AuditEventType.INCIDENT_UPDATED;

    const auditSeverity = severity === 'P1' || severity === 'P2'
      ? AuditSeverity.CRITICAL
      : severity === 'P3'
      ? AuditSeverity.ERROR
      : AuditSeverity.WARNING;

    return this.log(
      eventType,
      auditSeverity,
      actor,
      `Incident ${status.toLowerCase()}`,
      `Incident ${incidentId}: ${description}`,
      'SUCCESS',
      { incidentId, severity, ...metadata }
    );
  }

  async queryLogs(query: AuditLogQuery): Promise<AuditLogResult> {
    console.log('[Audit] Querying logs:', JSON.stringify(query));

    return {
      events: [],
      totalCount: 0,
      page: query.page || 1,
      pageSize: query.pageSize || 50,
      totalPages: 0,
    };
  }

  async generateComplianceReport(startDate: string, endDate: string): Promise<ComplianceReport> {
    console.log('[Audit] Generating compliance report:', startDate, 'to', endDate);

    return {
      reportId: this.generateId(),
      generatedAt: new Date().toISOString(),
      period: { start: startDate, end: endDate },
      summary: {
        totalEvents: 0,
        eventsByType: {},
        eventsBySeverity: {},
        complianceStatus: 'COMPLIANT',
      },
      findings: [],
      controls: [],
    };
  }

  exportLogs(format: 'json' | 'csv' = 'json'): string {
    const logs = this.eventQueue.map(e => ({
      ...e,
      timestamp: new Date(e.timestamp).toISOString(),
    }));

    if (format === 'csv') {
      const headers = Object.keys(logs[0] || {}).join(',');
      const rows = logs.map(l => Object.values(l).join(',')).join('\n');
      return `${headers}\n${rows}`;
    }

    return JSON.stringify(logs, null, 2);
  }
}

export const auditLogger = new AuditLogger('4core-okr-platform', process.env.NODE_ENV || 'development');