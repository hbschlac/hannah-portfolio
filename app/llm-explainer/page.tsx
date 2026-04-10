"use client";

import { useState } from "react";
import { ConceptNav } from "./components/ConceptNav";
import { Concept1TextAsNumbers } from "./components/Concept1";
import { WhyIBuiltThis } from "./components/WhyIBuiltThis";
import { QuestionRecorder } from "./components/QuestionRecorder";

const CONCEPTS = [
  { id: 1, title: "Text as Numbers", subtitle: "How computers read words", unlocked: true },
  { id: 2, title: "Attention", subtitle: "How models focus on relevant words", unlocked: false },
  { id: 3, title: "Transformer Architecture", subtitle: "Putting it all together", unlocked: false },
  { id: 4, title: "Large Language Models", subtitle: "Scaling things up", unlocked: false },
  { id: 5, title: "How LLMs Learn", subtitle: "From data to model", unlocked: false },
  { id: 6, title: "Alignment", subtitle: "Making models helpful and safe", unlocked: false },
  { id: 7, title: "Reasoning & Planning", subtitle: "Beyond pattern matching", unlocked: false },
  { id: 8, title: "Agentic Behavior", subtitle: "Tools, memory, and planning", unlocked: false },
  { id: 9, title: "Evaluation & Trends", subtitle: "Measuring and extending", unlocked: false },
];

export default function LLMExplainerPage() {
  const [activeConcept, setActiveConcept] = useState(1);
  const [showWhyIBuiltThis, setShowWhyIBuiltThis] = useState(false);

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-3 md:py-4 flex items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">
              How LLMs Work
            </h1>
            <p className="text-sm text-gray-500">
              An interactive guide — no PhD required
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              Based on{" "}
              <a
                href="https://online.stanford.edu/courses/cme-295-transformers-large-language-models"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-gray-600 transition-colors"
              >
                Stanford CME 295: Transformers &amp; Large Language Models
              </a>
            </p>
          </div>
          <div className="flex items-center gap-3 md:gap-4 flex-shrink-0">
            <button
              onClick={() => setShowWhyIBuiltThis(!showWhyIBuiltThis)}
              className="text-xs md:text-sm text-gray-500 hover:text-gray-900 transition-colors underline decoration-dotted underline-offset-4 whitespace-nowrap"
            >
              Why I built this
            </button>
            <a
              href="/"
              className="text-xs md:text-sm text-gray-400 hover:text-gray-600 transition-colors hidden sm:inline"
            >
              schlacter.me
            </a>
          </div>
        </div>
      </header>

      {showWhyIBuiltThis && (
        <WhyIBuiltThis onClose={() => setShowWhyIBuiltThis(false)} />
      )}

      {/* Concept navigation */}
      <ConceptNav
        concepts={CONCEPTS}
        activeConcept={activeConcept}
        onSelect={setActiveConcept}
      />

      {/* Active concept */}
      <main>
        {activeConcept === 1 && <Concept1TextAsNumbers />}
        {activeConcept > 1 && (
          <div className="min-h-[calc(100vh-120px)] flex items-center justify-center">
            <div className="text-center">
              <p className="text-lg text-gray-400">Coming soon</p>
              <p className="text-sm text-gray-300 mt-2">
                {CONCEPTS[activeConcept - 1].title} — {CONCEPTS[activeConcept - 1].subtitle}
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Floating question recorder */}
      <QuestionRecorder conceptLabel={CONCEPTS[activeConcept - 1].title} />
    </div>
  );
}
