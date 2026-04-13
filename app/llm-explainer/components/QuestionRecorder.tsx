"use client";

import { useState, useEffect, useCallback, useRef } from "react";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface WindowWithSpeech extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

interface Question {
  id: string;
  text: string;
  concept: string;
  timestamp: number;
}

const STORAGE_KEY = "llm-explainer-questions";

function loadQuestions(): Question[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveQuestions(questions: Question[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(questions));
}

export function QuestionRecorder({ conceptLabel }: { conceptLabel: string }) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [textInput, setTextInput] = useState("");
  const [speechSupported, setSpeechSupported] = useState(false);
  const [shareSupported, setShareSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    setQuestions(loadQuestions());
    const w = window as WindowWithSpeech;
    setSpeechSupported(!!(w.SpeechRecognition || w.webkitSpeechRecognition));
    setShareSupported(typeof navigator !== "undefined" && typeof navigator.share === "function");
  }, []);

  const startListening = useCallback(() => {
    const w = window as WindowWithSpeech;
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) return;

    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      const result = Array.from(event.results)
        .map((r: any) => r[0].transcript)
        .join("");
      setTranscript(result);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
    setTranscript("");
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const addQuestion = useCallback(
    (text: string) => {
      if (!text.trim()) return;
      const q: Question = {
        id: Date.now().toString(),
        text: text.trim(),
        concept: conceptLabel,
        timestamp: Date.now(),
      };
      const updated = [q, ...questions];
      setQuestions(updated);
      saveQuestions(updated);
      setTranscript("");
      setTextInput("");
    },
    [questions, conceptLabel]
  );

  const removeQuestion = useCallback(
    (id: string) => {
      const updated = questions.filter((q) => q.id !== id);
      setQuestions(updated);
      saveQuestions(updated);
    },
    [questions]
  );

  const formatForExport = useCallback(() => {
    const grouped: Record<string, Question[]> = {};
    for (const q of questions) {
      if (!grouped[q.concept]) grouped[q.concept] = [];
      grouped[q.concept].push(q);
    }

    let md = `# My LLM Learning Questions\n\n`;
    md += `I'm learning how large language models work using an interactive guide\n`;
    md += `based on Stanford's CME 295 course (schlacter.me/llm-explainer).\n`;
    md += `Below are questions that came up during my learning session.\n`;
    md += `Please answer each one in plain language with concrete examples — I'm not an engineer.\n\n`;

    let num = 1;
    for (const [concept, qs] of Object.entries(grouped)) {
      md += `## ${concept}\n\n`;
      for (const q of qs) {
        md += `${num}. ${q.text}\n`;
        num++;
      }
      md += `\n`;
    }

    return md;
  }, [questions]);

  const exportAsFile = useCallback(() => {
    const md = formatForExport();
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `llm-questions-${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [formatForExport]);

  const [copied, setCopied] = useState(false);
  const copyToClipboard = useCallback(() => {
    const md = formatForExport();
    navigator.clipboard.writeText(md).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [formatForExport]);

  const shareQuestions = useCallback(async () => {
    const md = formatForExport();
    try {
      await navigator.share({
        title: "My LLM Learning Questions",
        text: md,
      });
    } catch {
      // User cancelled or share failed — silently ignore
    }
  }, [formatForExport]);

  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const clearAll = useCallback(() => {
    setQuestions([]);
    saveQuestions([]);
    setShowClearConfirm(false);
  }, []);

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gray-900 text-white shadow-lg hover:bg-gray-800 active:scale-95 transition-all flex items-center justify-center"
        aria-label="Ask a question"
      >
        {isOpen ? (
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
            <circle cx="12" cy="17" r="0.5" fill="currentColor" />
          </svg>
        )}
        {questions.length > 0 && !isOpen && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-medium">
            {questions.length}
          </span>
        )}
      </button>

      {/* Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 md:right-6 z-50 w-[calc(100vw-2rem)] max-w-sm bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-900">
              Questions &amp; Notes
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Capture what you don&rsquo;t understand as you go.
            </p>
          </div>

          {/* Input area */}
          <div className="p-4 border-b border-gray-100">
            {/* Voice input */}
            {speechSupported && (
              <div className="flex items-center gap-3 mb-3">
                <button
                  onClick={isListening ? stopListening : startListening}
                  className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    isListening
                      ? "bg-red-500 text-white animate-pulse"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                  aria-label={isListening ? "Stop recording" : "Start recording"}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                  </svg>
                </button>
                <span className="text-xs text-gray-400">
                  {isListening
                    ? "Listening... tap to stop"
                    : "Tap mic to ask by voice"}
                </span>
              </div>
            )}

            {/* Transcript preview */}
            {transcript && (
              <div className="mb-3 p-3 bg-blue-50 rounded-lg text-sm text-gray-800">
                &ldquo;{transcript}&rdquo;
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => addQuestion(transcript)}
                    className="text-xs px-3 py-1 rounded-full bg-gray-900 text-white hover:bg-gray-800"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setTranscript("")}
                    className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                  >
                    Discard
                  </button>
                </div>
              </div>
            )}

            {/* Text fallback */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                addQuestion(textInput);
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Or type your question..."
                className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300"
              />
              <button
                type="submit"
                disabled={!textInput.trim()}
                className="px-3 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                Add
              </button>
            </form>
          </div>

          {/* Questions list */}
          <div className="max-h-48 overflow-y-auto">
            {questions.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8 px-4">
                No questions yet. Ask anything that comes to mind as you explore!
              </p>
            ) : (
              <ul className="divide-y divide-gray-50">
                {questions.map((q) => (
                  <li key={q.id} className="px-4 py-3 flex items-start gap-3 group">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800">{q.text}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {q.concept} &middot;{" "}
                        {new Date(q.timestamp).toLocaleTimeString([], {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <button
                      onClick={() => removeQuestion(q.id)}
                      className="flex-shrink-0 text-gray-300 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                      aria-label="Remove question"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Action buttons */}
          {questions.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 space-y-2">
              {shareSupported && (
                <button
                  onClick={shareQuestions}
                  className="w-full px-3 py-2 rounded-lg bg-gray-900 text-white text-xs font-medium hover:bg-gray-800 transition-all flex items-center justify-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                  </svg>
                  Share to ChatGPT, Notes, Messages…
                </button>
              )}
              <div className="flex gap-2">
                <button
                  onClick={exportAsFile}
                  className="flex-1 px-3 py-2 rounded-lg bg-gray-100 text-gray-700 text-xs font-medium hover:bg-gray-200 transition-all flex items-center justify-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  {shareSupported ? "Download .md" : "Export for ChatGPT"}
                </button>
                <button
                  onClick={copyToClipboard}
                  className="px-3 py-2 rounded-lg bg-gray-100 text-gray-700 text-xs font-medium hover:bg-gray-200 transition-all"
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
              {!showClearConfirm ? (
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="w-full text-xs text-gray-400 hover:text-red-400 transition-colors py-1"
                >
                  Clear all questions
                </button>
              ) : (
                <div className="flex items-center justify-center gap-2 py-1">
                  <span className="text-xs text-gray-500">Clear all?</span>
                  <button
                    onClick={clearAll}
                    className="text-xs px-2 py-0.5 rounded bg-red-500 text-white hover:bg-red-600"
                  >
                    Yes, clear
                  </button>
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600 hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}
