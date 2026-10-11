import { apiFetch } from "../lib/api";
import type { LoginInput, RegisterInput, User } from "../types/auth";

export function register(input: RegisterInput, signal?: AbortSignal): Promise<User> {
  return apiFetch<User>("/api/auth/register/", {
    method: "POST",
    body: JSON.stringify(input),
    signal,
  });
}


export function login(input: LoginInput, signal?: AbortSignal): Promise<User> {
  return apiFetch<User>("/api/auth/login/", {
    method: "POST",
    body: JSON.stringify(input),
    signal,
  });
}

export function logout(signal?: AbortSignal): Promise<{ message: string }> {
  return apiFetch<{ message: string }>("/api/auth/logout/", {
    method: "POST",
    signal,
  });
}


export function refreshSession(signal?: AbortSignal): Promise<User> {
  return apiFetch<User>("/api/auth/refresh/", {
    method: "POST",
    signal,
  });
}

export function getCurrentUser(signal?: AbortSignal): Promise<User> {
  return apiFetch<User>("/api/auth/me/", { method: "GET", signal });
}
