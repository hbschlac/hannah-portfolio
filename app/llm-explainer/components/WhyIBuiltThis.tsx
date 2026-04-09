"use client";

export function WhyIBuiltThis({ onClose }: { onClose: () => void }) {
  return (
    <div className="border-b border-gray-200 bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-start justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Why I Built This
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
          <p>
            I watched Stanford&rsquo;s CME 295 (Transformers & LLMs) lecture and got lost
            halfway through &mdash; not because the concepts were too hard, but because the
            lecture lacked a <strong>translation layer</strong>: relatable analogies, concrete
            walkthroughs on real examples, and constant connection between granular details and
            the big picture.
          </p>

          <p>
            My friend (an engineer) tutored me through it, and I realized: the content is
            excellent. What&rsquo;s missing is the <em>experience design</em>.
          </p>

          <div className="bg-white rounded-xl border border-gray-200 p-5 mt-4">
            <p className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-3">
              The Design Pattern: Story &rarr; Journey &rarr; Playground
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="font-medium text-gray-900 mb-1">Story</p>
                <p className="text-xs text-gray-500">
                  A narrative hook that makes you care. &ldquo;Why should I care about this?&rdquo;
                </p>
                <p className="text-xs text-blue-600 mt-2 font-medium">
                  AI Surface parallel: Contextual prompts
                </p>
                <p className="text-xs text-gray-400">
                  &ldquo;You have 47 unread emails. Want a summary?&rdquo;
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-900 mb-1">Journey</p>
                <p className="text-xs text-gray-500">
                  A step-by-step walkthrough using a real example you recognize.
                </p>
                <p className="text-xs text-blue-600 mt-2 font-medium">
                  AI Surface parallel: Guided walkthroughs
                </p>
                <p className="text-xs text-gray-400">
                  Watch Gemini summarize your actual email thread, step by step.
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-900 mb-1">Playground</p>
                <p className="text-xs text-gray-500">
                  A sandbox where you experiment, break things, and build intuition.
                </p>
                <p className="text-xs text-blue-600 mt-2 font-medium">
                  AI Surface parallel: Open-ended side panel
                </p>
                <p className="text-xs text-gray-400">
                  The Gemini side panel where users explore freeform.
                </p>
              </div>
            </div>
          </div>

          <p className="text-gray-500 mt-4">
            This interaction pattern &mdash; layered depth where users go as shallow or deep
            as they want &mdash; is how I believe AI surfaces should onboard users across
            products like Google Workspace.{" "}
            <a
              href="/workspace-ai-gaps"
              className="text-blue-600 hover:text-blue-700 underline underline-offset-2"
            >
              See my analysis of where Gemini for Workspace has the biggest opportunities
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
