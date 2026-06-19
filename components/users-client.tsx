"use client";

import React, { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  UserCheck,
  UserX,
  KeyRound,
  ShieldAlert,
  UserCog,
  Check,
  X,
  AlertTriangle,
  Users as UsersIcon,
  Shield,
  Clock,
  Key,
} from "lucide-react";
import { toggleUserActive, changeUserPassword, changeUserRole } from "@/app/actions/admin";

type UserItem = {
  id: string;
  name: string | null;
  email: string;
  role: "ADMIN" | "USER";
  isActive: boolean;
  createdAt: Date;
};

interface UsersClientProps {
  initialUsers: UserItem[];
}

export default function UsersClient({ initialUsers }: UsersClientProps) {
  const [users, setUsers] = useState<UserItem[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Modal states
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [modalType, setModalType] = useState<"PASSWORD" | "ACTIVE" | "ROLE" | null>(null);

  // Password state
  const [newPassword, setNewPassword] = useState("");

  // Role state
  const [newRole, setNewRole] = useState<"ADMIN" | "USER">("USER");

  // Statistics
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.isActive).length;
  const inactiveUsers = totalUsers - activeUsers;
  const adminUsers = users.filter((u) => u.role === "ADMIN").length;

  const filteredUsers = users.filter((u) => {
    const matchSearch =
      (u.name || "").toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());

    const matchRole = filterRole === "ALL" || u.role === filterRole;
    const matchStatus =
      filterStatus === "ALL" ||
      (filterStatus === "ACTIVE" && u.isActive) ||
      (filterStatus === "INACTIVE" && !u.isActive);

    return matchSearch && matchRole && matchStatus;
  });

  const handleToggleActive = (user: UserItem) => {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const res = await toggleUserActive(user.id);
      if (res?.error) {
        setError(res.error);
      } else {
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, isActive: !u.isActive } : u))
        );
        setSuccess(
          `Conta de ${user.name || user.email} ${
            user.isActive ? "desativada" : "reativada"
          } com sucesso.`
        );
        setModalType(null);
        setSelectedUser(null);
      }
    });
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const res = await changeUserPassword(selectedUser.id, newPassword);
      if (res?.error) {
        setError(res.error);
      } else {
        setSuccess(`Senha do usuário ${selectedUser.name || selectedUser.email} alterada.`);
        setNewPassword("");
        setModalType(null);
        setSelectedUser(null);
      }
    });
  };

  const handleChangeRoleSubmit = () => {
    if (!selectedUser) return;
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const res = await changeUserRole(selectedUser.id, newRole);
      if (res?.error) {
        setError(res.error);
      } else {
        setUsers((prev) =>
          prev.map((u) => (u.id === selectedUser.id ? { ...u, role: newRole } : u))
        );
        setSuccess(
          `Função de ${selectedUser.name || selectedUser.email} alterada para ${newRole}.`
        );
        setModalType(null);
        setSelectedUser(null);
      }
    });
  };

  const getUserInitials = (name: string | null, email: string) => {
    if (name) {
      const parts = name.split(" ");
      if (parts.length > 1) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return name.slice(0, 2).toUpperCase();
    }
    return email.slice(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-8 text-left">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
            <div className="p-2 bg-[#336E72]/15 border border-[#336E72]/20 text-[#9BE8D6] rounded-xl">
              <UserCog className="w-5 h-5" />
            </div>
            Gerenciamento de Usuários
          </h1>
          <p className="text-neutral-400 text-xs mt-1.5 leading-relaxed">
            Monitore cadastros, suspenda ou reative contas e altere níveis de permissão em todo o ecossistema JiK.
          </p>
        </div>
      </div>

      {/* Notifications */}
      <AnimatePresence mode="popLayout">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-500/10 border border-red-500/20 text-red-300 text-xs px-4 py-3 rounded-xl font-semibold flex items-center gap-2"
          >
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {error}
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-[#9BE8D6]/10 border border-[#9BE8D6]/20 text-[#9BE8D6] text-xs px-4 py-3 rounded-xl font-semibold flex items-center gap-2"
          >
            <Check className="w-4 h-4 shrink-0" />
            {success}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatWidget label="Total de Usuários" value={totalUsers} icon={UsersIcon} color="from-blue-500/10 to-[#9BE8D6]/5" />
        <StatWidget label="Usuários Ativos" value={activeUsers} icon={UserCheck} color="from-[#9BE8D6]/15 to-[#336E72]/5" />
        <StatWidget label="Contas Suspensas" value={inactiveUsers} icon={UserX} color="from-red-500/10 to-rose-500/5" />
        <StatWidget label="Administradores" value={adminUsers} icon={Shield} color="from-amber-500/10 to-yellow-500/5" />
      </div>

      {/* Filters Bar */}
      <div className="bg-[#131d1f]/20 border border-white/5 p-4 rounded-2xl grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Search */}
        <div className="md:col-span-2 relative">
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-500" />
          <input
            type="text"
            placeholder="Buscar por nome ou e-mail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#131d1f]/50 border border-white/5 focus:border-[#9BE8D6] text-white text-xs px-10 py-3.5 rounded-xl focus:outline-none transition-colors"
          />
        </div>

        {/* Filter Role */}
        <div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="w-full bg-[#131d1f]/50 border border-white/5 focus:border-[#9BE8D6] text-white text-xs px-4 py-3.5 rounded-xl focus:outline-none transition-colors"
          >
            <option value="ALL">Todas as funções</option>
            <option value="ADMIN">Administradores</option>
            <option value="USER">Usuários Comuns</option>
          </select>
        </div>

        {/* Filter Status */}
        <div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full bg-[#131d1f]/50 border border-white/5 focus:border-[#9BE8D6] text-white text-xs px-4 py-3.5 rounded-xl focus:outline-none transition-colors"
          >
            <option value="ALL">Todos os status</option>
            <option value="ACTIVE">Contas Ativas</option>
            <option value="INACTIVE">Contas Desativadas</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-[#131d1f]/30 border border-white/5 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-[#131d1f]/50 text-neutral-400 text-[10px] font-extrabold uppercase tracking-wider">
                <th className="px-6 py-4.5">Nome / E-mail</th>
                <th className="px-6 py-4.5">Função</th>
                <th className="px-6 py-4.5">Status</th>
                <th className="px-6 py-4.5">Data de Cadastro</th>
                <th className="px-6 py-4.5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-neutral-500 font-medium">
                    Nenhum usuário correspondente aos filtros.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className={`hover:bg-white/[0.015] transition-colors ${
                      !user.isActive ? "bg-red-500/[0.01]" : ""
                    }`}
                  >
                    {/* User Profile & Details */}
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#336E72] to-[#9BE8D6]/40 flex items-center justify-center font-bold text-white text-xs shadow-inner">
                        {getUserInitials(user.name, user.email)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-white truncate max-w-[200px]">
                          {user.name || "Sem Nome"}
                        </div>
                        <div className="text-[10px] text-neutral-500 mt-0.5 truncate max-w-[200px]">
                          {user.email}
                        </div>
                      </div>
                    </td>

                    {/* Role badge */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-extrabold tracking-wide uppercase ${
                          user.role === "ADMIN"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : "bg-neutral-800 text-neutral-400"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>

                    {/* Status badge */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                          user.isActive
                            ? "bg-[#9BE8D6]/10 text-[#9BE8D6]"
                            : "bg-red-500/10 text-red-400"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            user.isActive ? "bg-[#9BE8D6]" : "bg-red-400"
                          }`}
                        />
                        {user.isActive ? "Ativo" : "Desativado"}
                      </span>
                    </td>

                    {/* Created Date */}
                    <td className="px-6 py-4 text-neutral-400">
                      {new Date(user.createdAt).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </td>

                    {/* Action buttons */}
                    <td className="px-6 py-4 text-right space-x-1.5">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setNewRole(user.role);
                          setModalType("ROLE");
                        }}
                        title="Alterar Nível de Acesso"
                        className="p-2 bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white rounded-xl transition-colors cursor-pointer inline-flex"
                      >
                        <ShieldAlert className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setModalType("PASSWORD");
                        }}
                        title="Definir Nova Senha"
                        className="p-2 bg-[#9BE8D6]/5 hover:bg-[#9BE8D6]/10 text-[#9BE8D6] rounded-xl transition-colors cursor-pointer inline-flex border border-[#9BE8D6]/5"
                      >
                        <KeyRound className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setModalType("ACTIVE");
                        }}
                        title={user.isActive ? "Suspender Acesso" : "Reativar Acesso"}
                        className={`p-2 rounded-xl transition-colors cursor-pointer inline-flex border ${
                          user.isActive
                            ? "bg-red-950/20 hover:bg-red-900/40 text-red-400 border-red-500/10"
                            : "bg-green-950/20 hover:bg-green-900/40 text-green-400 border-green-500/10"
                        }`}
                      >
                        {user.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals Dialogs */}
      <AnimatePresence>
        {selectedUser && modalType && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setModalType(null);
                setSelectedUser(null);
              }}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-[#0d1314] border border-white/10 rounded-3xl p-6 max-w-sm w-full z-10 shadow-2xl space-y-6"
            >
              {/* Modal: Password change */}
              {modalType === "PASSWORD" && (
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div className="flex items-center gap-2.5 text-[#9BE8D6]">
                    <Key className="w-5 h-5" />
                    <h3 className="text-sm font-extrabold uppercase tracking-wide text-white">Nova Senha</h3>
                  </div>
                  <p className="text-[11px] text-neutral-400 leading-normal">
                    Defina uma nova credencial de acesso para o usuário{" "}
                    <span className="text-white font-bold">{selectedUser.name || selectedUser.email}</span>.
                  </p>

                  <div className="space-y-2">
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Mínimo de 6 caracteres..."
                      className="w-full bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-[#9BE8D6] focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setModalType(null);
                        setSelectedUser(null);
                      }}
                      className="flex-1 py-2.5 border border-white/10 text-neutral-400 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isPending}
                      className="flex-1 py-2.5 bg-gradient-to-r from-[#9BE8D6] to-[#336E72] hover:opacity-90 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {isPending ? "Salvando..." : "Confirmar"}
                    </button>
                  </div>
                </form>
              )}

              {/* Modal: Role update */}
              {modalType === "ROLE" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2.5 text-amber-400">
                    <Shield className="w-5 h-5" />
                    <h3 className="text-sm font-extrabold uppercase tracking-wide text-white">Nível de Acesso</h3>
                  </div>
                  <p className="text-[11px] text-neutral-400 leading-normal">
                    Selecione a permissão desejada para{" "}
                    <span className="text-white font-bold">{selectedUser.name || selectedUser.email}</span>.
                  </p>

                  <div className="space-y-2">
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value as "ADMIN" | "USER")}
                      className="w-full bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-[#9BE8D6] focus:outline-none transition-colors"
                    >
                      <option value="USER">USER (Membro comum do fórum/hub)</option>
                      <option value="ADMIN">ADMIN (Controle total do sistema)</option>
                    </select>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setModalType(null);
                        setSelectedUser(null);
                      }}
                      className="flex-1 py-2.5 border border-white/10 text-neutral-400 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleChangeRoleSubmit}
                      disabled={isPending}
                      className="flex-1 py-2.5 bg-gradient-to-r from-[#9BE8D6] to-[#336E72] hover:opacity-90 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {isPending ? "Salvando..." : "Confirmar"}
                    </button>
                  </div>
                </div>
              )}

              {/* Modal: Toggle user active */}
              {modalType === "ACTIVE" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2.5 text-red-400">
                    <AlertTriangle className="w-5 h-5" />
                    <h3 className="text-sm font-extrabold uppercase tracking-wide text-white">
                      {selectedUser.isActive ? "Suspender Conta?" : "Reativar Conta?"}
                    </h3>
                  </div>

                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    Você está prestes a {selectedUser.isActive ? "suspender" : "reativar"} a conta do usuário{" "}
                    <span className="text-white font-bold">{selectedUser.name || selectedUser.email}</span>.
                    {selectedUser.isActive && (
                      <span className="block mt-2 text-red-300 font-bold">
                        Atenção: O usuário será desconectado e impedido de logar imediatamente.
                      </span>
                    )}
                  </p>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setModalType(null);
                        setSelectedUser(null);
                      }}
                      className="flex-1 py-2.5 border border-white/10 text-neutral-400 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => handleToggleActive(selectedUser)}
                      disabled={isPending}
                      className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {isPending ? "Processando..." : "Confirmar"}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatWidget({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: any;
  color: string;
}) {
  return (
    <div className={`relative overflow-hidden bg-[#131d1f]/40 border border-white/5 rounded-2xl p-4.5 space-y-3 shadow-md`}>
      <div className={`absolute -right-4 -top-4 w-16 h-16 bg-gradient-to-tr ${color} blur-lg rounded-full`} />
      <div className="flex items-center justify-between">
        <span className="text-[9px] text-neutral-500 font-extrabold uppercase tracking-wider">{label}</span>
        <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-neutral-400">
          <Icon className="w-3.5 h-3.5" />
        </div>
      </div>
      <div>
        <p className="text-2xl font-extrabold text-white tracking-tight">{value}</p>
      </div>
    </div>
  );
}
