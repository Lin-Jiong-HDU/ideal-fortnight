import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 解析 JWT token 获取 payload
 * 注意：不验证签名，仅用于前端获取角色信息
 * 实际权限验证由后端负责
 */
export function parseJWT(token: string): { sub?: string; role?: string; exp?: number } | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;

    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

/**
 * 用户数据类型守卫
 */
function isValidUser(value: unknown): value is { id: string; email: string; name: string; role: string; createdAt: string } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'email' in value &&
    'name' in value &&
    'role' in value &&
    'createdAt' in value
  );
}

/**
 * 安全的 localStorage 读取，带类型验证
 */
export function safeGetItem<T>(key: string, validator?: (value: unknown) => value is T): T | null {
  if (typeof window === 'undefined') return null;

  try {
    const item = localStorage.getItem(key);
    if (!item) return null;

    const parsed = JSON.parse(item);
    return validator && validator(parsed) ? parsed : (parsed as T);
  } catch {
    // 数据损坏，清除并返回 null
    localStorage.removeItem(key);
    return null;
  }
}

/**
 * 安全的 localStorage 写入
 */
export function safeSetItem(key: string, value: unknown): boolean {
  if (typeof window === 'undefined') return false;

  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

/**
 * 安全的 localStorage 删除
 */
export function safeRemoveItem(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(key);
  } catch {
    // 静默失败
  }
}

export { isValidUser };
