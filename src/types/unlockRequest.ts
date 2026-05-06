export interface UnlockRequest {
  id: string;
  week: number;
  year: number;
  requestedById: string;
  requestedByName: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
  reviewedById?: string;
  reviewedByName?: string;
  reviewNote?: string;
  createdAt: string;
  expiresAt?: string;
}