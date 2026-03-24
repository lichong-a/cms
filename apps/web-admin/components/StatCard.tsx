import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
}

export default function StatCard({ title, value, change, trend = 'neutral', icon }: StatCardProps) {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getChangeColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-500';
      case 'down':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}
      transition={{ duration: 0.3 }}
      data-testid="stat-card"
      className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 rounded-2xl border border-white/20 dark:border-gray-700/20 shadow-glass p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold text-foreground mt-2">{value}</p>
          {change && (
            <div className="flex items-center mt-2">
              {getTrendIcon()}
              <span className={`text-sm font-medium ml-1 ${getChangeColor()}`}>
                {change}
              </span>
            </div>
          )}
        </div>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>
    </motion.div>
  );
}
