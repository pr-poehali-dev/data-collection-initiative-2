import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useUser } from "@/context/UserContext"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft, Loader2 } from "lucide-react"
import Icon from "@/components/ui/icon"

type Mode = "login" | "register"

const PROVIDERS = [
  { id: "google" as const, label: "Google", icon: "Chrome", color: "hover:border-red-500/40 hover:bg-red-500/5" },
  { id: "discord" as const, label: "Discord", icon: "MessageSquare", color: "hover:border-indigo-500/40 hover:bg-indigo-500/5" },
  { id: "github" as const, label: "GitHub", icon: "Github", color: "hover:border-gray-500/40 hover:bg-gray-500/5" },
]

export default function Auth() {
  const navigate = useNavigate()
  const { login, register, loginWithProvider } = useUser()
  const [mode, setMode] = useState<Mode>("login")
  const [form, setForm] = useState({ name: "", email: "", password: "" })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const set = (k: string, v: string) => { setForm((f) => ({ ...f, [k]: v })); setError("") }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.email || !form.password) { setError("Заполните все поля"); return }
    if (mode === "register" && !form.name) { setError("Введите имя"); return }
    setLoading(true)
    try {
      if (mode === "login") await login(form.email, form.password)
      else await register(form.email, form.password, form.name)
      navigate("/dashboard")
    } catch {
      setError("Ошибка входа. Проверьте данные.")
    } finally {
      setLoading(false)
    }
  }

  const handleProvider = async (provider: typeof PROVIDERS[0]["id"]) => {
    setLoading(true)
    try {
      await loginWithProvider(provider)
      navigate("/dashboard")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Декоративный фон */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-orange-600/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Логотип */}
        <div className="text-center mb-8 animate-fade-up">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-300 transition-colors mb-6 text-sm"
          >
            <ArrowLeft className="h-4 w-4" /> Вернуться
          </button>
          <div className="flex justify-center mb-3">
            <div className="h-14 w-14 rounded-2xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center animate-float">
              <span className="text-2xl">🧩</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white">PlugMarket</h1>
          <p className="text-sm text-gray-500 mt-1">
            {mode === "login" ? "Войдите в свой аккаунт" : "Создайте аккаунт"}
          </p>
        </div>

        <div className="animate-fade-up delay-100 rounded-2xl bg-[#141414] border border-[#262626] p-6">
          {/* OAuth провайдеры */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {PROVIDERS.map((p) => (
              <button
                key={p.id}
                onClick={() => handleProvider(p.id)}
                disabled={loading}
                className={`flex flex-col items-center gap-1.5 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] py-3 transition-all ${p.color} hover:scale-105 disabled:opacity-50`}
              >
                <Icon name={p.icon} fallback="Globe" className="h-5 w-5 text-gray-300" />
                <span className="text-xs text-gray-500">{p.label}</span>
              </button>
            ))}
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#2a2a2a]" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[#141414] px-3 text-xs text-gray-600">или через email</span>
            </div>
          </div>

          {/* Форма */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
                <input
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="Отображаемое имя"
                  className="w-full rounded-xl bg-[#0f0f0f] border border-[#2a2a2a] pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-orange-500/50 transition-colors"
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
              <input
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="Email"
                className="w-full rounded-xl bg-[#0f0f0f] border border-[#2a2a2a] pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-orange-500/50 transition-colors"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
              <input
                type={showPass ? "text" : "password"}
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                placeholder="Пароль"
                className="w-full rounded-xl bg-[#0f0f0f] border border-[#2a2a2a] pl-10 pr-10 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-orange-500/50 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400"
              >
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {error && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-orange-500 text-[#0a0a0a] font-semibold hover:bg-orange-600 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:scale-100"
            >
              {loading
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : mode === "login" ? "Войти" : "Зарегистрироваться"}
            </Button>
          </form>

          <div className="mt-5 text-center">
            {mode === "login" ? (
              <p className="text-sm text-gray-600">
                Нет аккаунта?{" "}
                <button onClick={() => setMode("register")} className="text-orange-400 hover:text-orange-300 font-medium">
                  Зарегистрироваться
                </button>
              </p>
            ) : (
              <p className="text-sm text-gray-600">
                Уже есть аккаунт?{" "}
                <button onClick={() => setMode("login")} className="text-orange-400 hover:text-orange-300 font-medium">
                  Войти
                </button>
              </p>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-gray-700 mt-4 animate-fade-up delay-200">
          Нажимая «Войти», вы соглашаетесь с{" "}
          <span className="text-gray-600 hover:text-gray-400 cursor-pointer transition-colors">Условиями использования</span>
        </p>
      </div>
    </div>
  )
}
