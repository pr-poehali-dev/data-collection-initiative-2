import { X, ShoppingCart, Trash2, CreditCard, Zap, Building2, RefreshCw, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
import { useCart } from "@/context/CartContext"
import { useUser } from "@/context/UserContext"
import { Button } from "@/components/ui/button"
import { useState } from "react"

type PayMethod = "card" | "sbp" | "yookassa"
type CheckoutStep = "select" | "form" | "loading" | "success" | "error"

const PAY_METHODS: { id: PayMethod; label: string; desc: string; icon: typeof CreditCard }[] = [
  { id: "card", label: "Банковская карта", desc: "Visa, MasterCard, МИР", icon: CreditCard },
  { id: "sbp", label: "СБП", desc: "Быстрые платежи по QR", icon: Zap },
  { id: "yookassa", label: "ЮKassa", desc: "ЮMoney, QIWI и другие", icon: Building2 },
]

function formatCard(val: string) {
  return val.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim()
}

function formatExp(val: string) {
  const digits = val.replace(/\D/g, "").slice(0, 4)
  if (digits.length >= 3) return digits.slice(0, 2) + "/" + digits.slice(2)
  return digits
}

function validateCard(card: string) {
  const digits = card.replace(/\s/g, "")
  if (digits.length !== 16) return "Введите 16 цифр"
  return ""
}
function validateExp(exp: string) {
  const [mm, yy] = exp.split("/")
  if (!mm || !yy || mm.length < 2 || yy.length < 2) return "Формат ММ/ГГ"
  const month = +mm
  if (month < 1 || month > 12) return "Неверный месяц"
  const year = 2000 + +yy
  const now = new Date()
  if (year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1)) return "Карта истекла"
  return ""
}
function validateCvv(cvv: string) {
  return cvv.length < 3 ? "Введите 3 цифры" : ""
}

function CardForm({ onPay, loading }: { onPay: (data: object) => void; loading: boolean }) {
  const [form, setForm] = useState({ name: "", email: "", card: "", exp: "", cvv: "" })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = "Введите имя"
    if (!form.email.includes("@")) e.email = "Введите корректный email"
    const ce = validateCard(form.card); if (ce) e.card = ce
    const ee = validateExp(form.exp); if (ee) e.exp = ee
    const ve = validateCvv(form.cvv); if (ve) e.cvv = ve
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault()
    if (validate()) onPay(form)
  }

  const Field = ({ label, name, placeholder, value, onChange, error, type = "text", maxLength }: {
    label: string; name: string; placeholder: string; value: string;
    onChange: (v: string) => void; error?: string; type?: string; maxLength?: number
  }) => (
    <div>
      <label className="text-xs text-gray-400 mb-1 block">{label}</label>
      <input
        type={type} placeholder={placeholder} value={value} maxLength={maxLength}
        onChange={(e) => { onChange(e.target.value); setErrors((prev) => ({ ...prev, [name]: "" })) }}
        className={`w-full rounded-lg bg-[#0f0f0f] border px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none transition-colors ${
          errors[name] ? "border-red-500/60 focus:border-red-500" : "border-[#333] focus:border-orange-500/50"
        }`}
      />
      {errors[name] && <p className="text-xs text-red-400 mt-1">{errors[name]}</p>}
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-3 mt-4">
      <Field label="Имя держателя" name="name" placeholder="IVAN IVANOV" value={form.name} onChange={(v) => setForm({ ...form, name: v })} error={errors.name} />
      <Field label="Email" name="email" placeholder="ivan@example.com" value={form.email} onChange={(v) => setForm({ ...form, email: v })} type="email" error={errors.email} />
      <Field label="Номер карты" name="card" placeholder="0000 0000 0000 0000" value={form.card}
        onChange={(v) => setForm({ ...form, card: formatCard(v) })} error={errors.card} maxLength={19} />
      <div className="flex gap-3">
        <div className="flex-1">
          <Field label="Срок" name="exp" placeholder="ММ/ГГ" value={form.exp}
            onChange={(v) => setForm({ ...form, exp: formatExp(v) })} error={errors.exp} maxLength={5} />
        </div>
        <div className="flex-1">
          <Field label="CVV" name="cvv" placeholder="•••" value={form.cvv}
            onChange={(v) => setForm({ ...form, cvv: v.replace(/\D/g, "").slice(0, 3) })} error={errors.cvv} maxLength={3} />
        </div>
      </div>
      <Button type="submit" disabled={loading} className="w-full rounded-full bg-orange-500 text-[#0a0a0a] font-semibold hover:bg-orange-600 mt-1 disabled:opacity-50">
        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CreditCard className="mr-2 h-4 w-4" />}
        Оплатить
      </Button>
    </form>
  )
}

