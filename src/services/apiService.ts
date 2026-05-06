/**
 * API service for the OKR application
 * Implements RESTful API calls with error handling, caching, and authentication
 */

import { logger, logAPIRequest, logError } from '@/utils/logging';
import { httpCache } from '@/utils/cache';
import { 
  createError, 
  createNetworkError, 
  createAuthenticationError,
  createAuthorizationError,
  createNotFoundError,
  createValidationError
} from '@/utils/errors';

// API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
const DEFAULT_TIMEOUT = 10000; // 10 seconds

// API response interface
export interface APIResponse<T> {
  data: T;
  status: number;
  message?: string;
}

// API error interface
export interface APIError {
  message: string;
  code: string;
  status: number;
}

// Request options
interface RequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  headers?: Record<string, string>;
  timeout?: number;
  useCache?: boolean;
  cacheKey?: string;
}

// API service class
export class APIService {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor() {
    this.baseUrl = API_BASE_URL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  /**
   * Make an API request
   */
  async request<T>(
    endpoint: string,
    options: RequestOptions = { method: 'GET' }
  ): Promise<APIResponse<T> | null> {
    const url = `${this.baseUrl}${endpoint}`;
    const { method, body, headers = {}, timeout = DEFAULT_TIMEOUT, useCache = true, cacheKey } = options;
    
    // Log the request
    logAPIRequest(method, url, undefined, { 
      useCache, 
      cacheKey,
      body: body ? JSON.stringify(body).substring(0, 100) + '...' : undefined 
    });
    
    // Check cache first
    if (useCache && cacheKey) {
      const cached = httpCache.get(cacheKey);
      if (cached) {
        return cached;
      }
    }
    
    try {
      // Prepare request
      const config: RequestInit = {
        method,
        headers: { ...this.defaultHeaders, ...headers },
        signal: AbortSignal.timeout(timeout)
      };
      
      if (body) {
        config.body = JSON.stringify(body);
      }
      
      // Make request
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw createError('NETWORK_ERROR', `API request failed: ${response.statusText}`, {
          status: response.status,
          statusText: response.statusText,
          url
        });
      }
      
      const data = await response.json();
      
      // Cache the response if requested
      if (useCache && cacheKey) {
        httpCache.set(cacheKey, data);
      }
      
      return {
        data,
        status: response.status
      };
    } catch (error) {
      logError(error as Error, { operation: 'API Request', url, options });
      throw error;
    }
  }
  
  /**
   * Get current objective
   */
  async getCurrentObjective() {
    try {
      const response = await this.request('/objective/current');
      return response?.data || null;
    } catch (error) {
      logError(error as Error, { operation: 'getCurrentObjective' });
      throw error;
    }
  }
  
  /**
   * Get dashboard data
   */
  async getDashboard() {
    try {
      const response = await this.request('/dashboard');
      return response?.data || null;
    } catch (error) {
      logError(error as Error, { operation: 'getDashboard' });
      throw error;
    }
  }
  
  /**
   * Get key results for an objective
   */
  async getKeyResults(objectiveId: string) {
    try {
      const response = await this.request(`/key-results/${objectiveId}`);
      return response?.data || null;
    } catch (error) {
      logError(error as Error, { operation: 'getKeyResults', objectiveId });
      throw error;
    }
  }
  
  /**
   * Update sub KR progress
   */
  async updateSubKRProgress(subKrId: string, progress: number) {
    try {
      const response = await this.request(`/sub-kr/progress`, {
        method: 'PUT',
        body: { subKrId, progress }
      });
      return response?.data || null;
    } catch (error) {
      logError(error as Error, { operation: 'updateSubKRProgress', subKrId, progress });
      throw error;
    }
  }
  
  /**
   * Get audit logs
   */
  async getAuditLogs() {
    try {
      const response = await this.request('/audit-logs');
      return response?.data || null;
    } catch (error) {
      logError(error as Error, { operation: 'getAuditLogs' });
      throw error;
    }
  }
  
  /**
   * Lock quarter
   */
  async lockQuarter(objectiveId: string) {
    try {
      const response = await this.request('/lock-quarter', {
        method: 'POST',
        body: { objectiveId }
      });
      return response?.data || null;
    } catch (error) {
      logError(error as Error, { operation: 'lockQuarter', objectiveId });
      throw error;
    }
  }
  
  /**
   * Override lock
   */
  async overrideLock(objectiveId: string, reason: string) {
    try {
      const response = await this.request('/override-lock', {
        method: 'POST',
        body: { objectiveId, reason }
      });
      return response?.data || null;
    } catch (error) {
      logError(error as Error, { operation: 'overrideLock', objectiveId, reason });
      throw error;
    }
  }
  
  /**
   * Get KR version history
   */
  async getKRVersionHistory(krId: string) {
    try {
      const response = await this.request(`/kr-version-history?kr_id=${krId}`);
      return response?.data || null;
    } catch (error) {
      logError(error as Error, { operation: 'getKRVersionHistory', krId });
      throw error;
    }
  }
}

// Export singleton instance
export const apiService = new APIService();