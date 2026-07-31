import React, { useEffect, useState, useMemo } from 'react';
import { AnimatePresence, motion, useMotionValue, animate } from 'motion/react';
import { Smartphone, Tablet, Monitor, Wifi, Battery, ChevronDown, X } from 'lucide-react';
import { useWindowManager, WindowManagerProvider, type WindowState } from '@/src/hooks/useWindowManager';
import { Window } from '@/src/components/Window';
import { Dock } from '@/src/components/Dock';
import { DesktopIcon } from '@/src/components/DesktopIcon';
import { FolderIcon } from '@/src/components/FolderIcon';
import { DesktopFolderView } from '@/src/components/DesktopFolderView';
import { TopMenuBar } from '@/src/components/TopMenuBar';
import { FinderWindowView } from '@/src/components/FinderWindowView';
import { cn } from '@/src/lib/utils';
import { windowsRegistryData, resolveWindowComponent } from '@/src/data/windowLoader';
import { DOCK_ORDER as DESKTOP_DOCK_ORDER, MOBILE_DOCK_ORDER } from '@/src/data/dockOrder';

const ICONS = {
  photoshop: "https://res.cloudinary.com/dezas8twg/image/upload/v1778400134/BrooksOS_0013_Surface_hxvcao.png",
  clo: "https://res.cloudinary.com/dezas8twg/image/upload/v1777921907/BrooksOS_0014_CLO_b2tibj.png",
  flora: "https://res.cloudinary.com/dezas8twg/image/upload/v1778404806/Flow_wappha.svg",
  mail: "https://res.cloudinary.com/dezas8twg/image/upload/v1777921908/BrooksOS_0005_Mail_zpuiac.png",
  project: "https://res.cloudinary.com/dezas8twg/image/upload/v1777921910/BrooksOS_0006_Project_mjqqc4.png",
  ph: "https://res.cloudinary.com/dezas8twg/image/upload/v1777921909/BrooksOS_0004_PH_bnxmr4.png",
  onno: "https://res.cloudinary.com/dezas8twg/image/upload/v1777921908/BrooksOS_0007_ONNO-copy_oo8j1q.png",
  scatter: "https://i.ibb.co/5xhm7y8n/Scatter.png",
  imessage: "https://res.cloudinary.com/dezas8twg/image/upload/v1777921908/BrooksOS_0010_iMessage_ytpuio.png",
  threeDDesign: "https://res.cloudinary.com/dezas8twg/image/upload/v1777921909/BrooksOS_0011_3D-Design_cmo4xg.png",
  conceptDesign: "https://res.cloudinary.com/dezas8twg/image/upload/v1778440702/BrooksOS_0008_Concper-Design2_wy9jtb.png",
  folder: "https://res.cloudinary.com/dezas8twg/image/upload/v1777921908/BrooksOS_0003_Folder_tptbpo.png",
  note: "https://res.cloudinary.com/dezas8twg/image/upload/v1777921910/BrooksOS_0002_3840px-Apple_Notes_icon.svg_wqze4q.png",
  macintosh: "https://res.cloudinary.com/dezas8twg/image/upload/v1777921910/BrooksOS_0000_Macintosh-HD_qdutk7.png",
  spotify: "https://res.cloudinary.com/dezas8twg/image/upload/v1777921910/BrooksOS_0001_Spotify_yvwcbf.png",
  stickies: "https://res.cloudinary.com/dezas8twg/image/upload/v1778439408/Sticky_zdp4zj.svg"
};

const useDeviceType = () => {
  const [override, setOverrideState] = useState<'mobile' | 'tablet' | 'desktop' | null>(() => {
    return (sessionStorage.getItem('deviceOverride') as any) || null;
  });
  const [device, setDevice] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  const setOverride = (val: 'mobile' | 'tablet' | 'desktop' | null) => {
    setOverrideState(val);
    if (val) {
      sessionStorage.setItem('deviceOverride', val);
    } else {
      sessionStorage.removeItem('deviceOverride');
    }
  };

  useEffect(() => {
    if (override) {
      setDevice(override);
      return;
    }

    const checkDevice = () => {
      const isMobileDevice = 
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
        (/Macintosh/i.test(navigator.userAgent) && navigator.maxTouchPoints > 1);

      if (!isMobileDevice) {
        setDevice('desktop');
        return;
      }

      const width = window.innerWidth;
      if (width < 768) {
        setDevice('mobile');
      } else {
        setDevice('tablet');
      }
    };
    
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, [override]);

  return { device, override, setOverride };
};

const FolderContent = ({ appId, appIds, windows, toggleWindow, isTouchUI, closeFolder, isMobile }: any) => {
  if (!isTouchUI && !isMobile) {
    return (
      <FinderWindowView 
        initialPath={appId}
        hasSidebar={false}
      />
    );
  }

  return (
    <div className={cn(
      "grid gap-y-8 gap-x-4 w-full h-full justify-items-center overflow-y-auto",
      "grid-cols-3 content-start p-8 pt-10",
      isMobile && "pb-12"
    )}>
      {appIds.map((id: string) => {
        const app = windows[id];
        if (!app) return null;
        return (
          <div 
            key={id} 
            className="flex flex-col items-center gap-2 cursor-pointer active:cursor-grabbing active:scale-95 transition-transform"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              toggleWindow(id, {
                top: rect.top,
                left: rect.left,
                width: rect.width,
                height: rect.height
              });
              if (isTouchUI) closeFolder();
            }}
          >
            <div className={cn(
              "shrink-0 flex items-center justify-center",
              isTouchUI ? "w-[60px] h-[60px]" : "w-16 h-16"
            )}>
              <img src={app.icon} alt={app.title} className="w-full h-full object-contain filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)]" draggable={false} />
            </div>
            <span className={cn(
              "text-center font-medium w-[120px] px-1 leading-tight break-words",
              isTouchUI ? "text-white text-[11px]" : "text-white/80 text-xs"
            )}>
              {app.title}
            </span>
          </div>
        );
      })}
    </div>
  );
};

