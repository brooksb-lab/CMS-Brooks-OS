import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Reply, Smile, Sparkles, AppWindow, Paperclip, Clock, 
  ArrowUp, ChevronDown, ChevronRight, Bold, Italic, 
  Underline, Strikethrough, AlignLeft, AlignCenter, 
  AlignRight, List, Indent, Outdent, Type, Redo, Undo
} from 'lucide-react';
import { cn } from '@/src/lib/utils';

export const MailAppView = () => {
  return (
    <div className="w-full h-full flex flex-col bg-[#1E1F24] text-[#E0E0E0] font-sans rounded-b-[10px] overflow-hidden">
      
      {/* 1. Main Toolbar (Includes space for macOS traffic lights on the left) */}
      <div className="h-[52px] pl-[80px] pr-[16px] flex items-center justify-between shrink-0 drag-region pointer-events-auto border-b border-white/5 bg-[#25252A] overflow-hidden relative">
        <div className="absolute inset-0 pointer-events-none data-[tauri-drag-region]:block" style={{WebkitAppRegion: 'drag'} as any} />
        {/* Center/Left-ish Icons Toolbars */}
        <div className="flex items-center gap-[12px] pointer-events-auto h-full z-10">
          
          <div className="flex items-center h-[28px] rounded-[6px] bg-transparent border border-white/10 divide-x divide-white/10 px-[2px]">
            <button className="px-[10px] h-full flex items-center justify-center hover:bg-white/10 transition-colors rounded-l-[4px] text-white/50 hover:text-white group">
               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transform scale-x-[-1] group-hover:scale-x-[-1]"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" className="hidden" /><path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11"/></svg>
            </button>
            <button className="px-[12px] h-full flex items-center justify-center hover:bg-white/10 transition-colors text-white/60 hover:text-white">
              <span className="font-serif text-[15px] leading-none tracking-tight">Aa</span>
            </button>
            <button className="px-[10px] h-full flex items-center justify-center hover:bg-white/10 transition-colors text-white/50 hover:text-white">
              <Smile className="w-[15px] h-[15px]" />
            </button>
            <button className="px-[10px] h-full flex items-center justify-center hover:bg-white/10 transition-colors rounded-r-[4px] text-white/50 hover:text-white">
              <Sparkles className="w-[15px] h-[15px]" />
            </button>
          </div>

          <div className="flex items-center gap-[6px]">
            <button className="h-[28px] px-[8px] flex items-center justify-center hover:bg-white/10 bg-transparent border border-white/10 rounded-[6px] transition-colors gap-[4px] text-white/50 hover:text-white">
              <AppWindow className="w-[14px] h-[14px]" />
              <ChevronDown className="w-[12px] h-[12px]" />
            </button>
            <button className="h-[28px] px-[8px] flex items-center justify-center hover:bg-white/10 bg-transparent border border-white/10 rounded-[6px] transition-colors gap-[4px] text-white/50 hover:text-white">
              <Paperclip className="w-[14px] h-[14px]" />
              <ChevronDown className="w-[12px] h-[12px]" />
            </button>
             <button className="h-[28px] px-[8px] flex items-center justify-center hover:bg-white/10 bg-transparent border border-white/10 rounded-[6px] transition-colors gap-[4px] text-white/50 hover:text-white">
              <div className="relative flex items-center justify-center w-[16px] h-[16px]">
                <Clock className="w-[14px] h-[14px]" />
                <ArrowUp className="w-[7px] h-[7px] absolute top-[2px] right-[-1px] bg-[#25252A] rounded-full" strokeWidth={3} />
              </div>
              <ChevronDown className="w-[12px] h-[12px]" />
            </button>
          </div>

        </div>

        {/* Right side Send button */}
        <div className="pointer-events-auto z-10 w-[28px] h-[28px] flex items-center justify-center rounded-full bg-transparent border border-white/10 hover:bg-white/10 transition-colors cursor-pointer group">
          <ArrowUp className="w-[15px] h-[15px] text-white/50 group-hover:text-white/90" strokeWidth={1.5} />
        </div>

      </div>

      <div className="flex-1 overflow-auto bg-[#1E1F24]">
        {/* Inputs Area */}
        <div className="flex flex-col shrink-0 text-[13px] pointer-events-auto px-4 bg-[#1E1F24]">
          <div className="flex items-center min-h-[36px] border-b border-white/5">
            <span className="text-white/50 w-[36px] shrink-0 font-medium">To:</span>
            <input type="text" className="flex-1 bg-transparent border-none outline-none text-[#E0E0E0] placeholder:text-transparent" />
          </div>
          <div className="flex items-center min-h-[36px] border-b border-white/5">
            <span className="text-white/50 w-[36px] shrink-0 font-medium">Cc:</span>
            <input type="text" className="flex-1 bg-transparent border-none outline-none text-[#E0E0E0] placeholder:text-transparent" />
          </div>
          <div className="flex items-center min-h-[36px] border-b border-white/5">
            <span className="text-white/50 w-[56px] shrink-0 font-medium">Subject:</span>
            <input type="text" className="flex-1 bg-transparent border-none outline-none text-[#E0E0E0] font-medium placeholder:text-transparent" />
          </div>
          
          <div className="flex items-center justify-between min-h-[36px] border-b border-white/5">
            <div className="flex items-center">
              <span className="text-white/50 w-[44px] shrink-0 font-medium">From:</span>
              <span className="text-white">Brooks Behrens – brksbehrens@gmail.com</span>
            </div>
            <div className="flex items-center gap-[8px]">
              <span className="text-white/50 font-medium">Signature:</span>
              <button className="h-[22px] px-[8px] bg-[#2F2F37] rounded border border-black/40 flex items-center justify-between min-w-[70px] text-[12px] text-white">
                <span>None</span>
                <ChevronDown className="w-3 h-3 text-white/60 ml-[12px]" />
              </button>
            </div>
          </div>
        </div>

        {/* Formatting Toolbar */}
        <div className="h-[40px] shrink-0 flex items-center px-4 border-b border-white/5 gap-[8px] overflow-x-auto pointer-events-auto bg-[#1E1F24]">
          
          <div className="flex items-center gap-[6px]">
              <button className="h-[22px] bg-[#2C2D33] rounded border border-white/10 flex items-center px-[8px] justify-between text-[12px] text-white/90 min-w-[100px] hover:bg-white/10 transition-colors">
                <span className="truncate text-left text-[12.5px]">Aktiv Grotesk</span>
                <ChevronDown className="w-3 h-3 text-white/50 shrink-0 ml-[8px]" />
              </button>
              <button className="h-[22px] bg-[#2C2D33] rounded border border-white/10 flex items-center px-[8px] justify-between text-[12px] text-white/90 min-w-[80px] hover:bg-white/10 transition-colors">
                <span className="text-[12.5px]">Regular</span>
                <ChevronDown className="w-3 h-3 text-white/50 shrink-0 ml-[16px]" />
              </button>
              <button className="h-[22px] bg-[#2C2D33] rounded border border-white/10 flex items-center px-[8px] justify-between text-[12px] text-white/90 min-w-[50px] hover:bg-white/10 transition-colors">
                <span className="text-[12.5px]">12</span>
                <ChevronDown className="w-3 h-3 text-white/50 shrink-0 ml-[8px]" />
              </button>
          </div>

          <div className="flex items-center gap-[6px] ml-1">
              <button className="w-[18px] h-[18px] rounded-[3px] bg-white shadow-sm"></button>
              <button className="w-[18px] h-[18px] rounded-[3px] bg-transparent border border-white/10 shadow-sm relative overflow-hidden flex items-center justify-center">
                  <div className="absolute w-[160%] h-[1.5px] bg-[#E83C3C] rotate-[45deg] transform origin-center"></div>
              </button>
          </div>

          <div className="flex items-center h-[22px] rounded bg-[#2C2D33] border border-white/10 divide-x divide-white/10 font-serif text-[13px] ml-1">
              <button className="w-[24px] h-full flex items-center justify-center font-bold text-white hover:bg-white/10">B</button>
              <button className="w-[24px] h-full flex items-center justify-center italic text-white hover:bg-white/10">I</button>
              <button className="w-[24px] h-full flex items-center justify-center underline text-white hover:bg-white/10">U</button>
              <button className="w-[24px] h-full flex items-center justify-center line-through text-white hover:bg-white/10">S</button>
          </div>

          <div className="flex items-center h-[22px] rounded bg-[#2C2D33] border border-white/10 divide-x divide-white/10 ml-1">
              <button className="w-[26px] h-full flex items-center justify-center bg-[#0060E0]/90 text-white first:rounded-l hover:bg-[#0060E0]"><AlignLeft className="w-3.5 h-3.5" /></button>
              <button className="w-[26px] h-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10"><AlignCenter className="w-3.5 h-3.5" /></button>
              <button className="w-[26px] h-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10"><AlignRight className="w-3.5 h-3.5" /></button>
              <button className="w-[26px] h-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 last:rounded-r"><AlignRight className="w-3.5 h-3.5" style={{ transform: 'scaleX(-1)' }} /></button>
          </div>

          <div className="flex items-center gap-[6px] ml-1">
              <button className="h-[22px] bg-[#2C2D33] rounded border border-white/10 flex items-center px-[8px] gap-[6px] hover:bg-white/10 transition-colors">
                <List className="w-3.5 h-3.5 text-white/70 shrink-0" />
                <ChevronDown className="w-3 h-3 text-white/50 shrink-0" />
              </button>
              <div className="flex items-center h-[22px] rounded bg-[#2C2D33] border border-white/10 divide-x divide-white/10">
                <button className="w-[26px] h-full flex items-center justify-center hover:bg-white/10 first:rounded-l">
                  <Outdent className="w-3.5 h-3.5 text-white/70" />
                </button>
                <button className="w-[26px] h-full flex items-center justify-center hover:bg-white/10 last:rounded-r">
                  <Indent className="w-3.5 h-3.5 text-white/70" />
                </button>
              </div>
          </div>

        </div>

        {/* Editor Body Area */}
        <div className="flex-1 p-[24px] pointer-events-auto min-h-[300px]">
          <textarea 
            className="w-full h-full bg-transparent border-none outline-none resize-none text-[14px] text-white text-left align-top"
            placeholder=""
          ></textarea>
        </div>
      </div>
    </div>
  );
};
