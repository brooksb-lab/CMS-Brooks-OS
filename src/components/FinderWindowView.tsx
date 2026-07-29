import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useWindowManager } from '../hooks/useWindowManager';
import { DesktopFolderView, FolderItem } from './DesktopFolderView';
import { Monitor, LayoutGrid, Film, Shirt, HardDrive, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';

export type FinderPath = 'Desktop' | 'Applications' | 'Film' | 'Apparel' | 'Archive' | 'Trash';

export type FinderLocation =
  | { type: 'sidebar'; path: FinderPath }
  | { type: 'folder'; id: string; title: string };

interface FinderWindowViewProps {
  initialPath?: string;
  hasSidebar?: boolean;
  onTitleChange?: (title: string) => void;
  onNavStateChange?: (navState: { canGoBack: boolean; canGoForward: boolean; goBack: () => void; goForward: () => void }) => void;
}

const GENERIC_FOLDER_ICON = "https://res.cloudinary.com/dezas8twg/image/upload/v1777921908/BrooksOS_0003_Folder_tptbpo.png";
const GENERIC_DOC_ICON = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect x="12" y="6" width="40" height="52" rx="4" fill="%23f0f0f0" stroke="%23cccccc" stroke-width="1.5"/><path d="M38 6 L52 20 L38 20 Z" fill="%23e0e0e0"/><path d="M38 6 L38 20 L52 20" fill="none" stroke="%23cccccc" stroke-width="1.5"/></svg>';

import { DOCK_ORDER } from '../data/dockOrder';

export const FinderWindowView: React.FC<FinderWindowViewProps> = ({
  initialPath = 'Archive',
  hasSidebar: propHasSidebar,
  onTitleChange,
  onNavStateChange,
}) => {
  const { windows, toggleWindow } = useWindowManager();

  const isFinderWindow = initialPath === 'Archive' || initialPath === 'Trash';
  const hasSidebar = propHasSidebar !== undefined ? propHasSidebar : isFinderWindow;

  const [sidebarWidth, setSidebarWidth] = useState(200);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, width: 0 });

  // Initial location
  const initialLoc: FinderLocation = useMemo(() => {
    if (['Desktop', 'Applications', 'Film', 'Apparel', 'Archive', 'Trash'].includes(initialPath)) {
      return { type: 'sidebar', path: initialPath as FinderPath };
    }
    const app = windows[initialPath];
    return { type: 'folder', id: initialPath, title: app?.title || initialPath };
  }, [initialPath, windows]);

  // Navigation History Stack
  const [history, setHistory] = useState<FinderLocation[]>([initialLoc]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [activeSidebarPath, setActiveSidebarPath] = useState<FinderPath>(
    initialLoc.type === 'sidebar' ? initialLoc.path : (initialPath === 'Trash' ? 'Trash' : 'Archive')
  );

  const currentLoc = history[currentIndex] || initialLoc;

  // Title calculation
  const currentTitle = useMemo(() => {
    if (currentLoc.type === 'sidebar') {
      return currentLoc.path;
    }
    return currentLoc.title;
  }, [currentLoc]);

  // Navigation handlers
  const navigateTo = useCallback((newLoc: FinderLocation) => {
    setHistory((prev) => {
      const nextHist = prev.slice(0, currentIndex + 1);
      nextHist.push(newLoc);
      return nextHist;
    });
    setCurrentIndex((prev) => prev + 1);
  }, [currentIndex]);

  const goBack = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const goForward = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, history.length]);

  // Report title and nav state to Window titlebar
  useEffect(() => {
    onTitleChange?.(currentTitle);
    onNavStateChange?.({
      canGoBack: currentIndex > 0,
      canGoForward: currentIndex < history.length - 1,
      goBack,
      goForward,
    });
  }, [currentTitle, currentIndex, history.length, goBack, goForward, onTitleChange, onNavStateChange]);

  // Sidebar drag resizer
  const handleDragStart = (e: React.PointerEvent) => {
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, width: sidebarWidth };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handleDrag = (e: React.PointerEvent) => {
    if (isDragging) {
      const dx = e.clientX - dragStartRef.current.x;
      const newWidth = Math.min(Math.max(120, dragStartRef.current.width + dx), 320);
      setSidebarWidth(newWidth);
    }
  };

  const handleDragEnd = (e: React.PointerEvent) => {
    setIsDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
  };

  // Sidebar Row Click
  const handleSidebarClick = (path: FinderPath) => {
    if (activeSidebarPath === path && currentLoc.type === 'folder') {
      // Returning to pane root
      navigateTo({ type: 'sidebar', path });
    } else {
      setActiveSidebarPath(path);
      navigateTo({ type: 'sidebar', path });
    }
  };

  // Dynamic Content Items for current location
  const displayItems = useMemo<FolderItem[]>(() => {
    if (currentLoc.type === 'sidebar') {
      switch (currentLoc.path) {
        case 'Desktop':
          return Object.values(windows)
            .filter((app: any) => app.showOnDesktop !== false)
            .map((app: any) => ({
              id: app.id,
              title: app.title,
              icon: app.icon,
              variant: app.variant,
              folderContents: app.folderContents,
            }));

        case 'Applications':
          return DOCK_ORDER
            .map((id) => windows[id])
            .filter((app: any) => app && app.showInDock !== false)
            .map((app: any) => ({
              id: app.id,
              title: app.title,
              icon: app.icon,
              variant: app.variant,
              folderContents: app.folderContents,
            }));

        case 'Film': {
          const ids = windows['film']?.folderContents || [];
          return ids.map((id: string) => ({
            id,
            title: windows[id]?.title || id,
            icon: windows[id]?.icon,
            variant: windows[id]?.variant,
            folderContents: windows[id]?.folderContents,
          }));
        }

        case 'Apparel': {
          const ids = windows['apparel']?.folderContents || [];
          return ids.map((id: string) => ({
            id,
            title: windows[id]?.title || id,
            icon: windows[id]?.icon,
            variant: windows[id]?.variant,
            folderContents: windows[id]?.folderContents,
          }));
        }

        case 'Archive':
          return [
            { id: 'Applications', title: 'Applications', icon: GENERIC_FOLDER_ICON, variant: 'folder' },
            { id: 'Library', title: 'Library', icon: GENERIC_FOLDER_ICON, variant: 'folder' },
            { id: 'System', title: 'System', icon: GENERIC_FOLDER_ICON, variant: 'folder' },
            { id: 'Users', title: 'Users', icon: GENERIC_FOLDER_ICON, variant: 'folder' },
            ...(windows['resume']
              ? [
                  {
                    id: 'resume',
                    title: windows['resume'].title,
                    icon: windows['resume'].icon,
                  },
                ]
              : []),
          ];

        case 'Trash':
          return [
            { id: 'trash_1', title: 'UNTITLED 01', icon: GENERIC_DOC_ICON },
            { id: 'trash_2', title: 'UNTITLED 02', icon: GENERIC_DOC_ICON },
            { id: 'trash_3', title: 'UNTITLED 03', icon: GENERIC_DOC_ICON },
            { id: 'trash_4', title: 'UNTITLED 04', icon: GENERIC_DOC_ICON },
            { id: 'trash_5', title: 'UNTITLED 05', icon: GENERIC_DOC_ICON },
          ];
      }
    } else {
      // Folder location
      const app = windows[currentLoc.id];
      if (app && app.folderContents && app.folderContents.length > 0) {
        return app.folderContents.map((id: string) => ({
          id,
          title: windows[id]?.title || id,
          icon: windows[id]?.icon,
          variant: windows[id]?.variant,
          folderContents: windows[id]?.folderContents,
        }));
      }
      return [];
    }
  }, [currentLoc, windows]);

  // Open item action (double click)
  const handleOpenItem = (item: FolderItem, rect?: { top: number; left: number; width: number; height: number }) => {
    // If double clicked a built-in category
    if (['Desktop', 'Applications', 'Film', 'Apparel', 'Archive', 'Trash'].includes(item.id)) {
      handleSidebarClick(item.id as FinderPath);
      return;
    }

    const app = windows[item.id];
    const isFolder = item.variant === 'folder' || Boolean(item.folderContents) || app?.variant === 'folder';

    if (isFolder) {
      // Navigate in place inside current window!
      navigateTo({ type: 'folder', id: item.id, title: item.title });
    } else if (app) {
      // File or app icon opens registered window!
      toggleWindow(item.id, rect);
    } else if (item.action) {
      item.action(rect);
    }
  };

  return (
    <div className="flex h-full w-full bg-[#1e1e1e] text-white select-none overflow-hidden">
      {/* Sidebar (Archive & Trash only) */}
      {hasSidebar && (
        <div 
          className={cn(
            "flex flex-col bg-[#282828] h-full shrink-0 select-none transition-[width] duration-200 ease-in-out overflow-hidden",
            !isSidebarVisible && "w-0 px-0"
          )}
          style={{ width: isSidebarVisible ? sidebarWidth : 0 }}
        >
          <div className="flex flex-col h-full w-full overflow-y-auto py-3 px-2 border-r border-black/40">
            {/* Favorites */}
            <div className="px-2.5 mb-1 text-[11px] font-bold text-white/40 tracking-wider uppercase">
              Favorites
            </div>
            <div className="flex flex-col space-y-0.5 mb-3">
              <button
                type="button"
                onClick={() => handleSidebarClick('Desktop')}
                className={cn(
                  "flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[13px] font-normal w-full text-left cursor-pointer transition-colors",
                  activeSidebarPath === 'Desktop' ? "bg-[#0058d0] text-white" : "text-white/80 hover:bg-white/10 hover:text-white"
                )}
              >
                <Monitor className="w-4 h-4 shrink-0" />
                <span className="truncate">Desktop</span>
              </button>

              <button
                type="button"
                onClick={() => handleSidebarClick('Applications')}
                className={cn(
                  "flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[13px] font-normal w-full text-left cursor-pointer transition-colors",
                  activeSidebarPath === 'Applications' ? "bg-[#0058d0] text-white" : "text-white/80 hover:bg-white/10 hover:text-white"
                )}
              >
                <LayoutGrid className="w-4 h-4 shrink-0" />
                <span className="truncate">Applications</span>
              </button>

              <button
                type="button"
                onClick={() => handleSidebarClick('Film')}
                className={cn(
                  "flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[13px] font-normal w-full text-left cursor-pointer transition-colors",
                  activeSidebarPath === 'Film' ? "bg-[#0058d0] text-white" : "text-white/80 hover:bg-white/10 hover:text-white"
                )}
              >
                <Film className="w-4 h-4 shrink-0" />
                <span className="truncate">Film</span>
              </button>

              <button
                type="button"
                onClick={() => handleSidebarClick('Apparel')}
                className={cn(
                  "flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[13px] font-normal w-full text-left cursor-pointer transition-colors",
                  activeSidebarPath === 'Apparel' ? "bg-[#0058d0] text-white" : "text-white/80 hover:bg-white/10 hover:text-white"
                )}
              >
                <Shirt className="w-4 h-4 shrink-0" />
                <span className="truncate">Apparel</span>
              </button>
            </div>

            {/* Locations */}
            <div className="px-2.5 mb-1 text-[11px] font-bold text-white/40 tracking-wider uppercase">
              Locations
            </div>
            <div className="flex flex-col space-y-0.5">
              {initialPath === 'Trash' ? (
                <button
                  type="button"
                  onClick={() => handleSidebarClick('Trash')}
                  className={cn(
                    "flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[13px] font-normal w-full text-left cursor-pointer transition-colors",
                    activeSidebarPath === 'Trash' ? "bg-[#0058d0] text-white" : "text-white/80 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <Trash2 className="w-4 h-4 shrink-0" />
                  <span className="truncate">Trash</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSidebarClick('Archive')}
                  className={cn(
                    "flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[13px] font-normal w-full text-left cursor-pointer transition-colors",
                    activeSidebarPath === 'Archive' ? "bg-[#0058d0] text-white" : "text-white/80 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <HardDrive className="w-4 h-4 shrink-0" />
                  <span className="truncate">Archive</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Resizer Divider */}
      {hasSidebar && isSidebarVisible && (
        <div 
          className="w-[1px] bg-black/40 h-full cursor-col-resize hover:bg-blue-500/50 active:bg-blue-500 z-10 transition-colors shrink-0"
          onPointerDown={handleDragStart}
          onPointerMove={handleDrag}
          onPointerUp={handleDragEnd}
          onPointerCancel={handleDragEnd}
        />
      )}

      {/* Content Pane */}
      <div className="flex-1 h-full min-w-0 flex flex-col bg-[#1e1e1e] overflow-hidden">
        <DesktopFolderView 
          items={displayItems}
          windows={windows}
          toggleWindow={toggleWindow}
          onOpenItem={handleOpenItem}
          hasSidebar={hasSidebar}
          isSidebarVisible={isSidebarVisible}
          onToggleSidebar={() => setIsSidebarVisible(!isSidebarVisible)}
        />
      </div>
    </div>
  );
};


