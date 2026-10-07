import { getServerSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import OrderForm from './OrderForm'

export default async function SupervisorPage() {
  const session = await getServerSession()

  // Prevent access if the role is not cutting_supervisor
  if (!session || session.role !== 'cutting_supervisor') {
    return (
      <div className="p-8 text-center text-red-700 font-bold bg-red-100 rounded-lg mt-10 border-2 border-red-500">
        403 - Forbidden: You do not have permission to access the Cutting Supervisor panel.
      </div>
    )
  }

  // Fetch Recipes to display in the dropdown
  const recipes = await prisma.recipe.findMany()
  const orders = await prisma.cuttingOrder.findMany({
    orderBy: { created_at: 'desc' },
    include: { recipe: true }
  })

  return (
    <div className="grid md:grid-cols-2 gap-8 mt-8 p-8">
      {/* Left side: Create new Cutting Order form */}
      <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-300">
        <h2 className="text-2xl font-black text-gray-900 mb-6 border-b-2 border-gray-900 pb-2">
          Create Cutting Order
        </h2>
        <OrderForm recipes={recipes} />
      </div>

      {/* Right side: List of recently created Orders */}
      <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-300">
        <h2 className="text-2xl font-black text-gray-900 mb-6 border-b-2 border-gray-900 pb-2">
          Recent Orders
        </h2>
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="p-4 border-2 border-gray-800 rounded bg-gray-50 flex justify-between">
              <div>
                <p className="font-bold text-lg text-black">{order.order_no}</p>
                <p className="text-gray-800 font-medium">{order.recipe.name} - Qty: {order.target_qty}</p>
              </div>
              <span className={`px-3 py-1 font-bold text-sm rounded h-fit ${
                order.status === 'PENDING_VERIFICATION' ? 'bg-yellow-300 text-yellow-900 border border-yellow-800' : 'bg-green-600 text-white border border-green-900'
              }`}>
                {order.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
