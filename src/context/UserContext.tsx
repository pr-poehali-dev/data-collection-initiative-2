import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react"
import { ls_get, ls_set } from "@/lib/storage"

export type SubscriptionTier =
  | "none"
  | "month" | "quarter" | "forever"
  | "premium_month" | "premium_half" | "premium_forever"
  | "super_month" | "super_half" | "super_forever"
export type AuthProvider = "email" | "google" | "discord" | "github"

export interface PlanInfo {
  id: SubscriptionTier
  tier: "premium" | "super"
  period: "month" | "half" | "forever"
  title: string
  price: number
  periodLabel: string
  discount?: string
  features: string[]
}

export const PLAN_CATALOG: PlanInfo[] = [
  { id: "premium_month", tier: "premium", period: "month", title: "Premium · Месяц", price: 299, periodLabel: "30 дней", features: ["Все плагины", "Автообновления", "Базовая поддержка", "До 1 сервера"] },
  { id: "premium_half", tier: "premium", period: "half", title: "Premium · 6 месяцев", price: 1495, periodLabel: "6 месяцев", discount: "−15%", features: ["Все плагины", "Автообновления", "Приоритетная поддержка", "До 3 серверов"] },
  { id: "premium_forever", tier: "premium", period: "forever", title: "Premium · Навсегда", price: 2990, periodLabel: "навсегда", discount: "−50%", features: ["Все плагины навсегда", "Все обновления", "VIP-поддержка", "До 5 серверов"] },
  { id: "super_month", tier: "super", period: "month", title: "Super · Месяц", price: 799, periodLabel: "30 дней", features: ["Всё из Premium", "Super-плагины", "Личный менеджер", "До 5 серверов"] },
  { id: "super_half", tier: "super", period: "half", title: "Super · 6 месяцев", price: 3995, periodLabel: "6 месяцев", discount: "−15%", features: ["Всё из Premium", "Super-плагины", "Личный менеджер", "До 10 серверов"] },
  { id: "super_forever", tier: "super", period: "forever", title: "Super · Навсегда", price: 7990, periodLabel: "навсегда", discount: "−50%", features: ["Всё из Premium навсегда", "Super-плагины", "VIP-поддержка 24/7", "Безлимит серверов"] },
]

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
  subscriptionTier?: SubscriptionTier
  subscriptionExpiresAt?: string | null
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

export type UserRole = "user" | "moderator" | "admin"

export interface AdminUser {
  id: string
  displayName: string
  email: string
  avatar: string
  isAdmin: boolean
  isModerator: boolean
  isBlocked: boolean
  registeredAt: string
  subscription: SubscriptionTier
  purchasesCount: number
  reputation: number
  role: UserRole
}

export interface ManagedPlugin {
  id: number
  name: string
  description: string
  category: string
  price: number
  version: string
  compatibility: string
  sales: number
  revenue: number
  premium: boolean
  active: boolean
  screenshots: string[]
  videoUrl: string
  whitelistEnabled: boolean
  defaultIpSlots: number
  extraIpSlotPrice: number
}

export interface IpSlotEntry {
  userId: string
  userName: string
  userEmail: string
  pluginId: number
  pluginName: string
  ips: string[]
  maxSlots: number
  extraSlots: number
}

export interface AdminLogEntry {
  id: string
  adminEmail: string
  action: string
  target: string
  createdAt: string
  ip?: string
}

const TIER_LIMITS: Record<SubscriptionTier, number> = {
  none: 0, month: 1, quarter: 3, forever: 999,
  premium_month: 1, premium_half: 3, premium_forever: 5,
  super_month: 5, super_half: 10, super_forever: 999,
}

const ADMIN_EMAIL = "idpestriakov@gmail.com"

const genId = () => Math.random().toString(36).slice(2, 10)
const genUUID = () => "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
  const r = (Math.random() * 16) | 0
  return (c === "x" ? r : (r & 0x3) | 0x8).toString(16)
})
const now = () => new Date().toLocaleString("ru-RU")

