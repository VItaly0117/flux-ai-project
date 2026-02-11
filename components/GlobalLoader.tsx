"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export function GlobalLoader() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const hide = () => setIsVisible(false);

    if (document.readyState === "complete") {
      hide();
      return;
    }

    window.addEventListener("load", hide, { once: true });
    return () => window.removeEventListener("load", hide);
  }, []);

  return (
    <AnimatePresence>
      {isVisible ? (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="fixed inset-0 z-50 bg-black flex items-center justify-center"
        >
          <div className="flex flex-col items-center gap-4">
            <motion.div
              animate={{ opacity: [0.6, 1, 0.6], scale: [0.98, 1.02, 0.98] }}
              transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
              className="flex items-center gap-3"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/25 ring-1 ring-white/10">
                <span className="text-white font-bold text-sm">FLUX</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                FLUX
              </span>
            </motion.div>

            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
              className="w-7 h-7 border-2 border-white/20 border-t-cyan-400 rounded-full"
            />
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
