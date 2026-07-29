import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { cn } from '@/src/lib/utils';

import { FolderIcon } from './FolderIcon';

interface DockIconProps {
  id: string;
  icon: string;
  label: string;
  isOpen: boolean;
  isActive: boolean;
  isMinimizedPlaceholder?: boolean;
  variant?: 'default' | 'folder';
  folderContents?: string[];
  windows?: any;
  onClick: (rect: { top: number; left: number; width: number; height: number }) => void;
  onMountRect?: (rect: { top: number; left: number; width: number; height: number } | undefined) => void;
  mouseX: any;
  baseSize: any;
}

const DockIcon: React.FC<DockIconProps> = ({ 
  id, icon, label, isOpen, isActive, isMinimizedPlaceholder, variant, folderContents, windows, onClick, onMountRect, baseSize, mouseX 
}) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const isTouchUI = false;

  useEffect(() => {
    if (onMountRect && ref.current) {
      const updateRect = () => {
        if (ref.current) {
          const rect = ref.current.getBoundingClientRect();
          onMountRect({ top: rect.top, left: rect.left, width: rect.width, height: rect.height });
        }
      };

      // Initial delay
      const timer = setTimeout(updateRect, 50);
      
      const ro = new ResizeObserver(() => {
        updateRect();
      });
      ro.observe(ref.current);
      
      let frame: number;
      const loop = () => {
        updateRect();
        frame = requestAnimationFrame(loop);
      };
      // We can use rAF while hovering the dock, but RO should be enough for Resize.
      // Wait, because we animate width/height with transform in Framer Motion, ResizeObserver won't fire for CSS transform changes!
      // But DockIcon's width is set via `style={{ width: widthTransform }}`! So it DOES change structural width, RO will fire!

      return () => {
        clearTimeout(timer);
        ro.disconnect();
        onMountRect(undefined);
      };
    }
  }, [onMountRect]);

  let widthTransform = useTransform(() => {
    const val = mouseX.get();
    const bs = baseSize.get();
    if (val === Infinity) return bs;
    let bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    let d = val - bounds.x - bounds.width / 2;
    if (Math.abs(d) < 150) {
      let scale = 1.35;
      let factor = 1 - Math.abs(d) / 150;
      return bs + (bs * (scale - 1) * Math.sin((factor * Math.PI) / 2));
    }
    return bs;
  });

  return (
    <motion.div
      ref={ref}
      style={{ width: widthTransform, height: widthTransform }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={(e) => {
        e.stopPropagation();
        const rect = e.currentTarget.getBoundingClientRect();
        onClick({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height
        });
      }}
      className="relative aspect-square flex items-center justify-center group cursor-pointer active:cursor-grabbing"
    >
      <div className={cn("w-full h-full p-[2px] relative", isMinimizedPlaceholder && "opacity-0")}>
        {variant === 'folder' && folderContents && windows && isTouchUI ? (
          <FolderIcon appIds={folderContents} windows={windows} isTouchUI={isTouchUI} />
        ) : (
          <img
            src={icon}
            alt={label}
            className="w-full h-full object-contain drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)] transition-transform pointer-events-none"
            referrerPolicy="no-referrer"
          />
        )}
      </div>
      {isOpen && (
        <div className={cn(
          "absolute -bottom-[5px] w-[4px] h-[4px] rounded-full transition-all",
          "bg-white/80 shadow-[0_0_2px_rgba(0,0,0,0.3)]"
        )} />
      )}
      
      {/* Tooltip */}
      <div className={cn(
        "absolute bottom-[calc(100%+12px)] left-1/2 -translate-x-1/2 flex flex-col items-center transition-all duration-150 pointer-events-none z-[100]",
        isHovered ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-1"
      )}>
        <div 
          className="relative px-[14px] py-[6px] rounded-[8px] flex items-center justify-center"
          style={{
            backdropFilter: 'blur(20px) saturate(1.8)',
            WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
            backgroundColor: 'rgba(255, 255, 255, 0.18)',
            boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.6), inset 0 0 0 1px rgba(255, 255, 255, 0.25), 0 8px 32px rgba(0, 0, 0, 0.25)'
          }}
        >
          <span className="text-white text-[13.5px] font-sans font-medium whitespace-nowrap tracking-wide z-10 relative leading-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
            {label}
          </span>
          
          {/* Border layer with bottom gap for seamless caret attachment */}
          <div 
            className="absolute inset-0 rounded-[8px] pointer-events-none" 
            style={{
              border: '1px solid rgba(255, 255, 255, 0.2)',
              clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, calc(50% + 8.5px) 100%, calc(50% + 8.5px) calc(100% - 2px), calc(50% - 8.5px) calc(100% - 2px), calc(50% - 8.5px) 100%, 0% 100%)'
            }}
          />

          {/* Caret */}
          <div 
            className="absolute left-1/2 w-[12px] h-[12px] rotate-45 -translate-x-1/2 pointer-events-none" 
            style={{ 
              bottom: '-6px',
              backdropFilter: 'blur(20px) saturate(1.8)',
              WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
              backgroundColor: 'rgba(255, 255, 255, 0.18)',
              borderRight: '1px solid rgba(255, 255, 255, 0.25)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.25)',
              clipPath: 'polygon(0 100%, 100% 0, 100% 100%)',
              zIndex: -1
            }}
          />
        </div>
      </div>
    </motion.div>
  );
};

