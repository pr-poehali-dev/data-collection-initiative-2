import { Terminal, ArrowUpRight, Plus, X, Check } from "lucide-react"
import { useState } from "react"

const defaultServers = [
  { ip: "play.craftmine.ru", name: "CraftMine", status: "online" },
  { ip: "mc.darkpvp.net", name: "DarkPVP", status: "online" },
]

export function SendFundsCard() {
  const [servers, setServers] = useState(defaultServers)
  const [adding, setAdding] = useState(false)
  const [newIp, setNewIp] = useState("")
  const [newName, setNewName] = useState("")
  const [installed, setInstalled] = useState<number[]>([])

  const handleAdd = () => {
    if (newIp.trim()) {
      setServers([...servers, { ip: newIp.trim(), name: newName.trim() || newIp.trim(), status: "online" }])
      setNewIp("")
      setNewName("")
      setAdding(false)
    }
  }

  const toggle = (i: number) =>
    setInstalled((prev) => prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i])

  return (
    <div className="rounded-2xl bg-[#141414] border border-[#262626] p-6 flex flex-col">
      <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-[#1f1f1f] border border-[#2a2a2a]">
        <Terminal className="h-5 w-5 text-orange-400" />
      </div>

      <h3 className="mb-2 text-lg font-semibold text-white">Консоль серверов</h3>
      <p className="mb-4 text-sm text-gray-400">После покупки плагин устанавливается на ваши серверы — добавьте IP и управляйте одним кликом</p>

      <a href="#" className="mb-6 inline-flex items-center text-sm text-orange-400 hover:text-orange-300 transition-colors">
        Настроить серверы <ArrowUpRight className="ml-1 h-4 w-4" />
      </a>

      <div className="mt-auto rounded-xl bg-[#1a1a1a] border border-[#262626] p-3 space-y-2">
        <div className="flex items-center justify-between px-1 mb-1">
          <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Мои серверы</span>
          <button
            onClick={() => setAdding(!adding)}
            className="text-xs text-orange-400 hover:text-orange-300 transition-colors flex items-center gap-1"
          >
            <Plus className="h-3 w-3" /> Добавить
          </button>
        </div>

        {adding && (
          <div className="rounded-lg bg-[#0f0f0f] border border-orange-500/30 p-3 space-y-2">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Название сервера"
              className="w-full bg-transparent text-sm text-white placeholder-gray-600 outline-none border-b border-[#2a2a2a] pb-1"
            />
            <div className="flex items-center gap-2">
              <input
                value={newIp}
                onChange={(e) => setNewIp(e.target.value)}
                placeholder="play.myserver.ru или 192.168.1.1"
                className="flex-1 bg-transparent text-sm text-white placeholder-gray-600 outline-none"
              />
              <button onClick={handleAdd} className="text-orange-400 hover:text-orange-300">
                <Check className="h-4 w-4" />
              </button>
              <button onClick={() => setAdding(false)} className="text-gray-600 hover:text-gray-400">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {servers.map((srv, i) => (
          <div key={i} className="flex items-center justify-between rounded-lg bg-[#0f0f0f] px-3 py-2.5">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500 shrink-0" />
              <div>
                <p className="text-sm font-medium text-white">{srv.name}</p>
                <p className="text-xs text-gray-600 font-mono">{srv.ip}</p>
              </div>
            </div>
            <button
              onClick={() => toggle(i)}
              className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                installed.includes(i)
                  ? "bg-green-500/20 text-green-400"
                  : "bg-orange-500/20 text-orange-400 hover:bg-orange-500/30"
              }`}
            >
              {installed.includes(i) ? "✓ Установлен" : "Установить"}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
