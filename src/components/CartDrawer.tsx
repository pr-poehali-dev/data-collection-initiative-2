import { X, ShoppingCart, Trash2, CreditCard } from "lucide-react"
import { useCart } from "@/context/CartContext"
import { Button } from "@/components/ui/button"
import { useState } from "react"

function CheckoutForm({ total, onSuccess }: { total: number; onSuccess: () => void }) {
  const [step, setStep] = useState<"form" | "done">("form")
  const [form, setForm] = useState({ name: "", email: "", card: "", exp: "", cvv: "" })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setStep("done")
    setTimeout(onSuccess, 2500)
  }

  if (step === "done") {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
        <div className="h-16 w-16 rounded-full bg-orange-500/20 flex items-center justify-center">
          <CreditCard className="h-8 w-8 text-orange-400" />
        </div>
        <h3 className="text-lg font-bold text-white">Оплата прошла!</h3>
        <p className="text-sm text-gray-400">Плагины уже доступны в вашем личном кабинете.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 mt-4">
      <div>
        <label className="text-xs text-gray-400 mb-1 block">Имя</label>
        <input
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Иван Иванов"
          className="w-full rounded-lg bg-[#0f0f0f] border border-[#333] px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-orange-500/50"
        />
      </div>
      <div>
        <label className="text-xs text-gray-400 mb-1 block">Email</label>
        <input
          required
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="ivan@example.com"
          className="w-full rounded-lg bg-[#0f0f0f] border border-[#333] px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-orange-500/50"
        />
      </div>
      <div>
        <label className="text-xs text-gray-400 mb-1 block">Номер карты</label>
        <input
          required
          value={form.card}
          onChange={(e) => setForm({ ...form, card: e.target.value })}
          placeholder="0000 0000 0000 0000"
          maxLength={19}
          className="w-full rounded-lg bg-[#0f0f0f] border border-[#333] px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-orange-500/50"
        />
      </div>
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="text-xs text-gray-400 mb-1 block">Срок</label>
          <input
            required
            value={form.exp}
            onChange={(e) => setForm({ ...form, exp: e.target.value })}
            placeholder="MM/YY"
            maxLength={5}
            className="w-full rounded-lg bg-[#0f0f0f] border border-[#333] px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-orange-500/50"
          />
        </div>
        <div className="flex-1">
          <label className="text-xs text-gray-400 mb-1 block">CVV</label>
          <input
            required
            value={form.cvv}
            onChange={(e) => setForm({ ...form, cvv: e.target.value })}
            placeholder="123"
            maxLength={3}
            className="w-full rounded-lg bg-[#0f0f0f] border border-[#333] px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-orange-500/50"
          />
        </div>
      </div>
      <Button type="submit" className="w-full rounded-full bg-orange-500 text-[#0a0a0a] font-semibold hover:bg-orange-600 mt-2">
        Оплатить {total} ₽
      </Button>
    </form>
  )
}

export function CartDrawer() {
  const { items, remove, clear, total, count, isOpen, setIsOpen } = useCart()
  const [checkout, setCheckout] = useState(false)

  const handleClose = () => {
    setIsOpen(false)
    setCheckout(false)
  }

  const handleSuccess = () => {
    clear()
    setCheckout(false)
    setIsOpen(false)
  }

  if (!isOpen) return null

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-[#111] border-l border-[#222] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#222]">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-orange-400" />
            <h2 className="font-semibold text-white">Корзина</h2>
            {count > 0 && (
              <span className="h-5 w-5 rounded-full bg-orange-500 text-[#0a0a0a] text-xs font-bold flex items-center justify-center">
                {count}
              </span>
            )}
          </div>
          <button onClick={handleClose} className="text-gray-500 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
              <ShoppingCart className="h-12 w-12 text-gray-700" />
              <p className="text-gray-500 text-sm">Корзина пуста</p>
              <p className="text-gray-600 text-xs">Добавьте плагины из каталога</p>
            </div>
          ) : checkout ? (
            <CheckoutForm total={total} onSuccess={handleSuccess} />
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-xl bg-[#1a1a1a] border border-[#262626] px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-white">{item.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {item.type === "plan" ? "Тариф" : "Плагин"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-orange-400 font-semibold text-sm">{item.price}₽</span>
                    <button
                      onClick={() => remove(item.id)}
                      className="text-gray-600 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && !checkout && (
          <div className="px-6 py-4 border-t border-[#222] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Итого:</span>
              <span className="text-white font-bold text-lg">{total} ₽</span>
            </div>
            <Button
              onClick={() => setCheckout(true)}
              className="w-full rounded-full bg-orange-500 text-[#0a0a0a] font-semibold hover:bg-orange-600"
            >
              <CreditCard className="mr-2 h-4 w-4" /> Оформить заказ
            </Button>
            <button
              onClick={() => { clear(); setCheckout(false) }}
              className="w-full text-xs text-gray-600 hover:text-gray-400 transition-colors"
            >
              Очистить корзину
            </button>
          </div>
        )}
      </div>
    </>
  )
}
