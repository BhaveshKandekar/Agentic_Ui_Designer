import { Navbar } from "@/components/navbar";
import { Sparkles, TerminalSquare, LayoutTemplate, MousePointerClick } from "lucide-react";

export default function HowItWorks() {
  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-[#030303] relative overflow-hidden">
      <Navbar />
      {/* Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none mix-blend-screen animate-pulse duration-[10000ms]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-500/10 dark:bg-cyan-500/15 rounded-full blur-[120px] pointer-events-none mix-blend-screen animate-pulse duration-[12000ms]"></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
      <div className="absolute inset-0 bg-zinc-50/50 dark:bg-[#030303]/50 pointer-events-none" style={{ maskImage: 'radial-gradient(ellipse at center, transparent 20%, black 80%)' }}></div>
      
      <main className="flex-1 container max-w-4xl mx-auto px-4 py-16 lg:py-24 relative z-10">
        <div className="space-y-4 mb-16 text-center">
          <div className="inline-flex items-center rounded-full border border-zinc-200/50 dark:border-zinc-800/80 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md px-4 py-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 shadow-sm">
             <Sparkles className="w-4 h-4 mr-2 text-indigo-500 dark:text-indigo-400" />
             Documentation
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter text-zinc-900 dark:text-white">
            How Brahmastra Works
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto text-lg">
            Everything you need to know to generate stunning UI components instantly using our AI system.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white/80 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/80 backdrop-blur-xl p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
             <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-6 border border-indigo-500/20">
                <TerminalSquare className="w-6 h-6 text-indigo-500" />
             </div>
             <h3 className="text-xl font-bold mb-3 text-zinc-900 dark:text-zinc-50 tracking-tight">1. Multi-Agent AI</h3>
             <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
               When you enter a prompt, the system routes your request to specialized AI agents powered by Gemini. These agents concurrently generate 10 distinct design permutations focusing on layout, utility classes, and React structure.
             </p>
          </div>
          <div className="bg-white/80 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/80 backdrop-blur-xl p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
             <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center mb-6 border border-cyan-500/20">
                <LayoutTemplate className="w-6 h-6 text-cyan-500" />
             </div>
             <h3 className="text-xl font-bold mb-3 text-zinc-900 dark:text-zinc-50 tracking-tight">2. Tailwind v4 Architecture</h3>
             <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
               All components are generated using Tailwind CSS directly inline. You receive both raw HTML (for instant previewing) and JSX React Code so you can drop the components right into your Next.js/React applications seamlessly.
             </p>
          </div>
        </div>

        <div className="bg-white/80 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/80 backdrop-blur-xl p-8 lg:p-12 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-10">
           <div className="flex items-center gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
              <MousePointerClick className="w-7 h-7 text-indigo-500" />
              <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Best Prompting Strategies</h2>
           </div>
           
           <div className="space-y-8">
             <div className="space-y-2">
                <h4 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Be Specific About the Component</h4>
                <p className="text-zinc-600 dark:text-zinc-400 text-base leading-relaxed">Instead of saying <span className="text-zinc-400 dark:text-zinc-500">"make a navbar"</span>, try: <br/><i className="text-zinc-900 dark:text-zinc-300 font-medium">"Create a sleek SaaS sticky navbar with a glassmorphism effect, a dark theme logo, and 'Login' alongside 'Sign Up' action buttons."</i></p>
             </div>
             <div className="space-y-2">
                <h4 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Mention Design Aesthetics</h4>
                <p className="text-zinc-600 dark:text-zinc-400 text-base leading-relaxed">You can guide the agents by specifying keywords such as <b className="text-zinc-900 dark:text-zinc-300 font-semibold">minimalist, brutalist, high-contrast, neomorphic, or vibrant gradients</b>.</p>
             </div>
             <div className="space-y-2">
                <h4 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Include Functional Requirements</h4>
                <p className="text-zinc-600 dark:text-zinc-400 text-base leading-relaxed">If you need forms or interactive states, specify them: <br/><i className="text-zinc-900 dark:text-zinc-300 font-medium">"Build a login form with floating labels, hover effects on the submit button, and a refined focus ring."</i></p>
             </div>
           </div>

           <div className="mt-8 p-6 bg-zinc-100/50 dark:bg-[#030303]/80 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-inner">
             <p className="text-sm md:text-base font-mono leading-relaxed text-zinc-600 dark:text-zinc-400">
               <span className="font-bold uppercase tracking-widest text-xs text-zinc-500 block mb-2">Example Prompt</span>
               <span className="text-indigo-600 dark:text-indigo-400">"A beautiful pricing section featuring 3 dark-themed cards. The middle card should be highlighted with a glowing purple 1px border. Add a badge saying 'Most Popular'."</span>
             </p>
           </div>
        </div>
      </main>
    </div>
  );
}