const DesktopApp = () => {
  const { windows, activeWindowId, registerWindow, openWindow, toggleWindow, closeWindow, minimizeWindow, setMinimizeRect, focusWindow, toggleFullScreen } = useWindowManager();
  const [isHoveringDockArea, setIsHoveringDockArea] = useState(false);
  const isAnyWindowMaximized = (Object.values(windows) as WindowState[]).some(w => w.isOpen && !w.isMinimized && w.isFullScreen);
  const desktopRef = React.useRef<HTMLDivElement>(null);
  const iconConstraintsRef = React.useRef<HTMLDivElement>(null);
  const [isDraggingAny, setIsDraggingAny] = useState(false);
  const [iconPos, setIconPos] = useState<Record<string, { x: number; y: number; z: number }>>({});
  const intendedPosRef = React.useRef<Record<string, { x: number; y: number; z: number }>>({});
  const multiDragStartPosRef = React.useRef<Record<string, { x: number; y: number }>>({});
  const [isDevToolOpen, setIsDevToolOpen] = useState(false);
  const [isDevToolHovered, setIsDevToolHovered] = useState(false);
  
  const [selection, setSelection] = useState<{ start: { x: number; y: number }; end: { x: number; y: number } } | null>(null);
  const [selectedIconIds, setSelectedIconIds] = useState<Set<string>>(new Set());
  const hasOpenedStickies = React.useRef(false);

  const [mobilePage, setMobilePage] = useState(0);
  const dragX = useMotionValue(0);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
      }
    };
    const handleGesture = (e: Event) => {
      e.preventDefault();
    };

    window.addEventListener('wheel', handleWheel, { passive: false, capture: true });
    window.addEventListener('gesturestart', handleGesture, { passive: false, capture: true });
    window.addEventListener('gesturechange', handleGesture, { passive: false, capture: true });

    return () => {
      window.removeEventListener('wheel', handleWheel, { capture: true } as any);
      window.removeEventListener('gesturestart', handleGesture, { capture: true } as any);
      window.removeEventListener('gesturechange', handleGesture, { capture: true } as any);
    };
  }, []);

  const handleIconDragStart = React.useCallback((id: string) => {
    // Bring to front logic
    setIconPos(prev => {
      const positions = Object.values(prev) as { z: number }[];
      const maxZ = positions.length > 0 
        ? Math.max(...positions.map(p => p.z || 10)) 
        : 10;
      
      const newPos = { ...prev };
      
      // If dragging a selected icon, bring ALL selected to front (just below the primary one)
      if (selectedIconIds.has(id)) {
        selectedIconIds.forEach(sid => {
          const current = prev[sid] || { x: 0, y: 0, z: 10 };
          newPos[sid] = { ...current, z: maxZ + (sid === id ? 2 : 1) };
        });
      } else {
        const current = prev[id] || { x: 0, y: 0, z: 10 };
        newPos[id] = { ...current, z: maxZ + 1 };
      }
      return newPos;
    });

    // Multi-drag start positions
    if (selectedIconIds.has(id)) {
      const starts: Record<string, { x: number; y: number }> = {};
      selectedIconIds.forEach(sid => {
        const el = document.querySelector(`[data-desktop-icon-id="${sid}"]`) as HTMLElement;
        if (el) {
          starts[sid] = { x: parseFloat(el.style.left), y: parseFloat(el.style.top) };
        }
      });
      multiDragStartPosRef.current = starts;
    }
  }, [selectedIconIds]);

  const handleIconDragMove = React.useCallback((draggingId: string, dx: number, dy: number) => {
    if (!selectedIconIds.has(draggingId)) return;

    const MENU_BAR = 32;
    const DOCK_SAFE = 120;

    selectedIconIds.forEach(sid => {
      if (sid === draggingId) return; // Primary is handled by its own component logic
      
      const el = document.querySelector(`[data-desktop-icon-id="${sid}"]`) as HTMLElement;
      const start = multiDragStartPosRef.current[sid];
      if (el && start) {
        let newX = start.x + dx;
        let newY = start.y + dy;
        
        // Clamping (optional, but consistent with primary)
        newX = Math.max(0, Math.min(newX, window.innerWidth - 80));
        newY = Math.max(MENU_BAR, Math.min(newY, window.innerHeight - DOCK_SAFE - 96));
        
        el.style.left = `${newX}px`;
        el.style.top = `${newY}px`;
      }
    });
  }, [selectedIconIds]);

  const handleIconDragEnd = React.useCallback((id: string, rect: { left: number; top: number; width: number; height: number }) => {
    setIconPos(prev => {
      const MENU_BAR = 32;
      const DOCK = 120;
      const ICON_W = 100;
      const ICON_H = 116;

      const maxX = window.innerWidth - ICON_W;
      const maxY = window.innerHeight - DOCK - ICON_H;
      const minX = 0;
      const minY = MENU_BAR;

      const newPos = { ...prev };
      const idsToUpdate: string[] = selectedIconIds.has(id) ? Array.from(selectedIconIds) : [id];

      idsToUpdate.forEach((sid: string) => {
        const el = document.querySelector(`[data-desktop-icon-id="${sid}"]`) as HTMLElement;
        if (el) {
          const l = parseFloat(el.style.left);
          const t = parseFloat(el.style.top);
          
          const finalX = Math.max(minX, Math.min(maxX, l));
          const finalY = Math.max(minY, Math.min(maxY, t));
          
          const maxZ = Math.max(...(Object.values(newPos) as { z: number }[]).map(p => p.z || 10), 10);
          
          newPos[sid] = {
            x: finalX,
            y: finalY,
            z: newPos[sid]?.z || maxZ + 1
          };
          intendedPosRef.current[sid] = { x: finalX, y: finalY, z: newPos[sid].z };
        }
      });

      return newPos;
    });
    multiDragStartPosRef.current = {};
  }, [selectedIconIds]);

  // Global safety net to ensure shaking stops even if onDragEnd is missed
  useEffect(() => {
    if (isDraggingAny) {
      const handleGlobalUp = () => setIsDraggingAny(false);
      window.addEventListener('pointerup', handleGlobalUp);
      window.addEventListener('touchend', handleGlobalUp);
      return () => {
        window.removeEventListener('pointerup', handleGlobalUp);
        window.removeEventListener('touchend', handleGlobalUp);
      };
    }
  }, [isDraggingAny]);

  const { device, override, setOverride } = useDeviceType();
  const isMobile = device === 'mobile';
  const isTablet = device === 'tablet';
  const isDesktop = device === 'desktop';
  const isTouchUI = !isDesktop;
  
  const isDevEnv = window.location.hostname.includes('-dev-') || window.location.hostname.includes('localhost');

  useEffect(() => {
    // Spatial Layout Constraints & Parameters
    const desktopConfigs = [
      { id: 'macintosh_hd', base: { x: 95, y: 10 }, jitter: 0 },
      { id: 'scatter', base: { x: 14, y: 22 }, jitter: 0 },
      { id: 'film', base: { x: 69, y: 24 }, jitter: 0 },
      { id: '3d_design', base: { x: 33, y: 30 }, jitter: 0 },
      { id: 'concept_design', base: { x: 59, y: 43 }, jitter: 0 },
      { id: 'apparel', base: { x: 74, y: 48 }, jitter: 0 },
      { id: 'on_no', base: { x: 18, y: 52 }, jitter: 0 },
      { id: 'resume', base: { x: 95, y: 30 }, jitter: 0 },
    ];

    const mobileConfigs = [
      { id: '3d_design', base: { x: 20, y: 12 }, jitter: 0 }, // 3D Apparel
      { id: 'macintosh_hd', base: { x: 65, y: 12 }, jitter: 0 }, // Archive
      { id: 'scatter', base: { x: 5, y: 28 }, jitter: 0 }, // SCATTER
      { id: 'film', base: { x: 48, y: 26 }, jitter: 0 }, // FILM
      { id: 'concept_design', base: { x: 37, y: 44 }, jitter: 0 }, // Concept
      { id: 'apparel', base: { x: 75, y: 38 }, jitter: 0 }, // APPAREL
      { id: 'on_no', base: { x: 20, y: 56 }, jitter: 0 }, // ON:NO
      { id: 'resume', base: { x: 65, y: 68 }, jitter: 0 }, // RESUME
    ];

    const tabletConfigs = [
      { id: 'scatter', base: { x: 15, y: 12 }, jitter: 0 },
      { id: 'macintosh_hd', base: { x: 85, y: 5 }, jitter: 0 },
      { id: '3d_design', base: { x: 30, y: 30 }, jitter: 0 },
      { id: 'film', base: { x: 65, y: 25 }, jitter: 0 },
      { id: 'concept_design', base: { x: 55, y: 48 }, jitter: 0 },
      { id: 'apparel', base: { x: 78, y: 48 }, jitter: 0 },
      { id: 'on_no', base: { x: 15, y: 65 }, jitter: 0 },
      { id: 'resume', base: { x: 80, y: 80 }, jitter: 0 },
    ];

    const resolveInitialPositions = () => {
      const resolved: Record<string, { x: number; y: number; z: number }> = {};
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      const currentIsMobile = vw < 768;
      const currentIsTablet = vw >= 768 && vw < 1024;
      const layoutConfigs = currentIsMobile ? mobileConfigs : currentIsTablet ? tabletConfigs : desktopConfigs;

      const MENU_BAR_HEIGHT = 32;
      const DOCK_HEIGHT = 120;
      const ICON_SIZE = 100;
      const PADDING = 20;

      const maxX = vw - ICON_SIZE - PADDING;
      const maxY = vh - DOCK_HEIGHT - ICON_SIZE - PADDING;
      const minX = PADDING;
      const minY = MENU_BAR_HEIGHT + PADDING;

      // Use base percentages for initial placement
      layoutConfigs.forEach(item => {
        let x = (item.base.x / 100) * vw;
        let y = (item.base.y / 100) * vh;

        // Final Clamp to Safe Bounds
        x = Math.max(minX, Math.min(maxX, x));
        y = Math.max(minY, Math.min(maxY, y));

        resolved[item.id] = { x, y, z: 10 };
      });

      // Find unplaced registry entries with showOnDesktop true
      const unplacedEntries = windowsRegistryData
        .filter(entry => entry.showOnDesktop && !resolved[entry.id])
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

      const resolvePadding = 16;
      const stepX = ICON_SIZE + PADDING;
      const stepY = ICON_SIZE + PADDING;

      unplacedEntries.forEach(entry => {
        let placed = false;
        for (let y = minY; ; y += stepY) {
          const currentY = Math.min(y, maxY);
          for (let x = minX; ; x += stepX) {
            const currentX = Math.min(x, maxX);

            const overlaps = Object.values(resolved).some(pos => {
              const overlapX = !(currentX > pos.x + ICON_SIZE + resolvePadding || currentX + ICON_SIZE + resolvePadding < pos.x);
              const overlapY = !(currentY > pos.y + ICON_SIZE + resolvePadding || currentY + ICON_SIZE + resolvePadding < pos.y);
              return overlapX && overlapY;
            });

            if (!overlaps) {
              resolved[entry.id] = { x: currentX, y: currentY, z: 10 };
              placed = true;
              break;
            }

            if (x >= maxX) break;
          }
          if (placed || y >= maxY) break;
        }

        if (!placed) {
          resolved[entry.id] = { x: minX, y: minY, z: 10 };
        }
      });

      // Simple collision resolution to prevent exact stacking
      const allKeys = Object.keys(resolved);
      for (let i = 0; i < 20; i++) {
        let changed = false;
        allKeys.forEach((idA, idxA) => {
          allKeys.forEach((idB, idxB) => {
            if (idxA === idxB) return;
            const posA = resolved[idA];
            const posB = resolved[idB];

            if (!posA || !posB) return;

            // AABB Collision Check
            const overlapX = !(posA.x > posB.x + ICON_SIZE + resolvePadding || posA.x + ICON_SIZE + resolvePadding < posB.x);
            const overlapY = !(posA.y > posB.y + ICON_SIZE + resolvePadding || posA.y + ICON_SIZE + resolvePadding < posB.y);

            if (overlapX && overlapY) {
              changed = true;
              // Push B away from A
              const dx = posB.x - posA.x;
              const dy = posB.y - posA.y;
              const dist = Math.sqrt(dx * dx + dy * dy) || 1;
              const pushX = (dx / dist) * 20;
              const pushY = (dy / dist) * 20;

              posB.x = Math.max(minX, Math.min(maxX, posB.x + pushX));
              posB.y = Math.max(minY, Math.min(maxY, posB.y + pushY));
            }
          });
        });
        if (!changed) break;
      }
      return resolved;

    };


    const initialMap = resolveInitialPositions();
    intendedPosRef.current = { ...initialMap };
    setIconPos(initialMap);

    const handleResize = () => {
      setIconPos(prev => {
        // Safe bounds for random placement
        const MENU_BAR_HEIGHT = 32;
        const DOCK_HEIGHT = 120;
        const ICON_SIZE = 100;
        const PADDING = 20;

        const vw = window.innerWidth;
        const vh = window.innerHeight;

        const maxX = vw - ICON_SIZE - PADDING;
        const maxY = vh - DOCK_HEIGHT - ICON_SIZE - PADDING;
        const minX = PADDING;
        const minY = MENU_BAR_HEIGHT + PADDING;

        let changed = false;
        const newPos = { ...prev };
        
        // 1. Restore from intent
        Object.keys(newPos).forEach(id => {
          if (intendedPosRef.current[id]) {
            newPos[id].x = intendedPosRef.current[id].x;
            newPos[id].y = intendedPosRef.current[id].y;
          }
        });

        // 2. Clamp
        Object.keys(newPos).forEach(id => {
          const current = newPos[id];
          const clX = Math.max(minX, Math.min(maxX, current.x));
          const clY = Math.max(minY, Math.min(maxY, current.y));
          
          if (clX !== current.x || clY !== current.y) {
            newPos[id].x = clX;
            newPos[id].y = clY;
            changed = true;
          }
        });

        // 3. Simple AABB overlapping resolution
        const resolvePadding = 32;
        for (let i = 0; i < 10; i++) {
          let overlapChanged = false;
          Object.keys(newPos).forEach(idA => {
            Object.keys(newPos).forEach(idB => {
              if (idA === idB) return;
              const posA = newPos[idA];
              const posB = newPos[idB];

              const overlapX = !(posA.x > posB.x + ICON_SIZE + resolvePadding || posA.x + ICON_SIZE + resolvePadding < posB.x);
              const overlapY = !(posA.y > posB.y + ICON_SIZE + resolvePadding || posA.y + ICON_SIZE + resolvePadding < posB.y);

              if (overlapX && overlapY) {
                overlapChanged = true;
                changed = true;
                
                const dx = posB.x - posA.x;
                const dy = posB.y - posA.y;
                // If they are exactly on top of each other, give them a random nudge
                const dist = Math.sqrt(dx * dx + dy * dy) || 0.1; 
                let pushX = (dx / dist) * 10;
                let pushY = (dy / dist) * 10;
                if (dx === 0 && dy === 0) {
                    pushX = 10;
                    pushY = 10;
                }

                posB.x = Math.max(minX, Math.min(maxX, posB.x + pushX));
                posB.y = Math.max(minY, Math.min(maxY, posB.y + pushY));
              }
            });
          });
          if (!overlapChanged) break;
        }
        
        return changed ? newPos : prev;
      });
    };

    window.addEventListener('resize', handleResize);

    // Register all windows from registry data (Step B)
    windowsRegistryData.forEach(entry => {
      const derivedFolderContents = windowsRegistryData
        .filter(w => w.folder === entry.id)
        .sort((a, b) => a.order - b.order)
        .map(w => w.id);

      let initX: number | undefined = initialMap[entry.id]?.x;
      let initY: number | undefined = initialMap[entry.id]?.y;

      if (entry.id === 'trash') {
        initX = 100;
        initY = 100;
      } else if (entry.id === 'stickies') {
        initX = window.innerWidth * 0.438;
        initY = 108;
      }

      registerWindow({
        id: entry.id,
        title: entry.title,
        icon: entry.icon,
        initialX: initX,
        initialY: initY,
        showOnDesktop: entry.showOnDesktop,
        showInDock: entry.showInDock,
        isFullScreen: entry.isFullScreen,
        width: entry.width ?? undefined,
        height: entry.height ?? undefined,
        variant: entry.variant === 'folder' ? 'folder' : undefined,
        folderContents: derivedFolderContents.length > 0 ? derivedFolderContents : undefined,
        component: resolveWindowComponent(entry)
      });
    });

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [registerWindow]);

  const appList = Object.values(windows) as WindowState[];
  const desktopApps = appList.filter(app => app.showOnDesktop !== false);
  
  const currentDockOrder = isMobile ? MOBILE_DOCK_ORDER : DESKTOP_DOCK_ORDER;
  const dockApps = currentDockOrder.map(id => windows[id]).filter(app => app && app.showInDock);
  
  // Add any other open apps that aren't in the fixed dock
  const otherOpenApps = appList.filter(app => 
    (app.isOpen || app.isMinimized) && !currentDockOrder.includes(app.id)
  );

  const [time, setTime] = useState(new Date());

  const handleDesktopMouseDown = (e: React.MouseEvent) => {
    // Only trigger if clicking directly on a "desktop-background" element
    const target = e.target as HTMLElement;
    if (!target.classList.contains('desktop-background')) return;
    
    setSelection({
      start: { x: e.clientX, y: e.clientY },
      end: { x: e.clientX, y: e.clientY }
    });
    setSelectedIconIds(new Set());
  };

  const handleDesktopMouseMove = (e: React.MouseEvent) => {
    if (!selection) return;

    const newEnd = { x: e.clientX, y: e.clientY };
    setSelection(prev => prev ? { ...prev, end: newEnd } : null);

    const x1 = Math.min(selection.start.x, newEnd.x);
    const y1 = Math.min(selection.start.y, newEnd.y);
    const x2 = Math.max(selection.start.x, newEnd.x);
    const y2 = Math.max(selection.start.y, newEnd.y);

    const selectionRect = { left: x1, top: y1, right: x2, bottom: y2 };

    const newSelected = new Set<string>();
    const icons = document.querySelectorAll('[data-desktop-icon-id]');
    icons.forEach((iconEl) => {
      const rect = iconEl.getBoundingClientRect();
      const id = iconEl.getAttribute('data-desktop-icon-id');
      if (id && (
        rect.left < selectionRect.right &&
        rect.right > selectionRect.left &&
        rect.top < selectionRect.bottom &&
        rect.bottom > selectionRect.top
      )) {
        newSelected.add(id);
      }
    });
    setSelectedIconIds(newSelected);
  };

  const handleDesktopMouseUp = () => {
    setSelection(null);
  };

  useEffect(() => {
    if (selection) {
      window.addEventListener('mouseup', handleDesktopMouseUp);
      return () => window.removeEventListener('mouseup', handleDesktopMouseUp);
    }
  }, [selection]);

  useEffect(() => {
    if (windows['stickies'] && !windows['stickies'].isOpen && !hasOpenedStickies.current) {
      hasOpenedStickies.current = true;
      toggleWindow('stickies');
    }
  }, [windows, toggleWindow]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 10000); // Update every 10s is enough for minutes
    return () => clearInterval(timer);
  }, []);

  const formattedTime = time.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).replace(',', ''); // "Fri May 1 10:14 AM"

  return (
    <div 
      className="relative w-screen h-[100dvh] overflow-hidden bg-[#1A1A1A] font-sans"
      onMouseDown={handleDesktopMouseDown}
      onMouseMove={handleDesktopMouseMove}
    >
      {/* Device Preview Toggle (Dev Only) */}
      {isDevEnv && (
        <div className="hidden md:block">
          {/* Hover hit area for Dev Tool */}
          {!isDevToolOpen && (
            <div 
              className="absolute top-0 right-0 w-8 h-24 z-[999999]" 
              onMouseEnter={() => setIsDevToolHovered(true)}
              onMouseLeave={() => setIsDevToolHovered(false)}
            />
          )}
          <motion.div 
            initial={false}
            animate={{ 
              x: isDevToolOpen ? 0 : isDevToolHovered ? 'calc(100% - 32px)' : 'calc(100% + 24px)' 
            }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="absolute top-4 right-4 z-[999999] flex gap-1 p-1 liquid-glass rounded-xl shadow-2xl backdrop-blur-3xl"
            onMouseEnter={() => setIsDevToolHovered(true)}
            onMouseLeave={() => setIsDevToolHovered(false)}
          >
            <button onClick={() => setIsDevToolOpen(!isDevToolOpen)} className="pl-1 pr-2 py-1.5 text-xs text-white/60 hover:text-white transition-colors flex items-center justify-center cursor-pointer shrink-0">
              {isDevToolOpen ? <X size={16} /> : <ChevronDown size={16} className="rotate-90" />}
            </button>
            
            <div className={cn("flex gap-1 overflow-hidden transition-opacity duration-200", isDevToolOpen ? "opacity-100" : "opacity-0 pointer-events-none")}>
              <button onClick={() => setOverride('mobile')} className={cn("px-2 py-1.5 text-xs rounded-lg transition-colors flex items-center justify-center cursor-pointer", override === 'mobile' ? 'bg-white/20 text-white' : 'text-white/60 hover:bg-white/10')} title="Mobile View">
                <Smartphone size={16} />
              </button>
              <button onClick={() => setOverride('tablet')} className={cn("px-2 py-1.5 text-xs rounded-lg transition-colors flex items-center justify-center cursor-pointer", override === 'tablet' ? 'bg-white/20 text-white' : 'text-white/60 hover:bg-white/10')} title="Tablet View">
                <Tablet size={16} />
              </button>
              <button onClick={() => setOverride('desktop')} className={cn("px-2 py-1.5 text-xs rounded-lg transition-colors flex items-center justify-center cursor-pointer", override === 'desktop' ? 'bg-white/20 text-white' : 'text-white/60 hover:bg-white/10')} title="Desktop View">
                <Monitor size={16} />
              </button>
              <div className="w-[1px] h-4 bg-white/20 my-auto mx-1" />
              <button onClick={() => setOverride(null)} className={cn("px-2 py-1.5 text-[10px] font-bold tracking-wider uppercase rounded-lg transition-colors cursor-pointer", !override ? 'bg-white/20 text-white' : 'text-white/40 hover:bg-white/10')} title="Auto View">Auto</button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Background */}
      <img
        src="https://res.cloudinary.com/dezas8twg/image/upload/v1778338802/bliss-windows-xp-remastered-2025-5k-vt_qaclh3.jpg"
        alt="Desktop Background"
        draggable={false}
        className="absolute inset-0 z-0 w-full h-full object-cover scale-110 pointer-events-none"
      />
      
      {/* Desktop Window Constraints Layer */}
      <div 
        ref={desktopRef}
        className={cn(
          "absolute right-0 bottom-0 left-0 pointer-events-none z-0 desktop-background",
          !isTouchUI ? "top-[32px]" : "top-0"
        )} 
      />

      <div className="absolute inset-0 z-0 bg-black/10 desktop-background" />
      {/* Gradient to blend bottom into grey (mobile/tablet only) */}
      {isTouchUI && (
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-transparent via-transparent to-[#1A1A1A] desktop-background" />
      )}
      <div className="absolute inset-0 z-0 backdrop-blur-[1px] desktop-background" />
      
      {selection && (
        <div 
          className="absolute border border-white/30 bg-blue-500/20 z-[9999] pointer-events-none"
          style={{
            left: Math.min(selection.start.x, selection.end.x),
            top: Math.min(selection.start.y, selection.end.y),
            width: Math.abs(selection.start.x - selection.end.x),
            height: Math.abs(selection.start.y - selection.end.y),
          }}
        />
      )}

      {isTouchUI ? (
        <div className={cn(
          "absolute top-0 inset-x-0 z-[10000] h-12 flex items-center justify-between text-white font-semibold text-sm mix-blend-difference select-none",
          isTablet ? "px-8 pt-5" : "px-6 pt-2"
        )}>
          <span>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full border-2 border-white/50 flex items-center justify-center">
              <div className="w-1 h-1 bg-white rounded-full" />
            </div>
            <div className="w-6 h-3 rounded-sm border border-white/50 relative">
              <div className="absolute inset-y-0 left-0 bg-white w-4/5 m-[1px]" />
            </div>
          </div>
        </div>
      ) : (
        <TopMenuBar 
          activeAppName={
          activeWindowId && windows[activeWindowId] 
            ? (windows[activeWindowId].variant === 'folder' || activeWindowId === 'macintosh_hd' ? 'Brooks' : windows[activeWindowId].title)
            : 'Brooks'
          } 
          isFullScreen={isAnyWindowMaximized}
          onOpenWindow={openWindow}
        />
      )}

      {/* Desktop Icons Constraints (Invisible) */}
      <div 
        ref={iconConstraintsRef}
        className={cn(
          "absolute left-0 right-0 z-0 pointer-events-none",
          isTouchUI ? "inset-0" : "top-[32px] bottom-[120px]"
        )}
      />

      {/* Swipeable Desktop Layer for Mobile */}
      <motion.div
        className={cn("absolute inset-0 z-[5]", isMobile ? "pointer-events-auto touch-none" : "pointer-events-none overflow-hidden")}
        drag={isMobile ? "x" : false}
        dragConstraints={isMobile ? { left: -window.innerWidth, right: 0 } : undefined}
        dragElastic={0.2}
        style={{ x: dragX }}
        onDragEnd={(_, info) => {
          if (!isMobile) return;
          const threshold = window.innerWidth / 4;
          if (info.offset.x < -threshold || info.velocity.x < -500) {
            setMobilePage(1);
            animate(dragX, -window.innerWidth, { type: "spring", stiffness: 300, damping: 30, mass: 0.8 });
          } else if (info.offset.x > threshold || info.velocity.x > 500) {
            setMobilePage(0);
            animate(dragX, 0, { type: "spring", stiffness: 300, damping: 30, mass: 0.8 });
          } else {
            animate(dragX, -mobilePage * window.innerWidth, { type: "spring", stiffness: 300, damping: 30, mass: 0.8 });
          }
        }}
      >
        {/* Page 1 (0) */}
        <div className="absolute inset-0 w-full h-full" style={{ left: 0 }}>
          {/* Desktop Icons Layer (Z-10) */}
          <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
            {desktopApps.map(app => (
              <DesktopIcon
                key={app.id}
                id={app.id}
                icon={app.icon}
                label={app.title}
                isSelected={selectedIconIds.has(app.id)}
                initialX={iconPos[app.id]?.x ?? app.initialX}
                initialY={iconPos[app.id]?.y ?? app.initialY}
                zIndex={iconPos[app.id]?.z ?? 10}
                variant={app.variant}
                folderContents={app.folderContents}
                windows={windows}
                isTouchUI={isTouchUI}
                isAnyDragging={isDraggingAny}
                setIsDraggingAny={setIsDraggingAny}
                constraintsRef={iconConstraintsRef}
                onDragStart={handleIconDragStart}
                onDragMove={handleIconDragMove}
                onDragEnd={handleIconDragEnd}
                onClick={(id, rect) => toggleWindow(id, rect)}
              />
            ))}
          </div>

          {/* Windows Layer (Mobile Only Page 1) */}
          <div className="absolute inset-0 pointer-events-none z-20">
            <AnimatePresence>
              {appList.filter(app => app.isOpen && isMobile && app.id !== 'stickies').map(app => (
                <Window
                  key={app.id}
                  id={app.id}
                  title={app.title}
                  isOpen={app.isOpen}
                  isMinimized={app.isMinimized}
                  isFullScreen={app.isFullScreen}
                  isMobile={isTouchUI}
                  isActive={activeWindowId === app.id}
                  zIndex={app.zIndex}
                  onClose={() => closeWindow(app.id)}
                  onMinimize={() => minimizeWindow(app.id)}
                  onFocus={() => focusWindow(app.id)}
                  onMaximize={(isMax) => toggleFullScreen(app.id, isMax)}
                  width={isTouchUI ? (app.id === 'stickies' && isMobile ? 280 : '100vw') : app.width}
                  height={isTouchUI ? (app.id === 'stickies' && isMobile ? 300 : '100dvh') : app.height}
                  initialX={isTouchUI && app.id === 'stickies' && isMobile ? (window.innerWidth - 280) / 2 : (isDesktop ? (typeof app.initialX === 'number' ? app.initialX : undefined) : undefined)}
                  initialY={isTouchUI && app.id === 'stickies' && isMobile ? 120 : (isDesktop ? (typeof app.initialY === 'number' ? app.initialY : undefined) : undefined)}
                  dragConstraints={desktopRef}
                  variant={app.variant}
                  icon={app.icon}
                  folderContents={app.folderContents}
                  windows={windows}
                  launchRect={app.launchRect}
                  minimizeRect={app.minimizeRect}
                >
                  {app.variant === 'folder' && app.folderContents ? (
                    <FolderContent 
                      appId={app.id}
                      appIds={app.folderContents} 
                      windows={windows} 
                      toggleWindow={toggleWindow} 
                      isTouchUI={isTouchUI}
                      isMobile={isTouchUI}
                      closeFolder={() => closeWindow(app.id)}
                    />
                  ) : (
                    app.component
                  )}
                </Window>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Page 2 (1) */}
        <div className="absolute inset-0 w-full h-full sm:hidden" style={{ left: '100%' }}>
          {/* Background Windows Layer (e.g. Stickies) */}
          <div className="absolute inset-0 pointer-events-none">
            <AnimatePresence>
              {appList.filter(app => app.isOpen && app.id === 'stickies' && isMobile).map(app => (
                <Window
                  key={app.id}
                  id={app.id}
                  title={app.title}
                  isOpen={app.isOpen}
                  isMinimized={app.isMinimized}
                  isFullScreen={app.isFullScreen}
                  isMobile={isTouchUI}
                  isActive={activeWindowId === app.id}
                  zIndex={app.zIndex}
                  onClose={() => closeWindow(app.id)}
                  onMinimize={() => minimizeWindow(app.id)}
                  onFocus={() => focusWindow(app.id)}
                  onMaximize={(isMax) => toggleFullScreen(app.id, isMax)}
                  width={isTouchUI ? (app.id === 'stickies' && isMobile ? 280 : '100vw') : app.width}
                  height={isTouchUI ? (app.id === 'stickies' && isMobile ? 300 : '100dvh') : app.height}
                  initialX={isTouchUI && app.id === 'stickies' && isMobile ? (window.innerWidth - 280) / 2 : (isDesktop ? (typeof app.initialX === 'number' ? app.initialX : undefined) : undefined)}
                  initialY={isTouchUI && app.id === 'stickies' && isMobile ? 120 : (isDesktop ? (typeof app.initialY === 'number' ? app.initialY : undefined) : undefined)}
                  dragConstraints={desktopRef}
                  variant={app.variant}
                  icon={app.icon}
                  folderContents={app.folderContents}
                  windows={windows}
                  launchRect={app.launchRect}
                  minimizeRect={app.minimizeRect}
                >
                  {app.variant === 'folder' && app.folderContents ? (
                    <FolderContent 
                      appId={app.id}
                      appIds={app.folderContents} 
                      windows={windows} 
                      toggleWindow={toggleWindow} 
                      isTouchUI={isTouchUI}
                      isMobile={isTouchUI}
                      closeFolder={() => closeWindow(app.id)}
                    />
                  ) : (
                    app.component
                  )}
                </Window>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Page Dots Indicator */}
      {isMobile && (
        <div className="absolute bottom-[108px] left-1/2 -translate-x-1/2 flex gap-1.5 z-[60] pointer-events-auto">
          <button 
            onClick={() => {
              setMobilePage(0);
              animate(dragX, 0, { type: "spring", stiffness: 300, damping: 30, mass: 0.8 });
            }}
            className={cn("w-2 h-2 rounded-full transition-all duration-300", mobilePage === 0 ? "bg-white scale-110" : "bg-white/30")} 
          />
          <button 
            onClick={() => {
              setMobilePage(1);
              animate(dragX, -window.innerWidth, { type: "spring", stiffness: 300, damping: 30, mass: 0.8 });
            }}
            className={cn("w-2 h-2 rounded-full transition-all duration-300", mobilePage === 1 ? "bg-white scale-110" : "bg-white/30")} 
          />
        </div>
      )}

      {/* Dock Area Hover Detector */}
      {!isMobile && isAnyWindowMaximized && (
        <div 
          className="absolute bottom-0 left-0 right-0 h-16 z-[9998]"
          onMouseEnter={() => setIsHoveringDockArea(true)}
          onMouseLeave={() => setIsHoveringDockArea(false)}
        />
      )}

      {/* Dock */}
      {!isMobile ? (
        <div 
          className={cn(
            "fixed bottom-2 left-1/2 -translate-x-1/2 z-[9999] transition-transform duration-300 ease-in-out",
            isAnyWindowMaximized && !isHoveringDockArea ? "translate-y-[150%]" : "translate-y-0"
          )}
          onMouseEnter={() => setIsHoveringDockArea(true)}
          onMouseLeave={() => setIsHoveringDockArea(false)}
        >
          <Dock 
            pinnedApps={dockApps.map(app => ({
              id: app.id,
              icon: app.dockIcon || app.icon,
              label: app.title,
              isOpen: app.isOpen,
              isActive: activeWindowId === app.id,
              variant: app.variant,
              folderContents: app.folderContents
            }))}
            recentApps={otherOpenApps.filter(a => !a.isMinimized).map(app => ({
              id: app.id,
              icon: app.dockIcon || app.icon,
              label: app.title,
              isOpen: app.isOpen,
              isActive: activeWindowId === app.id,
              variant: app.variant,
              folderContents: app.folderContents
            }))}
            minimizedApps={appList.filter(a => a.isMinimized).map(app => ({
              id: app.id,
              icon: app.dockIcon || app.icon,
              label: app.title,
              isOpen: app.isOpen,
              isActive: activeWindowId === app.id,
              variant: app.variant,
              folderContents: app.folderContents
            }))}
            windows={windows}
            onAppClick={toggleWindow}
            onUpdateMinimizeRect={setMinimizeRect}
          />
        </div>
      ) : (
        <div className={cn(
          "absolute z-50 flex items-center shadow-[0_10px_40px_rgba(0,0,0,0.5)]",
          isTablet 
            ? "bottom-[24px] left-1/2 -translate-x-1/2 w-fit justify-center gap-[20px] px-6 py-4 rounded-[34px]" 
            : "bottom-[16px] left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-[420px] justify-between px-5 py-4 rounded-[34px]"
        )}>
          {/* Background */}
          <div className="absolute inset-0 liquid-glass rounded-[34px] border border-white/20 -z-10 pointer-events-none" />
          
            {dockApps.slice(0, isTablet ? dockApps.length : 4).map(app => (
            <div 
              key={app.id} 
              className={cn(
                "active:scale-[0.98] transition-transform cursor-pointer flex items-center justify-center shrink-0 hover:brightness-110",
                isTablet ? "w-[72px] h-[72px] landscape:w-[64px] landscape:h-[64px]" : "w-[60px] h-[60px]"
              )}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                toggleWindow(app.id, {
                  top: rect.top,
                  left: rect.left,
                  width: rect.width,
                  height: rect.height
                });
              }}
            >
              <div 
                className={cn(
                  "w-full h-full flex flex-col items-center justify-center",
                  app.variant !== 'folder' && "squircle"
                )}
              >
                {app.variant === 'folder' ? (
                  <motion.div 
                    layoutId={`folder-${app.id}`} 
                    className="w-full h-full relative"
                    style={{ originX: 0.5, originY: 0.5 }}
                  >
                    <FolderIcon appIds={app.folderContents} windows={windows} isTouchUI={isTouchUI} />
                  </motion.div>
                ) : (
                  <img src={app.icon} alt={app.title} className="w-full h-full object-contain filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)]" draggable={false} />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Windows Layer (Desktop/Tablet Only - Stationary) */}
      <div className="absolute inset-0 pointer-events-none">
        <AnimatePresence>
          {appList.filter(app => app.isOpen && !isMobile).map(app => (
            <Window
              key={app.id}
              id={app.id}
                title={app.title}
                isOpen={app.isOpen}
                isMinimized={app.isMinimized}
                isFullScreen={app.isFullScreen}
                isMobile={isTouchUI}
                isActive={activeWindowId === app.id}
                zIndex={app.zIndex}
                onClose={() => closeWindow(app.id)}
                onMinimize={() => minimizeWindow(app.id)}
                onFocus={() => focusWindow(app.id)}
                onMaximize={(isMax) => toggleFullScreen(app.id, isMax)}
                width={isTouchUI ? (app.id === 'stickies' && isMobile ? 280 : '100vw') : app.width}
                height={isTouchUI ? (app.id === 'stickies' && isMobile ? 300 : '100dvh') : app.height}
                initialX={isTouchUI && app.id === 'stickies' && isMobile ? window.innerWidth - 295 : (isDesktop ? (typeof app.initialX === 'number' ? app.initialX : undefined) : undefined)}
                initialY={isTouchUI && app.id === 'stickies' && isMobile ? 60 : (isDesktop ? (typeof app.initialY === 'number' ? app.initialY : undefined) : undefined)}
                dragConstraints={desktopRef}
                variant={app.variant}
                icon={app.icon}
                folderContents={app.folderContents}
                windows={windows}
                launchRect={app.launchRect}
                minimizeRect={app.minimizeRect}
              >
                {app.variant === 'folder' && app.folderContents ? (
                  <FolderContent 
                    appIds={app.folderContents} 
                    windows={windows} 
                    toggleWindow={toggleWindow} 
                    isTouchUI={isTouchUI}
                    isMobile={isTouchUI}
                    closeFolder={() => closeWindow(app.id)}
                  />
                ) : (
                  app.component
                )}
              </Window>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <WindowManagerProvider>
      <DesktopApp />
    </WindowManagerProvider>
  );
};

export default App;
