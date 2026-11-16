export type MaintenanceCategory =
  | 'ELECTRICITY'
  | 'PLUMBING'
  | 'INTERNET'
  | 'AIR_CONDITIONER'
  | 'FURNITURE'
  | 'CLEANING'
  | 'OTHER';

export type MaintenancePriority = 'LOW' | 'MEDIUM' | 'HIGH';

export type AiClassificationStatus =
  | 'NOT_REQUESTED'
  | 'CLASSIFIED'
  | 'NEEDS_INFORMATION'
  | 'INVALID'
  | 'UNAVAILABLE';

export type MaintenanceStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';

export interface Classification {
  category: MaintenanceCategory;
  priority: MaintenancePriority;
  summary: string;
  missing_information: string[];
  confidence: number;
}

export interface MaintenancePreviewRequest {
  room_id: string;
  original_description: string;
}

export interface MaintenancePreviewResponse {
  room_id: string;
  original_description: string;
  ai_classification_status: AiClassificationStatus;
  classification: Classification | null;
  preview_token: string;
  expires_at: string;
}

export interface MaintenanceCreateRequest {
  room_id: string;
  original_description: string;
  submission_key: string;
  preview_token?: string | null;
}

export interface MaintenanceStatusUpdateRequest {
  status: 'PROCESSING' | 'COMPLETED' | 'CANCELLED';
  cancellation_reason?: string | null;
}

export interface MaintenanceClassifyRequest {
  additional_information?: string;
}

export interface Maintenance {
  id: string;
  room_id: string;
  original_description: string;
  category: MaintenanceCategory | null;
  priority: MaintenancePriority | null;
  ai_summary: string | null;
  ai_confidence: number | null;
  ai_missing_information: string[];
  ai_classification_status: AiClassificationStatus;
  status: MaintenanceStatus;
  cancellation_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface MaintenanceFilterParams {
  room_id?: string;
  status?: string;
  priority?: string;
  page?: number;
  page_size?: number;
}
