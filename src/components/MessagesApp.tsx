import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../lib/utils';
import { Video, Plus, Smile, ChevronRight } from 'lucide-react';

export const MessagesApp = () => {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<any[]>([
    { id: 1, type: 'incoming', text: "No worries, rest up and lmk for the Wed. Feel better!", isFirst: true, isLast: true },
    { id: 2, type: 'outgoing', text: "Thank you! See you soon!", isFirst: true, isLast: true, reaction: "👍" },
    { id: 3, type: 'timestamp', text: "Tue, Apr 21 at 10:11 PM" },
    { id: 4, type: 'incoming', text: "Hi Brooks, how are you feeling? Will you be able to work out tomorrow?", isFirst: true, isLast: true },
    { id: 5, type: 'outgoing', text: "Hey Garen! Feeling better so I'm up to it, I'll just have to go right at 8:30 so I can make it uptown in time.", isFirst: true, isLast: true },
    { id: 6, type: 'incoming', text: "Got it! So we start at 7:30?", isFirst: true, isLast: true },
    { id: 7, type: 'outgoing', text: "Yes! That works great for me thanks again", isFirst: true, isLast: true },
    { id: 8, type: 'timestamp', text: "Wed, Apr 29 at 9:30 PM" },
    { id: 9, type: 'incoming', text: "Good evening Brooks just wanted to let you know that we are scheduled for Friday this week. I am off tomorrow.\nOur last session was also last Friday so just wanted to avoid any confusion.", isFirst: true, isLast: true },
    { id: 10, type: 'timestamp', text: "Thursday 3:11 PM" },
    { id: 11, type: 'outgoing', text: "Hi Garen!\nThank you, I am flying back today so tomorrow 8am is perfect", isFirst: true, isLast: true },
    { id: 12, type: 'timestamp', text: "Thursday 7:50 PM" },
    { id: 13, type: 'incoming', text: "see you then", isFirst: true, isLast: false },
    { id: 14, type: 'custom', content: <div className="flex justify-start mb-[14px]"><span className="text-[60px]" style={{ lineHeight: 1 }}>🤙🏼</span></div> },
    { id: 15, type: 'timestamp', text: "Today 7:05 AM" },
    { id: 16, type: 'outgoing', text: "Hey Garen, really sorry for the late notice but I have to cancel this morning's session. Not feeling well and don't want to push through it.", isFirst: true, isLast: true },
    { id: 17, type: 'incoming', text: "Hi Brooks, sorry to hear that you're not feeling well. Hope you feel better. I will be texting you later today to see if you feel better for tomorrow's session.", isFirst: true, isLast: true },
    { id: 18, type: 'outgoing', text: "Thank you!", isFirst: true, isLast: true, status: "Delivered" }
  ]);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = () => {
    if (!inputText.trim()) return;
    setMessages(prev => [
      ...prev,
      { id: Date.now(), type: 'outgoing', text: inputText.trim(), isFirst: true, isLast: true, status: "Delivered" }
    ]);
    setInputText('');
  };

  return (
    <div className="w-full h-full flex flex-col text-white font-sans overflow-hidden bg-[#161616] relative rounded-b-[10px]">
      
      {/* Top Header Blur Gradient */}
      <div 
        className="absolute top-0 left-0 right-0 h-[120px] z-10 pointer-events-none"
        style={{
          backdropFilter: 'blur(25px)',
          WebkitBackdropFilter: 'blur(25px)',
          maskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)',
          backgroundColor: 'rgba(22, 22, 22, 0.55)',
          transform: 'translateZ(0)'
        }}
      />
      
      {/* Top Header UI */}
      <div className="h-[72px] shrink-0 flex items-start justify-between px-4 absolute top-0 w-full z-20 pointer-events-none pt-4">
        <div className="w-[32px]" /> {/* Spacer */}
        <div className="flex flex-col items-center pointer-events-auto relative">
          <div className="w-[42px] h-[42px] rounded-full bg-gradient-to-b from-[#6b527b] to-[#3a2d48] border-[0.5px] border-white/20 text-white text-[18px] font-semibold flex items-center justify-center shadow-lg relative z-10">
            BB
          </div>
          <div className="flex items-center mt-1">
            <div className="flex items-center text-[12px] font-semibold text-[#f0f0f0] bg-[#1c1c1e]/70 backdrop-blur-xl border-[0.5px] border-white/20 pl-3 pr-2 py-[3px] rounded-full shadow-lg">
              <span className="mr-0.5">Brooks Behrens</span> <ChevronRight size={13} strokeWidth={2.5} className="text-gray-400 opacity-70" />
            </div>
          </div>
        </div>
        <div className="w-[32px] h-[32px] pointer-events-auto mt-1">
          <button className="w-full h-full rounded-full bg-[#1c1c1e]/40 hover:bg-[#1c1c1e]/60 backdrop-blur-2xl border border-white/10 flex items-center justify-center text-gray-300 transition-colors shadow-sm">
            <Video size={16} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Chat Scroll Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 pt-[100px] pb-[100px] flex flex-col gap-2 custom-scrollbar z-0"
      >
        {messages.map((msg) => {
          if (msg.type === 'timestamp') {
            return <Timestamp key={msg.id} text={msg.text} />
          }
          if (msg.type === 'custom') {
            return <React.Fragment key={msg.id}>{msg.content}</React.Fragment>
          }
          return (
            <MessageBubble
              key={msg.id}
              type={msg.type as any}
              text={msg.text}
              isFirst={msg.isFirst}
              isLast={msg.isLast}
              reaction={msg.reaction}
              status={msg.status}
            />
          )
        })}
      </div>

      {/* Bottom Gradient/Blur Area */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-[140px] z-10 pointer-events-none"
        style={{
          backdropFilter: 'blur(25px)',
          WebkitBackdropFilter: 'blur(25px)',
          maskImage: 'linear-gradient(to top, black 30%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to top, black 30%, transparent 100%)',
          backgroundColor: 'rgba(22, 22, 22, 0.4)',
          transform: 'translateZ(0)'
        }}
      />

      {/* Input Area UI */}
      <div className="absolute bottom-0 w-full z-20 pointer-events-none pb-5 px-4 pt-12">
        <div className="flex items-center gap-2.5 pointer-events-auto">
          <button className="w-[32px] h-[32px] shrink-0 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-[40px] shadow-[0_2px_8px_rgba(0,0,0,0.2)] flex items-center justify-center text-[#8a8a8e] hover:text-[#e5e5e5] transition-colors relative overflow-hidden ring-[0.5px] ring-white/10 ring-inset">
            <Plus size={18} strokeWidth={2} />
          </button>
          
          <div className="flex-1 min-h-[36px] bg-black/30 backdrop-blur-[40px] rounded-[18px] flex items-center px-4 shadow-[0_2px_8px_rgba(0,0,0,0.2)] relative overflow-hidden group ring-[0.5px] ring-white/10 ring-inset">
            <div className="absolute inset-0 bg-white/[0.02] pointer-events-none" />
            <input 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => { if(e.key==='Enter') sendMessage(); }}
              placeholder="iMessage"
              className="bg-transparent border-none outline-none text-[#e5e5e5] text-[14px] flex-1 min-w-0 placeholder:text-[#6a6a6c] py-1.5 h-full relative z-10"
            />
            <div className="ml-auto flex items-center gap-2 pl-2 relative z-10">
               <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#6a6a6c]"><path d="M2 10v3"/><path d="M6 6v11"/><path d="M10 3v18"/><path d="M14 8v7"/><path d="M18 5v13"/><path d="M22 10v3"/></svg>
            </div>
           </div>
          
          <button className="w-[32px] h-[32px] shrink-0 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-[40px] shadow-[0_2px_8px_rgba(0,0,0,0.2)] flex items-center justify-center text-[#8a8a8e] hover:text-[#e5e5e5] transition-colors relative overflow-hidden ring-[0.5px] ring-white/10 ring-inset">
             <Smile size={18} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>
  );
};

