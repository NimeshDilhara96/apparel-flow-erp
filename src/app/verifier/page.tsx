import { getServerSession } from '@/lib/session'
import prisma from '@/lib/prisma'
import VerificationTerminal from './VerificationTerminal'
import Navbar from '@/components/Navbar'

export default async function VerifierPage() {
  const session = await getServerSession()

  // 1. Role Isolation: Prevent access if not 'cutting_verifier'
  if (!session || session.role !== 'cutting_verifier') {
    return (
      <div className="p-8 text-center text-red-700 font-bold bg-red-100 rounded-lg mt-10 border-2 border-red-500">
        403 - Forbidden: You do not have permission to access the QC Checkpoint.
      </div>
    )
  }

  // 2. Get Pending Verification orders
  const pendingOrders = await prisma.cuttingOrder.findMany({
    where: { status: 'PENDING_VERIFICATION' },
    include: {
      recipe: true,
      items: {
        include: { component: true }
      }
    },
    orderBy: { created_at: 'asc' }
  })

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-7xl mx-auto p-8 mt-4">
      <h1 className="text-3xl font-black text-gray-900 mb-8 border-b-4 border-gray-900 pb-2">
        Cutting Operations & Gatekeeper Terminal
      </h1>
      
      {pendingOrders.length === 0 ? (
        <div className="p-6 bg-white border-2 border-gray-900 rounded-lg text-center font-bold text-xl text-gray-700">
          No pending batches to verify.
        </div>
      ) : (
        <div className="space-y-8">
          {pendingOrders.map(order => (
            <VerificationTerminal key={order.id} order={order} />
          ))}
        </div>
      )}
      </div>
    </div>
  )
}
