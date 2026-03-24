import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark';

interface UIState {
  theme: Theme;
  sidebarOpen: boolean;
  loading: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setLoading: (loading: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: 'light',
      sidebarOpen: true,
      loading: false,

      setTheme: (theme) => {
        set({ theme });
        if (typeof document !== 'undefined') {
          document.documentElement.classList.toggle('dark', theme === 'dark');
        }
      },

      toggleTheme: () =>
        set((state) => {
          const newTheme = state.theme === 'light' ? 'dark' : 'light';
          if (typeof document !== 'undefined') {
            document.documentElement.classList.toggle('dark', newTheme === 'dark');
          }
          return { theme: newTheme };
        }),

      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      setLoading: (loading) => set({ loading }),
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);
