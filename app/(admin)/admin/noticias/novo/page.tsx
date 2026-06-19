"use client";

import { useState } from "react";
import { createNews } from "@/app/actions/admin";
import Link from "next/link";

export default function NovaNoticiaPage() {
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setError(null);
    try {
      const result = await createNews(formData);
      if (result?.error) setError(result.error);
    } catch {
      // redirect expected
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Link
          href="/admin/noticias"
          className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors"
        >
          ← Voltar para notícias
        </Link>
        <h1 className="text-2xl font-bold mt-2">Nova Notícia</h1>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm">
          {error}
        </div>
      )}

      <form action={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="title" className="block text-sm font-medium text-neutral-300">
            Título *
          </label>
          <input
            id="title"
            name="title"
            required
            className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors"
            placeholder="Título da notícia"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="summary" className="block text-sm font-medium text-neutral-300">
            Resumo *
          </label>
          <input
            id="summary"
            name="summary"
            required
            className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors"
            placeholder="Breve descrição que aparece no card"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="content" className="block text-sm font-medium text-neutral-300">
            Conteúdo
          </label>
          <textarea
            id="content"
            name="content"
            rows={6}
            className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors resize-y"
            placeholder="Conteúdo completo da notícia (opcional)"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="imageUrl" className="block text-sm font-medium text-neutral-300">
            URL da Imagem
          </label>
          <input
            id="imageUrl"
            name="imageUrl"
            type="url"
            className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors"
            placeholder="https://..."
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            id="published"
            name="published"
            type="checkbox"
            className="w-4 h-4 rounded border-neutral-600 bg-neutral-800 text-blue-500 focus:ring-blue-500/50"
          />
          <label htmlFor="published" className="text-sm text-neutral-300">
            Publicar imediatamente
          </label>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition-colors cursor-pointer"
          >
            Criar notícia
          </button>
          <Link
            href="/admin/noticias"
            className="px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-sm transition-colors"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
