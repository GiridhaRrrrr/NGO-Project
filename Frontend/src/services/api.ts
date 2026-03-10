// import type { HelpRequest, User, AnalyticsData, RequestStatus, RequestCategory } from "@/types";

// // Mock data
// const mockUsers: User[] = [
//   { id: "u1", name: "Rahul Sharma", email: "rahul@example.com", role: "user", city: "Mumbai", lat: 19.076, lng: 72.8777 },
//   { id: "n1", name: "Hope Foundation", email: "hope@ngo.org", role: "ngo", city: "Mumbai", lat: 19.05, lng: 72.88, organization: "Hope Foundation" },
//   { id: "a1", name: "Admin User", email: "admin@platform.org", role: "admin" },
// ];

// const mockRequests: HelpRequest[] = [
//   { id: "r1", userId: "u1", userName: "Rahul Sharma", category: "Medical", status: "Submitted", lat: 19.076, lng: 72.8777, description: "Need urgent medical supplies for elderly family member.", contact: "+91-9876543210", createdAt: "2026-02-28T10:30:00Z", priorityScore: 85 },
//   { id: "r2", userId: "u1", userName: "Priya Patel", category: "Education", status: "Verified", lat: 19.12, lng: 72.85, description: "Scholarship needed for 2 children to continue school.", contact: "+91-9876543211", createdAt: "2026-02-25T08:15:00Z", priorityScore: 72 },
//   { id: "r3", userId: "u1", userName: "Anil Kumar", category: "Financial", status: "Accepted", lat: 19.03, lng: 72.84, description: "Lost livelihood due to flooding. Need financial assistance.", contact: "+91-9876543212", createdAt: "2026-02-20T14:00:00Z", priorityScore: 90, assignedNgoId: "n1" },
//   { id: "r4", userId: "u1", userName: "Meena Devi", category: "Disaster", status: "Completed", lat: 19.09, lng: 72.90, description: "House damaged in cyclone, need shelter assistance.", contact: "+91-9876543213", createdAt: "2026-02-15T09:00:00Z", priorityScore: 95, assignedNgoId: "n1" },
//   { id: "r5", userId: "u1", userName: "Suresh Yadav", category: "Medical", status: "Submitted", lat: 19.06, lng: 72.87, description: "Require wheelchair for disabled child.", contact: "+91-9876543214", createdAt: "2026-03-01T11:00:00Z", priorityScore: 78 },
//   { id: "r6", userId: "u1", userName: "Fatima Begum", category: "Financial", status: "Submitted", lat: 19.10, lng: 72.89, description: "Need microfinance support for small business.", contact: "+91-9876543215", createdAt: "2026-03-02T16:30:00Z", priorityScore: 65 },
// ];

// const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// // Auth
// export async function registerUser(data: Partial<User>): Promise<User> {
//   await delay(500);
//   return { id: "new-" + Date.now(), ...data } as User;
// }

// export async function loginUser(_email: string, _password: string, role: string): Promise<User> {
//   await delay(400);
//   const user = mockUsers.find(u => u.role === role);
//   if (!user) throw new Error("User not found");
//   return user;
// }

// // Requests
// export async function submitRequest(data: Partial<HelpRequest>): Promise<HelpRequest> {
//   await delay(600);
//   const newReq: HelpRequest = {
//     id: "r" + Date.now(),
//     userId: "u1",
//     userName: "Current User",
//     category: data.category || "Medical",
//     status: "Submitted",
//     lat: data.lat || 19.076,
//     lng: data.lng || 72.8777,
//     description: data.description || "",
//     contact: data.contact || "",
//     imageUrl: data.imageUrl,
//     createdAt: new Date().toISOString(),
//     priorityScore: Math.floor(Math.random() * 40) + 60,
//   };
//   mockRequests.push(newReq);
//   return newReq;
// }

// export async function getUserRequests(_userId: string): Promise<HelpRequest[]> {
//   await delay(300);
//   return [...mockRequests];
// }

// export async function getPendingRequests(): Promise<HelpRequest[]> {
//   await delay(300);
//   return mockRequests.filter(r => r.status === "Submitted");
// }

// export async function verifyRequest(id: string, approved: boolean): Promise<HelpRequest> {
//   await delay(400);
//   const req = mockRequests.find(r => r.id === id);
//   if (!req) throw new Error("Request not found");
//   req.status = approved ? "Verified" : "Rejected";
//   return req;
// }

// export async function getNearbyRequests(_city: string): Promise<HelpRequest[]> {
//   await delay(300);
//   return mockRequests.filter(r => r.status === "Verified");
// }

