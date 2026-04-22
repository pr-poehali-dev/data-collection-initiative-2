import { Search, ArrowUpRight, Star } from "lucide-react"

const plugins = [
  { name: "EssentialsX", category: "Социальное", rating: 4.9, reviews: 1240, color: "bg-blue-600", badge: "ТОП" },
  { name: "WorldGuard", category: "Защита", rating: 4.9, reviews: 980, color: "bg-green-600", badge: null },
  { name: "LuckPerms", category: "Права", rating: 5.0, reviews: 2100, color: "bg-purple-600", badge: "★" },
  { name: "BedWars", category: "Мини-игры", rating: 4.7, reviews: 630, color: "bg-red-600", badge: null },
]

export function LinkAccountsCard() {
  return (
    <div className="rounded-2xl bg-[#141414] border border-[#262626] p-6 flex flex-col">
      <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-[#1f1f1f] border border-[#2a2a2a]">
        <Search className="h-5 w-5 text-orange-400" />
      </div>

      <h3 className="mb-2 text-lg font-semibold text-white">Каталог плагинов</h3>
      <p className="mb-4 text-sm text-gray-400">Проверенные плагины с реальными рейтингами и обзорами от владельцев серверов</p>

      <a href="#" className="mb-6 inline-flex items-center text-sm text-orange-400 hover:text-orange-300 transition-colors">
        Смотреть каталог <ArrowUpRight className="ml-1 h-4 w-4" />
      </a>

      <div className="mt-auto space-y-2 rounded-xl bg-[#1a1a1a] border border-[#262626] p-3">
        {plugins.map((plugin, index) => (
          <div key={index} className="flex items-center justify-between rounded-lg bg-[#0f0f0f] px-3 py-2.5 hover:bg-[#161616] transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <div className={`h-8 w-8 rounded-lg ${plugin.color} flex items-center justify-center shrink-0`}>
                <span className="text-white text-xs font-bold">{plugin.name[0]}</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-medium text-white">{plugin.name}</p>
                  {plugin.badge && (
                    <span className="text-[10px] bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded-full font-medium">{plugin.badge}</span>
                  )}
                </div>
                <p className="text-xs text-gray-500">{plugin.category}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 justify-end">
                <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                <span className="text-xs text-white font-medium">{plugin.rating}</span>
              </div>
              <p className="text-[10px] text-gray-600">{plugin.reviews} отзывов</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
