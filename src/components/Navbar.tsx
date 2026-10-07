import { getServerSession } from '@/lib/session'
import { logout } from '@/actions/auth.actions'
import { LogOut, User } from 'lucide-react'

export default async function Navbar() {
  const session = await getServerSession()

  if (!session) return null

  // Format role for display
  const roleDisplay = session.role
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  return (
    <nav className="bg-gray-900 text-white p-4 shadow-md w-full">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="bg-emerald-500 text-white font-black px-3 py-1 rounded text-lg">
            ApparelFlow ERP
          </div>
          <div className="hidden md:flex items-center gap-2 text-gray-300 font-medium">
            <User size={18} />
            <span>Role: <span className="text-white font-bold">{roleDisplay}</span></span>
          </div>
        </div>

        <form action={logout}>
          <button 
            type="submit"
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-bold transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </form>
      </div>
    </nav>
  )
}
