"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export default function AIDemoPage() {
  // El historial es estado porque cada nuevo mensaje debe actualizar la pantalla.
  const [messages, setMessages] = useState<
    { sender: "user" | "ai"; text: string }[]
  >([
    {
      sender: "ai",
      text: "¡Hola! Soy tu asistente de QA con IA. ¿En qué puedo ayudarte hoy a analizar o generar casos de prueba?",
    },
  ]);

  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const thinkingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Respuesta fija para enseñar el flujo; esta demo no llama a un servicio de IA.
  const simulatedAIResponse =
    "Analizando tu aplicación... 🚀 He detectado 3 escenarios clave:\n\n" +
    "1. Validación de login con credenciales inválidas (Prioridad Alta).\n" +
    "2. Timeout de sesión tras 15 minutos de inactividad (Prioridad Media).\n" +
    "3. Inyección de caracteres especiales en formulario (Prioridad Alta).\n\n" +
    "¿Quieres que añada estos 3 casos automáticamente a tu biblioteca de pruebas?";
  const responseCharacters = Array.from(simulatedAIResponse);

  // Cancelamos temporizadores pendientes si se abandona la página durante la demo.
  useEffect(
    () => () => {
      if (thinkingTimer.current) clearTimeout(thinkingTimer.current);
      if (typingTimer.current) clearInterval(typingTimer.current);
    },
    [],
  );

  const handleSend = () => {
    if (!input.trim() || isThinking) return;

    const userText = input;
    setMessages((prev) => [...prev, { sender: "user", text: userText }]);
    setInput("");
    setIsThinking(true);

    thinkingTimer.current = setTimeout(() => {
      thinkingTimer.current = null;
      setIsThinking(false);
      setMessages((prev) => [...prev, { sender: "ai", text: "" }]);

      let index = 0;
      typingTimer.current = setInterval(() => {
        if (index < responseCharacters.length) {
          const char = responseCharacters[index];
          // La función de actualización recibe el historial más reciente de React.
          setMessages((prev) => {
            const updated = [...prev];
            const lastIndex = updated.length - 1;
            const lastMsg = updated[lastIndex];
            if (lastMsg && lastMsg.sender === "ai") {
              updated[lastIndex] = { ...lastMsg, text: lastMsg.text + char };
            }
            return updated;
          });
          index++;
        } else {
          if (typingTimer.current) clearInterval(typingTimer.current);
          typingTimer.current = null;
        }
      }, 25);
    }, 1500);
  };

  return (
    <main className="min-h-screen bg-[#07111f] text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-white/[0.08] bg-[#0b192b] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-400 to-indigo-500 text-slate-950 font-bold">
            ✨
          </div>
          <div>
            <h1 className="font-semibold text-sm">
              QA Copilot AI (Simulación)
            </h1>
            <p className="text-xs text-emerald-400 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Modelo activo (Local)
            </p>
          </div>
        </div>
        <Link
          href="/test-cases"
          className="text-xs text-slate-400 hover:text-white transition-colors"
        >
          ← Volver a Casos
        </Link>
      </header>

      {/* Ámbito de Chat */}
      <div className="flex-1 max-w-4xl w-full mx-auto p-6 flex flex-col justify-between">
        {/* Lista de Mensajes */}
        <div
          className="space-y-4 overflow-y-auto mb-6 pr-2"
          data-testid="chat-messages"
        >
          {messages.map((msg, i) => (
            <div
              key={i}
              data-testid={`message-${msg.sender}`}
              className={`flex gap-3 ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.sender === "ai" && (
                <div className="h-8 w-8 rounded-lg bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-300 text-xs font-bold shrink-0">
                  AI
                </div>
              )}
              <div
                className={`max-w-xl rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.sender === "user"
                    ? "bg-sky-500 text-slate-950 font-medium"
                    : "bg-[#0b192b] border border-white/[0.08] text-slate-200 whitespace-pre-line"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {/* Indicador de "Pensando..." */}
          {isThinking && (
            <div
              data-testid="ai-thinking"
              className="flex gap-3 items-center text-slate-400 text-xs italic"
            >
              <div className="h-8 w-8 rounded-lg bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-300 text-xs font-bold shrink-0 not-italic">
                AI
              </div>
              <span className="animate-pulse">
                La IA está analizando tu petición...
              </span>
            </div>
          )}
        </div>

        {/* Input del Chat */}
        <div className="relative">
          <input
            type="text"
            data-testid="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Pídele a la IA que genere casos de prueba..."
            className="w-full rounded-2xl border border-white/[0.12] bg-[#0b192b] px-5 py-4 pr-28 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20"
          />
          <button
            onClick={handleSend}
            data-testid="send-button"
            disabled={!input.trim() || isThinking}
            className="absolute right-2 top-2 bottom-2 rounded-xl bg-sky-400 px-4 text-xs font-bold text-slate-950 hover:bg-sky-300 disabled:opacity-40 transition-all"
          >
            Enviar ✨
          </button>
        </div>
      </div>
    </main>
  );
}