// Sub-components

const Timestamp: React.FC<{ text: string }> = ({ text }) => (
  <div className="flex justify-center my-3">
    <span className="text-[10px] text-gray-400 font-medium">{text}</span>
  </div>
);

const MessageBubble: React.FC<{ 
  type: 'incoming' | 'outgoing', 
  text: string, 
  isFirst?: boolean, 
  isLast?: boolean,
  reaction?: string,
  status?: string,
}> = ({ 
  type, 
  text, 
  isFirst, 
  isLast,
  reaction,
  status
}) => {
  const isIncoming = type === 'incoming';
  
  return (
    <div className={cn("flex flex-col mb-[1px]", isIncoming ? "items-start" : "items-end")}>
      <div className="relative max-w-[75%]">
        {reaction && (
          <div className="absolute -top-3 -left-3 bg-[#333333] border-2 border-[#161616] rounded-full px-1.5 py-0.5 text-[10px] z-10 shadow-sm">
            {reaction}
          </div>
        )}
        <div 
          className={cn(
            "px-[14px] pt-[8px] pb-[9px] text-[14px] leading-[1.3] relative",
            isIncoming ? "bg-[#333333] text-[#e5e5e5]" : "bg-[#0b84ff] text-white",
            isLast && isIncoming ? "rounded-tl-[18px] rounded-tr-[18px] rounded-br-[18px] rounded-bl-[4px]" : 
            isLast && !isIncoming ? "rounded-tl-[18px] rounded-tr-[18px] rounded-bl-[18px] rounded-br-[4px]" :
            "rounded-[18px]"
          )}
          style={{ whiteSpace: 'pre-wrap' }}
        >
          {text}
        </div>
      </div>
      {status && (
        <span className="text-[10px] text-gray-500 mt-1 mr-2">{status}</span>
      )}
    </div>
  );
}

