"use client";

import { useState, useRef, useEffect } from "react";

// Snowy avatar — snehová vločka s očami a úsmevom
function SnowyAvatar({ size = "sm" }: { size?: "sm" | "lg" }) {
  const s = size === "lg" ? 44 : 32;
  const scale = size === "lg" ? 1 : 0.72;
  return (
    <div
      className={`${size === "lg" ? "w-11 h-11" : "w-8 h-8"} rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-pink-500/20`}
    >
      <svg width={s * 0.65} height={s * 0.65} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Snowflake body / rays */}
        {/* Main vertical line */}
        <line x1="50" y1="8" x2="50" y2="92" stroke="white" strokeWidth="5" strokeLinecap="round" />
        {/* Diagonal lines */}
        <line x1="14" y1="29" x2="86" y2="71" stroke="white" strokeWidth="5" strokeLinecap="round" />
        <line x1="86" y1="29" x2="14" y2="71" stroke="white" strokeWidth="5" strokeLinecap="round" />
        {/* Small branches top */}
        <line x1="50" y1="22" x2="38" y2="16" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="50" y1="22" x2="62" y2="16" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
        {/* Small branches bottom */}
        <line x1="50" y1="78" x2="38" y2="84" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="50" y1="78" x2="62" y2="84" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
        {/* Small branches left-top */}
        <line x1="26" y1="36" x2="18" y2="26" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="26" y1="36" x2="20" y2="44" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
        {/* Small branches right-top */}
        <line x1="74" y1="36" x2="82" y2="26" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="74" y1="36" x2="80" y2="44" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
        {/* Small branches left-bottom */}
        <line x1="26" y1="64" x2="20" y2="56" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="26" y1="64" x2="18" y2="74" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
        {/* Small branches right-bottom */}
        <line x1="74" y1="64" x2="80" y2="56" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="74" y1="64" x2="82" y2="74" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
        {/* Face circle (center) */}
        <circle cx="50" cy="50" r="18" fill="white" />
        {/* Eyes */}
        <circle cx="43" cy="47" r="3" fill="#ec4899" />
        <circle cx="57" cy="47" r="3" fill="#ec4899" />
        {/* Eye sparkle */}
        <circle cx="44" cy="46" r="1" fill="white" />
        <circle cx="58" cy="46" r="1" fill="white" />
        {/* Smile */}
        <path d="M43 55 Q50 61 57 55" stroke="#ec4899" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      </svg>
    </div>
  );
}

const CONFIG = {
  name: "Snowy",
  subtitle: "Snowflake Academy Asistent",
  welcomeMessage:
    "Ahoj! ❄️ Som Snowy, asistent Snowflake Academy v Jasnej. Rád ti poradím s lyžiarskou školou, požičovňou výstroja alebo rezerváciou. Čo ťa zaujíma?",
  placeholder: "Opýtaj sa na kurzy, ceny, výstroj...",
  suggestedQuestions: [
    "Koľko stojí lekcia?",
    "Výstroj pre začiatočníka?",
    "Kde vás nájdem?",
    "Požičiavate snowboardy?",
  ],
};

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: CONFIG.welcomeMessage },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function sendMessage(text?: string) {
    const trimmed = (text || input).trim();
    if (!trimmed || isLoading) return;

    const userMessage: Message = { role: "user", content: trimmed };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);
    setError(null);
    setShowSuggestions(false);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages
            .slice(1)
            .map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!response.ok) throw new Error("API error");
      const data = await response.json();

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

  function clearChat() {
    setMessages([{ role: "assistant", content: CONFIG.welcomeMessage }]);
    setShowSuggestions(true);
    setError(null);
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans">

      {/* HEADER */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <SnowyAvatar size="lg" />
          <div>
            <div className="text-[15px] font-extrabold text-gray-900 tracking-tight uppercase">
              {CONFIG.name}
            </div>
            <div className="text-xs text-gray-400 font-medium">
              {isLoading ? (
                <span className="text-pink-500">píše odpoveď...</span>
              ) : (
                CONFIG.subtitle
              )}
            </div>
          </div>
        </div>
        <button
          onClick={clearChat}
          className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
          title="Nová konverzácia"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
          </svg>
        </button>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex items-end gap-2.5 ${
              msg.role === "user" ? "justify-end" : "justify-start"
            } animate-fadeIn`}
          >
            {msg.role === "assistant" && <SnowyAvatar size="sm" />}
            <div
              className={`max-w-[80%] px-4 py-3 text-[14px] leading-relaxed ${
                msg.role === "user"
                  ? "bg-gradient-to-br from-pink-500 to-rose-500 text-white rounded-2xl rounded-br-md shadow-md shadow-pink-500/15"
                  : "bg-white text-gray-700 rounded-2xl rounded-bl-md shadow-sm border border-gray-100"
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

        {/* SUGGESTIONS */}
        {showSuggestions && messages.length === 1 && (
          <div className="flex flex-wrap gap-2 pl-11 pt-1 animate-fadeIn">
            {CONFIG.suggestedQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => sendMessage(q)}
                className="px-3.5 py-2 rounded-full text-xs font-semibold text-pink-500 bg-pink-50 border border-pink-100 hover:bg-pink-100 hover:border-pink-200 transition-all"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* LOADING */}
        {isLoading && (
          <div className="flex items-end gap-2.5">
            <SnowyAvatar size="sm" />
            <div className="px-5 py-4 rounded-2xl rounded-bl-md bg-white border border-gray-100 shadow-sm flex gap-1.5">
              <span className="w-2 h-2 rounded-full bg-pink-400 animate-bounce [animation-delay:0s]" />
              <span className="w-2 h-2 rounded-full bg-pink-400 animate-bounce [animation-delay:0.15s]" />
              <span className="w-2 h-2 rounded-full bg-pink-400 animate-bounce [animation-delay:0.3s]" />
            </div>
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-500 text-sm text-center">
            {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* INPUT */}
      <div className="px-4 py-4 bg-white border-t border-gray-200">
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-1 focus-within:border-pink-300 focus-within:ring-2 focus-within:ring-pink-100 transition-all">
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
            className="flex-1 bg-transparent border-none text-sm text-gray-800 py-3 outline-none placeholder:text-gray-400"
            disabled={isLoading}
          />
          <button
            onClick={() => sendMessage()}
            disabled={isLoading || !input.trim()}
            className={`p-2.5 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 text-white transition-all flex-shrink-0 ${
              isLoading || !input.trim()
                ? "opacity-30 cursor-not-allowed"
                : "hover:shadow-lg hover:shadow-pink-500/25 active:scale-95"
            }`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
        <div className="flex items-center justify-center gap-2 mt-2.5">
          <span className="text-[11px] text-gray-300 font-medium tracking-wide">
            snowflake.academy · +421 903 741 741
          </span>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.25s ease-out;
        }
      `}</style>
    </div>
  );
}