const DEMO_USERS: AdminUser[] = [
  { id: "admin1", displayName: "Иван Пестряков", email: "idpestriakov@gmail.com", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin", isAdmin: true, isModerator: false, isBlocked: false, registeredAt: "15.01.2024", subscription: "forever", purchasesCount: 0, reputation: 100, role: "admin" },
  { id: "u1", displayName: "Alex Builder", email: "alex@craftmine.ru", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex", isAdmin: false, isModerator: true, isBlocked: false, registeredAt: "20.03.2024", subscription: "quarter", purchasesCount: 7, reputation: 42, role: "moderator" },
  { id: "u2", displayName: "Maria_Dev", email: "maria@devcraft.net", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=maria", isAdmin: false, isModerator: false, isBlocked: false, registeredAt: "10.05.2024", subscription: "month", purchasesCount: 3, reputation: 15, role: "user" },
  { id: "u3", displayName: "DarkPvp_King", email: "king@darkpvp.net", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=king", isAdmin: false, isModerator: false, isBlocked: true, registeredAt: "01.06.2024", subscription: "none", purchasesCount: 1, reputation: -5, role: "user" },
  { id: "u4", displayName: "CraftMaster", email: "master@mc.ru", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=craft", isAdmin: false, isModerator: false, isBlocked: false, registeredAt: "12.07.2024", subscription: "forever", purchasesCount: 14, reputation: 88, role: "user" },
]

export const DEMO_MANAGED_PLUGINS: ManagedPlugin[] = [
  { id: 1, name: "EssentialsX", description: "Основной набор команд для Minecraft-сервера. Включает телепортацию, варп-точки, экономику и многое другое.", category: "Социальное", price: 149, version: "2.21.0", compatibility: "1.18–1.21", sales: 1240, revenue: 184760, premium: true, active: true, screenshots: [], videoUrl: "", whitelistEnabled: true, defaultIpSlots: 3, extraIpSlotPrice: 49 },
  { id: 2, name: "Vault", description: "Унифицированный API для экономики, прав и чата. Необходим большинству плагинов.", category: "Экономика", price: 99, version: "1.7.3", compatibility: "1.16–1.21", sales: 3500, revenue: 346500, premium: true, active: true, screenshots: [], videoUrl: "", whitelistEnabled: false, defaultIpSlots: 1, extraIpSlotPrice: 29 },
  { id: 3, name: "WorldGuard", description: "Мощная система защиты регионов. Настраивайте права и флаги для любой зоны.", category: "Защита", price: 199, version: "7.0.11", compatibility: "1.16–1.21", sales: 980, revenue: 195020, premium: true, active: true, screenshots: [], videoUrl: "", whitelistEnabled: true, defaultIpSlots: 5, extraIpSlotPrice: 59 },
  { id: 4, name: "BedWars", description: "Полнофункциональная мини-игра BedWars с командами, магазинами и статистикой.", category: "Мини-игры", price: 349, version: "0.9.8", compatibility: "1.18–1.21", sales: 630, revenue: 219870, premium: false, active: true, screenshots: [], videoUrl: "", whitelistEnabled: true, defaultIpSlots: 2, extraIpSlotPrice: 79 },
  { id: 5, name: "LuckPerms", description: "Передовая система управления правами с поддержкой групп, временных прав и веб-интерфейса.", category: "Социальное", price: 179, version: "5.4.130", compatibility: "1.16–1.21", sales: 2100, revenue: 375900, premium: true, active: true, screenshots: [], videoUrl: "", whitelistEnabled: true, defaultIpSlots: 3, extraIpSlotPrice: 49 },
  { id: 6, name: "PlotSquared", description: "Система участков для творческих серверов. Гибкие настройки, флаги и мерж участков.", category: "Строительство", price: 249, version: "7.3.9", compatibility: "1.18–1.21", sales: 740, revenue: 184260, premium: false, active: true, screenshots: [], videoUrl: "", whitelistEnabled: false, defaultIpSlots: 1, extraIpSlotPrice: 39 },
]

export const DEMO_IP_SLOTS: IpSlotEntry[] = [
  { userId: "u1", userName: "Alex Builder", userEmail: "alex@craftmine.ru", pluginId: 1, pluginName: "EssentialsX", ips: ["192.168.1.1", "10.0.0.5"], maxSlots: 3, extraSlots: 0 },
  { userId: "u1", userName: "Alex Builder", userEmail: "alex@craftmine.ru", pluginId: 3, pluginName: "WorldGuard", ips: ["192.168.1.1"], maxSlots: 5, extraSlots: 2 },
  { userId: "u4", userName: "CraftMaster", userEmail: "master@mc.ru", pluginId: 5, pluginName: "LuckPerms", ips: ["45.12.33.11", "45.12.33.12", "45.12.33.13"], maxSlots: 3, extraSlots: 3 },
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
  managedPlugins: ManagedPlugin[]
  setManagedPlugins: (fn: ManagedPlugin[] | ((prev: ManagedPlugin[]) => ManagedPlugin[])) => void
  ipSlots: IpSlotEntry[]
  addIpToSlot: (userId: string, pluginId: number, ip: string) => void
  removeIpFromSlot: (userId: string, pluginId: number, ip: string) => void
  addExtraSlot: (userId: string, pluginId: number) => void
  grantPluginAccess: (userId: string, pluginId: number) => void
  currentUserRole: UserRole
  activateSubscription: (plan: PlanInfo) => void
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
  const [managedPluginsState, setManagedPluginsState] = useState<ManagedPlugin[]>(() => ls_get<ManagedPlugin[]>("managedPlugins", DEMO_MANAGED_PLUGINS))
  const [ipSlots, setIpSlotsState] = useState<IpSlotEntry[]>(() => ls_get<IpSlotEntry[]>("ipSlots", DEMO_IP_SLOTS))

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

  const setManagedPlugins = useCallback((fn: ManagedPlugin[] | ((prev: ManagedPlugin[]) => ManagedPlugin[])) => {
    setManagedPluginsState((prev) => {
      const next = typeof fn === "function" ? fn(prev) : fn
      ls_set("managedPlugins", next)
      return next
    })
  }, [])

  const setIpSlots = useCallback((fn: IpSlotEntry[] | ((prev: IpSlotEntry[]) => IpSlotEntry[])) => {
    setIpSlotsState((prev) => {
      const next = typeof fn === "function" ? fn(prev) : fn
      ls_set("ipSlots", next)
      return next
    })
  }, [])

  // Активация тарифа с расчётом даты окончания
  const activateSubscription = useCallback((plan: PlanInfo) => {
    setSubState(plan.id)
    ls_set("subscription", plan.id)
    const addDays = (d: Date, n: number) => { const r = new Date(d); r.setDate(r.getDate() + n); return r }
    let expires: Date | null = null
    if (plan.period === "month") expires = addDays(new Date(), 30)
    else if (plan.period === "half") expires = addDays(new Date(), 180)
    else expires = null // forever
    setProfileState((prev) => {
      if (!prev) return prev
      const updated: UserProfile = {
        ...prev,
        subscriptionTier: plan.id,
        subscriptionExpiresAt: expires ? expires.toISOString() : null,
      }
      ls_set("profile", updated)
      ls_set(`saved_profile_${prev.email}`, updated)
      return updated
    })
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle("light-theme", theme === "light")
    ls_set("theme", theme)
  }, [theme])

  const isLoggedIn = profile !== null

  // Симуляция получения IP клиента
  const getClientIp = (): string => {
    const octet = () => Math.floor(Math.random() * 255)
    return `${octet()}.${octet()}.${octet()}.${octet()}`
  }

  // AUTH
  const login = async (email: string, password: string): Promise<{ ok: boolean; error?: string }> => {
    if (!email) return { ok: false, error: "Введите email" }
    if (!password || password.length < 4) return { ok: false, error: "Пароль слишком короткий" }
    // Симуляция задержки API
    await new Promise((r) => setTimeout(r, 600))
    const saved = ls_get<UserProfile | null>(`saved_profile_${email}`, null)
    const p = saved || createProfile(email, email.split("@")[0], "email")
    if (email === ADMIN_EMAIL && !p.isAdmin) p.isAdmin = true
    const ip = getClientIp()
    p.lastIps = [ip, ...(p.lastIps || [])].slice(0, 5)
    p.activityLog = [{ id: genId(), type: "login", text: `Вход в систему (IP ${ip})`, createdAt: now() }, ...(p.activityLog || []).slice(0, 49)]
    setProfile(p)
    if (email === ADMIN_EMAIL) setSubscription("forever")
    return { ok: true }
  }

  const loginWithProvider = async (provider: AuthProvider): Promise<{ ok: boolean; error?: string }> => {
    try {
      // Симуляция OAuth-redirect и обмена кода на токен
      await new Promise((r) => setTimeout(r, 800))

      // Симуляция редких OAuth-ошибок для реалистичности
      if (Math.random() < 0.02) {
        return { ok: false, error: `Авторизация через ${provider} отклонена` }
      }

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
      const DEMO_AVATARS: Record<AuthProvider, string> = {
        google: "https://api.dicebear.com/7.x/avataaars/svg?seed=google-user",
        discord: "https://api.dicebear.com/7.x/avataaars/svg?seed=discord-user",
        github: "https://api.dicebear.com/7.x/avataaars/svg?seed=github-user",
        email: "https://api.dicebear.com/7.x/avataaars/svg?seed=email-user",
      }

      const email = DEMO_EMAILS[provider]
      const saved = ls_get<UserProfile | null>(`saved_profile_${email}`, null)
      const p = saved || createProfile(email, DEMO_NAMES[provider], provider)

      // Синхронизируем аватар и имя с OAuth-провайдером
      p.avatar = DEMO_AVATARS[provider]
      if (!saved) p.displayName = DEMO_NAMES[provider]
      // Добавляем провайдер в список привязанных
      if (!p.authProviders.includes(provider)) p.authProviders = [...p.authProviders, provider]

      const ip = getClientIp()
      p.lastIps = [ip, ...(p.lastIps || [])].slice(0, 5)
      p.activityLog = [{ id: genId(), type: "login", text: `Вход через ${provider} (IP ${ip})`, createdAt: now() }, ...(p.activityLog || []).slice(0, 49)]

      setProfile(p)
      ls_set(`saved_profile_${email}`, p)

      // Добавляем пользователя в adminUsers, если его нет
      setAdminUsers((prev) => {
        if (prev.find((u) => u.email === email)) return prev
        return [...prev, {
          id: p.id, displayName: p.displayName, email, avatar: p.avatar,
          isAdmin: false, isModerator: false, isBlocked: false,
          registeredAt: p.registeredAt, subscription: "none",
          purchasesCount: 0, reputation: 0, role: "user",
        }]
      })

      return { ok: true }
    } catch (err) {
      console.error("OAuth error", err)
      return { ok: false, error: `Не удалось войти через ${provider}. Попробуйте позже.` }
    }
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
      isAdmin: email === ADMIN_EMAIL, isModerator: false, isBlocked: false,
      registeredAt: p.registeredAt, subscription: "none", purchasesCount: 0, reputation: 0,
      role: email === ADMIN_EMAIL ? "admin" : "user",
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
      ip: (profile?.lastIps && profile.lastIps[0]) || getClientIp(),
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

  // IP SLOTS
  const addIpToSlot = (userId: string, pluginId: number, ip: string) => {
    setIpSlots((prev) => prev.map((s) =>
      s.userId === userId && s.pluginId === pluginId && !s.ips.includes(ip) && s.ips.length < s.maxSlots + s.extraSlots
        ? { ...s, ips: [...s.ips, ip] } : s
    ))
  }

  const removeIpFromSlot = (userId: string, pluginId: number, ip: string) => {
    setIpSlots((prev) => prev.map((s) =>
      s.userId === userId && s.pluginId === pluginId
        ? { ...s, ips: s.ips.filter((i) => i !== ip) } : s
    ))
  }

  const addExtraSlot = (userId: string, pluginId: number) => {
    setIpSlots((prev) => prev.map((s) =>
      s.userId === userId && s.pluginId === pluginId
        ? { ...s, extraSlots: s.extraSlots + 1 } : s
    ))
  }

  const grantPluginAccess = (userId: string, pluginId: number) => {
    const mp = managedPluginsState.find((p) => p.id === pluginId)
    if (!mp) return
    const user = adminUsers.find((u) => u.id === userId)
    if (!user) return
    setIpSlots((prev) => {
      const exists = prev.find((s) => s.userId === userId && s.pluginId === pluginId)
      if (exists) return prev
      return [...prev, {
        userId, userName: user.displayName, userEmail: user.email,
        pluginId, pluginName: mp.name,
        ips: [], maxSlots: mp.defaultIpSlots, extraSlots: 0,
      }]
    })
  }

  // CURRENT USER ROLE
  const currentUserRole: UserRole = profile?.isAdmin ? "admin" : (adminUsers.find((u) => u.email === profile?.email)?.isModerator ? "moderator" : "user")

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
      managedPlugins: managedPluginsState, setManagedPlugins,
      ipSlots, addIpToSlot, removeIpFromSlot, addExtraSlot, grantPluginAccess,
      currentUserRole,
      activateSubscription,
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