import React, { useState, useEffect } from 'react';

export interface IframeRendererProps {
  url: string;
  title?: string;
  onFocus?: () => void;
}

export const IframeRenderer: React.FC<IframeRendererProps> = ({ url, title, onFocus }) => {
  const [mounted, setMounted] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);

  // Mount iframe only after open animation completes (~400ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  // Transparent overlay during drag and resize
  useEffect(() => {
    const handlePointerDown = () => {
      setIsInteracting(true);
    };
    const handlePointerUp = () => {
      setIsInteracting(false);
    };

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, []);

  return (
    <div
      className="relative w-full h-full min-h-[300px] bg-black/90"
      onPointerDown={onFocus}
    >
      {/* Overlay active during drag/resize so iframe doesn't swallow cursor events */}
      {isInteracting && (
        <div
          className="absolute inset-0 z-20 bg-transparent"
          onPointerDown={onFocus}
        />
      )}

      {/* Invisible overlay for focus management when clicking iframe */}
      <div
        className="absolute inset-0 z-10 bg-transparent"
        onPointerDown={(e) => {
          onFocus?.();
          (e.currentTarget as HTMLElement).style.display = 'none';
        }}
      />

      {mounted ? (
        <iframe
          src={url}
          title={title || 'Embedded Content'}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-white/40 text-sm">
          Loading...
        </div>
      )}
    </div>
  );
};