const RESIZE_CURSOR = `url("data:image/svg+xml;charset=utf-8,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M12 3V21M12 3L8 7M12 3L16 7M12 21L8 17M12 21L16 17' stroke='black' stroke-width='4.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3Cpath d='M12 3V21M12 3L8 7M12 3L16 7M12 21L8 17M12 21L16 17' stroke='white' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") 12 12, ns-resize`;

const Divider = ({ baseSize, onPointerDown }: { baseSize: any, onPointerDown?: any }) => {
  const height = useTransform(baseSize, (val: number) => val * 0.85);
  const mb = useTransform(baseSize, (val: number) => val * 0.07);
  return (
    <motion.div 
      className="flex justify-center -mx-1 shrink-0 group z-[60] px-2 touch-none"
      style={{ height, marginBottom: mb, cursor: RESIZE_CURSOR }}
      onPointerDown={onPointerDown}
    >
      <div className="w-[1.5px] h-full bg-white/20 rounded-full group-hover:bg-white/60 transition-colors pointer-events-none" />
    </motion.div>
  );
};

interface DockProps {
  pinnedApps: Array<{
    id: string;
    icon: string;
    label: string;
    isOpen: boolean;
    isActive: boolean;
    variant?: 'default' | 'folder';
    folderContents?: string[];
  }>;
  recentApps: Array<{
    id: string;
    icon: string;
    label: string;
    isOpen: boolean;
    isActive: boolean;
    variant?: 'default' | 'folder';
    folderContents?: string[];
  }>;
  minimizedApps?: Array<{
    id: string;
    icon: string;
    label: string;
    isOpen: boolean;
    isActive: boolean;
    variant?: 'default' | 'folder';
    folderContents?: string[];
  }>;
  onUpdateMinimizeRect?: (id: string, rect: { top: number; left: number; width: number; height: number } | undefined) => void;
  onAppClick: (id: string, rect: { top: number; left: number; width: number; height: number }) => void;
}

