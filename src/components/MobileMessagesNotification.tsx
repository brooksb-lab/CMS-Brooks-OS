import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { windowsRegistryData } from '@/src/data/windowLoader';

export const MOBILE_NOTIFICATION_Z_INDEX = 99999;

const ICONS = {
  imessage: "https://res.cloudinary.com/dezas8twg/image/upload/v1777921908/BrooksOS_0010_iMessage_ytpuio.png"
};

export const MobileMessagesNotification: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Do not show if already dismissed in the current session
    const isDismissed = sessionStorage.getItem('mobile_sticky_notification_dismissed');
    if (isDismissed) {
      return;
    }

    // Appears on load after the springboard has settled, with a short delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 600);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('mobile_sticky_notification_dismissed', 'true');
  };

  // Read note text from content source (windowsRegistryData)
  const stickyEntry = windowsRegistryData.find((w) => w.id === 'stickies');
  const noteText =
    stickyEntry?.content?.text ||
    "folders: working\napps: working\nshop: in progress\narchive: still a mess, fix before launch\nscatter: swap images\nnote: leave this one up";

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="mobile-messages-notification"
          initial={{ opacity: 0, y: -80, scale: 0.92 }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
              type: "spring",
              stiffness: 350,
              damping: 35,
              mass: 1,
            },
          }}
          exit={{
            opacity: 0,
            y: -16,
            scale: 0.95,
            transition: {
              duration: 0.25,
              ease: "easeOut",
            },
          }}
          onClick={handleDismiss}
          style={{ zIndex: MOBILE_NOTIFICATION_Z_INDEX }}
          className="fixed top-[calc(44px+env(safe-area-inset-top,0px))] left-3.5 right-3.5 max-w-[420px] mx-auto cursor-pointer select-none active:scale-[0.98] transition-transform duration-100 pointer-events-auto"
        >
          <div
            className="rounded-[26px] p-4 border-[0.5px] border-white/25 shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-2xl"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              WebkitBackdropFilter: 'blur(30px) saturate(180%)',
              backdropFilter: 'blur(30px) saturate(180%)',
            }}
          >
            {/* Header Row */}
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 bg-blue-500 flex items-center justify-center p-0.5 shadow-sm">
                  <img
                    src={ICONS.imessage}
                    alt="Messages"
                    className="w-full h-full object-cover rounded-full"
                    draggable={false}
                  />
                </div>
                <span className="font-semibold text-[13px] text-white tracking-tight">
                  Sticky
                </span>
              </div>
              <span className="text-[11px] font-normal text-white/60 shrink-0">
                now
              </span>
            </div>

            {/* Body */}
            <div className="text-[13px] leading-snug font-normal text-white/95 whitespace-pre-wrap text-left">
              {noteText}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
