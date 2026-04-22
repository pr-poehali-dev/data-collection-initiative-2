import { useState } from "react"
import { useUser } from "@/context/UserContext"
import { useNavigate } from "react-router-dom"
import {
  Package, Server, Crown, LogOut, Plus, X, Copy, Check,
  Wifi, WifiOff, Settings, Shield, ChevronRight, Zap, Key
} from "lucide-react"
import { Button } from "@/components/ui/button"

type Tab = "plugins" | "servers" | "subscription"

const TIER_LABELS: Record<string, string> = {
  none: "Нет подписки",
  month: "Старт · 1 месяц",
  quarter: "Про · 3 месяца",
  forever: "Навсегда",
}
const TIER_COLORS: Record<string, string> = {
  none: "text-gray-500",
  month: "text-orange-400",
  quarter: "text-yellow-400",
  forever: "text-amber-300",
}
const TIER_LIMITS: Record<string, number> = { none: 0, month: 1, quarter: 3, forever: 999 }

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500) }}
      className="ml-2 text-gray-600 hover:text-orange-400 transition-colors"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  )
}

function PluginDetail({ pluginId, onClose }: { pluginId: number; onClose: () => void }) {
  const { ownedPlugins, servers, subscription, updatePluginServer, addWhitelistIp, removeWhitelistIp } = useUser()
  const plugin = ownedPlugins.find((p) => p.id === pluginId)
  const [newIp, setNewIp] = useState("")
  const limit = TIER_LIMITS[subscription]

  if (!plugin) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="animate-fade-up relative w-full max-w-lg rounded-2xl bg-[#141414] border border-[#2a2a2a] p-6 overflow-y-auto max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X className="h-5 w-5" /></button>

        <div className="flex items-center gap-3 mb-6">
          <div className="h-12 w-12 rounded-xl bg-orange-600 flex items-center justify-center">
            <Package className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{plugin.name}</h2>
            <p className="text-xs text-gray-500">{plugin.category} · v{plugin.version}</p>
          </div>
        </div>

        {/* API ключ */}
        <div className="mb-5 rounded-xl bg-[#1a1a1a] border border-[#262626] p-4">
          <div className="flex items-center gap-2 mb-2">
            <Key className="h-4 w-4 text-orange-400" />
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">API-ключ плагина</span>
          </div>
          <div className="flex items-center rounded-lg bg-[#0f0f0f] border border-[#333] px-3 py-2">
            <code className="flex-1 text-xs text-green-400 font-mono truncate">{plugin.apiKey}</code>
            <CopyButton text={plugin.apiKey} />
          </div>
          <p className="mt-2 text-xs text-gray-600">Используйте этот ключ в конфиге плагина на сервере</p>
        </div>

        {/* Подключение серверов */}
        <div className="mb-5 rounded-xl bg-[#1a1a1a] border border-[#262626] p-4">
          <div className="flex items-center gap-2 mb-3">
            <Server className="h-4 w-4 text-orange-400" />
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Серверы</span>
            <span className="ml-auto text-xs text-gray-600">
              {subscription === "none" ? "Нужна подписка" : `до ${limit === 999 ? "∞" : limit} серверов`}
            </span>
          </div>
          {servers.length === 0 ? (
            <p className="text-xs text-gray-600">Добавьте серверы в разделе «Серверы»</p>
          ) : (
            <div className="space-y-2">
              {servers.map((srv) => {
                const connected = plugin.installedServers.includes(srv.ip)
                const canAdd = connected || plugin.installedServers.length < limit
                return (
                  <div key={srv.id} className="flex items-center justify-between rounded-lg bg-[#0f0f0f] px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${srv.status === "online" ? "bg-green-500" : "bg-gray-600"}`} />
                      <div>
                        <p className="text-sm text-white">{srv.name}</p>
                        <p className="text-xs text-gray-600 font-mono">{srv.ip}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => canAdd && updatePluginServer(plugin.id, srv.ip)}
                      disabled={!canAdd}
                      className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                        connected
                          ? "bg-green-500/20 text-green-400 hover:bg-red-500/20 hover:text-red-400"
                          : canAdd
                          ? "bg-orange-500/20 text-orange-400 hover:bg-orange-500/30"
                          : "bg-gray-800 text-gray-600 cursor-not-allowed"
                      }`}
                    >
                      {connected ? "✓ Подключён" : canAdd ? "Подключить" : "Лимит"}
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Вайтлист IP */}
        <div className="rounded-xl bg-[#1a1a1a] border border-[#262626] p-4">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="h-4 w-4 text-orange-400" />
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Whitelist IP</span>
          </div>
          <div className="space-y-1.5 mb-3">
            {plugin.whitelistIps.length === 0 ? (
              <p className="text-xs text-gray-600">Нет разрешённых IP</p>
            ) : (
              plugin.whitelistIps.map((ip) => (
                <div key={ip} className="flex items-center justify-between rounded-lg bg-[#0f0f0f] px-3 py-2">
                  <code className="text-xs text-green-400 font-mono">{ip}</code>
                  <button onClick={() => removeWhitelistIp(plugin.id, ip)} className="text-gray-600 hover:text-red-400 transition-colors">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
          <div className="flex gap-2">
            <input
              value={newIp}
              onChange={(e) => setNewIp(e.target.value)}
              placeholder="192.168.1.1 или 0.0.0.0/0"
              className="flex-1 rounded-lg bg-[#0f0f0f] border border-[#333] px-3 py-2 text-sm text-white placeholder-gray-600 outline-none focus:border-orange-500/50"
            />
            <Button
              size="sm"
              onClick={() => { if (newIp.trim()) { addWhitelistIp(plugin.id, newIp.trim()); setNewIp("") } }}
              className="bg-orange-500 text-[#0a0a0a] hover:bg-orange-600 px-3"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ServersTab() {
  const { servers, addServer, removeServer, updateServer, subscription, maxServers } = useUser()
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ name: "", ip: "", apiKey: "" })
  const canAdd = servers.length < maxServers

  const handleAdd = () => {
    if (!form.ip.trim()) return
    addServer({
      id: `s${Date.now()}`,
      name: form.name || form.ip,
      ip: form.ip,
      apiKey: form.apiKey || `sk-${Math.random().toString(36).slice(2, 10)}`,
      status: "online",
    })
    setForm({ name: "", ip: "", apiKey: "" })
    setAdding(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">
          Серверов: <span className="text-white font-medium">{servers.length}</span>
          {" / "}
          <span className="text-orange-400">{maxServers === 999 ? "∞" : maxServers}</span>
          {subscription === "none" && <span className="ml-2 text-xs text-gray-600">(нужна подписка)</span>}
        </p>
        {canAdd && (
          <Button size="sm" onClick={() => setAdding(true)} className="bg-orange-500 text-[#0a0a0a] hover:bg-orange-600 text-xs rounded-full">
            <Plus className="h-3.5 w-3.5 mr-1" /> Добавить сервер
          </Button>
        )}
      </div>

      {adding && (
        <div className="rounded-xl bg-[#1a1a1a] border border-orange-500/30 p-4 space-y-3 animate-fade-up">
          <p className="text-sm font-medium text-white">Новый сервер</p>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Название сервера" className="w-full rounded-lg bg-[#0f0f0f] border border-[#333] px-3 py-2 text-sm text-white placeholder-gray-600 outline-none focus:border-orange-500/50" />
          <input value={form.ip} onChange={(e) => setForm({ ...form, ip: e.target.value })} placeholder="IP или домен (play.server.ru)" className="w-full rounded-lg bg-[#0f0f0f] border border-[#333] px-3 py-2 text-sm text-white placeholder-gray-600 outline-none focus:border-orange-500/50" />
          <input value={form.apiKey} onChange={(e) => setForm({ ...form, apiKey: e.target.value })} placeholder="API-ключ сервера (необязательно)" className="w-full rounded-lg bg-[#0f0f0f] border border-[#333] px-3 py-2 text-sm text-white placeholder-gray-600 outline-none focus:border-orange-500/50" />
          <div className="flex gap-2">
            <Button onClick={handleAdd} className="flex-1 bg-orange-500 text-[#0a0a0a] hover:bg-orange-600 text-sm rounded-lg">Добавить</Button>
            <Button onClick={() => setAdding(false)} variant="outline" className="flex-1 border-[#333] text-gray-400 hover:bg-[#1f1f1f] text-sm rounded-lg bg-transparent">Отмена</Button>
          </div>
        </div>
      )}

      {servers.length === 0 ? (
        <div className="rounded-xl bg-[#1a1a1a] border border-[#262626] p-8 text-center">
          <Server className="h-10 w-10 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Нет серверов</p>
          <p className="text-gray-600 text-xs mt-1">Добавьте сервер, чтобы устанавливать плагины</p>
        </div>
      ) : (
        <div className="space-y-3">
          {servers.map((srv) => (
            <div key={srv.id} className="rounded-xl bg-[#1a1a1a] border border-[#262626] p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`h-9 w-9 rounded-lg ${srv.status === "online" ? "bg-green-500/20" : "bg-gray-800"} flex items-center justify-center`}>
                    {srv.status === "online" ? <Wifi className="h-4 w-4 text-green-400" /> : <WifiOff className="h-4 w-4 text-gray-600" />}
                  </div>
                  <div>
                    <p className="font-medium text-white text-sm">{srv.name}</p>
                    <p className="text-xs text-gray-600 font-mono">{srv.ip}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateServer(srv.id, { status: srv.status === "online" ? "offline" : "online" })}
                    className={`text-xs px-2.5 py-1 rounded-full font-medium ${srv.status === "online" ? "bg-green-500/20 text-green-400" : "bg-gray-800 text-gray-500"}`}
                  >
                    {srv.status === "online" ? "онлайн" : "офлайн"}
                  </button>
                  <button onClick={() => removeServer(srv.id)} className="text-gray-600 hover:text-red-400 transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="rounded-lg bg-[#0f0f0f] border border-[#262626] px-3 py-2 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">API-ключ</p>
                  <code className="text-xs text-green-400 font-mono">{srv.apiKey}</code>
                </div>
                <CopyButton text={srv.apiKey} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function SubscriptionTab() {
  const { subscription, setSubscription } = useUser()
  const plans = [
    { id: "month" as const, name: "Старт", price: "299₽/мес", servers: 1, desc: "Базовый доступ, 1 сервер" },
    { id: "quarter" as const, name: "Про", price: "699₽/3 мес", servers: 3, desc: "Приоритетная поддержка, 3 сервера" },
    { id: "forever" as const, name: "Навсегда", price: "1990₽", servers: 999, desc: "∞ серверов, VIP-поддержка" },
  ]
  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-[#1a1a1a] border border-[#262626] p-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 mb-0.5">Текущий план</p>
          <p className={`font-semibold ${TIER_COLORS[subscription]}`}>{TIER_LABELS[subscription]}</p>
        </div>
        {subscription !== "none" && (
          <button onClick={() => setSubscription("none")} className="text-xs text-gray-600 hover:text-red-400 transition-colors">Отменить</button>
        )}
      </div>
      <div className="space-y-3">
        {plans.map((plan) => (
          <div
            key={plan.id}
            onClick={() => setSubscription(plan.id)}
            className={`rounded-xl border p-4 cursor-pointer transition-all hover-lift ${
              subscription === plan.id
                ? "bg-orange-500/10 border-orange-500/40"
                : "bg-[#1a1a1a] border-[#262626] hover:border-orange-500/20"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-white">{plan.name}</p>
                  {subscription === plan.id && <Check className="h-4 w-4 text-orange-400" />}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{plan.desc}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-orange-400">{plan.price}</p>
                <p className="text-xs text-gray-600">{plan.servers === 999 ? "∞" : plan.servers} серв.</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { isLoggedIn, login, logout, ownedPlugins, subscription } = useUser()
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>("plugins")
  const [detailId, setDetailId] = useState<number | null>(null)

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
        <div className="animate-fade-up w-full max-w-sm rounded-2xl bg-[#141414] border border-[#262626] p-8 text-center">
          <div className="h-16 w-16 rounded-2xl bg-orange-500/20 flex items-center justify-center mx-auto mb-5">
            <Crown className="h-8 w-8 text-orange-400" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Личный кабинет</h1>
          <p className="text-sm text-gray-500 mb-6">Войдите, чтобы управлять плагинами и серверами</p>
          <Button onClick={login} className="w-full rounded-full bg-orange-500 text-[#0a0a0a] font-semibold hover:bg-orange-600">
            Войти / Зарегистрироваться
          </Button>
          <button onClick={() => navigate("/")} className="mt-4 text-sm text-gray-600 hover:text-gray-400 transition-colors block w-full">
            ← Вернуться на главную
          </button>
        </div>
      </div>
    )
  }

  const tabs: { id: Tab; label: string; icon: typeof Package }[] = [
    { id: "plugins", label: "Мои плагины", icon: Package },
    { id: "servers", label: "Серверы", icon: Server },
    { id: "subscription", label: "Подписка", icon: Crown },
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Шапка */}
      <header className="border-b border-[#1a1a1a] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/")} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
            ← Главная
          </button>
          <span className="text-gray-700">/</span>
          <span className="text-white font-semibold">Личный кабинет</span>
        </div>
        <div className="flex items-center gap-3">
          {subscription !== "none" && (
            <span className="flex items-center gap-1.5 rounded-full bg-orange-500/15 border border-orange-500/30 px-3 py-1 text-xs font-medium text-orange-400">
              <Crown className="h-3 w-3" /> {TIER_LABELS[subscription]}
            </span>
          )}
          <button onClick={logout} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-white transition-colors">
            <LogOut className="h-4 w-4" /> Выйти
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-1 bg-[#141414] border border-[#262626] rounded-xl p-1 mb-8">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all ${
                tab === id
                  ? "bg-orange-500 text-[#0a0a0a]"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* Содержимое */}
        {tab === "plugins" && (
          <div className="animate-fade-up">
            {ownedPlugins.length === 0 ? (
              <div className="rounded-2xl bg-[#141414] border border-[#262626] p-12 text-center">
                <Package className="h-12 w-12 text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500">Нет купленных плагинов</p>
                <p className="text-gray-600 text-sm mt-1">Перейдите в каталог и купите первый плагин</p>
                <Button onClick={() => navigate("/")} className="mt-5 rounded-full bg-orange-500 text-[#0a0a0a] hover:bg-orange-600 text-sm">
                  Перейти в каталог
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {ownedPlugins.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => setDetailId(p.id)}
                    className="hover-lift rounded-2xl bg-[#141414] border border-[#262626] p-5 cursor-pointer hover:border-orange-500/40 transition-all group"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-xl bg-orange-600 flex items-center justify-center">
                        <Package className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-white group-hover:text-orange-300 transition-colors">{p.name}</p>
                        <p className="text-xs text-gray-500">{p.category} · v{p.version}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-600 group-hover:text-orange-400 transition-colors" />
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">
                        Серверов: <span className="text-white">{p.installedServers.length}</span>
                      </span>
                      <span className="text-gray-600">
                        Whitelist: <span className="text-white">{p.whitelistIps.length} IP</span>
                      </span>
                      <span className="flex items-center gap-1 text-green-400">
                        <Zap className="h-3 w-3" /> Активен
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "servers" && (
          <div className="animate-fade-up">
            <ServersTab />
          </div>
        )}

        {tab === "subscription" && (
          <div className="animate-fade-up">
            <SubscriptionTab />
          </div>
        )}
      </div>

      {detailId !== null && (
        <PluginDetail pluginId={detailId} onClose={() => setDetailId(null)} />
      )}
    </div>
  )
}
