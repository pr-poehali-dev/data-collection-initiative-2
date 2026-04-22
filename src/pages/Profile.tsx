import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useUser } from "@/context/UserContext"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import {
  Star, Edit2, Check, X, Heart, MessageSquare, Bell, BellOff,
  Package, Clock, Shield, Eye, EyeOff, ArrowLeft, Send, Loader2
} from "lucide-react"

const CATALOG_NAMES: Record<number, string> = {
  1: "EssentialsX", 2: "Vault", 3: "WorldGuard", 4: "BedWars",
  5: "LuckPerms", 6: "PlotSquared", 7: "Dynmap", 8: "SkyWars", 9: "QuickShop",
}

function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <button key={s} type="button" onClick={() => onChange?.(s)}
          onMouseEnter={() => onChange && setHovered(s)} onMouseLeave={() => onChange && setHovered(0)}
          className={`transition-colors ${onChange ? "cursor-pointer" : "cursor-default"}`}
        >
          <Star className={`h-4 w-4 ${(hovered || value) >= s ? "text-yellow-400 fill-yellow-400" : "text-gray-700"}`} />
        </button>
      ))}
    </div>
  )
}

export default function Profile() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const {
    isLoggedIn, profile, updateProfile, logout,
    ownedPlugins, subscription, reviews, addReview,
    notifications, markNotifRead, markAllRead,
    wishlist, toggleWishlist, sendMessage,
  } = useUser()

  const [tab, setTab] = useState<"overview" | "plugins" | "wishlist" | "activity" | "notifs" | "messages" | "settings">("overview")
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editForm, setEditForm] = useState({ displayName: "", bio: "" })
  const [reviewForm, setReviewForm] = useState({ pluginId: 0, rating: 5, text: "" })
  const [reviewSaving, setReviewSaving] = useState(false)
  const [msgForm, setMsgForm] = useState({ to: "", text: "" })
  const [showPrivate, setShowPrivate] = useState(false)

  if (!isLoggedIn || !profile) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center animate-fade-up">
          <p className="text-gray-400 mb-4">Войдите, чтобы увидеть профиль</p>
          <Button onClick={() => navigate("/auth")} className="bg-orange-500 text-[#0a0a0a] hover:bg-orange-600 rounded-full">
            Войти
          </Button>
        </div>
      </div>
    )
  }

  const unreadCount = notifications.filter((n) => !n.read).length
  const myReviews = reviews.filter((r) => r.userId === profile.id)

  const startEdit = () => {
    setEditForm({ displayName: profile.displayName, bio: profile.bio })
    setEditing(true)
  }

  const saveEdit = async () => {
    if (!editForm.displayName.trim()) {
      toast({ title: "Ошибка", description: "Имя не может быть пустым", variant: "destructive" })
      return
    }
    setSaving(true)
    const result = await updateProfile({ displayName: editForm.displayName.trim(), bio: editForm.bio.trim() })
    setSaving(false)
    if (result.ok) {
      setEditing(false)
      toast({ title: "Профиль сохранён", description: "Изменения успешно применены" })
    } else {
      toast({ title: "Ошибка", description: "Не удалось сохранить профиль", variant: "destructive" })
    }
  }

  const handleAddReview = async () => {
    if (!reviewForm.pluginId || !reviewForm.text.trim()) return
    setReviewSaving(true)
    addReview({
      pluginId: reviewForm.pluginId, userId: profile.id,
      userName: profile.displayName, userAvatar: profile.avatar,
      rating: reviewForm.rating, text: reviewForm.text.trim(),
    })
    await new Promise((r) => setTimeout(r, 400))
    setReviewSaving(false)
    setReviewForm({ pluginId: 0, rating: 5, text: "" })
    toast({ title: "Отзыв опубликован", description: "Спасибо за вашу оценку!" })
  }

  const TABS = [
    { id: "overview", label: "Профиль", icon: "👤" },
    { id: "plugins", label: "Плагины", icon: "🧩" },
    { id: "wishlist", label: "Вишлист", icon: "❤️" },
    { id: "activity", label: "Активность", icon: "📋" },
    { id: "notifs", label: `Уведомления${unreadCount > 0 ? ` (${unreadCount})` : ""}`, icon: "🔔" },
    { id: "messages", label: "Сообщения", icon: "💬" },
    { id: "settings", label: "Настройки", icon: "⚙️" },
  ] as const

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <header className="border-b border-[#1a1a1a] px-6 py-4 flex items-center justify-between">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
          <ArrowLeft className="h-4 w-4" /> Главная
        </button>
        <span className="text-white font-semibold">Мой профиль</span>
        <button onClick={logout} className="text-xs text-gray-600 hover:text-red-400 transition-colors">Выйти</button>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Шапка профиля */}
        <div className="animate-fade-up rounded-2xl bg-[#141414] border border-[#262626] p-6 mb-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent pointer-events-none" />
          <div className="relative flex flex-col sm:flex-row gap-6 items-start">
            <div className="relative">
              <img src={profile.avatar} alt={profile.displayName} className="h-20 w-20 rounded-2xl border-2 border-orange-500/30" />
              {profile.isAdmin && (
                <div className="absolute -top-2 -right-2 bg-orange-500 rounded-full px-2 py-0.5 text-xs font-bold text-[#0a0a0a]">ADMIN</div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              {editing ? (
                <div className="space-y-2">
                  <input
                    value={editForm.displayName}
                    onChange={(e) => setEditForm((f) => ({ ...f, displayName: e.target.value }))}
                    className="bg-[#0f0f0f] border border-[#333] rounded-lg px-3 py-1.5 text-white text-lg font-bold w-full outline-none focus:border-orange-500/50"
                  />
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm((f) => ({ ...f, bio: e.target.value }))}
                    placeholder="Расскажите о себе..."
                    className="bg-[#0f0f0f] border border-[#333] rounded-lg px-3 py-2 text-sm text-gray-300 w-full outline-none focus:border-orange-500/50 resize-none h-16"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={saveEdit} disabled={saving} className="bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs disabled:opacity-50">
                      {saving ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Check className="h-3 w-3 mr-1" />} Сохранить
                    </Button>
                    <Button size="sm" onClick={() => setEditing(false)} variant="outline" className="border-[#333] text-gray-400 bg-transparent hover:bg-[#1f1f1f] rounded-lg text-xs"><X className="h-3 w-3 mr-1" /> Отмена</Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <h1 className="text-xl font-bold text-white">{profile.displayName}</h1>
                    <button onClick={startEdit} className="text-gray-600 hover:text-orange-400 transition-colors"><Edit2 className="h-4 w-4" /></button>
                  </div>
                  <p className="text-xs text-gray-600 font-mono mb-2 break-all">UUID: {profile.uuid}</p>
                  <p className="text-sm text-gray-400 mb-3">{profile.bio || <span className="text-gray-700 italic">Нет биографии</span>}</p>
                  <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                    <span>📅 {profile.registeredAt}</span>
                    <span>⭐ Репутация: <span className="text-white">{profile.reputation}</span></span>
                    <span>📦 Плагинов: <span className="text-white">{ownedPlugins.length}</span></span>
                    <span className="capitalize">🔑 {profile.authProviders.join(", ")}</span>
                  </div>
                </>
              )}
            </div>

            {subscription !== "none" && (
              <div className="shrink-0 text-right">
                <span className="rounded-full bg-orange-500/15 border border-orange-500/30 px-3 py-1 text-xs font-semibold text-orange-400">👑 Premium</span>
              </div>
            )}
          </div>
        </div>

        {/* Навигация */}
        <div className="animate-fade-up delay-100 flex gap-1 bg-[#141414] border border-[#262626] rounded-xl p-1 mb-6 overflow-x-auto">
          {TABS.map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                tab === id ? "bg-orange-500 text-[#0a0a0a]" : "text-gray-400 hover:text-white"
              }`}
            >
              <span>{icon}</span> {label}
            </button>
          ))}
        </div>

        {/* Содержимое */}
        <div className="animate-fade-up delay-200">

          {/* OVERVIEW */}
          {tab === "overview" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-2xl bg-[#141414] border border-[#262626] p-5">
                <h3 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wide">Мои отзывы</h3>
                {myReviews.length === 0 ? (
                  <p className="text-gray-600 text-sm">Отзывов ещё нет</p>
                ) : (
                  <div className="space-y-3">
                    {myReviews.map((r) => (
                      <div key={r.id} className="rounded-xl bg-[#1a1a1a] p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-white">{CATALOG_NAMES[r.pluginId] || `Плагин #${r.pluginId}`}</span>
                          <StarRating value={r.rating} />
                        </div>
                        <p className="text-xs text-gray-400">{r.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-2xl bg-[#141414] border border-[#262626] p-5">
                <h3 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wide">Написать отзыв</h3>
                <div className="space-y-3">
                  <select
                    value={reviewForm.pluginId}
                    onChange={(e) => setReviewForm((f) => ({ ...f, pluginId: +e.target.value }))}
                    className="w-full rounded-lg bg-[#0f0f0f] border border-[#2a2a2a] px-3 py-2 text-sm text-white outline-none focus:border-orange-500/50"
                  >
                    <option value={0}>Выберите плагин...</option>
                    {ownedPlugins.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <StarRating value={reviewForm.rating} onChange={(v) => setReviewForm((f) => ({ ...f, rating: v }))} />
                  <textarea
                    value={reviewForm.text}
                    onChange={(e) => setReviewForm((f) => ({ ...f, text: e.target.value }))}
                    placeholder="Ваш отзыв..."
                    className="w-full rounded-lg bg-[#0f0f0f] border border-[#2a2a2a] px-3 py-2 text-sm text-white placeholder-gray-600 outline-none focus:border-orange-500/50 resize-none h-20"
                  />
                  <Button
                    size="sm"
                    onClick={handleAddReview}
                    disabled={!reviewForm.pluginId || !reviewForm.text || reviewSaving}
                    className="bg-orange-500 text-[#0a0a0a] hover:bg-orange-600 rounded-lg text-xs disabled:opacity-50"
                  >
                    {reviewSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : null}
                    Опубликовать отзыв
                  </Button>
                </div>
              </div>

              {/* Приватные данные */}
              <div className="md:col-span-2 rounded-2xl bg-[#141414] border border-[#262626] p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide flex items-center gap-2">
                    <Shield className="h-4 w-4" /> Приватные данные
                  </h3>
                  <button onClick={() => setShowPrivate(!showPrivate)} className="text-gray-600 hover:text-orange-400 transition-colors">
                    {showPrivate ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {showPrivate ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="rounded-lg bg-[#0f0f0f] p-3">
                      <p className="text-xs text-gray-600 mb-1">Привязанные сервисы</p>
                      <p className="text-sm text-white capitalize">{profile.authProviders.join(", ")}</p>
                    </div>
                    <div className="rounded-lg bg-[#0f0f0f] p-3">
                      <p className="text-xs text-gray-600 mb-1">Email</p>
                      <p className="text-sm text-white">{profile.email}</p>
                    </div>
                    <div className="rounded-lg bg-[#0f0f0f] p-3">
                      <p className="text-xs text-gray-600 mb-1">Последние IP-адреса</p>
                      {profile.lastIps.map((ip) => <p key={ip} className="text-sm text-green-400 font-mono">{ip}</p>)}
                    </div>
                    <div className="rounded-lg bg-[#0f0f0f] p-3">
                      <p className="text-xs text-gray-600 mb-1">UUID аккаунта</p>
                      <p className="text-xs text-orange-400 font-mono break-all">{profile.uuid}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">Нажмите на иконку глаза, чтобы показать приватные данные</p>
                )}
              </div>
            </div>
          )}

          {/* PLUGINS */}
          {tab === "plugins" && (
            <div>
              {ownedPlugins.length === 0 ? (
                <div className="rounded-2xl bg-[#141414] border border-[#262626] p-12 text-center">
                  <Package className="h-12 w-12 text-gray-700 mx-auto mb-3" />
                  <p className="text-gray-500">Нет купленных плагинов</p>
                  <Button onClick={() => navigate("/")} className="mt-4 rounded-full bg-orange-500 text-[#0a0a0a] hover:bg-orange-600 text-sm">В каталог</Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {ownedPlugins.map((p) => (
                    <div key={p.id} className="hover-lift rounded-xl bg-[#141414] border border-[#262626] p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="h-9 w-9 rounded-lg bg-orange-600 flex items-center justify-center text-white text-sm font-bold">{p.name[0]}</div>
                        <div>
                          <p className="font-semibold text-white text-sm">{p.name}</p>
                          <p className="text-xs text-gray-500">v{p.version} · {p.category}</p>
                        </div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-600 mt-2">
                        <span>Серверов: <span className="text-white">{p.installedServers.length}</span></span>
                        <span>Whitelist: <span className="text-white">{p.whitelistIps.length} IP</span></span>
                        <span className="text-green-400">✓ Активен</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* WISHLIST */}
          {tab === "wishlist" && (
            <div>
              {wishlist.length === 0 ? (
                <div className="rounded-2xl bg-[#141414] border border-[#262626] p-12 text-center">
                  <Heart className="h-12 w-12 text-gray-700 mx-auto mb-3" />
                  <p className="text-gray-500">Вишлист пуст</p>
                  <p className="text-xs text-gray-600 mt-1">Нажмите ❤️ на карточке плагина, чтобы добавить в список</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {wishlist.map((id) => (
                    <div key={id} className="hover-lift rounded-xl bg-[#141414] border border-[#262626] p-4 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-white text-sm">{CATALOG_NAMES[id] || `Плагин #${id}`}</p>
                        <p className="text-xs text-gray-600">Добавлен в избранное</p>
                      </div>
                      <button onClick={() => toggleWishlist(id)} className="text-red-400 hover:text-red-300 transition-colors">
                        <Heart className="h-5 w-5 fill-red-400" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ACTIVITY */}
          {tab === "activity" && (
            <div className="rounded-2xl bg-[#141414] border border-[#262626] p-5">
              <h3 className="text-sm font-semibold text-gray-400 mb-4 flex items-center gap-2 uppercase tracking-wide">
                <Clock className="h-4 w-4" /> История активности
              </h3>
              {profile.activityLog.length === 0 ? (
                <p className="text-gray-600 text-sm">Нет записей</p>
              ) : (
                <div className="space-y-2">
                  {[...profile.activityLog].reverse().map((entry) => (
                    <div key={entry.id} className="flex items-center gap-3 rounded-lg bg-[#1a1a1a] px-3 py-2.5">
                      <span className="text-xs">{entry.type === "purchase" ? "🛒" : entry.type === "review" ? "⭐" : entry.type === "login" ? "🔑" : "💬"}</span>
                      <span className="flex-1 text-sm text-gray-300">{entry.text}</span>
                      <span className="text-xs text-gray-600 shrink-0">{entry.createdAt}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* NOTIFICATIONS */}
          {tab === "notifs" && (
            <div className="rounded-2xl bg-[#141414] border border-[#262626] p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Уведомления</h3>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-xs text-orange-400 hover:text-orange-300">Прочитать все</button>
                )}
              </div>
              {notifications.length === 0 ? (
                <div className="text-center py-8">
                  <BellOff className="h-10 w-10 text-gray-700 mx-auto mb-2" />
                  <p className="text-gray-600 text-sm">Нет уведомлений</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markNotifRead(n.id)}
                      className={`flex items-start gap-3 rounded-xl p-3 cursor-pointer transition-all ${
                        n.read ? "bg-[#1a1a1a]" : "bg-orange-500/10 border border-orange-500/20"
                      }`}
                    >
                      <span className="text-base mt-0.5">{n.type === "purchase" ? "🛒" : n.type === "review" ? "⭐" : n.type === "promo" ? "🎁" : n.type === "message" ? "💬" : "🔔"}</span>
                      <div className="flex-1">
                        <p className={`text-sm ${n.read ? "text-gray-400" : "text-white"}`}>{n.text}</p>
                        <p className="text-xs text-gray-600 mt-0.5">{n.createdAt}</p>
                      </div>
                      {!n.read && <div className="h-2 w-2 rounded-full bg-orange-500 mt-1.5 shrink-0" />}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* MESSAGES */}
          {tab === "messages" && (
            <div className="rounded-2xl bg-[#141414] border border-[#262626] p-5">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="h-4 w-4 text-orange-400" />
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Сообщения</h3>
              </div>
              <div className="mb-5 space-y-3">
                <input
                  value={msgForm.to}
                  onChange={(e) => setMsgForm((f) => ({ ...f, to: e.target.value }))}
                  placeholder="Email получателя"
                  className="w-full rounded-xl bg-[#0f0f0f] border border-[#2a2a2a] px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-orange-500/50"
                />
                <textarea
                  value={msgForm.text}
                  onChange={(e) => setMsgForm((f) => ({ ...f, text: e.target.value }))}
                  placeholder="Текст сообщения..."
                  className="w-full rounded-xl bg-[#0f0f0f] border border-[#2a2a2a] px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-orange-500/50 resize-none h-20"
                />
                <Button
                  onClick={() => { sendMessage(msgForm.to, msgForm.to, msgForm.text); setMsgForm({ to: "", text: "" }) }}
                  disabled={!msgForm.to || !msgForm.text}
                  className="bg-orange-500 text-[#0a0a0a] hover:bg-orange-600 rounded-xl text-sm"
                >
                  <Send className="h-4 w-4 mr-2" /> Отправить
                </Button>
              </div>
              <div className="rounded-xl bg-[#1a1a1a] border border-[#262626] p-4 text-center">
                <p className="text-xs text-gray-600">Входящие сообщения появятся здесь</p>
              </div>
            </div>
          )}

          {/* SETTINGS */}
          {tab === "settings" && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-[#141414] border border-[#262626] p-5">
                <h3 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wide">Уведомления</h3>
                <div className="space-y-3">
                  {Object.entries(profile.notifSettings).map(([key, val]) => {
                    const labels: Record<string, string> = { purchases: "Покупки", reviews: "Отзывы", promos: "Акции и скидки", messages: "Сообщения" }
                    return (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-sm text-gray-300">{labels[key]}</span>
                        <button
                          onClick={() => updateProfile({ notifSettings: { ...profile.notifSettings, [key]: !val } })}
                          className={`relative h-6 w-11 rounded-full transition-colors ${val ? "bg-orange-500" : "bg-[#2a2a2a]"}`}
                        >
                          <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${val ? "left-6" : "left-1"}`} />
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="rounded-2xl bg-[#141414] border border-[#262626] p-5">
                <h3 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wide">Видимость профиля</h3>
                <div className="space-y-3">
                  {Object.entries(profile.profileVisibility).map(([key, val]) => {
                    const labels: Record<string, string> = { purchases: "Список покупок", activity: "История активности", bio: "Биография" }
                    return (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-sm text-gray-300">{labels[key]}</span>
                        <button
                          onClick={() => updateProfile({ profileVisibility: { ...profile.profileVisibility, [key]: !val } })}
                          className={`relative h-6 w-11 rounded-full transition-colors ${val ? "bg-orange-500" : "bg-[#2a2a2a]"}`}
                        >
                          <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${val ? "left-6" : "left-1"}`} />
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>

              <Button
                onClick={logout}
                variant="outline"
                className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10 bg-transparent rounded-xl"
              >
                Выйти из аккаунта
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}