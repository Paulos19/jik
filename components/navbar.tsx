"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Search, Bell, ChevronDown, Menu, X, User as UserIcon } from "lucide-react";
import { signOut } from "next-auth/react";

type UserProps = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

interface NavbarProps {
  user?: UserProps | null;
  mobileFilters?: React.ReactNode;
}

export default function Navbar({ user, mobileFilters }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

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

  // Close mobile sidebar on resize if it goes back to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileSidebarOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (mobileSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileSidebarOpen]);

  const avatarContent = () => {
    if (user) {
      return (
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#9BE8D6] to-[#336E72] flex items-center justify-center text-xs font-bold text-neutral-900 overflow-hidden shadow-md shrink-0">
          {user.image ? (
            <img src={user.image} alt={user.name || "User"} className="w-full h-full object-cover" />
          ) : (
            user.name?.charAt(0).toUpperCase() || "U"
          )}
        </div>
      );
    }
    return (
      <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white transition-colors shrink-0 shadow-md">
        <UserIcon className="w-4 h-4" />
      </div>
    );
  };

  return (
    <>
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

          {/* Right Side */}
          <div className="flex items-center gap-4 md:gap-6">
            {/* Search & notification (Always visible or standard) */}
            <div className="flex items-center gap-4 text-[#FBFBFB]/75">
              <button className="hover:text-[#9BE8D6] transition-colors cursor-pointer p-1">
                <Search className="w-5 h-5" />
              </button>
              <button className="hover:text-[#9BE8D6] transition-colors relative cursor-pointer p-1">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#9BE8D6] rounded-full border border-black/50" />
              </button>
            </div>

            <div className="h-6 w-[1px] bg-white/15" />

            {/* Desktop Autenticado / Visitante */}
            <div className="hidden md:block">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-3 hover:bg-white/5 py-1.5 px-3 rounded-full transition-colors cursor-pointer"
                  >
                    {avatarContent()}
                    <div className="flex items-center gap-1 text-sm font-medium text-[#FBFBFB]/90">
                      <span>Olá, {user.name?.split(" ")[0]}</span>
                      <ChevronDown className="w-4 h-4 opacity-75" />
                    </div>
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 py-2 bg-neutral-900/90 border border-white/10 rounded-xl shadow-xl backdrop-blur-xl z-50">
                      <Link
                        href="/perfil"
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-neutral-300 hover:text-[#FBFBFB] hover:bg-white/5 transition-colors"
                      >
                        Meu Perfil
                      </Link>
                      <Link
                        href="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-neutral-300 hover:text-[#FBFBFB] hover:bg-white/5 transition-colors"
                      >
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

            {/* Mobile Sidebar Trigger (Avatar / Guest Icon) */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="block md:hidden p-1 focus:outline-none hover:opacity-85 transition-opacity cursor-pointer"
              aria-label="Abrir menu"
            >
              {avatarContent()}
            </button>
          </div>
        </div>
      </motion.header>

      {/* ──────────────────────── MOBILE DRAWER / SIDEBAR ──────────────────────── */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileSidebarOpen(false)}
              className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 block md:hidden"
            />

            {/* Drawer Body */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3, ease: "easeOut" }}
              className="fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-[#080d0e]/95 border-l border-white/10 z-50 flex flex-col justify-between overflow-y-auto block md:hidden shadow-2xl"
            >
              <div className="p-6 space-y-6">
                {/* Header: Title and Close button */}
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div className="flex items-center gap-2">
                    <Image
                      src="/imagens/logo.png"
                      alt="JiK"
                      width={28}
                      height={28}
                      className="h-7 w-auto object-contain"
                    />
                    <span className="text-lg font-bold text-[#FBFBFB] tracking-tight">JiK Hub</span>
                  </div>
                  <button
                    onClick={() => setMobileSidebarOpen(false)}
                    className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-neutral-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Profile / Auth Section */}
                <div className="bg-[#131d1f]/40 border border-white/5 rounded-2xl p-4 space-y-4">
                  {user ? (
                    <div className="space-y-4">
                      {/* User Info */}
                      <div className="flex items-center gap-3">
                        {avatarContent()}
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-white truncate">{user.name}</h4>
                          <p className="text-[10px] text-neutral-400 truncate">{user.email}</p>
                        </div>
                      </div>
                      
                      {/* User Quick Links */}
                      <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-white/5">
                        <Link
                          href="/perfil"
                          onClick={() => setMobileSidebarOpen(false)}
                          className="flex items-center justify-center py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-neutral-300 font-semibold transition-colors"
                        >
                          Meu Perfil
                        </Link>
                        <Link
                          href="/admin"
                          onClick={() => setMobileSidebarOpen(false)}
                          className="flex items-center justify-center py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-neutral-300 font-semibold transition-colors"
                        >
                          Painel Admin
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        {avatarContent()}
                        <div>
                          <h4 className="text-sm font-bold text-white">Visitante</h4>
                          <p className="text-[10px] text-neutral-400">Faça login para interagir</p>
                        </div>
                      </div>

                      {/* Login/Signup Mobile Actions */}
                      <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-white/5">
                        <Link
                          href="/login"
                          onClick={() => setMobileSidebarOpen(false)}
                          className="flex items-center justify-center py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-neutral-300 font-semibold transition-colors"
                        >
                          Entrar
                        </Link>
                        <Link
                          href="/cadastro"
                          onClick={() => setMobileSidebarOpen(false)}
                          className="flex items-center justify-center py-2 bg-gradient-to-r from-[#9BE8D6] to-[#336E72] text-[#FBFBFB] rounded-xl font-bold shadow-md transition-all"
                        >
                          Criar conta
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* Main Nav Links Section */}
                <div className="space-y-2.5">
                  <h5 className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-500">Navegação</h5>
                  <nav className="flex flex-col gap-1.5">
                    <MobileNavLink href="/forum" onClick={() => setMobileSidebarOpen(false)}>Fórum</MobileNavLink>
                    <MobileNavLink href="/aplicativos" onClick={() => setMobileSidebarOpen(false)}>Aplicativos</MobileNavLink>
                    <MobileNavLink href="/comunidade" onClick={() => setMobileSidebarOpen(false)}>Comunidade</MobileNavLink>
                  </nav>
                </div>

                {/* Page Specific Filters Section */}
                {mobileFilters && (
                  <div className="space-y-2.5 border-t border-white/5 pt-4">
                    <h5 className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-500">Filtros e Opções</h5>
                    <div className="mobile-sidebar-filters-container">
                      {mobileFilters}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Section inside Sidebar */}
              <div className="p-6 border-t border-white/5 bg-[#070b0c]/50">
                {user ? (
                  <button
                    onClick={() => {
                      setMobileSidebarOpen(false);
                      signOut({ callbackUrl: "/" });
                    }}
                    className="w-full py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 hover:text-red-350 text-xs font-bold rounded-xl transition-all cursor-pointer"
                  >
                    Sair da Conta
                  </button>
                ) : (
                  <p className="text-center text-[10px] text-neutral-500">Ecossistema JiK v1.0</p>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
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

function MobileNavLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block w-full py-2.5 px-4 bg-white/5 hover:bg-[#336E72]/10 hover:text-[#9BE8D6] text-sm font-semibold rounded-xl text-neutral-300 transition-all"
    >
      {children}
    </Link>
  );
}
