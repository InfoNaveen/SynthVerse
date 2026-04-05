'use client';
import { motion } from 'framer-motion';

interface PanelProps {
  title: string;
  status?: 'live' | 'warning' | 'danger' | 'offline';
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export default function Panel({ 
  title, status = 'live', children, 
  className = '', delay = 0 
}: PanelProps) {
  const statusColors = {
    live: '#00ff88',
    warning: '#ffaa00',
    danger: '#ff2244',
    offline: '#64748b',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={`relative rounded-2xl overflow-hidden h-full ${className}`}
      style={{
        background: 'rgba(255,255,255,0.02)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.06)',
        boxShadow: `0 0 40px rgba(0,255,136,0.03), inset 0 1px 0 rgba(255,255,255,0.05)`
      }}
    >
      {/* Top accent line */}
      <div 
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{
          background: `linear-gradient(90deg, transparent, ${statusColors[status]}80, transparent)`
        }}
      />
      
      {/* Panel header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 bg-black/20">
        <div className="flex items-center gap-3">
          <div 
            className="w-1.5 h-4 rounded-full"
            style={{ background: statusColors[status], boxShadow: `0 0 10px ${statusColors[status]}80` }}
          />
          <span className="text-sm font-mono tracking-[0.2em] text-gray-400 uppercase">
            {title}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div 
            className="w-2 h-2 rounded-full status-dot"
            style={{ background: statusColors[status] }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="p-5 h-[calc(100%-60px)] overflow-hidden">
        {children}
      </div>
    </motion.div>
  );
}
