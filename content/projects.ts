export type ServiceLayer = {
  layer: string;
  note: string;
  items: string[];
};

export type Project = {
  slug: string;
  title: string;
  oneLiner: string;
  tileInsight: string;
  tags: string[];
  thumbnailColor: string;
  thumbnailImage?: string;
  problem: string;
  hypothesis: string;
  built: string;
  broke: string;
  learned: string;
  nextSteps: string;
  keyLearning: string;
  services?: ServiceLayer[];
  artifacts: {
    screenshots: string[];
    screenshotCaptions?: string[];
    liveUrl?: string;
    videoUrl?: string;
  };
};

export const projects: Project[] = [
  {
    slug: "muse",
    title: "Muse Shopping",
    oneLiner: "A personalized shopping feed across 200+ brands — follow them like Instagram, built solo without a CS degree.",
    tileInsight: "Getting something built and trusting what was built are not the same problem.",
    tags: ["Consumer", "AI", "Full-Stack"],
    thumbnailColor: "#EDD5C0",
    thumbnailImage: "/projects/muse/logo-gradient.svg",
    problem: "I shop across ten different sites simultaneously — each one starting fresh with no memory of what I liked. The discovery layer of fashion is broken: you're either drowning in generic suggestions or running your own research operation across tabs. I wanted one place that worked like a social feed and actually learned your taste.",
    hypothesis: "The cold start problem in personalization is usually solved with a quiz. I wanted to test whether you could skip that — let behavioral signals do the work instead. If every click, save, and add-to-cart reveals taste, you should be able to build a real style profile without asking a single question.",
    built: "Follow brands the way you follow people on Instagram; their new products surface in a single feed. A Gmail integration pre-populates your brand follows from order history before you've made a single manual choice. What shipped: Node.js/Express, PostgreSQL, 10 integrated retailers, 200+ brands, Stripe checkout, A/B experimentation, and an admin dashboard.",
    broke: "I built the personalization engine before I had anything to personalize — weeks into recommendation logic before I asked what a new user actually sees. The answer was nothing. The second problem: the product catalog required scraping, which meant code I can't audit running inside a product I was considering shipping.",
    learned: "Design the zero-data state before you design the system that fills it — I got this exactly backwards. The harder lesson: I was evaluating the product by whether it worked, not by whether it was trustworthy. Those are different criteria.",
    nextSteps: "I'd run an explicit vs. implicit onboarding A/B test to validate the cold start hypothesis. I'd also audit every external integration before shipping — not as a checklist, but as a genuine 'do I understand what this code accesses?' review.",
    keyLearning: "The scraping workaround that unlocked the product catalog is also the code I can't audit — getting something built and trusting what was built are not the same problem.",
    artifacts: {
      screenshots: [
        "/projects/muse/welcome.png",
        "/projects/muse/home-feed.png",
        "/projects/muse/chat.png",
      ],
      screenshotCaptions: [
        "Welcome: sign in or browse as guest",
        "Home feed: follow brands like you follow people",
        "Talk with Muse: AI stylist that learns your taste",
      ],
      liveUrl: "https://muse.shopping",
    },
  },
  {
    slug: "llm-explainer",
    title: "LLM Explainer",
    oneLiner: "An interactive LLM learning tool built from Stanford CME 295 lectures — building it forced me to understand each concept, not just consume it.",
    tileInsight: "Building the explainer was the test. You can't fake your way through teaching a concept you don't understand.",
    tags: ["AI", "Research", "Vibecoding"],
    thumbnailColor: "#8B9FBF",
    problem: "I enrolled in Stanford's CME 295 (LLMs for PMs and Executives) to learn how LLMs actually work — not at a surface level, but well enough to make good product decisions about them. Reading the slides and watching lectures wasn't clicking fast enough. I needed something I could interrogate, not just consume.",
    hypothesis: "If I built the learning tool myself — forcing me to explain each concept clearly enough to code it — I'd understand the Stanford material faster than reading it.",
    built: "All content is sourced from Stanford CME 295 — lecture notes, slides, and transcripts — with full attribution in the header.\n\nSix concepts from the course — tokenization, embeddings, transformers, training, RLHF, agents — each with an interactive playground you can actually poke at. Saves to your iPhone home screen as a standalone app. A floating recorder lets you log questions by voice as you go, tagged to whichever concept you're on. One tap sends everything to ChatGPT, Notes, or Messages; download as a text file if you're on desktop.",
    broke: "The share button is built and shipped but not yet verified on a real iPhone — there's no way to test iOS-native share sheets from a laptop. Voice recording may also be unreliable when the app is running in home-screen mode, which is a known iPhone limitation. The one-tap export is the workaround.",
    learned: "Building the explainer forced me to understand each concept well enough to write interactive examples — that's a different level than reading a paper. The question recorder revealed something: the moments I got stuck were the most valuable ones. Logging them turned the stuck moments into a record of where AI education actually breaks down.",
    nextSteps: "Verify the share sheet on a real iPhone. Add more concepts as the CME 295 course progresses. The question archive is already a record of where AI education actually breaks down — a PM's field notes on learning each concept from scratch.",
    keyLearning: "Building the tool forced me to understand each concept well enough to explain it. That's a different test than reading a paper — and a harder one to fake.",
    artifacts: {
      screenshots: [
        "/projects/llm-explainer/mobile-hero.png",
        "/projects/llm-explainer/desktop-full.png",
      ],
      screenshotCaptions: [
        "Mobile hero — saves to your phone home screen as a standalone app",
        "Full walkthrough: six concepts from Stanford CME 295, each with an interactive playground",
      ],
      liveUrl: "https://schlacter.me/llm-explainer",
    },
  },
  {
    slug: "claude-skills",
    title: "Claude Skills",
    oneLiner: "A concept product for persistent AI instruction sets — tell Claude once, it applies your preferences forever.",
    tileInsight: "Framing is the product. Nobody asks for a 'persistent system prompt manager.' They might ask for a skill.",
    tags: ["AI", "Product Design", "Vibecoding"],
    thumbnailColor: "#F5C5B0",
    problem: "Every Claude conversation starts from scratch. You re-explain your tone, your context, your preferences — session after session. The model is capable; the interface forgets.",
    hypothesis: "If you frame AI customization as 'skills' rather than 'system prompts,' you remove the technical barrier. Most people don't know what a system prompt is. Everyone knows what a skill is.",
    built: "A concept site that shows the product working before asking anyone to sign up. The core bet: lead with a live chat preview demonstrating a skill in action, not a feature list. Two pathways — browse pre-built skills or create your own — sized for two different mental models.",
    broke: "The site shows what persistent skills could feel like — but the actual Claude interface doesn't support this natively. I was designing for a gap in the product, not an existing surface. The thing I shipped is a pitch, not a product.",
    learned: "Building a concept product is different from building a functional one. The constraint isn't 'can I build this' — it's 'can I make someone believe this should exist.' That's mostly a copywriting and sequencing problem.",
    nextSteps: "If Anthropic ships persistent memory or a skills layer, this design is a ready-made reference. The real test would be a working prototype — a Chrome extension that actually persists instructions across sessions would turn a concept into a proof of concept.",
    keyLearning: "Naming matters more than features. 'Claude Skills' communicates the idea in two words. 'Persistent system prompt manager' communicates nothing to anyone who doesn't already know what they want.",
    services: [
      {
        layer: "Design",
        note: "UI/UX concept and information architecture",
        items: ["Landing page layout", "Live demo component", "Use case personas", "CTA hierarchy"],
      },
      {
        layer: "Frontend",
        note: "Static site built with vibecoding",
        items: ["Next.js", "Tailwind CSS", "Vercel deployment"],
      },
    ],
    artifacts: {
      screenshots: [
        "/projects/claude-skills/hero.png",
        "/projects/claude-skills/live-demo.png",
        "/projects/claude-skills/use-cases.png",
      ],
      screenshotCaptions: [
        "Landing: tell Claude once, it remembers forever",
        "How it works: pick a skill, Claude opens, press Enter",
        "Browse the gallery: 9 pre-built skills ready in 30 seconds",
      ],
      liveUrl: "https://skills-roan.vercel.app",
    },
  },
  {
    slug: "kindle-libby",
    title: "Kindle × Libby",
    oneLiner: "Automated library-to-Kindle delivery — books show up on your Kindle when a hold comes in. That's it.",
    tileInsight: "Safety and functionality are separate problems — not the same checklist item.",
    tags: ["Utility", "Automation", "AI"],
    thumbnailColor: "#C5D5E8",
    problem: "Every time a library hold came in, I had to open Amazon, navigate to the right page, click through four steps, and confirm. Five minutes per book — manual and completely unnecessary. I wanted them to just appear on my Kindle.",
    hypothesis: "If you can automate the hold-monitoring and delivery steps, the book should show up with no intervention. I was testing whether I could eliminate the manual loop entirely — not just make it easier, but make it invisible.",
    built: "Deployed to the cloud rather than running locally — because a script you have to run is still friction. The notification and dashboard aren't extra features; they're the only interface, since the automation itself is meant to be imperceptible.",
    broke: "Libby locks the format at borrow time — I was borrowing audiobooks that can't go to Kindle at all, then watching delivery fail silently. Amazon's internal GraphQL API reported zero books in my library even though they existed; I had to switch to browser automation instead. Then I asked about security before connecting my Amazon credentials. Claude started building anyway — what came back was functional code I couldn't audit.",
    learned: "The happy path was maybe 40% of the work — the rest was keeping it running through token expiry, UI changes, and silent failures. When you build something that runs unattended, the design challenge isn't the automation: it's making failures visible in a system designed to be invisible.",
    nextSteps: "I'd build the missing audit layer — a plain-language explanation of what the code accesses and why, generated before first run. That's what I'd want to hand to a non-technical user, and it doesn't exist yet in any AI-assisted build tool.",
    keyLearning: "I asked about the security implications before connecting this to my Amazon account. Claude started building anyway — the security layer had to be explicitly requested, and what came back is still code I can't fully audit.",
    artifacts: {
      screenshots: [],
      liveUrl: undefined,
    },
  },
  {
    slug: "home-design",
    title: "Interior Design Tool",
    oneLiner: "A private design tool for my house — gallery, floor plan, designer brief, project roadmap, and an AI advisor that already knows the home.",
    tileInsight: "The hard part of design isn't finding inspiration — it's organizing it into a brief someone else can execute from.",
    tags: ["AI", "Vibecoding", "Consumer"],
    thumbnailColor: "#B85042",
    thumbnailImage: "/projects/home-design/tile-edit.jpg",
    problem: "I bought a house and started collecting design inspiration everywhere at once — Instagram, Amazon, Pinterest, Houzz, Zillow. By the time I sat down with an interior designer, my 'inspiration' lived across six apps with no connective tissue. There was no single place that held what I actually wanted, let alone something I could hand to a contractor.",
    hypothesis: "A private gallery that accepts images from any source can turn scattered screenshots into a coherent brief. Add structure — categories, tags, notes, annotations — and it becomes a shared language between you and your designer. Layer an AI advisor on top that already knows your home, and you can skip re-explaining every time you have a question.",
    built: "A Next.js app with five interconnected sections — all private, behind password-protected access with role-based permissions for different users.\n\nGallery — Images from any source get a category, a like, a note, and optional shape annotations. A tag filter strip and full-text search make it navigable. Layout controls (2–6 columns, aspect ratio) make it browsable.\n\nFloor Plan — An interactive annotated floor plan with pan/zoom, shape annotations per room, and photos linked directly to each annotation. The image-mapping layer that connects inspiration to specific spaces.\n\nDesigner Brief — An editable vision document with color palette, room priorities, must-haves, and a searchable library of 400+ material and texture swatches across 9 categories.\n\nJournal — Rich-text notes with tags, starring, image attachments, and per-note guest sharing via access tokens. The shared language for decisions made with designers and contractors.\n\nPriorities — A 24-month drag-and-drop roadmap with task management: cost estimates, level of effort, owner assignment, vendor tracking, and a visual timeline.\n\nLayered on top: a persistent Claude skill that already knows the home (Spanish Revival, Oakland), the design pillars, and the room priorities. Ask it anything and it has context before you finish the question.",
    broke: "Getting images from Instagram and Amazon is not as simple as a copy-paste — neither platform offers clean APIs for personal use, so the pipeline requires more manual lifting than intended. The AI advisor is also only as good as the brief you give it: writing the skill file took real judgment that couldn't be delegated to the model.",
    learned: "A design gallery is most valuable not as a moodboard but as a translation layer — the goal is turning screenshots into something a contractor can actually act on. The floor plan annotation layer made the biggest difference: once inspiration was mapped to specific rooms, conversations with the designer got more concrete — I stopped saying 'vibes' and started pointing at a map. The AI advisor flipped my assumption: the bottleneck isn't the model's design knowledge, it's getting your taste into a format the model can use.",
    nextSteps: "A browser extension that one-click saves an Amazon product or Instagram screenshot directly to the gallery would unlock the original hypothesis. I'd also extend the skill into a handoff tool: one click to generate a structured brief that can be emailed to a contractor.",
    keyLearning: "Build the brief before you ask the model. The AI advisor only works because I wrote down what I actually wanted — the model holds it, but the taste was mine to define.",
    services: [
      {
        layer: "Gallery",
        note: "Tag filtering, search, shape annotations, layout controls",
        items: [
          "Next.js 15 (App Router)",
          "TypeScript + Tailwind CSS",
          "Vercel Blob (image storage)",
          "Vercel KV / Upstash (metadata)",
          "15+ room categories, multi-column layout picker",
        ],
      },
      {
        layer: "Floor Plan",
        note: "Interactive annotator with linked room photos",
        items: [
          "Pan/zoom with touch pinch support",
          "Shape annotations (rect, circle) per room",
          "Photos linked to each annotation",
          "Current room photo collection",
          "PDF floor plan import",
        ],
      },
      {
        layer: "Designer Brief",
        note: "Editable vision doc + material library",
        items: [
          "Color palette with hex management",
          "Room priorities and must-haves",
          "400+ material/texture swatches (9 categories)",
          "Searchable by keyword and vibe",
          "Must-have image pinning",
        ],
      },
      {
        layer: "Journal",
        note: "Rich-text notes with guest sharing",
        items: [
          "HTML rich text, tags, starring",
          "Image attachments with positioning",
          "Per-note guest access tokens",
          "View-only vs. edit access per guest",
          "Guest contact management",
        ],
      },
      {
        layer: "Priorities",
        note: "24-month drag-and-drop project roadmap",
        items: [
          "Task cost, LOE, owner, vendor fields",
          "Visual 24-month timeline",
          "Drag-and-drop rescheduling",
          "Status tracking (Not Started → Done)",
          "Linked images per task",
        ],
      },
      {
        layer: "AI Design Advisor",
        note: "Persistent Claude skill with full home context",
        items: [
          "Claude Code skill file",
          "Style profile API (KV storage)",
          "Room-by-room knowledge base",
          "Spanish Colonial + MCM sub-skills",
        ],
      },
    ],
    artifacts: {
      screenshots: [
        "/projects/home-design/gallery-tags.png",
        "/projects/home-design/floor-plan.png",
        "/projects/home-design/image-annotation.png",
        "/projects/home-design/journal.png",
        "/projects/home-design/roadmap.png",
        "/projects/home-design/designer-brief.png",
        "/projects/home-design/demo-cb-to-portfolio.gif",
        "/projects/home-design/demo-gallery-interaction.gif",
        "/projects/home-design/shortcut-builder.png",
        "/projects/home-design/instagram-select.png",
        "/projects/home-design/instagram-saved.png",
        "/projects/home-design/amazon-product.png",
        "/projects/home-design/amazon-saved.png",
      ],
      screenshotCaptions: [
        "Gallery: 251 images with tag filter strip, search, and layout controls",
        "Floor plan: annotated rooms with linked photos per space",
        "Image detail: draw annotations, assign category tags, and add notes",
        "Journal: notes with linked inspiration, tags, and guest sharing",
        "Roadmap: 24-month timeline across 61 home improvement projects",
        "Designer brief: vision doc with style direction and room priorities",
        "Crate & Barrel → gallery: one tap saves a product to your private board",
        "Gallery in action: open a tile, add a note, assign a category",
        "The iOS Shortcut that powers the share-sheet pipeline",
        "Selecting a Studio McGee post from Instagram to save",
        "Confirmation: saved to the gallery from Instagram",
        "Amazon product page for a fluted sideboard — one tap to save",
        "Confirmation: saved to the gallery from Amazon",
      ],
      liveUrl: "https://interiordesign.giddins.family",
    },
  },
  {
    slug: "claude-wishlist",
    title: "Claude Wishlist",
    oneLiner: "A consumer's feature wishlist for Claude — written from 200+ hours of solo building since February, some days running 11am to 2am.",
    tileInsight: "The model isn't the bottleneck. The interface is.",
    tags: ["AI", "Product Design", "Research"],
    thumbnailColor: "#F5C5B0",
    problem: "I picked up Claude Code in February and built four products in a few months — some days from 11am to 2am, completely unable to stop. I'm not an engineer. Somewhere in those 200+ hours, I started keeping notes — not bugs, but gaps. Things a product person notices that an engineer might not.",
    hypothesis: "The most useful feedback on an AI product comes from builders who hit the walls and wrote down what they found — not power users who know the workarounds. This is my firsthand account of where the gaps are.",
    built: "A structured wishlist — not a complaint list, but a product brief — written after building multiple projects solo. Covers: cross-session memory, team context sharing, security transparency for non-technical builders, better handling of novel problems, and onboarding for non-engineers.",
    broke: "Nothing broke here — this is the record of everything that did.",
    learned: "The thing I kept learning across every project: the model is capable; the interface forgets. The bottleneck is never what Claude can do — it's whether Claude knows enough about you, your project, and your constraints to do it right.",
    nextSteps: "Share it. The most useful thing a consumer can do with a product wishlist is get it in front of the people building the product.",
    keyLearning: "I went in thinking the model capability was the limit. I came out knowing the interface is. The model is already good enough — the gap is everything around it.",
    artifacts: {
      screenshots: [],
      liveUrl: "https://schlacter.me/claude-ideas",
    },
  },
  {
    slug: "vantara-agent-studio",
    title: "Vantara Agent Studio",
    oneLiner: "A working enterprise agent-builder, built in a day for my Vercel PM application — demo mode included, no API setup required.",
    tileInsight: "Building a prototype for a hiring manager is the same job as building one for a user: show them what's possible, make it real enough to believe.",
    tags: ["AI", "Full-Stack", "Vibecoding"],
    thumbnailColor: "#1A1A1A",
    thumbnailImage: "/projects/vantara-agent-studio/landing.png",
    keyLearning: "The hard design problem in enterprise agent building isn't the AI layer — it's giving non-technical users enough structure to describe what they actually want. The wizard is really a structured prompt for the human, not the model.",
    problem: "The Vercel PM (Agent Platform) role asked for someone who understands where enterprise agent UX is heading. I didn't want to write another cover letter about it. I wanted to build something instead — a real product that shows the PM thinking, not a doc that describes it.",
    hypothesis: "If I can design a credible enterprise agent-building workflow in a day — with real AI responses, a dashboard, and version history — I can show the product judgment that matters for the role without a slide deck.",
    built: "A 4-step wizard that takes an enterprise use case to a deployed agent: collect context, generate Claude-powered clarifying questions, preview agent output, simulate deploy. Built on Vercel AI SDK edge runtime with Upstash Redis for persistence.\n\nThe scenario: a healthcare org managing 500 employees across 15 practices, with three agent types — Leadership (monthly updates), Regulatory (federal policy monitoring), Operations (patient volume). Demo mode lets a hiring manager walk through the full wizard without any API setup. Try it: vantara-agent-studio.vercel.app/build?usecase=comms&demo=true",
    broke: "Demo mode revealed something: the experience with real Claude responses and with pre-baked ones felt almost identical — which means the UX is doing real work independent of the model. The enterprise vertical also taught me that agent use case framing is everything. The same capability reads completely differently depending on the job it's being asked to do.",
    learned: "Structuring the wizard as a 'prompt for the human' — not a configuration UI — was the right call. Non-technical users don't know how to specify what they want from an agent. The clarifying question step isn't about collecting data; it's about helping the user articulate the problem.",
    nextSteps: "This stays a demo unless I get the job. If I kept going: A/B test the clarifying question step — fewer, better questions probably outperform the current model. Version history with semantic diffs (what actually changed about the agent's behavior, not just a timestamp) would be the real product bet.",
    services: [
      {
        layer: "Frontend",
        note: "Next.js 16 App Router with Tailwind CSS 4 and Geist font",
        items: ["Next.js 16.2.2", "TypeScript", "Tailwind CSS 4", "Geist"],
      },
      {
        layer: "AI Layer",
        note: "Vercel AI SDK on Edge Runtime, Claude for questions + preview",
        items: ["Vercel AI SDK", "Anthropic Claude", "Edge Runtime", "Demo mode"],
      },
      {
        layer: "Data & Platform",
        note: "Upstash Redis for agent persistence, Vercel Analytics + Speed Insights",
        items: ["Upstash Redis", "Vercel Analytics", "Vercel Speed Insights"],
      },
    ],
    artifacts: {
      screenshots: [
        "/projects/vantara-agent-studio/landing.png",
        "/projects/vantara-agent-studio/wizard-step1.png",
        "/projects/vantara-agent-studio/wizard-step2.png",
        "/projects/vantara-agent-studio/wizard-step3.png",
        "/projects/vantara-agent-studio/wizard-step4.png",
        "/projects/vantara-agent-studio/dashboard.png",
      ],
      screenshotCaptions: [
        "Landing: build agents your team can use — no engineering required",
        "Wizard step 1: pick a starting point or describe your own in plain English",
        "Wizard step 2: a few quick questions to configure the agent correctly",
        "Wizard step 3: plain-English preview of exactly what your agent will do",
        "Wizard step 4: deployed — v1.0, Active, Edge runtime",
        "Dashboard: 3 agents deployed, version history, schedule, and status",
      ],
      liveUrl: "https://vantara-agent-studio.vercel.app",
    },
  },
  {
    slug: "ldor",
    title: "L'dor",
    oneLiner: "A modern Judaica brand built for the next generation.",
    tileInsight: "Validating that something looks right is not the same as validating that people will pay for it.",
    tags: ["E-commerce", "Brand", "AI"],
    thumbnailColor: "#D4C8E8",
    problem: "I'm that 28-year-old — moving into my first real apartment, wanting to host Shabbat, and realizing that modern Judaica basically doesn't exist. Everything available was either synagogue gift shop or family heirloom: dated, overpriced for institutions, or designed for someone else entirely.",
    hypothesis: "I surveyed over 100 young Jewish adults before building anything. Same answer every time: feel like CB2, not a synagogue gift shop — and priced for someone buying it themselves at 27, not receiving it as a wedding gift.",
    built: "A brand and a six-product collection — everything on a Shabbat table — with pricing anchored at $22 (something you'd buy yourself) and $88 (something you'd give as a gift). The marketing site came first, deliberately: if the aesthetic didn't resonate, the infrastructure wouldn't have mattered.",
    broke: "The site looks like a real store — the buttons don't go anywhere. I proved aesthetic fit; purchase intent is still an open question. The harder constraint: deciding on the palette, product lineup, and brand voice required actual judgment the model couldn't supply.",
    learned: "Sequencing brand before infrastructure was right: if the aesthetic doesn't work, the checkout button doesn't matter. But the harder constraint in brand work isn't what the model can produce — it's what you can decide.",
    nextSteps: "The brand is validated. The business model isn't. A waitlist with a $10 deposit would tell me more than any survey — if 50 people put down money before the product ships, the business case is real.",
    keyLearning: "You can describe a feeling to a model — modern but rooted, accessible but considered. Translating that into actual design decisions is the work that can't be delegated.",
    artifacts: {
      screenshots: [
        "/projects/ldor/hero.png",
        "/projects/ldor/site-collection.png",
        "/projects/ldor/site-product.png",
        "/projects/ldor/site-bundle.png",
      ],
      screenshotCaptions: [
        "Landing: Judaica, reimagined for you — pricing anchored at $22 and $88",
        "The collection: six pieces for the Shabbat table — Every Holiday. Every Shabbat.",
        "Shabbat Candleholder Set PDP — $48 anchor product, warm editorial photography",
        "Starter Bundle: $88 gift-mode entry with three of the most-requested pieces",
      ],
      liveUrl: undefined,
    },
  },
];
