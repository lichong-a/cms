import { cn } from '@cms/utils'

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'elevated' | 'gradient'
}

export function GlassCard({ children, className, variant = 'default' }: GlassCardProps) {
  const baseClasses = 'rounded-2xl border backdrop-blur-xl transition-all duration-300'
  
  const variants = {
    default: 'bg-white/70 dark:bg-gray-900/70 border-white/20 dark:border-gray-700/20 shadow-glass',
    elevated: 'bg-white/80 dark:bg-gray-900/80 border-white/30 dark:border-gray-700/30 shadow-glass-dark',
    gradient: 'bg-gradient-to-br from-white/60 to-white/80 dark:from-gray-900/60 dark:to-gray-900/80 border-white/20 dark:border-gray-700/20 shadow-glass'
  }
  
  return (
    <div className={cn(baseClasses, variants[variant], className)}>
      {children}
    </div>
  )
}
