// Entity interfaces based on CareerCloud database schema

// Base interface for entities with timestamp
export interface BaseEntity {
  id: string;
  timeStamp: string;
}

// System Entities
export interface SystemCountryCode {
  code: string;
  name: string;
}

export interface SystemLanguageCode {
  languageId: string;
  name: string;
  nativeName: string;
}

// Security Entities
export interface SecurityLogin extends BaseEntity {
  login: string;
  emailAddress: string;
  phoneNumber?: string;
  fullName: string;
  forceChangePassword: boolean;
  preferredLanguage: string;
}

export interface SecurityRole extends BaseEntity {
  role: string;
  isInactive: boolean;
}

export interface SecurityLoginRole extends BaseEntity {
  login: string;
  role: string;
}

export interface SecurityLoginLog extends BaseEntity {
  login: string;
  sourceIp: string;
  logonDate: string;
  isSuccessful: boolean;
}

// Company Entities
export interface CompanyProfile extends BaseEntity {
  registrationDate: string;
  companyWebsite?: string;
  contactPhone?: string;
  contactName?: string;
  companyLogo?: string;
}

export interface CompanyDescription extends BaseEntity {
  company: string;
  languageId: string;
  companyName: string;
  companyDescription: string;
}

export interface CompanyLocation extends BaseEntity {
  company: string;
  countryCode: string;
  stateProvinceCode?: string;
  streetAddress?: string;
  cityTown?: string;
  zipPostalCode?: string;
}

export interface CompanyJob extends BaseEntity {
  company: string;
  profileCreated: string;
  isActive: boolean;
  isCompanyHidden: boolean;
}

export interface CompanyJobDescription extends BaseEntity {
  job: string;
  jobName: string;
  jobDescriptions: string;
}

export interface CompanyJobEducation extends BaseEntity {
  job: string;
  major: string;
  importance: string;
}

export interface CompanyJobSkill extends BaseEntity {
  job: string;
  skill: string;
  skillLevel: string;
  importance: string;
}

// Applicant Entities
export interface ApplicantProfile extends BaseEntity {
  login: string;
  currentSalary?: number;
  currentRate?: number;
  currency?: string;
  countryCode: string;
  stateProvinceCode?: string;
  streetAddress?: string;
  cityTown?: string;
  zipPostalCode?: string;
}

export interface ApplicantEducation extends BaseEntity {
  applicant: string;
  major?: string;
  minor?: string;
  schoolDiploma?: string;
  startDate?: string;
  completionDate?: string;
  completionPercent?: number;
}

export interface ApplicantSkill extends BaseEntity {
  applicant: string;
  skill: string;
  skillLevel: string;
  startMonth?: number;
  endMonth?: number;
  startYear?: number;
  endYear?: number;
}

export interface ApplicantWorkHistory extends BaseEntity {
  applicant: string;
  companyName: string;
  countryCode: string;
  location?: string;
  jobTitle: string;
  jobDescription?: string;
  startMonth: number;
  startYear: number;
  endMonth?: number;
  endYear?: number;
}

export interface ApplicantResume extends BaseEntity {
  applicant: string;
  resume: string;
  lastUpdated: string;
}

export interface ApplicantJobApplication extends BaseEntity {
  applicant: string;
  job: string;
  applicationDate: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
}

export interface UserSession {
  login: SecurityLogin;
  roles: string[];
  token: string;
}

// Navigation Types
export interface NavigationItem {
  label: string;
  href: string;
  icon: string;
  roles?: string[];
  children?: NavigationItem[];
}

// Filter and Search Types
export interface SearchFilters {
  searchTerm?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
  [key: string]: any;
}
