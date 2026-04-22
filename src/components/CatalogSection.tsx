import { useState } from "react"
import { X, Star, Zap, Sword, Home, Map, Users, ShoppingCart, Trophy, Settings, Shield, Plus, Check, Crown, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/context/CartContext"
import { useUser } from "@/context/UserContext"

const categories = ["Все", "Экономика", "Защита", "Мини-игры", "Строительство", "Карты", "Социальное"]

const plugins = [
  {
    id: 1, name: "EssentialsX", category: "Социальное", icon: Users, color: "bg-blue-600",
    price: 149, rating: 4.9, downloads: "2.1M", version: "2.21.0", premium: true,
    description: "Незаменимый плагин для любого сервера. Добавляет сотни базовых команд: /home, /tp, /spawn, /kit, /msg и десятки других. Включает экономику, варпы, ники и управление игроками.",
    features: ["Более 100 команд", "Встроенная экономика", "Система варпов", "Управление игроками", "Кастомные сообщения"],
    compatible: "1.16–1.21",
  },
  {
    id: 2, name: "Vault", category: "Экономика", icon: ShoppingCart, color: "bg-yellow-600",
    price: 99, rating: 4.8, downloads: "3.5M", version: "1.7.3", premium: true,
    description: "Стандарт экономики для Minecraft-серверов. Позволяет плагинам взаимодействовать между собой через единый API для денег, прав и чата. Обязателен для большинства экономических плагинов.",
    features: ["Единый API экономики", "Интеграция с Permission", "Поддержка 50+ плагинов", "Лёгкая настройка", "Стабильность"],
    compatible: "1.13–1.21",
  },
  {
    id: 3, name: "WorldGuard", category: "Защита", icon: Shield, color: "bg-green-600",
    price: 199, rating: 4.9, downloads: "4.2M", version: "7.0.11", premium: true,
    description: "Мощная система защиты регионов. Создавайте охраняемые зоны, запрещайте PvP, взрывы, постройки и гриферство в любой части мира. Идеален для выживания и городских серверов.",
    features: ["Защита регионов", "Запрет PvP / взрывов", "Флаги и разрешения", "Интеграция с WorldEdit", "Защита от гриферства"],
    compatible: "1.16–1.21",
  },
  {
    id: 4, name: "BedWars", category: "Мини-игры", icon: Sword, color: "bg-red-600",
    price: 349, rating: 4.7, downloads: "890K", version: "0.9.8", premium: false,
    description: "Полноценная реализация BedWars для вашего сервера. Автоматические арены, магазин, команды, генераторы ресурсов, рейтинговая система. Настраивается до мелочей.",
    features: ["Автоматические арены", "Система рейтинга", "Генераторы ресурсов", "Командный режим", "Кастомный магазин"],
    compatible: "1.18–1.21",
  },
  {
    id: 5, name: "LuckPerms", category: "Социальное", icon: Settings, color: "bg-purple-600",
    price: 179, rating: 5.0, downloads: "5.1M", version: "5.4.130", premium: true,
    description: "Лучший плагин управления правами. Группы, наследование, контекстные разрешения, веб-редактор, синхронизация между серверами. Незаменим для любого серьёзного проекта.",
    features: ["Группы и роли", "Веб-редактор", "Синхронизация серверов", "Контекстные права", "Полный лог изменений"],
    compatible: "1.13–1.21",
  },
  {
    id: 6, name: "PlotSquared", category: "Строительство", icon: Home, color: "bg-orange-600",
    price: 249, rating: 4.8, downloads: "1.3M", version: "7.3.9", premium: false,
    description: "Система приватных участков для творческих серверов. Игроки получают личные плоты, могут строить, приглашать друзей и защищать свои постройки. Богатая система флагов.",
    features: ["Личные участки", "Приглашение друзей", "Флаги участков", "Авто-очистка", "Интеграция с WorldEdit"],
    compatible: "1.18–1.21",
  },
  {
    id: 7, name: "Dynmap", category: "Карты", icon: Map, color: "bg-teal-600",
    price: 299, rating: 4.6, downloads: "2.8M", version: "3.7.0", premium: true,
    description: "Онлайн-карта вашего мира в реальном времени прямо в браузере. Показывает игроков, постройки, биомы и регионы. Поддерживает несколько миров и кастомные маркеры.",
    features: ["Карта в реальном времени", "Все миры сервера", "Маркеры на карте", "Отображение игроков", "Встроенный чат"],
    compatible: "1.16–1.21",
  },
  {
    id: 8, name: "SkyWars", category: "Мини-игры", icon: Trophy, color: "bg-amber-600",
    price: 319, rating: 4.7, downloads: "740K", version: "1.12.0", premium: false,
    description: "Популярная мини-игра SkyWars с готовыми аренами, сундуками, системой очков и рейтингом. Поддерживает соло и командный режим. Простая настройка через конфиг.",
    features: ["Готовые арены", "Рейтинг и статистика", "Соло и команды", "Кастомные сундуки", "Эффекты победы"],
    compatible: "1.17–1.21",
  },
  {
    id: 9, name: "QuickShop", category: "Экономика", icon: ShoppingCart, color: "bg-lime-600",
    price: 189, rating: 4.8, downloads: "1.7M", version: "6.2.0.8", premium: false,
    description: "Простые в создании магазины прямо в сундуках. Игроки продают и покупают предметы без команд — достаточно кликнуть по сундуку. Полная интеграция с Vault.",
    features: ["Магазин в сундуке", "Авто-цены", "Интеграция с Vault", "История транзакций", "Налоги и сборы"],
    compatible: "1.16–1.21",
  },
]

type Plugin = typeof plugins[0]

function PluginModal({ plugin, onClose }: { plugin: Plugin; onClose: () => void }) {
  const { add, items } = useCart()
  const { subscription, ownedPlugins, addOwnedPlugin, isLoggedIn } = useUser()
  const inCart = items.some((i) => i.id === plugin.id)
  const isOwned = ownedPlugins.some((p) => p.id === plugin.id)
  const hasSubscription = subscription !== "none"
  const hasAccess = isOwned || (plugin.premium && hasSubscription)
  const IconComp = plugin.icon

  const handleBuy = () => {
    if (!inCart) {
      add({ id: plugin.id, name: plugin.name, price: plugin.price, type: "plugin" })
      if (isLoggedIn) {
        addOwnedPlugin({
          id: plugin.id, name: plugin.name, version: plugin.version,
          category: plugin.category, installedServers: [], whitelistIps: [],
          apiKey: `pm-${Math.random().toString(36).slice(2, 14)}`,
        })
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="animate-fade-up relative w-full max-w-lg rounded-2xl bg-[#141414] border border-[#2a2a2a] p-6 overflow-y-auto max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-4 mb-5">
          <div className={`h-14 w-14 rounded-xl ${plugin.color} flex items-center justify-center shrink-0`}>
            <IconComp className="h-7 w-7 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">{plugin.name}</h2>
              {plugin.premium && (
                <span className="flex items-center gap-1 rounded-full bg-orange-500/20 border border-orange-500/30 px-2 py-0.5 text-xs font-bold text-orange-400">
                  <Crown className="h-3 w-3" /> PREMIUM
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs text-gray-500 bg-[#1f1f1f] px-2 py-0.5 rounded-full">{plugin.category}</span>
              <span className="text-xs text-gray-500">v{plugin.version}</span>
              <span className="text-xs text-gray-500">{plugin.compatible}</span>
            </div>
          </div>
        </div>

        {plugin.premium && !hasSubscription && (
          <div className="mb-4 rounded-xl bg-orange-500/10 border border-orange-500/30 px-4 py-3 flex items-center gap-3">
            <Crown className="h-4 w-4 text-orange-400 shrink-0" />
            <p className="text-xs text-orange-300">Доступен по подписке — или купите отдельно</p>
          </div>
        )}
        {plugin.premium && hasSubscription && (
          <div className="mb-4 rounded-xl bg-green-500/10 border border-green-500/30 px-4 py-3 flex items-center gap-3">
            <Check className="h-4 w-4 text-green-400 shrink-0" />
            <p className="text-xs text-green-300">Доступен по вашей подписке бесплатно</p>
          </div>
        )}

        <div className="flex items-center gap-6 mb-5 p-3 rounded-xl bg-[#1a1a1a] border border-[#262626]">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{plugin.price}₽</p>
            <p className="text-xs text-gray-500">за лицензию</p>
          </div>
          <div className="text-center">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
              <p className="text-lg font-bold text-white">{plugin.rating}</p>
            </div>
            <p className="text-xs text-gray-500">рейтинг</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-white">{plugin.downloads}</p>
            <p className="text-xs text-gray-500">загрузок</p>
          </div>
        </div>

        <p className="text-sm text-gray-300 mb-5 leading-relaxed">{plugin.description}</p>

        <div className="mb-6">
          <p className="text-xs font-semibold text-gray-400 uppercase mb-3">Возможности</p>
          <ul className="space-y-2">
            {plugin.features.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                <Zap className="h-3.5 w-3.5 text-orange-400 shrink-0" />{f}
              </li>
            ))}
          </ul>
        </div>

        {hasAccess ? (
          <Button className="w-full rounded-full bg-green-600 hover:bg-green-700 text-white font-semibold">
            <Check className="mr-2 h-4 w-4" /> Уже в вашей библиотеке
          </Button>
        ) : (
          <Button
            onClick={handleBuy}
            className={`w-full rounded-full font-semibold ${inCart ? "bg-green-600 hover:bg-green-700 text-white" : "bg-orange-500 text-[#0a0a0a] hover:bg-orange-600"}`}
          >
            {inCart
              ? <><Check className="mr-2 h-4 w-4" /> В корзине</>
              : <><Plus className="mr-2 h-4 w-4" /> В корзину — {plugin.price}₽</>}
          </Button>
        )}
      </div>
    </div>
  )
}

export function CatalogSection() {
  const [activeCategory, setActiveCategory] = useState("Все")
  const [selectedPlugin, setSelectedPlugin] = useState<Plugin | null>(null)
  const { add, items } = useCart()
  const { subscription, ownedPlugins, addOwnedPlugin, isLoggedIn } = useUser()

  const hasSubscription = subscription !== "none"
  const filtered = activeCategory === "Все" ? plugins : plugins.filter((p) => p.category === activeCategory)
  const { wishlist, toggleWishlist } = useUser()

  const handleAddToCart = (plugin: Plugin) => {
    add({ id: plugin.id, name: plugin.name, price: plugin.price, type: "plugin" })
    if (isLoggedIn) {
      addOwnedPlugin({
        id: plugin.id, name: plugin.name, version: plugin.version,
        category: plugin.category, installedServers: [], whitelistIps: [],
        apiKey: `pm-${Math.random().toString(36).slice(2, 14)}`,
      })
    }
  }

  return (
    <section className="px-4 md:px-8 py-16">
      <div className="max-w-6xl mx-auto">
        <div className="animate-fade-up text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Каталог плагинов</h2>
          <p className="text-gray-400 max-w-md mx-auto">Проверенные плагины для Minecraft — нажмите на карточку для подробного описания</p>
        </div>

        <div className="animate-fade-up delay-100 flex flex-wrap gap-2 justify-center mb-8">
          {categories.map((cat) => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all cursor-pointer hover:scale-105 ${
                activeCategory === cat ? "bg-orange-500 text-[#0a0a0a]" : "bg-[#1a1a1a] text-gray-400 hover:text-white border border-[#262626]"
              }`}
            >{cat}</button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((plugin, idx) => {
            const IconComp = plugin.icon
            const inCart = items.some((i) => i.id === plugin.id)
            const isOwned = ownedPlugins.some((p) => p.id === plugin.id)
            const hasAccess = isOwned || (plugin.premium && hasSubscription)

            return (
              <div key={plugin.id}
                className="animate-fade-up hover-lift rounded-2xl bg-[#141414] border border-[#262626] p-5 flex flex-col hover:border-orange-500/40 hover:bg-[#1a1a1a] transition-all group"
                style={{ animationDelay: `${idx * 0.07}s` }}
              >
                <div className="flex items-center justify-between mb-3">
                  <button onClick={() => setSelectedPlugin(plugin)} className="flex items-center gap-3 text-left flex-1 min-w-0">
                    <div className={`relative h-11 w-11 rounded-xl ${plugin.color} flex items-center justify-center shrink-0`}>
                      <IconComp className="h-5 w-5 text-white" />
                      {plugin.premium && (
                        <div className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-orange-500 flex items-center justify-center">
                          <Crown className="h-2.5 w-2.5 text-white" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-white group-hover:text-orange-300 transition-colors">{plugin.name}</p>
                      <p className="text-xs text-gray-500">{plugin.category}</p>
                    </div>
                  </button>
                  <button
                    onClick={() => toggleWishlist(plugin.id)}
                    className={`shrink-0 transition-all ${wishlist.includes(plugin.id) ? "text-red-400 scale-110" : "text-gray-700 hover:text-red-400"}`}
                  >
                    <Heart className={`h-4 w-4 ${wishlist.includes(plugin.id) ? "fill-red-400" : ""}`} />
                  </button>
                </div>

                <button onClick={() => setSelectedPlugin(plugin)} className="text-left flex-1 mb-4">
                  <p className="text-sm text-gray-400 line-clamp-2">{plugin.description}</p>
                </button>

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
                    <span className="text-sm text-gray-300">{plugin.rating}</span>
                    <span className="text-xs text-gray-600 ml-1">({plugin.downloads})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {plugin.premium && (
                      <span className="text-xs text-orange-400 font-medium flex items-center gap-0.5">
                        <Crown className="h-3 w-3" /> Premium
                      </span>
                    )}
                    {!plugin.premium && <span className="text-orange-400 font-semibold text-sm">{plugin.price}₽</span>}
                  </div>
                </div>

                {hasAccess ? (
                  <Button size="sm" className="w-full rounded-full text-xs font-semibold bg-green-600 hover:bg-green-700 text-white">
                    <Check className="mr-1 h-3 w-3" /> В библиотеке
                  </Button>
                ) : (
                  <Button size="sm"
                    onClick={() => !inCart && handleAddToCart(plugin)}
                    className={`w-full rounded-full text-xs font-semibold ${inCart ? "bg-green-600 hover:bg-green-700 text-white" : "bg-orange-500 text-[#0a0a0a] hover:bg-orange-600"}`}
                  >
                    {inCart
                      ? <><Check className="mr-1 h-3 w-3" /> В корзине</>
                      : plugin.premium && !hasSubscription
                      ? <><Crown className="mr-1 h-3 w-3" /> {plugin.price}₽ или подписка</>
                      : <><Plus className="mr-1 h-3 w-3" /> В корзину</>}
                  </Button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {selectedPlugin && <PluginModal plugin={selectedPlugin} onClose={() => setSelectedPlugin(null)} />}
    </section>
  )
}