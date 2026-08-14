"use client"
import React, { useState } from 'react'
import { Sparkles, Code2, Layout, Save, Download, ArrowLeft, ArrowRight, ArrowUp, Loader2 } from 'lucide-react'
import { Button } from './ui/button'
import { cn } from '@/lib/utils'

const SUGGESTIONS = [
  "A minimalist SaaS pricing section with 3 tiers",
  "A sleek dashboard sidebar navigation",
  "An elegant e-commerce product card",
  "A clean testimonials masonry grid",
  "A high-conversion landing page hero"
];

export function MainUI() {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedData, setGeneratedData] = useState(null);
  const [rejection, setRejection] = useState(null);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [activeTab, setActiveTab] = useState("preview");
  const [codeTab, setCodeTab] = useState("reactCode");

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setRejection(null);
    
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });
      const data = await res.json();
      
      if (data.rejected) {
         setRejection(data);
         return;
      }
      
      if (data.error || !data.variations) {
        const errorMsg = data.details ? `${data.error} (${data.details})` : (data.error || "The AI generated an incomplete response.");
        throw new Error(errorMsg);
      }
      setGeneratedData(data);
      setSelectedComponent(null);
    } catch (err) {
      console.error(err);
      alert(err.message || "Agent Pipeline Error: Please try a simpler prompt.");
    } finally {
      setIsGenerating(false);
    }
  }

  const handleCodeChange = (e) => {
    if (selectedComponent === null) return;
    const newVars = [...generatedData.variations];
    newVars[selectedComponent] = {
      ...newVars[selectedComponent],
      [codeTab]: e.target.value
    };
    setGeneratedData({ ...generatedData, variations: newVars });
  }

  const handleDownload = () => {
    if (selectedComponent === null || !generatedData) return;
    const comp = generatedData.variations[selectedComponent];
    const blob = new Blob([`<!DOCTYPE html>
<html>
  <head>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>${comp.css || ''}</style>
  </head>
  <body class="bg-white dark:bg-black text-black dark:text-white flex items-center justify-center min-h-screen">
    ${comp.html}
    <script>${comp.js || ''}</script>
  </body>
</html>`], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${comp.title.replace(/\\s+/g, '-').toLowerCase()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // 1. Initial Hero State (Modern + Startup Premium)
  if (!generatedData) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] px-4 py-20 bg-zinc-50 dark:bg-[#030303] relative overflow-hidden">
        {/* Soft Ambient Mesh Gradients */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none mix-blend-screen animate-pulse duration-10000"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-500/10 dark:bg-cyan-500/15 rounded-full blur-[120px] pointer-events-none mix-blend-screen animate-pulse duration-12000"></div>
        
        {/* Subtle dot grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px] pointer-events-none"></div>
        <div className="absolute inset-0 bg-zinc-50/50 dark:bg-[#030303]/50 pointer-events-none" style={{ maskImage: 'radial-gradient(ellipse at center, transparent 20%, black 80%)' }}></div>

        <div className="w-full max-w-4xl flex flex-col items-center text-center space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000 relative z-10">
          <div className="space-y-6 flex flex-col items-center px-4">
            <div className="inline-flex items-center rounded-full border border-zinc-200/50 dark:border-zinc-800/80 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md px-4 py-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 shadow-sm">
              <Sparkles className="w-4 h-4 mr-2 text-indigo-500 dark:text-indigo-400" />
              Brahmastra - UI/UX Design
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-8xl font-bold tracking-tighter text-zinc-900 dark:text-white drop-shadow-sm">
              Generate UI, <br className="hidden md:block"/>
              <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-500 via-purple-500 to-cyan-400">instantly.</span>
            </h1>
            <p className="text-lg md:text-2xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto font-medium leading-relaxed">
              Describe the component you need. Receive stunning, beautifully crafted React code in seconds.
            </p>
          </div>

          <div className="w-full relative max-w-3xl mt-8 group">
             {/* Glowing border effect behind input */}
             <div className="absolute -inset-0.5 bg-linear-to-r from-indigo-500 to-cyan-500 rounded-3xl blur opacity-20 group-focus-within:opacity-40 transition duration-1000"></div>
             
             <div className="relative bg-white/80 dark:bg-zinc-950/80 backdrop-blur-2xl border border-zinc-200 dark:border-zinc-800/80 shadow-2xl rounded-2xl flex flex-col overflow-hidden transition-all focus-within:ring-1 focus-within:ring-zinc-400 dark:focus-within:ring-zinc-600">
               <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Build a pricing section with glassmorphism..."
                  className="w-full min-h-35 text-lg lg:text-xl placeholder:text-zinc-400 dark:placeholder:text-zinc-600 resize-none border-0 outline-none p-6 bg-transparent text-zinc-900 dark:text-zinc-50"
                  spellCheck={false}
               />
               <div className="p-3 bg-zinc-50/50 dark:bg-zinc-900/30 backdrop-blur-md flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800/50">
                  <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 uppercase tracking-widest px-2">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                    Powered by AI
                  </div>
                  <button 
                    onClick={handleGenerate} 
                    disabled={!prompt.trim() || isGenerating}
                    className="flex items-center justify-center gap-2 bg-linear-to-b from-zinc-800 to-zinc-950 dark:from-zinc-100 dark:to-zinc-300 text-white dark:text-black hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all rounded-xl px-6 py-2.5 text-sm font-bold shadow-md hover:shadow-lg"
                  >
                    {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowUp className="w-4 h-4" />}
                    {isGenerating ? 'Agents Thinking...' : 'Generate Code'}
                  </button>
               </div>
             </div>

             {rejection && (
               <div className="absolute top-[105%] left-0 right-0 p-6 bg-red-50/95 dark:bg-red-950/50 backdrop-blur-xl border border-red-200 dark:border-red-900/50 rounded-2xl text-left animate-in zoom-in-95 slide-in-from-top-4 duration-300 shadow-xl z-20">
                 <div className="flex items-center gap-3 mb-2">
                   <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
                     <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                   </div>
                   <h3 className="text-red-800 dark:text-red-300 font-bold text-lg tracking-tight">Scope Restricted</h3>
                 </div>
                 <p className="text-red-600/90 dark:text-red-400/90 text-sm mb-5 font-medium leading-relaxed max-w-xl">{rejection.reason}</p>
                 <div className="p-4 bg-white/70 dark:bg-black/30 rounded-xl border border-red-100 dark:border-red-900/30">
                   <p className="text-xs font-bold uppercase tracking-widest text-red-800/70 dark:text-red-300/70 mb-3 flex items-center gap-2">
                       Try one of these UI components instead
                   </p>
                   <div className="flex flex-col gap-2.5">
                      {rejection.suggestions.map((s, i) => (
                        <button key={i} onClick={() => { setPrompt(s); setRejection(null); }} className="text-left text-sm text-zinc-700 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-zinc-900/50 p-2 -mx-2 rounded-lg transition-colors flex items-center gap-2 group font-medium">
                          <ArrowRight className="w-4 h-4 opacity-50 text-indigo-500 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                          <span>{s}</span>
                        </button>
                      ))}
                   </div>
                 </div>
               </div>
             )}
          </div>

          <div className="w-full max-w-3xl pt-8 flex flex-col items-center">
            <div className="flex flex-wrap gap-3 justify-center px-4">
              {SUGGESTIONS.map(s => (
                <button 
                  key={s} 
                  onClick={() => setPrompt(s)} 
                  className="text-xs md:text-sm px-5 py-2.5 rounded-full border border-zinc-200/80 dark:border-zinc-800/80 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-500/30 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    )
  }

  // 2. Grid State (Modern + Premium)
  if (selectedComponent === null) {
    return (
      <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] overflow-y-auto bg-zinc-50/50 dark:bg-[#050505] p-4 lg:p-8 relative">
        <div className="absolute top-0 inset-x-0 h-64 bg-linear-to-b from-indigo-500/5 to-transparent pointer-events-none"></div>
        <div className="max-w-7xl mx-auto w-full space-y-8 relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-2 bg-white/50 dark:bg-zinc-900/30 backdrop-blur-xl p-4 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/10 rounded-lg">
                <Sparkles className="w-5 h-5 text-indigo-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Component Variations</h2>
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{generatedData.variations.length} premium designs ready to use.</p>
              </div>
            </div>
            <Button onClick={() => setGeneratedData(null)} variant="outline" className="border-zinc-200 dark:border-zinc-800 bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-900 dark:text-zinc-50 text-sm font-semibold shadow-sm rounded-xl">
              <ArrowLeft className="w-4 h-4 mr-2" /> New Request
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {generatedData.variations.map((comp, idx) => (
              <div 
                key={comp.id || idx} 
                className="group border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl bg-white dark:bg-zinc-950 overflow-hidden shadow-sm hover:shadow-xl hover:border-indigo-500/30 transition-all cursor-pointer flex flex-col h-100"
                onClick={() => { setSelectedComponent(idx); setActiveTab('preview'); }}
              >
                 <div className="flex-1 w-full bg-[#f8f9fa] dark:bg-[#0a0a0c] relative pointer-events-none overflow-hidden">
                  <iframe 
                    className="w-full h-full absolute inset-0 z-0 bg-transparent"
                    srcDoc={`
                      <html>
                        <head><script src="https://cdn.tailwindcss.com"></script><style>${comp.css || ''}</style></head>
                        <body class="bg-transparent flex items-start justify-center min-h-screen m-0 p-8 antialiased">
                          <div class="transform scale-75 origin-top w-full max-w-4xl hover:scale-100 transition-transform duration-700">
                             ${comp.html}
                          </div>
                        </body>
                      </html>
                    `}
                  />
                  <div className="absolute inset-0 z-20 bg-linear-to-b from-transparent to-black/5 dark:to-black/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                
                <div className="p-5 border-t border-zinc-100 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur flex justify-between items-center group-hover:bg-zinc-50 dark:group-hover:bg-zinc-900 transition-colors z-30">
                  <div className="space-y-1">
                     <p className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest opacity-80">Option {idx + 1}</p>
                     <h3 className="font-semibold text-base text-zinc-900 dark:text-zinc-50">{comp.title}</h3>
                  </div>
                  <Button size="sm" variant="secondary" className="rounded-lg scale-90 opacity-0 group-hover:opacity-100 group-hover:scale-100 transition-all font-semibold shadow-sm text-xs">
                    View Code
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // 3. Detail / Editor State (Modern + Premium)
  const comp = generatedData.variations[selectedComponent];

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden bg-white dark:bg-zinc-950">
      <div className="flex items-center justify-between px-6 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => setSelectedComponent(null)} className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 px-2 rounded-lg font-medium">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Grid
          </Button>
          <div className="w-px h-5 bg-zinc-200 dark:bg-zinc-800 hidden sm:block" />
          <h2 className="font-semibold text-sm text-zinc-900 dark:text-zinc-50 hidden sm:block">{comp.title}</h2>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex bg-zinc-200/50 dark:bg-zinc-800/50 rounded-lg p-1">
            <button 
               onClick={() => setActiveTab('preview')} 
               className={cn("px-4 py-1.5 text-xs font-semibold rounded-md transition-all", activeTab === 'preview' ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-sm" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300")}
            >
              Preview
            </button>
            <button 
               onClick={() => setActiveTab('code')} 
               className={cn("px-4 py-1.5 text-xs font-semibold rounded-md transition-all", activeTab === 'code' ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-sm" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300")}
            >
              Code
            </button>
          </div>
          <div className="w-px h-5 bg-zinc-200 dark:bg-zinc-800" />
          <Button variant="outline" size="sm" onClick={handleDownload} className="border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-xs font-semibold h-9 rounded-lg shadow-sm">
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
         {activeTab === 'preview' ? (
           <div className="flex-1 bg-zinc-50 dark:bg-[#050505] flex flex-col p-6 lg:p-12 overflow-auto relative">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px] pointer-events-none"></div>
              <div className="flex-1 w-full max-w-350 mx-auto min-h-125 bg-white dark:bg-[#0a0a0c] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] overflow-hidden relative z-10 transition-all">
                <iframe 
                  className="w-full h-full text-black" 
                  srcDoc={`
                    <html>
                      <head>
                        <script src="https://cdn.tailwindcss.com"></script>
                        <style>${comp.css || ''}</style>
                      </head>
                      <body class="bg-white dark:bg-[#0a0a0c] flex flex-col items-center justify-center min-h-screen p-8 antialiased">
                        ${comp.html}
                        <script>${comp.js || ''}</script>
                      </body>
                    </html>
                  `}
                />
              </div>
           </div>
         ) : (
           <div className="flex-1 bg-[#0a0a0c] text-zinc-50 flex flex-col overflow-hidden font-mono text-sm leading-relaxed">
             <div className="flex items-center gap-2 border-b border-zinc-800/50 bg-[#0f0f11] p-3 px-6">
               {['reactCode', 'html', 'css', 'js'].map(tab => (
                 <button 
                  key={tab}
                  onClick={() => setCodeTab(tab)} 
                  className={cn("px-4 py-1.5 rounded-lg transition-colors text-xs font-bold tracking-widest", codeTab === tab ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-sm" : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 border border-transparent")}>
                    {tab === 'reactCode' ? 'React' : tab.toUpperCase()}
                 </button>
               ))}
             </div>
             <div className="flex-1 p-6 lg:p-10 overflow-auto">
               <textarea 
                  className="w-full h-full bg-transparent text-indigo-100/90 resize-none outline-none font-mono selection:bg-indigo-500/30 focus:text-indigo-50 transition-colors" 
                  value={comp[codeTab] || ''} 
                  onChange={handleCodeChange}
                  spellCheck={false}
               />
             </div>
           </div>
         )}
      </div>
    </div>
  )
}
