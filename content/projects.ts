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
    liveUrl?: string;
    videoUrl?: string;
  };
};

export const projects: Project[] = [
  {
    slug: "muse",
    title: "Muse",
    oneLiner: "A full-stack personalized shopping platform aggregating 200+ brands across 10 integrated retailers — built solo, no CS degree.",
    tileInsight: "Getting something built and trusting what was built are not the same problem.",
    tags: ["Consumer", "AI", "Full-Stack"],
    thumbnailColor: "#EDD5C0",
    thumbnailImage: "/projects/muse/welcome.png",
    problem: "I shop at maybe ten different sites. Zara in one tab, Nordstrom in another, H&M in a third. Each one starts fresh — no memory of what I liked before, no way to compare prices, no feed that actually gets smarter. The discovery layer of fashion shopping is completely broken: you're either drowning in generic suggestions or running your own research operation across tabs. I wanted one place that worked like a social feed — follow the brands you care about, see what's new, and have it actually learn your taste.",
    hypothesis: "The cold start problem in personalization is usually solved with a quiz or onboarding survey. I wanted to test whether you could skip that entirely — let behavioral signals do the work instead. If every click, save, and add-to-cart implicitly reveals taste, you should be able to build a real style profile without ever asking a single question. I was also testing whether a unified brand-follow feed could replace the browser-tab shopping habit.",
    built: "The structural bet: follow brands the way you follow people on Instagram, and their new products surface in a single feed. The personalization bet: implicit signals over explicit input — clicks, saves, cart adds build a taste profile passively, no onboarding quiz required. The cold start solve: connect your Gmail and the app pre-populates your brand follows from order history before you've made a single manual choice.\n\nWhat actually shipped: a Node.js/Express backend with 50+ API endpoints, PostgreSQL, JWT auth with refresh tokens, and 10 fully integrated retailers (Nordstrom, H&M, Abercrombie, Urban Outfitters, Aritzia, and more). A Stripe-powered checkout layer that routes to individual retailer flows. A Gmail API integration that parses email receipts to extract purchase signals. An A/B experimentation system for testing feed module order and personalization logic. An admin dashboard for curated campaigns and brand analytics. Deployed on Vercel. 200+ brands seeded.",
    broke: "Two things. First: the empty newsfeed. I built the personalization engine before I had anything to personalize — weeks into the recommendation logic before I asked what a new user actually sees. The answer was nothing. I had to reverse course and auto-follow a set of default brands so the first session wasn't a blank page. The order should have been: design the zero-data state, then build the engine that replaces it.\n\nSecond: the product catalog. I needed retailer data, which meant scraping. After enough rephrasing, I got what I needed. I also got code I can't audit, running inside a product I was considering shipping. Those are two different problems — and I treated them as one.",
    learned: "Design the zero-data state before you design the system that fills it. I got this exactly backwards — built the engine before the entry point, which meant the most important experience (the first session) was an afterthought.\n\nThe harder lesson: I was evaluating the product by whether it worked, not by whether it was trustworthy. Those are different criteria. A PM needs to track both.",
    nextSteps: "I'd run an explicit vs. implicit onboarding A/B test: one group gets a style quiz, one group gets nothing and lets behavioral signals do the work. The cold start hypothesis is interesting. The data would be more interesting. I'd also want to audit every external integration before shipping — not as a security theater checklist, but as a genuine 'do I understand what this code accesses?' review.",
    keyLearning: "The scraping workaround that unlocked the product catalog is also the code I can't audit — getting something built and trusting what was built are not the same problem.",
    artifacts: {
      screenshots: [
        "/projects/muse/welcome.png",
        "/projects/muse/home-feed.png",
        "/projects/muse/home-carousels.png",
        "/projects/muse/chat.png",
        "/projects/muse/inspire.png",
      ],
      liveUrl: "https://app.muse.shopping",
    },
  },
  {
    slug: "claude-skills",
    title: "Claude Skills",
    oneLiner: "A concept product for persistent AI instruction sets — tell Claude once, it applies your preferences forever.",
    tileInsight: "Framing is the product. Nobody asks for a 'persistent system prompt manager.' They might ask for a skill.",
    tags: ["AI", "Product Design", "Vibecoding"],
    thumbnailColor: "#F5C5B0",
    thumbnailImage: "/projects/claude-skills/hero.png",
    problem: "Every Claude conversation starts from scratch. You re-explain your tone, your context, your preferences — session after session. The model is capable; the interface forgets. I wanted to test whether persistent instruction sets could feel less like a developer feature and more like something anyone would actually use.",
    hypothesis: "If you frame AI customization as 'skills' rather than 'system prompts,' you remove the technical barrier. Most people don't know what a system prompt is. Everyone knows what a skill is. The hypothesis was that naming and framing could close the gap between power-user behavior and general-user behavior.",
    built: "A marketing and concept site that shows the product working before asking anyone to sign up. The core design bet: lead with a live chat preview demonstrating a skill in action, not a feature list. Two pathways — browse pre-built skills or create your own — sized for two different mental models. Use case personas to show the range without making anyone read a manual.",
    broke: "The site shows what persistent skills could feel like — but the actual Claude interface doesn't support this natively yet. I was designing for a gap in the product, not an existing surface. Which means the thing I shipped is a pitch, not a product. That's a real constraint, not a flaw in the concept.",
    learned: "Building a concept product is different from building a functional one. The constraint isn't 'can I build this' — it's 'can I make someone believe this should exist.' That's mostly a copywriting and sequencing problem. The model is good at execution; it still needs you to know what you're arguing for.",
    nextSteps: "If Anthropic ships persistent memory or a skills layer, this design is a ready-made reference. In the meantime, the real test would be a working prototype using the API — a Chrome extension or Claude.ai workaround that actually persists instructions across sessions. That would turn a concept into a proof of concept.",
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
      liveUrl: "https://skills-roan.vercel.app",
    },
  },
  {
    slug: "kindle-libby",

    title: "Kindle × Libby",
    oneLiner: "Automated library-to-Kindle delivery — built so the book just appears, no steps required. Running in the cloud, fully unattended.",
    tileInsight: "Safety and functionality are separate problems — not the same checklist item.",
    tags: ["Utility", "Automation", "AI"],
    thumbnailColor: "#C5D5E8",
    thumbnailImage: "/projects/kindle-libby/dashboard-home.png",
    problem: "Every time a library hold came in on Libby, I had to open Amazon, navigate to the right page, click 'Get Library Book,' select my Kindle device, and confirm. Five minutes per book — interruptible, manual, and completely unnecessary. I had a queue of holds building up. I wanted them to just appear on my Kindle.",
    hypothesis: "If you can automate the hold-monitoring and delivery steps, the book should just show up on your Kindle with no intervention. I was testing whether I could eliminate the entire manual loop — not just make it easier, but make it invisible.",
    built: "The design goal was invisibility — not fewer steps, but zero steps. Deploying to the cloud wasn't a technical decision; it was a product one: a script you have to run is still friction. The notification and dashboard aren't extra features — they're the only interface, since the automation itself is meant to be imperceptible.",
    broke: "Three things, in escalating order of surprise.\n\nFirst: format. I assumed borrowing a book and delivering it to Kindle were separate steps I could sequence. They're not — Libby locks the format at borrow time. I was borrowing audiobooks that can't go to Kindle at all, then watching delivery fail silently.\n\nSecond: Amazon's internal API. I tried using their GraphQL endpoint for delivery. It reported zero books in my library. The books existed. I had to switch to browser automation — having the code click through Amazon's UI like a person would — because the undocumented API was less reliable than the visible interface.\n\nThird: I asked about security before connecting everything to my Amazon account credentials. Claude started building anyway. What came back was functional code I couldn't audit, sitting between my library account and my Amazon account. That's when safety and functionality stopped feeling like the same checklist item.",
    learned: "The happy path was maybe 40% of the work. The rest was keeping it running: session tokens expiring, Amazon's UI changing mid-deployment, silent failures with no one to notice them. When you build something that runs unattended, the design challenge isn't the automation — it's making failures visible in a system designed to be invisible.",
    nextSteps: "I'd build the audit layer that's missing — not a security checklist, but a plain-language explanation of what the code accesses and why, generated before first run. That's the thing I'd want to hand to a non-technical user. It's also the thing that doesn't exist yet in any AI-assisted build tool I've used. Someone should build it.",
    keyLearning: "I asked about the security implications before connecting this to my Amazon account. Claude started building anyway — the security layer had to be explicitly requested, and what came back is still code I can't fully audit.",
    artifacts: {
      screenshots: [
        "/projects/kindle-libby/dashboard-home.png",
        "/projects/kindle-libby/search-little-women.png",
        "/projects/kindle-libby/loans-manage.png",
      ],
      liveUrl: undefined,
    },
  },
  {
    slug: "662-calmar",
    title: "662 Calmar",
    oneLiner:
      "A private design gallery aggregating inspiration from Instagram, Amazon, Pinterest, and Houzz — paired with an AI advisor that already knows your home.",
    tileInsight:
      "The hard part of design isn't finding inspiration — it's organizing it into a brief someone else can execute from.",
    tags: ["AI", "Vibecoding", "Consumer"],
    thumbnailColor: "#B85042",
    problem: `I bought a house and started collecting design inspiration everywhere at once. Screenshots from Instagram, saved items on Amazon, pins on Pinterest, favorites on Houzz, photos of the actual space from Zillow. By the time I sat down with an interior designer, my "inspiration" lived across six apps with no connective tissue. I was emailing image dumps and trying to explain a vibe in words. There was no single place that held what I actually wanted — and no way to show it coherently to the people I was paying to help me.`,
    hypothesis: `If you build a private, password-protected gallery that accepts images from any source, you can turn scattered screenshots into a coherent brief. Add structure — categories, likes, notes, annotations — and the gallery becomes a shared language between you and your designer. Then layer an AI design advisor on top, one that already knows your home's architecture, your color palette, your design pillars, and your room priorities, and you can skip the re-explaining every time you have a question.`,
    built: `Two things that work together. First: the gallery — a Next.js site where images can be uploaded from any source: Instagram, Amazon, Pinterest, Houzz, Zillow listing photos, anything. Each image gets a category, a like, a note, and optional shape annotations (draw a rectangle around the sofa you love, label it, flag it for a designer). The gallery is filterable, sortable, and fully private behind a password wall.\n\nSecond: the calmar-ave-designer Claude skill — a persistent AI design advisor that doesn't need to be re-briefed. The skill already knows the home (Spanish Revival, 3 floors, Upper Rockridge), the design pillars (Spanish Colonial, California Casual, MCM), the color palette (terracotta, warm white, sage, navy, walnut), and the Phase 1 priorities (living room and dining room). Ask it for a sofa recommendation, a paint color, or a concept board — and it has context before you finish the question.`,
    broke: `Getting images from Instagram and Amazon is not as simple as a copy-paste. Neither platform offers clean public APIs for personal use — saving an image to your own gallery requires manual steps, workarounds, or scraping. The pipeline I wanted (paste a URL, image appears in gallery) runs into walls on the most-used platforms. I ended up with a workflow that works but requires more manual lifting than I'd like.\n\nThe other gap: the AI advisor is only as good as the brief you give it. Building the skill file — writing down the style pillars, color palette, room details, and team contacts — took real judgment. That part couldn't be delegated to the model. The model can give guidance; the human has to define the taste.`,
    learned: `A design gallery is most valuable not as a moodboard but as a translation layer. The goal isn't to collect images — it's to turn a pile of screenshots into something a contractor, architect, or designer can actually act on. The annotation and notes system matters more than the visual grid.\n\nThe AI advisor flipped my assumption about AI design tools. I expected to describe my vision to it. The better version is the opposite: build a skill where you write the brief once, and the model holds it for every subsequent conversation. The bottleneck isn't the model's design knowledge — it's getting your taste into a format the model can use.`,
    nextSteps: `The image import pipeline is the biggest friction point. A browser extension that could one-click save an Amazon product image or Instagram screenshot directly to the gallery — bypassing the manual workflow — would unlock the original hypothesis. I'd also want to extend the skill into a full designer handoff tool: one click to generate a structured brief (style profile + annotated favorites by room) that can be emailed directly to a contractor or designer.`,
    keyLearning:
      "Build the brief before you ask the model. The AI advisor only works because I wrote down what I actually wanted — the model holds it, but the taste was mine to define.",
    services: [
      {
        layer: "Gallery App",
        note: "Password-protected Next.js site",
        items: [
          "Next.js 15 (App Router)",
          "TypeScript",
          "Tailwind CSS",
          "Vercel Blob (image storage)",
          "Vercel KV / Upstash (metadata)",
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
      {
        layer: "Deployment",
        note: "Auto-deploy on push",
        items: ["Vercel", "GitHub (hbschlac/662-calmar-portfolio)"],
      },
    ],
    artifacts: {
      screenshots: [],
      liveUrl: "https://662-calmar-portfolio.vercel.app",
    },
  },
  {
    slug: "claude-wishlist",
    title: "Claude Wishlist",
    oneLiner:
      "A consumer's feature wishlist for Claude — written from 200+ hours of solo building since February, some days running 11am to 2am.",
    tileInsight: "The model isn't the bottleneck. The interface is.",
    tags: ["AI", "Product Design", "Research"],
    thumbnailColor: "#F5C5B0",
    problem: `I picked up Claude Code in February and didn't stop. In a few months, I built a full-stack shopping platform, a Kindle automation tool, a Judaica brand, and a design gallery — some days running from 11am to 2am the next morning, completely unable to stop. I'm not an engineer. I learned to deploy by doing it wrong first. And somewhere in those 200+ hours, I started keeping notes. Not bugs — gaps. Things a product person would notice that an engineer might not. The interface that forgets you. The security layer that doesn't exist unless you ask. The build session with no off switch.`,
    hypothesis: `The most useful feedback on an AI product comes from users who push it past its comfortable edge — not power users who know the workarounds, but builders who hit the walls and wrote down what they found. I'm not a researcher. I'm a consumer and a product person, and this is my firsthand account of where the gaps are.`,
    built: `A structured wishlist document — not a complaint list, but a product brief. Written across three reflection rounds after completing multiple solo vibe-coding projects. Covers: cross-session memory and personalization, team context sharing, security transparency for non-technical builders, better handling of novel problems (vs. recycling failed approaches), usage boundaries that protect the user from themselves, and onboarding for non-engineers. Each item is grounded in a specific experience, not a hypothetical.`,
    broke: `Nothing broke here — this is the record of everything that did. The wishlist exists because the builds did.`,
    learned: `The thing I kept learning, in different forms across every project: the model is capable; the interface forgets. The bottleneck is never what Claude can do — it's whether Claude knows enough about you, your project, and your constraints to do it right. That's a product and interface problem, not a model problem. And it's solvable.`,
    nextSteps: `Share it. The most useful thing a consumer can do with a product wishlist is get it in front of the people building the product. This document is also a lens: if you're hiring PMs to think about AI adoption, consumer experience, and enterprise enablement, this is what that looks like from the inside.`,
    keyLearning:
      "I went in thinking the model capability was the limit. I came out knowing the interface is. The model is already good enough — the gap is everything around it.",
    artifacts: {
      screenshots: [],
      liveUrl: "LINK_TO_WISHLIST_DOC", // TODO: replace with hosted Google Doc / Notion URL
    },
  },
  {
    slug: "ldor",
    title: "L'dor",
    oneLiner: "A modern Judaica brand built for the next generation.",
    tileInsight: "Validating that something looks right is not the same as validating that people will pay for it.",
    tags: ["E-commerce", "Brand", "AI"],
    thumbnailColor: "#D4C8E8",
    problem: "I'm that 28-year-old. Moving into my first real apartment, wanting to host Shabbat, and realizing that modern Judaica basically doesn't exist. Everything available was either synagogue gift shop or family heirloom — dated, overpriced for institutions, or designed for someone else entirely.",
    hypothesis: "If you design Judaica to look like modern home goods — warm neutrals, clean lines, the aesthetic vocabulary of something you'd find at a design store — and price it for individuals rather than synagogues, there's a real market. I surveyed over 100 young Jewish adults before building anything. The most consistent finding: they wanted it to feel like CB2, not a synagogue gift shop. They also wanted entry-level pricing — something you could buy for yourself at 27, not just receive as a wedding gift.",
    built: "A brand and a six-product collection — everything on a Shabbat table — with a pricing architecture built around two deliberate anchors: $22 (something you'd buy yourself) and $88 bundle (something you'd give as a gift). The marketing site came first, deliberately. No checkout button. If the aesthetic didn't resonate, the infrastructure wouldn't have mattered.",
    broke: "Two things. First: the gap between brand and product. The site looks like a real store — the buttons don't go anywhere. I proved aesthetic fit; purchase intent is still an open question.\n\nSecond: how long taste decisions take. I could prompt for code in minutes. But deciding on the color palette, the product lineup, the price architecture, the brand voice — those decisions required actual thinking. The model could execute once I called the play. Calling the play was the whole job.",
    learned: "Sequencing brand before infrastructure was right: if the aesthetic doesn't work, the checkout button doesn't matter. But the harder constraint in brand work isn't what the model can produce — it's what you can decide. No one else can tell you what feels right.",
    nextSteps: "The brand is validated. The business model isn't. Next step is a limited pre-order — not a full e-commerce build — to test whether aesthetic fit translates to purchase intent. A waitlist with a $10 deposit would tell me more than any survey. If I can get 50 people to put down money before the product ships, the business case is real.",
    keyLearning: "You can describe a feeling to a model — modern but rooted, accessible but considered. Translating that into actual design decisions is the work that can't be delegated.",
    artifacts: {
      screenshots: [
        "/projects/ldor/hero.png",
        "/projects/ldor/product-grid.png",
        "/projects/ldor/product-candleholders.png",
      ],
      liveUrl: undefined,
    },
  },
];
