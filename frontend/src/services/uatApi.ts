import { API_CONFIG } from '../config/apiConfig';

const API_BASE_URL = API_CONFIG.BASE_URL;

export type UatFinalDecision =
  | 'READY_FOR_RELEASE'
  | 'READY_FOR_RELEASE_WITH_MINOR_ISSUES'
  | 'NOT_READY_FOR_RELEASE';

export type UatDefectSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type UatDefectStatus = 'OPEN' | 'IN_PROGRESS' | 'FIXED' | 'CLOSED';

export interface UatChecklist {
  id: number;
  hotelId: number | null;
  hotelName: string | null;
  testerName?: string;
  testEnvironment?: string;
  testDate?: string;
  buildVersion?: string;
  hotelTenantTested?: string;
  checklistItems: Record<string, boolean>;
  finalDecision?: UatFinalDecision;
  qaLead?: string;
  businessOwner?: string;
  productOwner?: string;
  approvalDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UatWorkspaceHotel {
  hotelId: number;
  hotelName: string;
  city?: string;
  country?: string;
}

export interface UatChecklistRequest {
  testerName?: string;
  testEnvironment?: string;
  testDate?: string;
  buildVersion?: string;
  hotelTenantTested?: string;
  checklistItems: Record<string, boolean>;
  finalDecision?: UatFinalDecision;
  qaLead?: string;
  businessOwner?: string;
  productOwner?: string;
  approvalDate?: string;
}

export interface UatDefect {
  id: number;
  defectId: string;
  hotelId: number | null;
  summary: string;
  testerDetail?: string;
  severity: UatDefectSeverity;
  blockingRelease: boolean;
  adminNotes?: string;
  fixDetails?: string;
  status: UatDefectStatus;
  createdByName?: string;
  updatedByName?: string;
  createdAt?: string;
  updatedAt?: string;
  resolvedAt?: string;
}

export interface UatDefectRequest {
  summary: string;
  testerDetail?: string;
  severity?: UatDefectSeverity;
  blockingRelease?: boolean;
  adminNotes?: string;
  fixDetails?: string;
  status?: UatDefectStatus;
}

async function fetchUat<T>(token: string, endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options?.headers || {}),
    },
  });

  if (!response.ok) {
    let message = 'Request failed';
    try {
      const errorBody = await response.json();
      message = errorBody.userFriendlyMessage || errorBody.message || errorBody.error || message;
    } catch {
      const text = await response.text();
      if (text) {
        message = text;
      }
    }
    throw new Error(message);
  }

  return response.json();
}

export const uatApi = {
  getChecklist(token: string): Promise<UatChecklist> {
    return fetchUat<UatChecklist>(token, '/uat/checklist');
  },

  saveChecklist(token: string, request: UatChecklistRequest): Promise<UatChecklist> {
    return fetchUat<UatChecklist>(token, '/uat/checklist', {
      method: 'PUT',
      body: JSON.stringify(request),
    });
  },

  getDefects(token: string): Promise<UatDefect[]> {
    return fetchUat<UatDefect[]>(token, '/uat/defects');
  },

  createDefect(token: string, request: UatDefectRequest): Promise<UatDefect> {
    return fetchUat<UatDefect>(token, '/uat/defects', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  updateDefect(token: string, defectId: number, request: UatDefectRequest): Promise<UatDefect> {
    return fetchUat<UatDefect>(token, `/uat/defects/${defectId}`, {
      method: 'PUT',
      body: JSON.stringify(request),
    });
  },

  getWorkspaceHotel(token: string): Promise<UatWorkspaceHotel> {
    return fetchUat<UatWorkspaceHotel>(token, '/uat/workspace-hotel');
  },

  getChecklistByHotel(token: string, hotelId: number): Promise<UatChecklist> {
    return fetchUat<UatChecklist>(token, `/uat/hotels/${hotelId}/checklist`);
  },

  saveChecklistByHotel(token: string, hotelId: number, request: UatChecklistRequest): Promise<UatChecklist> {
    return fetchUat<UatChecklist>(token, `/uat/hotels/${hotelId}/checklist`, {
      method: 'PUT',
      body: JSON.stringify(request),
    });
  },

  getDefectsByHotel(token: string, hotelId: number): Promise<UatDefect[]> {
    return fetchUat<UatDefect[]>(token, `/uat/hotels/${hotelId}/defects`);
  },

  createDefectByHotel(token: string, hotelId: number, request: UatDefectRequest): Promise<UatDefect> {
    return fetchUat<UatDefect>(token, `/uat/hotels/${hotelId}/defects`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  updateDefectByHotel(token: string, hotelId: number, defectId: number, request: UatDefectRequest): Promise<UatDefect> {
    return fetchUat<UatDefect>(token, `/uat/hotels/${hotelId}/defects/${defectId}`, {
      method: 'PUT',
      body: JSON.stringify(request),
    });
  },
};