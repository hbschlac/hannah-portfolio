"use client";

import { useState } from "react";
import { GmailTodayMock } from "./GmailTodayMock";
import { GmailFutureMock } from "./GmailFutureMock";

type Layer = "summary" | "action" | "voice";

const LAYERS: { id: Layer; label: string }[] = [
  { id: "summary", label: "Summary" },
  { id: "action", label: "+ Action" },
  { id: "voice", label: "+ Voice" },
];

export function PrototypeSection() {
  const [activeLayer, setActiveLayer] = useState<Layer>("summary");

  return (
    <div className="border-t border-gray-100 bg-gray-50">
      <div className="max-w-2xl mx-auto px-6 py-14">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">What it could look like</h2>
        <p className="text-sm text-gray-400 mb-8">Each layer is additive — accuracy unlocks action, action unlocks voice.</p>

        {/* Layer toggle */}
        <div className="flex gap-2 mb-10">
          {LAYERS.map((layer) => (
            <button
              key={layer.id}
              onClick={() => setActiveLayer(layer.id)}
              className="px-3 py-1.5 rounded-full text-sm border transition-all"
              style={
                activeLayer === layer.id
                  ? { background: "#1a73e8", color: "#fff", borderColor: "#1a73e8" }
                  : { background: "#fff", color: "#5f6368", borderColor: "#e8eaed" }
              }
            >
              {layer.label}
            </button>
          ))}
        </div>

        {/* Mocks */}
        <div className="flex flex-col sm:flex-row gap-10 items-start justify-center">
          <GmailTodayMock />
          <div className="hidden sm:flex flex-col items-center self-center">
            <div className="w-px h-16 bg-gray-200" />
            <span className="text-xs text-gray-300 my-2">vs</span>
            <div className="w-px h-16 bg-gray-200" />
          </div>
          <GmailFutureMock activeLayer={activeLayer} />
        </div>
      </div>
    </div>
  );
}
