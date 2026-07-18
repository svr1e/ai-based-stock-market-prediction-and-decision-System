import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Home, Activity } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#050816] flex items-center justify-center p-4">
      <div className="absolute inset-0 cyber-grid opacity-30" />
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 text-center">
        <div className="text-9xl font-black font-display text-transparent bg-clip-text bg-gradient-to-b from-[#00E5FF] to-[#00E5FF]/20 mb-4">404</div>
        <h2 className="text-2xl font-bold text-white mb-2">Page Not Found</h2>
        <p className="text-gray-400 mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/dashboard">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="neon-button px-6 py-3 rounded-xl font-semibold flex items-center gap-2 mx-auto">
            <Home className="w-4 h-4" /> Back to Dashboard
          </motion.button>
        </Link>
      </motion.div>
    </div>
  );
}
