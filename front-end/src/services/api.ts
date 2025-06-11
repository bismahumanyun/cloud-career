// API Service Layer for CareerCloud Backend Integration

import type {
  SystemCountryCode,
  SystemLanguageCode,
  SecurityLogin,
  SecurityRole,
  SecurityLoginRole,
  SecurityLoginLog,
  CompanyProfile,
  CompanyDescription,
  CompanyLocation,
  CompanyJob,
  CompanyJobDescription,
  CompanyJobEducation,
  CompanyJobSkill,
  ApplicantProfile,
  ApplicantEducation,
  ApplicantSkill,
  ApplicantWorkHistory,
  ApplicantResume,
  ApplicantJobApplication,
  ApiResponse,
  LoginForm,
  UserSession
} from '../types/entities';

// Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Base API Client
class ApiClient {
  private baseUrl: string;
  private authToken: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    // Load token from localStorage if available
    this.authToken = localStorage.getItem('auth_token');
  }

  setAuthToken(token: string) {
    this.authToken = token;
    localStorage.setItem('auth_token', token);
  }

  clearAuthToken() {
    this.authToken = null;
    localStorage.removeItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          // If response is not JSON, use default error message
        }
        throw new ApiError(errorMessage, response.status, response);
      }

      // Handle empty responses (like DELETE operations)
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        return {} as T;
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        error instanceof Error ? error.message : 'Network error occurred',
        0
      );
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Create API client instance
const apiClient = new ApiClient(API_BASE_URL);

// Authentication Service
export const authService = {
  async login(credentials: LoginForm): Promise<UserSession> {
    // Mock authentication for now - replace with actual login endpoint
    const mockSession: UserSession = {
      login: {
        id: '1',
        login: credentials.email,
        emailAddress: credentials.email,
        fullName: 'Demo User',
        forceChangePassword: false,
        preferredLanguage: 'en',
        timeStamp: new Date().toISOString(),
      },
      roles: ['Admin'],
      token: 'mock-jwt-token',
    };
    
    apiClient.setAuthToken(mockSession.token);
    localStorage.setItem('user_session', JSON.stringify(mockSession));
    return mockSession;
  },

  async logout(): Promise<void> {
    apiClient.clearAuthToken();
    localStorage.removeItem('user_session');
  },

  getCurrentSession(): UserSession | null {
    const session = localStorage.getItem('user_session');
    return session ? JSON.parse(session) : null;
  },
};

// Generic CRUD service factory
function createCrudService<T extends { id: string }>(baseEndpoint: string, mockFile?: string) {
  return {
    async getAll(): Promise<T[]> {
      try {
        return await apiClient.get<T[]>(baseEndpoint);
      } catch (error) {
        if (mockFile) {
          console.warn(`API not available, using mock data for ${baseEndpoint}`);
          return mockDataFallback<T[]>(baseEndpoint, mockFile);
        }
        throw error;
      }
    },

    async getById(id: string): Promise<T> {
      try {
        return await apiClient.get<T>(`${baseEndpoint}/${id}`);
      } catch (error) {
        if (mockFile) {
          const items = await this.getAll();
          const item = items.find(i => i.id === id);
          if (!item) throw new Error('Item not found');
          return item;
        }
        throw error;
      }
    },

    async create(data: Omit<T, 'id' | 'timeStamp'>): Promise<T> {
      try {
        return await apiClient.post<T>(baseEndpoint, data);
      } catch (error) {
        // Mock success for demo
        const newItem = {
          ...data,
          id: `mock-${Date.now()}`,
          timeStamp: new Date().toISOString(),
        } as unknown as T;
        console.log(`Mock create for ${baseEndpoint}:`, newItem);
        return newItem;
      }
    },

    async update(id: string, data: Partial<T>): Promise<T> {
      try {
        return await apiClient.put<T>(`${baseEndpoint}/${id}`, data);
      } catch (error) {
        // Mock success for demo
        const updatedItem = {
          ...data,
          id,
          timeStamp: new Date().toISOString(),
        } as unknown as T;
        console.log(`Mock update for ${baseEndpoint}/${id}:`, updatedItem);
        return updatedItem;
      }
    },

    async delete(id: string): Promise<void> {
      try {
        return await apiClient.delete<void>(`${baseEndpoint}/${id}`);
      } catch (error) {
        // Mock success for demo
        console.log(`Mock delete for ${baseEndpoint}/${id}`);
      }
    },
  };
}

// Mock data fallback function
async function mockDataFallback<T>(endpoint: string, mockFile: string): Promise<T> {
  try {
    const response = await fetch(`/mock-data/${mockFile}`);
    if (!response.ok) {
      throw new Error('Mock data not found');
    }
    return await response.json();
  } catch (error) {
    console.warn(`Using mock data for ${endpoint}:`, error);
    return [] as unknown as T;
  }
}

