import { useEffect, useRef, useState } from "react";
import { Bot, Loader2, Send } from "lucide-react";
import type { DerivedData, RawSnapshot } from "../types";
import { answerQuestion } from "../services/intelligence";
import { Card, CardHeader } from "./ui/Card";
import { cn } from "../lib/cn";

const SUGGESTIONS = [
  "Why is heat risk high?",
  "Any anomalies today?",
  "What should I do?",
  "How hot will it get this week?",
];

interface Message {
  role: "user" | "ai";
  text: string;
}

interface Props {
  snapshot: RawSnapshot;
  derived: DerivedData;
  ready: boolean;
}

export function AskAI({ snapshot, derived, ready }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
    });
  };

  useEffect(scrollToBottom, [messages, busy]);

  const ask = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || busy || !ready) return;
    setMessages((m) => [...m, { role: "user", text: trimmed }]);
    setInput("");
    setBusy(true);
    window.setTimeout(() => {
      const answer = answerQuestion(trimmed, snapshot, derived);
      setMessages((m) => [...m, { role: "ai", text: answer }]);
      setBusy(false);
    }, 720);
  };

  const empty = messages.length === 0;

  return (
    <Card className="flex h-full flex-col p-6">
      <CardHeader
        eyebrow="Ask the AI"
        title="Ask ThermoSense anything"
        description="A lightweight language model answers from live data and historical baselines."
        icon={<Bot className="h-5 w-5" aria-hidden="true" />}
      />

      <div
        ref={listRef}
        className="no-scrollbar mt-5 flex-1 space-y-3 overflow-y-auto pr-1"
        style={{ maxHeight: "24rem" }}
        aria-live="polite"
      >
        {empty && !busy ? (
          <div className="flex flex-col items-start gap-3 pt-1">
            <AiBubble text={`Hi! I'm reading ${snapshot.location.name} right now. Ask me about the heat, anomalies, forecasts or what to do.`} />
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => ask(s)}
                  className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {messages.map((m, i) =>
          m.role === "user" ? (
            <div key={i} className="flex justify-end">
              <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground">
                {m.text}
              </div>
            </div>
          ) : (
            <div key={i} className="flex justify-start">
              <AiBubble text={m.text} />
            </div>
          ),
        )}

        {busy ? (
          <div className="flex justify-start">
            <div className="inline-flex items-center gap-2 rounded-2xl rounded-bl-sm border border-border bg-background px-4 py-2.5 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin text-primary" aria-hidden="true" />
              Thinking…
            </div>
          </div>
        ) : null}
      </div>

      <form
        className="mt-5 flex items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          ask(input);
        }}
      >
        <label htmlFor="ask-input" className="sr-only">
          Ask about the temperature data
        </label>
        <input
          id="ask-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={ready ? "Ask about the heat, anomalies, forecasts…" : "Loading live data…"}
          disabled={!ready || busy}
          className="h-11 flex-1 rounded-full border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={!ready || busy || !input.trim()}
          aria-label="Send question"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-all duration-150 ease-out hover:bg-primary/90 active:scale-[0.95] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Send className="h-4 w-4" aria-hidden="true" />
        </button>
      </form>
    </Card>
  );
}

function AiBubble({ text }: { text: string }) {
  return (
    <div className="flex max-w-[85%] items-start gap-2">
      <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Bot className="h-3.5 w-3.5" aria-hidden="true" />
      </span>
      <div className={cn("rounded-2xl rounded-bl-sm border border-border bg-background px-4 py-2.5 text-sm text-foreground")}>
        {text}
      </div>
    </div>
  );
}
