import React, { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  motion,
  useDragControls,
  useMotionValue,
  animate,
  AnimatePresence,
} from "motion/react";
import { FolderIcon } from "./FolderIcon";
import { cn } from "@/src/lib/utils";

interface WindowProps {
  id: string;
  title: string;
  isOpen: boolean;
  isMinimized: boolean;
  isFullScreen?: boolean;
  isMobile?: boolean;
  isActive: boolean;
  zIndex: number;
  onClose: () => void;
  onMinimize: () => void;
  onFocus: () => void;
  onMaximize?: (isMaximized: boolean) => void;
  children: React.ReactNode;
  width?: number | string;
  height?: number | string;
  initialX?: number;
  initialY?: number;
  dragConstraints?: React.RefObject<HTMLDivElement>;
  variant?: "default" | "folder";
  icon?: string;
  folderContents?: string[];
  windows?: any;
  launchRect?: { top: number; left: number; width: number; height: number };
  minimizeRect?: { top: number; left: number; width: number; height: number };
}

export const Window: React.FC<WindowProps> = ({
  id,
  title,
  isOpen,
  isMinimized,
  isFullScreen = false,
  isMobile = false,
  isActive,
  zIndex,
  onClose,
  onMinimize,
  onFocus,
  onMaximize,
  children,
  width: initialWidth = 600,
  height: initialHeight = 400,
  initialX,
  initialY,
  dragConstraints,
  variant = "default",
  icon,
  folderContents,
  windows,
  launchRect,
  minimizeRect,
}) => {
  const [isMaximized, setIsMaximized] = useState(
    isFullScreen || (isMobile && id !== "stickies"),
  );
  const [isResizing, setIsResizing] = useState(false);
  const [isOpening, setIsOpening] = useState(true);
  const [showIcon, setShowIcon] = useState(true);
  const [isClosing, setIsClosing] = useState(false);
  const [dragOffsetX, setDragOffsetX] = useState(0);
  const [dragOffsetY, setDragOffsetY] = useState(0);
  const dragControls = useDragControls();

  const [dynamicTitle, setDynamicTitle] = useState<string | null>(null);
  const [navState, setNavState] = useState<{
    canGoBack: boolean;
    canGoForward: boolean;
    goBack: () => void;
    goForward: () => void;
  } | null>(null);

  const handleTitleChange = useCallback((newTitle: string) => {
    setDynamicTitle(newTitle);
  }, []);

  const handleNavStateChange = useCallback((newNavState: any) => {
    setNavState(newNavState);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setDynamicTitle(null);
      setNavState(null);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isActive) onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isActive, onClose]);

  // High-fidelity manual layout animation (FLIP)
  // We initialize these to the launch source (the icon) if it exists
  const defaultW = typeof initialWidth === "number" ? initialWidth : 600;
  const defaultH = typeof initialHeight === "number" ? initialHeight : 400;

  const isPhoneMobile = isMobile && typeof window !== "undefined" && window.innerWidth < 768;

  const centeredT =
    initialY !== undefined
      ? initialY
      : (() => {
          const menuBarH = 32;
          const dockH = isMobile ? 0 : 100;
          const availableH = window.innerHeight - menuBarH - dockH;
          const offset = Math.max(0, (availableH - defaultH) / 2);
          return menuBarH + offset;
        })();
  const centeredL =
    initialX !== undefined ? initialX : Math.max(0, (window.innerWidth - defaultW) / 2);

  const finalCenteredT = centeredT;

  const width = useMotionValue(
    launchRect
      ? launchRect.width
      : (isFullScreen || isPhoneMobile) && id !== "stickies"
        ? window.innerWidth
        : defaultW,
  );
  const height = useMotionValue(
    launchRect
      ? launchRect.height
      : (isFullScreen || isPhoneMobile) && id !== "stickies"
        ? isPhoneMobile
          ? "calc(100dvh - 40px - env(safe-area-inset-top, 0px))"
          : isMobile
            ? window.innerHeight
            : window.innerHeight - 32
        : defaultH,
  );
  const top = useMotionValue(
    launchRect
      ? launchRect.top
      : (isFullScreen || isPhoneMobile) && id !== "stickies"
        ? isPhoneMobile
          ? "calc(40px + env(safe-area-inset-top, 0px))"
          : isMobile
            ? 0
            : 32
        : finalCenteredT,
  );
  const left = useMotionValue(
    launchRect
      ? launchRect.left
      : (isFullScreen || isMobile) && id !== "stickies"
        ? 0
        : centeredL,
  );
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const borderRadius = useMotionValue(
    launchRect ? 24 : isFullScreen || isMobile ? 0 : id === "stickies" ? 0 : 10,
  );
  const opacity = useMotionValue(launchRect ? 0.3 : 1);

  const scale = useMotionValue(1);
  const transformOrigin = useMotionValue("top left");
  const preMinimizeRef = React.useRef<{
    x: number;
    y: number;
    w: number;
    h: number;
    t: number;
    l: number;
  } | null>(null);
  const isInitialMinimizeDoneRef = React.useRef(false);

  const [preMaxState, setPreMaxState] = useState({
    width: defaultW,
    height: defaultH,
    top: centeredT,
    left: centeredL,
    x: 0,
    y: 0,
  });

  const handleResizeStart = (e: React.PointerEvent, edges: string[]) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    const target = e.currentTarget;
    target.setPointerCapture(e.pointerId);

    const startPointerX = e.clientX;
    const startPointerY = e.clientY;
    const startWidth = parseFloat(String(width.get())) || 600;
    const startHeight = parseFloat(String(height.get())) || 400;
    const startTop = parseFloat(String(top.get())) || 80;
    const startLeft = parseFloat(String(left.get())) || 80;

    const onPointerMove = (moveEvent: PointerEvent) => {
      const deltaX = moveEvent.clientX - startPointerX;
      const deltaY = moveEvent.clientY - startPointerY;

      let newWidth = startWidth;
      let newHeight = startHeight;
      let newTop = startTop;
      let newLeft = startLeft;

      if (edges.includes("left")) {
        newWidth = Math.max(300, startWidth - deltaX);
        newLeft = startLeft + (startWidth - newWidth);
      } else if (edges.includes("right")) {
        newWidth = Math.max(300, startWidth + deltaX);
      }

      if (edges.includes("top")) {
        newHeight = Math.max(200, startHeight - deltaY);
        newTop = startTop + (startHeight - newHeight);
      } else if (edges.includes("bottom")) {
        newHeight = Math.max(200, startHeight + deltaY);
      }

      width.set(newWidth);
      height.set(newHeight);
      top.set(newTop);
      left.set(newLeft);
    };

    const onPointerUp = (upEvent: PointerEvent) => {
      setIsResizing(false);
      target.releasePointerCapture(upEvent.pointerId);
      target.removeEventListener("pointermove", onPointerMove as any);
      target.removeEventListener("pointerup", onPointerUp as any);
    };

    target.addEventListener("pointermove", onPointerMove as any);
    target.addEventListener("pointerup", onPointerUp as any);
  };

  const springConfig = {
    type: "spring" as const,
    stiffness: 350,
    damping: 35,
    mass: 1,
  };

  React.useLayoutEffect(() => {
    if (isOpen && !isMinimized) {
      if (preMinimizeRef.current) {
        // Restore from minimize
        const prev = preMinimizeRef.current;
        isInitialMinimizeDoneRef.current = false;
        setIsClosing(false);
        setIsOpening(true);
        animate(scale, 1, springConfig);
        animate(x, prev.x, springConfig);
        animate(y, prev.y, springConfig);
        animate(width, prev.w, springConfig);
        animate(height, prev.h, springConfig);
        animate(top, prev.t, springConfig);
        animate(left, prev.l, springConfig);
        opacity.set(1);
        preMinimizeRef.current = null;
        setTimeout(() => setIsOpening(false), 300);
        return;
      }

      x.set(0);
      y.set(0);
      scale.set(1);
      setIsOpening(true);
      setShowIcon(true);
      setIsClosing(false);

      if (launchRect) {
        // Start exactly from icon bounds
        width.set(launchRect.width);
        height.set(launchRect.height);
        top.set(launchRect.top);
        left.set(launchRect.left);
        borderRadius.set(24);
        opacity.set(1);

        // Targeted expansion based on device/settings
        const targetW =
          (isFullScreen || isPhoneMobile) && id !== "stickies"
            ? window.innerWidth
            : typeof initialWidth === "number"
              ? initialWidth
              : parseFloat(initialWidth as string);
        const baseTargetH =
          typeof initialHeight === "number"
            ? initialHeight
            : parseFloat(initialHeight as string);
        const targetH: any =
          (isFullScreen || isPhoneMobile) && id !== "stickies"
            ? isPhoneMobile
              ? "calc(100dvh - 40px - env(safe-area-inset-top, 0px))"
              : isMobile
                ? window.innerHeight
                : window.innerHeight - 32
            : baseTargetH;

        let targetT: any = initialY !== undefined ? initialY : 0;
        let targetL = initialX !== undefined ? initialX : 0;

        if (!isFullScreen && (!isMobile || id === "stickies")) {
          if (initialY === undefined) {
            const menuBarH = isMobile ? 0 : 32;
            const dockH = isMobile ? 0 : 100;
            const availableH = window.innerHeight - menuBarH - dockH;
            const offset = Math.max(0, (availableH - (typeof targetH === 'number' ? targetH : window.innerHeight)) / 2);
            targetT = menuBarH + offset;
          }
          if (initialX === undefined) {
            targetL = Math.max(0, (window.innerWidth - targetW) / 2);
          }
        } else if (isPhoneMobile && id !== "stickies") {
          targetT = "calc(40px + env(safe-area-inset-top, 0px))";
          targetL = 0;
        } else if (isMobile && id !== "stickies") {
          targetT = 0;
          targetL = 0;
        } else if (isFullScreen && !isMobile) {
          targetT = 32;
          targetL = 0;
        }

        const targetRadius =
          (isFullScreen || isMobile) && id !== "stickies"
            ? 0
            : id === "stickies"
              ? 0
              : 10;

        animate(width, targetW, springConfig);
        animate(height, targetH, springConfig);
        animate(top, targetT, springConfig);
        animate(left, targetL, springConfig);
        animate(borderRadius, targetRadius, springConfig);
      } else {
        // Fallback or static launch
        opacity.set(1);
        if ((isFullScreen || isPhoneMobile) && id !== "stickies") {
          setIsMaximized(true);
          width.set(window.innerWidth);
          height.set(
            isPhoneMobile
              ? "calc(100dvh - 40px - env(safe-area-inset-top, 0px))"
              : isMobile
                ? window.innerHeight
                : window.innerHeight - 32
          );
          top.set(
            isPhoneMobile
              ? "calc(40px + env(safe-area-inset-top, 0px))"
              : isMobile
                ? 0
                : 32
          );
          left.set(0);
          borderRadius.set(0);
        }
      }

      const iconTimer = setTimeout(() => setShowIcon(false), 100);
      const openTimer = setTimeout(() => setIsOpening(false), 500);

      return () => {
        clearTimeout(iconTimer);
        clearTimeout(openTimer);
      };
    } else if (isOpen && isMinimized) {
      if (!preMinimizeRef.current) {
        preMinimizeRef.current = {
          x: x.get(),
          y: y.get(),
          w: width.get() as number,
          h: height.get() as number,
          t: top.get() as number,
          l: left.get() as number,
        };
      }

      setIsClosing(false);
      setShowIcon(false);

      if (minimizeRect) {
        const curW = width.get() as number;
        const curH = height.get() as number;

        // Find best fit scale without squishing
        const scaleX = minimizeRect.width / curW;
        const scaleY = minimizeRect.height / curH;

        // Scale proportionally down to fit inside the dock icon? Yes, or just scale down based on width.
        const targetScale = Math.min(scaleX, scaleY);

        // Calculate offset to align top left visually inside the dock slot bounds
        // the visual bounds are centered
        const targetW = curW * targetScale;
        const targetH = curH * targetScale;
        const offsetX = (minimizeRect.width - targetW) / 2;
        const offsetY = (minimizeRect.height - targetH) / 2;

        const dx = minimizeRect.left + offsetX - (left.get() as number);
        const dy = minimizeRect.top + offsetY - (top.get() as number);

        if (!isInitialMinimizeDoneRef.current) {
          animate(scale, targetScale, springConfig);
          animate(x, dx, springConfig);
          animate(y, dy, springConfig);
          setTimeout(() => {
            isInitialMinimizeDoneRef.current = true;
          }, 500); // mark as done after animation finishes
        } else {
          // just static follow the dock without animating translation/scale
          scale.set(targetScale);
          x.set(dx);
          y.set(dy);
        }
      }
    } else if (!isOpen) {
      setIsClosing(true);
      setShowIcon(true);
    }
  }, [isOpen, isMinimized, launchRect, minimizeRect]);

  const windowTransition = {
    type: "spring",
    stiffness: 350,
    damping: 35,
    mass: 1,
  };

  const handleToggleMaximize = (e?: React.SyntheticEvent) => {
    e?.stopPropagation();
    if (isMobile) return;
    if (!isMaximized) {
      // Resolve current actual position
      const currentTop = top.get() + y.get();
      const currentLeft = left.get() + x.get();

      setPreMaxState({
        width: width.get(),
        height: height.get(),
        top: currentTop,
        left: currentLeft,
        x: 0,
        y: 0,
      });

      // Update top/left to actual position and reset x/y immediately to avoid drag constraint conflicts
      top.set(currentTop);
      left.set(currentLeft);
      x.set(0);
      y.set(0);

      setIsMaximized(true);
      onMaximize?.(true);

      animate(width, window.innerWidth, {
        type: "spring",
        stiffness: 400,
        damping: 40,
      });
      animate(height, window.innerHeight - (isMobile ? 0 : 32), {
        type: "spring",
        stiffness: 400,
        damping: 40,
      });
      animate(top, isMobile ? 0 : 32, {
        type: "spring",
        stiffness: 400,
        damping: 40,
      });
      animate(left, 0, { type: "spring", stiffness: 400, damping: 40 });
      animate(borderRadius, 0, { type: "spring", stiffness: 400, damping: 40 });
    } else {
      setIsMaximized(false);
      onMaximize?.(false);

      const targetPreRadius =
        preMaxState.width === initialWidth ? (id === "stickies" ? 0 : 10) : 0;

      animate(width, preMaxState.width, {
        type: "spring",
        stiffness: 400,
        damping: 40,
      });
      animate(height, preMaxState.height, {
        type: "spring",
        stiffness: 400,
        damping: 40,
      });
      animate(top, preMaxState.top, {
        type: "spring",
        stiffness: 400,
        damping: 40,
      });
      animate(left, preMaxState.left, {
        type: "spring",
        stiffness: 400,
        damping: 40,
      });
      animate(borderRadius, launchRect ? 24 : targetPreRadius, {
        type: "spring",
        stiffness: 400,
        damping: 40,
      });
    }
  };

  if (variant === "folder" && isMobile) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        drag="y"
        dragConstraints={{ bottom: 0, top: -1000 }}
        dragElastic={0.3}
        dragListener={false}
        dragControls={dragControls}
        onDragEnd={(_, info) => {
          if (info.offset.y < -50 || info.velocity.y < -500) {
            onClose();
          }
        }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="fixed inset-0 z-[999999] flex flex-col items-center overflow-y-auto overflow-x-hidden safe-area-pb bg-black/40 backdrop-blur-[24px] pointer-events-auto"
        style={{ isolation: "isolate", transform: "translateZ(0)", y }}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        {/* Background Click Handler - Catch-all for taps between children */}
        <div className="fixed inset-0 -z-[5]" onClick={onClose} />

        {/* Folder Header */}
        <div className="w-full max-w-[400px] px-8 pt-16 pb-6 shrink-0 text-center pointer-events-none mb-4">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="text-white text-[34px] font-bold select-none"
          >
            {title}
          </motion.h2>
        </div>

        {/* Folder Content Grid Container */}
        <motion.div
          layoutId={`folder-${id}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="w-[calc(100vw-56px)] max-w-[360px] aspect-square relative pointer-events-auto origin-center flex flex-col"
        >
          {/* Glass styling without redundant blur to prevent interference */}
          <div
            className="absolute inset-0 rounded-[2.5rem] -z-10 pointer-events-none border border-white/20 bg-white/5"
            style={{
              boxShadow: "inset 0 1px 1px rgba(255, 255, 255, 0.1)",
              background:
                "linear-gradient(rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.05))",
            }}
          />
          <div className="flex-1 overflow-hidden rounded-[2.5rem] w-full h-full p-2">
            {children}
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      exit={
        launchRect
          ? {
              width: launchRect.width,
              height: launchRect.height,
              top: launchRect.top - dragOffsetY,
              left: launchRect.left - dragOffsetX,
              borderRadius: 24,
              opacity: 0,
              transition: windowTransition,
            }
          : {
              opacity: 0,
              scale: 0.2,
              transition: windowTransition,
            }
      }
      transition={windowTransition}
      drag={!isMaximized && !isResizing}
      dragConstraints={dragConstraints}
      dragElastic={0}
      dragPropagation={true}
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      onDragStart={() => {
        document.body.style.cursor = 'grabbing';
      }}
      onDrag={(_, info) => {
        const currentTop = top.get();
        const currentY = y.get();
        if (currentTop + currentY < 32) {
          y.set(32 - currentTop);
        }
      }}
      onDragEnd={() => {
        document.body.style.cursor = '';
        setDragOffsetX(x.get());
        setDragOffsetY(y.get());
      }}
      {...(isMinimized ? ({ inert: "true" } as any) : {})}
      onPointerDown={onFocus}
      style={{
        zIndex,
        width: isPhoneMobile && id !== "stickies" ? "100vw" : width,
        height: isPhoneMobile && id !== "stickies" ? "calc(100dvh - 40px - env(safe-area-inset-top, 0px))" : height,
        top: isPhoneMobile && id !== "stickies" ? "calc(40px + env(safe-area-inset-top, 0px))" : top,
        left: isPhoneMobile && id !== "stickies" ? 0 : left,
        x,
        y,
        borderRadius: isPhoneMobile && id !== "stickies" ? 0 : borderRadius,
        opacity,
        scale,
        transformOrigin,
        touchAction: "pan-x pan-y",
      }}
      className={cn(
        "absolute overflow-hidden flex flex-col shadow-2xl",
        isMinimized ? "pointer-events-none" : "pointer-events-auto",
      )}
      data-focused={isActive}
    >
      {/* 
        LAYER 1: The Icon Overlay (z-0)
        This fulfills the 'from-icon' look.
        It is rendered at the bottom of the stack.
      */}
      <motion.div
        animate={{ opacity: showIcon || isClosing ? 1 : 0 }}
        transition={{ duration: 0.15, ease: "easeInOut" }}
        className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none"
      >
        <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center shrink-0">
          {variant === "folder" && folderContents && windows ? (
            <FolderIcon
              appIds={folderContents}
              windows={windows}
              isTouchUI={isMobile}
            />
          ) : (
            <img
              src={icon}
              alt=""
              className="w-full h-full object-contain filter drop-shadow-xl"
            />
          )}
        </div>
      </motion.div>

      {/* 
        LAYER 2: The Physical Background Mask (z-5)
      */}
      <div
        className={cn(
          "absolute inset-0 z-[5] pointer-events-none transition-colors duration-500",
          id === "stickies" ? "bg-transparent" : "bg-[#1e1e1e]",
        )}
        style={
          id === "stickies"
            ? {}
            : {
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.1), 0 20px 50px rgba(0,0,0,0.5)",
                border: "1px solid rgba(0,0,0,0.6)",
              }
        }
      />

      {/* 
        LAYER 3: The Main Content View (z-10)
        Fades in quickly during expansion to mask the icon.
      */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isClosing ? 0 : 1 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="flex flex-col h-full w-full relative z-[10] origin-center"
      >
        {isMobile && variant === "folder" && (
          <div className="w-full px-8 pt-12 pb-6 max-w-[400px] mx-auto pointer-events-none">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.1,
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
              className="text-white text-[34px] font-bold select-none pointer-events-auto"
            >
              {title}
            </motion.h2>
          </div>
        )}

        {id !== "stickies" && (!isMobile || variant !== "folder") && (
          <div
            className={cn(
              "window-titlebar flex items-center shrink-0 pointer-events-auto",
              isMobile
                ? "bg-[#282828] px-4 border-b border-black/30"
                : id === "brooks_chat" || id === "mail" || id === "stickies"
                  ? "absolute top-0 left-0 right-0 h-[52px] px-[16px] z-50 bg-transparent border-none"
                  : id === "spotify"
                    ? "h-[40px] px-[16px] border-b-0 bg-[#1A1A1A]"
                    : id === "photoshop" || id === "clo"
                      ? "h-[34px] px-[16px] border-b border-black/30 bg-[#383838]"
                      : "h-[52px] px-[20px] border-b border-black/30 bg-[#282828]",
              !isMaximized && "cursor-grab active:cursor-grabbing",
            )}
            style={
              isPhoneMobile
                ? {
                    height: "50px",
                  }
                : isMobile
                  ? {
                      paddingTop: "env(safe-area-inset-top, 0px)",
                      height: "calc(54px + env(safe-area-inset-top, 0px))",
                    }
                  : undefined
            }
            onPointerDown={(e) => {
              e.stopPropagation();
              if (!isMaximized) {
                const target = e.target as HTMLElement;
                if (!target.closest("button") && !target.closest("input") && !target.closest("textarea")) {
                  dragControls.start(e);
                }
              }
            }}
            onDoubleClick={handleToggleMaximize}
          >
            {isMobile ? (
              <>
                <button
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                  }}
                  className="text-blue-400 font-medium text-lg cursor-pointer pointer-events-auto z-10"
                >
                  Done
                </button>
                <div 
                  className="flex-1 text-center font-bold text-lg text-white select-none pointer-events-auto cursor-grab active:cursor-grabbing"
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    if (!isMaximized) dragControls.start(e);
                  }}
                >
                  {title}
                </div>
                <div className="w-12" />
              </>
            ) : (
              <>
                <div
                  className="group flex items-center gap-[8px] pointer-events-auto shrink-0"
                  onPointerDown={(e) => e.stopPropagation()}
                  onDoubleClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onClose();
                    }}
                    className="w-3 h-3 rounded-full bg-[#ff5f56] border-[0.5px] border-black/20 flex items-center justify-center overflow-hidden cursor-pointer"
                  >
                    <svg
                      viewBox="0 0 12 12"
                      className="w-full h-full text-[#4d0000] opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <path
                        d="M3.5,3.5 L8.5,8.5 M8.5,3.5 L3.5,8.5"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMinimize();
                    }}
                    className="w-3 h-3 rounded-full bg-[#ffbd2e] border-[0.5px] border-black/20 flex items-center justify-center overflow-hidden cursor-pointer"
                  >
                    <svg
                      viewBox="0 0 12 12"
                      className="w-full h-full text-[#5c3e00] opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <path
                        d="M2.5,6 L9.5,6"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={handleToggleMaximize}
                    className="w-3 h-3 rounded-full bg-[#27c93f] border-[0.5px] border-black/20 flex items-center justify-center overflow-hidden cursor-pointer"
                  >
                    <svg
                      viewBox="0 0 12 12"
                      className="w-full h-full text-[#004d00] opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {isMaximized ? (
                        <path
                          d="M5.5,5.5 h-3 L5.5,2.5 Z M6.5,6.5 h3 L6.5,9.5 Z"
                          fill="currentColor"
                        />
                      ) : (
                        <path
                          d="M3.25,3.25 h3.5 L3.25,6.75 Z M8.75,8.75 h-3.5 L8.75,5.25 Z"
                          fill="currentColor"
                        />
                      )}
                    </svg>
                  </button>

                  {/* Back and Forward chevrons right next to traffic lights */}
                  {navState && (
                    <div className="flex items-center gap-0.5 ml-2">
                      <button
                        type="button"
                        disabled={!navState.canGoBack}
                        onClick={(e) => {
                          e.stopPropagation();
                          navState.goBack();
                        }}
                        className={cn(
                          "p-1 rounded hover:bg-white/10 text-white/80 transition-colors cursor-pointer",
                          !navState.canGoBack && "opacity-30 cursor-default hover:bg-transparent text-white/40"
                        )}
                        title="Back"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        disabled={!navState.canGoForward}
                        onClick={(e) => {
                          e.stopPropagation();
                          navState.goForward();
                        }}
                        className={cn(
                          "p-1 rounded hover:bg-white/10 text-white/80 transition-colors cursor-pointer",
                          !navState.canGoForward && "opacity-30 cursor-default hover:bg-transparent text-white/40"
                        )}
                        title="Forward"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                <div
                  className="flex-1 text-center font-semibold text-sm text-white/90 select-none h-full flex items-center justify-center pointer-events-auto cursor-grab active:cursor-grabbing"
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    if (!isMaximized) dragControls.start(e);
                  }}
                >
                  {id !== "brooks_chat" &&
                    id !== "mail" &&
                    id !== "spotify" &&
                    (dynamicTitle || title)}
                </div>
                <div style={{ width: navState ? '110px' : '52px' }} className="shrink-0" />
              </>
            )}
          </div>
        )}

        <div
          className={cn(
            "flex-1 relative bg-transparent",
            variant === "folder" ? "flex flex-col min-h-0 overflow-hidden" : "overflow-auto",
            id === "spotify" && "mt-0",
          )}
          onPointerDown={(e) => {
            if (!isMaximized) {
              const target = e.target as HTMLElement;
              if (
                target.closest(".drag-region") &&
                !target.closest(".non-drag-region") &&
                !target.closest("button") &&
                !target.closest("input") &&
                !target.closest("textarea")
              ) {
                dragControls.start(e);
              }
            }
          }}
        >
          {variant === "folder" ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: 0.1 }}
              className="w-full h-full flex flex-col min-h-0"
            >
              {React.Children.map(children, (child) => {
                if (React.isValidElement(child)) {
                  return React.cloneElement(child as React.ReactElement<any>, {
                    onTitleChange: handleTitleChange,
                    onNavStateChange: handleNavStateChange,
                  });
                }
                return child;
              })}
            </motion.div>
          ) : (
            React.Children.map(children, (child) => {
              if (React.isValidElement(child)) {
                return React.cloneElement(
                  child as React.ReactElement,
                  {
                    isMobile,
                    onClose,
                    onMinimize,
                    onMaximize: handleToggleMaximize,
                    resizeWindow: (
                      w?: number,
                      h?: number,
                      animateResize = true,
                    ) => {
                      if (animateResize) {
                        if (w !== undefined)
                          animate(width, w, {
                            type: "spring",
                            stiffness: 400,
                            damping: 40,
                          });
                        if (h !== undefined)
                          animate(height, h, {
                            type: "spring",
                            stiffness: 400,
                            damping: 40,
                          });
                      } else {
                        if (w !== undefined) width.set(w);
                        if (h !== undefined) height.set(h);
                      }
                    },
                  } as any,
                );
              }
              return child;
            })
          )}
        </div>
      </motion.div>

      {!isMaximized && !isMobile && (
        <>
          <div
            className="absolute top-0 left-2 right-2 h-1.5 cursor-ns-resize z-50"
            onPointerDown={(e) => handleResizeStart(e, ["top"])}
          />
          <div
            className="absolute bottom-0 left-2 right-2 h-1.5 cursor-ns-resize z-50"
            onPointerDown={(e) => handleResizeStart(e, ["bottom"])}
          />
          <div
            className="absolute top-2 bottom-2 left-0 w-1.5 cursor-ew-resize z-50"
            onPointerDown={(e) => handleResizeStart(e, ["left"])}
          />
          <div
            className="absolute top-2 bottom-2 right-0 w-1.5 cursor-ew-resize z-50"
            onPointerDown={(e) => handleResizeStart(e, ["right"])}
          />
          <div
            className="absolute top-0 left-0 w-3 h-3 cursor-nwse-resize z-50"
            onPointerDown={(e) => handleResizeStart(e, ["top", "left"])}
          />
          <div
            className="absolute top-0 right-0 w-3 h-3 cursor-nesw-resize z-50"
            onPointerDown={(e) => handleResizeStart(e, ["top", "right"])}
          />
          <div
            className="absolute bottom-0 left-0 w-3 h-3 cursor-nesw-resize z-50"
            onPointerDown={(e) => handleResizeStart(e, ["bottom", "left"])}
          />
          <div
            className="absolute bottom-0 right-0 w-3 h-3 cursor-nwse-resize z-50"
            onPointerDown={(e) => handleResizeStart(e, ["bottom", "right"])}
          />
        </>
      )}
    </motion.div>
  );
};
