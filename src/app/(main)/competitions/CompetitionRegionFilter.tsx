'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'

const REGIONS = [
  { value: '', label: '전체' },
  { value: '충북', label: '충북' },
  { value: '충남', label: '충남' },
  { value: '대전', label: '대전' },
  { value: '세종', label: '세종' },
  { value: '전국', label: '전국' },
]

export default function CompetitionRegionFilter({ current }: { current: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function select(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set('region', value)
    else params.delete('region')
    router.push(`/competitions?${params.toString()}`)
  }

  return (
    <div className="flex gap-2 flex-wrap">
      {REGIONS.map(r => (
        <button
          key={r.value}
          onClick={() => select(r.value)}
          className={cn(
            'px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all',
            current === r.value
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-card border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
          )}
        >
          {r.label}
        </button>
      ))}
    </div>
  )
}
