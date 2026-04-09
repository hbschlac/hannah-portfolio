"use client";

interface Concept {
  id: number;
  title: string;
  subtitle: string;
  unlocked: boolean;
}

export function ConceptNav({
  concepts,
  activeConcept,
  onSelect,
}: {
  concepts: Concept[];
  activeConcept: number;
  onSelect: (id: number) => void;
}) {
  return (
    <nav className="border-b border-gray-100 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex gap-1 overflow-x-auto py-3 -mx-2 px-2 scrollbar-hide">
          {concepts.map((c) => (
            <button
              key={c.id}
              onClick={() => c.unlocked && onSelect(c.id)}
              disabled={!c.unlocked}
              className={`
                flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${
                  activeConcept === c.id
                    ? "bg-gray-900 text-white shadow-sm"
                    : c.unlocked
                    ? "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    : "text-gray-300 cursor-not-allowed"
                }
              `}
            >
              <span className="mr-1.5 text-xs opacity-50">{c.id}.</span>
              {c.title}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