export const Dock = ({ pinnedApps, recentApps, minimizedApps = [], onUpdateMinimizeRect, windows, onAppClick }: DockProps & { windows: any }) => {
  const mouseX = useMotionValue(Infinity);
  const isTouchUI = false; // Add this

  // Setup scalable base size
  const [initialSize] = useState(() => {
    try {
      const saved = localStorage.getItem('dockSize');
      return saved ? parseFloat(saved) : 86;
    } catch {
      return 86;
    }
  });

  const baseSize = useMotionValue(initialSize);
  const dockBgHeight = useTransform(baseSize, (val) => `${val + 14}px`);
  const dockMinHeight = useTransform(baseSize, (val) => `${val + 14}px`);
  const dockGap = useTransform(baseSize, (val) => `${val * 0.20}px`);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    const startY = e.clientY;
    const startSize = baseSize.get();
    const target = e.currentTarget;

    try {
      target.setPointerCapture(e.pointerId);
    } catch {}

    const onPointerMove = (moveEvent: PointerEvent) => {
      moveEvent.preventDefault();
      // On Mac, moving mouse up (negative Y) increases dock size
      // Moving mouse down (positive Y) decreases it
      const dy = moveEvent.clientY - startY;
      let newSize = startSize - dy * 0.6; // 0.6 is the sensitivity multiplier
      
      // Mac limits dock size between a min and max
      if (newSize < 36) newSize = 36;
      if (newSize > 136) newSize = 136; 
      
      baseSize.set(newSize);
    };

    const onPointerUp = (upEvent: PointerEvent | Event) => {
      target.removeEventListener('pointermove', onPointerMove as EventListener);
      target.removeEventListener('pointerup', onPointerUp as EventListener);
      target.removeEventListener('pointercancel', onPointerUp as EventListener);
      window.removeEventListener('blur', onPointerUp as EventListener);
      document.body.style.cursor = 'default';
      
      try {
        if ('pointerId' in upEvent) {
          target.releasePointerCapture(upEvent.pointerId);
        }
      } catch {}

      try {
        localStorage.setItem('dockSize', baseSize.get().toString());
      } catch {}
    };

    target.addEventListener('pointermove', onPointerMove as EventListener);
    target.addEventListener('pointerup', onPointerUp as EventListener);
    target.addEventListener('pointercancel', onPointerUp as EventListener);
    window.addEventListener('blur', onPointerUp as EventListener);
    
    // Override body cursor while dragging
    document.body.style.cursor = RESIZE_CURSOR;
  };

  return (
    <motion.div
      onMouseMove={(e) => mouseX.set(e.clientX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className="relative flex items-end justify-center px-[10px] pb-[8px] z-50 touch-none"
      style={{ minHeight: dockMinHeight, gap: dockGap }}
    >
      {/* Background - Scalable height */}
      <motion.div 
        className="absolute left-0 right-0 bottom-0 rounded-[24px] -z-10 pointer-events-none" 
        style={{ 
          height: dockBgHeight,
          backdropFilter: 'blur(20px) saturate(1.5)', 
          WebkitBackdropFilter: 'blur(20px) saturate(1.5)',
          backgroundColor: 'transparent', 
          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.6), inset 0 0 0 1px rgba(255, 255, 255, 0.2), 0 10px 40px rgba(0, 0, 0, 0.2)'
        }} 
      />
      
      {pinnedApps.map((app) => (
        <DockIcon
            key={app.id}
            id={app.id}
            icon={app.icon}
            label={app.label}
            isOpen={app.isOpen}
            isActive={app.isActive}
            variant={app.variant}
            folderContents={app.folderContents}
            windows={windows}
            mouseX={mouseX}
            baseSize={baseSize}
            onClick={(rect) => onAppClick(app.id, rect)}
          />
        ))}

        {recentApps.length > 0 && (
          <Divider baseSize={baseSize} onPointerDown={handlePointerDown} />
        )}

        {recentApps.map((app) => (
          <DockIcon
            key={app.id}
            id={app.id}
            icon={app.icon}
            label={app.label}
            isOpen={app.isOpen}
            isActive={app.isActive}
            variant={app.variant}
            folderContents={app.folderContents}
            windows={windows}
            mouseX={mouseX}
            baseSize={baseSize}
            onClick={(rect) => onAppClick(app.id, rect)}
          />
        ))}

        {/* Separator before Minimized Apps and Trash */}
        {!isTouchUI && (
          <Divider baseSize={baseSize} onPointerDown={handlePointerDown} />
        )}

        {minimizedApps.map((app) => (
          <DockIcon
            key={app.id + '_minimized'}
            id={app.id}
            icon={app.icon}
            label={app.label}
            isOpen={app.isOpen}
            isActive={app.isActive}
            isMinimizedPlaceholder={true}
            variant={app.variant}
            folderContents={app.folderContents}
            windows={windows}
            mouseX={mouseX}
            baseSize={baseSize}
            onMountRect={(rect) => onUpdateMinimizeRect?.(app.id, rect)}
            onClick={(rect) => onAppClick(app.id, rect)}
          />
        ))}

        {/* Trash Icon */}
        {!isTouchUI && (
          <DockIcon
            id="trash"
            icon="https://res.cloudinary.com/dezas8twg/image/upload/v1778118599/Trash_ysly9w.png"
            label="Trash"
            isOpen={windows['trash']?.isOpen || false}
            isActive={false} // Would need activeWindowId or just false is fine
            mouseX={mouseX}
            baseSize={baseSize}
            onClick={(rect) => onAppClick('trash', rect)}
          />
        )}
      </motion.div>
  );
};

