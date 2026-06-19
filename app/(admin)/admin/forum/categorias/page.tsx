"use client";

import { useState, useEffect } from "react";
import { createCategory, deleteCategory } from "@/app/actions/admin";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string | null;
  order: number;
  _count: { posts: number };
};

export default function CategoriasPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadCategories() {
    const res = await fetch("/api/admin/categories");
    const data = await res.json();
    setCategories(data);
    setLoading(false);
  }

  useEffect(() => {
    loadCategories();
  }, []);

  async function handleCreate(formData: FormData) {
    setError(null);
    const result = await createCategory(formData);
    if (result?.error) {
      setError(result.error);
    } else {
      await loadCategories();
      // Reset form
      const form = document.getElementById("category-form") as HTMLFormElement;
      form?.reset();
    }
  }

  async function handleDelete(id: string) {
    const result = await deleteCategory(id);
    if (result?.error) {
      setError(result.error);
    } else {
      await loadCategories();
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Categorias do Fórum</h1>
        <p className="text-neutral-400 text-sm mt-1">
          Gerencie as categorias onde os posts são organizados
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 text-red-500 hover:text-red-300"
          >
            ✕
          </button>
        </div>
      )}

      {/* Create Form */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
        <h2 className="text-sm font-semibold mb-4">Nova Categoria</h2>
        <form id="category-form" action={handleCreate} className="flex gap-3 flex-wrap items-end">
          <div className="space-y-1 flex-1 min-w-[150px]">
            <label className="text-xs text-neutral-500">Nome *</label>
            <input
              name="name"
              required
              className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-colors"
              placeholder="Ex: Testemunhos"
            />
          </div>
          <div className="space-y-1 flex-1 min-w-[120px]">
            <label className="text-xs text-neutral-500">Slug *</label>
            <input
              name="slug"
              required
              className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-colors"
              placeholder="testemunhos"
            />
          </div>
          <div className="space-y-1 flex-1 min-w-[150px]">
            <label className="text-xs text-neutral-500">Descrição</label>
            <input
              name="description"
              className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-colors"
              placeholder="Breve descrição"
            />
          </div>
          <div className="space-y-1 w-20">
            <label className="text-xs text-neutral-500">Cor</label>
            <input
              name="color"
              type="color"
              defaultValue="#3b82f6"
              className="w-full h-[38px] bg-neutral-800 border border-neutral-700 rounded-lg cursor-pointer"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition-colors cursor-pointer shrink-0"
          >
            Criar
          </button>
        </form>
      </div>

      {/* Categories List */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-neutral-500 text-sm">
            Carregando...
          </div>
        ) : categories.length === 0 ? (
          <div className="p-8 text-center text-neutral-500 text-sm">
            Nenhuma categoria criada.
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-800 text-left text-xs text-neutral-500 uppercase">
                <th className="px-5 py-3 font-medium">Cor</th>
                <th className="px-5 py-3 font-medium">Nome</th>
                <th className="px-5 py-3 font-medium">Slug</th>
                <th className="px-5 py-3 font-medium">Posts</th>
                <th className="px-5 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-neutral-800/30">
                  <td className="px-5 py-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: cat.color || "#6b7280" }}
                    />
                  </td>
                  <td className="px-5 py-3 text-sm font-medium">
                    {cat.name}
                  </td>
                  <td className="px-5 py-3 text-sm text-neutral-500 font-mono">
                    {cat.slug}
                  </td>
                  <td className="px-5 py-3 text-sm text-neutral-400">
                    {cat._count.posts}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="text-xs px-2.5 py-1 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded-md transition-colors cursor-pointer"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
