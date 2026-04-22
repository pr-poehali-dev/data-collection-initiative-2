import { Crown, ArrowUpRight, Check, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"

const tiers = [
  { name: "Старт", price: "299₽", period: "/мес", active: false, color: "bg-[#1f1f1f]", textColor: "text-gray-400" },
  { name: "Про", price: "699₽", period: "/3 мес", active: true, color: "bg-orange-500/10 border border-orange-500/30", textColor: "text-orange-400" },
  { name: "Навсегда", price: "1990₽", period: "∞", active: false, color: "bg-[#1f1f1f]", textColor: "text-gray-400" },
]

const perks = [
  "Все плагины без ограничений",
  "Автообновления включены",
  "Приоритетная поддержка 24/7",
]

export function PaymentRolesCard() {
  return (
    <div className="rounded-2xl bg-[#141414] border border-[#262626] p-6 flex flex-col">
      <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-[#1f1f1f] border border-[#2a2a2a]">
        <Crown className="h-5 w-5 text-yellow-400" />
      </div>

      <h3 className="mb-2 text-lg font-semibold text-white">Премиум-подписка</h3>
      <p className="mb-4 text-sm text-gray-400">Один план — доступ ко всем плагинам, обновлениям и поддержке без лишних платежей</p>

      <a href="#" className="mb-6 inline-flex items-center text-sm text-orange-400 hover:text-orange-300 transition-colors">
        Выбрать подписку <ArrowUpRight className="ml-1 h-4 w-4" />
      </a>

      <div className="mt-auto rounded-xl bg-[#1a1a1a] border border-[#262626] p-4 space-y-4">
        <div className="grid grid-cols-3 gap-2">
          {tiers.map((tier) => (
            <div key={tier.name} className={`rounded-lg ${tier.color} px-2 py-2.5 text-center cursor-pointer transition-all hover:opacity-90`}>
              <p className={`text-xs font-semibold ${tier.textColor}`}>{tier.name}</p>
              <p className="text-sm font-bold text-white mt-0.5">{tier.price}</p>
              <p className="text-[10px] text-gray-500">{tier.period}</p>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          {perks.map((perk) => (
            <div key={perk} className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full bg-orange-500/20 flex items-center justify-center shrink-0">
                <Check className="h-2.5 w-2.5 text-orange-400" />
              </div>
              <span className="text-xs text-gray-300">{perk}</span>
            </div>
          ))}
        </div>

        <Button className="w-full bg-orange-500 text-[#0a0a0a] font-semibold hover:bg-orange-600 rounded-lg">
          <Zap className="mr-2 h-4 w-4" /> Оформить подписку
        </Button>
      </div>
    </div>
  )
}
