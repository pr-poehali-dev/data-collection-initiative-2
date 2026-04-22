import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react"
import { ls_get, ls_set, ls_clear_all } from "@/lib/storage"

export type SubscriptionTier = "none" | "month" | "quarter" | "forever"
export type AuthProvider = "email" | "google" | "discord" | "github"

export interface OwnedPlugin {
  id: number
  name: string
  version: string
  category: string
  installedServers: string[]
  apiKey: string
  whitelistIps: string[]
  purchasedAt: string
}

export interface Server {
  id: string
  name: string
  ip: string
  apiKey: string
  status: "online" | "offline"
}

export interface UserProfile {
  id: string
  displayName: string
  email: string
  avatar: string
  bio: string
  uuid: string
  registeredAt: string
  authProviders: AuthProvider[]
  isAdmin: boolean
  isBlocked: boolean
  lastIps: string[]
  wishlist: number[]
  reputation: number
  notifications: Notification[]
  notifSettings: { purchases: boolean; reviews: boolean; promos: boolean; messages: boolean }
  profileVisibility: { purchases: boolean; activity: boolean; bio: boolean }
  activityLog: ActivityEntry[]
  messages: Message[]
}

export interface Notification {
  id: string
  type: "purchase" | "review" | "promo" | "message" | "system"
  text: string
  read: boolean
  createdAt: string
}

export interface ActivityEntry {
  id: string
  type: "purchase" | "review" | "message" | "login"
  text: string
  createdAt: string
}

export interface Message {
  id: string
  fromId: string
  fromName: string
  fromAvatar: string
  text: string
  read: boolean
  createdAt: string
}

export interface Review {
  id: string
  pluginId: number
  userId: string
  userName: string
  userAvatar: string
  rating: number
  text: string
  createdAt: string
}

export interface Transaction {
  id: string
  userId: string
  userEmail: string
  userName: string
  items: { id: number | string; name: string; price: number }[]
  total: number
  status: "completed" | "refunded" | "pending"
  createdAt: string
  paymentMethod?: string
}

export interface AdminUser {
  id: string
  displayName: string
  email: string
  avatar: string
  isAdmin: boolean
  isBlocked: boolean
  registeredAt: string
  subscription: SubscriptionTier
  purchasesCount: number
  reputation: number
}

export interface AdminLogEntry {
  id: string
  adminEmail: string
  action: string
  target: string
  createdAt: string
}

const TIER_LIMITS: Record<SubscriptionTier, number> = {
  none: 0, month: 1, quarter: 3, forever: 999,
}

const ADMIN_EMAIL = "idpestriakov@gmail.com"

const genId = () => Math.random().toString(36).slice(2, 10)
const genUUID = () => "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
  const r = (Math.random() * 16) | 0
  return (c === "x" ? r : (r & 0x3) | 0x8).toString(16)
})
const now = () => new Date().toLocaleString("ru-RU")

