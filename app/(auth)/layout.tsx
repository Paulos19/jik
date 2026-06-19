import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-12 bg-[#060b0c] text-white w-full max-w-full overflow-x-hidden">
      {/* Video Banner Section (Left) */}
      <div className="hidden md:block md:col-span-7 xl:col-span-8 relative h-screen sticky top-0 overflow-hidden w-full">
        {/* Dynamic Video Background */}
        <video
          src="https://0nxicue7ew.ufs.sh/f/BGEz3YvO4INz1Nm0tyraZP4pYltWg12wLSuqKd7iy9I8DV3M"
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover filter brightness-[0.70] absolute inset-0"
        />

        {/* Premium Overlay Gradients */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#080d0e] opacity-95 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

        {/* Branding Content */}
        <div className="absolute bottom-16 left-16 right-16 space-y-4 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-[#9BE8D6] animate-ping" />
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#9BE8D6]">Hub JiK</span>
          </div>

          <h2 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight max-w-xl">
            Conecte-se e Compartilhe. <br />
            Sua Comunidade Digital.
          </h2>

          <p className="text-neutral-300 text-sm max-w-md leading-relaxed">
            Acesse notícias locais, participe de fóruns exclusivos, colabore com ideias e explore as ferramentas e aplicativos integrados em nosso hub.
          </p>
        </div>
      </div>

      {/* Form Section (Right) */}
      <div className="col-span-12 md:col-span-5 xl:col-span-4 flex items-center justify-center p-6 sm:p-10 md:p-12 bg-[#080d0e]/95 relative overflow-y-auto min-h-screen md:min-h-0 border-l border-white/5 w-full">
        {/* Subtle glow background */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-[#9BE8D6]/5 blur-[80px] rounded-full pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-60 h-60 bg-[#336E72]/10 blur-[80px] rounded-full pointer-events-none" />

        {/* Form Container (Widened to max-w-md) */}
        <div className="w-full max-w-md z-10 py-8">
          {children}
        </div>
      </div>
    </div>
  );
}
