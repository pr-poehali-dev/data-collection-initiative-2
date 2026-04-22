import { ArrowUpRight, Play } from "lucide-react"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="flex flex-col items-center justify-center px-4 pt-12 pb-8 text-center">
      <div className="animate-fade-up mb-6 inline-flex items-center gap-2 rounded-full bg-[#1a1a1a] py-2 text-sm px-2">
        <span className="rounded-full bg-orange-500/20 px-2 py-0.5 text-xs font-medium text-orange-400">НОВИНКА</span>
        <span className="text-gray-300">Более 10 премиальных плагинов для Minecraft</span>
        <ArrowUpRight className="h-4 w-4 text-gray-400" />
      </div>

      <h1 className="animate-fade-up delay-100 mb-4 max-w-3xl text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white text-balance">
        Маркетплейс плагинов для Minecraft
      </h1>

      <p className="animate-fade-up delay-200 mb-8 max-w-xl text-gray-400">Премиальные плагины для вашего сервера — экономика, защита, мини-игры и многое другое.</p>

      <div className="animate-fade-up delay-300 flex flex-col sm:flex-row items-center gap-4">
        <Button className="animate-glow rounded-full bg-orange-500 px-6 hover:bg-orange-600 text-[#0a0a0a] font-semibold transition-transform hover:scale-105">
          Смотреть каталог <ArrowUpRight className="ml-2 h-4 w-4" />
        </Button>
        <Button variant="outline" className="rounded-full border-gray-700 bg-transparent text-white hover:bg-gray-800 transition-transform hover:scale-105">
          <Play className="mr-2 h-4 w-4 fill-orange-500 text-orange-500" /> Смотреть обзор
        </Button>
      </div>
    </section>
  )
}
