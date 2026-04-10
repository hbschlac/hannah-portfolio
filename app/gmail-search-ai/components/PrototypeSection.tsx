"use client";

import { useState } from "react";
import { GmailTodayMock } from "./GmailTodayMock";
import { GmailFutureMock } from "./GmailFutureMock";

type Layer = "summary" | "action" | "voice";

const LAYERS: { id: Layer; label: string; color: string; hypothesis: string }[] = [
  { id: "summary", label: "H1 · Summary only", color: "#EA4335", hypothesis: "Accuracy must come first" },
  { id: "action", label: "H2 · + Action", color: "#1a73e8", hypothesis: "Close the action gap" },
  { id: "voice", label: "H3 · + Voice matching", color: "#34A853", hypothesis: "Make it sound like you" },
];

export function PrototypeSection() {
  const [activeLayer, setActiveLayer] = useState<Layer>("summary");

  const active = LAYERS.find((l) => l.id === activeLayer)!;

  return (
    <div className="bg-gray-50 border-t border-gray-100">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="mb-8">
          <div className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">Prototype</div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            What Gmail could look like
          </h2>
          <p className="text-gray-500 mt-2 text-sm max-w-xl">
            Each layer is additive. Toggle through to see how accuracy → action → voice builds toward a fundamentally different inbox experience.
          </p>
        </div>

        {/* Layer toggle */}
        <div className="flex flex-wrap gap-2 mb-8">
          {LAYERS.map((layer) => (
            <button
              key={layer.id}
              onClick={() => setActiveLayer(layer.id)}
              className="px-4 py-2 rounded-full text-sm font-medium transition-all border"
              style={
                activeLayer === layer.id
                  ? { background: layer.color, color: "#fff", borderColor: layer.color }
                  : { background: "#fff", color: "#5f6368", borderColor: "#e8eaed" }
              }
            >
              {layer.label}
            </button>
          ))}
        </div>

        {/* Hypothesis call-out */}
        <div
          className="mb-8 px-4 py-3 rounded-xl text-sm font-medium border"
          style={{ background: `${active.color}10`, borderColor: `${active.color}30`, color: active.color }}
        >
          {active.hypothesis}
        </div>

        {/* Side-by-side mocks */}
        <div className="flex flex-col sm:flex-row gap-8 items-start justify-center">
          <GmailTodayMock />

          {/* Divider */}
          <div className="hidden sm:flex flex-col items-center justify-center self-center">
            <div className="w-px h-24 bg-gray-200" />
            <span className="text-xs text-gray-300 my-2 font-medium">vs</span>
            <div className="w-px h-24 bg-gray-200" />
          </div>

          <GmailFutureMock activeLayer={activeLayer} />
        </div>

        {/* Summary callout at bottom */}
        <div className="mt-12 max-w-2xl mx-auto bg-white rounded-2xl border border-gray-100 p-6" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <h3 className="font-bold text-gray-900 mb-3">The thesis in one sentence</h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            Gmail has the data advantage — years of your sent history, your contacts, your threads. The bet is using it to close the loop: from search, to a summary you trust, to an action you can take, to a response that sounds like you. No other email client has all three. Gmail can.
          </p>
        </div>
      </div>
    </div>
  );
}
