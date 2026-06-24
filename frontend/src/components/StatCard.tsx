import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -4, boxShadow: '0 10px 40px rgba(124, 58, 237, 0.2)' }}
      className="glass rounded-xl p-6 flex flex-col cursor-pointer group"
    >
      <motion.div
        className="flex items-center justify-between mb-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        {icon && (
          <motion.div
            className="text-primary group-hover:text-secondary transition-colors"
            whileHover={{ scale: 1.1, rotate: 10 }}
            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
          >
            {icon}
          </motion.div>
        )}
      </motion.div>
      <motion.div
        className="flex items-baseline gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
      >
        <motion.div
          className="text-2xl font-bold text-foreground"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          {value}
        </motion.div>
        {trend && (
          <motion.div
            className={`flex items-center gap-1 text-xs font-medium ${
              trend.isPositive ? 'text-green-400' : 'text-destructive'
            }`}
            animate={{ x: [0, 2, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <TrendingUp className="w-3 h-3" />
            {trend.value}%
          </motion.div>
        )}
      </motion.div>
      {subtitle && (
        <motion.p
          className="text-xs text-muted-foreground mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {subtitle}
        </motion.p>
      )}
    </motion.div>
  );
}
