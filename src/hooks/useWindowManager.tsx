import React, { useState, useCallback, createContext, useContext } from 'react';

export type WindowState = {
  id: string;
  title: string;
  isOpen: boolean;
  isMinimized: boolean;
  isFullScreen?: boolean;
  zIndex: number;
  icon: string;
  dockIcon?: string;
  component: React.ReactNode;
  width?: number | string;
  height?: number | string;
  initialX?: string | number;
  initialY?: string | number;
  showOnDesktop?: boolean;
  showInDock?: boolean;
  variant?: 'default' | 'folder';
  folderContents?: string[];
  launchRect?: { top: number; left: number; width: number; height: number };
  minimizeRect?: { top: number; left: number; width: number; height: number };
};

export type WindowManagerType = ReturnType<typeof useWindowManagerStore>;

function useWindowManagerStore() {
  const [windows, setWindows] = useState<Record<string, WindowState>>({});
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [maxZIndex, setMaxZIndex] = useState(10);

  const registerWindow = useCallback((config: Omit<WindowState, 'isOpen' | 'isMinimized' | 'zIndex'>) => {
    setWindows(prev => ({
      ...prev,
      [config.id]: {
        ...config,
        isOpen: false,
        isMinimized: false,
        zIndex: 10,
      }
    }));
  }, []);

  const openWindow = useCallback((id: string, rect?: { top: number; left: number; width: number; height: number }) => {
    const nextZ = Math.max(maxZIndex + 1, 9999);
    setMaxZIndex(nextZ);
    setWindows(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        isOpen: true,
        isMinimized: false,
        zIndex: nextZ,
        launchRect: rect,
      }
    }));
    setActiveWindowId(id);
  }, [maxZIndex]);

  const closeWindow = useCallback((id: string) => {
    setWindows(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        isOpen: false,
      }
    }));
    if (activeWindowId === id) {
      setActiveWindowId(null);
    }
  }, [activeWindowId]);

  const minimizeWindow = useCallback((id: string) => {
    setWindows(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        isMinimized: true,
      }
    }));
    if (activeWindowId === id) {
      setActiveWindowId(null);
    }
  }, [activeWindowId]);

  const setMinimizeRect = useCallback((id: string, rect: { top: number; left: number; width: number; height: number } | undefined) => {
    setWindows(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        minimizeRect: rect,
      }
    }));
  }, []);

  const focusWindow = useCallback((id: string, rect?: { top: number; left: number; width: number; height: number }) => {
    const nextZ = Math.max(maxZIndex + 1, 9999);
    setMaxZIndex(nextZ);
    setWindows(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        isMinimized: false,
        zIndex: nextZ,
        ...(rect ? { launchRect: rect } : {}),
      }
    }));
    setActiveWindowId(id);
  }, [maxZIndex]);

  const toggleFullScreen = useCallback((id: string, isFullScreen: boolean) => {
    setWindows(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        isFullScreen,
      }
    }));
  }, []);

  const toggleWindow = useCallback((id: string, rect?: { top: number; left: number; width: number; height: number }) => {
    const win = windows[id];
    if (!win) return;
    if (!win.isOpen) {
      openWindow(id, rect);
    } else if (win.isMinimized) {
      focusWindow(id, rect);
    } else if (activeWindowId === id) {
      minimizeWindow(id);
    } else {
      focusWindow(id, rect);
    }
  }, [windows, activeWindowId, openWindow, focusWindow, minimizeWindow]);

  return {
    windows,
    activeWindowId,
    registerWindow,
    openWindow,
    closeWindow,
    minimizeWindow,
    setMinimizeRect,
    focusWindow,
    toggleWindow,
    toggleFullScreen,
  };
}

const WindowManagerContext = createContext<WindowManagerType | null>(null);

export const WindowManagerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const value = useWindowManagerStore();
  return (
    <WindowManagerContext.Provider value={value}>
      {children}
    </WindowManagerContext.Provider>
  );
};

export function useWindowManager() {
  const context = useContext(WindowManagerContext);
  if (!context) {
    return useWindowManagerStore();
  }
  return context;
}

