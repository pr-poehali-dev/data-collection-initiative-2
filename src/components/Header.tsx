import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="flex items-center justify-between px-8 py-4">
      <div className="flex items-center gap-2">
        <PlugMarketLogo />
        <span className="text-lg font-semibold text-white">
          PlugMarket<sup className="text-xs">™</sup>
        </span>
      </div>

      <nav className="hidden md:flex items-center gap-8">
        <a href="#" className="text-sm text-gray-300 hover:text-white transition-colors">
          Каталог
        </a>
        <a href="#" className="text-sm text-gray-300 hover:text-white transition-colors flex items-center gap-1">
          Категории <ChevronDown className="h-4 w-4" />
        </a>
        <a href="#" className="text-sm text-gray-300 hover:text-white transition-colors">
          Товары
        </a>
        <a href="#" className="text-sm text-gray-300 hover:text-white transition-colors">
          Тарифы
        </a>
        <a href="#" className="text-sm text-gray-300 hover:text-white transition-colors">
          Поддержка
        </a>
      </nav>

      <Button
        variant="outline"
        className="rounded-full border-orange-500 text-orange-400 hover:bg-orange-500/10 hover:text-orange-300 bg-transparent"
      >
        Попробовать бесплатно
      </Button>
    </header>
  )
}

function PlugMarketLogo() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="8" cy="8" r="3" fill="#FF8C00" />
      <circle cx="16" cy="8" r="3" fill="#FFA500" opacity="0.7" />
      <circle cx="8" cy="16" r="3" fill="#FFD700" opacity="0.7" />
      <circle cx="16" cy="16" r="3" fill="#FF6600" opacity="0.5" />
    </svg>
  )
}