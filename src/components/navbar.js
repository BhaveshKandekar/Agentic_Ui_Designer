"use client"
import { useTheme } from "next-themes"
import { Moon, Sun, Wand2, Info } from "lucide-react"
import Link from "next/link"

export function Navbar() {
  const { setTheme, theme } = useTheme()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-black/80 backdrop-blur-md">
      <div className="container flex h-14 max-w-screen-2xl items-center px-4 mx-auto md:px-8 justify-between">
        <Link href="/" className="flex items-center gap-2 group cursor-pointer transition-opacity hover:opacity-80">
          <Wand2 className="h-5 w-5 text-zinc-900 dark:text-zinc-50" />
          <span className="font-semibold text-sm tracking-tight text-zinc-900 dark:text-zinc-50">
            Brahmastra Design
          </span>
        </Link>
        
        <div className="flex items-center justify-end gap-2 md:gap-4 text-zinc-600 dark:text-zinc-400">
          <nav className="flex items-center gap-1">
            <Link href="/how-it-works" className="hidden sm:flex items-center gap-2 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors text-sm font-medium px-3 py-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-900">
              <Info className="w-4 h-4" />
              <span>How it works</span>
            </Link>
            <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-800 mx-1 hidden sm:block"></div>
            <button
              className="p-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50"
              suppressHydrationWarning
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  )
}
