import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useUser } from "@/context/UserContext"
import type { AdminUser, Transaction } from "@/context/UserContext"
import { Button } from "@/components/ui/button"
import {
  Users, Package, ShoppingCart, Settings, ArrowLeft, Search,
  Shield, Ban, CheckCircle, Crown, TrendingUp, Plus, Edit2,
  RotateCcw, Trash2, X, Check, Tag, Star
} from "lucide-react"

type AdminTab = "users" | "plugins" | "transactions" | "settings"

const PLUGIN_CATEGORIES = ["Социальное", "Экономика", "Защита", "Мини-игры", "Строительство", "Карты"]

interface ManagedPlugin {
  id: number
  name: string
  category: string
  price: number
  version: string
  sales: number
  revenue: number
  premium: boolean
  active: boolean
}

const INITIAL_PLUGINS: ManagedPlugin[] = [
  { id: 1, name: "EssentialsX", category: "Социальное", price: 149, version: "2.21.0", sales: 1240, revenue: 184760, premium: true, active: true },
  { id: 2, name: "Vault", category: "Экономика", price: 99, version: "1.7.3", sales: 3500, revenue: 346500, premium: true, active: true },
  { id: 3, name: "WorldGuard", category: "Защита", price: 199, version: "7.0.11", sales: 980, revenue: 195020, premium: true, active: true },
  { id: 4, name: "BedWars", category: "Мини-игры", price: 349, version: "0.9.8", sales: 630, revenue: 219870, premium: false, active: true },
  { id: 5, name: "LuckPerms", category: "Социальное", price: 179, version: "5.4.130", sales: 2100, revenue: 375900, premium: true, active: true },
  { id: 6, name: "PlotSquared", category: "Строительство", price: 249, version: "7.3.9", sales: 740, revenue: 184260, premium: false, active: true },
]

function StatCard({ label, value, icon, color }: { label: string; value: string | number; icon: string; color: string }) {
  return (
    <div className="rounded-2xl bg-[#141414] border border-[#262626] p-5 flex items-center gap-4 hover-lift">
      <div className={`h-12 w-12 rounded-xl ${color} flex items-center justify-center text-xl shrink-0`}>{icon}</div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  )
}

