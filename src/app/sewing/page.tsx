import { getServerSession } from '@/lib/session'
import prisma from '@/lib/prisma'
import Navbar from '@/components/Navbar'

export default async function SewingQueuePage() {
  const session = await getServerSession()

  // 1. Check if the user is a Sewing Supervisor. 
  // If not, block access completely (Server-Side RBAC).
  if (!session || session.role !== 'sewing_supervisor') {
    return (
      <div className="p-8 text-center text-red-700 font-bold bg-red-100 rounded-lg mt-10 border-2 border-red-500">
        403 - Forbidden: You do not have permission to access the Sewing Queue.
      </div>
    )
  }

  // 2. Query Isolation: ONLY fetch orders that are 'VERIFIED'.
  // Unapproved or rejected orders will never appear here.
  const verifiedOrders = await prisma.cuttingOrder.findMany({
    where: { status: 'VERIFIED' },
    include: {
      recipe: true,
      verification_logs: {
        include: {
          verifier: true
        }
      }
    },
    orderBy: { updated_at: 'asc' }
  })

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-7xl mx-auto p-8 mt-4">
        <h1 className="text-3xl font-black text-gray-900 mb-8 border-b-4 border-gray-900 pb-2">
          Sewing Queue - Ready for Assembly
        </h1>

        {verifiedOrders.length === 0 ? (
          <div className="p-6 bg-white border-2 border-gray-900 rounded-lg text-center font-bold text-xl text-gray-700">
            No verified batches available for sewing.
          </div>
        ) : (
          <div className="grid gap-6">
            {verifiedOrders.map(order => {
              // Get the last verification log to show who approved it and the fabric wastage
              const lastLog = order.verification_logs[order.verification_logs.length - 1];

              return (
                <div key={order.id} className="bg-white p-6 rounded-lg shadow-lg border-2 border-green-900">
                  <div className="flex flex-col md:flex-row justify-between items-start mb-4 border-b-2 border-gray-900 pb-4 gap-4 md:gap-0">
                    <div>
                      <h2 className="text-2xl font-black text-black">{order.order_no}</h2>
                      <p className="text-gray-900 font-bold text-lg">
                        {order.recipe.name} - {order.target_qty} Garments
                      </p>
                    </div>
                    <span className="bg-green-700 text-white px-4 py-2 rounded font-black text-lg border-2 border-green-900 w-full md:w-auto text-center">
                      VERIFIED & READY
                    </span>
                  </div>

                  {/* Audit and Wastage Information */}
                  <div className="bg-gray-50 p-4 rounded border-2 border-gray-400 mb-6">
                    <h3 className="font-bold text-gray-900 mb-2 text-lg">Audit Information:</h3>
                    <p className="text-gray-900 font-medium text-lg">
                      Verified By: <span className="font-black">{lastLog?.verifier?.full_name || 'Unknown'}</span>
                    </p>
                    <p className="text-gray-900 font-medium text-lg">
                      Fabric Wastage: <span className="font-black">{lastLog?.wastage_pct ? lastLog.wastage_pct.toFixed(2) : '0.00'}%</span>
                    </p>
                    <p className="text-gray-900 font-medium text-lg">
                      Approved On: <span className="font-black">{new Date(lastLog?.timestamp).toLocaleString()}</span>
                    </p>
                  </div>

                  {/* Start Assembly Action */}
                  <button className="w-full bg-blue-700 hover:bg-blue-800 text-white font-black text-xl py-4 rounded border-2 border-blue-900 transition-all">
                    START SEWING ASSEMBLY
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