// System Services
export const systemCountryCodeService = {
  async getAll(): Promise<SystemCountryCode[]> {
    try {
      return await apiClient.get<SystemCountryCode[]>('/api/careercloud/SystemCountryCode/v1/countrycode');
    } catch (error) {
      console.warn('API not available, using mock data for countries');
      return mockDataFallback<SystemCountryCode[]>('countries', 'countries.json');
    }
  },

  async getByCode(code: string): Promise<SystemCountryCode> {
    try {
      return await apiClient.get<SystemCountryCode>(`/api/careercloud/SystemCountryCode/v1/countrycode/${code}`);
    } catch (error) {
      const countries = await this.getAll();
      const country = countries.find(c => c.code === code);
      if (!country) throw new Error('Country not found');
      return country;
    }
  },

  async create(data: SystemCountryCode): Promise<SystemCountryCode> {
    try {
      return await apiClient.post<SystemCountryCode>('/api/careercloud/SystemCountryCode/v1/countrycode', data);
    } catch (error) {
      // Mock success for demo
      return { ...data };
    }
  },

  async update(code: string, data: SystemCountryCode): Promise<SystemCountryCode> {
    try {
      return await apiClient.put<SystemCountryCode>(`/api/careercloud/SystemCountryCode/v1/countrycode/${code}`, data);
    } catch (error) {
      // Mock success for demo
      return { ...data };
    }
  },

  async delete(code: string): Promise<void> {
    try {
      return await apiClient.delete<void>(`/api/careercloud/SystemCountryCode/v1/countrycode/${code}`);
    } catch (error) {
      // Mock success for demo
      console.log(`Mock delete country: ${code}`);
    }
  },
};

export const systemLanguageCodeService = {
  async getAll(): Promise<SystemLanguageCode[]> {
    try {
      return await apiClient.get<SystemLanguageCode[]>('/api/careercloud/systemlanguagecode/v1/languagecode');
    } catch (error) {
      console.warn('API not available, using mock data for languages');
      return mockDataFallback<SystemLanguageCode[]>('languages', 'languages.json');
    }
  },

  async getById(languageId: string): Promise<SystemLanguageCode> {
    try {
      return await apiClient.get<SystemLanguageCode>(`/api/careercloud/systemlanguagecode/v1/languagecode/${languageId}`);
    } catch (error) {
      const languages = await this.getAll();
      const language = languages.find(l => l.languageId === languageId);
      if (!language) throw new Error('Language not found');
      return language;
    }
  },

  async create(data: SystemLanguageCode): Promise<SystemLanguageCode> {
    try {
      return await apiClient.post<SystemLanguageCode>('/api/careercloud/systemlanguagecode/v1/languagecode', data);
    } catch (error) {
      // Mock success for demo
      return { ...data };
    }
  },

  async update(languageId: string, data: SystemLanguageCode): Promise<SystemLanguageCode> {
    try {
      return await apiClient.put<SystemLanguageCode>(`/api/careercloud/systemlanguagecode/v1/languagecode/${languageId}`, data);
    } catch (error) {
      // Mock success for demo
      return { ...data };
    }
  },

  async delete(languageId: string): Promise<void> {
    try {
      return await apiClient.delete<void>(`/api/careercloud/systemlanguagecode/v1/languagecode/${languageId}`);
    } catch (error) {
      // Mock success for demo
      console.log(`Mock delete language: ${languageId}`);
    }
  },
};

// Security Services
export const securityLoginService = createCrudService<SecurityLogin>('/api/careercloud/securitylogin/v1/login', 'security-logins.json');
export const securityRoleService = createCrudService<SecurityRole>('/api/careercloud/securityrole/v1/role', 'security-roles.json');
export const securityLoginRoleService = createCrudService<SecurityLoginRole>('/api/careercloud/securityloginsrole/v1/loginsrole');
export const securityLoginLogService = createCrudService<SecurityLoginLog>('/api/careercloud/securityloginslog/v1/securityloginslog');

// Company Services
export const companyProfileService = createCrudService<CompanyProfile>('/api/careercloud/companyprofile/v1/companyprofile', 'company-profiles.json');
export const companyDescriptionService = createCrudService<CompanyDescription>('/api/careercloud/companydescription/v1/description', 'company-descriptions.json');
export const companyLocationService = createCrudService<CompanyLocation>('/api/careercloud/companylocation/v1/location', 'company-locations.json');
export const companyJobService = createCrudService<CompanyJob>('/api/careercloud/companyjob/v1/job', 'company-jobs.json');
export const companyJobDescriptionService = createCrudService<CompanyJobDescription>('/api/careercloud/companyjobdescription/v1/jobdescription', 'company-job-descriptions.json');
export const companyJobEducationService = createCrudService<CompanyJobEducation>('/api/careercloud/companyjobeducation/v1/jobeducation', 'company-job-education.json');
export const companyJobSkillService = createCrudService<CompanyJobSkill>('/api/careercloud/companyjobskill/v1/jobskill');

// Applicant Services
export const applicantProfileService = createCrudService<ApplicantProfile>('/api/careercloud/applicantprofile/v1/profile', 'applicant-profiles.json');
export const applicantEducationService = createCrudService<ApplicantEducation>('/api/careercloud/applicanteducation/v1/education', 'applicant-education.json');
export const applicantSkillService = createCrudService<ApplicantSkill>('/api/careercloud/applicantskill/v1/skill', 'applicant-skills.json');
export const applicantWorkHistoryService = createCrudService<ApplicantWorkHistory>('/api/careercloud/applicantworkhistory/v1/workhistory', 'applicant-work-history.json');
export const applicantResumeService = createCrudService<ApplicantResume>('/api/careercloud/applicantresume/v1/resume', 'applicant-resumes.json');
export const applicantJobApplicationService = createCrudService<ApplicantJobApplication>('/api/careercloud/applicantjobapplication/v1/job', 'applicant-job-applications.json');

// Export API error for error handling
export { ApiError };
