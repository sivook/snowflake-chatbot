// ============================================================
// app/page.tsx — FRONTEND (Chat stránka)
// ============================================================
//
// Toto je to čo VIDÍ používateľ. Obsahuje:
// - Chat okno so správami (bubliny)
// - Input pole na písanie
// - Tlačidlo odoslať
// - Navrhované otázky na začiatku
// - Loading animáciu (3 bodky)
//
// KĽÚČOVÝ KONCEPT: "use client"
// Next.js má dva typy komponentov:
// - Server Components (default) — renderujú sa na serveri
// - Client Components ("use client") — renderujú sa v prehliadači
// Chat potrebuje interaktivitu (useState, onClick...) = musí byť "use client"
// ============================================================

"use client";

import { useState, useRef, useEffect } from "react";

// ─────────────────────────────────────────────
// KONFIGURÁCIA — tu si zmeníš texty chatbota
// ─────────────────────────────────────────────

const CONFIG = {
  name: "Snowy",
  subtitle: "Snowflake Academy Asistent",
  welcomeMessage:
    "Ahoj! ❄️ Som Snowy, asistent Snowflake Academy v Jasnej. Rád ti poradím s lyžiarskou školou, požičovňou výstroja alebo rezerváciou. Čo ťa zaujíma?",
  placeholder: "Opýtaj sa na kurzy, ceny, výstroj...",
  suggestedQuestions: [
    "Koľko stojí lekcia lyžovania?",
    "Aký výstroj odporúčate pre začiatočníka?",
    "Kde vás nájdem v Jasnej?",
    "Požičiavate aj snowboardy?",
  ],
};

// ─────────────────────────────────────────────
// Typ pre správu — každá správa má rolu a obsah
// ─────────────────────────────────────────────

type Message = {
  role: "user" | "assistant";
  content: string;
};

// ─────────────────────────────────────────────
// HLAVNÝ KOMPONENT
// ─────────────────────────────────────────────

export default function ChatPage() {
  // STATE — React ukladá všetko v "state" premenných
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: CONFIG.welcomeMessage },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(true);

  // REF — referencia na DOM element (na auto-scroll)
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scrollni dolu pri novej správe
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus na input pri načítaní
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // ─────────────────────────────────────────
  // SEND MESSAGE — pošle správu na backend
  // ─────────────────────────────────────────

  async function sendMessage(text?: string) {
    const trimmed = (text || input).trim();
    if (!trimmed || isLoading) return;

    // Pridaj správu používateľa
    const userMessage: Message = { role: "user", content: trimmed };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);
    setError(null);
    setShowSuggestions(false);

    try {
      // KĽÚČOVÝ MOMENT: Volanie nášho BACKENDU (nie priamo Anthropic!)
      // Frontend posiela správy na /api/chat (náš route.js)
      // route.js pridá API kľúč a zavolá Claude
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // Posielame celú históriu (bez welcome message)
          // PRIPOMIENKA: API nemá pamäť — preto posielame VŠETKO
          messages: updatedMessages
            .slice(1) // vynechaj welcome message
            .map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!response.ok) throw new Error("API error");

      const data = await response.json();

      // Pridaj odpoveď do histórie
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.message },
      ]);
    } catch {
      setError(
        "Nepodarilo sa spojiť. Skús to znova alebo nás kontaktuj na +421 903 741 741."
      );
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }

  // Vymaž konverzáciu
  function clearChat() {
    setMessages([{ role: "assistant", content: CONFIG.welcomeMessage }]);
    setShowSuggestions(true);
    setError(null);
  }

  // ─────────────────────────────────────────
  // RENDER — UI chatbota
  // ─────────────────────────────────────────

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-200 font-sans">
      {/* HEADER */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-sky-500/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-400 flex items-center justify-center text-xl shadow-lg shadow-sky-500/25">
            ❄️
          </div>
          <div>
            <div className="text-base font-bold text-slate-100 tracking-tight">
              {CONFIG.name}
            </div>
            <div className="text-xs text-slate-500">
              {isLoading ? (
                <span className="text-sky-400">píše...</span>
              ) : (
                CONFIG.subtitle
              )}
            </div>
          </div>
        </div>
        <button
          onClick={clearChat}
          className="p-2 rounded-lg border border-sky-500/15 text-slate-500 hover:text-slate-300 hover:border-sky-500/30 transition-all"
          title="Nová konverzácia"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
          </svg>
        </button>
      </div>

      {/* MESSAGES AREA */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-2">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex items-end gap-2 ${
              msg.role === "user" ? "justify-end" : "justify-start"
            } animate-fadeIn`}
          >
            {msg.role === "assistant" && (
              <div className="w-7 h-7 rounded-lg bg-sky-500/10 border border-sky-500/15 flex items-center justify-center text-sm flex-shrink-0">
                ❄️
              </div>
            )}
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-gradient-to-br from-sky-600 to-sky-500 text-white rounded-br-sm"
                  : "bg-slate-800/70 text-slate-300 border border-sky-500/8 rounded-bl-sm"
              }`}
            >
              {msg.content.split("\n").map((line, j) => (
                <span key={j}>
                  {line}
                  {j < msg.content.split("\n").length - 1 && <br />}
                </span>
              ))}
            </div>
          </div>
        ))}

        {/* SUGGESTED QUESTIONS */}
        {showSuggestions && messages.length === 1 && (
          <div className="flex flex-wrap gap-2 pl-9 pt-1 animate-fadeIn">
            {CONFIG.suggestedQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => sendMessage(q)}
                className="px-3.5 py-2 rounded-full text-xs font-medium text-sky-400 bg-sky-500/8 border border-sky-500/18 hover:bg-sky-500/15 hover:border-sky-500/30 transition-all whitespace-nowrap"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* LOADING */}
        {isLoading && (
          <div className="flex items-end gap-2">
            <div className="w-7 h-7 rounded-lg bg-sky-500/10 border border-sky-500/15 flex items-center justify-center text-sm flex-shrink-0">
              ❄️
            </div>
            <div className="px-5 py-4 rounded-2xl rounded-bl-sm bg-slate-800/70 border border-sky-500/8 flex gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-bounce [animation-delay:0s]" />
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-bounce [animation-delay:0.15s]" />
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-bounce [animation-delay:0.3s]" />
            </div>
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="px-4 py-3 rounded-xl bg-red-500/8 border border-red-500/20 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* INPUT AREA */}
      <div className="px-4 py-4 border-t border-sky-500/8 bg-slate-950/60 backdrop-blur-lg">
        <div className="flex items-center gap-2 bg-slate-800/60 border border-sky-500/12 rounded-2xl px-4 py-1 focus-within:border-sky-500/30 transition-all">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder={CONFIG.placeholder}
            className="flex-1 bg-transparent border-none text-sm text-slate-200 py-3 outline-none placeholder:text-slate-500"
            disabled={isLoading}
          />
          <button
            onClick={() => sendMessage()}
            disabled={isLoading || !input.trim()}
            className={`p-2.5 rounded-xl bg-gradient-to-br from-sky-600 to-sky-500 text-white transition-all flex-shrink-0 ${
              isLoading || !input.trim()
                ? "opacity-30 cursor-not-allowed"
                : "hover:shadow-lg hover:shadow-sky-500/25"
            }`}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
        <div className="text-center text-[11px] text-slate-600 mt-2 tracking-wide">
          snowflake.academy · +421 903 741 741
        </div>
      </div>

      {/* CUSTOM ANIMATION */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.25s ease-out;
        }
      `}</style>
    </div>
  );
}