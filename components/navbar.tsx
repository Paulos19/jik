"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Search, Bell, ChevronDown } from "lucide-react";
import { signOut } from "next-auth/react";

type UserProps = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

export default function Navbar({ user }: { user?: UserProps | null }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 h-20 transition-all duration-300 ${
        isScrolled
          ? "bg-neutral-950/45 backdrop-blur-md border-b border-white/10"
          : "bg-transparent"
      }`}
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        {/* Left Side: Logo + Nav Links */}
        <div className="flex items-center gap-12">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/imagens/logo.png"
              alt="JiK Logo"
              width={36}
              height={36}
              className="h-9 w-auto object-contain"
              priority
            />
            <span className="text-xl font-bold tracking-tight text-[#FBFBFB]">JiK</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <NavLink href="/forum">Fórum</NavLink>
            <NavLink href="/aplicativos">Aplicativos</NavLink>
            <NavLink href="/comunidade">Comunidade</NavLink>
            <div className="relative group flex items-center gap-1 text-[11px] font-bold tracking-wider text-[#FBFBFB]/75 hover:text-[#9BE8D6] cursor-pointer transition-colors uppercase">
              <span>Sobre</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-75 group-hover:opacity-100 transition-opacity" />
            </div>
          </nav>
        </div>

        {/* Right Side: Search, Notification, Profile */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 text-[#FBFBFB]/75">
            <button className="hover:text-[#9BE8D6] transition-colors cursor-pointer">
              <Search className="w-5 h-5" />
            </button>
            <button className="hover:text-[#9BE8D6] transition-colors relative cursor-pointer">
              <Bell className="w-5 h-5" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-[#9BE8D6] rounded-full border border-black/50" />
            </button>
          </div>

          <div className="h-6 w-[1px] bg-white/15" />

          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-3 hover:bg-white/5 py-1.5 px-3 rounded-full transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#9BE8D6] to-[#336E72] flex items-center justify-center text-xs font-bold text-neutral-900 overflow-hidden shadow-md">
                  {user.image ? (
                    <img src={user.image} alt={user.name || "User"} className="w-full h-full object-cover" />
                  ) : (
                    user.name?.charAt(0).toUpperCase() || "U"
                  )}
                </div>
                <div className="flex items-center gap-1 text-sm font-medium text-[#FBFBFB]/90">
                  <span>Olá, {user.name?.split(" ")[0]}</span>
                  <ChevronDown className="w-4 h-4 opacity-75" />
                </div>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 py-2 bg-neutral-900/90 border border-white/10 rounded-xl shadow-xl backdrop-blur-xl">
                  <Link href="/perfil" className="block px-4 py-2 text-sm text-neutral-300 hover:text-[#FBFBFB] hover:bg-white/5 transition-colors">
                    Meu Perfil
                  </Link>
                  <Link href="/admin" className="block px-4 py-2 text-sm text-neutral-300 hover:text-[#FBFBFB] hover:bg-white/5 transition-colors">
                    Painel Admin
                  </Link>
                  <div className="h-[1px] bg-white/10 my-1 mx-2" />
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer"
                  >
                    Sair
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-sm font-medium text-[#FBFBFB]/75 hover:text-[#FBFBFB] transition-colors">
                Entrar
              </Link>
              <Link
                href="/cadastro"
                className="text-sm font-semibold px-5 py-2 bg-gradient-to-r from-[#9BE8D6] to-[#336E72] text-[#FBFBFB] hover:opacity-90 rounded-full shadow-md transition-all hover:scale-102"
              >
                Criar conta
              </Link>
            </div>
          )}
        </div>
      </div>
    </motion.header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="relative text-[11px] font-bold tracking-wider text-[#FBFBFB]/75 hover:text-[#9BE8D6] transition-colors uppercase group"
    >
      {children}
      <span className="absolute left-0 right-0 bottom-[-4px] h-[2px] bg-[#9BE8D6] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
    </Link>
  );
}
