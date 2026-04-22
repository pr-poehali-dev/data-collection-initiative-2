import { createContext, useContext, useState, ReactNode, useEffect } from "react"

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

const TIER_LIMITS: Record<SubscriptionTier, number> = {
  none: 0, month: 1, quarter: 3, forever: 999,
}

const ADMIN_EMAIL = "idpestriakov@gmail.com"

const generateUUID = () =>
  "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16)
  })

interface UserContextType {
  isLoggedIn: boolean
  profile: UserProfile | null
  login: (email: string, password: string) => Promise<void>
  loginWithProvider: (provider: AuthProvider) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => void
  updateProfile: (patch: Partial<UserProfile>) => void
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
  theme: "dark" | "light"
  toggleTheme: () => void
  globalDiscount: number
  setGlobalDiscount: (v: number) => void
  messages: Message[]
  sendMessage: (toId: string, toName: string, text: string) => void
}

const UserContext = createContext<UserContextType | null>(null)

const DEMO_USERS: AdminUser[] = [
  { id: "admin1", displayName: "Иван Пестряков", email: "idpestriakov@gmail.com", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin", isAdmin: true, isBlocked: false, registeredAt: "2024-01-15", subscription: "forever", purchasesCount: 0, reputation: 100 },
  { id: "u1", displayName: "Alex Builder", email: "alex@craftmine.ru", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex", isAdmin: false, isBlocked: false, registeredAt: "2024-03-20", subscription: "quarter", purchasesCount: 7, reputation: 42 },
  { id: "u2", displayName: "Maria_Dev", email: "maria@devcraft.net", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=maria", isAdmin: false, isBlocked: false, registeredAt: "2024-05-10", subscription: "month", purchasesCount: 3, reputation: 15 },
  { id: "u3", displayName: "DarkPvp_King", email: "king@darkpvp.net", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=king", isAdmin: false, isBlocked: true, registeredAt: "2024-06-01", subscription: "none", purchasesCount: 1, reputation: -5 },
  { id: "u4", displayName: "CraftMaster", email: "master@mc.ru", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=craft", isAdmin: false, isBlocked: false, registeredAt: "2024-07-12", subscription: "forever", purchasesCount: 14, reputation: 88 },
]

const DEMO_TRANSACTIONS: Transaction[] = [
  { id: "t1", userId: "u1", userEmail: "alex@craftmine.ru", userName: "Alex Builder", items: [{ id: 1, name: "EssentialsX", price: 149 }, { id: 3, name: "WorldGuard", price: 199 }], total: 348, status: "completed", createdAt: "2024-11-20 14:32" },
  { id: "t2", userId: "u2", userEmail: "maria@devcraft.net", userName: "Maria_Dev", items: [{ id: "quarter", name: "Тариф «Про»", price: 699 }], total: 699, status: "completed", createdAt: "2024-12-01 09:15" },
  { id: "t3", userId: "u4", userEmail: "master@mc.ru", userName: "CraftMaster", items: [{ id: 4, name: "BedWars", price: 349 }], total: 349, status: "refunded", createdAt: "2024-12-10 18:45" },
  { id: "t4", userId: "u1", userEmail: "alex@craftmine.ru", userName: "Alex Builder", items: [{ id: 5, name: "LuckPerms", price: 179 }], total: 179, status: "completed", createdAt: "2025-01-03 11:00" },
]

const DEMO_REVIEWS: Review[] = [
  { id: "r1", pluginId: 1, userId: "u1", userName: "Alex Builder", userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex", rating: 5, text: "Отличный плагин! Работает без лагов, поддержка быстро отвечает.", createdAt: "2024-11-21" },
  { id: "r2", pluginId: 3, userId: "u4", userName: "CraftMaster", userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=craft", rating: 4, text: "WorldGuard как всегда надёжен. Отличная защита регионов.", createdAt: "2024-12-05" },
  { id: "r3", pluginId: 5, userId: "u2", userName: "Maria_Dev", userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=maria", rating: 5, text: "LuckPerms — просто незаменим для управления правами!", createdAt: "2025-01-10" },
]

export function UserProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [subscription, setSubscription] = useState<SubscriptionTier>("none")
  const [ownedPlugins, setOwnedPlugins] = useState<OwnedPlugin[]>([])
  const [servers, setServers] = useState<Server[]>([
    { id: "s1", name: "CraftMine SMP", ip: "play.craftmine.ru", apiKey: "sk-abc123", status: "online" },
  ])
  const [reviews, setReviews] = useState<Review[]>(DEMO_REVIEWS)
  const [transactions, setTransactions] = useState<Transaction[]>(DEMO_TRANSACTIONS)
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>(DEMO_USERS)
  const [theme, setTheme] = useState<"dark" | "light">("dark")
  const [globalDiscount, setGlobalDiscount] = useState(0)

  useEffect(() => {
    document.documentElement.classList.toggle("light-theme", theme === "light")
  }, [theme])

  const isLoggedIn = profile !== null

  const createProfile = (email: string, name: string, provider: AuthProvider): UserProfile => ({
    id: generateUUID(),
    displayName: name,
    email,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
    bio: "",
    uuid: generateUUID(),
    registeredAt: new Date().toLocaleDateString("ru-RU"),
    authProviders: [provider],
    isAdmin: email === ADMIN_EMAIL,
    isBlocked: false,
    lastIps: ["192.168.1.1"],
    wishlist: [],
    reputation: 0,
    notifications: [
      { id: "n1", type: "system", text: "Добро пожаловать в PlugMarket! 🎉", read: false, createdAt: new Date().toLocaleDateString("ru-RU") }
    ],
    notifSettings: { purchases: true, reviews: true, promos: true, messages: true },
    profileVisibility: { purchases: true, activity: true, bio: true },
    activityLog: [
      { id: "a1", type: "login", text: `Вход через ${provider}`, createdAt: new Date().toLocaleDateString("ru-RU") }
    ],
    messages: [],
  })

  const login = async (email: string, _password: string) => {
    const existing = adminUsers.find((u) => u.email === email)
    const name = existing?.displayName || email.split("@")[0]
    const p = createProfile(email, name, "email")
    setProfile(p)
    if (email === ADMIN_EMAIL) setSubscription("forever")
  }

  const loginWithProvider = async (provider: AuthProvider) => {
    const demoEmails: Record<AuthProvider, string> = {
      google: "user@gmail.com", discord: "user#1234@discord.com",
      github: "user@github.com", email: "user@example.com"
    }
    const email = demoEmails[provider]
    const p = createProfile(email, email.split("@")[0], provider)
    setProfile(p)
  }

  const register = async (email: string, _password: string, name: string) => {
    const p = createProfile(email, name, "email")
    setProfile(p)
    const newAdmin: AdminUser = {
      id: p.id, displayName: name, email, avatar: p.avatar,
      isAdmin: email === ADMIN_EMAIL, isBlocked: false,
      registeredAt: p.registeredAt, subscription: "none", purchasesCount: 0, reputation: 0,
    }
    setAdminUsers((prev) => [...prev, newAdmin])
  }

  const logout = () => { setProfile(null); setSubscription("none"); setOwnedPlugins([]) }

  const updateProfile = (patch: Partial<UserProfile>) => {
    setProfile((prev) => prev ? { ...prev, ...patch } : prev)
  }

  const addOwnedPlugin = (p: OwnedPlugin) => {
    setOwnedPlugins((prev) => prev.find((x) => x.id === p.id) ? prev : [...prev, p])
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

  const toggleWishlist = (pluginId: number) => {
    setProfile((prev) => {
      if (!prev) return prev
      const exists = prev.wishlist.includes(pluginId)
      return { ...prev, wishlist: exists ? prev.wishlist.filter((id) => id !== pluginId) : [...prev.wishlist, pluginId] }
    })
  }

  const notifications = profile?.notifications || []

  const markNotifRead = (id: string) => {
    setProfile((prev) => prev
      ? { ...prev, notifications: prev.notifications.map((n) => n.id === id ? { ...n, read: true } : n) }
      : prev)
  }

  const markAllRead = () => {
    setProfile((prev) => prev
      ? { ...prev, notifications: prev.notifications.map((n) => ({ ...n, read: true })) }
      : prev)
  }

  const addNotification = (n: Omit<Notification, "id" | "createdAt">) => {
    setProfile((prev) => {
      if (!prev) return prev
      const notif: Notification = { ...n, id: `n${Date.now()}`, createdAt: new Date().toLocaleDateString("ru-RU") }
      return { ...prev, notifications: [notif, ...prev.notifications] }
    })
  }

  const addReview = (r: Omit<Review, "id" | "createdAt">) => {
    setReviews((prev) => [...prev, { ...r, id: `r${Date.now()}`, createdAt: new Date().toLocaleDateString("ru-RU") }])
  }

  const addTransaction = (t: Omit<Transaction, "id" | "createdAt">) => {
    setTransactions((prev) => [{ ...t, id: `t${Date.now()}`, createdAt: new Date().toLocaleString("ru-RU") }, ...prev])
  }

  const refundTransaction = (id: string) => {
    setTransactions((prev) => prev.map((t) => t.id === id ? { ...t, status: "refunded" } : t))
  }

  const updateAdminUser = (id: string, patch: Partial<AdminUser>) => {
    setAdminUsers((prev) => prev.map((u) => u.id === id ? { ...u, ...patch } : u))
  }

  const toggleTheme = () => setTheme((t) => t === "dark" ? "light" : "dark")

  const messages = profile?.messages || []
  const sendMessage = (toId: string, toName: string, text: string) => {
    if (!profile) return
    const msg: Message = {
      id: `m${Date.now()}`, fromId: profile.id, fromName: profile.displayName,
      fromAvatar: profile.avatar, text, read: false,
      createdAt: new Date().toLocaleString("ru-RU"),
    }
    addNotification({ type: "message", text: `Новое сообщение от ${profile.displayName}`, read: false })
    console.log("Message to", toName, toId, msg)
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
