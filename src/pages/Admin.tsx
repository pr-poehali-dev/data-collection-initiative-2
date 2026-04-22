import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useUser } from "@/context/UserContext"
import type { AdminUser, ManagedPlugin, IpSlotEntry } from "@/context/UserContext"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import {
  Users, Package, ShoppingCart, Settings, ArrowLeft, Search,
  Shield, Ban, CheckCircle, Crown, TrendingUp, Plus, Edit2,
  RotateCcw, Trash2, X, Check, Tag, Loader2, AlertTriangle,
  ScrollText, Wifi, Star, ChevronLeft, Save, Image, Video,
  Network, UserCheck, RefreshCw
} from "lucide-react"

type AdminTab = "users" | "plugins" | "transactions" | "settings" | "log" | "ipslots"

const PLUGIN_CATEGORIES = ["Социальное", "Экономика", "Защита", "Мини-игры", "Строительство", "Карты"]

interface ConfirmDialog {
  title: string
  description: string
  confirmLabel?: string
  variant?: "danger" | "warn"
  action: () => Promise<void>
}

// ─── Confirm Modal ────────────────────────────────────────────────────────────
function ConfirmModal({ dialog, onCancel }: { dialog: ConfirmDialog; onCancel: () => void }) {
  const [running, setRunning] = useState(false)
  const handleConfirm = async () => {
    setRunning(true)
    await dialog.action()
    setRunning(false)
    onCancel()
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="animate-fade-up w-full max-w-sm rounded-2xl bg-[#141414] border border-red-500/30 p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-10 w-10 rounded-xl bg-red-500/20 flex items-center justify-center shrink-0">
            <AlertTriangle className="h-5 w-5 text-red-400" />
          </div>
          <h3 className="text-base font-bold text-white">{dialog.title}</h3>
        </div>
        <p className="text-sm text-gray-400 mb-5">{dialog.description}</p>
        <div className="flex gap-3">
          <Button onClick={handleConfirm} disabled={running}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl disabled:opacity-50">
            {running ? <Loader2 className="h-4 w-4 animate-spin" /> : (dialog.confirmLabel || "Подтвердить")}
          </Button>
          <Button onClick={onCancel} variant="outline" className="flex-1 border-[#333] text-gray-400 bg-transparent hover:bg-[#1f1f1f] rounded-xl">
            Отмена
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
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

// ─── Plugin Editor ────────────────────────────────────────────────────────────
function PluginEditor({
  plugin, categories, onSave, onCancel, readOnly,
}: {
  plugin: ManagedPlugin | null
  categories: string[]
  onSave: (p: ManagedPlugin) => Promise<void>
  onCancel: () => void
  readOnly: boolean
}) {
  const isNew = plugin === null
  const blank: ManagedPlugin = {
    id: Date.now(), name: "", description: "", category: categories[0] || "Социальное",
    price: 0, version: "1.0.0", compatibility: "1.18–1.21", sales: 0, revenue: 0,
    premium: false, active: true, screenshots: [], videoUrl: "",
    whitelistEnabled: false, defaultIpSlots: 1, extraIpSlotPrice: 49,
  }
  const [form, setForm] = useState<ManagedPlugin>(plugin || blank)
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(isNew)
  const [newScreenshot, setNewScreenshot] = useState("")

  const set = <K extends keyof ManagedPlugin>(key: K, val: ManagedPlugin[K]) => {
    setForm((f) => ({ ...f, [key]: val }))
    setDirty(true)
  }

  const handleSave = async () => {
    if (!form.name.trim() || form.price < 0) return
    setSaving(true)
    await onSave(form)
    setSaving(false)
    setDirty(false)
  }

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div>
      <label className="text-xs text-gray-500 mb-1 block font-medium uppercase tracking-wide">{label}</label>
      {children}
    </div>
  )

  const inp = "w-full rounded-xl bg-[#0f0f0f] border border-[#2a2a2a] px-3 py-2 text-sm text-white placeholder-gray-600 outline-none focus:border-orange-500/50 transition-colors disabled:opacity-40"

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-8 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="animate-fade-up w-full max-w-2xl rounded-2xl bg-[#141414] border border-[#2a2a2a] p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Package className="h-5 w-5 text-orange-400" />
            {isNew ? "Новый плагин" : `Редактировать: ${plugin?.name}`}
          </h3>
          <button onClick={onCancel} className="text-gray-600 hover:text-white transition-colors"><X className="h-5 w-5" /></button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Название">
            <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="EssentialsX" className={inp} disabled={readOnly} />
          </Field>
          <Field label="Версия">
            <input value={form.version} onChange={(e) => set("version", e.target.value)} placeholder="2.0.0" className={inp} disabled={readOnly} />
          </Field>
          <Field label="Цена (₽)">
            <input type="number" min="0" value={form.price} onChange={(e) => set("price", +e.target.value)} className={inp} disabled={readOnly} />
          </Field>
          <Field label="Категория">
            <select value={form.category} onChange={(e) => set("category", e.target.value)} className={inp} disabled={readOnly}>
              {categories.map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Совместимость">
            <input value={form.compatibility} onChange={(e) => set("compatibility", e.target.value)} placeholder="1.18–1.21" className={inp} disabled={readOnly} />
          </Field>
          <Field label="Видео-превью (URL)">
            <div className="relative">
              <Video className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-600" />
              <input value={form.videoUrl} onChange={(e) => set("videoUrl", e.target.value)} placeholder="https://youtube.com/..." className={`${inp} pl-9`} disabled={readOnly} />
            </div>
          </Field>
        </div>

        <Field label="Описание (Markdown поддерживается)">
          <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={4}
            placeholder="# Название плагина&#10;&#10;**Краткое описание** возможностей.&#10;&#10;## Функции&#10;- Функция 1&#10;- Функция 2"
            className={`${inp} mt-1 resize-none`} disabled={readOnly} />
        </Field>

        {/* Скриншоты */}
        <div className="mt-4">
          <label className="text-xs text-gray-500 mb-2 block font-medium uppercase tracking-wide">Скриншоты</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {form.screenshots.map((url, i) => (
              <div key={i} className="relative group">
                <div className="h-16 w-24 rounded-lg bg-[#0f0f0f] border border-[#2a2a2a] flex items-center justify-center overflow-hidden">
                  <Image className="h-5 w-5 text-gray-700" />
                  <span className="absolute bottom-0 left-0 right-0 text-[9px] text-gray-600 text-center truncate px-1 pb-0.5">{url.slice(-20)}</span>
                </div>
                {!readOnly && (
                  <button onClick={() => set("screenshots", form.screenshots.filter((_, j) => j !== i))}
                    className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="h-2.5 w-2.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
          {!readOnly && (
            <div className="flex gap-2">
              <input value={newScreenshot} onChange={(e) => setNewScreenshot(e.target.value)} placeholder="URL скриншота..." className={`${inp} flex-1`} />
              <Button size="sm" onClick={() => { if (newScreenshot.trim()) { set("screenshots", [...form.screenshots, newScreenshot.trim()]); setNewScreenshot("") } }}
                className="bg-[#1a1a1a] border border-[#333] text-gray-300 hover:text-white rounded-xl shrink-0">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Настройки плагина */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl bg-[#0f0f0f] border border-[#2a2a2a] p-4">
          <div className="flex items-center justify-between col-span-full">
            <div>
              <p className="text-sm font-medium text-white">Premium-плагин</p>
              <p className="text-xs text-gray-600">Доступен только по подписке</p>
            </div>
            <button disabled={readOnly} onClick={() => set("premium", !form.premium)}
              className={`relative h-6 w-11 rounded-full transition-colors ${form.premium ? "bg-orange-500" : "bg-[#2a2a2a]"} disabled:opacity-40`}>
              <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${form.premium ? "left-6" : "left-1"}`} />
            </button>
          </div>
          <div className="flex items-center justify-between col-span-full">
            <div>
              <p className="text-sm font-medium text-white">Белый список IP</p>
              <p className="text-xs text-gray-600">Плагин будет работать только с разрешённых IP</p>
            </div>
            <button disabled={readOnly} onClick={() => set("whitelistEnabled", !form.whitelistEnabled)}
              className={`relative h-6 w-11 rounded-full transition-colors ${form.whitelistEnabled ? "bg-orange-500" : "bg-[#2a2a2a]"} disabled:opacity-40`}>
              <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${form.whitelistEnabled ? "left-6" : "left-1"}`} />
            </button>
          </div>
          {form.whitelistEnabled && (
            <>
              <Field label="IP-слотов при покупке">
                <input type="number" min="1" max="100" value={form.defaultIpSlots}
                  onChange={(e) => set("defaultIpSlots", +e.target.value)} className={inp} disabled={readOnly} />
              </Field>
              <Field label="Цена доп. слота (₽)">
                <input type="number" min="0" value={form.extraIpSlotPrice}
                  onChange={(e) => set("extraIpSlotPrice", +e.target.value)} className={inp} disabled={readOnly} />
              </Field>
            </>
          )}
        </div>

        {!readOnly && (
          <div className="flex items-center gap-3 mt-6">
            <Button onClick={handleSave} disabled={!dirty || saving || !form.name.trim()}
              className="flex-1 bg-orange-500 text-[#0a0a0a] hover:bg-orange-600 rounded-xl font-semibold disabled:opacity-40 transition-all">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              {dirty ? "Сохранить изменения" : "Сохранено"}
            </Button>
            <Button onClick={onCancel} variant="outline" className="border-[#333] text-gray-400 bg-transparent hover:bg-[#1f1f1f] rounded-xl">
              Отмена
            </Button>
          </div>
        )}
        {readOnly && (
          <Button onClick={onCancel} className="w-full mt-6 bg-[#1a1a1a] border border-[#333] text-gray-300 hover:bg-[#252525] rounded-xl">
            <ChevronLeft className="h-4 w-4 mr-2" /> Закрыть
          </Button>
        )}
      </div>
    </div>
  )
}

// ─── IP Slots Panel ───────────────────────────────────────────────────────────
function IpSlotsPanel({ slots, onAddIp, onRemoveIp, onAddSlot }: {
  slots: IpSlotEntry[]
  onAddIp: (userId: string, pluginId: number, ip: string) => void
  onRemoveIp: (userId: string, pluginId: number, ip: string) => void
  onAddSlot: (userId: string, pluginId: number) => void
}) {
  const [ipInputs, setIpInputs] = useState<Record<string, string>>({})
  const [search, setSearch] = useState("")

  const filtered = slots.filter((s) =>
    !search || s.userName.toLowerCase().includes(search.toLowerCase()) ||
    s.userEmail.toLowerCase().includes(search.toLowerCase()) ||
    s.pluginName.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Поиск по пользователю или плагину..."
            className="w-full rounded-xl bg-[#141414] border border-[#262626] pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-orange-500/50" />
        </div>
        <span className="text-xs text-gray-500">{filtered.length} записей</span>
      </div>

      <div className="space-y-3">
        {filtered.map((slot) => {
          const key = `${slot.userId}_${slot.pluginId}`
          const used = slot.ips.length
          const total = slot.maxSlots + slot.extraSlots
          const pct = total > 0 ? (used / total) * 100 : 0
          return (
            <div key={key} className="rounded-2xl bg-[#141414] border border-[#262626] p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-white">{slot.userName}</p>
                  <p className="text-xs text-gray-500">{slot.userEmail}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded-full">{slot.pluginName}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 mb-3">
                <div className="flex-1 h-2 bg-[#2a2a2a] rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${pct > 80 ? "bg-red-500" : pct > 50 ? "bg-yellow-500" : "bg-green-500"}`} style={{ width: `${pct}%` }} />
                </div>
                <span className="text-xs text-gray-400 shrink-0">{used}/{total} слотов</span>
                <Button size="sm" onClick={() => onAddSlot(slot.userId, slot.pluginId)}
                  className="h-6 px-2 text-xs bg-[#1a1a1a] border border-[#333] text-gray-400 hover:text-orange-400 rounded-lg">
                  +1 слот
                </Button>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-3">
                {slot.ips.map((ip) => (
                  <div key={ip} className="flex items-center gap-1 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg px-2 py-1">
                    <Wifi className="h-3 w-3 text-green-400" />
                    <span className="text-xs text-gray-300 font-mono">{ip}</span>
                    <button onClick={() => onRemoveIp(slot.userId, slot.pluginId, ip)} className="ml-0.5 text-gray-700 hover:text-red-400 transition-colors">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {used === 0 && <span className="text-xs text-gray-700 italic">Нет IP-адресов</span>}
              </div>

              {used < total && (
                <div className="flex gap-2">
                  <input
                    value={ipInputs[key] || ""}
                    onChange={(e) => setIpInputs((prev) => ({ ...prev, [key]: e.target.value }))}
                    placeholder="192.168.1.1"
                    className="flex-1 rounded-lg bg-[#0f0f0f] border border-[#2a2a2a] px-3 py-1.5 text-xs text-white placeholder-gray-600 outline-none focus:border-orange-500/50 font-mono"
                  />
                  <Button size="sm" onClick={() => {
                    const ip = (ipInputs[key] || "").trim()
                    if (ip) { onAddIp(slot.userId, slot.pluginId, ip); setIpInputs((prev) => ({ ...prev, [key]: "" })) }
                  }} className="bg-orange-500 text-[#0a0a0a] hover:bg-orange-600 rounded-lg text-xs h-7">
                    Добавить
                  </Button>
                </div>
              )}
              {used >= total && (
                <p className="text-xs text-red-400">Все слоты заняты. Добавьте дополнительный слот.</p>
              )}
            </div>
          )
        })}
        {filtered.length === 0 && (
          <div className="rounded-2xl bg-[#141414] border border-[#262626] p-10 text-center">
            <Network className="h-10 w-10 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Нет записей об IP-слотах</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Admin() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const {
    isLoggedIn, profile, currentUserRole,
    adminUsers, updateAdminUser,
    transactions, refundTransaction,
    globalDiscount, setGlobalDiscount,
    adminLog, logAdminAction,
    managedPlugins, setManagedPlugins,
    ipSlots, addIpToSlot, removeIpFromSlot, addExtraSlot, grantPluginAccess,
  } = useUser()

  const isAdmin = currentUserRole === "admin"
  const isModerator = currentUserRole === "moderator"
  const canAccess = isAdmin || isModerator

  const [tab, setTab] = useState<AdminTab>(isAdmin ? "users" : "plugins")
  const [userSearch, setUserSearch] = useState("")
  const [txSearch, setTxSearch] = useState("")
  const [editingPlugin, setEditingPlugin] = useState<ManagedPlugin | null | "new">(null)
  const [discountInput, setDiscountInput] = useState(String(globalDiscount))
  const [activeCategories, setActiveCategories] = useState(PLUGIN_CATEGORIES)
  const [newCat, setNewCat] = useState("")
  const [loading, setLoading] = useState<string | null>(null)
  const [confirm, setConfirm] = useState<ConfirmDialog | null>(null)
  const [refundReason, setRefundReason] = useState("")
  const [grantForm, setGrantForm] = useState({ userId: "", pluginId: 0 })

  useEffect(() => { setDiscountInput(String(globalDiscount)) }, [globalDiscount])

  if (!canAccess) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="animate-fade-up text-center rounded-2xl bg-[#141414] border border-[#262626] p-10 max-w-sm mx-4">
          <Shield className="h-14 w-14 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Доступ запрещён</h2>
          <p className="text-gray-500 text-sm mb-6">Требуется роль Администратора или Модератора</p>
          <Button onClick={() => navigate("/")} className="bg-orange-500 text-[#0a0a0a] hover:bg-orange-600 rounded-full">На главную</Button>
        </div>
      </div>
    )
  }

  const sim = async (id: string) => { setLoading(id); await new Promise((r) => setTimeout(r, 500)); setLoading(null) }

  const filteredUsers = adminUsers.filter((u) =>
    !userSearch || u.displayName.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase())
  )
  const filteredTx = transactions.filter((t) =>
    !txSearch || t.userName.toLowerCase().includes(txSearch.toLowerCase()) || t.userEmail.toLowerCase().includes(txSearch.toLowerCase())
  )

  const totalRevenue = transactions.filter((t) => t.status === "completed").reduce((s, t) => s + t.total, 0)
  const totalSales = transactions.filter((t) => t.status === "completed").length
  const activeSubs = adminUsers.filter((u) => u.subscription !== "none").length

  // Handlers
  const handleToggleBlock = (u: AdminUser) => {
    if (!isAdmin) return
    setConfirm({
      title: `${u.isBlocked ? "Разблокировать" : "Заблокировать"} пользователя?`,
      description: `${u.displayName} (${u.email})`,
      confirmLabel: u.isBlocked ? "Разблокировать" : "Заблокировать",
      action: async () => {
        await sim(`block_${u.id}`)
        updateAdminUser(u.id, { isBlocked: !u.isBlocked })
        logAdminAction(u.isBlocked ? "Разблокировать пользователя" : "Заблокировать пользователя", u.email)
        toast({ title: u.isBlocked ? "Разблокирован" : "Заблокирован", description: u.email })
      },
    })
  }

  const handleSetRole = (u: AdminUser, role: "admin" | "moderator" | "user") => {
    if (!isAdmin || u.email === "idpestriakov@gmail.com") return
    const roleLabels: Record<string, string> = { admin: "Администратор", moderator: "Модератор", user: "Пользователь" }
    setConfirm({
      title: `Назначить роль «${roleLabels[role]}»?`,
      description: `Пользователь: ${u.displayName} (${u.email})`,
      action: async () => {
        await sim(`role_${u.id}`)
        updateAdminUser(u.id, { role, isAdmin: role === "admin", isModerator: role === "moderator" })
        logAdminAction(`Назначить роль ${roleLabels[role]}`, u.email)
        toast({ title: "Роль изменена", description: `${u.displayName} → ${roleLabels[role]}` })
      },
    })
  }

  const handleDeletePlugin = (p: ManagedPlugin) => {
    if (!isAdmin) return
    setConfirm({
      title: "Удалить плагин?",
      description: `«${p.name}» будет удалён из каталога навсегда.`,
      action: async () => {
        await sim(`del_${p.id}`)
        setManagedPlugins((prev) => prev.filter((x) => x.id !== p.id))
        logAdminAction("Удалить плагин", p.name)
        toast({ title: "Плагин удалён", description: p.name })
      },
    })
  }

  const handleSavePlugin = async (p: ManagedPlugin) => {
    await sim(`save_${p.id}`)
    setManagedPlugins((prev) => {
      const exists = prev.find((x) => x.id === p.id)
      return exists ? prev.map((x) => x.id === p.id ? p : x) : [...prev, p]
    })
    logAdminAction(editingPlugin === "new" ? "Добавить плагин" : "Редактировать плагин", p.name)
    toast({ title: editingPlugin === "new" ? "Плагин добавлен" : "Плагин сохранён", description: `${p.name} v${p.version}` })
    setEditingPlugin(null)
  }

  const handleRefund = (txId: string, txTotal: number) => {
    setConfirm({
      title: "Оформить возврат?",
      description: `Сумма: ${txTotal}₽. Причина: ${refundReason || "не указана"}`,
      action: async () => {
        await sim(`refund_${txId}`)
        refundTransaction(txId)
        logAdminAction(`Возврат (${refundReason || "без причины"})`, txId)
        toast({ title: "Возврат оформлен", description: `${txId} · ${txTotal}₽` })
        setRefundReason("")
      },
    })
  }

  const handleGrantAccess = () => {
    if (!grantForm.userId || !grantForm.pluginId) return
    grantPluginAccess(grantForm.userId, grantForm.pluginId)
    const u = adminUsers.find((x) => x.id === grantForm.userId)
    const p = managedPlugins.find((x) => x.id === grantForm.pluginId)
    logAdminAction("Выдать доступ к плагину", `${u?.displayName} → ${p?.name}`)
    toast({ title: "Доступ выдан", description: `${u?.displayName} получил доступ к ${p?.name}` })
    setGrantForm({ userId: "", pluginId: 0 })
  }

  // Tabs (разные для admin vs moderator)
  const ALL_TABS = [
    { id: "users" as const, label: "Пользователи", Icon: Users, adminOnly: true },
    { id: "plugins" as const, label: "Плагины", Icon: Package, adminOnly: false },
    { id: "transactions" as const, label: "Транзакции", Icon: ShoppingCart, adminOnly: false },
    { id: "ipslots" as const, label: "IP-слоты", Icon: Network, adminOnly: false },
    { id: "settings" as const, label: "Настройки", Icon: Settings, adminOnly: true },
    { id: "log" as const, label: "Журнал", Icon: ScrollText, adminOnly: true },
  ]
  const TABS = ALL_TABS.filter((t) => isAdmin || !t.adminOnly)

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {confirm && <ConfirmModal dialog={confirm} onCancel={() => setConfirm(null)} />}
      {editingPlugin !== null && (
        <PluginEditor
          plugin={editingPlugin === "new" ? null : editingPlugin}
          categories={activeCategories}
          onSave={handleSavePlugin}
          onCancel={() => setEditingPlugin(null)}
          readOnly={isModerator && !isAdmin ? false : false}
        />
      )}

      <header className="border-b border-[#1a1a1a] px-6 py-4 flex items-center justify-between sticky top-0 z-30 bg-[#0a0a0a]/90 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/")} className="text-gray-500 hover:text-white transition-colors"><ArrowLeft className="h-5 w-5" /></button>
          <Shield className="h-5 w-5 text-orange-400" />
          <span className="text-white font-bold">
            {isAdmin ? "Админ-панель" : "Панель модератора"}
          </span>
          {isModerator && !isAdmin && (
            <span className="text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full">МОДЕРАТОР</span>
          )}
        </div>
        {profile && (
          <div className="flex items-center gap-2">
            <img src={profile.avatar} className="h-8 w-8 rounded-full border border-orange-500/30" alt={profile.displayName} />
            <span className="text-sm text-gray-300 hidden sm:block">{profile.displayName}</span>
            <span className="text-xs bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded-full uppercase">{currentUserRole}</span>
          </div>
        )}
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Стата */}
        <div className="animate-fade-up grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Выручка" value={`${totalRevenue.toLocaleString("ru")}₽`} icon="💰" color="bg-green-500/20" />
          <StatCard label="Пользователей" value={adminUsers.length} icon="👥" color="bg-blue-500/20" />
          <StatCard label="Продаж" value={totalSales} icon="🛒" color="bg-orange-500/20" />
          <StatCard label="Подписчиков" value={activeSubs} icon="👑" color="bg-purple-500/20" />
        </div>

        {/* Навигация */}
        <div className="animate-fade-up delay-100 flex gap-1 bg-[#141414] border border-[#262626] rounded-xl p-1 mb-8 overflow-x-auto">
          {TABS.map(({ id, label, Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2.5 text-xs sm:text-sm font-medium transition-all ${
                tab === id ? "bg-orange-500 text-[#0a0a0a]" : "text-gray-400 hover:text-white"
              }`}>
              <Icon className="h-4 w-4" /><span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* ===== USERS ===== */}
        {tab === "users" && isAdmin && (
          <div className="animate-fade-up">
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <div className="relative flex-1 min-w-48 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
                <input value={userSearch} onChange={(e) => setUserSearch(e.target.value)} placeholder="Поиск..."
                  className="w-full rounded-xl bg-[#141414] border border-[#262626] pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-orange-500/50" />
              </div>
              <span className="text-xs text-gray-500">{filteredUsers.length} / {adminUsers.length}</span>
            </div>

            {/* Выдача доступа модератором */}
            <div className="rounded-xl bg-[#141414] border border-[#262626] p-4 mb-4">
              <p className="text-xs text-gray-500 mb-3 uppercase tracking-wide font-medium">Выдать доступ к плагину</p>
              <div className="flex gap-3 flex-wrap">
                <select value={grantForm.userId} onChange={(e) => setGrantForm((f) => ({ ...f, userId: e.target.value }))}
                  className="flex-1 min-w-36 rounded-xl bg-[#0f0f0f] border border-[#2a2a2a] px-3 py-2 text-sm text-white outline-none focus:border-orange-500/50">
                  <option value="">Пользователь...</option>
                  {adminUsers.map((u) => <option key={u.id} value={u.id}>{u.displayName}</option>)}
                </select>
                <select value={grantForm.pluginId} onChange={(e) => setGrantForm((f) => ({ ...f, pluginId: +e.target.value }))}
                  className="flex-1 min-w-36 rounded-xl bg-[#0f0f0f] border border-[#2a2a2a] px-3 py-2 text-sm text-white outline-none focus:border-orange-500/50">
                  <option value={0}>Плагин...</option>
                  {managedPlugins.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <Button onClick={handleGrantAccess} disabled={!grantForm.userId || !grantForm.pluginId}
                  className="bg-orange-500 text-[#0a0a0a] hover:bg-orange-600 rounded-xl text-sm disabled:opacity-40">
                  <UserCheck className="h-4 w-4 mr-2" /> Выдать
                </Button>
              </div>
            </div>

            <div className="rounded-2xl bg-[#141414] border border-[#262626] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-[#262626]">
                    <tr className="text-left text-xs text-gray-500 uppercase tracking-wide">
                      <th className="px-4 py-3">Пользователь</th>
                      <th className="px-4 py-3 hidden md:table-cell">Роль</th>
                      <th className="px-4 py-3 hidden lg:table-cell">Рег.</th>
                      <th className="px-4 py-3 hidden lg:table-cell">Покупок</th>
                      <th className="px-4 py-3">Статус</th>
                      <th className="px-4 py-3">Действия</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1a1a1a]">
                    {filteredUsers.map((u) => {
                      const busy = loading?.startsWith(`block_${u.id}`) || loading?.startsWith(`role_${u.id}`)
                      const roleColors: Record<string, string> = { admin: "bg-orange-500/20 text-orange-400", moderator: "bg-blue-500/20 text-blue-400", user: "bg-gray-800 text-gray-500" }
                      const roleLabels: Record<string, string> = { admin: "Admin", moderator: "Moder", user: "User" }
                      return (
                        <tr key={u.id} className="hover:bg-[#1a1a1a] transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <img src={u.avatar} className="h-8 w-8 rounded-lg shrink-0" alt={u.displayName} />
                              <div>
                                <p className="text-white font-medium">{u.displayName}</p>
                                <p className="text-xs text-gray-600">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${roleColors[u.role || "user"]}`}>{roleLabels[u.role || "user"]}</span>
                          </td>
                          <td className="px-4 py-3 text-gray-500 text-xs hidden lg:table-cell">{u.registeredAt}</td>
                          <td className="px-4 py-3 text-white text-center hidden lg:table-cell">{u.purchasesCount}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${u.isBlocked ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400"}`}>
                              {u.isBlocked ? "Блок" : "Активен"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {busy ? <Loader2 className="h-4 w-4 animate-spin text-gray-500" /> : (
                              <div className="flex items-center gap-1">
                                <button onClick={() => handleToggleBlock(u)} title={u.isBlocked ? "Разблокировать" : "Заблокировать"}
                                  disabled={u.email === "idpestriakov@gmail.com"}
                                  className={`h-7 w-7 rounded-lg flex items-center justify-center transition-colors disabled:opacity-30 ${u.isBlocked ? "bg-green-500/20 text-green-400 hover:bg-green-500/30" : "bg-red-500/20 text-red-400 hover:bg-red-500/30"}`}>
                                  {u.isBlocked ? <CheckCircle className="h-3.5 w-3.5" /> : <Ban className="h-3.5 w-3.5" />}
                                </button>
                                {/* Роли */}
                                {u.role !== "admin" && (
                                  <button onClick={() => handleSetRole(u, u.isModerator ? "user" : "moderator")}
                                    title={u.isModerator ? "Снять Модератора" : "Назначить Модератором"}
                                    className={`h-7 w-7 rounded-lg flex items-center justify-center transition-colors ${u.isModerator ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30" : "bg-gray-800 text-gray-500 hover:text-blue-400"}`}>
                                    <Shield className="h-3.5 w-3.5" />
                                  </button>
                                )}
                                {u.role !== "admin" && (
                                  <button onClick={() => handleSetRole(u, u.isAdmin ? "user" : "admin")}
                                    title={u.isAdmin ? "Снять Админа" : "Назначить Админом"}
                                    disabled={u.email === "idpestriakov@gmail.com"}
                                    className={`h-7 w-7 rounded-lg flex items-center justify-center transition-colors disabled:opacity-30 ${u.isAdmin ? "bg-orange-500/20 text-orange-400 hover:bg-orange-500/30" : "bg-gray-800 text-gray-500 hover:text-orange-400"}`}>
                                    <Crown className="h-3.5 w-3.5" />
                                  </button>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      )
                    })}
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
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Каталог плагинов</h3>
              {isAdmin && (
                <Button size="sm" onClick={() => setEditingPlugin("new")} className="bg-orange-500 text-[#0a0a0a] hover:bg-orange-600 rounded-full text-xs">
                  <Plus className="h-3.5 w-3.5 mr-1" /> Добавить плагин
                </Button>
              )}
            </div>

            <div className="rounded-2xl bg-[#141414] border border-[#262626] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-[#262626]">
                    <tr className="text-left text-xs text-gray-500 uppercase tracking-wide">
                      <th className="px-4 py-3">Плагин</th>
                      <th className="px-4 py-3">Цена</th>
                      <th className="px-4 py-3 hidden md:table-cell">Продаж</th>
                      <th className="px-4 py-3 hidden lg:table-cell">Выручка</th>
                      <th className="px-4 py-3 hidden sm:table-cell">IP WL</th>
                      <th className="px-4 py-3">Действия</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1a1a1a]">
                    {managedPlugins.map((p) => (
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
                        <td className="px-4 py-3 hidden sm:table-cell">
                          {p.whitelistEnabled
                            ? <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">Вкл · {p.defaultIpSlots} слотов</span>
                            : <span className="text-xs text-gray-600">—</span>}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => setEditingPlugin(p)} className="h-7 w-7 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 flex items-center justify-center transition-colors" title="Редактировать">
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            {isAdmin && (
                              <button onClick={() => handleDeletePlugin(p)} className="h-7 w-7 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 flex items-center justify-center transition-colors" title="Удалить">
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
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

        {/* ===== TRANSACTIONS ===== */}
        {tab === "transactions" && (
          <div className="animate-fade-up">
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <div className="relative flex-1 min-w-48 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
                <input value={txSearch} onChange={(e) => setTxSearch(e.target.value)} placeholder="Поиск..."
                  className="w-full rounded-xl bg-[#141414] border border-[#262626] pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-orange-500/50" />
              </div>
            </div>

            {/* Поле причины возврата */}
            <div className="rounded-xl bg-[#141414] border border-[#262626] p-4 mb-4 flex gap-3 items-center">
              <input value={refundReason} onChange={(e) => setRefundReason(e.target.value)} placeholder="Причина возврата (необязательно)..."
                className="flex-1 rounded-xl bg-[#0f0f0f] border border-[#2a2a2a] px-3 py-2 text-sm text-white placeholder-gray-600 outline-none focus:border-orange-500/50" />
              <RefreshCw className="h-4 w-4 text-gray-600 shrink-0" />
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
                        {tx.paymentMethod && <span className="text-xs text-gray-600">· {tx.paymentMethod}</span>}
                      </div>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {tx.items.map((item) => (
                          <span key={item.id} className="text-xs bg-[#1a1a1a] border border-[#2a2a2a] text-gray-400 px-2 py-0.5 rounded-full">{item.name} · {item.price}₽</span>
                        ))}
                      </div>
                      <p className="text-xs text-gray-600">{tx.createdAt} · {tx.id}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-lg font-bold text-white">{tx.total}₽</p>
                      {tx.status === "completed" && (
                        <button onClick={() => handleRefund(tx.id, tx.total)} className="mt-1 flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors">
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

        {/* ===== IP SLOTS ===== */}
        {tab === "ipslots" && (
          <div className="animate-fade-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Управление IP-слотами</h3>
              <span className="text-xs text-gray-600">{ipSlots.length} записей</span>
            </div>
            <IpSlotsPanel slots={ipSlots} onAddIp={addIpToSlot} onRemoveIp={removeIpFromSlot} onAddSlot={addExtraSlot} />
          </div>
        )}

        {/* ===== SETTINGS ===== */}
        {tab === "settings" && isAdmin && (
          <div className="animate-fade-up grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl bg-[#141414] border border-[#262626] p-5">
              <h3 className="text-sm font-semibold text-gray-400 mb-4 flex items-center gap-2 uppercase tracking-wide"><Tag className="h-4 w-4" /> Глобальная скидка</h3>
              <div className="flex items-center gap-3">
                <input type="number" min="0" max="99" value={discountInput} onChange={(e) => setDiscountInput(e.target.value)}
                  className="w-24 rounded-xl bg-[#0f0f0f] border border-[#2a2a2a] px-3 py-2 text-sm text-white outline-none focus:border-orange-500/50 text-center" />
                <span className="text-gray-500">%</span>
                <Button size="sm" onClick={() => {
                  setGlobalDiscount(+discountInput)
                  logAdminAction("Установить скидку", `${discountInput}%`)
                  toast({ title: "Скидка применена", description: `${discountInput}%` })
                }} className="bg-orange-500 text-[#0a0a0a] hover:bg-orange-600 rounded-lg text-xs">
                  <Save className="h-3.5 w-3.5 mr-1" /> Сохранить
                </Button>
              </div>
              {globalDiscount > 0 && <p className="mt-2 text-xs text-green-400">Активна скидка {globalDiscount}%</p>}
            </div>

            <div className="rounded-2xl bg-[#141414] border border-[#262626] p-5">
              <h3 className="text-sm font-semibold text-gray-400 mb-4 flex items-center gap-2 uppercase tracking-wide"><Package className="h-4 w-4" /> Категории</h3>
              <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
                {activeCategories.map((cat) => (
                  <div key={cat} className="flex items-center justify-between rounded-lg bg-[#0f0f0f] px-3 py-2">
                    <span className="text-sm text-white">{cat}</span>
                    <button onClick={() => { setActiveCategories((prev) => prev.filter((c) => c !== cat)); logAdminAction("Удалить категорию", cat) }}
                      className="text-gray-700 hover:text-red-400 transition-colors"><X className="h-3.5 w-3.5" /></button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input value={newCat} onChange={(e) => setNewCat(e.target.value)} placeholder="Новая категория"
                  className="flex-1 rounded-xl bg-[#0f0f0f] border border-[#2a2a2a] px-3 py-2 text-sm text-white placeholder-gray-600 outline-none focus:border-orange-500/50" />
                <Button size="sm" onClick={() => {
                  if (newCat.trim()) { setActiveCategories((prev) => [...prev, newCat.trim()]); logAdminAction("Добавить категорию", newCat); setNewCat("") }
                }} className="bg-orange-500 text-[#0a0a0a] hover:bg-orange-600 rounded-lg"><Plus className="h-4 w-4" /></Button>
              </div>
            </div>

            <div className="rounded-2xl bg-[#141414] border border-[#262626] p-5">
              <h3 className="text-sm font-semibold text-gray-400 mb-4 flex items-center gap-2 uppercase tracking-wide"><TrendingUp className="h-4 w-4" /> Статистика</h3>
              <div className="space-y-2">
                {[
                  { label: "Всего плагинов", value: managedPlugins.length },
                  { label: "Активных пользователей", value: adminUsers.filter((u) => !u.isBlocked).length },
                  { label: "Premium-плагинов", value: managedPlugins.filter((p) => p.premium).length },
                  { label: "Общая выручка", value: `${totalRevenue.toLocaleString("ru")}₽` },
                  { label: "IP-слотов выдано", value: ipSlots.reduce((sum, s) => sum + s.ips.length, 0) },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center rounded-lg bg-[#0f0f0f] px-3 py-2.5">
                    <span className="text-sm text-gray-400">{label}</span>
                    <span className="font-semibold text-white">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-[#141414] border border-[#262626] p-5">
              <h3 className="text-sm font-semibold text-gray-400 mb-4 flex items-center gap-2 uppercase tracking-wide"><Star className="h-4 w-4" /> Способы оплаты</h3>
              <div className="space-y-2">
                {[
                  { method: "Банковская карта", icon: "💳", active: true },
                  { method: "СБП", icon: "⚡", active: true },
                  { method: "ЮKassa", icon: "🏦", active: true },
                  { method: "Криптовалюта", icon: "₿", active: false },
                ].map(({ method, icon, active }) => (
                  <div key={method} className="flex items-center justify-between rounded-lg bg-[#0f0f0f] px-3 py-2.5">
                    <span className="text-sm text-gray-300 flex items-center gap-2"><span>{icon}</span>{method}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${active ? "bg-green-500/20 text-green-400" : "bg-gray-800 text-gray-500"}`}>
                      {active ? "Активен" : "Скоро"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===== LOG ===== */}
        {tab === "log" && isAdmin && (
          <div className="animate-fade-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Журнал действий</h3>
              <span className="text-xs text-gray-600">{adminLog.length} записей</span>
            </div>
            {adminLog.length === 0 ? (
              <div className="rounded-2xl bg-[#141414] border border-[#262626] p-12 text-center">
                <ScrollText className="h-10 w-10 text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Журнал пуст</p>
              </div>
            ) : (
              <div className="space-y-2">
                {adminLog.map((entry) => (
                  <div key={entry.id} className="flex items-center gap-4 rounded-xl bg-[#141414] border border-[#262626] px-4 py-3">
                    <div className="h-8 w-8 rounded-lg bg-orange-500/20 flex items-center justify-center shrink-0">
                      <Shield className="h-4 w-4 text-orange-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white">{entry.action}</p>
                      <p className="text-xs text-gray-600">Цель: {entry.target}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-gray-600">{entry.createdAt}</p>
                      <p className="text-xs text-orange-400">{entry.adminEmail}</p>
                      {entry.ip && <p className="text-[10px] text-gray-700 font-mono">IP {entry.ip}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}