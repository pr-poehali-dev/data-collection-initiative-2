import { useState, useEffect, useMemo } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useUser, PLAN_CATALOG } from "@/context/UserContext"
import type { PlanInfo } from "@/context/UserContext"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import {
  ArrowLeft, Check, CreditCard, Zap, Building2, Bitcoin,
  Shield, Loader2, CheckCircle2, AlertCircle, Download,
  ChevronRight, LayoutDashboard, Crown, Sparkles, FileText, RefreshCw
} from "lucide-react"

type Step = "plan" | "review" | "payment" | "processing" | "success" | "error"
type PayMethod = "stripe" | "paypal" | "yookassa" | "crypto"

const PAY_METHODS: { id: PayMethod; label: string; desc: string; icon: typeof CreditCard; active: boolean }[] = [
  { id: "stripe", label: "Stripe", desc: "Банковские карты Visa, MC, МИР", icon: CreditCard, active: true },
  { id: "yookassa", label: "ЮKassa", desc: "СБП, ЮMoney, QIWI", icon: Building2, active: true },
  { id: "paypal", label: "PayPal", desc: "PayPal-счёт или карта", icon: Zap, active: true },
  { id: "crypto", label: "Криптовалюта", desc: "BTC, ETH, USDT", icon: Bitcoin, active: false },
]

function formatCard(v: string) { return v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim() }
function formatExp(v: string) { const d = v.replace(/\D/g, "").slice(0, 4); return d.length >= 3 ? d.slice(0, 2) + "/" + d.slice(2) : d }

