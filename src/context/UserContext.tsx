import { createContext, useContext, useState, ReactNode } from "react"

export type SubscriptionTier = "none" | "month" | "quarter" | "forever"

export interface OwnedPlugin {
  id: number
  name: string
  version: string
  category: string
  installedServers: string[]
  apiKey: string
  whitelistIps: string[]
}

export interface Server {
  id: string
  name: string
  ip: string
  apiKey: string
  status: "online" | "offline"
}

interface UserContextType {
  isLoggedIn: boolean
  login: () => void
  logout: () => void
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
}

const TIER_LIMITS: Record<SubscriptionTier, number> = {
  none: 0,
  month: 1,
  quarter: 3,
  forever: 999,
}

const UserContext = createContext<UserContextType | null>(null)

export function UserProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [subscription, setSubscription] = useState<SubscriptionTier>("none")
  const [ownedPlugins, setOwnedPlugins] = useState<OwnedPlugin[]>([])
  const [servers, setServers] = useState<Server[]>([
    { id: "s1", name: "CraftMine SMP", ip: "play.craftmine.ru", apiKey: "sk-abc123", status: "online" },
  ])

  const login = () => setIsLoggedIn(true)
  const logout = () => setIsLoggedIn(false)

  const addOwnedPlugin = (p: OwnedPlugin) => {
    setOwnedPlugins((prev) => prev.find((x) => x.id === p.id) ? prev : [...prev, p])
  }

  const addServer = (s: Server) => {
    setServers((prev) => [...prev, s])
  }

  const removeServer = (id: string) => {
    setServers((prev) => prev.filter((s) => s.id !== id))
  }

  const updateServer = (id: string, patch: Partial<Server>) => {
    setServers((prev) => prev.map((s) => s.id === id ? { ...s, ...patch } : s))
  }

  const updatePluginServer = (pluginId: number, serverIp: string) => {
    setOwnedPlugins((prev) =>
      prev.map((p) =>
        p.id === pluginId
          ? {
              ...p,
              installedServers: p.installedServers.includes(serverIp)
                ? p.installedServers.filter((ip) => ip !== serverIp)
                : [...p.installedServers, serverIp],
            }
          : p
      )
    )
  }

  const addWhitelistIp = (pluginId: number, ip: string) => {
    setOwnedPlugins((prev) =>
      prev.map((p) =>
        p.id === pluginId && !p.whitelistIps.includes(ip)
          ? { ...p, whitelistIps: [...p.whitelistIps, ip] }
          : p
      )
    )
  }

  const removeWhitelistIp = (pluginId: number, ip: string) => {
    setOwnedPlugins((prev) =>
      prev.map((p) =>
        p.id === pluginId
          ? { ...p, whitelistIps: p.whitelistIps.filter((x) => x !== ip) }
          : p
      )
    )
  }

  const maxServers = TIER_LIMITS[subscription]

  return (
    <UserContext.Provider value={{
      isLoggedIn, login, logout,
      subscription, setSubscription,
      ownedPlugins, addOwnedPlugin,
      servers, addServer, removeServer, updateServer,
      updatePluginServer, addWhitelistIp, removeWhitelistIp,
      maxServers,
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
