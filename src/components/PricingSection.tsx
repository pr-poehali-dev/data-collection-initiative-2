import { Check, Zap, Star, Crown, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/context/CartContext"
import { useUser } from "@/context/UserContext"
import type { SubscriptionTier } from "@/context/UserContext"

const plans = [
  {
    id: "month",
    name: "1 месяц",
    price: "299",
    period: "/ мес",
    icon: Zap,
    color: "text-orange-400",
    borderColor: "border-[#262626]",
    badge: null,
    features: [
      "Доступ ко всем плагинам",
      "Автообновления",
      "Базовая поддержка",
      "До 1 сервера",
      "Документация",
    ],
  },
  {
    id: "quarter",
    name: "3 месяца",
    price: "699",
    period: "/ 3 мес",
    icon: Star,
    color: "text-yellow-400",
    borderColor: "border-orange-500/50",
    badge: "ВЫГОДА 22%",
    features: [
      "Доступ ко всем плагинам",
      "Автообновления",
      "Приоритетная поддержка",
      "До 3 серверов",
      "Документация + видео-гайды",
    ],
  },
  {
    id: "forever",
    name: "Навсегда",
    price: "1 990",
    period: "единоразово",
    icon: Crown,
    color: "text-orange-300",
    borderColor: "border-[#262626]",
    badge: null,
    features: [
      "Доступ ко всем плагинам",
      "Все обновления навсегда",
      "VIP-поддержка 24/7",
      "Неограниченно серверов",
      "Документация + видео-гайды",
    ],
  },
]

export function PricingSection() {
  const { add, items } = useCart()
  const { subscription, setSubscription, isLoggedIn, login } = useUser()

  return (
    <section className="px-4 md:px-8 py-16">
      <div className="max-w-6xl mx-auto">
        <div className="animate-fade-up text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Тарифы</h2>
          <p className="text-gray-400 max-w-md mx-auto">Выберите план и получите доступ ко всем плагинам маркетплейса</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, idx) => {
            const IconComp = plan.icon
            const isPopular = plan.id === "quarter"
            const inCart = items.some((i) => i.id === plan.id)
            const priceNum = parseInt(plan.price.replace(/\s/g, ""))
            return (
              <div
                key={plan.id}
                className={`animate-fade-up hover-lift relative rounded-2xl bg-[#141414] border ${plan.borderColor} p-6 flex flex-col ${isPopular ? "ring-1 ring-orange-500/30 animate-glow" : ""}`}
                style={{ animationDelay: `${idx * 0.12}s` }}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-orange-500 px-3 py-0.5 text-xs font-bold text-[#0a0a0a]">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#1f1f1f] border border-[#2a2a2a]">
                  <IconComp className={`h-5 w-5 ${plan.color}`} />
                </div>

                <h3 className="text-lg font-semibold text-white mb-1">{plan.name}</h3>

                <div className="mb-6 mt-2 flex items-end gap-1">
                  <span className="text-4xl font-bold text-white">{plan.price}₽</span>
                  <span className="text-gray-500 text-sm mb-1">{plan.period}</span>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                      <Check className="h-4 w-4 text-orange-400 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => {
                    if (!isLoggedIn) login()
                    setSubscription(plan.id as SubscriptionTier)
                    if (!inCart) add({ id: plan.id, name: `Тариф «${plan.name}»`, price: priceNum, type: "plan" })
                  }}
                  className={
                    subscription === plan.id
                      ? "w-full rounded-full bg-green-600 hover:bg-green-700 text-white font-semibold"
                      : isPopular
                      ? "w-full rounded-full bg-orange-500 text-[#0a0a0a] font-semibold hover:bg-orange-600"
                      : "w-full rounded-full bg-[#252525] text-white hover:bg-[#2f2f2f]"
                  }
                >
                  {subscription === plan.id
                    ? <><Check className="mr-2 h-4 w-4" /> Активна</>
                    : <><Crown className="mr-2 h-4 w-4" /> Выбрать план</>}
                </Button>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}