const DEMO_USERS: AdminUser[] = [
  { id: "admin1", displayName: "Иван Пестряков", email: "idpestriakov@gmail.com", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin", isAdmin: true, isBlocked: false, registeredAt: "15.01.2024", subscription: "forever", purchasesCount: 0, reputation: 100 },
  { id: "u1", displayName: "Alex Builder", email: "alex@craftmine.ru", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex", isAdmin: false, isBlocked: false, registeredAt: "20.03.2024", subscription: "quarter", purchasesCount: 7, reputation: 42 },
  { id: "u2", displayName: "Maria_Dev", email: "maria@devcraft.net", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=maria", isAdmin: false, isBlocked: false, registeredAt: "10.05.2024", subscription: "month", purchasesCount: 3, reputation: 15 },
  { id: "u3", displayName: "DarkPvp_King", email: "king@darkpvp.net", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=king", isAdmin: false, isBlocked: true, registeredAt: "01.06.2024", subscription: "none", purchasesCount: 1, reputation: -5 },
  { id: "u4", displayName: "CraftMaster", email: "master@mc.ru", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=craft", isAdmin: false, isBlocked: false, registeredAt: "12.07.2024", subscription: "forever", purchasesCount: 14, reputation: 88 },
]

const DEMO_TRANSACTIONS: Transaction[] = [
  { id: "t1", userId: "u1", userEmail: "alex@craftmine.ru", userName: "Alex Builder", items: [{ id: 1, name: "EssentialsX", price: 149 }, { id: 3, name: "WorldGuard", price: 199 }], total: 348, status: "completed", createdAt: "20.11.2024 14:32", paymentMethod: "card" },
  { id: "t2", userId: "u2", userEmail: "maria@devcraft.net", userName: "Maria_Dev", items: [{ id: "quarter", name: "Тариф «Про»", price: 699 }], total: 699, status: "completed", createdAt: "01.12.2024 09:15", paymentMethod: "yookassa" },
  { id: "t3", userId: "u4", userEmail: "master@mc.ru", userName: "CraftMaster", items: [{ id: 4, name: "BedWars", price: 349 }], total: 349, status: "refunded", createdAt: "10.12.2024 18:45", paymentMethod: "card" },
  { id: "t4", userId: "u1", userEmail: "alex@craftmine.ru", userName: "Alex Builder", items: [{ id: 5, name: "LuckPerms", price: 179 }], total: 179, status: "completed", createdAt: "03.01.2025 11:00", paymentMethod: "sbp" },
]

const DEMO_REVIEWS: Review[] = [
  { id: "r1", pluginId: 1, userId: "u1", userName: "Alex Builder", userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex", rating: 5, text: "Отличный плагин! Работает без лагов, поддержка быстро отвечает.", createdAt: "21.11.2024" },
  { id: "r2", pluginId: 3, userId: "u4", userName: "CraftMaster", userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=craft", rating: 4, text: "WorldGuard как всегда надёжен. Отличная защита регионов.", createdAt: "05.12.2024" },
  { id: "r3", pluginId: 5, userId: "u2", userName: "Maria_Dev", userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=maria", rating: 5, text: "LuckPerms — просто незаменим для управления правами!", createdAt: "10.01.2025" },
]

interface UserContextType {
  isLoggedIn: boolean
  profile: UserProfile | null
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>
  loginWithProvider: (provider: AuthProvider) => Promise<{ ok: boolean; error?: string }>
  register: (email: string, password: string, name: string) => Promise<{ ok: boolean; error?: string }>
  logout: () => void
  updateProfile: (patch: Partial<UserProfile>) => Promise<{ ok: boolean }>
  subscription: SubscriptionTier
  setSubscription: (t: SubscriptionTier) => void
  ownedPlugins: OwnedPlugin[]
  addOwnedPlugin: (p: OwnedPlugin) => void
  servers: Server[]
  addServer: (s: Server) => void
  removeServer: (id: string) => void
  updateServer: (id: string, patch: Partial<Server>) => void
  updatePluginServer: (pluginId: number, serverIp: string) => void
  addWhitelistIp: (pluginId: number, ip: string) => void
  removeWhitelistIp: (pluginId: number, ip: string) => void
  maxServers: number
  wishlist: number[]
  toggleWishlist: (pluginId: number) => void
  notifications: Notification[]
  markNotifRead: (id: string) => void
  markAllRead: () => void
  addNotification: (n: Omit<Notification, "id" | "createdAt">) => void
  reviews: Review[]
  addReview: (r: Omit<Review, "id" | "createdAt">) => void
  transactions: Transaction[]
  addTransaction: (t: Omit<Transaction, "id" | "createdAt">) => void
  refundTransaction: (id: string) => void
  adminUsers: AdminUser[]
  setAdminUsers: (users: AdminUser[]) => void
  updateAdminUser: (id: string, patch: Partial<AdminUser>) => void
  adminLog: AdminLogEntry[]
  logAdminAction: (action: string, target: string) => void
  theme: "dark" | "light"
  toggleTheme: () => void
  globalDiscount: number
  setGlobalDiscount: (v: number) => void
  messages: Message[]
  sendMessage: (toId: string, toName: string, text: string) => void
}

const UserContext = createContext<UserContextType | null>(null)

function createProfile(email: string, name: string, provider: AuthProvider): UserProfile {
  return {
    id: genId(),
    displayName: name,
    email,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`,
    bio: "",
    uuid: genUUID(),
    registeredAt: new Date().toLocaleDateString("ru-RU"),
    authProviders: [provider],
    isAdmin: email === ADMIN_EMAIL,
    isBlocked: false,
    lastIps: ["192.168.1.1"],
    wishlist: [],
    reputation: 0,
    notifications: [{ id: "n_welcome", type: "system", text: "Добро пожаловать в PlugMarket! 🎉", read: false, createdAt: new Date().toLocaleDateString("ru-RU") }],
    notifSettings: { purchases: true, reviews: true, promos: true, messages: true },
    profileVisibility: { purchases: true, activity: true, bio: true },
    activityLog: [{ id: "a_login", type: "login", text: `Вход через ${provider}`, createdAt: now() }],
    messages: [],
  }
}

export function UserProvider({ children }: { children: ReactNode }) {
  // Инициализация из localStorage (сессия)
  const [profile, setProfileState] = useState<UserProfile | null>(() => ls_get<UserProfile | null>("profile", null))
  const [subscription, setSubState] = useState<SubscriptionTier>(() => ls_get<SubscriptionTier>("subscription", "none"))
  const [ownedPlugins, setOwnedPluginsState] = useState<OwnedPlugin[]>(() => ls_get<OwnedPlugin[]>("ownedPlugins", []))
  const [servers, setServersState] = useState<Server[]>(() =>
    ls_get<Server[]>("servers", [{ id: "s1", name: "CraftMine SMP", ip: "play.craftmine.ru", apiKey: "sk-abc123", status: "online" }])
  )
  const [reviews, setReviews] = useState<Review[]>(() => ls_get<Review[]>("reviews", DEMO_REVIEWS))
  const [transactions, setTransactions] = useState<Transaction[]>(() => ls_get<Transaction[]>("transactions", DEMO_TRANSACTIONS))
  const [adminUsers, setAdminUsersState] = useState<AdminUser[]>(() => ls_get<AdminUser[]>("adminUsers", DEMO_USERS))
  const [adminLog, setAdminLog] = useState<AdminLogEntry[]>(() => ls_get<AdminLogEntry[]>("adminLog", []))
  const [theme, setTheme] = useState<"dark" | "light">(() => ls_get<"dark" | "light">("theme", "dark"))
  const [globalDiscount, setGlobalDiscountState] = useState<number>(() => ls_get<number>("globalDiscount", 0))

  // Sync profile → localStorage
  const setProfile = useCallback((p: UserProfile | null | ((prev: UserProfile | null) => UserProfile | null)) => {
    setProfileState((prev) => {
      const next = typeof p === "function" ? p(prev) : p
      ls_set("profile", next)
      return next
    })
  }, [])

  const setSubscription = useCallback((t: SubscriptionTier) => {
    setSubState(t)
    ls_set("subscription", t)
  }, [])

  const setOwnedPlugins = useCallback((fn: OwnedPlugin[] | ((prev: OwnedPlugin[]) => OwnedPlugin[])) => {
    setOwnedPluginsState((prev) => {
      const next = typeof fn === "function" ? fn(prev) : fn
      ls_set("ownedPlugins", next)
      return next
    })
  }, [])

  const setServers = useCallback((fn: Server[] | ((prev: Server[]) => Server[])) => {
    setServersState((prev) => {
      const next = typeof fn === "function" ? fn(prev) : fn
      ls_set("servers", next)
      return next
    })
  }, [])

  const setAdminUsers = useCallback((fn: AdminUser[] | ((prev: AdminUser[]) => AdminUser[])) => {
    setAdminUsersState((prev) => {
      const next = typeof fn === "function" ? fn(prev) : fn
      ls_set("adminUsers", next)
      return next
    })
  }, [])

  const setGlobalDiscount = useCallback((v: number) => {
    setGlobalDiscountState(v)
    ls_set("globalDiscount", v)
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle("light-theme", theme === "light")
    ls_set("theme", theme)
  }, [theme])

  const isLoggedIn = profile !== null

  // AUTH
  const login = async (email: string, _password: string): Promise<{ ok: boolean; error?: string }> => {
    if (!email) return { ok: false, error: "Введите email" }
    // Симуляция задержки API
    await new Promise((r) => setTimeout(r, 600))
    const saved = ls_get<UserProfile | null>(`saved_profile_${email}`, null)
    const p = saved || createProfile(email, email.split("@")[0], "email")
    if (email === ADMIN_EMAIL && !p.isAdmin) p.isAdmin = true
    p.activityLog = [{ id: genId(), type: "login", text: "Вход в систему", createdAt: now() }, ...(p.activityLog || []).slice(0, 49)]
    setProfile(p)
    if (email === ADMIN_EMAIL) setSubscription("forever")
    return { ok: true }
  }

  const loginWithProvider = async (provider: AuthProvider): Promise<{ ok: boolean; error?: string }> => {
    await new Promise((r) => setTimeout(r, 800))
    const DEMO_EMAILS: Record<AuthProvider, string> = {
      google: "user.google@gmail.com",
      discord: "user.discord@discord.gg",
      github: "user.github@github.com",
      email: "user@example.com",
    }
    const DEMO_NAMES: Record<AuthProvider, string> = {
      google: "Google User",
      discord: "Discord User",
      github: "GitHub User",
      email: "Email User",
    }
    const email = DEMO_EMAILS[provider]
    const saved = ls_get<UserProfile | null>(`saved_profile_${email}`, null)
    const p = saved || createProfile(email, DEMO_NAMES[provider], provider)
    p.activityLog = [{ id: genId(), type: "login", text: `Вход через ${provider}`, createdAt: now() }, ...(p.activityLog || []).slice(0, 49)]
    setProfile(p)
    return { ok: true }
  }

  const register = async (email: string, _password: string, name: string): Promise<{ ok: boolean; error?: string }> => {
    if (!email || !name) return { ok: false, error: "Заполните все поля" }
    await new Promise((r) => setTimeout(r, 700))
    const exists = ls_get<UserProfile | null>(`saved_profile_${email}`, null)
    if (exists) return { ok: false, error: "Пользователь с таким email уже существует" }
    const p = createProfile(email, name, "email")
    setProfile(p)
    ls_set(`saved_profile_${email}`, p)
    const newAdmin: AdminUser = {
      id: p.id, displayName: name, email, avatar: p.avatar,
      isAdmin: email === ADMIN_EMAIL, isBlocked: false,
      registeredAt: p.registeredAt, subscription: "none", purchasesCount: 0, reputation: 0,
    }
    setAdminUsers((prev) => [...prev.filter((u) => u.email !== email), newAdmin])
    return { ok: true }
  }

  const logout = () => {
    // Сохраняем профиль перед выходом
    if (profile) ls_set(`saved_profile_${profile.email}`, profile)
    setProfile(null)
    ls_set("profile", null)
    setSubState("none")
    ls_set("subscription", "none")
    setOwnedPlugins([])
    ls_set("ownedPlugins", [])
  }

  const updateProfile = async (patch: Partial<UserProfile>): Promise<{ ok: boolean }> => {
    // Optimistic update
    setProfile((prev) => {
      if (!prev) return prev
      const updated = { ...prev, ...patch }
      // Сохраняем обновлённый профиль сразу
      ls_set(`saved_profile_${prev.email}`, updated)
      return updated
    })
    await new Promise((r) => setTimeout(r, 300))
    return { ok: true }
  }

  // PLUGINS
  const addOwnedPlugin = (p: OwnedPlugin) => {
    setOwnedPlugins((prev) => prev.find((x) => x.id === p.id) ? prev : [...prev, p])
    // Логируем в активность
    setProfile((prev) => {
      if (!prev) return prev
      const entry: ActivityEntry = { id: genId(), type: "purchase", text: `Куплен плагин ${p.name}`, createdAt: now() }
      const updated = { ...prev, activityLog: [entry, ...(prev.activityLog || []).slice(0, 49)] }
      ls_set(`saved_profile_${prev.email}`, updated)
      return updated
    })
  }

  const addServer = (s: Server) => setServers((prev) => [...prev, s])
  const removeServer = (id: string) => setServers((prev) => prev.filter((s) => s.id !== id))
  const updateServer = (id: string, patch: Partial<Server>) =>
    setServers((prev) => prev.map((s) => s.id === id ? { ...s, ...patch } : s))

  const updatePluginServer = (pluginId: number, serverIp: string) => {
    setOwnedPlugins((prev) =>
      prev.map((p) => p.id === pluginId
        ? { ...p, installedServers: p.installedServers.includes(serverIp) ? p.installedServers.filter((ip) => ip !== serverIp) : [...p.installedServers, serverIp] }
        : p))
  }

  const addWhitelistIp = (pluginId: number, ip: string) => {
    setOwnedPlugins((prev) =>
      prev.map((p) => p.id === pluginId && !p.whitelistIps.includes(ip)
        ? { ...p, whitelistIps: [...p.whitelistIps, ip] } : p))
  }

  const removeWhitelistIp = (pluginId: number, ip: string) => {
    setOwnedPlugins((prev) =>
      prev.map((p) => p.id === pluginId
        ? { ...p, whitelistIps: p.whitelistIps.filter((x) => x !== ip) } : p))
  }

  // WISHLIST
  const toggleWishlist = (pluginId: number) => {
    setProfile((prev) => {
      if (!prev) return prev
      const exists = prev.wishlist.includes(pluginId)
      const updated = { ...prev, wishlist: exists ? prev.wishlist.filter((id) => id !== pluginId) : [...prev.wishlist, pluginId] }
      ls_set(`saved_profile_${prev.email}`, updated)
      return updated
    })
  }

  // NOTIFICATIONS
  const notifications = profile?.notifications || []

  const markNotifRead = (id: string) => {
    setProfile((prev) => {
      if (!prev) return prev
      const updated = { ...prev, notifications: prev.notifications.map((n) => n.id === id ? { ...n, read: true } : n) }
      ls_set(`saved_profile_${prev.email}`, updated)
      return updated
    })
  }

  const markAllRead = () => {
    setProfile((prev) => {
      if (!prev) return prev
      const updated = { ...prev, notifications: prev.notifications.map((n) => ({ ...n, read: true })) }
      ls_set(`saved_profile_${prev.email}`, updated)
      return updated
    })
  }

  const addNotification = (n: Omit<Notification, "id" | "createdAt">) => {
    setProfile((prev) => {
      if (!prev) return prev
      const notif: Notification = { ...n, id: `n_${genId()}`, createdAt: now() }
      const updated = { ...prev, notifications: [notif, ...(prev.notifications || []).slice(0, 49)] }
      ls_set(`saved_profile_${prev.email}`, updated)
      return updated
    })
  }

  // REVIEWS
  const addReview = (r: Omit<Review, "id" | "createdAt">) => {
    const review: Review = { ...r, id: `r_${genId()}`, createdAt: new Date().toLocaleDateString("ru-RU") }
    setReviews((prev) => {
      const next = [...prev, review]
      ls_set("reviews", next)
      return next
    })
    // Активность
    setProfile((prev) => {
      if (!prev) return prev
      const entry: ActivityEntry = { id: genId(), type: "review", text: `Оставлен отзыв на плагин #${r.pluginId}`, createdAt: now() }
      const updated = { ...prev, activityLog: [entry, ...(prev.activityLog || []).slice(0, 49)] }
      ls_set(`saved_profile_${prev.email}`, updated)
      return updated
    })
  }

  // TRANSACTIONS
  const addTransaction = (t: Omit<Transaction, "id" | "createdAt">) => {
    const tx: Transaction = { ...t, id: `tx_${genId()}`, createdAt: now() }
    setTransactions((prev) => {
      const next = [tx, ...prev]
      ls_set("transactions", next)
      return next
    })
    addNotification({ type: "purchase", text: `Оплата прошла успешно! Сумма: ${t.total}₽`, read: false })
  }

  const refundTransaction = (id: string) => {
    setTransactions((prev) => {
      const next = prev.map((t) => t.id === id ? { ...t, status: "refunded" as const } : t)
      ls_set("transactions", next)
      return next
    })
  }

  // ADMIN USERS
  const updateAdminUser = (id: string, patch: Partial<AdminUser>) => {
    setAdminUsers((prev) => prev.map((u) => u.id === id ? { ...u, ...patch } : u))
  }

  // ADMIN LOG
  const logAdminAction = (action: string, target: string) => {
    const entry: AdminLogEntry = {
      id: genId(),
      adminEmail: profile?.email || "unknown",
      action,
      target,
      createdAt: now(),
    }
    setAdminLog((prev) => {
      const next = [entry, ...prev.slice(0, 199)]
      ls_set("adminLog", next)
      return next
    })
  }

  // THEME
  const toggleTheme = () => setTheme((t) => t === "dark" ? "light" : "dark")

  // MESSAGES
  const messages = profile?.messages || []
  const sendMessage = (toId: string, toName: string, text: string) => {
    if (!profile) return
    const msg: Message = {
      id: genId(), fromId: profile.id, fromName: profile.displayName,
      fromAvatar: profile.avatar, text, read: false, createdAt: now(),
    }
    console.log("Message to", toName, toId, msg)
    addNotification({ type: "message", text: `Сообщение отправлено пользователю ${toName}`, read: false })
    setProfile((prev) => {
      if (!prev) return prev
      const entry: ActivityEntry = { id: genId(), type: "message", text: `Сообщение отправлено: ${toName}`, createdAt: now() }
      const updated = { ...prev, activityLog: [entry, ...(prev.activityLog || []).slice(0, 49)] }
      ls_set(`saved_profile_${prev.email}`, updated)
      return updated
    })
  }

  return (
    <UserContext.Provider value={{
      isLoggedIn, profile, login, loginWithProvider, register, logout, updateProfile,
      subscription, setSubscription,
      ownedPlugins, addOwnedPlugin,
      servers, addServer, removeServer, updateServer, updatePluginServer, addWhitelistIp, removeWhitelistIp,
      maxServers: TIER_LIMITS[subscription],
      wishlist: profile?.wishlist || [], toggleWishlist,
      notifications, markNotifRead, markAllRead, addNotification,
      reviews, addReview,
      transactions, addTransaction, refundTransaction,
      adminUsers, setAdminUsers, updateAdminUser,
      adminLog, logAdminAction,
      theme, toggleTheme,
      globalDiscount, setGlobalDiscount,
      messages, sendMessage,
    }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error("useUser must be used inside UserProvider")
  return ctx
}
