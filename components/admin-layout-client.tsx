"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Newspaper,
  FolderSync,
  MessageSquare,
  Tags,
  Users,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  CloudSun,
  Clock,
  Compass,
  User as UserIcon,
  Smartphone,
} from "lucide-react";
import { signOut } from "next-auth/react";

type UserProps = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string | null;
};

interface AdminLayoutClientProps {
  children: React.ReactNode;
  user: UserProps;
}

export default function AdminLayoutClient({ children, user }: AdminLayoutClientProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>("");
  const [weather, setWeather] = useState<{
    temp: number | null;
    desc: string;
    city: string;
  }>({
    temp: null,
    desc: "Carregando...",
    city: "Buscando localização...",
  });

  // Persist sidebar state
  useEffect(() => {
    const saved = localStorage.getItem("admin_sidebar_collapsed");
    if (saved) {
      setIsCollapsed(saved === "true");
    }
  }, []);

  const toggleSidebar = () => {
    const nextState = !isCollapsed;
    setIsCollapsed(nextState);
    localStorage.setItem("admin_sidebar_collapsed", String(nextState));
  };

  // Clock tick
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Weather and Location
  useEffect(() => {
    const getWeatherDescription = (code: number) => {
      if (code === 0) return "Céu Limpo";
      if ([1, 2, 3].includes(code)) return "Parcialmente Nublado";
      if ([45, 48].includes(code)) return "Nevoeiro";
      if ([51, 53, 55].includes(code)) return "Chuvisco";
      if ([61, 63, 65].includes(code)) return "Chuva";
      if ([71, 73, 75].includes(code)) return "Neve";
      if ([80, 81, 82].includes(code)) return "Pancadas de Chuva";
      if ([95, 96, 99].includes(code)) return "Tempestade";
      return "Ensolarado";
    };

    const fetchWeather = async (lat: number, lon: number, cityName: string) => {
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code`
        );
        const data = await res.json();
        if (data && data.current) {
          setWeather({
            temp: Math.round(data.current.temperature_2m),
            desc: getWeatherDescription(data.current.weather_code),
            city: cityName,
          });
        }
      } catch (err) {
        setWeather({
          temp: 22,
          desc: "Parcialmente Nublado",
          city: "São Paulo, SP (Default)",
        });
      }
    };

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          // Reverse geocode to get city name (using a free open service or standard display)
          let cityName = "Sua Localização";
          try {
            const geoRes = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`
            );
            const geoData = await geoRes.json();
            if (geoData && geoData.address) {
              cityName =
                geoData.address.city ||
                geoData.address.town ||
                geoData.address.suburb ||
                "Localidade Atual";
            }
          } catch (e) {
            cityName = "Localização Atual";
          }
          fetchWeather(latitude, longitude, cityName);
        },
        () => {
          // Fallback to Sao Paulo coordinates
          fetchWeather(-23.5505, -46.6333, "São Paulo, SP");
        }
      );
    } else {
      fetchWeather(-23.5505, -46.6333, "São Paulo, SP");
    }
  }, []);

  const menuItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/usuarios", label: "Usuários", icon: Users },
    { href: "/admin/noticias", label: "Notícias", icon: Newspaper },
    { href: "/admin/hub", label: "Hub Updates", icon: FolderSync },
    { href: "/admin/nunu", label: "Nunu Config", icon: Smartphone },
  ];

  const forumItems = [
    { href: "/admin/forum", label: "Moderação", icon: MessageSquare },
    { href: "/admin/forum/categorias", label: "Categorias", icon: Tags },
  ];

  return (
    <div className="min-h-screen bg-[#070b0c] text-[#FBFBFB] flex overflow-hidden font-sans">
      {/* ──────────────────────── SIDEBAR ──────────────────────── */}
      <motion.aside
        animate={{ width: isCollapsed ? 80 : 256 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="border-r border-white/5 bg-[#0a0f10] flex flex-col shrink-0 relative z-20"
      >
        {/* Toggle Button */}
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-6 w-6 h-6 rounded-full bg-[#131d1f] border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white hover:border-[#9BE8D6] transition-colors cursor-pointer z-30"
        >
          {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>

        {/* Logo Area */}
        <div className="h-16 px-5 flex items-center border-b border-white/5 overflow-hidden">
          <Link href="/admin" className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#336E72] to-[#9BE8D6] flex items-center justify-center font-extrabold text-white text-base shadow-inner">
              J
            </div>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-extrabold text-md tracking-tight bg-gradient-to-r from-white to-[#FBFBFB]/70 bg-clip-text text-transparent"
              >
                JiK <span className="text-[10px] font-bold uppercase text-[#9BE8D6] tracking-wider ml-1">Admin</span>
              </motion.span>
            )}
          </Link>
        </div>

        {/* Sidebar Nav Items */}
        <div className="flex-1 py-6 px-4 space-y-7 overflow-y-auto">
          {/* Main Menu */}
          <div className="space-y-1.5">
            {!isCollapsed && (
              <span className="text-[10px] font-extrabold text-neutral-500 uppercase tracking-widest px-3">
                Geral
              </span>
            )}
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all group relative ${
                      isActive
                        ? "bg-[#336E72] text-[#FBFBFB] shadow-md shadow-[#336E72]/10"
                        : "text-neutral-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Icon className={`w-4.5 h-4.5 ${isActive ? "text-[#9BE8D6]" : "group-hover:text-[#9BE8D6] transition-colors"}`} />
                    {!isCollapsed && <span>{item.label}</span>}
                    {isCollapsed && (
                      <span className="absolute left-16 bg-[#131d1f] border border-white/10 text-white px-2 py-1 rounded-md text-[10px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg">
                        {item.label}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Forum Moderation */}
          <div className="space-y-1.5">
            {!isCollapsed && (
              <span className="text-[10px] font-extrabold text-neutral-500 uppercase tracking-widest px-3">
                Fórum
              </span>
            )}
            <nav className="space-y-1">
              {forumItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all group relative ${
                      isActive
                        ? "bg-[#336E72] text-[#FBFBFB]"
                        : "text-neutral-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Icon className={`w-4.5 h-4.5 ${isActive ? "text-[#9BE8D6]" : "group-hover:text-[#9BE8D6] transition-colors"}`} />
                    {!isCollapsed && <span>{item.label}</span>}
                    {isCollapsed && (
                      <span className="absolute left-16 bg-[#131d1f] border border-white/10 text-white px-2 py-1 rounded-md text-[10px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg">
                        {item.label}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="border-t border-white/5 p-4 space-y-3 bg-[#080d0e]">
          {!isCollapsed && (
            <div className="flex items-center gap-3 px-2 py-1">
              <div className="w-8 h-8 rounded-full bg-[#131d1f] border border-white/10 flex items-center justify-center text-neutral-400">
                {user.image ? (
                  <img src={user.image} alt={user.name || ""} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <UserIcon className="w-4 h-4" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">{user.name}</p>
                <p className="text-[10px] text-neutral-500 truncate">{user.email}</p>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Link
              href="/"
              title="Voltar ao Site"
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-neutral-300 hover:text-white transition-colors ${
                isCollapsed ? "w-full" : "flex-1"
              }`}
            >
              <ExternalLink className="w-4 h-4" />
              {!isCollapsed && <span>Ver site</span>}
            </Link>

            {!isCollapsed && (
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="px-3 bg-red-950/20 hover:bg-red-900/40 text-red-400 hover:text-red-300 border border-red-500/10 rounded-xl transition-colors cursor-pointer flex items-center justify-center"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </motion.aside>

      {/* ──────────────────────── MAIN CONTAINER ──────────────────────── */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* ──────────────────────── HEADER ──────────────────────── */}
        <header className="h-16 border-b border-white/5 bg-[#0a0f10]/85 backdrop-blur-md px-8 flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-extrabold tracking-wide uppercase text-[#FBFBFB]">JiK Ecosystem</h2>
            <div className="w-1.5 h-1.5 rounded-full bg-[#9BE8D6] animate-pulse" />
          </div>

          {/* Time and Weather Widgets */}
          <div className="flex items-center gap-6">
            {/* Local Time Widget */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-xs font-semibold text-neutral-300">
              <Clock className="w-4 h-4 text-[#9BE8D6]" />
              <span>{currentTime || "Carregando..."}</span>
            </div>

            {/* Weather / Location Widget */}
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-xs font-semibold text-neutral-300">
              <CloudSun className="w-4 h-4 text-[#9BE8D6]" />
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-white">
                  {weather.temp !== null ? `${weather.temp}°C` : "--°C"}
                </span>
                <span className="text-neutral-500">•</span>
                <span className="text-neutral-400 max-w-[130px] truncate" title={weather.city}>
                  {weather.city}
                </span>
                <span className="text-neutral-500">•</span>
                <span className="text-neutral-400 text-[10px] uppercase font-bold text-[#9BE8D6]">
                  {weather.desc}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* ──────────────────────── CONTENT BODY ──────────────────────── */}
        <main className="flex-1 overflow-y-auto bg-[#070b0c] p-8">
          <div className="max-w-6xl mx-auto space-y-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
