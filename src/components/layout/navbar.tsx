'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/hooks/use-auth';
import { usePreferencesStore } from '@/lib/store/preferences-store';
import { cn } from '@/lib/utils';
import { 
  Menu, 
  X, 
  Tv, 
  Film, 
  Video, 
  User, 
  Settings, 
  LogOut, 
  Search,
  Sun,
  Moon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchDialog } from '@/components/search/search-dialog';

const navItems = [
  { name: 'Canlı TV', href: '/live', icon: Tv },
  { name: 'Filmler', href: '/movies', icon: Film },
  { name: 'Diziler', href: '/series', icon: Video },
  { name: 'Profil', href: '/profile', icon: User },
  { name: 'Ayarlar', href: '/settings', icon: Settings },
];

export function Navbar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { preferences, updatePreferences } = usePreferencesStore();
  
  const toggleTheme = () => {
    const newTheme = preferences.theme === 'dark' ? 'light' : 'dark';
    updatePreferences({ theme: newTheme });
  };
  
  return (
    <nav className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 w-full border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold">
                IPTV Platform
              </Link>
            </div>
            
            {/* Desktop navigation */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2',
                      isActive
                        ? 'border-primary text-foreground'
                        : 'border-transparent text-muted-foreground hover:border-gray-300 hover:text-foreground'
                    )}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {preferences.theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
            
            <Button variant="ghost" size="icon" onClick={() => setSearchOpen(true)}>
              <Search className="h-5 w-5" />
            </Button>
            
            <Button variant="ghost" size="icon" onClick={logout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              aria-expanded={isOpen}
            >
              <span className="sr-only">Ana menüyü aç</span>
              {isOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div className={cn('sm:hidden', isOpen ? 'block' : 'hidden')}>
        <div className="pt-2 pb-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center px-3 py-2 text-base font-medium border-l-4',
                  isActive
                    ? 'border-primary bg-primary/10 text-foreground'
                    : 'border-transparent text-muted-foreground hover:bg-gray-50 hover:border-gray-300 hover:text-foreground'
                )}
                onClick={() => setIsOpen(false)}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
          
          <button
            className="flex w-full items-center px-3 py-2 text-base font-medium border-l-4 border-transparent text-muted-foreground hover:bg-gray-50 hover:border-gray-300 hover:text-foreground"
            onClick={() => {
              setIsOpen(false);
              setSearchOpen(true);
            }}
          >
            <Search className="mr-3 h-5 w-5" />
            Arama
          </button>
          
          <button
            className="flex w-full items-center px-3 py-2 text-base font-medium border-l-4 border-transparent text-muted-foreground hover:bg-gray-50 hover:border-gray-300 hover:text-foreground"
            onClick={() => {
              toggleTheme();
              setIsOpen(false);
            }}
          >
            {preferences.theme === 'dark' ? (
              <>
                <Sun className="mr-3 h-5 w-5" />
                Aydınlık Mod
              </>
            ) : (
              <>
                <Moon className="mr-3 h-5 w-5" />
                Karanlık Mod
              </>
            )}
          </button>
          
          <button
            className="flex w-full items-center px-3 py-2 text-base font-medium border-l-4 border-transparent text-muted-foreground hover:bg-gray-50 hover:border-gray-300 hover:text-foreground"
            onClick={() => {
              logout();
              setIsOpen(false);
            }}
          >
            <LogOut className="mr-3 h-5 w-5" />
            Çıkış Yap
          </button>
        </div>
      </div>
      
      {/* Search Dialog */}
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </nav>
  );
}