import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Bot, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const SUGGESTIONS = [
  'Как добавить нового клиента?',
  'Как анализировать выручку?',
  'Советы по удержанию клиентов',
  'Как настроить услуги?',
]

export function AiAssistant() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const sendMessage = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || loading) return
    setInput('')
    const next: Message[] = [...messages, { role: 'user', content: trimmed }]
    setMessages(next)
    setLoading(true)
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: next }),
        }
      )
      const data = await res.json()
      if (data.error) {
        toast.error(data.error)
        return
      }
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
    } catch {
      toast.error('Ошибка связи с AI')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            key="fab"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-24 right-4 md:bottom-6 md:right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-xl"
            style={{ background: 'linear-gradient(135deg,#f0b429,#ff8c00)', boxShadow: '0 0 20px rgba(240,180,41,0.4)' }}
          >
            <MessageCircle className="w-6 h-6 text-black" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-4 md:bottom-6 md:right-6 z-50 w-[calc(100vw-2rem)] max-w-sm flex flex-col rounded-2xl overflow-hidden shadow-2xl"
            style={{ height: '480px', background: 'oklch(0.14 0.012 265)', border: '1px solid var(--border)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/50"
              style={{ background: 'linear-gradient(135deg, rgba(240,180,41,0.1), rgba(255,140,0,0.05))' }}>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg,#f0b429,#ff8c00)' }}>
                  <Bot className="w-4 h-4 text-black" />
                </div>
                <div>
                  <p className="text-sm font-bold">FlowDesk AI</p>
                  <p className="text-xs text-muted-foreground">Помощник</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {messages.length === 0 ? (
                <div className="space-y-4">
                  <div className="flex gap-2 items-start">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: 'linear-gradient(135deg,#f0b429,#ff8c00)' }}>
                      <Bot className="w-3.5 h-3.5 text-black" />
                    </div>
                    <div className="rounded-2xl rounded-tl-sm px-3 py-2 text-sm max-w-[85%]"
                      style={{ background: 'oklch(0.20 0.012 265)' }}>
                      Привет! Я AI-ассистент FlowDesk. Помогу с управлением бизнесом, советами и работой с приложением.
                    </div>
                  </div>
                  <div className="pl-8 space-y-1.5">
                    <p className="text-xs text-muted-foreground mb-2">Популярные вопросы:</p>
                    {SUGGESTIONS.map(s => (
                      <button key={s} onClick={() => sendMessage(s)}
                        className="block w-full text-left text-xs px-3 py-2 rounded-xl border border-border/50 hover:border-primary/40 hover:bg-primary/5 transition-all duration-150 text-muted-foreground hover:text-foreground">
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((m, i) => (
                  <div key={i} className={`flex gap-2 items-start ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    {m.role === 'assistant' && (
                      <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                        style={{ background: 'linear-gradient(135deg,#f0b429,#ff8c00)' }}>
                        <Bot className="w-3.5 h-3.5 text-black" />
                      </div>
                    )}
                    <div className={`rounded-2xl px-3 py-2 text-sm max-w-[85%] whitespace-pre-wrap ${
                      m.role === 'user'
                        ? 'rounded-tr-sm text-black'
                        : 'rounded-tl-sm'
                    }`}
                      style={m.role === 'user'
                        ? { background: 'linear-gradient(135deg,#f0b429,#ff8c00)' }
                        : { background: 'oklch(0.20 0.012 265)' }}>
                      {m.content}
                    </div>
                  </div>
                ))
              )}
              {loading && (
                <div className="flex gap-2 items-start">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: 'linear-gradient(135deg,#f0b429,#ff8c00)' }}>
                    <Bot className="w-3.5 h-3.5 text-black" />
                  </div>
                  <div className="rounded-2xl rounded-tl-sm px-3 py-2.5" style={{ background: 'oklch(0.20 0.012 265)' }}>
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="flex gap-2 p-3 border-t border-border/50">
              <Input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Задайте вопрос..."
                className="flex-1 text-sm h-9"
                disabled={loading}
                autoComplete="off"
              />
              <Button type="submit" size="icon" disabled={!input.trim() || loading}
                style={{ background: 'linear-gradient(135deg,#f0b429,#ff8c00)', color: '#000' }}
                className="w-9 h-9 shrink-0">
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
