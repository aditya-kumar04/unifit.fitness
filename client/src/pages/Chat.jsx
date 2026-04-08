import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '@iconify/react'
import Navbar from '../components/Navbar'
import { chatAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'

const REPLIES = ['Keep pushing.','Good. Stay consistent.','Noted. Adjusting the plan.','Discipline beats motivation every time.','Check your macros tonight.','That\'s the mindset. Keep it up.']

export default function Chat() {
  const { user, isAuthenticated } = useAuth()
  const [chats, setChats] = useState([])
  const [currentChat, setCurrentChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [voicePlaying, setVoicePlaying] = useState(false)
  const [loading, setLoading] = useState(true)
  const chatRef = useRef(null)

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="font-['DM_Sans'] bg-[#080304] text-[#F0F0F0] antialiased h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-lg mb-4">Please log in to access chat</div>
          <Link to="/login" className="bg-[#E63946] hover:bg-[#d62839] text-white font-medium py-2 px-4 rounded-lg transition-colors">
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  useEffect(() => {
    console.log('Chat component mounted, user:', user, 'isAuthenticated:', isAuthenticated);
    loadChats()
  }, [])

  useEffect(() => {
    if (currentChat) {
      loadChatMessages()
    }
  }, [currentChat])

  const loadChats = async () => {
    try {
      const response = await chatAPI.getChats()
      console.log('Chats loaded:', response.data);
      setChats(response.data.chats || [])
      if (response.data.chats?.length > 0) {
        const firstChatId = response.data.chats[0]._id;
        console.log('Setting current chat to:', firstChatId);
        setCurrentChat(firstChatId)
      }
    } catch (error) {
      console.error('Error loading chats:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadChatMessages = async () => {
    try {
      const response = await chatAPI.getChat(currentChat)
      setMessages(response.data.chat?.messages || [])
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  const scrollBottom = () => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight
  }

  useEffect(() => { scrollBottom() }, [messages, typing])

  const sendMessage = async (text) => {
    if (!text.trim() || !currentChat) {
      console.log('Cannot send message:', { text: text.trim(), currentChat, user: !!user });
      return
    }
    
    // Get user ID from either _id or id field
    const userId = user?._id || user?.id;
    if (!userId) {
      console.error('User not authenticated or missing user ID');
      return
    }
    
    try {
      console.log('Sending message:', { text, currentChat, userId });
      
      // Add message optimistically
      const tempMessage = {
        _id: Date.now().toString(),
        sender: { _id: userId, username: user.username },
        content: text,
        type: 'text',
        createdAt: new Date().toISOString()
      }
      
      setMessages(prev => [...prev, tempMessage])
      setInput('')
      
      // Send to backend
      const response = await chatAPI.sendMessage(currentChat, {
        content: text,
        type: 'text'
      })
      
      console.log('Message sent successfully:', response);
      
      // Reload messages to get proper format
      setTimeout(() => loadChatMessages(), 500)
    } catch (error) {
      console.error('Error sending message:', error)
      if (error.response?.status === 401) {
        console.error('Authentication error - token may be expired');
      }
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => msg._id !== tempMessage._id))
    }
  }

  const handleEnter = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input) }
  }

  return (
    <div className="font-['DM_Sans'] bg-[#080304] text-[#F0F0F0] antialiased h-screen flex flex-col selection:bg-[#E63946] selection:text-white overflow-hidden">
      <Navbar variant="app" />

      <div className="flex flex-1 overflow-hidden relative z-10 pt-[68px]">
        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 border-r border-[#161616] bg-[#050102] flex-shrink-0">
          <div className="px-4 py-3.5 border-b border-[#161616]">
            <div className="text-[11px] text-[#444] uppercase tracking-[0.2em]">Conversations</div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {loading ? (
              <div className="text-center text-[#555] text-xs py-4">Loading chats...</div>
            ) : chats.length === 0 ? (
              <div className="text-center text-[#555] text-xs py-4">No conversations yet</div>
            ) : (
              chats.map(chat => {
                const userId = user?._id || user?.id;
                const otherParticipant = chat.participants.find(p => p.user._id !== userId);
                const lastMessage = chat.messages[chat.messages.length - 1];
                const unreadCount = chat.messages.filter(m => m.sender._id !== userId && !m.isRead).length;
                
                return (
                  <div 
                    key={chat._id}
                    className={`bg-[#0F0D0E] border rounded-xl p-3.5 cursor-pointer transition-colors ${
                      currentChat === chat._id 
                        ? 'border-[#E63946]/30' 
                        : 'border-[#1A1A1A] hover:border-[#2a2a2a]'
                    }`}
                    onClick={() => setCurrentChat(chat._id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative flex-shrink-0">
                        <div className="w-9 h-9 rounded-full bg-[#E63946] flex items-center justify-center text-sm text-white font-normal">
                          {otherParticipant?.user?.profile?.firstName?.[0] || 'U'}
                        </div>
                        <div className="absolute -bottom-px -right-px w-2.5 h-2.5 bg-[#22c55e] rounded-full border-2 border-[#050102]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-white">
                          {otherParticipant?.user?.profile?.firstName 
                            ? `${otherParticipant.user.profile.firstName} ${otherParticipant.user.profile.lastName || ''}`
                            : otherParticipant?.user?.username || 'Unknown'
                          }
                        </div>
                        <div className="text-[10px] text-[#22c55e]">Online</div>
                      </div>
                      {unreadCount > 0 && (
                        <div className="w-4 h-4 bg-[#E63946] rounded-full text-[9px] text-white flex items-center justify-center flex-shrink-0">
                          {unreadCount}
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] text-[#444] truncate mt-2">
                      {lastMessage?.content || 'No messages yet'}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* Main chat */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Chat header */}
          <div className="flex-shrink-0 border-b border-[#161616] bg-[#080304] px-6 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-[#E63946] flex items-center justify-center">
                  <Icon icon="solar:user-linear" className="text-white text-base" />
                </div>
                <div className="absolute -bottom-px -right-px w-2.5 h-2.5 bg-[#22c55e] rounded-full border-2 border-[#080304]" />
              </div>
              <div>
                <div className="text-sm text-white font-normal">
                  {(() => {
                    const userId = user?._id || user?.id;
                    const currentChatData = chats.find(c => c._id === currentChat);
                    const otherParticipant = currentChatData?.participants.find(p => p.user._id !== userId);
                    return otherParticipant?.user?.profile?.firstName 
                      ? `${otherParticipant.user.profile.firstName} ${otherParticipant.user.profile.lastName || ''} (Coach)`
                      : otherParticipant?.user?.username || 'Coach';
                  })()}
                </div>
                <div className="text-xs text-[#22c55e] flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-[#22c55e] rounded-full" />
                  Online · replies in minutes
                </div>
              </div>
            </div>
            <Link to="/booking" className="border border-[#1A1A1A] hover:border-[#333] text-[#666] hover:text-white text-xs px-4 py-2 rounded-lg transition-all flex items-center gap-2">
              <Icon icon="solar:video-frame-linear" className="text-sm" /> Book Call
            </Link>
          </div>

          {/* Messages */}
          <div ref={chatRef} id="chat-messages" className="flex-1 overflow-y-auto p-5 space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-[#161616]" />
              <span className="text-[10px] text-[#333] uppercase tracking-widest">Today</span>
              <div className="flex-1 h-px bg-[#161616]" />
            </div>

            {currentChat ? (
            messages.map(msg => {
              const userId = user?._id || user?.id;
              const senderId = msg.sender?._id;
              const isMentor = senderId !== userId
              const isUser = senderId === userId
              const time = new Date(msg.createdAt).toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit',
                hour12: true 
              })

              if (msg.type === 'voice' && isMentor) {
                return (
                  <div key={msg._id} className="flex items-end gap-2.5 bubble-in">
                    <div className="w-7 h-7 rounded-full bg-[#E63946] flex items-center justify-center text-[10px] text-white flex-shrink-0">A</div>
                    <div className="max-w-sm">
                      <div className="bg-[#161616] p-3.5 rounded-2xl rounded-bl-sm">
                        <div className="flex items-center gap-3">
                          <button onClick={() => { setVoicePlaying(true); setTimeout(() => setVoicePlaying(false), 2800) }}
                            className="w-9 h-9 rounded-full bg-[#E63946] flex items-center justify-center hover:bg-[#c8313d] transition-colors flex-shrink-0">
                            <Icon icon={voicePlaying ? 'solar:pause-linear' : 'solar:play-linear'} className="text-white text-sm ml-px" />
                          </button>
                          <div className="flex items-end gap-0.5 h-7 flex-1">
                            {[35,80,55,100,65,45,70,35,88,50,42,60].map((h, i) => (
                              <div key={i} className="w-0.5 rounded-full" style={{ height: `${h}%`, background: i < 5 ? '#E63946' : '#444' }} />
                            ))}
                          </div>
                          <span className="text-[11px] text-[#555] flex-shrink-0">0:28</span>
                        </div>
                      </div>
                      <div className="text-[10px] text-[#333] mt-1 ml-1">{time} · Voice Note</div>
                    </div>
                  </div>
                )
              }
              
              if (isMentor) {
                return (
                  <div key={msg._id} className="flex items-end gap-2.5 bubble-in">
                    <div className="w-7 h-7 rounded-full bg-[#E63946] flex items-center justify-center text-[10px] text-white flex-shrink-0">A</div>
                    <div className="max-w-sm">
                      <div className="bg-[#161616] text-[#ccc] text-sm px-4 py-3 rounded-2xl rounded-bl-sm leading-relaxed">{msg.content}</div>
                      <div className="text-[10px] text-[#333] mt-1 ml-1">{time}</div>
                    </div>
                  </div>
                )
              }
              
              return (
                <div key={msg._id} className="flex items-end gap-2.5 justify-end bubble-in">
                  <div className="max-w-sm">
                    <div className="bg-[#E63946] text-white text-sm px-4 py-3 rounded-2xl rounded-br-sm leading-relaxed">{msg.content}</div>
                    <div className="text-[10px] text-[#333] mt-1 mr-1 text-right">{time} · ✓✓</div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="text-[#555] text-sm mb-2">Select a conversation to start messaging</div>
                <div className="text-[#333] text-xs">Choose from your conversations on the left</div>
              </div>
            </div>
          )}

            {/* Typing indicator */}
            {typing && (
              <div className="flex items-end gap-2.5 bubble-in">
                <div className="w-7 h-7 rounded-full bg-[#E63946] flex items-center justify-center text-[10px] text-white flex-shrink-0">A</div>
                <div className="bg-[#161616] px-4 py-3.5 rounded-2xl rounded-bl-sm">
                  <div className="flex gap-1 items-center">
                    {[0, 0.15, 0.3].map((delay, i) => (
                      <div key={i} className="w-1.5 h-1.5 bg-[#555] rounded-full animate-bounce" style={{ animationDelay: `${delay}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick replies */}
          <div className="flex-shrink-0 px-5 py-2.5 border-t border-[#111] flex gap-2 overflow-x-auto">
            {['Done ✅', 'Not today — will make up tomorrow.', 'Need a bit more time today.', 'Can we reschedule the call?'].map((t, i) => (
              <button key={i} onClick={() => sendMessage(t)}
                className="border border-[#1A1A1A] hover:border-[#333] text-[#666] hover:text-white text-xs px-4 py-1.5 rounded-full transition-all whitespace-nowrap">
                {['Done', 'Not today', 'Need more time', 'Reschedule'][i]}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="flex-shrink-0 px-5 pb-5 pt-2">
            <div className="flex items-end gap-2.5 bg-[#0D0B0C] border border-[#1A1A1A] focus-within:border-[#2a2a2a] rounded-2xl p-3 transition-colors">
              <button className="w-9 h-9 rounded-xl border border-[#222] flex items-center justify-center hover:border-[#E63946] hover:text-[#E63946] text-[#444] transition-all flex-shrink-0">
                <Icon icon="solar:microphone-3-linear" className="text-base" />
              </button>
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleEnter}
                placeholder="Message Coach Arjun..."
                rows={1}
                className="flex-1 bg-transparent text-[#ccc] text-sm outline-none resize-none placeholder-[#333] leading-relaxed py-1.5"
                style={{ maxHeight: '100px', overflowY: 'auto' }}
              />
              <button onClick={() => sendMessage(input)}
                className="w-9 h-9 rounded-xl bg-[#E63946] hover:bg-[#c8313d] flex items-center justify-center transition-colors flex-shrink-0">
                <Icon icon="solar:arrow-up-linear" className="text-white text-base" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
