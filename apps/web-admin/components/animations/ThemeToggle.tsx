'use client'

import { motion } from 'framer-motion'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="p-2 rounded-full backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border border-white/20 dark:border-gray-700/20">
        <div className="w-5 h-5" />
      </div>
    )
  }
  
  return (
    <motion.button
      whileHover={{ scale: 1.1, rotate: 15 }}
      whileTap={{ scale: 0.9 }}
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-full backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border border-white/20 dark:border-gray-700/20"
      aria-label="切换主题"
    >
      <motion.div
        initial={false}
        animate={{ rotate: theme === 'dark' ? 180 : 0 }}
        transition={{ duration: 0.3 }}
      >
        {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </motion.div>
    </motion.button>
  )
}
