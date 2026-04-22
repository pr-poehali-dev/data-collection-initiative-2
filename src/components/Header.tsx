import { ChevronDown, ShoppingCart, Crown, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/context/CartContext"
import { useUser } from "@/context/UserContext"
import { useNavigate } from "react-router-dom"

export function Header() {
  const { count, setIsOpen } = useCart()
  const { isLoggedIn, subscription } = useUser()
  const navigate = useNavigate()
  const hasSubscription = subscription !== "none"

  return (
    <header className="flex items-center justify-between px-8 py-4">
      <button onClick={() => navigate("/")} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
        <PlugMarketLogo />
        <span className="text-lg font-semibold text-white">
          PlugMarket<sup className="text-xs">™</sup>
        </span>
      </button>

      <nav className="hidden md:flex items-center gap-8">
        <a href="#" className="text-sm text-gray-300 hover:text-white transition-colors">Каталог</a>
        <a href="#" className="text-sm text-gray-300 hover:text-white transition-colors flex items-center gap-1">
          Категории <ChevronDown className="h-4 w-4" />
        </a>
        <a href="#" className="text-sm text-gray-300 hover:text-white transition-colors">Товары</a>
        <a href="#" className="text-sm text-gray-300 hover:text-white transition-colors">Тарифы</a>
        <a href="#" className="text-sm text-gray-300 hover:text-white transition-colors">Поддержка</a>
      </nav>

      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsOpen(true)}
          className="relative flex items-center justify-center h-9 w-9 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] text-gray-400 hover:text-orange-400 hover:border-orange-500/40 transition-colors"
        >
          <ShoppingCart className="h-4 w-4" />
          {count > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-orange-500 text-[#0a0a0a] text-xs font-bold flex items-center justify-center">
              {count}
            </span>
          )}
        </button>

        <button
          onClick={() => navigate("/dashboard")}
          className="relative flex items-center justify-center h-9 w-9 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] text-gray-400 hover:text-orange-400 hover:border-orange-500/40 transition-colors"
        >
          <User className="h-4 w-4" />
          {hasSubscription && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-orange-500 flex items-center justify-center">
              <Crown className="h-2.5 w-2.5 text-white" />
            </span>
          )}
        </button>

        <Button
          variant="outline"
          onClick={() => navigate("/dashboard")}
          className="rounded-full border-orange-500 text-orange-400 hover:bg-orange-500/10 hover:text-orange-300 bg-transparent"
        >
          {isLoggedIn ? "Кабинет" : "Войти"}
        </Button>
      </div>
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