// export async function updateRequestStatus(id: string, status: RequestStatus): Promise<HelpRequest> {
//   await delay(400);
//   const req = mockRequests.find(r => r.id === id);
//   if (!req) throw new Error("Request not found");
//   req.status = status;
//   return req;
// }

// export async function getAnalytics(): Promise<AnalyticsData> {
//   await delay(500);
//   return {
//     categoryBreakdown: [
//       { category: "Medical", count: 42 },
//       { category: "Financial", count: 35 },
//       { category: "Education", count: 28 },
//       { category: "Disaster", count: 19 },
//     ],
//     statusBreakdown: [
//       { status: "Submitted", count: 30 },
//       { status: "Verified", count: 25 },
//       { status: "Accepted", count: 40 },
//       { status: "Completed", count: 29 },
//     ],
//     monthlyRequests: [
//       { month: "Sep", count: 15 },
//       { month: "Oct", count: 22 },
//       { month: "Nov", count: 18 },
//       { month: "Dec", count: 30 },
//       { month: "Jan", count: 25 },
//       { month: "Feb", count: 32 },
//     ],
//     avgResponseTime: 4.2,
//     totalRequests: 124,
//     activeNgos: 18,
//   };
// }

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

// Mock data (Kept for development fallback)
const mockRequests: HelpRequest[] = [
  { id: "r1", userId: "u1", userName: "Rahul Sharma", category: "Medical", status: "Submitted", lat: 19.076, lng: 72.8777, description: "Need urgent medical supplies.", contact: "+91-9876543210", createdAt: "2026-02-28T10:30:00Z", priorityScore: 85 },
  { id: "r2", userId: "u1", userName: "Priya Patel", category: "Education", status: "Verified", lat: 19.12, lng: 72.85, description: "Scholarship needed for school.", contact: "+91-9876543211", createdAt: "2026-02-25T08:15:00Z", priorityScore: 72 },
];

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// --- Auth APIs ---

export async function registerUser(data: Partial<User>): Promise<User> {
  if (isMockMode) {
    await delay(500);
    return { id: "new-" + Date.now(), ...data } as User;
  }
  const response = await api.post("/auth/register", data);
  return response.data;
}

export async function loginUser(email: string, password: string, role: string): Promise<User> {
  if (isMockMode) {
    await delay(400);
    return { id: "u1", name: "Rahul Sharma", email, role } as User;
  }
  const response = await api.post("/auth/login", { email, password, role });
  return response.data;
}

export async function submitRequest(data: Partial<HelpRequest> | FormData): Promise<HelpRequest> {
  if (isMockMode) {
    await delay(600);
    const rawData = data instanceof FormData ? Object.fromEntries(data.entries()) : data;
    return {
      id: "r" + Date.now(),
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
    };
  }
  
  // Use multipart/form-data header if sending an image via FormData
  const config = data instanceof FormData ? { headers: { "Content-Type": "multipart/form-data" } } : {};
  const response = await api.post("/requests", data, config);
  return response.data;
}

export async function getUserRequests(userId: string): Promise<HelpRequest[]> {
  if (isMockMode) {
    await delay(300);
    return [...mockRequests];
  }
  const response = await api.get(`/requests/user/${userId}`);
  return response.data;
}

export async function getPendingRequests(): Promise<HelpRequest[]> {
  if (isMockMode) {
    await delay(300);
    return mockRequests.filter(r => r.status === "Submitted");
  }
  const response = await api.get("/admin/requests/pending");
  return response.data;
}

export async function verifyRequest(id: string, approved: boolean): Promise<HelpRequest> {
  if (isMockMode) {
    await delay(400);
    const req = mockRequests.find(r => r.id === id);
    if (!req) throw new Error("Request not found");
    req.status = approved ? "Verified" : "Rejected";
    return req;
  }
  const response = await api.patch(`/admin/requests/${id}/verify`, { approved });
  return response.data;
}

export async function getNearbyRequests(city: string, lat?: number, lng?: number): Promise<HelpRequest[]> {
  if (isMockMode) {
    await delay(300);
    return mockRequests.filter(r => r.status === "Verified");
  }
  // Passing coordinates allows the backend to perform precise $near queries
  const response = await api.get("/ngo/requests/nearby", { params: { city, lat, lng } });
  return response.data;
}

export async function updateRequestStatus(id: string, status: RequestStatus): Promise<HelpRequest> {
  if (isMockMode) {
    await delay(400);
    const req = mockRequests.find(r => r.id === id);
    if (!req) throw new Error("Request not found");
    req.status = status;
    return req;
  }
  const response = await api.patch(`/requests/${id}/status`, { status });
  return response.data;
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