export default function Admin() {
  const navigate = useNavigate()
  const { isLoggedIn, profile, adminUsers, updateAdminUser, transactions, refundTransaction, globalDiscount, setGlobalDiscount } = useUser()
  const [tab, setTab] = useState<AdminTab>("users")
  const [userSearch, setUserSearch] = useState("")
  const [txSearch, setTxSearch] = useState("")
  const [plugins, setPlugins] = useState<ManagedPlugin[]>(INITIAL_PLUGINS)
  const [editingPlugin, setEditingPlugin] = useState<ManagedPlugin | null>(null)
  const [addingPlugin, setAddingPlugin] = useState(false)
  const [newPlugin, setNewPlugin] = useState({ name: "", category: PLUGIN_CATEGORIES[0], price: "", version: "", premium: false })
  const [discountInput, setDiscountInput] = useState(String(globalDiscount))
  const [activeCategories, setActiveCategories] = useState(PLUGIN_CATEGORIES)
  const [newCat, setNewCat] = useState("")

  if (!isLoggedIn || !profile?.isAdmin) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="animate-fade-up text-center rounded-2xl bg-[#141414] border border-[#262626] p-10 max-w-sm mx-4">
          <Shield className="h-14 w-14 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Доступ запрещён</h2>
          <p className="text-gray-500 text-sm mb-6">Эта страница доступна только администраторам</p>
          <Button onClick={() => navigate("/")} className="bg-orange-500 text-[#0a0a0a] hover:bg-orange-600 rounded-full">На главную</Button>
        </div>
      </div>
    )
  }

  const filteredUsers = adminUsers.filter((u) =>
    !userSearch || u.displayName.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase())
  )

  const filteredTx = transactions.filter((t) =>
    !txSearch || t.userName.toLowerCase().includes(txSearch.toLowerCase()) || t.userEmail.toLowerCase().includes(txSearch.toLowerCase())
  )

  const totalRevenue = transactions.filter((t) => t.status === "completed").reduce((s, t) => s + t.total, 0)
  const totalUsers = adminUsers.length
  const totalSales = transactions.filter((t) => t.status === "completed").length
  const activeSubs = adminUsers.filter((u) => u.subscription !== "none").length

  const savePlugin = (p: ManagedPlugin) => {
    setPlugins((prev) => prev.map((x) => x.id === p.id ? p : x))
    setEditingPlugin(null)
  }

  const deletePlugin = (id: number) => {
    setPlugins((prev) => prev.filter((p) => p.id !== id))
  }

  const handleAddPlugin = () => {
    if (!newPlugin.name || !newPlugin.price) return
    const p: ManagedPlugin = {
      id: Date.now(), name: newPlugin.name, category: newPlugin.category,
      price: +newPlugin.price, version: newPlugin.version || "1.0.0",
      sales: 0, revenue: 0, premium: newPlugin.premium, active: true,
    }
    setPlugins((prev) => [...prev, p])
    setNewPlugin({ name: "", category: PLUGIN_CATEGORIES[0], price: "", version: "", premium: false })
    setAddingPlugin(false)
  }

  const TABS = [
    { id: "users" as const, label: "Пользователи", Icon: Users },
    { id: "plugins" as const, label: "Плагины", Icon: Package },
    { id: "transactions" as const, label: "Транзакции", Icon: ShoppingCart },
    { id: "settings" as const, label: "Настройки", Icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Шапка */}
      <header className="border-b border-[#1a1a1a] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/")} className="text-gray-500 hover:text-white transition-colors"><ArrowLeft className="h-5 w-5" /></button>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-orange-400" />
            <span className="text-white font-bold">Админ-панель</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <img src={profile.avatar} className="h-8 w-8 rounded-full border border-orange-500/30" alt={profile.displayName} />
          <span className="text-sm text-gray-300 hidden sm:block">{profile.displayName}</span>
          <span className="text-xs bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded-full">ADMIN</span>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Статистика */}
        <div className="animate-fade-up grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Выручка всего" value={`${totalRevenue.toLocaleString("ru")}₽`} icon="💰" color="bg-green-500/20" />
          <StatCard label="Пользователей" value={totalUsers} icon="👥" color="bg-blue-500/20" />
          <StatCard label="Продаж" value={totalSales} icon="🛒" color="bg-orange-500/20" />
          <StatCard label="Подписчиков" value={activeSubs} icon="👑" color="bg-purple-500/20" />
        </div>

        {/* Навигация */}
        <div className="animate-fade-up delay-100 flex gap-1 bg-[#141414] border border-[#262626] rounded-xl p-1 mb-8">
          {TABS.map(({ id, label, Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs sm:text-sm font-medium transition-all ${
                tab === id ? "bg-orange-500 text-[#0a0a0a]" : "text-gray-400 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* ===== USERS ===== */}
        {tab === "users" && (
          <div className="animate-fade-up">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
                <input value={userSearch} onChange={(e) => setUserSearch(e.target.value)} placeholder="Поиск по имени или email..."
                  className="w-full rounded-xl bg-[#141414] border border-[#262626] pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-orange-500/50" />
              </div>
              <span className="text-xs text-gray-500">{filteredUsers.length} пользователей</span>
            </div>

            <div className="rounded-2xl bg-[#141414] border border-[#262626] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-[#262626]">
                    <tr className="text-left text-xs text-gray-500 uppercase tracking-wide">
                      <th className="px-4 py-3">Пользователь</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3 hidden md:table-cell">Подписка</th>
                      <th className="px-4 py-3 hidden lg:table-cell">Дата рег.</th>
                      <th className="px-4 py-3 hidden lg:table-cell">Покупок</th>
                      <th className="px-4 py-3">Статус</th>
                      <th className="px-4 py-3">Действия</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1a1a1a]">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-[#1a1a1a] transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <img src={u.avatar} className="h-8 w-8 rounded-lg" alt={u.displayName} />
                            <div>
                              <p className="text-white font-medium whitespace-nowrap">{u.displayName}</p>
                              {u.isAdmin && <span className="text-[10px] text-orange-400 font-bold">ADMIN</span>}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-400 text-xs">{u.email}</td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${u.subscription !== "none" ? "bg-orange-500/20 text-orange-400" : "bg-gray-800 text-gray-500"}`}>
                            {u.subscription === "none" ? "—" : u.subscription}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs hidden lg:table-cell">{u.registeredAt}</td>
                        <td className="px-4 py-3 text-white text-center hidden lg:table-cell">{u.purchasesCount}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${u.isBlocked ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400"}`}>
                            {u.isBlocked ? "Заблокирован" : "Активен"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => updateAdminUser(u.id, { isBlocked: !u.isBlocked })}
                              title={u.isBlocked ? "Разблокировать" : "Заблокировать"}
                              className={`h-7 w-7 rounded-lg flex items-center justify-center transition-colors ${u.isBlocked ? "bg-green-500/20 text-green-400 hover:bg-green-500/30" : "bg-red-500/20 text-red-400 hover:bg-red-500/30"}`}
                            >
                              {u.isBlocked ? <CheckCircle className="h-3.5 w-3.5" /> : <Ban className="h-3.5 w-3.5" />}
                            </button>
                            <button
                              onClick={() => updateAdminUser(u.id, { isAdmin: !u.isAdmin })}
                              title={u.isAdmin ? "Снять права" : "Выдать права"}
                              disabled={u.email === "idpestriakov@gmail.com"}
                              className={`h-7 w-7 rounded-lg flex items-center justify-center transition-colors ${u.isAdmin ? "bg-orange-500/20 text-orange-400 hover:bg-orange-500/30" : "bg-gray-800 text-gray-500 hover:text-orange-400"} disabled:opacity-30`}
                            >
                              <Crown className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ===== PLUGINS ===== */}
        {tab === "plugins" && (
          <div className="animate-fade-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Управление плагинами</h3>
              <Button size="sm" onClick={() => setAddingPlugin(true)} className="bg-orange-500 text-[#0a0a0a] hover:bg-orange-600 rounded-full text-xs">
                <Plus className="h-3.5 w-3.5 mr-1" /> Добавить
              </Button>
            </div>

            {addingPlugin && (
              <div className="animate-fade-up mb-4 rounded-2xl bg-[#141414] border border-orange-500/30 p-5">
                <h4 className="text-sm font-semibold text-white mb-4">Новый плагин</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input value={newPlugin.name} onChange={(e) => setNewPlugin((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Название" className="rounded-xl bg-[#0f0f0f] border border-[#2a2a2a] px-3 py-2 text-sm text-white placeholder-gray-600 outline-none focus:border-orange-500/50" />
                  <select value={newPlugin.category} onChange={(e) => setNewPlugin((f) => ({ ...f, category: e.target.value }))}
                    className="rounded-xl bg-[#0f0f0f] border border-[#2a2a2a] px-3 py-2 text-sm text-white outline-none focus:border-orange-500/50">
                    {activeCategories.map((c) => <option key={c}>{c}</option>)}
                  </select>
                  <input value={newPlugin.price} onChange={(e) => setNewPlugin((f) => ({ ...f, price: e.target.value }))}
                    placeholder="Цена (₽)" type="number" className="rounded-xl bg-[#0f0f0f] border border-[#2a2a2a] px-3 py-2 text-sm text-white placeholder-gray-600 outline-none focus:border-orange-500/50" />
                  <input value={newPlugin.version} onChange={(e) => setNewPlugin((f) => ({ ...f, version: e.target.value }))}
                    placeholder="Версия (напр. 1.0.0)" className="rounded-xl bg-[#0f0f0f] border border-[#2a2a2a] px-3 py-2 text-sm text-white placeholder-gray-600 outline-none focus:border-orange-500/50" />
                </div>
                <div className="flex items-center gap-3 mt-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={newPlugin.premium} onChange={(e) => setNewPlugin((f) => ({ ...f, premium: e.target.checked }))} className="accent-orange-500" />
                    <span className="text-sm text-gray-300">Premium</span>
                  </label>
                  <Button size="sm" onClick={handleAddPlugin} className="bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs"><Check className="h-3.5 w-3.5 mr-1" /> Добавить</Button>
                  <Button size="sm" onClick={() => setAddingPlugin(false)} variant="outline" className="border-[#333] text-gray-400 bg-transparent hover:bg-[#1f1f1f] rounded-lg text-xs"><X className="h-3.5 w-3.5 mr-1" /> Отмена</Button>
                </div>
              </div>
            )}

            <div className="rounded-2xl bg-[#141414] border border-[#262626] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-[#262626]">
                    <tr className="text-left text-xs text-gray-500 uppercase tracking-wide">
                      <th className="px-4 py-3">Плагин</th>
                      <th className="px-4 py-3">Цена</th>
                      <th className="px-4 py-3 hidden md:table-cell">Продаж</th>
                      <th className="px-4 py-3 hidden lg:table-cell">Выручка</th>
                      <th className="px-4 py-3">Тип</th>
                      <th className="px-4 py-3">Действия</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1a1a1a]">
                    {plugins.map((p) => (
                      <tr key={p.id} className="hover:bg-[#1a1a1a] transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-orange-600 flex items-center justify-center text-white text-xs font-bold shrink-0">{p.name[0]}</div>
                            <div>
                              <p className="text-white font-medium">{p.name}</p>
                              <p className="text-xs text-gray-600">v{p.version} · {p.category}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-orange-400 font-semibold">{p.price}₽</td>
                        <td className="px-4 py-3 text-white hidden md:table-cell">{p.sales.toLocaleString("ru")}</td>
                        <td className="px-4 py-3 text-green-400 hidden lg:table-cell">{p.revenue.toLocaleString("ru")}₽</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${p.premium ? "bg-orange-500/20 text-orange-400" : "bg-gray-800 text-gray-500"}`}>
                            {p.premium ? "Premium" : "Платный"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => setEditingPlugin({ ...p })} className="h-7 w-7 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 flex items-center justify-center transition-colors">
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => deletePlugin(p.id)} className="h-7 w-7 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 flex items-center justify-center transition-colors">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Редактирование плагина */}
            {editingPlugin && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setEditingPlugin(null)}>
                <div className="animate-fade-up w-full max-w-md rounded-2xl bg-[#141414] border border-[#2a2a2a] p-6" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-bold text-white">Редактировать плагин</h3>
                    <button onClick={() => setEditingPlugin(null)} className="text-gray-600 hover:text-white"><X className="h-5 w-5" /></button>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Название</label>
                      <input value={editingPlugin.name} onChange={(e) => setEditingPlugin((p) => p ? { ...p, name: e.target.value } : p)}
                        className="w-full rounded-xl bg-[#0f0f0f] border border-[#2a2a2a] px-3 py-2 text-sm text-white outline-none focus:border-orange-500/50" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Версия</label>
                      <input value={editingPlugin.version} onChange={(e) => setEditingPlugin((p) => p ? { ...p, version: e.target.value } : p)}
                        className="w-full rounded-xl bg-[#0f0f0f] border border-[#2a2a2a] px-3 py-2 text-sm text-white outline-none focus:border-orange-500/50" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Цена (₽)</label>
                      <input type="number" value={editingPlugin.price} onChange={(e) => setEditingPlugin((p) => p ? { ...p, price: +e.target.value } : p)}
                        className="w-full rounded-xl bg-[#0f0f0f] border border-[#2a2a2a] px-3 py-2 text-sm text-white outline-none focus:border-orange-500/50" />
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={editingPlugin.premium} onChange={(e) => setEditingPlugin((p) => p ? { ...p, premium: e.target.checked } : p)} className="accent-orange-500" />
                      <span className="text-sm text-gray-300">Premium-плагин (доступен по подписке)</span>
                    </label>
                    <Button onClick={() => savePlugin(editingPlugin)} className="w-full bg-orange-500 text-[#0a0a0a] hover:bg-orange-600 rounded-xl">Сохранить</Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===== TRANSACTIONS ===== */}
        {tab === "transactions" && (
          <div className="animate-fade-up">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
                <input value={txSearch} onChange={(e) => setTxSearch(e.target.value)} placeholder="Поиск по пользователю..."
                  className="w-full rounded-xl bg-[#141414] border border-[#262626] pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-orange-500/50" />
              </div>
            </div>

            <div className="space-y-3">
              {filteredTx.map((tx) => (
                <div key={tx.id} className="rounded-2xl bg-[#141414] border border-[#262626] p-4 hover:border-orange-500/20 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-semibold text-white">{tx.userName}</span>
                        <span className="text-xs text-gray-600">{tx.userEmail}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          tx.status === "completed" ? "bg-green-500/20 text-green-400" :
                          tx.status === "refunded" ? "bg-red-500/20 text-red-400" : "bg-yellow-500/20 text-yellow-400"
                        }`}>{tx.status === "completed" ? "Завершена" : tx.status === "refunded" ? "Возврат" : "Ожидание"}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {tx.items.map((item) => (
                          <span key={item.id} className="text-xs bg-[#1a1a1a] border border-[#2a2a2a] text-gray-400 px-2 py-0.5 rounded-full">{item.name} · {item.price}₽</span>
                        ))}
                      </div>
                      <p className="text-xs text-gray-600">{tx.createdAt} · ID: {tx.id}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-lg font-bold text-white">{tx.total}₽</p>
                      {tx.status === "completed" && (
                        <button
                          onClick={() => refundTransaction(tx.id)}
                          className="mt-1 flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors"
                        >
                          <RotateCcw className="h-3 w-3" /> Возврат
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== SETTINGS ===== */}
        {tab === "settings" && (
          <div className="animate-fade-up grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl bg-[#141414] border border-[#262626] p-5">
              <h3 className="text-sm font-semibold text-gray-400 mb-4 flex items-center gap-2 uppercase tracking-wide">
                <Tag className="h-4 w-4" /> Глобальная скидка
              </h3>
              <div className="flex items-center gap-3">
                <input
                  type="number" min="0" max="99"
                  value={discountInput}
                  onChange={(e) => setDiscountInput(e.target.value)}
                  className="w-24 rounded-xl bg-[#0f0f0f] border border-[#2a2a2a] px-3 py-2 text-sm text-white outline-none focus:border-orange-500/50 text-center"
                />
                <span className="text-gray-500">%</span>
                <Button size="sm" onClick={() => setGlobalDiscount(+discountInput)} className="bg-orange-500 text-[#0a0a0a] hover:bg-orange-600 rounded-lg text-xs">
                  Применить
                </Button>
              </div>
              {globalDiscount > 0 && (
                <p className="mt-2 text-xs text-green-400">Активна скидка {globalDiscount}% на все товары</p>
              )}
            </div>

            <div className="rounded-2xl bg-[#141414] border border-[#262626] p-5">
              <h3 className="text-sm font-semibold text-gray-400 mb-4 flex items-center gap-2 uppercase tracking-wide">
                <Package className="h-4 w-4" /> Категории плагинов
              </h3>
              <div className="space-y-2 mb-3">
                {activeCategories.map((cat) => (
                  <div key={cat} className="flex items-center justify-between rounded-lg bg-[#0f0f0f] px-3 py-2">
                    <span className="text-sm text-white">{cat}</span>
                    <button onClick={() => setActiveCategories((prev) => prev.filter((c) => c !== cat))} className="text-gray-700 hover:text-red-400 transition-colors">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input value={newCat} onChange={(e) => setNewCat(e.target.value)} placeholder="Новая категория"
                  className="flex-1 rounded-xl bg-[#0f0f0f] border border-[#2a2a2a] px-3 py-2 text-sm text-white placeholder-gray-600 outline-none focus:border-orange-500/50" />
                <Button size="sm" onClick={() => { if (newCat.trim()) { setActiveCategories((prev) => [...prev, newCat.trim()]); setNewCat("") } }}
                  className="bg-orange-500 text-[#0a0a0a] hover:bg-orange-600 rounded-lg"><Plus className="h-4 w-4" /></Button>
              </div>
            </div>

            <div className="rounded-2xl bg-[#141414] border border-[#262626] p-5">
              <h3 className="text-sm font-semibold text-gray-400 mb-4 flex items-center gap-2 uppercase tracking-wide">
                <TrendingUp className="h-4 w-4" /> Статистика платформы
              </h3>
              <div className="space-y-2">
                {[
                  { label: "Всего плагинов", value: plugins.length },
                  { label: "Активных пользователей", value: adminUsers.filter((u) => !u.isBlocked).length },
                  { label: "Premium-плагинов", value: plugins.filter((p) => p.premium).length },
                  { label: "Общая выручка", value: `${totalRevenue.toLocaleString("ru")}₽` },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center rounded-lg bg-[#0f0f0f] px-3 py-2.5">
                    <span className="text-sm text-gray-400">{label}</span>
                    <span className="font-semibold text-white">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-[#141414] border border-[#262626] p-5">
              <h3 className="text-sm font-semibold text-gray-400 mb-4 flex items-center gap-2 uppercase tracking-wide">
                <Star className="h-4 w-4" /> Способы оплаты
              </h3>
              <div className="space-y-2">
                {["YooMoney", "Robokassa", "Криптовалюта", "Банковская карта"].map((method, i) => (
                  <div key={method} className="flex items-center justify-between rounded-lg bg-[#0f0f0f] px-3 py-2.5">
                    <span className="text-sm text-gray-300">{method}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${i < 2 ? "bg-green-500/20 text-green-400" : "bg-gray-800 text-gray-500"}`}>
                      {i < 2 ? "Активен" : "Скоро"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
