'use client'

import { useState } from 'react'
import { submitVerificationAction } from '@/actions/verify.actions'

export default function VerificationTerminal({ order }: { order: any }) {
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [rejectionNote, setRejectionNote] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Calculate Real-time Traffic Light status
  const getStatus = (expected: number, actual: number | undefined) => {
    if (actual === undefined || isNaN(actual)) return 'UNCOUNTED'
    if (actual < expected) return 'RED'
    if (actual > expected) return 'YELLOW'
    return 'GREEN'
  }

  const itemsWithStatus = order.items.map((item: any) => ({
    ...item,
    actual: counts[item.component_id],
    status: getStatus(item.expected_qty, counts[item.component_id])
  }))

  const hasRed = itemsWithStatus.some((i: any) => i.status === 'RED')
  const hasUncounted = itemsWithStatus.some((i: any) => i.status === 'UNCOUNTED')
  const canApprove = !hasRed && !hasUncounted // Cannot approve if any item is RED or UNCOUNTED

  const handleAction = async (decision: 'APPROVED' | 'REJECTED') => {
    if (decision === 'REJECTED' && !rejectionNote.trim()) {
      setError("Rejection note is mandatory when rejecting a batch.")
      return
    }

    setIsSubmitting(true)
    setError('')

    const payload = itemsWithStatus.map((i: any) => ({
      componentId: i.component_id,
      actualQty: i.actual || 0
    }))

    const result = await submitVerificationAction(order.id, decision, payload, rejectionNote)
    
    if (!result.success) {
      setError(result.error || "An error occurred.")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border-2 border-gray-900">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-black text-black">Order: {order.order_no}</h2>
          <p className="text-gray-800 font-bold text-lg">{order.recipe.name} (Target: {order.target_qty} pcs)</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border-l-4 border-red-700 text-red-900 font-bold rounded">
          {error}
        </div>
      )}

      {/* Components List & Count Inputs */}
      <div className="space-y-4 mb-8">
        {itemsWithStatus.map((item: any) => (
          <div key={item.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 bg-gray-50 border-2 border-gray-800 rounded gap-4 md:gap-0">
            <div className="w-full md:w-1/3">
              <span className="font-bold text-gray-900 block text-lg">{item.component.component_name}</span>
              <span className="text-gray-700 font-semibold">Expected: {item.expected_qty}</span>
            </div>
            
            <div className="w-full md:w-1/3 flex justify-start md:justify-center">
              <input 
                type="number" 
                min="0"
                placeholder="Enter count"
                className="w-full md:w-32 p-2 border-2 border-gray-900 text-black font-bold text-center rounded focus:ring-4 focus:ring-blue-500"
                value={counts[item.component_id] === undefined || isNaN(counts[item.component_id]) ? '' : counts[item.component_id]}
                onChange={(e) => setCounts({...counts, [item.component_id]: parseInt(e.target.value)})}
              />
            </div>

            <div className="w-full md:w-1/3 flex justify-start md:justify-end">
              {item.status === 'GREEN' && <span className="bg-green-600 text-white px-4 py-2 rounded font-black text-lg border-2 border-green-900 w-full md:w-auto text-center">PASS (MATCH)</span>}
              {item.status === 'YELLOW' && <span className="bg-yellow-400 text-yellow-900 px-4 py-2 rounded font-black text-lg border-2 border-yellow-700 w-full md:w-auto text-center">YELLOW (EXCESS)</span>}
              {item.status === 'RED' && <span className="bg-red-600 text-white px-4 py-2 rounded font-black text-lg border-2 border-red-900 w-full md:w-auto text-center">RED (SHORTAGE)</span>}
              {item.status === 'UNCOUNTED' && <span className="bg-gray-300 text-gray-800 px-4 py-2 rounded font-bold border-2 border-gray-500 w-full md:w-auto text-center">PENDING</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons & Rejection Note */}
      <div className="border-t-4 border-gray-900 pt-6">
        <label className="block text-gray-900 font-bold mb-2">Rejection Note (Mandatory if Rejecting):</label>
        <textarea 
          className="w-full p-3 border-2 border-gray-900 rounded text-black font-medium focus:ring-4 focus:ring-blue-500 mb-4"
          rows={2}
          value={rejectionNote}
          onChange={(e) => setRejectionNote(e.target.value)}
          placeholder="Enter reason for rejection..."
        />
        
        <div className="flex flex-col md:flex-row gap-4">
          <button 
            onClick={() => handleAction('APPROVED')}
            disabled={!canApprove || isSubmitting}
            className="w-full md:w-1/2 bg-green-700 hover:bg-green-800 text-white font-black text-xl py-4 rounded border-2 border-green-900 disabled:bg-gray-400 disabled:border-gray-600 disabled:cursor-not-allowed transition-all"
          >
            APPROVE BATCH
          </button>
          
          <button 
            onClick={() => handleAction('REJECTED')}
            disabled={isSubmitting}
            className="w-full md:w-1/2 bg-red-700 hover:bg-red-800 text-white font-black text-xl py-4 rounded border-2 border-red-900 disabled:bg-gray-400 transition-all"
          >
            REJECT BATCH
          </button>
        </div>
      </div>
    </div>
  )
}
