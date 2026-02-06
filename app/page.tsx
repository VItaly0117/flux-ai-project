"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Upload, FileText, X } from "lucide-react";

export default function HomePage() {
  const [message, setMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasOutput, setHasOutput] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    setHasOutput(true);
    setTimeout(() => setIsGenerating(false), 2000);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith(".json") || file.name.endsWith(".txt"))) {
      setUploadedFile(file);
    }
  }, []);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback(() => setIsDragging(false), []);

  const removeFile = () => setUploadedFile(null);

  return (
    <div className="relative min-h-[calc(100vh-4rem)] lg:min-h-screen px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-2"
        >
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            FLUX AI
          </h1>
          <p className="text-zinc-400 text-lg">Craft the perfect response instantly.</p>
        </motion.div>

        {/* Context Upload Zone */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
        >
          <p className="text-sm font-medium text-zinc-400 mb-2">Context Upload</p>
          <div
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            className={`
              rounded-2xl backdrop-blur-2xl border border-dashed transition-all duration-300 overflow-hidden
              ${uploadedFile
                ? "bg-blue-500/10 border-blue-500/40 shadow-lg shadow-blue-500/10"
                : isDragging
                ? "bg-blue-500/10 border-blue-500/50 shadow-lg shadow-blue-500/20"
                : "bg-blue-500/5 border-white/10 hover:border-blue-500/30 hover:bg-blue-500/5"
              }
            `}
          >
            {uploadedFile ? (
              <div className="p-6 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="w-10 h-10 text-blue-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium text-zinc-100 truncate">{uploadedFile.name}</p>
                    <p className="text-sm text-zinc-500">{(uploadedFile.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <motion.button
                  onClick={removeFile}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-white/10 transition-colors"
                  aria-label="Remove file"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>
            ) : (
              <div className="p-8 sm:p-12 text-center">
                <Upload className="w-12 h-12 mx-auto text-blue-400/70 mb-3" />
                <p className="text-zinc-300 font-medium mb-1">
                  Drop Telegram export (.json / .txt) here to analyze context
                </p>
                <p className="text-sm text-zinc-500">Upload chat history for better advice.</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Input Zone — Glass Card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="rounded-2xl backdrop-blur-2xl bg-blue-500/5 border border-white/10 shadow-xl shadow-blue-500/20 overflow-hidden"
        >
          <div className="p-6 space-y-6">
            <div>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Paste her message here... (e.g., 'I don't usually talk to strangers lol')"
                rows={4}
                className="w-full resize-none rounded-xl bg-white/5 border border-white/10 px-4 py-4 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/30 transition-all"
              />
            </div>
            <motion.button
              onClick={handleGenerate}
              disabled={isGenerating}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="relative w-full py-4 rounded-xl overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-500 bg-[length:200%_100%] text-white font-semibold text-lg shadow-lg shadow-blue-500/25 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
              style={{ animation: "gradient-shift 3s ease infinite" }}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isGenerating ? (
                  <>
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    />
                    Generating...
                  </>
                ) : (
                  <>Generate Rizz <span>✨</span></>
                )}
              </span>
            </motion.button>
          </div>
        </motion.div>

        {/* Output Zone */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={`
            rounded-2xl backdrop-blur-2xl border overflow-hidden transition-all duration-500
            ${hasOutput
              ? "bg-blue-500/5 border-cyan-500/40 shadow-lg shadow-cyan-500/10"
              : "bg-blue-500/5 border-white/10"
            }
          `}
        >
          <div className="p-6 min-h-[120px] flex flex-col items-center justify-center text-center">
            {!hasOutput ? (
              <div className="space-y-3">
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  className="w-12 h-12 mx-auto rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center"
                >
                  <span className="text-2xl">✨</span>
                </motion.div>
                <p className="text-zinc-500">Ready to generate...</p>
                <p className="text-sm text-zinc-600">Paste a message and hit the button</p>
              </div>
            ) : isGenerating ? (
              <div className="space-y-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                  className="w-10 h-10 mx-auto border-2 border-cyan-500/30 border-t-cyan-400 rounded-full"
                />
                <p className="text-zinc-400">Crafting your perfect response...</p>
              </div>
            ) : (
              <div className="w-full text-left space-y-2">
                <p className="text-sm font-medium text-cyan-400/80">Your rizz</p>
                <p className="text-zinc-200">[Output will appear here once API is connected]</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
