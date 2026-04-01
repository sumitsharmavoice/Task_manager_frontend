import api from "./api";

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

export interface RegisterResponse {
  id: string;
  email: string;
  createdAt: string;
}

export const authApi = {
  register: (data: LoginData) =>
    api.post<RegisterResponse>("/auth/register", data),

  login: (data: LoginData) =>
    api.post<AuthResponse>("/auth/login", data),

  refresh: (refreshToken: string) =>
    api.post<AuthResponse>("/auth/refresh", { refreshToken }),

  logout: () =>
    api.post("/auth/logout"),
};
