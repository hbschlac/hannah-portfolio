import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TML 101 — A plain-language explainer of Thinking Machines Lab",
  description:
    "When Tinker launched, I didn't fully understand what fine-tuning was. So I used Claude to build myself a first-grade-level explainer of what Thinking Machines Lab actually does.",
};

export default function TML101Page() {
  return (
    <main className="min-h-screen bg-[#fafafa]">
      <div className="max-w-[640px] mx-auto px-6 py-16 md:py-24">
        {/* Breadcrumb */}
        <div className="mb-10">
          <a
            href="/"
            className="text-xs text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            &larr; schlacter.me
          </a>
        </div>

        {/* Header */}
        <div className="mb-12">
          <p className="text-xs font-mono text-neutral-400 tracking-widest uppercase mb-4">
            TML 101
          </p>
          <h1 className="text-2xl md:text-3xl font-semibold text-neutral-900 leading-tight tracking-tight">
            A plain-language explainer of Thinking Machines Lab
          </h1>
          <p className="text-base text-neutral-500 mt-2 leading-relaxed">
            When Tinker launched, I didn&apos;t fully understand what fine-tuning was,
            or how Thinking Machines was different from the AI companies I already
            knew. So I used Claude to build myself a first-grade-level explainer.
            Sharing it here in case it&apos;s useful to anyone else trying to get up
            to speed.
          </p>
        </div>

        {/* What they build — 1st grade */}
        <section className="mb-10">
          <p className="text-xs font-mono text-neutral-400 tracking-widest uppercase mb-3">
            What they build — the first-grade version
          </p>
          <p className="text-[15px] text-neutral-700 leading-relaxed">
            Imagine you&apos;re teaching a dog tricks. You have a smart dog (that&apos;s
            an AI model like Llama or Claude). The dog already knows how to sit,
            shake, and fetch. But you want it to also learn to find truffles in
            the forest.
          </p>
          <p className="text-[15px] text-neutral-700 leading-relaxed mt-4">
            You have a bag of truffles to practice with (your dataset) and a
            method: hide the truffle, let the dog sniff, reward when it finds it
            (your training script).
          </p>
          <p className="text-[15px] text-neutral-700 leading-relaxed mt-4">
            The problem: your backyard is too small. Truffle-finding training
            needs a huge forest, professional tracking equipment, and weeks of
            supervised practice runs.
          </p>
          <p className="text-[15px] text-neutral-700 leading-relaxed mt-4">
            <strong className="text-neutral-900">Option A (AWS / Google Cloud):</strong>{" "}
            Rent a forest, buy the equipment, hire handlers to manage it all
            yourself. Expensive, complicated, takes months to set up.
          </p>
          <p className="text-[15px] text-neutral-700 leading-relaxed mt-4">
            <strong className="text-neutral-900">Option B (Tinker):</strong> Send
            your dog to a specialized training facility. You tell them &ldquo;here&apos;s
            my dog, here&apos;s my truffles, here&apos;s my method.&rdquo; They have the
            forest, the equipment, and the handlers already. They run your exact
            method, and send back a truffle-finding dog.
          </p>
          <p className="text-[15px] text-neutral-700 leading-relaxed mt-4">
            The dog that comes back is <em>your</em> dog. You own it. The facility
            just provided the space and equipment to train it.
          </p>
          <p className="text-[15px] text-neutral-900 leading-relaxed mt-4 font-medium">
            That&apos;s Tinker&apos;s whole value prop: you shouldn&apos;t need to build a
            training facility just to teach one dog one trick.
          </p>
        </section>

        {/* Technical version */}
        <section className="mb-10">
          <p className="text-xs font-mono text-neutral-400 tracking-widest uppercase mb-3">
            What they build — the technical version
          </p>
          <p className="text-[15px] text-neutral-700 leading-relaxed">
            Tinker is a fine-tuning API — a &ldquo;training API for everyone.&rdquo;
          </p>
          <p className="text-[15px] text-neutral-700 leading-relaxed mt-4">
            Fine-tuning means taking an existing AI model (like Llama from Meta)
            and training it further on your specific data so it becomes an expert
            at your specific thing. Like teaching a general-purpose chef to
            specialize in your restaurant&apos;s menu.
          </p>
          <p className="text-[15px] text-neutral-700 leading-relaxed mt-4">How it works:</p>
          <ol className="text-[15px] text-neutral-700 leading-relaxed mt-2 space-y-1 list-decimal list-inside">
            <li>Developer writes a training script in Python on their laptop.</li>
            <li>Developer sends the script + their data to Tinker via API.</li>
            <li>
              Tinker runs the training across its massive GPU cluster (hundreds
              of machines in parallel).
            </li>
            <li>
              Developer gets back a fine-tuned model that&apos;s now specialized for
              their use case.
            </li>
          </ol>
          <p className="text-[15px] text-neutral-700 leading-relaxed mt-4">
            Tinker supports multiple training methods (SFT, DPO, RL, distillation),
            multiple open-source models (Llama, Qwen, DeepSeek), vision models,
            reasoning models, LoRA, and model sizes from 1B to 1T+ parameters.
          </p>
        </section>

        {/* GPU layer */}
        <section className="mb-10">
          <p className="text-xs font-mono text-neutral-400 tracking-widest uppercase mb-3">
            The GPU and infrastructure layer
          </p>
          <p className="text-[15px] text-neutral-700 leading-relaxed">
            <strong className="text-neutral-900">What GPUs are.</strong>{" "}
            Physically: green circuit boards about the size of a textbook, made
            by NVIDIA. The newest ones cost ~$30&ndash;40K each. They sit in
            server racks &mdash; big metal shelves in rows, connected by cables,
            in massive air-conditioned data centers. Think: a windowless building
            the size of a Costco, humming with fans, filled with rows of racks.
          </p>
          <p className="text-[15px] text-neutral-700 leading-relaxed mt-4">
            <strong className="text-neutral-900">NVIDIA&apos;s role.</strong>{" "}
            NVIDIA makes the chips. That&apos;s it. They&apos;re the supplier &mdash; the
            company that manufactures the gym equipment. TML is the gym operator.
            The NVIDIA partnership means TML got a massive guaranteed supply of
            the newest chips (one gigawatt of compute &mdash; roughly the output of
            a nuclear power plant), which matters because there&apos;s a global GPU
            shortage.
          </p>
          <p className="text-[15px] text-neutral-700 leading-relaxed mt-4">
            <strong className="text-neutral-900">TML&apos;s orchestration layer.</strong>{" "}
            This is the core of what TML actually built &mdash; the software between
            the raw NVIDIA chips and the customer&apos;s training job.
          </p>
          <p className="text-[15px] text-neutral-700 leading-relaxed mt-4">
            Example: a healthcare company sends Tinker a job &mdash; &ldquo;here&apos;s 50,000
            radiology reports, here&apos;s my training script, fine-tune Llama for me.&rdquo;
            The model is massive. It doesn&apos;t fit on one GPU. It&apos;s like fitting an
            elephant into a sedan &mdash; you need to split it across 200 sedans
            driving in formation. Step by step, the orchestration layer:
          </p>
          <ol className="text-[15px] text-neutral-700 leading-relaxed mt-3 space-y-3 list-decimal list-inside">
            <li>
              <strong className="text-neutral-900">Splits the work.</strong>{" "}
              Divides the model across ~200 GPUs. Some hold the &ldquo;head,&rdquo;
              others the &ldquo;body,&rdquo; others the &ldquo;legs.&rdquo; They all talk to each
              other constantly.
            </li>
            <li>
              <strong className="text-neutral-900">Splits the data.</strong>{" "}
              Takes 50,000 radiology reports and divides them into batches.
              Cluster A works on reports 1&ndash;250 while cluster B works on
              251&ndash;500. Simultaneously.
            </li>
            <li>
              <strong className="text-neutral-900">Keeps everything in sync.</strong>{" "}
              After each batch, every GPU shares what it learned with every
              other GPU. They merge learnings and go again. Coordinating this
              across 200 machines without bottlenecks is extremely hard.
            </li>
            <li>
              <strong className="text-neutral-900">Handles failures.</strong>{" "}
              GPU #47 crashes at 3am. The orchestration layer notices, saves
              progress, reassigns work to another GPU, keeps going. Without
              this, one crash means starting over &mdash; losing days and
              thousands of dollars.
            </li>
            <li>
              <strong className="text-neutral-900">Manages the queue.</strong>{" "}
              While the healthcare job runs, a finance company submits a job
              too. The layer schedules it, finds available GPUs, runs both
              without interference.
            </li>
            <li>
              <strong className="text-neutral-900">Saves checkpoints.</strong>{" "}
              Periodically snapshots the model&apos;s progress. If anything goes
              wrong, restart from last checkpoint &mdash; like auto-save in a
              video game.
            </li>
          </ol>
          <p className="text-[15px] text-neutral-700 leading-relaxed mt-4">
            The developer never sees any of this. They wrote a Python script on
            their laptop. Tinker made it feel like it ran locally. Behind the
            scenes: 200 GPUs coordinating for hours.
          </p>
        </section>

        {/* How fine-tuning is different */}
        <section className="mb-10">
          <p className="text-xs font-mono text-neutral-400 tracking-widest uppercase mb-3">
            How is fine-tuning different from other things?
          </p>
          <p className="text-[15px] text-neutral-700 leading-relaxed">
            <strong className="text-neutral-900">Fine-tuning vs. MCP / connectors.</strong>{" "}
            Completely different universe. An MCP connector gives an existing
            model access to your data at the moment you ask a question &mdash;
            like handing someone a reference book while they answer. Fine-tuning
            actually changes the model&apos;s brain permanently. Knowledge gets
            baked in. Difference between giving a doctor a textbook vs. sending
            them to medical school.
          </p>
          <p className="text-[15px] text-neutral-700 leading-relaxed mt-4">
            <strong className="text-neutral-900">
              Fine-tuning vs. using OpenAI&apos;s API as-is.
            </strong>{" "}
            OpenAI gives you their model, general purpose, their rules.
            Fine-tuning with Tinker means you own the model, control what it
            learned, run it wherever you want. Companies care for privacy, cost,
            and control reasons.
          </p>
          <p className="text-[15px] text-neutral-700 leading-relaxed mt-4">
            <strong className="text-neutral-900">
              Tinker vs. doing it yourself (like Walmart).
            </strong>{" "}
            Big companies have dedicated GPU clusters, MLOps teams, and internal
            platforms. They can run training themselves. A 50-person startup
            with 3 ML engineers can&apos;t &mdash; they&apos;d need months of
            infrastructure setup before even starting training. Tinker says: skip
            all of that.
          </p>
          <p className="text-[15px] text-neutral-700 leading-relaxed mt-4">
            <strong className="text-neutral-900">
              Tinker vs. AWS / Google Cloud.
            </strong>{" "}
            Amazon gives you raw machines and says &ldquo;figure it out.&rdquo; Tinker
            says &ldquo;just send us the script.&rdquo; The orchestration (the six steps
            above) is what you&apos;re paying for.
          </p>
        </section>

        {/* How they make money */}
        <section className="mb-10">
          <p className="text-xs font-mono text-neutral-400 tracking-widest uppercase mb-3">
            How they make money
          </p>
          <p className="text-[15px] text-neutral-700 leading-relaxed">
            Usage-based pricing. You pay for compute time your training job uses
            &mdash; a gym membership meets AWS billing. While your job rests
            between steps, someone else&apos;s job uses those GPUs. TML packs
            hundreds of customers onto the same cluster, so your $500 job runs
            on GPUs that would cost $50,000 to own. They make margin on the
            spread.
          </p>
        </section>

        {/* Who uses it */}
        <section className="mb-10">
          <p className="text-xs font-mono text-neutral-400 tracking-widest uppercase mb-3">
            Who uses Tinker today
          </p>
          <p className="text-[15px] text-neutral-700 leading-relaxed">
            Primary user: ML engineers and researchers at companies who want
            custom AI models but don&apos;t want to build GPU infrastructure.
          </p>
          <p className="text-[15px] text-neutral-700 leading-relaxed mt-4">
            <em>Not</em> PMs, business users, or non-technical people. This is a
            deeply technical developer tool today.
          </p>
          <p className="text-[15px] text-neutral-700 leading-relaxed mt-4">
            A third-party ecosystem is already building on top: NousResearch
            (tinker-atropos), tuner-ui (a full-stack web platform with chat
            testing and HuggingFace deployment), and open-tinker (an open-source
            re-implementation for self-hosting).
          </p>
        </section>

        {/* Their public narrative */}
        <section className="mb-10">
          <p className="text-xs font-mono text-neutral-400 tracking-widest uppercase mb-3">
            Their public narrative
          </p>
          <p className="text-[15px] text-neutral-700 leading-relaxed">
            What they say: &ldquo;We&apos;re building the infrastructure that lets anyone
            adapt frontier AI to their needs.&rdquo; Developer-first, open-source
            credibility, not positioning as an OpenAI competitor &mdash; a
            platform/infrastructure play.
          </p>
          <p className="text-[15px] text-neutral-700 leading-relaxed mt-4">
            What they emphasize: &ldquo;training API for everyone,&rdquo; open science
            (their research blog is called Connectionism), developer community
            (the Tinker Cookbook on GitHub, detailed docs), and scale (NVIDIA
            partnership, gigawatt compute).
          </p>
          <p className="text-[15px] text-neutral-700 leading-relaxed mt-4">
            What they don&apos;t emphasize: they&apos;re not leading with frontier model
            releases, they&apos;re not positioning as an OpenAI competitor, and they&apos;re
            not heavy on LinkedIn marketing &mdash; their energy is in technical
            blogs, GitHub, and developer engagement.
          </p>
        </section>

        {/* Key links */}
        <section className="mb-12 p-5 bg-neutral-100 rounded-lg">
          <p className="text-xs font-mono text-neutral-400 tracking-widest uppercase mb-3">
            Key links
          </p>
          <ul className="text-[15px] text-neutral-700 leading-relaxed space-y-1.5">
            <li>
              Website:{" "}
              <a
                href="https://thinkingmachines.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-neutral-900"
              >
                thinkingmachines.ai
              </a>
            </li>
            <li>
              Tinker product:{" "}
              <a
                href="https://thinkingmachines.ai/tinker"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-neutral-900"
              >
                thinkingmachines.ai/tinker
              </a>
            </li>
            <li>
              Tinker docs:{" "}
              <a
                href="https://tinker-docs.thinkingmachines.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-neutral-900"
              >
                tinker-docs.thinkingmachines.ai
              </a>
            </li>
            <li>
              API console:{" "}
              <a
                href="https://tinker-console.thinkingmachines.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-neutral-900"
              >
                tinker-console.thinkingmachines.ai
              </a>
            </li>
            <li>
              SDK on GitHub:{" "}
              <a
                href="https://github.com/thinking-machines-lab/tinker"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-neutral-900"
              >
                github.com/thinking-machines-lab/tinker
              </a>
            </li>
            <li>
              Tinker Cookbook:{" "}
              <a
                href="https://github.com/thinking-machines-lab/tinker-cookbook"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-neutral-900"
              >
                github.com/thinking-machines-lab/tinker-cookbook
              </a>
            </li>
            <li>
              Research blog:{" "}
              <a
                href="https://connectionism.thinkingmachines.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-neutral-900"
              >
                connectionism.thinkingmachines.ai
              </a>
            </li>
          </ul>
        </section>

        {/* Footer */}
        <footer className="border-t border-neutral-200 pt-8">
          <p className="text-sm text-neutral-900 font-medium">Hannah Schlacter</p>
          <p className="text-xs text-neutral-400">April 2026</p>
        </footer>
      </div>
    </main>
  );
}
