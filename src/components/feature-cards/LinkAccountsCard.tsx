import { Search, ArrowUpRight, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import Icon from "@/components/ui/icon"

const plugins = [
  { name: "SEO Pro Suite", category: "SEO & Аналитика", code: "v3.2.1", color: "bg-orange-600" },
  { name: "Speed Optimizer", category: "Производительность", code: "v2.8.0", color: "bg-yellow-600" },
  { name: "Form Builder X", category: "Формы & CRM", code: "v5.1.3", color: "bg-amber-600" },
  { name: "Security Shield", category: "Безопасность", code: "v4.0.2", color: "bg-orange-700" },
]

export function LinkAccountsCard() {
  return (
    <div className="rounded-2xl bg-[#141414] border border-[#262626] p-6 flex flex-col">
      <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-[#1f1f1f] border border-[#2a2a2a]">
        <Search className="h-5 w-5 text-orange-400" />
      </div>

      <h3 className="mb-2 text-lg font-semibold text-white">Каталог плагинов</h3>
      <p className="mb-4 text-sm text-gray-400">Тысячи проверенных плагинов с рейтингами, обзорами и мгновенной установкой</p>

      <a href="#" className="mb-6 inline-flex items-center text-sm text-orange-400 hover:text-orange-300 transition-colors">
        Смотреть каталог <ArrowUpRight className="ml-1 h-4 w-4" />
      </a>

      <div className="mt-auto space-y-2 rounded-xl bg-[#1a1a1a] border border-[#262626] p-3">
        {plugins.map((plugin, index) => (
          <div key={index} className="flex items-center justify-between rounded-lg bg-[#0f0f0f] px-3 py-2">
            <div className="flex items-center gap-3">
              <div className={`h-9 w-9 rounded-lg ${plugin.color} flex items-center justify-center`}>
                <Icon name="Puzzle" fallback="Box" className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">{plugin.name}</p>
                <p className="text-xs text-gray-500">{plugin.category}</p>
              </div>
            </div>
            <span className="text-xs text-gray-500">{plugin.code}</span>
          </div>
        ))}

        <Button
          variant="ghost"
          className="w-full justify-center text-gray-500 hover:text-white hover:bg-[#1f1f1f] mt-2"
        >
          <Plus className="mr-2 h-4 w-4" /> Загрузить свой плагин
        </Button>
      </div>
    </div>
  )
}
