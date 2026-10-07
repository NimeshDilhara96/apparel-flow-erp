import { loginWithEmail } from '@/actions/auth.actions'
import { Scissors, ClipboardCheck, Factory, LogIn } from 'lucide-react'

const roles = [
  {
    id: 'cutting_supervisor',
    title: 'Cutting Supervisor',
    email: 'supervisor@webtezza.com',
    icon: Scissors,
    color: 'bg-blue-500/10 text-blue-500',
    borderColor: 'border-blue-500/20 hover:border-blue-500/50',
    description: 'Create & manage cutting orders, assign fabric rolls.',
  },
  {
    id: 'cutting_verifier',
    title: 'Cutting Verifier',
    email: 'verifier@webtezza.com',
    icon: ClipboardCheck,
    color: 'bg-emerald-500/10 text-emerald-500',
    borderColor: 'border-emerald-500/20 hover:border-emerald-500/50',
    description: 'Verify and approve cutting items, log wastage.',
  },
  {
    id: 'sewing_supervisor',
    title: 'Sewing Supervisor',
    email: 'sewing@webtezza.com',
    icon: Factory,
    color: 'bg-amber-500/10 text-amber-500',
    borderColor: 'border-amber-500/20 hover:border-amber-500/50',
    description: 'Receive approved batches for sewing production.',
  },
]

export default function RoleSwitcher() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-600/10 blur-[120px] pointer-events-none" />

      <div className="z-10 w-full max-w-5xl">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-emerald-400 mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-2" />
            System Online
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
            Apparel<span className="text-emerald-500">Flow</span> ERP
          </h1>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Select a demo role to experience the terminal operations. This bypasses standard authentication for testing purposes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {roles.map((role) => {
            const Icon = role.icon
            // bind action to pass email
            const actionWithEmail = loginWithEmail.bind(null, role.email)
            
            return (
              <form key={role.id} action={actionWithEmail}>
                <button
                  type="submit"
                  className={`w-full group text-left p-8 rounded-3xl bg-zinc-900/40 border backdrop-blur-md transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-black/50 ${role.borderColor}`}
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 ${role.color}`}>
                    <Icon size={28} />
                  </div>
                  <h3 className="text-2xl font-semibold mb-3 tracking-tight">{role.title}</h3>
                  <p className="text-base text-zinc-400 mb-8 min-h-[48px] leading-relaxed">
                    {role.description}
                  </p>
                  <div className="flex items-center text-sm font-medium text-zinc-500 group-hover:text-white transition-colors duration-300">
                    <LogIn size={18} className="mr-2 group-hover:translate-x-1 transition-transform" />
                    Enter Terminal
                  </div>
                </button>
              </form>
            )
          })}
        </div>
      </div>
    </div>
  )
}
