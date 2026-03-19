"use client"
import React, { useState } from 'react'
import { Wand2, Sparkles, Code2, Layout, Save, Download, Play, ArrowLeft } from 'lucide-react'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'
import { cn } from '@/lib/utils'

const SUGGESTIONS = [
  "modern SaaS pricing section with 3 glowing tiers and a dark glassmorphism theme",
  "vibrant hero section with an email capture form and floating aesthetic elements",
  "minimalist developer portfolio header with sleek navigation and social links",
  "complex analytics dashboard sidebar with colorful UI icons",
  "premium testimonial masonry grid with user avatars and gold star ratings",
  "high-end e-commerce product display card with a beautiful 'Add to Cart' button",
  "animated FAQ accordion section with a clean, high-contrast light mode style",
  "futuristic footer featuring a newsletter signup and scattered glowing neon orbs",
  "interactive contact form card with floating input labels and soft drop shadows"
];

export function MainUI() {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  
  // generatedData contains { variations: [...] }
  const [generatedData, setGeneratedData] = useState(null);
  
  // selectedComponent holds the index of the variation currently being edited/previewed
  const [selectedComponent, setSelectedComponent] = useState(null);
  
  const [activeTab, setActiveTab] = useState("preview");
  const [codeTab, setCodeTab] = useState("html");

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });
      const data = await res.json();
      if (data.error || !data.variations) {
        throw new Error(data.error || "The AI generated an incomplete or invalid response.");
      }
      setGeneratedData(data);
      setSelectedComponent(null); // Show the grid by default
    } catch (err) {
      console.error(err);
      alert(err.message || "Agent Pipeline Error: The design took too long to generate. Please try a simpler prompt.");
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
  <body class="bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-50 flex items-center justify-center min-h-screen">
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

  // 1. Initial Hero State
  if (!generatedData) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] px-4 py-12 md:px-8 bg-gradient-to-b from-background to-background/80">
        <div className="w-full max-w-3xl flex flex-col items-center text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="space-y-4">
            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-secondary text-secondary-foreground">
              <Sparkles className="w-4 h-4 mr-1 text-primary" />
              Agentic Component Generator
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
              Design UI Components with <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">AI Agents</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Request a component (like a header or pricing card), and receive multiple premium design variations instantly.
            </p>
          </div>

          <div className="w-full relative max-w-2xl shadow-xl shadow-primary/5 rounded-xl">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-purple-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
            <div className="relative bg-card border rounded-xl flex flex-col">
              <Textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. 'A modern pricing section with 3 tiers'"
                className="min-h-[120px] text-lg resize-none border-0 focus-visible:ring-0 p-6 bg-transparent"
              />
              <div className="p-4 border-t bg-muted/30 flex items-center justify-between rounded-b-xl">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Play className="w-3 h-3" /> Press Start to summon agents
                </p>
                <Button size="lg" onClick={handleGenerate} disabled={!prompt.trim() || isGenerating} className="gap-2 shadow-lg hover:shadow-primary/25">
                  {isGenerating ? <div className="h-4 w-4 rounded-full border-2 border-primary-foreground border-r-transparent animate-spin"/> : <Wand2 className="w-5 h-5" />}
                  {isGenerating ? 'Designing...' : 'Generate Components'}
                </Button>
              </div>
            </div>
          </div>

          <div className="w-full max-w-2xl pt-4">
            <p className="text-sm text-muted-foreground mb-4 font-medium uppercase tracking-wider text-left">Try a suggestion</p>
            <div className="flex flex-wrap gap-2 justify-start">
              {SUGGESTIONS.map(s => (
                <button key={s} onClick={() => setPrompt(s)} className="text-xs px-3 py-1.5 rounded-full border bg-background hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    )
  }

  // 2. Grid State
  if (selectedComponent === null) {
    return (
      <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] overflow-y-auto bg-muted/10 p-6">
        <div className="max-w-7xl mx-auto w-full space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">Generated Variations</h2>
            <Button onClick={() => setGeneratedData(null)} variant="outline">New Component Request</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {generatedData.variations.map((comp, idx) => (
              <div 
                key={comp.id || idx} 
                className="group border rounded-xl bg-card overflow-hidden shadow-sm hover:shadow-xl hover:border-primary/50 transition-all cursor-pointer flex flex-col h-[400px]"
                onClick={() => { setSelectedComponent(idx); setActiveTab('preview'); }}
              >
                <div className="p-4 border-b bg-muted/30 flex justify-between items-center">
                  <h3 className="font-semibold">{comp.title}</h3>
                  <Button size="sm" variant="secondary" className="scale-90 group-hover:scale-100 transition-transform">Select & Edit</Button>
                </div>
                <div className="flex-1 w-full bg-white dark:bg-gray-950 relative pointer-events-none">
                  <iframe 
                    className="w-full h-full absolute inset-0"
                    srcDoc={`
                      <html>
                        <head><script src="https://cdn.tailwindcss.com"></script><style>${comp.css || ''}</style></head>
                        <body class="bg-transparent flex items-center justify-center h-screen m-0 p-4">
                          <div class="transform scale-75 origin-center w-full max-w-3xl">
                             ${comp.html}
                          </div>
                        </body>
                      </html>
                    `}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // 3. Detail / Editor State
  const comp = generatedData.variations[selectedComponent];

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/20">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => setSelectedComponent(null)} className="text-muted-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Grid
          </Button>
          <div className="w-px h-6 bg-border mx-2" />
          <h2 className="font-semibold text-sm hidden sm:block">{comp.title}</h2>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex bg-muted rounded-md p-1 mr-4">
            <Button variant={activeTab === 'preview' ? 'default' : 'ghost'} size="sm" onClick={() => setActiveTab('preview')} className="h-7 text-xs">
              <Layout className="w-3.5 h-3.5 mr-1.5" /> Preview
            </Button>
            <Button variant={activeTab === 'code' ? 'default' : 'ghost'} size="sm" onClick={() => setActiveTab('code')} className="h-7 text-xs">
              <Code2 className="w-3.5 h-3.5 mr-1.5" /> Code
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={() => alert("Component saved to 'My Designs'!")}>
            <Save className="w-4 h-4 mr-2" /> Save
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
         {activeTab === 'preview' ? (
           <div className="flex-1 bg-background flex flex-col">
              <div className="flex-1 w-full flex items-center justify-center p-8 bg-dot-pattern overflow-auto">
                 <div className="w-full max-w-[1200px] min-h-[500px] bg-background border rounded-xl shadow-2xl overflow-hidden relative resize-y">
                    <iframe 
                      className="w-full h-full min-h-[500px] text-black" 
                      srcDoc={`
                        <html>
                          <head>
                            <script src="https://cdn.tailwindcss.com"></script>
                            <style>${comp.css || ''}</style>
                          </head>
                          <body class="bg-white dark:bg-gray-950 flex flex-col items-center justify-center min-h-screen p-8">
                            ${comp.html}
                            <script>${comp.js || ''}</script>
                          </body>
                        </html>
                      `}
                    />
                 </div>
              </div>
           </div>
         ) : (
           <div className="flex-1 bg-zinc-950 text-zinc-50 flex flex-col overflow-hidden font-mono text-sm leading-relaxed">
             <div className="flex items-center gap-1 border-b border-zinc-800 p-2">
               {['html', 'css', 'js'].map(tab => (
                 <button 
                  key={tab}
                  onClick={() => setCodeTab(tab)} 
                  className={cn("px-4 py-1.5 rounded-md transition-colors uppercase text-xs font-semibold tracking-wider", codeTab === tab ? "bg-zinc-800 text-white" : "text-zinc-400 hover:bg-zinc-900 border border-transparent hover:border-zinc-800")}>
                    {tab}
                 </button>
               ))}
             </div>
             <div className="flex-1 p-6 overflow-auto">
               <textarea 
                  className="w-full h-full bg-transparent text-blue-300 resize-none outline-none font-mono selection:bg-blue-900 leading-relaxed" 
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
