import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}

export function formatDateOnly(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

export function canChangePassword(passwordChangedAt: string | null | undefined): boolean {
  if (!passwordChangedAt) return true
  const last = new Date(passwordChangedAt)
  const now = new Date()
  const diffDays = (now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24)
  return diffDays >= 30
}

export function isToday(dateStr: string): boolean {
  const d = new Date(dateStr)
  const now = new Date()
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate()
}

export const SKILL_LEVELS = [
  { value: 'beginner', label: '🌱 입문 (처음 해보는 수준)' },
  { value: 'amateur', label: '📚 아마추어 (취미로 즐기는 수준)' },
  { value: 'intermediate', label: '💪 중급 (어느 정도 실력 있는 수준)' },
  { value: 'advanced', label: '🔥 상급 (동호회 활동 수준)' },
]

export const SPORT_PLAYERS: Record<string, string[]> = {
  '축구': ['11 vs 11', '8 vs 8', '6 vs 6'],
  '풋살': ['5 vs 5', '6 vs 6', '7 vs 7'],
  '농구': ['5 vs 5', '3 vs 3'],
  '테니스': ['단식 (1 vs 1)', '복식 (2 vs 2)'],
  '배드민턴': ['단식 (1 vs 1)', '복식 (2 vs 2)'],
}
