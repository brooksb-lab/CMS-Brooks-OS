import React, { useState, useRef, useMemo, useEffect } from 'react';
import { cn } from '../lib/utils';
import { PanelLeft } from 'lucide-react';

export interface FolderItem {
  id: string;
  title: string;
  icon: string;
  variant?: string;
  folderContents?: string[];
  action?: (rect?: { top: number; left: number; width: number; height: number }) => void;
}

interface DesktopFolderViewProps {
  appIds?: string[];
  items?: FolderItem[];
  windows?: Record<string, any>;
  toggleWindow?: (id: string, rect?: { top: number; left: number; width: number; height: number }) => void;
  onOpenItem?: (item: FolderItem, rect?: { top: number; left: number; width: number; height: number }) => void;
  hasSidebar?: boolean;
  isSidebarVisible?: boolean;
  onToggleSidebar?: () => void;
}

export const DesktopFolderView: React.FC<DesktopFolderViewProps> = ({
  appIds,
  items,
  windows,
  toggleWindow,
  onOpenItem,
  hasSidebar,
  isSidebarVisible,
  onToggleSidebar,
}) => {
  const [iconSize, setIconSize] = useState<number>(64);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Marquee selection state
  const gridContainerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [marqueeBox, setMarqueeBox] = useState<{ left: number; top: number; width: number; height: number } | null>(null);
  const isDraggingMarquee = useRef(false);
  const dragStartPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const initialSelection = useRef<Set<string>>(new Set());

  const displayItems: FolderItem[] = useMemo(() => {
    if (items) return items;
    if (appIds && windows) {
      return appIds
        .map(id => {
          const app = windows[id];
          if (!app) return null;
          return {
            id,
            title: app.title,
            icon: app.icon,
            variant: app.variant,
            folderContents: app.folderContents,
            action: (rect?: { top: number; left: number; width: number; height: number }) => toggleWindow?.(id, rect),
          };
        })
        .filter((item): item is FolderItem => item !== null);
    }
    return [];
  }, [items, appIds, windows, toggleWindow]);

  // Derive cell dimensions based on iconSize
  const cellWidth = Math.max(Math.round(iconSize * 1.4), 80);
  const gapX = 16;
  const gapY = 20;

  // Clear selection when items change
  useEffect(() => {
    setSelectedIds(new Set());
  }, [items, appIds]);

  // Marquee selection handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    // Only primary mouse button or touch
    if (e.button !== 0) return;

    // Must start from empty grid space (not an item card or child button/slider)
    const target = e.target as HTMLElement;
    if (target.closest('.group') || target.closest('button') || target.closest('input')) {
      return;
    }

    const container = gridContainerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left + container.scrollLeft;
    const y = e.clientY - rect.top + container.scrollTop;

    isDraggingMarquee.current = true;
    dragStartPos.current = { x, y };

    if (e.shiftKey) {
      initialSelection.current = new Set(selectedIds);
    } else {
      initialSelection.current = new Set();
      setSelectedIds(new Set());
    }

    container.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingMarquee.current) return;

    const container = gridContainerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const currentX = e.clientX - rect.left + container.scrollLeft;
    const currentY = e.clientY - rect.top + container.scrollTop;

    const left = Math.min(dragStartPos.current.x, currentX);
    const top = Math.min(dragStartPos.current.y, currentY);
    const width = Math.abs(currentX - dragStartPos.current.x);
    const height = Math.abs(currentY - dragStartPos.current.y);

    setMarqueeBox({ left, top, width, height });

    // Calculate intersecting items
    const nextSelected = new Set(initialSelection.current);

    displayItems.forEach((item) => {
      const itemEl = itemRefs.current[item.id];
      if (!itemEl) return;

      const itemLeft = itemEl.offsetLeft;
      const itemTop = itemEl.offsetTop;
      const itemWidth = itemEl.offsetWidth;
      const itemHeight = itemEl.offsetHeight;

      const intersects = !(
        itemLeft > left + width ||
        itemLeft + itemWidth < left ||
        itemTop > top + height ||
        itemTop + itemHeight < top
      );

      if (intersects) {
        nextSelected.add(item.id);
      }
    });

    setSelectedIds(nextSelected);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDraggingMarquee.current) return;
    isDraggingMarquee.current = false;
    setMarqueeBox(null);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
  };

  return (
    <div 
      className="flex flex-col h-full w-full relative bg-[#1e1e1e] text-white select-none overflow-hidden cursor-default"
    >
      {/* Scrollable Grid Container */}
      <div 
        ref={gridContainerRef}
        className="flex-1 min-h-0 overflow-y-auto p-4 w-full relative"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* Marquee Selection Rectangle */}
        {marqueeBox && (
          <div 
            className="absolute border border-[#0058d0] bg-[#0058d0]/20 pointer-events-none z-30 rounded-[2px]"
            style={{
              left: `${marqueeBox.left}px`,
              top: `${marqueeBox.top}px`,
              width: `${marqueeBox.width}px`,
              height: `${marqueeBox.height}px`,
            }}
          />
        )}

        <div 
          className="grid justify-start align-start"
          style={{
            gridTemplateColumns: `repeat(auto-fill, ${cellWidth}px)`,
            gap: `${gapY}px ${gapX}px`,
          }}
        >
          {displayItems.map((item) => {
            const isSelected = selectedIds.has(item.id);

            return (
              <div
                key={item.id}
                ref={(el) => { itemRefs.current[item.id] = el; }}
                className="flex flex-col items-center justify-start cursor-default select-none group relative"
                style={{ width: `${cellWidth}px` }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (e.shiftKey) {
                    const next = new Set(selectedIds);
                    if (next.has(item.id)) next.delete(item.id);
                    else next.add(item.id);
                    setSelectedIds(next);
                  } else {
                    setSelectedIds(new Set([item.id]));
                  }
                }}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  const rect = e.currentTarget.getBoundingClientRect();
                  if (onOpenItem) {
                    onOpenItem(item, {
                      top: rect.top,
                      left: rect.left,
                      width: rect.width,
                      height: rect.height,
                    });
                  } else if (item.action) {
                    item.action({
                      top: rect.top,
                      left: rect.left,
                      width: rect.width,
                      height: rect.height,
                    });
                  }
                }}
              >
                {/* Icon Area: centered horizontally, bottom-aligned baseline */}
                <div 
                  className="flex items-end justify-center relative mb-1.5"
                  style={{ width: `${iconSize}px`, height: `${iconSize}px` }}
                >
                  <img 
                    src={item.icon} 
                    alt={item.title} 
                    className={cn(
                      "max-w-full max-h-full object-contain pointer-events-none transition-none",
                      isSelected && "brightness-[0.85]"
                    )} 
                    draggable={false} 
                  />
                </div>

                {/* Label Area: single line, centered, ellipsis truncation at cell width */}
                <div className="max-w-full px-1 flex justify-center">
                  <span
                    className={cn(
                      "text-[12px] leading-[16px] text-center whitespace-nowrap overflow-hidden text-ellipsis px-1.5 py-0.5 rounded-[4px] max-w-full transition-none",
                      isSelected
                        ? "bg-[#0058d0] text-white font-normal"
                        : "text-white/90 font-normal"
                    )}
                    title={item.title}
                  >
                    {item.title}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pinned Bottom Status Bar */}
      <div 
        className="h-[28px] min-h-[28px] shrink-0 w-full bg-[#282828] border-t border-black/40 flex items-center justify-between px-3 relative select-none z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left side: Sidebar Toggle Glyph (Archive & Trash only) */}
        {hasSidebar && onToggleSidebar ? (
          <button
            type="button"
            onClick={onToggleSidebar}
            className="p-1 -ml-1 rounded hover:bg-white/10 text-white/60 hover:text-white cursor-pointer transition-colors"
            title={isSidebarVisible ? "Hide Sidebar" : "Show Sidebar"}
          >
            <PanelLeft className="w-3.5 h-3.5" />
          </button>
        ) : (
          <div className="w-4" />
        )}

        {/* Centered Item Count */}
        <div className="absolute left-1/2 -translate-x-1/2 text-[11px] text-white/50 font-normal pointer-events-none select-none">
          {displayItems.length} {displayItems.length === 1 ? 'item' : 'items'}
        </div>

        {/* Right side: Zoom Slider */}
        <div className="flex items-center gap-1.5 ml-auto mr-1 pointer-events-auto">
          {/* Tiny small-square glyph */}
          <svg className="w-2.5 h-2.5 text-white/40 fill-none stroke-current stroke-[1.5]" viewBox="0 0 10 10">
            <rect x="1" y="1" width="8" height="8" rx="1" />
          </svg>

          {/* Slider */}
          <input
            type="range"
            min="32"
            max="128"
            value={iconSize}
            onChange={(e) => setIconSize(Number(e.target.value))}
            className="finder-zoom-slider w-[80px] focus:outline-none"
          />

          {/* Large-square glyph */}
          <svg className="w-3.5 h-3.5 text-white/40 fill-none stroke-current stroke-[1.5]" viewBox="0 0 14 14">
            <rect x="1" y="1" width="12" height="12" rx="1" />
          </svg>
        </div>
      </div>
    </div>
  );
};

