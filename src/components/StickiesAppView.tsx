import React, { useState } from "react";

interface StickiesAppViewProps {
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  resizeWindow?: (w?: number, h?: number, animate?: boolean) => void;
}

export const StickiesAppView: React.FC<StickiesAppViewProps> = ({
  onClose,
  onMaximize,
  resizeWindow,
}) => {
  const [content, setContent] = useState(
    "folders: working\napps: working\nshop: in progress\narchive: still a mess, fix before launch\nscatter: swap images\nnote: leave this one up",
  );

  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapse = (e?: React.SyntheticEvent) => {
    e?.stopPropagation();
    resizeWindow?.(undefined, !isCollapsed ? 14 : 200, true);
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#FCF8A0] border border-black/80 font-['Geneva',_sans-serif] pointer-events-auto shadow-xl">
      {/* Title bar - serves as drag region */}
      <div
        onDoubleClick={toggleCollapse}
        className="h-[18px] bg-[#F7E24F] drag-region border-b border-[#D8C63E] flex items-center justify-between px-[6px] shrink-0 pointer-events-auto cursor-grab active:cursor-grabbing touch-none select-none shadow-[inset_0_-1px_0_rgba(0,0,0,0.1)]"
      >
        {/* Left button: Close (Square) */}
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onClose?.();
          }}
          className="w-[9px] h-[9px] border border-[#A69415] flex items-center justify-center bg-transparent active:bg-black/10 cursor-pointer"
        />

        {/* Right buttons: Triangle (Maximize) and Window (Collapse/Expand) */}
        <div className="flex items-center gap-[4px]" onPointerDown={(e) => e.stopPropagation()}>
          {!isCollapsed && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMaximize?.();
              }}
              className="w-[10px] h-[10px] flex items-center justify-center active:bg-black/10"
              style={{ paddingBottom: "1px", paddingRight: "1px" }}
            >
              <svg
                width="8"
                height="8"
                viewBox="0 0 10 10"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1 9L9 9L9 1L1 9Z"
                  stroke="#A69415"
                  strokeWidth="1.5"
                  strokeLinejoin="miter"
                />
              </svg>
            </button>
          )}
          <button
            onClick={toggleCollapse}
            className="w-[10px] h-[10px] flex items-center justify-center active:bg-black/10"
          >
            <svg
              width="9"
              height="9"
              viewBox="0 0 10 10"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="1.5"
                y="1.5"
                width="7"
                height="7"
                stroke="#A69415"
                strokeWidth="1.2"
              />
              <line
                x1="1.5"
                y1="4"
                x2="8.5"
                y2="4"
                stroke="#A69415"
                strokeWidth="1.2"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Content area */}
      <div
        className={`flex-1 overflow-hidden transition-opacity duration-200 ${isCollapsed ? "opacity-0" : "opacity-100"}`}
      >
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-full p-2 bg-transparent resize-none outline-none text-black/90 pointer-events-auto text-[14px]"
          spellCheck={false}
          tabIndex={isCollapsed ? -1 : 0}
        />
      </div>
    </div>
  );
};
