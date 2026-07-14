import type {
  AuthUser,
  CareLogEntry,
  CareRequest,
  ContractInfo,
  PatientInfo,
  PublicNurse,
  Role,
  WalletSummary,
} from "./apiTypes";

const TOKEN_KEY = "carelink_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`/api${path}`, { ...options, headers });
  const isJson = res.headers.get("content-type")?.includes("application/json");
  const body = isJson ? await res.json() : null;

  if (!res.ok) {
    throw new ApiError(body?.error || `Request failed with status ${res.status}`);
  }
  return body as T;
}

export const authApi = {
  signup: (data: { name: string; email: string; password: string; role: Role }) =>
    apiFetch<{ token: string; user: AuthUser }>("/auth/signup", { method: "POST", body: JSON.stringify(data) }),
  login: (data: { email: string; password: string }) =>
    apiFetch<{ token: string; user: AuthUser }>("/auth/login", { method: "POST", body: JSON.stringify(data) }),
  me: () => apiFetch<{ user: AuthUser }>("/auth/me"),
};

export const nursesApi = {
  list: () => apiFetch<{ nurses: PublicNurse[] }>("/nurses"),
  get: (id: string) => apiFetch<{ nurse: PublicNurse }>(`/nurses/${id}`),
};

export const requestsApi = {
  create: (data: { nurseId: string; patientInfo: PatientInfo }) =>
    apiFetch<{ request: CareRequest }>("/requests", { method: "POST", body: JSON.stringify(data) }),
  mine: () => apiFetch<{ requests: CareRequest[] }>("/requests/mine"),
  get: (id: string) => apiFetch<{ request: CareRequest }>(`/requests/${id}`),
  accept: (id: string) => apiFetch<{ request: CareRequest }>(`/requests/${id}/accept`, { method: "POST" }),
  decline: (id: string) => apiFetch<{ request: CareRequest }>(`/requests/${id}/decline`, { method: "POST" }),
};

export const contractsApi = {
  getByRequest: (requestId: string) =>
    apiFetch<{ contract: ContractInfo; request: CareRequest }>(`/contracts/by-request/${requestId}`),
  sign: (contractId: string, signatureName: string) =>
    apiFetch<{ contract: ContractInfo; request: CareRequest }>(`/contracts/${contractId}/sign`, {
      method: "POST",
      body: JSON.stringify({ signatureName }),
    }),
};

export const walletApi = {
  get: () => apiFetch<WalletSummary>("/wallet"),
  deposit: (data: { amount: number; card: { number: string; expiry: string; cvc: string; name: string } }) =>
    apiFetch<WalletSummary>("/wallet/deposit", { method: "POST", body: JSON.stringify(data) }),
  fundEscrow: (data: { requestId: string; amount: number }) =>
    apiFetch<WalletSummary>("/wallet/fund-escrow", { method: "POST", body: JSON.stringify(data) }),
  release: (data: { requestId: string; amount: number }) =>
    apiFetch<WalletSummary>("/wallet/release", { method: "POST", body: JSON.stringify(data) }),
  withdraw: (data: { amount: number }) =>
    apiFetch<WalletSummary>("/wallet/withdraw", { method: "POST", body: JSON.stringify(data) }),
};

export const careLogApi = {
  list: (requestId: string) => apiFetch<{ entries: CareLogEntry[] }>(`/care-log/${requestId}`),
  create: (requestId: string, data: Partial<CareLogEntry>) =>
    apiFetch<{ entry: CareLogEntry }>(`/care-log/${requestId}`, { method: "POST", body: JSON.stringify(data) }),
  update: (entryId: string, data: Partial<CareLogEntry>) =>
    apiFetch<{ entry: CareLogEntry }>(`/care-log/entry/${entryId}`, { method: "PATCH", body: JSON.stringify(data) }),
};
