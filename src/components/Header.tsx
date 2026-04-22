import { useState } from "react"
import { ShoppingCart, Crown, User, Bell, Sun, Moon, Shield, X, Store, LayoutDashboard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/context/CartContext"
import { useUser } from "@/context/UserContext"
import { useNavigate, useLocation } from "react-router-dom"

function scrollToSection(id: string) {
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" })
  }
}

export function Header() {
  const { count, setIsOpen } = useCart()
  const { isLoggedIn, profile, subscription, notifications, markAllRead, theme, toggleTheme, currentUserRole } = useUser()
  const navigate = useNavigate()
  const location = useLocation()
  const [showNotifs, setShowNotifs] = useState(false)
  const hasSubscription = subscription !== "none"
  const unread = notifications.filter((n) => !n.read).length
  const isHome = location.pathname === "/"
  const canAccessPanel = currentUserRole === "admin" || currentUserRole === "moderator"

  const handleNavClick = (section: string) => {
    if (isHome) {
      scrollToSection(section)
    } else {
      navigate("/")
      setTimeout(() => scrollToSection(section), 200)
    }
  }

  const navItems = [
    { label: "Каталог", section: "catalog", icon: Store },
    { label: "Тарифы", section: "pricing", icon: null },
  ]

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-4 md:px-8 py-4 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-[#1a1a1a]">
      <button onClick={() => navigate("/")} className="flex items-center gap-2 hover:opacity-80 transition-opacity shrink-0">
        <PlugMarketLogo />
        <span className="text-lg font-semibold text-white hidden sm:block">PlugMarket<sup className="text-xs">™</sup></span>
      </button>

      <nav className="hidden lg:flex items-center gap-1">
        {navItems.map(({ label, section }) => {
          const isActive = isHome && false // будет подсвечено при скролле
          return (
            <button
              key={section}
              onClick={() => handleNavClick(section)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                isActive
                  ? "text-orange-400 bg-orange-500/10"
                  : "text-gray-400 hover:text-white hover:bg-[#1a1a1a]"
              }`}
            >
              {label}
            </button>
          )
        })}

        {isLoggedIn && (
          <button
            onClick={() => navigate("/dashboard")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${
              location.pathname === "/dashboard"
                ? "text-orange-400 bg-orange-500/10"
                : "text-gray-400 hover:text-white hover:bg-[#1a1a1a]"
            }`}
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            Мои покупки
          </button>
        )}
      </nav>

      <div className="flex items-center gap-2">
        {/* Тема */}
        <button
          onClick={toggleTheme}
          className="h-9 w-9 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center text-gray-400 hover:text-orange-400 hover:border-orange-500/40 transition-colors"
          title={theme === "dark" ? "Светлая тема" : "Тёмная тема"}
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* Уведомления */}
        {isLoggedIn && (
          <div className="relative">
            <button
              onClick={() => { setShowNotifs(!showNotifs); if (unread > 0 && !showNotifs) markAllRead() }}
              className="relative h-9 w-9 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center text-gray-400 hover:text-orange-400 hover:border-orange-500/40 transition-colors"
            >
              <Bell className="h-4 w-4" />
              {unread > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-orange-500 text-[#0a0a0a] text-[10px] font-bold flex items-center justify-center animate-bounce-once">{unread}</span>
              )}
            </button>

            {showNotifs && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowNotifs(false)} />
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
                        <div key={n.id} className={`flex items-start gap-3 px-4 py-3 border-b border-[#1a1a1a] last:border-0 hover:bg-[#1a1a1a] transition-colors ${n.read ? "" : "bg-orange-500/5"}`}>
                          <span className="text-base mt-0.5 shrink-0">{n.type === "purchase" ? "🛒" : n.type === "review" ? "⭐" : n.type === "message" ? "💬" : "🔔"}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-300 leading-relaxed">{n.text}</p>
                            <p className="text-[10px] text-gray-600 mt-0.5">{n.createdAt}</p>
                          </div>
                          {!n.read && <div className="h-2 w-2 rounded-full bg-orange-500 shrink-0 mt-1" />}
                        </div>
                      ))
                    )}
                  </div>
                  <div className="px-4 py-2 border-t border-[#262626]">
                    <button onClick={() => { setShowNotifs(false); navigate("/profile") }} className="text-xs text-orange-400 hover:text-orange-300 transition-colors">Все уведомления →</button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Корзина */}
        <button
          onClick={() => setIsOpen(true)}
          className="relative h-9 w-9 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center text-gray-400 hover:text-orange-400 hover:border-orange-500/40 transition-colors"
          title="Корзина"
        >
          <ShoppingCart className="h-4 w-4" />
          {count > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-orange-500 text-[#0a0a0a] text-[10px] font-bold flex items-center justify-center">{count}</span>
          )}
        </button>

        {/* Профиль / кнопка входа */}
        {isLoggedIn && profile ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/profile")}
              className="relative"
              title={profile.displayName}
            >
              <img src={profile.avatar} alt={profile.displayName} className={`h-9 w-9 rounded-full border-2 hover:border-orange-500/50 transition-colors ${location.pathname === "/profile" ? "border-orange-500/50" : "border-[#2a2a2a]"}`} />
              {hasSubscription && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-orange-500 flex items-center justify-center">
                  <Crown className="h-2.5 w-2.5 text-white" />
                </span>
              )}
            </button>

            {canAccessPanel && (
              <button
                onClick={() => navigate("/admin")}
                title={currentUserRole === "admin" ? "Админ-панель" : "Панель модератора"}
                className={`h-9 w-9 rounded-full border flex items-center justify-center transition-colors ${
                  location.pathname === "/admin"
                    ? "bg-orange-500/30 border-orange-500/50 text-orange-300"
                    : "bg-orange-500/20 border-orange-500/30 text-orange-400 hover:bg-orange-500/30"
                }`}
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
    <div className="h-8 w-8 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center shrink-0">
      <span className="text-sm">🧩</span>
    </div>
  )
}
