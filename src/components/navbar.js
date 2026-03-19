"use client"
import { useTheme } from "next-themes"
import { Moon, Sun, Wand2 } from "lucide-react"
import { Button } from "./ui/button"

export function Navbar() {
  const { setTheme, theme } = useTheme()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center px-4 mx-auto md:px-8 justify-between">
        <div className="flex items-center gap-2">
          <Wand2 className="h-6 w-6 text-primary" />
          <span className="font-bold sm:inline-block hidden">Agentic UI</span>
        </div>
        
        <div className="flex items-center justify-end gap-2">
          <nav className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              suppressHydrationWarning
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  )
}
