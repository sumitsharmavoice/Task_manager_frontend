import api from "./api";

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: boolean;
  userId: string;
  createdAt: string;
}

export interface TasksQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: "true" | "false" | "";
}

export interface CreateTaskData {
  title: string;
  description?: string;
}

export const tasksApi = {
  list: (params: TasksQuery = {}) =>
    api.get<Task[]>("/tasks", { params }),

  create: (data: CreateTaskData) =>
    api.post<Task>("/tasks", data),

  getById: (id: string) =>
    api.get<Task>(`/tasks/${id}`),

  update: (id: string, data: Partial<CreateTaskData>) =>
    api.patch<Task>(`/tasks/${id}`, data),

  delete: (id: string) =>
    api.delete(`/tasks/${id}`),

  toggle: (id: string) =>
    api.patch<Task>(`/tasks/${id}/toggle`),
};
