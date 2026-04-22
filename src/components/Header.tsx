import { useState } from "react"
import { ChevronDown, ShoppingCart, Crown, User, Bell, Sun, Moon, Shield, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/context/CartContext"
import { useUser } from "@/context/UserContext"
import { useNavigate } from "react-router-dom"

export function Header() {
  const { count, setIsOpen } = useCart()
  const { isLoggedIn, profile, subscription, notifications, markAllRead, theme, toggleTheme } = useUser()
  const navigate = useNavigate()
  const [showNotifs, setShowNotifs] = useState(false)
  const hasSubscription = subscription !== "none"
  const unread = notifications.filter((n) => !n.read).length

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-4 md:px-8 py-4 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-[#1a1a1a]">
      <button onClick={() => navigate("/")} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
        <PlugMarketLogo />
        <span className="text-lg font-semibold text-white">PlugMarket<sup className="text-xs">™</sup></span>
      </button>

      <nav className="hidden lg:flex items-center gap-8">
        {[
          { label: "Каталог", href: "#" },
          { label: "Тарифы", href: "#" },
          { label: "Поддержка", href: "#" },
        ].map(({ label, href }) => (
          <a key={label} href={href} className="text-sm text-gray-400 hover:text-white transition-colors">{label}</a>
        ))}
        {isLoggedIn && (
          <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1">
            Категории <ChevronDown className="h-3.5 w-3.5" />
          </a>
        )}
      </nav>

      <div className="flex items-center gap-2">
        {/* Тема */}
        <button
          onClick={toggleTheme}
          className="h-9 w-9 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center text-gray-400 hover:text-orange-400 hover:border-orange-500/40 transition-colors"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* Уведомления */}
        {isLoggedIn && (
          <div className="relative">
            <button
              onClick={() => { setShowNotifs(!showNotifs); if (unread > 0) markAllRead() }}
              className="relative h-9 w-9 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center text-gray-400 hover:text-orange-400 hover:border-orange-500/40 transition-colors"
            >
              <Bell className="h-4 w-4" />
              {unread > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-orange-500 text-[#0a0a0a] text-[10px] font-bold flex items-center justify-center">{unread}</span>
              )}
            </button>

            {showNotifs && (
              <div className="absolute right-0 top-11 w-80 rounded-2xl bg-[#141414] border border-[#262626] shadow-2xl z-50 animate-fade-up overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#262626]">
                  <span className="text-sm font-semibold text-white">Уведомления</span>
                  <button onClick={() => setShowNotifs(false)} className="text-gray-600 hover:text-white"><X className="h-4 w-4" /></button>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-center text-gray-600 text-sm py-6">Нет уведомлений</p>
                  ) : (
                    notifications.slice(0, 8).map((n) => (
                      <div key={n.id} className={`flex items-start gap-3 px-4 py-3 border-b border-[#1a1a1a] last:border-0 ${n.read ? "" : "bg-orange-500/5"}`}>
                        <span className="text-base mt-0.5">{n.type === "purchase" ? "🛒" : n.type === "review" ? "⭐" : n.type === "message" ? "💬" : "🔔"}</span>
                        <div>
                          <p className="text-xs text-gray-300">{n.text}</p>
                          <p className="text-[10px] text-gray-600 mt-0.5">{n.createdAt}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="px-4 py-2 border-t border-[#262626]">
                  <button onClick={() => { setShowNotifs(false); navigate("/profile") }} className="text-xs text-orange-400 hover:text-orange-300">Все уведомления →</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Корзина */}
        <button
          onClick={() => setIsOpen(true)}
          className="relative h-9 w-9 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center text-gray-400 hover:text-orange-400 hover:border-orange-500/40 transition-colors"
        >
          <ShoppingCart className="h-4 w-4" />
          {count > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-orange-500 text-[#0a0a0a] text-[10px] font-bold flex items-center justify-center">{count}</span>
          )}
        </button>

        {/* Аватар / кнопка */}
        {isLoggedIn && profile ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/profile")}
              className="relative"
            >
              <img src={profile.avatar} alt={profile.displayName} className="h-9 w-9 rounded-full border-2 border-[#2a2a2a] hover:border-orange-500/50 transition-colors" />
              {hasSubscription && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-orange-500 flex items-center justify-center">
                  <Crown className="h-2.5 w-2.5 text-white" />
                </span>
              )}
            </button>
            {profile.isAdmin && (
              <button
                onClick={() => navigate("/admin")}
                className="h-9 w-9 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 hover:bg-orange-500/30 transition-colors"
                title="Админ-панель"
              >
                <Shield className="h-4 w-4" />
              </button>
            )}
          </div>
        ) : (
          <Button
            onClick={() => navigate("/auth")}
            className="rounded-full bg-orange-500 text-[#0a0a0a] hover:bg-orange-600 font-semibold text-sm px-4"
          >
            <User className="h-4 w-4 mr-1.5" /> Войти
          </Button>
        )}
      </div>
    </header>
  )
}

function PlugMarketLogo() {
  return (
    <div className="h-8 w-8 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
      <span className="text-sm">🧩</span>
    </div>
  )
}
