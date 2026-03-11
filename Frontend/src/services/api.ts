import axios from "axios";
import type { HelpRequest, User, AnalyticsData, RequestStatus, RequestCategory } from "@/types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";
const isMockMode = !API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 2. Response Interceptor: Handle expired or invalid tokens
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If the backend rejects the token, clear local storage and redirect to login
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      
      // We use window.location here because we are outside the React Router context
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);



// Mock data (Kept for development fallback)
const mockRequests: HelpRequest[] = [
  { id: "r1", userId: "u1", userName: "Rahul Sharma", category: "Medical", status: "Submitted", lat: 19.076, lng: 72.8777, description: "Need urgent medical supplies.", contact: "+91-9876543210", createdAt: "2026-02-28T10:30:00Z", priorityScore: 85 },
  { id: "r2", userId: "u1", userName: "Priya Patel", category: "Education", status: "Verified", lat: 19.12, lng: 72.85, description: "Scholarship needed for school.", contact: "+91-9876543211", createdAt: "2026-02-25T08:15:00Z", priorityScore: 72 },
];

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// --- Auth APIs ---

// --- Helper to map MongoDB data to Frontend Types ---
const transformRequest = (req: any): HelpRequest => ({
  ...req,
  id: req._id || req.id, // Map MongoDB _id to frontend id
  lat: req.location?.coordinates?.[1] || req.lat || 0, // Extract Latitude from GeoJSON [lng, lat]
  lng: req.location?.coordinates?.[0] || req.lng || 0, // Extract Longitude from GeoJSON
});

// --- Auth APIs ---

export async function registerUser(data: Partial<User>): Promise<User> {
  if (isMockMode) {
    await delay(500);
    return { id: "new-" + Date.now(), ...data } as User;
  }
  const response = await api.post("/auth/register", data);
  // Optional: transform user _id if needed
  return { ...response.data.user, token: response.data.token }; 
}

export async function loginUser(email: string, password: string, role: string): Promise<User> {
  if (isMockMode) {
    await delay(400);
    return { id: "u1", name: "Rahul Sharma", email, role } as User;
  }
  const response = await api.post("/auth/login", { email, password, role });
  return { ...response.data.user, token: response.data.token };
}

// --- Request APIs ---

export async function submitRequest(data: Partial<HelpRequest> | FormData): Promise<HelpRequest> {
  if (isMockMode) {
    await delay(600);
    const rawData = data instanceof FormData ? Object.fromEntries(data.entries()) : data;
    return transformRequest({
      _id: "r" + Date.now(),
      userId: "u1",
      userName: "Current User",
      category: (rawData.category as RequestCategory) || "Medical",
      status: "Submitted",
      lat: Number(rawData.lat) || 19.076,
      lng: Number(rawData.lng) || 72.8777,
      description: (rawData.description as string) || "",
      contact: (rawData.contact as string) || "",
      createdAt: new Date().toISOString(),
      priorityScore: 75,
    });
  }
  
  const config = data instanceof FormData ? { headers: { "Content-Type": "multipart/form-data" } } : {};
  const response = await api.post("/requests", data, config);
  return transformRequest(response.data);
}

export async function getUserRequests(userId: string): Promise<HelpRequest[]> {
  if (isMockMode) {
    await delay(300);
    return mockRequests.map(transformRequest);
  }
  const response = await api.get(`/requests/user/${userId}`);
  return response.data.map(transformRequest);
}

export async function getPendingRequests(): Promise<HelpRequest[]> {
  if (isMockMode) {
    await delay(300);
    return mockRequests.filter(r => r.status === "Submitted").map(transformRequest);
  }
  // FIXED URL: Removed /requests/ to match adminRoutes.js
  const response = await api.get("/admin/pending");
  return response.data.map(transformRequest);
}

export async function verifyRequest(id: string, approved: boolean): Promise<HelpRequest> {
  if (isMockMode) {
    await delay(400);
    const req = mockRequests.find(r => r.id === id);
    if (!req) throw new Error("Request not found");
    req.status = approved ? "Verified" : "Rejected";
    return transformRequest(req);
  }
  // FIXED URL: Removed /requests/ to match adminRoutes.js
  const response = await api.patch(`/admin/verify/${id}`, { approved });
  return transformRequest(response.data);
}

export async function getNearbyRequests(city: string, lat?: number, lng?: number): Promise<HelpRequest[]> {
  if (isMockMode) {
    await delay(300);
    return mockRequests.filter(r => r.status === "Verified").map(transformRequest);
  }
  // FIXED URL: Swapped /ngo/ for /requests/ to match requestRoutes.js
  const response = await api.get("/requests/nearby", { params: { city, lat, lng } });
  return response.data.map(transformRequest);
}

export async function getNgoTasks(): Promise<HelpRequest[]> {
  if (isMockMode) {
    await delay(300);
    return mockRequests.filter(r => r.status === "Accepted" || r.status === "Completed").map(transformRequest);
  }
  const response = await api.get("/requests/ngo-tasks");
  return response.data.map(transformRequest);
}

export async function updateRequestStatus(id: string, status: RequestStatus): Promise<HelpRequest> {
  if (isMockMode) {
    await delay(400);
    const req = mockRequests.find(r => r.id === id);
    if (!req) throw new Error("Request not found");
    req.status = status;
    return transformRequest(req);
  }
  const response = await api.patch(`/requests/${id}/status`, { status });
  return transformRequest(response.data);
}

// --- Analytics ---

export async function getAnalytics(): Promise<AnalyticsData> {
  if (isMockMode) {
    await delay(500);
    return {
      categoryBreakdown: [{ category: "Medical", count: 42 }, { category: "Financial", count: 35 }],
      statusBreakdown: [{ status: "Submitted", count: 30 }, { status: "Verified", count: 25 }],
      monthlyRequests: [{ month: "Jan", count: 25 }, { month: "Feb", count: 32 }],
      avgResponseTime: 4.2,
      totalRequests: 124,
      activeNgos: 18,
    };
  }
  const response = await api.get("/admin/analytics");
  return response.data;
}