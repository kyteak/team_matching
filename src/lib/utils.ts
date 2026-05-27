import { format, differenceInDays } from 'date-fns'
import { ko } from 'date-fns/locale'

export function formatDate(date: string | Date) {
  return format(new Date(date), 'yyyy년 MM월 dd일 HH:mm', { locale: ko })
}

export function formatDateOnly(date: string | Date) {
  return format(new Date(date), 'yyyy년 MM월 dd일', { locale: ko })
}

export function canChangePassword(passwordChangedAt: string): boolean {
  const daysSince = differenceInDays(new Date(), new Date(passwordChangedAt))
  return daysSince >= 30
}

export function isToday(date: string | Date): boolean {
  const d = new Date(date)
  const today = new Date()
  return (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  )
}

export const SKILL_LEVELS = [
  { value: 'beginner', label: '이제 막 시작했어요 🌱' },
  { value: 'novice', label: '좀 해봤어요 😊' },
  { value: 'intermediate', label: '꽤 잘해요 💪' },
  { value: 'advanced', label: '진짜 잘해요 🔥' },
]

export const SPORT_PLAYERS: Record<string, string[]> = {
  '축구': ['11명'],
  '풋살': ['5명', '6명', '7명'],
  '농구': ['1vs1', '3vs3', '5vs5'],
  '테니스': ['1vs1', '2vs2'],
  '배드민턴': ['1vs1', '2vs2'],
}
