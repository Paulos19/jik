"use client";

import { useState } from "react";
import { Plus, Trash, Settings } from "lucide-react";
import { motion } from "framer-motion";

interface Category {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
}

export default function NunuClient({ initialCategories }: { initialCategories: Category[] }) {
  const [categories, setCategories] = useState(initialCategories);
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    try {
      const res = await fetch("/api/admin/nunu/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, description: newDesc })
      });
      if (res.ok) {
        const cat = await res.json();
        setCategories([cat, ...categories]);
        setNewName("");
        setNewDesc("");
        setIsCreating(false);
      } else {
        alert("Erro ao criar categoria");
      }
    } catch (err) {
      alert("Erro na requisição");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-[#131d1f] p-6 rounded-2xl border border-white/5">
        <div>
          <h1 className="text-xl font-bold text-white mb-1">Nunu App - Marketplace</h1>
          <p className="text-sm text-neutral-400">Gerencie as categorias de serviços para o app mobile.</p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 text-[#9BE8D6] rounded-xl hover:bg-emerald-500/30 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm font-bold">Nova Categoria</span>
        </button>
      </div>

      {isCreating && (
        <form onSubmit={handleCreate} className="bg-neutral-900/50 border border-white/10 p-4 rounded-xl space-y-4">
          <div>
            <label className="text-xs text-neutral-400 font-bold uppercase block mb-1">Nome da Categoria</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full bg-neutral-950 border border-white/5 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#9BE8D6]"
              required
            />
          </div>
          <div>
            <label className="text-xs text-neutral-400 font-bold uppercase block mb-1">Descrição</label>
            <textarea
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="w-full bg-neutral-950 border border-white/5 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#9BE8D6]"
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 bg-[#9BE8D6] text-black font-bold rounded-lg text-sm">Salvar</button>
            <button type="button" onClick={() => setIsCreating(false)} className="px-4 py-2 text-neutral-400 hover:text-white font-bold rounded-lg text-sm">Cancelar</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(cat => (
          <div key={cat.id} className="bg-[#131d1f] border border-white/5 p-4 rounded-xl flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-white text-md">{cat.name}</h3>
              <p className="text-xs text-neutral-500 mt-1 line-clamp-2">{cat.description || "Sem descrição"}</p>
            </div>
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/5">
              <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${cat.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                {cat.isActive ? 'Ativo' : 'Inativo'}
              </span>
              <button className="text-neutral-500 hover:text-white">
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {categories.length === 0 && !isCreating && (
          <div className="col-span-full py-8 text-center text-neutral-500 border border-dashed border-white/10 rounded-xl">
            Nenhuma categoria encontrada.
          </div>
        )}
      </div>
    </div>
  );
}
