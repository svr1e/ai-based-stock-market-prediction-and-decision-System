import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';

export default function PageLoader() {
  return (
    <div className="fixed inset-0 bg-[#050816] flex flex-col items-center justify-center z-50">
      {/* Animated logo */}
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="relative mb-8"
      >
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
          <Activity className="w-8 h-8 text-black" />
        </div>
        <div className="absolute inset-0 rounded-2xl border border-[#00E5FF]/40 animate-ping" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="font-display text-xl font-bold">
          <span className="text-white">Stock</span>
          <span className="text-[#00E5FF]">AI</span>
        </h2>
        <p className="text-sm text-gray-500 mt-1">Loading your workspace...</p>
      </motion.div>

      {/* Progress bar */}
      <div className="mt-8 w-48 h-0.5 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="h-full w-1/2 bg-gradient-to-r from-transparent via-[#00E5FF] to-transparent"
        />
      </div>
    </div>
  );
}
