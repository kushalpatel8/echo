import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatName(name: string | undefined | null, role?: string): string {
  if (!name) return '';
  const n = name.trim();
  if (role === 'doctor' && !n.toLowerCase().startsWith('dr.')) return `Dr. ${n}`;
  if (role === 'admin' && !n.toLowerCase().startsWith('admin')) return `Admin ${n}`;
  return n;
}
