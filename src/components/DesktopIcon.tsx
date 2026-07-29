import React from 'react';
import { motion } from 'motion/react';
import { FolderIcon } from './FolderIcon';
import { cn } from '../lib/utils';

interface DesktopIconProps {
  id: string;
  icon: string;
  label: string;
  initialX?: string | number;
  initialY?: string | number;
  variant?: 'default' | 'folder';
  folderContents?: string[];
  windows?: any;
  isTouchUI?: boolean;
  isAnyDragging?: boolean;
  setIsDraggingAny?: (val: boolean) => void;
  zIndex?: number;
  constraintsRef?: React.RefObject<HTMLDivElement | null>;
  onDragStart?: (id: string) => void;
  onDragMove?: (id: string, dx: number, dy: number) => void;
  onDragEnd?: (id: string, rect: { left: number; top: number; width: number; height: number }) => void;
  onClick: (id: string, rect: { top: number; left: number; width: number; height: number }) => void;
  isSelected?: boolean;
}

export const DesktopIcon: React.FC<DesktopIconProps> = ({ 
  id, icon, label, initialX = 0, initialY = 0, variant, folderContents, windows, isTouchUI, 
  isAnyDragging, setIsDraggingAny, zIndex = 10, constraintsRef, onDragStart, onDragMove, onDragEnd, onClick,
  isSelected
}) => {
  const [isDragging, setIsDragging] = React.useState(false);
  const isDraggingRef = React.useRef(false);
  const hasMovedRef = React.useRef(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const offsetRef = React.useRef({ x: 0, y: 0 });
  const startPosRef = React.useRef({ x: 0, y: 0 });

  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    const el = containerRef.current;
    if (!el) return;

    if (e.pointerType === 'mouse') {
      e.preventDefault();
    }
    
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (err) {}
    
    isDraggingRef.current = true;
    hasMovedRef.current = false;
    startPosRef.current = { x: e.clientX, y: e.clientY };

    const rect = el.getBoundingClientRect();
    offsetRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    const handlePointerMove = (e: PointerEvent) => {
      const dx = e.clientX - startPosRef.current.x;
      const dy = e.clientY - startPosRef.current.y;
      const threshold = 3;

      if (!hasMovedRef.current) {
        if (Math.abs(dx) > threshold || Math.abs(dy) > threshold) {
          hasMovedRef.current = true;
          setIsDragging(true);
          document.body.style.cursor = 'grabbing';
          setIsDraggingAny?.(true);
          onDragStart?.(id);
          el.style.zIndex = '1000';
        } else {
          return;
        }
      }

      const MENU_BAR = 24;
      const DOCK_SAFE = 80;
      const iconW = el.offsetWidth || 100;
      const iconH = el.offsetHeight || 116;

      let x = e.clientX - offsetRef.current.x;
      let y = e.clientY - offsetRef.current.y;

      x = Math.max(0, Math.min(x, window.innerWidth - iconW));
      y = Math.max(MENU_BAR, Math.min(y, window.innerHeight - DOCK_SAFE - iconH));

      el.style.left = `${x}px`;
      el.style.top = `${y}px`;

      if (isSelected && onDragMove) {
        onDragMove(id, e.clientX - startPosRef.current.x, e.clientY - startPosRef.current.y);
      }
    };

    const handlePointerUp = (e: PointerEvent) => {
      isDraggingRef.current = false;
      setIsDragging(false);
      document.body.style.cursor = '';
      const wasDragged = hasMovedRef.current;

      setIsDraggingAny?.(false);
      el.style.zIndex = zIndex.toString();
      
      if (wasDragged) {
        if (onDragEnd) {
          onDragEnd(id, el.getBoundingClientRect());
        }
        // Keep hasMovedRef true briefly to prevent click handler from triggering
        setTimeout(() => {
          hasMovedRef.current = false;
        }, 250);
      } else {
        hasMovedRef.current = false;
      }

      const target = e.target as HTMLElement | null;
      if (target && target.releasePointerCapture) {
        try {
          target.releasePointerCapture(e.pointerId);
        } catch(err) {}
      }

      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
      document.removeEventListener('pointercancel', handlePointerUp);
    };

    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
    document.addEventListener('pointercancel', handlePointerUp);
  };

  return (
    <motion.div
      ref={containerRef}
      data-desktop-icon-id={id}
      layout={false}
      initial={false}
      animate={{ rotate: 0, scale: 1, zIndex }}
      style={{ 
        position: 'absolute',
        left: typeof initialX === 'number' ? `${initialX}px` : initialX, 
        top: typeof initialY === 'number' ? `${initialY}px` : initialY,
        zIndex,
        touchAction: 'none',
        WebkitTouchCallout: 'none' as any
      }}
      onPointerDown={handlePointerDown}
      onContextMenu={(e) => {
        e.preventDefault(); 
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (!hasMovedRef.current && !isDraggingRef.current) {
          onDragStart?.(id);
          const rect = e.currentTarget.getBoundingClientRect();
          onClick(id, {
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height
          });
        }
      }}
      className={cn(
        "icon flex flex-col items-center justify-center gap-1 group p-1 w-[100px] h-[116px] pointer-events-auto rounded-md transition-colors select-none",
        isDragging ? "cursor-grabbing" : "cursor-pointer active:cursor-grabbing",
        isSelected && !isAnyDragging ? "bg-white/10" : ""
      )}
    >
      <div className={cn(
        "flex items-center justify-center shrink-0",
        isTouchUI ? "w-[60px] h-[60px] sm:w-[72px] sm:h-[72px]" : "w-[76px] h-[76px]"
      )}>
        <motion.div 
          layoutId={`folder-${id}`} 
          className="w-full h-full relative" 
          style={{ originX: 0.5, originY: 0.5 }}
        >
          {variant === 'folder' && folderContents && windows && isTouchUI ? (
            <FolderIcon appIds={folderContents} windows={windows} isTouchUI={isTouchUI} />
          ) : (
            <img 
              src={icon} 
              alt={label} 
              className={cn(
                "w-full h-full object-contain filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)] pointer-events-none",
                isSelected && !isAnyDragging && "brightness-75 contrast-125"
              )} 
              referrerPolicy="no-referrer"
              draggable={false} 
            />
          )}
        </motion.div>
      </div>
      <span className={cn(
        "font-bold text-white text-center leading-tight drop-shadow-md tracking-wider shadow-black/50 text-shadow",
        isTouchUI ? "text-[12px] px-1" : "text-[12px]",
        isSelected && !isAnyDragging && "bg-blue-500 rounded px-1"
      )}>
        {label}
      </span>
    </motion.div>
  );
};
