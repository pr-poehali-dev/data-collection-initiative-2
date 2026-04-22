import { Star, ArrowUpRight, ChevronDown, ShieldCheck } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

export function PaymentRolesCard() {
  return (
    <div className="rounded-2xl bg-[#141414] border border-[#262626] p-6 flex flex-col">
      <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-[#1f1f1f] border border-[#2a2a2a]">
        <Star className="h-5 w-5 text-yellow-400" />
      </div>

      <h3 className="mb-2 text-lg font-semibold text-white">Премиум-лицензии</h3>
      <p className="mb-4 text-sm text-gray-400">Покупайте и управляйте лицензиями, получайте обновления и приоритетную поддержку</p>

      <a href="#" className="mb-6 inline-flex items-center text-sm text-orange-400 hover:text-orange-300 transition-colors">
        Подробнее <ArrowUpRight className="ml-1 h-4 w-4" />
      </a>

      <div className="mt-auto space-y-4 rounded-xl bg-[#1a1a1a] border border-[#262626] p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src="/professional-man-portrait.png" alt="Иван Разработчик" />
              <AvatarFallback className="bg-orange-700 text-white">ИР</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-white">Иван Разработчик</p>
              <p className="text-xs text-gray-500">ivan@company.ru</p>
            </div>
          </div>
          <button className="text-sm text-orange-400 hover:text-orange-300">Изменить</button>
        </div>

        <div>
          <label className="mb-2 flex items-center gap-1 text-xs text-gray-400">
            Тип лицензии
          </label>
          <div className="flex items-center justify-between rounded-lg bg-[#0f0f0f] border border-[#262626] px-3 py-2.5">
            <span className="text-sm text-white">Бизнес · до 10 сайтов</span>
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </div>
          <p className="mt-1 text-xs text-gray-500">Пожизненная лицензия, все обновления включены.</p>
        </div>

        <div className="border-t border-dashed border-[#333] pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0f0f0f] border border-[#262626]">
                <ShieldCheck className="h-5 w-5 text-orange-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Гарантия качества</p>
                <p className="text-xs text-gray-500">30 дней возврата средств</p>
              </div>
            </div>
            <button className="text-sm text-orange-400 hover:text-orange-300">Детали</button>
          </div>
        </div>

        <Button className="w-full bg-orange-500 text-[#0a0a0a] font-semibold hover:bg-orange-600">Купить лицензию</Button>
      </div>
    </div>
  )
}
