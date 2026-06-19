"use client";

import { useState } from "react";
import { loginAction } from "@/app/actions/auth";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, AlertTriangle, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setLoading(true);

    try {
      const result = await loginAction(formData);
      if (result?.error) {
        setError(result.error);
      }
    } catch {
      // redirect errors are expected after successful login
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      {/* Brand Header */}
      <div className="space-y-3">
        {/* Logo Icon */}
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#336E72] to-[#9BE8D6]/60 shadow-lg border border-white/10">
          <span className="text-xl font-black text-white tracking-wider">JiK</span>
        </div>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">
            Seja bem-vindo de volta!
          </h1>
          <p className="text-neutral-400 text-xs mt-1">
            Insira suas credenciais para acessar a plataforma.
          </p>
        </div>
      </div>

      {/* Glass Card */}
      <div className="bg-[#131d1f]/40 border border-white/5 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-32 h-32 bg-[#9BE8D6]/5 blur-3xl rounded-full pointer-events-none" />

        {/* Error notification */}
        {error && (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-red-500/10 border border-red-500/20 text-red-300 text-xs px-4 py-3 rounded-xl font-semibold flex items-center gap-2"
          >
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {error}
          </motion.div>
        )}

        {/* Login Form */}
        <form action={handleSubmit} className="space-y-5">
          {/* Email input */}
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-xs font-bold uppercase tracking-wider text-neutral-400"
            >
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 w-4 h-4 text-neutral-500" />
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="nome@email.com"
                className="w-full bg-[#080d0e]/50 border border-white/5 focus:border-[#9BE8D6] text-white placeholder:text-neutral-600 text-xs pl-11 pr-4 py-3.5 rounded-xl focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Password input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-xs font-bold uppercase tracking-wider text-neutral-400"
              >
                Senha
              </label>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 w-4 h-4 text-neutral-500" />
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full bg-[#080d0e]/50 border border-white/5 focus:border-[#9BE8D6] text-white placeholder:text-neutral-600 text-xs pl-11 pr-12 py-3.5 rounded-xl focus:outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3.5 text-neutral-500 hover:text-neutral-300 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-[#9BE8D6] to-[#336E72] hover:opacity-95 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg hover:shadow-[#9BE8D6]/10 flex items-center justify-center gap-2 transition-all cursor-pointer mt-2"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Autenticando...
              </span>
            ) : (
              <span className="flex items-center gap-1">
                Entrar
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            )}
          </button>
        </form>
      </div>

      {/* Account creation link */}
      <p className="text-center text-xs text-neutral-400 leading-normal">
        Novo por aqui?{" "}
        <Link
          href="/cadastro"
          className="text-[#9BE8D6] hover:text-[#9BE8D6]/80 hover:underline transition-colors font-bold"
        >
          Crie sua conta agora
        </Link>
      </p>
    </motion.div>
  );
}
