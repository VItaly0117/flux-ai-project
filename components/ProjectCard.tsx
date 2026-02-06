"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Play } from "lucide-react";

export interface ProjectCardProps {
  id: string;
  title: string;
  coverImage: string;
  description?: string;
}

export function ProjectCard({ title, coverImage }: ProjectCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="group relative rounded-2xl overflow-hidden backdrop-blur-xl bg-white/5 border border-white/10 hover:border-violet-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-violet-500/20"
    >
      {/* Cover Image */}
      <div className="relative aspect-video overflow-hidden">
        <Image
          src={coverImage}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent opacity-80" />
        
        {/* Glow overlay on hover */}
        <div className="absolute inset-0 bg-violet-500/0 group-hover:bg-violet-500/10 transition-colors duration-300" />
      </div>

      {/* Content */}
      <div className="p-5 flex items-center justify-between gap-4">
        <h3 className="font-semibold text-lg text-zinc-100 truncate group-hover:text-violet-200 transition-colors">
          {title}
        </h3>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 px-4 py-3 min-h-[44px] rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 text-white text-sm font-medium shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 transition-shadow duration-300 flex-shrink-0 touch-manipulation"
        >
          <Play className="w-4 h-4 fill-current" />
          Run
        </motion.button>
      </div>
    </motion.article>
  );
}