function SbpForm({ onPay, loading }: { onPay: (data: object) => void; loading: boolean }) {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault()
    if (!email.includes("@")) { setError("Введите корректный email"); return }
    onPay({ email, method: "sbp" })
  }
  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      <div className="rounded-xl bg-[#1a1a1a] border border-[#262626] p-4 flex flex-col items-center gap-2">
        <div className="h-24 w-24 rounded-xl bg-white flex items-center justify-center">
          <div className="h-16 w-16 bg-[#0a0a0a] rounded grid grid-cols-3 gap-0.5 p-1">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className={`rounded-sm ${Math.random() > 0.4 ? "bg-white" : "bg-transparent"}`} />
            ))}
          </div>
        </div>
        <p className="text-xs text-gray-400 text-center">Отсканируйте QR-код приложением банка</p>
      </div>
      <div>
        <label className="text-xs text-gray-400 mb-1 block">Email для чека</label>
        <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError("") }} placeholder="ivan@example.com"
          className={`w-full rounded-lg bg-[#0f0f0f] border px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none ${error ? "border-red-500/60" : "border-[#333] focus:border-orange-500/50"}`} />
        {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
      </div>
      <Button type="submit" disabled={loading} className="w-full rounded-full bg-orange-500 text-[#0a0a0a] font-semibold hover:bg-orange-600 disabled:opacity-50">
        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Zap className="mr-2 h-4 w-4" />} Оплачено
      </Button>
    </form>
  )
}

function YookassaForm({ onPay, loading }: { onPay: (data: object) => void; loading: boolean }) {
  const [email, setEmail] = useState("")
  const [wallet, setWallet] = useState("yumoney")
  return (
    <form onSubmit={(e) => { e.preventDefault(); onPay({ email, wallet }) }} className="space-y-3 mt-4">
      <div>
        <label className="text-xs text-gray-400 mb-1 block">Способ ЮKassa</label>
        <select value={wallet} onChange={(e) => setWallet(e.target.value)}
          className="w-full rounded-lg bg-[#0f0f0f] border border-[#333] px-3 py-2.5 text-sm text-white outline-none focus:border-orange-500/50">
          <option value="yumoney">ЮMoney</option>
          <option value="qiwi">QIWI</option>
          <option value="webmoney">WebMoney</option>
        </select>
      </div>
      <div>
        <label className="text-xs text-gray-400 mb-1 block">Email для чека</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ivan@example.com"
          className="w-full rounded-lg bg-[#0f0f0f] border border-[#333] px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-orange-500/50" />
      </div>
      <Button type="submit" disabled={loading} className="w-full rounded-full bg-orange-500 text-[#0a0a0a] font-semibold hover:bg-orange-600 disabled:opacity-50">
        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Building2 className="mr-2 h-4 w-4" />} Перейти к оплате
      </Button>
    </form>
  )
}

