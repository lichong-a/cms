'use client';

import { cn } from '@cms/utils';
import {
  Home,
  FileText,
  Settings,
  Users,
  FolderOpen,
  Image,
  MessageSquare
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { ThemeToggle } from '@/components/animations/ThemeToggle';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: Home },
  { href: '/admin/articles', label: 'Articles', icon: FileText },
  { href: '/admin/categories', label: 'Categories', icon: FolderOpen },
  { href: '/admin/media', label: 'Media', icon: Image },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/comments', label: 'Comments', icon: MessageSquare },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-r border-white/20 dark:border-gray-700/20 min-h-screen shadow-glass">
      <div className="p-6 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-primary-500">
          CMS Admin
        </Link>
        <ThemeToggle />
      </div>

      <nav className="px-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
