"use client";

import { useState } from "react";
import { ConceptNav } from "./components/ConceptNav";
import { Concept1TextAsNumbers } from "./components/Concept1";
import { WhyIBuiltThis } from "./components/WhyIBuiltThis";

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
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">
              How LLMs Work
            </h1>
            <p className="text-sm text-gray-500">
              An interactive guide — no PhD required
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowWhyIBuiltThis(!showWhyIBuiltThis)}
              className="text-sm text-gray-500 hover:text-gray-900 transition-colors underline decoration-dotted underline-offset-4"
            >
              Why I built this
            </button>
            <a
              href="/"
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
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
      <main className="max-w-4xl mx-auto px-6 pb-24">
        {activeConcept === 1 && <Concept1TextAsNumbers />}
        {activeConcept > 1 && (
          <div className="py-20 text-center">
            <p className="text-lg text-gray-400">Coming soon</p>
            <p className="text-sm text-gray-300 mt-2">
              {CONCEPTS[activeConcept - 1].title} — {CONCEPTS[activeConcept - 1].subtitle}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
