'use client'

import { useState, useEffect, useRef } from 'react'
import { ArrowLeft, Send } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  sender_id: string
  sender_name: string
  content: string
  created_at: string
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
}

function formatDay(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })
}

export default function ChatClient({ roomId, roomTitle, roomType, initialMessages, userId, userName }: {
  roomId: string
  roomTitle: string
  roomType: string
  initialMessages: Message[]
  userId: string
  userName: string
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'instant' })
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`chat_room_${roomId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `room_id=eq.${roomId}`,
      }, (payload) => {
        const msg = payload.new as Message
        setMessages(prev => prev.some(m => m.id === msg.id) ? prev : [...prev, msg])
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [roomId])

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    const content = input.trim()
    if (!content || sending) return
    setSending(true)
    setInput('')
    const supabase = createClient()
    await supabase.from('chat_messages').insert({
      room_id: roomId,
      sender_id: userId,
      sender_name: userName,
      content,
    })
    setSending(false)
    inputRef.current?.focus()
  }

  // Group messages by day
  let lastDay = ''

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] -my-6 -mx-4">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card shrink-0">
        <button onClick={() => window.history.back()} className={buttonVariants({ variant: 'ghost', size: 'icon' })}>
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-bold truncate">{roomTitle}</h1>
          <p className="text-xs text-muted-foreground">{roomType === 'sport' ? '스포츠 매치 채팅' : '공모전 팀 채팅'}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-1">
        {messages.length === 0 && (
          <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
            첫 메시지를 보내보세요! 👋
          </div>
        )}

        {messages.map((msg, i) => {
          const isMine = msg.sender_id === userId
          const day = formatDay(msg.created_at)
          const showDay = day !== lastDay
          if (showDay) lastDay = day

          const prevMsg = messages[i - 1]
          const nextMsg = messages[i + 1]
          const sameAsPrev = prevMsg && prevMsg.sender_id === msg.sender_id && formatDay(prevMsg.created_at) === day
          const sameAsNext = nextMsg && nextMsg.sender_id === msg.sender_id && formatDay(nextMsg.created_at) === day

          return (
            <div key={msg.id}>
              {showDay && (
                <div className="flex items-center gap-2 my-3">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs text-muted-foreground px-2">{day}</span>
                  <div className="flex-1 h-px bg-border" />
                </div>
              )}
              <div className={cn('flex items-end gap-2', isMine ? 'flex-row-reverse' : 'flex-row', sameAsNext ? 'mb-0.5' : 'mb-2')}>
                {/* Avatar placeholder */}
                {!isMine && (
                  <div className={cn('w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0', sameAsNext ? 'invisible' : '')}>
                    {msg.sender_name[0]}
                  </div>
                )}

                <div className={cn('flex flex-col gap-0.5 max-w-[70%]', isMine ? 'items-end' : 'items-start')}>
                  {!isMine && !sameAsPrev && (
                    <span className="text-xs text-muted-foreground px-1">{msg.sender_name}</span>
                  )}
                  <div className="flex items-end gap-1.5">
                    {isMine && !sameAsNext && (
                      <span className="text-[10px] text-muted-foreground/60 shrink-0 mb-0.5">{formatTime(msg.created_at)}</span>
                    )}
                    <div className={cn(
                      'px-3 py-2 text-sm leading-relaxed',
                      isMine
                        ? 'bg-primary text-primary-foreground rounded-2xl rounded-tr-sm'
                        : 'bg-muted rounded-2xl rounded-tl-sm'
                    )}>
                      {msg.content}
                    </div>
                    {!isMine && !sameAsNext && (
                      <span className="text-[10px] text-muted-foreground/60 shrink-0 mb-0.5">{formatTime(msg.created_at)}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="flex gap-2 px-4 py-3 border-t border-border bg-card shrink-0">
        <Input
          ref={inputRef}
          placeholder="메시지를 입력하세요..."
          value={input}
          onChange={e => setInput(e.target.value)}
          className="flex-1"
          autoComplete="off"
        />
        <Button type="submit" size="icon" disabled={!input.trim() || sending}>
          <Send size={16} />
        </Button>
      </form>
    </div>
  )
}
