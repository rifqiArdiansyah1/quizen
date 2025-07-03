"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Menu, X, User, LogOut, Home, BookOpen, Loader2 } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { createAvatar } from '@dicebear/core';
import { adventurer } from '@dicebear/collection';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [authState, setAuthState] = useState<{
    isLoggedIn: boolean;
    userId: number | null;
    userName: string | null;
    userImage: string | null;
  }>({
    isLoggedIn: false,
    userId: null,
    userName: null,
    userImage: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    // Generate random avatar for demo purposes
    const avatar = createAvatar(adventurer, {
      seed: Math.random().toString(36).substring(7),
      size: 40,
    }).toDataUri();
    setAvatarUrl(avatar);

    const checkAuthStatus = async () => {
      try {
        const response = await fetch('/api/auth/check', {
          credentials: 'include',
          cache: 'no-store'
        });

        if (response.ok) {
          const data = await response.json();
          setAuthState({
            isLoggedIn: true,
            userId: data.userId,
            userName: data.userName,
            userImage: data.userImage || avatar,
          });
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, [pathname]);

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        setAuthState({
          isLoggedIn: false,
          userId: null,
          userName: null,
          userImage: null,
        });
        router.push('/login');
        router.refresh();
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (isLoading) {
    return (
      <nav className="bg-[#2a2521] text-amber-100 shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold tracking-wide flex items-center gap-2">
            <span className="text-amber-300">🌲</span>
            <span>QuizCerdas</span>
          </Link>
          <Loader2 className="animate-spin h-6 w-6" />
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-[#2a2521] text-amber-100 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link
          href="/"
          className="text-2xl font-bold tracking-wide flex items-center gap-2 hover:text-amber-300 transition-colors"
          onClick={() => setOpen(false)}
        >
          <span className="text-amber-300">🌲</span>
          <span>QuizCerdas</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6 text-lg">
          <Link
            href="/quiz"
            className={`flex items-center gap-1 hover:text-amber-300 transition-colors ${pathname === '/quiz' ? 'text-amber-300 font-medium' : ''
              }`}
          >
            <BookOpen size={18} />
            <span>Kuis</span>
          </Link>

          {authState.isLoggedIn ? (
            <div className="flex items-center gap-4">
              {/* <Link
                href="/dashboard"
                className={`flex items-center gap-1 hover:text-amber-300 transition-colors ${pathname === '/dashboard' ? 'text-amber-300 font-medium' : ''
                  }`}
              >
                <Home size={18} />
                <span>Dashboard</span>
              </Link> */}

              <div className="relative group">
                <button className="flex items-center gap-2 hover:text-amber-300 transition-colors">
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-amber-300">
                    <img
                      src={authState.userImage || avatarUrl}
                      alt="User avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span>{authState.userName || 'Profil'}</span>
                </button>

                <div className="absolute right-0 mt-2 w-48 bg-[#3a332e] rounded-md shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <Link
                    href={`/users/${authState.userId}`}
                    className="flex items-center gap-2 px-4 py-2 hover:bg-[#4a433e] text-sm"
                  >
                    <User size={16} />
                    <span>Profil Saya</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-[#4a433e] text-sm"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <Link
              href="/login"
              className={`flex items-center gap-1 hover:text-amber-300 transition-colors ${pathname === '/login' ? 'text-amber-300 font-medium' : ''
                }`}
            >
              <User size={18} />
              <span>Login</span>
            </Link>
          )}
        </div>

        {/* Mobile Button */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-amber-100 hover:text-amber-300 p-1"
          aria-label="Toggle menu"
        >
          {open ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu Panel */}
      {open && (
        <div className="md:hidden px-4 pb-4 space-y-3 bg-[#2a2521] text-lg border-t border-[#3a332e]">
          <Link
            href="/quiz"
            className="flex items-center gap-2 hover:text-amber-300 py-2 px-2 rounded hover:bg-[#3a332e]"
            onClick={() => setOpen(false)}
          >
            <BookOpen size={18} />
            <span>Kuis</span>
          </Link>

          {authState.isLoggedIn ? (
            <>
              <Link
                href="/dashboard"
                className="flex items-center gap-2 hover:text-amber-300 py-2 px-2 rounded hover:bg-[#3a332e]"
                onClick={() => setOpen(false)}
              >
                <Home size={18} />
                <span>Dashboard</span>
              </Link>
              <Link
                href={`/users/${authState.userId}`}
                className="flex items-center gap-2 hover:text-amber-300 py-2 px-2 rounded hover:bg-[#3a332e]"
                onClick={() => setOpen(false)}
              >
                <User size={18} />
                <span>Profil Saya</span>
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setOpen(false);
                }}
                className="flex items-center gap-2 w-full text-left hover:text-amber-300 py-2 px-2 rounded hover:bg-[#3a332e]"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 hover:text-amber-300 py-2 px-2 rounded hover:bg-[#3a332e]"
              onClick={() => setOpen(false)}
            >
              <User size={18} />
              <span>Login</span>
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}