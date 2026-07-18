import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | ReactNode;
  change?: number;
  changeLabel?: string;
  icon: ReactNode;
  iconColor?: string;
  delay?: number;
  className?: string;
  subtitle?: string;
}

export default function StatCard({
  title,
  value,
  change,
  changeLabel,
  icon,
  iconColor = 'text-[#00E5FF]',
  delay = 0,
  className,
  subtitle,
}: StatCardProps) {
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: 'easeOut' }}
      className={cn('stat-card group', className)}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-cyan-500/5 to-transparent" />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{title}</p>
            {subtitle && <p className="text-[10px] text-gray-600 mt-0.5">{subtitle}</p>}
          </div>
          <div className={cn('p-2 rounded-xl bg-white/5', iconColor)}>
            {icon}
          </div>
        </div>

        <div className="text-2xl font-bold font-display text-white mb-2">
          {value}
        </div>

        {change !== undefined && (
          <div className={cn(
            'flex items-center gap-1 text-xs font-medium',
            isPositive ? 'text-neon-green' : isNegative ? 'text-red-400' : 'text-gray-400'
          )}>
            {isPositive ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : isNegative ? (
              <TrendingDown className="w-3.5 h-3.5" />
            ) : (
              <Minus className="w-3.5 h-3.5" />
            )}
            <span>
              {isPositive ? '+' : ''}{change.toFixed(2)}%
              {changeLabel && <span className="text-gray-500 ml-1">{changeLabel}</span>}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
