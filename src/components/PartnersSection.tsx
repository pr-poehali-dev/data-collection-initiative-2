import { Sparkles, Layers, Box, Code2, Terminal, Cpu, Blocks } from "lucide-react"
import Icon from "@/components/ui/icon"

const partners = [
  { name: "WooCommerce", icon: "ShoppingCart" },
  { name: "Elementor", icon: "Layers" },
  { name: "Shopify", icon: "Store" },
  { name: "WordPress", icon: "Globe" },
  { name: "Figma", icon: "Figma" },
  { name: "Webflow", icon: "Code2" },
  { name: "Notion", icon: "FileText" },
]

export function PartnersSection() {
  return (
    <section className="flex flex-wrap items-center justify-center gap-6 md:gap-10 px-4 py-8">
      {partners.map((partner) => (
        <div key={partner.name} className="flex items-center gap-2 text-gray-500">
          <Icon name={partner.icon} fallback="Box" className="h-4 w-4" />
          <span className="text-sm font-medium">{partner.name}™</span>
        </div>
      ))}
    </section>
  )
}
