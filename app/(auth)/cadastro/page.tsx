"use client";

import { useState, useEffect } from "react";
import { register } from "@/app/actions/auth";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  ArrowRight,
  Check,
  X,
} from "lucide-react";

export default function CadastroPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Field states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password criteria states
  const [criteria, setCriteria] = useState({
    length: false,
    number: false,
    special: false,
    upper: false,
  });

  const [strengthScore, setStrengthScore] = useState(0);

  // Calculate password strength
  useEffect(() => {
    const checks = {
      length: password.length >= 6,
      number: /\d/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
      upper: /[A-Z]/.test(password),
    };

    setCriteria(checks);

    // Calculate score (0 to 4)
    const score = Object.values(checks).filter(Boolean).length;
    setStrengthScore(score);
  }, [password]);

  const passwordsMatch = password === confirmPassword && password.length > 0;
  const isFormValid = strengthScore === 4 && passwordsMatch && name.trim() !== "" && email.trim() !== "";

  // Get strength label & color
  const getStrengthLabel = () => {
    if (password.length === 0) return { label: "", color: "bg-neutral-800" };
    switch (strengthScore) {
      case 1:
        return { label: "Muito Fraca", color: "bg-red-500", text: "text-red-400" };
      case 2:
        return { label: "Média", color: "bg-orange-500", text: "text-orange-400" };
      case 3:
        return { label: "Boa", color: "bg-yellow-500", text: "text-yellow-400" };
      case 4:
        return { label: "Forte (Excelente)", color: "bg-[#9BE8D6]", text: "text-[#9BE8D6]" };
      default:
        return { label: "Fraca", color: "bg-red-500", text: "text-red-400" };
    }
  };

  const strength = getStrengthLabel();

  async function handleSubmit(formData: FormData) {
    if (!isFormValid) {
      setError("Por favor, preencha todos os campos e certifique-se de que a senha é forte e coincide com a confirmação.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const result = await register(formData);
      if (result?.error) {
        setError(result.error);
      }
    } catch {
      // redirect errors are expected after successful register + auto-login
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="space-y-3">
        {/* Logo Icon */}
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#336E72] to-[#9BE8D6]/60 shadow-lg border border-white/10">
          <span className="text-xl font-black text-white tracking-wider">JiK</span>
        </div>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">
            Crie sua conta no JiK
          </h1>
          <p className="text-neutral-400 text-xs mt-1">
            Faça parte da nossa comunidade e conecte-se.
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-[#131d1f]/40 border border-white/5 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-32 h-32 bg-[#336E72]/10 blur-3xl rounded-full pointer-events-none" />

        {/* Error message */}
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

        <form action={handleSubmit} className="space-y-4">
          {/* Name Field */}
          <div className="space-y-2">
            <label
              htmlFor="name"
              className="block text-[10px] font-extrabold uppercase tracking-wider text-neutral-400"
            >
              Nome
            </label>
            <div className="relative">
              <User className="absolute left-4 top-3.5 w-4 h-4 text-neutral-500" />
              <input
                id="name"
                name="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                placeholder="Seu nome completo"
                className="w-full bg-[#080d0e]/50 border border-white/5 focus:border-[#9BE8D6] text-white placeholder:text-neutral-600 text-xs pl-11 pr-4 py-3.5 rounded-xl focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-[10px] font-extrabold uppercase tracking-wider text-neutral-400"
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="seu@email.com"
                className="w-full bg-[#080d0e]/50 border border-white/5 focus:border-[#9BE8D6] text-white placeholder:text-neutral-600 text-xs pl-11 pr-4 py-3.5 rounded-xl focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block text-[10px] font-extrabold uppercase tracking-wider text-neutral-400"
            >
              Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 w-4 h-4 text-neutral-500" />
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                placeholder="Defina uma senha segura"
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

            {/* Password strength indicators */}
            {password.length > 0 && (
              <div className="space-y-2.5 pt-1.5">
                {/* Visual Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-neutral-500 font-bold uppercase">Força da Senha</span>
                    <span className={`font-extrabold ${strength.text}`}>{strength.label}</span>
                  </div>
                  <div className="h-1.5 w-full bg-neutral-900 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${strength.color} transition-all duration-300`}
                      style={{ width: `${(strengthScore / 4) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Criteria checklist */}
                <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[10px] border-t border-white/5 pt-2">
                  <CriterionItem label="6+ caracteres" satisfied={criteria.length} />
                  <CriterionItem label="Pelo menos 1 número" satisfied={criteria.number} />
                  <CriterionItem label="Caractere especial" satisfied={criteria.special} />
                  <CriterionItem label="Letra maiúscula" satisfied={criteria.upper} />
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <label
              htmlFor="confirmPassword"
              className="block text-[10px] font-extrabold uppercase tracking-wider text-neutral-400"
            >
              Confirmar Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 w-4 h-4 text-neutral-500" />
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                placeholder="Repita a senha criada"
                className={`w-full bg-[#080d0e]/50 border text-white placeholder:text-neutral-600 text-xs pl-11 pr-12 py-3.5 rounded-xl focus:outline-none transition-colors ${
                  confirmPassword.length > 0
                    ? passwordsMatch
                      ? "border-[#9BE8D6]/30 focus:border-[#9BE8D6]"
                      : "border-red-500/30 focus:border-red-500"
                    : "border-white/5 focus:border-[#9BE8D6]"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-3.5 text-neutral-500 hover:text-neutral-300 transition-colors cursor-pointer"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {confirmPassword.length > 0 && !passwordsMatch && (
              <span className="text-[9px] font-bold text-red-400 block mt-1">As senhas não coincidem.</span>
            )}
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading || !isFormValid}
            className="w-full py-3.5 bg-gradient-to-r from-[#9BE8D6] to-[#336E72] hover:opacity-95 disabled:from-neutral-800 disabled:to-neutral-900 disabled:text-neutral-500 disabled:cursor-not-allowed disabled:shadow-none text-white font-bold text-xs rounded-xl shadow-lg hover:shadow-[#9BE8D6]/10 flex items-center justify-center gap-2 transition-all cursor-pointer mt-3"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Criando conta...
              </span>
            ) : (
              <span className="flex items-center gap-1">
                Registrar
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            )}
          </button>
        </form>
      </div>

      {/* Footer login link */}
      <p className="text-center text-xs text-neutral-400 leading-normal">
        Já possui registro?{" "}
        <Link
          href="/login"
          className="text-[#9BE8D6] hover:text-[#9BE8D6]/80 hover:underline transition-colors font-bold"
        >
          Faça login
        </Link>
      </p>
    </motion.div>
  );
}

function CriterionItem({ label, satisfied }: { label: string; satisfied: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <div
        className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border transition-all ${
          satisfied
            ? "bg-[#9BE8D6]/10 border-[#9BE8D6]/20 text-[#9BE8D6]"
            : "bg-red-500/5 border-red-500/10 text-red-400"
        }`}
      >
        {satisfied ? <Check className="w-2 h-2" /> : <X className="w-2 h-2" />}
      </div>
      <span className={satisfied ? "text-neutral-300" : "text-neutral-500"}>{label}</span>
    </div>
  );
}
