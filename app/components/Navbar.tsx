"use client";
import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-[#2a2521] text-amber-100 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold tracking-wide hover:text-amber-300 transition-colors">
          🌲 QuizCerdas
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-6 text-lg">
          <Link href="/quiz" className="hover:text-amber-300 transition-colors">
            Kuis
          </Link>
          <Link href="/dashboard" className="hover:text-amber-300 transition-colors">
            Dashboard
          </Link>
          <Link href="/login" className="hover:text-amber-300 transition-colors">
            Login
          </Link>
        </div>

        {/* Mobile Button */}
        <button onClick={() => setOpen(!open)} className="md:hidden text-amber-100 hover:text-amber-300">
          {open ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu Panel */}
      {open && (
        <div className="md:hidden px-4 pb-4 space-y-2 bg-[#2a2521] text-lg">
          <Link href="/quiz" className="block hover:text-amber-300" onClick={() => setOpen(false)}>
            Kuis
          </Link>
          <Link href="/dashboard" className="block hover:text-amber-300" onClick={() => setOpen(false)}>
            Dashboard
          </Link>
          <Link href="/login" className="block hover:text-amber-300" onClick={() => setOpen(false)}>
            Login
          </Link>
        </div>
      )}
    </nav>
  );
}