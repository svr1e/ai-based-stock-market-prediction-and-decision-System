import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatNumber(value: number, decimals = 2): string {
  if (Math.abs(value) >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
  if (Math.abs(value) >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
  if (Math.abs(value) >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
  return value.toFixed(decimals);
}

export function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

export function formatTime(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(new Date(date));
}

export function getChangeColor(value: number): string {
  if (value > 0) return 'text-neon-green';
  if (value < 0) return 'text-red-400';
  return 'text-gray-400';
}

export function getChangeBg(value: number): string {
  if (value > 0) return 'bg-green-500/10 text-neon-green border-green-500/20';
  if (value < 0) return 'bg-red-500/10 text-red-400 border-red-500/20';
  return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
}

export function generateSparklineData(base: number, points = 20): number[] {
  const data = [base];
  for (let i = 1; i < points; i++) {
    const change = (Math.random() - 0.48) * base * 0.02;
    data.push(Math.max(0, data[i - 1] + change));
  }
  return data;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