function StepBadge({ num, label, active, done }: { num: number; label: string; active: boolean; done: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
        done ? "bg-green-500 text-white" : active ? "bg-orange-500 text-[#0a0a0a]" : "bg-[#1a1a1a] border border-[#2a2a2a] text-gray-500"
      }`}>
        {done ? <Check className="h-3.5 w-3.5" /> : num}
      </div>
      <span className={`text-xs font-medium hidden sm:inline ${active || done ? "text-white" : "text-gray-600"}`}>{label}</span>
    </div>
  )
}

export default function Checkout() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { toast } = useToast()
  const { isLoggedIn, profile, activateSubscription, addTransaction } = useUser()

  const initialPlanId = params.get("plan")
  const initialPlan = PLAN_CATALOG.find((p) => p.id === initialPlanId) || null

  const [step, setStep] = useState<Step>(initialPlan ? "review" : "plan")
  const [plan, setPlan] = useState<PlanInfo | null>(initialPlan)
  const [method, setMethod] = useState<PayMethod>("stripe")
  const [agree, setAgree] = useState(false)
  const [cardForm, setCardForm] = useState({ number: "", exp: "", cvv: "", name: "" })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [errorMsg, setErrorMsg] = useState("")

  useEffect(() => {
    if (!isLoggedIn) navigate("/auth")
  }, [isLoggedIn, navigate])

  const receiptId = useMemo(() => `RCP-${Date.now().toString().slice(-8)}`, [])

  // ─── Step 1: Plan ────────────────────────────────────────────
  const PlanStep = () => (
    <div className="animate-fade-up">
      <h2 className="text-2xl font-bold text-white mb-2">Выберите тариф</h2>
      <p className="text-sm text-gray-500 mb-8">Доступ ко всем плагинам каталога с автообновлениями</p>

      <div className="space-y-6">
        {(["premium", "super"] as const).map((tier) => {
          const tierPlans = PLAN_CATALOG.filter((p) => p.tier === tier)
          const Icon = tier === "super" ? Sparkles : Crown
          return (
            <div key={tier} className="rounded-2xl bg-[#141414] border border-[#262626] p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${tier === "super" ? "bg-gradient-to-br from-orange-500/20 to-purple-500/20 border border-orange-500/30" : "bg-orange-500/10 border border-orange-500/20"}`}>
                  <Icon className={`h-5 w-5 ${tier === "super" ? "text-orange-300" : "text-orange-400"}`} />
                </div>
                <h3 className="text-lg font-bold text-white uppercase">{tier}</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {tierPlans.map((p) => {
                  const selected = plan?.id === p.id
                  return (
                    <button
                      key={p.id}
                      onClick={() => setPlan(p)}
                      className={`text-left rounded-xl border p-4 transition-all ${
                        selected
                          ? "bg-orange-500/10 border-orange-500/60 ring-1 ring-orange-500/40"
                          : "bg-[#0f0f0f] border-[#2a2a2a] hover:border-orange-500/30"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">{p.periodLabel}</span>
                        {p.discount && <span className="text-[10px] font-bold bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded-full">{p.discount}</span>}
                      </div>
                      <p className="text-xl font-bold text-white">{p.price.toLocaleString("ru")}₽</p>
                      {selected && <div className="mt-2 flex items-center gap-1 text-xs text-orange-400"><Check className="h-3 w-3" /> Выбрано</div>}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      <Button
        onClick={() => setStep("review")}
        disabled={!plan}
        className="mt-8 w-full md:w-auto md:min-w-48 rounded-full bg-orange-500 text-[#0a0a0a] hover:bg-orange-600 font-semibold disabled:opacity-40"
      >
        Продолжить <ChevronRight className="ml-1 h-4 w-4" />
      </Button>
    </div>
  )

  // ─── Step 2: Review ────────────────────────────────────────────
  const ReviewStep = () => (
    <div className="animate-fade-up max-w-xl">
      <h2 className="text-2xl font-bold text-white mb-2">Проверка заказа</h2>
      <p className="text-sm text-gray-500 mb-8">Убедитесь, что всё верно</p>

      {plan && (
        <div className="rounded-2xl bg-[#141414] border border-[#262626] p-6 mb-6">
          <div className="flex items-start justify-between mb-5 pb-5 border-b border-[#2a2a2a]">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Тариф</p>
              <h3 className="text-xl font-bold text-white">{plan.title}</h3>
              <p className="text-xs text-gray-500 mt-1">Срок действия: {plan.periodLabel}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-white">{plan.price.toLocaleString("ru")}₽</p>
              {plan.discount && <span className="text-xs font-bold bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">{plan.discount}</span>}
            </div>
          </div>

          <div className="space-y-2 mb-5">
            {plan.features.map((f) => (
              <div key={f} className="flex items-center gap-2 text-sm text-gray-300">
                <Check className="h-4 w-4 text-orange-400 shrink-0" /> {f}
              </div>
            ))}
          </div>

          <button onClick={() => setStep("plan")} className="text-xs text-gray-500 hover:text-orange-400 transition-colors">
            ← Изменить тариф
          </button>
        </div>
      )}

      <div className="rounded-xl bg-[#0f0f0f] border border-[#2a2a2a] p-4 mb-6">
        <div className="flex items-center justify-between mb-2 text-sm">
          <span className="text-gray-500">Итого к оплате:</span>
          <span className="text-2xl font-bold text-white">{plan?.price.toLocaleString("ru")}₽</span>
        </div>
        <p className="text-xs text-gray-600">НДС включён. Чек будет отправлен на {profile?.email}</p>
      </div>

      <div className="flex gap-3">
        <Button onClick={() => setStep("plan")} variant="outline" className="border-[#333] text-gray-400 bg-transparent hover:bg-[#1f1f1f] rounded-full">
          Назад
        </Button>
        <Button onClick={() => setStep("payment")} className="flex-1 rounded-full bg-orange-500 text-[#0a0a0a] hover:bg-orange-600 font-semibold">
          Продолжить <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  )

  // ─── Step 3: Payment ────────────────────────────────────────────
  const validateCard = () => {
    const e: Record<string, string> = {}
    if (method === "stripe") {
      if (!cardForm.name.trim()) e.name = "Введите имя"
      const n = cardForm.number.replace(/\s/g, "")
      if (n.length !== 16) e.number = "16 цифр"
      const [mm, yy] = cardForm.exp.split("/")
      if (!mm || !yy || mm.length < 2 || yy.length < 2) e.exp = "ММ/ГГ"
      if (cardForm.cvv.length < 3) e.cvv = "CVV"
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handlePay = async () => {
    if (!agree) { toast({ title: "Подтвердите согласие", description: "Примите условия использования", variant: "destructive" }); return }
    if (!validateCard()) return
    if (!plan) return

    setStep("processing")
    await new Promise((r) => setTimeout(r, 2200))

    // Симуляция редкой ошибки
    if (Math.random() < 0.08) {
      setErrorMsg("Платёжный шлюз отклонил транзакцию. Проверьте данные и попробуйте снова.")
      setStep("error")
      return
    }

    // Успех: активируем подписку, фиксируем транзакцию
    activateSubscription(plan)
    addTransaction({
      userId: profile?.id || "guest",
      userEmail: profile?.email || "guest@example.com",
      userName: profile?.displayName || "Гость",
      items: [{ id: plan.id, name: plan.title, price: plan.price }],
      total: plan.price,
      status: "completed",
      paymentMethod: method,
    })
    setStep("success")
  }

  const PaymentStep = () => {
    const inp = (name: string) => `w-full rounded-xl bg-[#0f0f0f] border px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none transition-colors ${
      errors[name] ? "border-red-500/60 focus:border-red-500" : "border-[#2a2a2a] focus:border-orange-500/50"
    }`
    return (
      <div className="animate-fade-up max-w-xl">
        <h2 className="text-2xl font-bold text-white mb-2">Способ оплаты</h2>
        <p className="text-sm text-gray-500 mb-6">Выберите удобный способ</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {PAY_METHODS.map(({ id, label, desc, icon: Icon, active }) => (
            <button
              key={id}
              disabled={!active}
              onClick={() => setMethod(id)}
              className={`relative flex items-center gap-3 rounded-xl p-4 border text-left transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                method === id && active
                  ? "bg-orange-500/10 border-orange-500/40 ring-1 ring-orange-500/30"
                  : "bg-[#141414] border-[#262626] hover:border-orange-500/30"
              }`}
            >
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${method === id ? "bg-orange-500/20" : "bg-[#0f0f0f]"}`}>
                <Icon className={`h-4 w-4 ${method === id ? "text-orange-400" : "text-gray-500"}`} />
              </div>
              <div>
                <p className={`text-sm font-medium ${method === id ? "text-white" : "text-gray-300"}`}>{label}</p>
                <p className="text-xs text-gray-600">{desc}</p>
              </div>
              {method === id && active && <Check className="absolute top-3 right-3 h-4 w-4 text-orange-400" />}
              {!active && <span className="absolute top-2 right-2 text-[10px] bg-gray-800 text-gray-500 px-1.5 py-0.5 rounded-full">скоро</span>}
            </button>
          ))}
        </div>

        {method === "stripe" && (
          <div className="rounded-2xl bg-[#141414] border border-[#262626] p-5 mb-6 space-y-3">
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wide mb-1 block">Имя держателя</label>
              <input value={cardForm.name} onChange={(e) => { setCardForm((f) => ({ ...f, name: e.target.value })); setErrors((p) => ({ ...p, name: "" })) }} placeholder="IVAN IVANOV" className={inp("name")} />
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wide mb-1 block">Номер карты</label>
              <input value={cardForm.number} onChange={(e) => { setCardForm((f) => ({ ...f, number: formatCard(e.target.value) })); setErrors((p) => ({ ...p, number: "" })) }} placeholder="0000 0000 0000 0000" className={inp("number")} maxLength={19} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide mb-1 block">Срок</label>
                <input value={cardForm.exp} onChange={(e) => { setCardForm((f) => ({ ...f, exp: formatExp(e.target.value) })); setErrors((p) => ({ ...p, exp: "" })) }} placeholder="ММ/ГГ" className={inp("exp")} maxLength={5} />
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide mb-1 block">CVV</label>
                <input value={cardForm.cvv} onChange={(e) => { setCardForm((f) => ({ ...f, cvv: e.target.value.replace(/\D/g, "").slice(0, 3) })); setErrors((p) => ({ ...p, cvv: "" })) }} placeholder="•••" className={inp("cvv")} maxLength={3} />
              </div>
            </div>
            <p className="flex items-center gap-1.5 text-xs text-gray-600 pt-2">
              <Shield className="h-3 w-3" /> Данные шифруются по стандарту PCI DSS
            </p>
          </div>
        )}

        {method !== "stripe" && (
          <div className="rounded-2xl bg-[#141414] border border-[#262626] p-5 mb-6 text-center">
            <p className="text-sm text-gray-400">Вы будете перенаправлены на сайт {PAY_METHODS.find((m) => m.id === method)?.label} для завершения оплаты.</p>
          </div>
        )}

        <label className="flex items-start gap-2 mb-6 cursor-pointer">
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="accent-orange-500 mt-0.5 shrink-0" />
          <span className="text-xs text-gray-400">
            Я принимаю{" "}
            <span className="text-orange-400 underline">условия использования</span> и{" "}
            <span className="text-orange-400 underline">политику конфиденциальности</span>, а также согласен на автоматическое продление подписки.
          </span>
        </label>

        <div className="flex items-center justify-between rounded-xl bg-[#0f0f0f] border border-[#2a2a2a] p-4 mb-6">
          <div>
            <p className="text-xs text-gray-500">К оплате</p>
            <p className="text-xs text-gray-600 mt-0.5">{plan?.title}</p>
          </div>
          <p className="text-2xl font-bold text-white">{plan?.price.toLocaleString("ru")}₽</p>
        </div>

        <div className="flex gap-3">
          <Button onClick={() => setStep("review")} variant="outline" className="border-[#333] text-gray-400 bg-transparent hover:bg-[#1f1f1f] rounded-full">
            Назад
          </Button>
          <Button
            onClick={handlePay}
            disabled={!agree}
            className="flex-1 rounded-full bg-orange-500 text-[#0a0a0a] hover:bg-orange-600 font-semibold disabled:opacity-40"
          >
            <CreditCard className="mr-2 h-4 w-4" /> Перейти к оплате
          </Button>
        </div>
      </div>
    )
  }

  // ─── Processing ────────────────────────────────────────────
  const ProcessingStep = () => (
    <div className="animate-fade-up max-w-md mx-auto text-center py-10">
      <div className="h-20 w-20 rounded-full bg-orange-500/20 flex items-center justify-center mx-auto mb-6 animate-pulse">
        <Loader2 className="h-10 w-10 text-orange-400 animate-spin" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">Обрабатываем платёж</h2>
      <p className="text-sm text-gray-500 mb-6">Пожалуйста, не закрывайте страницу</p>
      <div className="h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden max-w-xs mx-auto">
        <div className="h-full bg-gradient-to-r from-orange-500 to-orange-400 animate-[loading_2s_ease-in-out_infinite]" style={{ width: "60%" }} />
      </div>
      <div className="flex items-center justify-center gap-2 mt-6 text-xs text-gray-600">
        <Shield className="h-3 w-3" /> Защищённое соединение · SSL
      </div>
    </div>
  )

  // ─── Success ────────────────────────────────────────────
  const SuccessStep = () => (
    <div className="animate-fade-up max-w-lg mx-auto text-center py-10">
      <div className="h-20 w-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
        <CheckCircle2 className="h-11 w-11 text-green-400" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">Оплата прошла успешно!</h2>
      <p className="text-sm text-gray-500 mb-8">Подписка активирована · Чек отправлен на {profile?.email}</p>

      {plan && (
        <div className="rounded-2xl bg-[#141414] border border-green-500/20 p-6 text-left mb-6">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-3">Детали заказа</p>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Тариф:</span>
              <span className="text-sm font-medium text-white">{plan.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Срок:</span>
              <span className="text-sm font-medium text-white">{plan.periodLabel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Способ оплаты:</span>
              <span className="text-sm font-medium text-white capitalize">{method}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Номер чека:</span>
              <span className="text-sm font-mono text-white">{receiptId}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-[#2a2a2a] mt-2">
              <span className="text-sm text-gray-400">Оплачено:</span>
              <span className="text-lg font-bold text-white">{plan.price.toLocaleString("ru")}₽</span>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={() => {
            const content = `Чек №${receiptId}\n\nТариф: ${plan?.title}\nСрок: ${plan?.periodLabel}\nСумма: ${plan?.price}₽\nEmail: ${profile?.email}\nДата: ${new Date().toLocaleString("ru-RU")}`
            const blob = new Blob([content], { type: "text/plain" })
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url; a.download = `${receiptId}.txt`; a.click()
            URL.revokeObjectURL(url)
          }}
          variant="outline"
          className="border-[#333] text-gray-300 bg-transparent hover:bg-[#1f1f1f] rounded-full"
        >
          <Download className="mr-2 h-4 w-4" /> Скачать чек
        </Button>
        <Button onClick={() => navigate("/dashboard")} className="flex-1 rounded-full bg-orange-500 text-[#0a0a0a] hover:bg-orange-600 font-semibold">
          <LayoutDashboard className="mr-2 h-4 w-4" /> Перейти в кабинет
        </Button>
      </div>
    </div>
  )

  // ─── Error ────────────────────────────────────────────
  const ErrorStep = () => (
    <div className="animate-fade-up max-w-md mx-auto text-center py-10">
      <div className="h-20 w-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
        <AlertCircle className="h-10 w-10 text-red-400" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">Ошибка оплаты</h2>
      <p className="text-sm text-gray-500 mb-8">{errorMsg}</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button onClick={() => navigate("/")} variant="outline" className="border-[#333] text-gray-400 bg-transparent hover:bg-[#1f1f1f] rounded-full">
          На главную
        </Button>
        <Button onClick={() => setStep("payment")} className="rounded-full bg-orange-500 text-[#0a0a0a] hover:bg-orange-600 font-semibold">
          <RefreshCw className="mr-2 h-4 w-4" /> Попробовать снова
        </Button>
      </div>
    </div>
  )

  const stepNum = ({ plan: 1, review: 2, payment: 3, processing: 3, success: 4, success_: 4, error: 3 } as Record<string, number>)[step]
  const showSteps = step !== "processing" && step !== "success" && step !== "error"

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <header className="border-b border-[#1a1a1a] px-6 py-4 flex items-center justify-between sticky top-0 z-30 bg-[#0a0a0a]/90 backdrop-blur-md">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
          <ArrowLeft className="h-4 w-4" /> Главная
        </button>
        <span className="text-white font-semibold flex items-center gap-2">
          <FileText className="h-4 w-4 text-orange-400" /> Оформление
        </span>
        <div className="w-20" />
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {showSteps && (
          <div className="flex items-center justify-center gap-2 sm:gap-6 mb-10 animate-fade-up">
            <StepBadge num={1} label="План" active={step === "plan"} done={stepNum > 1} />
            <div className="h-px w-6 sm:w-12 bg-[#2a2a2a]" />
            <StepBadge num={2} label="Обзор" active={step === "review"} done={stepNum > 2} />
            <div className="h-px w-6 sm:w-12 bg-[#2a2a2a]" />
            <StepBadge num={3} label="Оплата" active={step === "payment"} done={stepNum > 3} />
          </div>
        )}

        {step === "plan" && <PlanStep />}
        {step === "review" && <ReviewStep />}
        {step === "payment" && <PaymentStep />}
        {step === "processing" && <ProcessingStep />}
        {step === "success" && <SuccessStep />}
        {step === "error" && <ErrorStep />}
      </div>
    </div>
  )
}
