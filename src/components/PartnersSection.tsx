import Icon from "@/components/ui/icon"

const partners = [
  { name: "Spigot", icon: "Package" },
  { name: "Paper MC", icon: "FileText" },
  { name: "Bukkit", icon: "Box" },
  { name: "Purpur", icon: "Sparkles" },
  { name: "Velocity", icon: "Zap" },
  { name: "BungeeCord", icon: "Network" },
  { name: "Modrinth", icon: "Globe" },
]

export function PartnersSection() {
  return (
    <section className="animate-fade-in flex flex-wrap items-center justify-center gap-6 md:gap-10 px-4 py-8">
      {partners.map((partner, i) => (
        <div
          key={partner.name}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-400 transition-colors cursor-default"
          style={{ animationDelay: `${i * 0.07}s` }}
        >
          <Icon name={partner.icon} fallback="Box" className="h-4 w-4" />
          <span className="text-sm font-medium">{partner.name}™</span>
        </div>
      ))}
    </section>
  )
}
