import { Check, Zap, Crown, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useUser, PLAN_CATALOG } from "@/context/UserContext"
import type { PlanInfo } from "@/context/UserContext"
import { useNavigate } from "react-router-dom"
import { useState } from "react"

type PeriodKey = "month" | "half" | "forever"

const PERIOD_LABELS: Record<PeriodKey, string> = {
  month: "Месяц",
  half: "6 месяцев",
  forever: "Навсегда",
}

export function PricingSection() {
  const navigate = useNavigate()
  const { isLoggedIn, subscription } = useUser()
  const [period, setPeriod] = useState<PeriodKey>("month")

  const premiumPlan = PLAN_CATALOG.find((p) => p.tier === "premium" && p.period === period)!
  const superPlan = PLAN_CATALOG.find((p) => p.tier === "super" && p.period === period)!

  const handleBuy = (plan: PlanInfo) => {
    if (!isLoggedIn) {
      navigate("/auth")
      return
    }
    navigate(`/checkout?plan=${plan.id}`)
  }

  return (
    <section className="px-4 md:px-8 py-16">
      <div className="max-w-6xl mx-auto">
        <div className="animate-fade-up text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Тарифы</h2>
          <p className="text-gray-400 max-w-md mx-auto">Выберите план и получите полный доступ к каталогу плагинов</p>
        </div>

        {/* Переключатель периода */}
        <div className="animate-fade-up delay-100 flex justify-center mb-10">
          <div className="inline-flex bg-[#141414] border border-[#262626] rounded-full p-1">
            {(["month", "half", "forever"] as PeriodKey[]).map((p) => {
              const isActive = period === p
              const discount = p === "half" ? "−15%" : p === "forever" ? "−50%" : null
              return (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`relative px-5 py-2 rounded-full text-sm font-medium transition-all ${
                    isActive
                      ? "bg-orange-500 text-[#0a0a0a]"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {PERIOD_LABELS[p]}
                  {discount && (
                    <span className={`ml-1.5 text-[10px] font-bold ${isActive ? "text-[#0a0a0a]/80" : "text-green-400"}`}>
                      {discount}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <PlanCard plan={premiumPlan} isPopular={false} activeTier={subscription} onBuy={handleBuy} />
          <PlanCard plan={superPlan} isPopular={true} activeTier={subscription} onBuy={handleBuy} />
        </div>

        <p className="text-center text-xs text-gray-600 mt-8">
          Все тарифы с автопродлением. Отмена в любой момент через личный кабинет.
        </p>
      </div>
    </section>
  )
}

function PlanCard({ plan, isPopular, activeTier, onBuy }: {
  plan: PlanInfo
  isPopular: boolean
  activeTier: string
  onBuy: (p: PlanInfo) => void
}) {
  const isActive = activeTier === plan.id
  const isSuper = plan.tier === "super"
  const Icon = isSuper ? Sparkles : Crown

  return (
    <div className={`animate-fade-up relative rounded-2xl bg-[#141414] border p-7 flex flex-col hover-lift ${
      isPopular ? "border-orange-500/50 ring-1 ring-orange-500/30 animate-glow" : "border-[#262626]"
    }`}>
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="rounded-full bg-orange-500 px-3 py-0.5 text-xs font-bold text-[#0a0a0a] flex items-center gap-1">
            <Zap className="h-3 w-3" /> ПОПУЛЯРНЫЙ
          </span>
        </div>
      )}

      <div className="flex items-center gap-3 mb-4">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl border ${
          isSuper ? "bg-gradient-to-br from-orange-500/20 to-purple-500/20 border-orange-500/40" : "bg-[#1f1f1f] border-[#2a2a2a]"
        }`}>
          <Icon className={`h-5 w-5 ${isSuper ? "text-orange-300" : "text-orange-400"}`} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white uppercase tracking-wide">{plan.tier}</h3>
          <p className="text-xs text-gray-500">{plan.periodLabel}</p>
        </div>
      </div>

      <div className="mb-6 flex items-end gap-2">
        <span className="text-4xl font-bold text-white">{plan.price.toLocaleString("ru")}₽</span>
        {plan.discount && (
          <span className="text-xs font-bold bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full mb-1.5">{plan.discount}</span>
        )}
      </div>

      <ul className="space-y-3 mb-7 flex-1">
        {plan.features.map((f) => (
          <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
            <Check className={`h-4 w-4 shrink-0 ${isSuper ? "text-orange-300" : "text-orange-400"}`} />
            {f}
          </li>
        ))}
      </ul>

      <Button
        onClick={() => onBuy(plan)}
        disabled={isActive}
        className={
          isActive
            ? "w-full rounded-full bg-green-600 hover:bg-green-700 text-white font-semibold disabled:opacity-100"
            : isSuper
            ? "w-full rounded-full bg-gradient-to-r from-orange-500 to-purple-500 text-white hover:opacity-90 font-semibold"
            : "w-full rounded-full bg-orange-500 text-[#0a0a0a] hover:bg-orange-600 font-semibold"
        }
      >
        {isActive ? (
          <><Check className="mr-2 h-4 w-4" /> План активен</>
        ) : (
          <>Оформить за {plan.price.toLocaleString("ru")}₽</>
        )}
      </Button>
    </div>
  )
}
