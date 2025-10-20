// src/api/tasks.ts
import type { Task, TaskExecution } from '../types';
import { http } from './client';


export const TasksApi = {
list: () => http.get<Task[]>('/tasks'),
getById: (id: string) => http.get<Task>(`/tasks?id=${encodeURIComponent(id)}`),
searchByName: (q: string) => http.get<Task[]>(`/tasks/search?name=${encodeURIComponent(q)}`),
upsert: (task: Task) => http.put<Task>('/tasks', task),
remove: (id: string) => http.del<void>(`/tasks/${encodeURIComponent(id)}`),
run: (id: string) => http.put<TaskExecution>(`/tasks/${encodeURIComponent(id)}/executions`)
};