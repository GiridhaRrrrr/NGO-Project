export type UserRole = "user" | "ngo" | "admin";

export type RequestCategory = "Medical" | "Financial" | "Education" | "Disaster";

export type RequestStatus = "Submitted" | "Verified" | "Accepted" | "Completed" | "Rejected";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  city?: string;
  lat?: number;
  lng?: number;
  organization?: string;
}

export interface HelpRequest {
  id: string;
  userId: string;
  userName: string;
  category: RequestCategory;
  status: RequestStatus;
  lat: number;
  lng: number;
  description: string;
  contact: string;
  imageUrl?: string;
  createdAt: string;
  priorityScore: number;
  assignedNgoId?: string;
  documents?: string[];
}

export interface AnalyticsData {
  categoryBreakdown: { category: string; count: number }[];
  statusBreakdown: { status: string; count: number }[];
  monthlyRequests: { month: string; count: number }[];
  avgResponseTime: number;
  totalRequests: number;
  activeNgos: number;
}
