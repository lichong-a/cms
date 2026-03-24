'use client';

import { Menu, X, Sun, Moon } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { Button } from '@/components/Button';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <nav className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-b border-white/20 dark:border-gray-700/20 sticky top-0 z-50 shadow-glass">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold text-primary-500">
            CMS
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-primary-500 transition-colors">
              Home
            </Link>
            <Link href="/category" className="text-gray-700 hover:text-primary-500 transition-colors">
              Categories
            </Link>
            <Link href="/search" className="text-gray-700 hover:text-primary-500 transition-colors">
              Search
            </Link>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>

            <Link href="/login">
              <Button variant="outline" size="sm">
                Login
              </Button>
            </Link>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              <Link
                href="/"
                className="text-gray-700 hover:text-primary-500 transition-colors"
              >
                Home
              </Link>
              <Link
                href="/category"
                className="text-gray-700 hover:text-primary-500 transition-colors"
              >
                Categories
              </Link>
              <Link
                href="/search"
                className="text-gray-700 hover:text-primary-500 transition-colors"
              >
                Search
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
