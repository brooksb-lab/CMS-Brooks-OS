import React, { useState } from 'react';
import { useWindowManager } from '../hooks/useWindowManager';
import { cn } from '../lib/utils';
import { Search, Edit, Trash2, Folder, ChevronRight, Menu } from 'lucide-react';

interface Note {
  id: string;
  title: string;
  date: string;
  preview: string;
  content: string;
  folder: string;
}

const mockNotes: Note[] = [
  {
    id: '1',
    title: 'The Design Language',
    date: '10/24/25',
    preview: 'Breaking down the components...',
    content: `# The Design Language\n\n10/24/25\n\nA deep dive into the foundational elements of our design system. We focus on clarity, purpose, and visual rhythm. Building components that fit naturally into the environment.\n\n- Typography scale\n- Spacing rules\n- Glassmorphism techniques`,
    folder: 'Blog'
  },
  {
    id: '2',
    title: 'Spatial Interfaces',
    date: '9/15/25',
    preview: 'How UI behaves in 3D space.',
    content: `# Spatial Interfaces\n\n9/15/25\n\nTransitioning from 2D planes to 3D realms requires a complete reimagining of affordances. Shadows, depth, and occlusion become primary tools for establishing hierarchy.`,
    folder: 'Blog'
  },
  {
    id: '3',
    title: 'Workflow Efficiency',
    date: '8/02/25',
    preview: 'Optimizing toolsets for speed.',
    content: `# Workflow Efficiency\n\n8/02/25\n\nUsing the right shortcut can save hours. Here's how I setup my environments to eliminate friction between intent and action.`,
    folder: 'Notes'
  }
];

export const NotesApp = () => {
  const [activeFolder, setActiveFolder] = useState('Blog');
  const [activeNoteId, setActiveNoteId] = useState<string>(mockNotes[0].id);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNotes = mockNotes
    .filter(n => n.folder === activeFolder)
    .filter(n => 
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      n.preview.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const activeNote = mockNotes.find(n => n.id === activeNoteId);

  return (
    <div className="flex h-full w-full bg-[#1c1c1e] text-white select-none overflow-hidden rounded-b-[10px]">
      
      {/* Middle Column - Note List */}
      <div className="w-[260px] h-full bg-[#2c2c2e] border-r border-black/40 flex flex-col shrink-0 max-w-full">
        {/* Header */}
        <div className="h-[52px] px-4 flex items-center justify-between border-b border-black/20 shrink-0">
          <div className="flex items-center gap-3">
            <button className="text-white/70 hover:text-white transition-colors">
              <Menu size={18} />
            </button>
            <button className="text-white/70 hover:text-white transition-colors">
              <Trash2 size={16} />
            </button>
            <button className="text-white/70 hover:text-white transition-colors text-[20px] leading-none mb-1">
              ⍆
            </button>
          </div>
          <button className="text-[#0a84ff] hover:brightness-110 transition-all">
            <Edit size={18} strokeWidth={2} />
          </button>
        </div>
        
        {/* Search */}
        <div className="p-3 pb-1 shrink-0">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/50" />
            <input 
              type="text" 
              placeholder="Search" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1c1c1e] text-white text-[13px] rounded-md pl-8 pr-3 py-1.5 outline-none border border-white/5 placeholder:text-white/40 focus:ring-2 focus:ring-[#0a84ff]/50"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 custom-scrollbar">
          {filteredNotes.map(note => (
            <div 
              key={note.id}
              onClick={() => setActiveNoteId(note.id)}
              className={cn(
                "p-3 rounded-lg cursor-default border",
                activeNoteId === note.id 
                  ? "bg-[#0a84ff] border-transparent" 
                  : "bg-transparent border-transparent hover:bg-white/5"
              )}
            >
              <div className={cn("text-[13px] font-semibold truncate", activeNoteId === note.id ? "text-white" : "text-white/90")}>
                {note.title}
              </div>
              <div className="flex gap-2 mt-1 items-baseline">
                <span className={cn("text-[12px]", activeNoteId === note.id ? "text-white/90" : "text-white/70")}>
                  {note.date}
                </span>
                <span className={cn("text-[12px] truncate", activeNoteId === note.id ? "text-white/80" : "text-white/50")}>
                  {note.preview}
                </span>
              </div>
            </div>
          ))}
          {filteredNotes.length === 0 && (
            <div className="p-4 text-center text-white/50 text-[13px]">No notes found.</div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 h-full bg-[#1e1e1e] flex flex-col min-w-0 relative">
        {/* Date header */}
        <div className="h-[52px] flex items-center justify-center shrink-0 border-b border-black/20">
          {activeNote && (
            <span className="text-[12px] text-white/50">{activeNote.date}</span>
          )}
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {activeNote ? (
            <div className="max-w-[600px] mx-auto text-[15px] font-sans text-white/90 leading-[1.6]">
              {activeNote.content.split('\n').map((line, i) => {
                if (line.startsWith('# ')) {
                  return <h1 key={i} className="text-3xl font-bold mb-4">{line.replace('# ', '')}</h1>;
                }
                if (line.startsWith('- ')) {
                  return <div key={i} className="flex pl-4 relative mb-2 before:content-[''] before:absolute before:left-0 before:top-[10px] before:w-[6px] before:h-[6px] before:bg-white/70 before:rounded-full">{line.replace('- ', '')}</div>;
                }
                return <p key={i} className="mb-4 min-h-[1.6em]">{line}</p>;
              })}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-white/40 text-[14px]">
              No Note Selected
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
