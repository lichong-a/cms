'use client'

import { motion } from 'framer-motion'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

interface StaggeredListProps {
  children: React.ReactNode
  className?: string
}

export function StaggeredList({ children, className }: StaggeredListProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {children}
    </motion.div>
  )
}

interface StaggeredItemProps {
  children: React.ReactNode
  className?: string
}

export function StaggeredItem({ children, className }: StaggeredItemProps) {
  return (
    <motion.div
      variants={itemVariants}
      className={className}
    >
      {children}
    </motion.div>
  )
}
