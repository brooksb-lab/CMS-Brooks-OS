import React, { useState, useRef, useEffect, useMemo } from 'react';
import { cn } from '../lib/utils';
import { Wifi, Volume2, Search, Settings2, Settings, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MenuData {
  title: string;
  isApple?: boolean;
  isBold?: boolean;
  items: MenuItem[];
}

interface MenuItem {
  label: string;
  shortcut?: string;
  disabled?: boolean;
  divider?: boolean;
}

const menus: MenuData[] = [
  {
    title: '',
    isApple: true,
    items: [
      { label: 'About This Mac' },
      { divider: true, label: '' },
      { label: 'System Settings...' },
      { label: 'App Store...' },
      { divider: true, label: '' },
      { label: 'Recent Items' },
      { divider: true, label: '' },
      { label: 'Force Quit...', shortcut: '⌥⌘⎋' },
      { divider: true, label: '' },
      { label: 'Sleep' },
      { label: 'Restart...' },
      { label: 'Shut Down...' },
      { divider: true, label: '' },
      { label: 'Lock Screen', shortcut: '⌃⌘Q' },
      { label: 'Log Out User...', shortcut: '⇧⌘Q' },
    ]
  },
  {
    title: 'Brooks',
    isBold: true,
    items: [
      { label: 'About Brooks' },
      { divider: true, label: '' },
      { label: 'Settings...', shortcut: '⌘,' },
      { divider: true, label: '' },
      { label: 'Empty Trash', shortcut: '⇧⌘⌫' },
      { divider: true, label: '' },
      { label: 'Services' },
      { divider: true, label: '' },
      { label: 'Hide Brooks', shortcut: '⌘H' },
      { label: 'Hide Others', shortcut: '⌥⌘H' },
      { label: 'Show All', disabled: true },
    ]
  },
  {
    title: 'File',
    items: [
      { label: 'New Brooks Window', shortcut: '⌘N' },
      { label: 'New Folder', shortcut: '⇧⌘N' },
      { label: 'New Folder with Selection', disabled: true, shortcut: '⌃⌘N' },
      { label: 'New Smart Folder' },
      { label: 'New Tab', shortcut: '⌘T' },
      { label: 'Open', shortcut: '⌘O', disabled: true },
      { label: 'Open With', disabled: true },
      { label: 'Print', shortcut: '⌘P', disabled: true },
      { label: 'Close Window', shortcut: '⌘W' },
      { divider: true, label: '' },
      { label: 'Get Info', shortcut: '⌘I' },
      { label: 'Rename', disabled: true },
      { label: 'Compress', disabled: true },
      { divider: true, label: '' },
      { label: 'Duplicate', shortcut: '⌘D', disabled: true },
      { label: 'Make Alias', shortcut: '⌃⌘A', disabled: true },
      { label: 'Quick Look', shortcut: '⌘Y', disabled: true },
      { label: 'Show Original', shortcut: '⌘R', disabled: true },
      { label: 'Add to Sidebar', shortcut: '⌃⌘T', disabled: true },
      { divider: true, label: '' },
      { label: 'Move to Trash', shortcut: '⌘⌫', disabled: true },
      { label: 'Eject', shortcut: '⌘E', disabled: true },
    ]
  },
  {
    title: 'Edit',
    items: [
      { label: 'Undo', shortcut: '⌘Z', disabled: true },
      { label: 'Redo', shortcut: '⇧⌘Z', disabled: true },
      { divider: true, label: '' },
      { label: 'Cut', shortcut: '⌘X', disabled: true },
      { label: 'Copy', shortcut: '⌘C', disabled: true },
      { label: 'Paste', shortcut: '⌘V', disabled: true },
      { label: 'Select All', shortcut: '⌘A' },
      { divider: true, label: '' },
      { label: 'Show Clipboard' },
      { divider: true, label: '' },
      { label: 'Start Dictation...' },
      { label: 'Emoji & Symbols', shortcut: 'Fn E' },
    ]
  },
  {
    title: 'View',
    items: [
      { label: 'As Icons', shortcut: '⌘1' },
      { label: 'As List', shortcut: '⌘2' },
      { label: 'As Columns', shortcut: '⌘3' },
      { label: 'As Gallery', shortcut: '⌘4' },
      { divider: true, label: '' },
      { label: 'Use Stacks', shortcut: '⌃⌘0' },
      { label: 'Sort By' },
      { label: 'Clean Up' },
      { label: 'Clean Up By' },
      { divider: true, label: '' },
      { label: 'Hide Sidebar', shortcut: '⌥⌘S' },
      { label: 'Show Preview', shortcut: '⇧⌘P' },
      { divider: true, label: '' },
      { label: 'Hide Toolbar', shortcut: '⌥⌘T' },
      { label: 'Show All Tabs', shortcut: '⇧⌘\\' },
      { label: 'Show Tab Bar', shortcut: '⇧⌘T' },
      { label: 'Show Path Bar', shortcut: '⌥⌘P' },
      { label: 'Show Status Bar', shortcut: '⌘/' },
      { divider: true, label: '' },
      { label: 'Customize Toolbar...' },
      { divider: true, label: '' },
      { label: 'Show View Options', shortcut: '⌘J' },
      { label: 'Show Preview Options' },
    ]
  },
  {
    title: 'Go',
    items: [
      { label: 'Back', shortcut: '⌘[', disabled: true },
      { label: 'Forward', shortcut: '⌘]', disabled: true },
      { label: 'Enclosing Folder', shortcut: '⌘↑' },
      { divider: true, label: '' },
      { label: 'Recents', shortcut: '⇧⌘F' },
      { label: 'Documents', shortcut: '⇧⌘O' },
      { label: 'Desktop', shortcut: '⇧⌘D' },
      { label: 'Downloads', shortcut: '⌥⌘L' },
      { label: 'Home', shortcut: '⇧⌘H' },
      { label: 'Computer', shortcut: '⇧⌘C' },
      { label: 'AirDrop', shortcut: '⇧⌘R' },
      { label: 'Network', shortcut: '⇧⌘K' },
      { label: 'iCloud Drive', shortcut: '⇧⌘I' },
      { label: 'Applications', shortcut: '⇧⌘A' },
      { label: 'Utilities', shortcut: '⇧⌘U' },
      { divider: true, label: '' },
      { label: 'Recent Folders' },
      { divider: true, label: '' },
      { label: 'Go to Folder...', shortcut: '⇧⌘G' },
      { label: 'Connect to Server...', shortcut: '⌘K' },
    ]
  },
  {
    title: 'Window',
    items: [
      { label: 'Minimize', shortcut: '⌘M', disabled: true },
      { label: 'Zoom', disabled: true },
      { label: 'Move Window to Left Side of Screen', disabled: true },
      { label: 'Move Window to Right Side of Screen', disabled: true },
      { label: 'Replace Tiled Window', disabled: true },
      { divider: true, label: '' },
      { label: 'Remove Window from Set', disabled: true },
      { divider: true, label: '' },
      { label: 'Cycle Through Windows', shortcut: '⌘`' },
      { label: 'Show Previous Tab', shortcut: '⌃⇧⇥', disabled: true },
      { label: 'Show Next Tab', shortcut: '⌃⇥', disabled: true },
      { label: 'Move Tab to New Window', disabled: true },
      { label: 'Merge All Windows', disabled: true },
      { divider: true, label: '' },
      { label: 'Bring All to Front' },
    ]
  },
  {
    title: 'Help',
    items: [
      { label: 'macOS Help' },
    ]
  }
];

interface TopMenuBarProps {
  activeAppName?: string;
  isFullScreen?: boolean;
}

export const TopMenuBar = ({ activeAppName = 'Brooks', isFullScreen = false }: TopMenuBarProps) => {
  const [activeMenuIndex, setActiveMenuIndex] = useState<number | null>(null);
  const [time, setTime] = useState(new Date());
  const menuRef = useRef<HTMLDivElement>(null);
  
  const [batteryState, setBatteryState] = useState({ pct: 73, mode: 'draining' });
  const [showVolume, setShowVolume] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(70);
  const volumeRef = useRef<HTMLDivElement>(null);
  
  // Update static menu with dynamic title
  const dynamicMenus = useMemo(() => {
    return menus.map(menu => {
      if (menu.title === 'Brooks') {
        const title = activeAppName;
        return {
          ...menu,
          title,
          items: menu.items.map(item => ({
            ...item,
            label: item.label.replace('Brooks', title)
          }))
        };
      }
      if (menu.title === 'File') {
         return {
           ...menu,
           items: menu.items.map(item => ({
             ...item,
             label: item.label.replace('Brooks', activeAppName)
           }))
         };
      }
      return menu;
    });
  }, [activeAppName]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
      setBatteryState(prev => {
        if (prev.mode === 'draining') {
           const next = prev.pct - (100 / 60);
           if (next <= 0) return { pct: 0, mode: 'charging' };
           return { pct: next, mode: 'draining' };
        } else {
           const next = prev.pct + (100 / 15);
           if (next >= 100) return { pct: 100, mode: 'draining' };
           return { pct: next, mode: 'charging' };
        }
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenuIndex(null);
      }
      if (volumeRef.current && !volumeRef.current.contains(e.target as Node)) {
        // also check if the click was on the volume icon, we don't want to close and immediately reopen
        // this is handled by just closing
        setShowVolume(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const formattedDate = time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).replace(/,/g, '');
  const formattedClock = time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit' });
  const formattedTime = `${formattedDate}  ${formattedClock}`;

  const handleMenuEnter = (index: number) => {
    if (activeMenuIndex !== null) {
      setActiveMenuIndex(index);
    }
  };

  const handleMenuClick = (index: number) => {
    if (activeMenuIndex === index) {
      setActiveMenuIndex(null);
    } else {
      setActiveMenuIndex(index);
    }
  };

  return (
    <div 
      ref={menuRef}
      className={cn(
        "absolute top-0 inset-x-0 z-[100000] h-[32px] bg-transparent flex items-center justify-between pr-2 pl-[2px] text-[13px] text-white select-none"
      )}
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif' }}
    >
      {/* Black wipe background for fullscreen mode */}
      <AnimatePresence>
        {isFullScreen && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 200, damping: 25, mass: 0.8 }}
              className="absolute inset-0 bg-[#2d2d2d] z-0"
            />
          </div>
        )}
      </AnimatePresence>

      <div className="flex items-center h-full relative z-10">
        {dynamicMenus.map((menu, index) => (
          <div 
            key={index} 
            className="relative h-full flex items-center px-[2px]"
            onMouseEnter={() => handleMenuEnter(index)}
          >
            <div 
              className={cn(
                "px-3 h-[24px] flex items-center justify-center rounded-full cursor-pointer transition-colors select-none",
                activeMenuIndex === index ? "bg-white/20 text-white" : "hover:bg-white/10",
                menu.isBold && "font-semibold"
              )}
              onPointerDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleMenuClick(index);
              }}
            >
              {menu.isApple ? (
                <img src="https://res.cloudinary.com/dezas8twg/image/upload/v1778398407/NoCLip_qb4rbw.svg" alt="Apple" className="w-[15px] h-[18px] object-contain" />
              ) : (
                menu.title
              )}
            </div>

            {activeMenuIndex === index && (
              <div 
                className="absolute top-full left-0 mt-[2px] min-w-[220px] py-1.5 bg-[#1e1e1e]/90 backdrop-blur-2xl saturate-[180%] border border-white/15 rounded-lg shadow-[0_10px_30px_rgba(0,0,0,0.6)] z-[100001] flex flex-col pointer-events-auto"
                style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif' }}
              >
                {menu.items.map((item, idx) => {
                  if (item.divider) {
                    return <div key={`div-${idx}`} className="h-[1px] bg-white/10 my-1 mx-2.5" />;
                  }
                  
                  return (
                    <div 
                      key={`item-${idx}`}
                      className={cn(
                        "group mx-1 px-2.5 py-[3.5px] text-[13px] rounded-[5px] flex items-center justify-between select-none transition-colors",
                        item.disabled 
                          ? "text-white/35 cursor-default" 
                          : "text-white/90 hover:bg-[#0062e1] hover:text-white active:bg-[#0048cd] cursor-pointer"
                      )}
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        if (!item.disabled) {
                          setTimeout(() => {
                            setActiveMenuIndex(null);
                          }, 100);
                        }
                      }}
                    >
                      <span className="font-normal leading-tight">{item.label}</span>
                      {item.shortcut && (
                        <span className={cn(
                          "ml-4 text-[12px] tracking-widest font-sans",
                          item.disabled ? "text-white/25" : "text-white/50 group-hover:text-white"
                        )}>
                          {item.shortcut}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-[1px] pr-2 relative z-10">
        
        {/* Output Device Popup */}
        <AnimatePresence>
          {showVolume && (
            <motion.div 
              ref={volumeRef}
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ type: "spring", bounce: 0, duration: 0.2 }}
              className="absolute top-full right-2 mt-2 w-[340px] rounded-2xl bg-[rgba(30,30,30,0.85)] saturate-[150%] backdrop-blur-[40px] border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.5)] z-[100] text-white flex flex-col p-4"
              style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif' }}
            >
              <div className="text-[13px] font-semibold mb-3">Sound</div>
              <div className="flex items-center w-full gap-3 mb-5">
                <Volume2 size={18} className="text-white/50 shrink-0" />
                <div className="relative flex-1 h-[6px] bg-white/10 rounded-full group">
                  <div className="absolute left-0 top-0 bottom-0 bg-white rounded-full transition-all" style={{ width: `${volumeLevel}%` }} />
                  <input 
                    type="range"
                    min="0"
                    max="100"
                    value={volumeLevel}
                    onChange={(e) => setVolumeLevel(parseInt(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {/* thumb visual */}
                  <div className="absolute top-1/2 -mt-[8px] w-[16px] h-[16px] bg-white rounded-full shadow-md pointer-events-none transition-shadow group-hover:shadow-[0_0_0_4px_rgba(255,255,255,0.1)]" style={{ left: `calc(${volumeLevel}% - 8px)` }} />
                </div>
              </div>

              <div className="flex flex-col gap-1 -mx-4 pb-2">
                <div className="h-[1px] bg-white/10 w-full mb-2" />
                <div className="px-4 py-1 hover:bg-white/10 cursor-pointer">
                  <span className="text-[13px] font-medium text-white/90">Sound Settings...</span>
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

        {/* 1. Volume */}
        <div 
          onClick={(e) => {
            e.stopPropagation();
            setShowVolume(v => !v);
          }}
          className={cn(
            "px-2 h-[24px] flex items-center justify-center rounded-[4px] cursor-default transition-colors hover:bg-white/10",
            showVolume && "bg-white/20"
          )}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.54 8.46a5 5 0 010 7.07" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M19.07 4.93a10 10 0 010 14.14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
        </div>

        {/* 2 & 3. Battery */}
        <div className="px-2 h-[24px] flex items-center justify-center rounded-[4px] cursor-default transition-colors hover:bg-white/10 gap-1.5">
          <span className="text-[12.5px] font-medium tracking-wide mt-[0.5px] tabular-nums min-w-[32px] text-right">{Math.round(batteryState.pct)}%</span>
          <div className="flex items-center opacity-80 relative">
            <div className="w-[22px] h-[11px] rounded-[3px] border-[1px] border-white p-[1px] flex items-center justify-start overflow-hidden">
              <div 
                className={cn(
                  "h-full rounded-[1.5px] transition-all duration-300",
                  batteryState.pct <= 20 && batteryState.mode !== 'charging' ? "bg-red-500" : "bg-white"
                )} 
                style={{ width: `${Math.round(batteryState.pct)}%` }} 
              />
            </div>
            <svg width="2" height="4" viewBox="0 0 2 4" fill="currentColor" className="ml-[1px]">
              <path d="M0 0V4C0.8 4 1.5 3.2 1.5 2C1.5 0.8 0.8 0 0 0Z" />
            </svg>
            {batteryState.mode === 'charging' && (
              <Zap size={10} fill="black" stroke="black" className="absolute top-[0.5px] left-[6px]" />
            )}
          </div>
        </div>

        {/* 4. Wifi */}
        <div className="px-2 h-[24px] flex items-center justify-center rounded-[4px] cursor-default transition-colors hover:bg-white/10">
          <Wifi size={16} strokeWidth={2.5} />
        </div>

        {/* 5. Search */}
        <div className="px-2 h-[24px] flex items-center justify-center rounded-[4px] cursor-default transition-colors hover:bg-white/10">
          <Search size={15} strokeWidth={2.5} />
        </div>

        {/* 6. Control Center */}
        <div className="px-2 h-[24px] flex items-center justify-center rounded-[4px] cursor-default transition-colors hover:bg-white/10">
          <svg width="16" height="16" viewBox="0 0 16 16">
            <defs>
              <mask id="cc-mask-new">
                <rect width="16" height="16" fill="white" />
                <rect x="9" y="10" width="4" height="2.5" rx="1.25" fill="black" />
              </mask>
            </defs>
            <rect x="1.5" y="2.75" width="13" height="4" rx="2" fill="none" stroke="currentColor" strokeWidth="1.75" />
            <rect x="3" y="3.5" width="4" height="2.5" rx="1.25" fill="currentColor" />
            <rect x="0.75" y="8.5" width="14.5" height="5.5" rx="2.75" fill="currentColor" mask="url(#cc-mask-new)" />
          </svg>
        </div>

        {/* 7. Date / Time */}
        <div className="px-2 h-[24px] flex items-center justify-center rounded-[4px] cursor-default transition-colors hover:bg-white/10">
          <span className="text-[12.5px] font-medium tracking-[0.2px] mt-[0.5px] tabular-nums min-w-[155px] text-right">{formattedTime}</span>
        </div>
      </div>
    </div>
  );
};