export function CartDrawer() {
  const { items, remove, clear, total, count, isOpen, setIsOpen } = useCart()
  const { profile, addTransaction, addOwnedPlugin, globalDiscount } = useUser()
  const [step, setStep] = useState<CheckoutStep>("select")
  const [method, setMethod] = useState<PayMethod>("card")
  const [errorMsg, setErrorMsg] = useState("")

  const discountedTotal = globalDiscount > 0 ? Math.round(total * (1 - globalDiscount / 100)) : total

  const handleClose = () => {
    setIsOpen(false)
    setTimeout(() => { setStep("select"); setMethod("card"); setErrorMsg("") }, 300)
  }

  const handlePay = async (_data: object) => {
    setStep("loading")
    // Симуляция запроса к платёжному шлюзу
    await new Promise((r) => setTimeout(r, 1800))

    // 10% шанс ошибки для демонстрации retry
    if (Math.random() < 0.1) {
      setErrorMsg("Ошибка соединения с платёжным шлюзом. Попробуйте ещё раз.")
      setStep("error")
      return
    }

    // Успешная оплата — выдаём плагины и фиксируем транзакцию
    const pluginItems = items.filter((i) => i.type === "plugin")
    pluginItems.forEach((item) => {
      addOwnedPlugin({
        id: +item.id,
        name: item.name,
        version: "latest",
        category: "Разное",
        installedServers: [],
        apiKey: `pm-${Math.random().toString(36).slice(2, 14)}`,
        whitelistIps: [],
        purchasedAt: new Date().toLocaleDateString("ru-RU"),
      })
    })

    addTransaction({
      userId: profile?.id || "guest",
      userEmail: profile?.email || "guest@example.com",
      userName: profile?.displayName || "Гость",
      items: items.map((i) => ({ id: i.id, name: i.name, price: i.price })),
      total: discountedTotal,
      status: "completed",
      paymentMethod: method,
    })

    setStep("success")
    setTimeout(() => { clear(); handleClose() }, 3500)
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
      <div className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-[#111] border-l border-[#222] flex flex-col shadow-2xl">
        {/* Шапка */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#222]">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-orange-400" />
            <h2 className="font-semibold text-white">Корзина</h2>
            {count > 0 && (
              <span className="h-5 w-5 rounded-full bg-orange-500 text-[#0a0a0a] text-xs font-bold flex items-center justify-center">{count}</span>
            )}
          </div>
          <button onClick={handleClose} className="text-gray-500 hover:text-white transition-colors"><X className="h-5 w-5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">

          {/* Пустая корзина */}
          {items.length === 0 && step !== "success" && (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
              <ShoppingCart className="h-12 w-12 text-gray-700" />
              <p className="text-gray-500 text-sm">Корзина пуста</p>
              <p className="text-gray-600 text-xs">Добавьте плагины из каталога</p>
            </div>
          )}

          {/* Список товаров */}
          {items.length > 0 && step === "select" && (
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-xl bg-[#1a1a1a] border border-[#262626] px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-white">{item.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{item.type === "plan" ? "Тариф" : "Плагин"}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-orange-400 font-semibold text-sm">{item.price}₽</span>
                    <button onClick={() => remove(item.id)} className="text-gray-600 hover:text-red-400 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Выбор метода оплаты */}
          {step === "form" && (
            <div className="mt-2">
              <p className="text-xs text-gray-400 mb-3 uppercase tracking-wide font-semibold">Способ оплаты</p>
              <div className="space-y-2 mb-5">
                {PAY_METHODS.map(({ id, label, desc, icon: Icon }) => (
                  <button key={id} onClick={() => setMethod(id)}
                    className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 border transition-all text-left ${
                      method === id ? "bg-orange-500/10 border-orange-500/40" : "bg-[#1a1a1a] border-[#262626] hover:border-orange-500/20"
                    }`}
                  >
                    <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${method === id ? "bg-orange-500/20" : "bg-[#0f0f0f]"}`}>
                      <Icon className={`h-4 w-4 ${method === id ? "text-orange-400" : "text-gray-500"}`} />
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${method === id ? "text-white" : "text-gray-300"}`}>{label}</p>
                      <p className="text-xs text-gray-600">{desc}</p>
                    </div>
                    {method === id && <div className="ml-auto h-4 w-4 rounded-full bg-orange-500 flex items-center justify-center"><div className="h-2 w-2 rounded-full bg-white" /></div>}
                  </button>
                ))}
              </div>

              {method === "card" && <CardForm onPay={handlePay} loading={false} />}
              {method === "sbp" && <SbpForm onPay={handlePay} loading={false} />}
              {method === "yookassa" && <YookassaForm onPay={handlePay} loading={false} />}
            </div>
          )}

          {/* Загрузка */}
          {step === "loading" && (
            <div className="flex flex-col items-center justify-center h-full gap-5 text-center">
              <div className="h-16 w-16 rounded-full bg-orange-500/20 flex items-center justify-center animate-pulse">
                <Loader2 className="h-8 w-8 text-orange-400 animate-spin" />
              </div>
              <div>
                <p className="text-lg font-bold text-white">Обрабатываем платёж</p>
                <p className="text-sm text-gray-400 mt-1">Не закрывайте страницу...</p>
              </div>
              <div className="w-48 h-1.5 bg-[#2a2a2a] rounded-full overflow-hidden">
                <div className="h-full bg-orange-500 rounded-full animate-[loading_1.8s_ease-in-out]" style={{ width: "100%" }} />
              </div>
            </div>
          )}

          {/* Успех */}
          {step === "success" && (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center animate-fade-up">
              <div className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Оплата прошла!</h3>
                <p className="text-sm text-gray-400 mt-1">Плагины уже в вашем кабинете</p>
                <p className="text-xs text-gray-600 mt-1">Чек отправлен на email</p>
              </div>
              <div className="rounded-xl bg-green-500/10 border border-green-500/20 px-4 py-3 w-full text-left">
                <p className="text-xs text-gray-500 mb-1">Итого оплачено</p>
                <p className="text-2xl font-bold text-white">{discountedTotal}₽</p>
              </div>
            </div>
          )}

          {/* Ошибка */}
          {step === "error" && (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center animate-fade-up">
              <div className="h-16 w-16 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Ошибка оплаты</h3>
                <p className="text-sm text-gray-400 mt-1">{errorMsg}</p>
              </div>
              <Button onClick={() => setStep("form")} className="rounded-full bg-orange-500 text-[#0a0a0a] hover:bg-orange-600 font-semibold gap-2">
                <RefreshCw className="h-4 w-4" /> Попробовать снова
              </Button>
              <button onClick={handleClose} className="text-sm text-gray-600 hover:text-gray-400 transition-colors">Закрыть</button>
            </div>
          )}
        </div>

        {/* Подвал */}
        {items.length > 0 && step === "select" && (
          <div className="px-6 py-4 border-t border-[#222] space-y-3">
            {globalDiscount > 0 && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-green-400">Скидка {globalDiscount}%</span>
                <span className="text-green-400">−{total - discountedTotal}₽</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Итого:</span>
              <div className="text-right">
                {globalDiscount > 0 && <p className="text-xs text-gray-600 line-through">{total}₽</p>}
                <span className="text-white font-bold text-lg">{discountedTotal}₽</span>
              </div>
            </div>
            <Button onClick={() => setStep("form")} className="w-full rounded-full bg-orange-500 text-[#0a0a0a] font-semibold hover:bg-orange-600">
              <CreditCard className="mr-2 h-4 w-4" /> Оформить заказ
            </Button>
            <button onClick={() => { clear() }} className="w-full text-xs text-gray-600 hover:text-gray-400 transition-colors">Очистить корзину</button>
          </div>
        )}
      </div>
    </>
  )
}
