import { Header } from "@/components/Header"
import { HeroSection } from "@/components/HeroSection"
import { PartnersSection } from "@/components/PartnersSection"
import { FeaturesSection } from "@/components/FeaturesSection"
import { CatalogSection } from "@/components/CatalogSection"
import { PricingSection } from "@/components/PricingSection"

export default function Index() {
  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <Header />
      <section id="hero"><HeroSection /></section>
      <section id="partners"><PartnersSection /></section>
      <section id="features"><FeaturesSection /></section>
      <section id="catalog"><CatalogSection /></section>
      <section id="pricing"><PricingSection /></section>
      <footer className="py-8 text-center text-sm text-gray-400">
        От поиска до установки и обновлений —{" "}
        <span className="font-medium text-white">всё в одном маркетплейсе.</span>
      </footer>
    </main>
  )
}
