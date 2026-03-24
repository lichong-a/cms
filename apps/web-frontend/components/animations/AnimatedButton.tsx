'use client'

import { motion } from 'framer-motion'

interface AnimatedButtonProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}

export function AnimatedButton({ 
  children, 
  className, 
  onClick,
  disabled = false,
  type = 'button'
}: AnimatedButtonProps) {
  return (
    <motion.button
      whileHover={disabled ? {} : { scale: 1.05 }}
      whileTap={disabled ? {} : { scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      className={className}
      onClick={onClick}
      disabled={disabled}
      type={type}
    >
      {children}
    </motion.button>
  )
}
