'use client'

import { useRef, useEffect, useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { submitOrderAction } from '@/actions/order.actions'

const initialState = { success: false, error: '', message: '' }

// A separate component to show the loading state when the button is pressed
function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-blue-700 hover:bg-blue-800 text-white font-black text-lg py-3 px-4 rounded border-2 border-blue-900 focus:outline-none focus:ring-4 focus:ring-blue-400 disabled:bg-gray-500 disabled:border-gray-600 transition-all mt-4"
    >
      {pending ? 'Processing Order...' : 'Create Production Batch'}
    </button>
  )
}

export default function OrderForm({ recipes }: { recipes: any[] }) {
  const [state, formAction, isPending] = useActionState(submitOrderAction, initialState)
  const formRef = useRef<HTMLFormElement>(null)

  // Reset the form when the action is successful
  useEffect(() => {
    if (state.success && formRef.current) {
      formRef.current.reset()
    }
  }, [state.success])

  return (
    <form ref={formRef} action={formAction} className="space-y-5">
      
      {/* Display error or success messages */}
      {state.error && (
        <div className="p-3 bg-red-100 border-l-4 border-red-700 text-red-900 font-bold rounded">
          {state.error}
        </div>
      )}
      {state.success && (
        <div className="p-3 bg-green-100 border-l-4 border-green-700 text-green-900 font-bold rounded">
          {state.message}
        </div>
      )}

      {/* Recipe Dropdown */}
      <div>
        <label htmlFor="recipe_id" className="block text-gray-900 font-bold mb-1">Select Recipe</label>
        <select 
          id="recipe_id" 
          name="recipe_id" 
          required
          className="w-full p-3 bg-white text-black border-2 border-gray-900 rounded focus:border-blue-700 focus:ring-2 focus:ring-blue-700 font-medium"
        >
          <option value="">-- Choose a Recipe --</option>
          {recipes.map(r => (
            <option key={r.id} value={r.id}>{r.name} ({r.recipe_code})</option>
          ))}
        </select>
      </div>

      {/* Target Quantity */}
      <div>
        <label htmlFor="target_qty" className="block text-gray-900 font-bold mb-1">Target Quantity (Garments)</label>
        <input 
          type="number" 
          id="target_qty" 
          name="target_qty" 
          min="1" 
          step="1"
          required
          placeholder="e.g., 50"
          className="w-full p-3 bg-white text-black border-2 border-gray-900 rounded focus:border-blue-700 focus:ring-2 focus:ring-blue-700 font-medium placeholder-gray-500"
        />
      </div>

      {/* Fabric Roll ID */}
      <div>
        <label htmlFor="fabric_roll_id" className="block text-gray-900 font-bold mb-1">Fabric Roll ID</label>
        <input 
          type="text" 
          id="fabric_roll_id" 
          name="fabric_roll_id" 
          required
          placeholder="e.g., FAB-ROLL-882"
          className="w-full p-3 bg-white text-black border-2 border-gray-900 rounded focus:border-blue-700 focus:ring-2 focus:ring-blue-700 font-medium placeholder-gray-500"
        />
      </div>

      {/* Actual Fabric Used */}
      <div>
        <label htmlFor="actual_fabric_yds" className="block text-gray-900 font-bold mb-1">Actual Fabric Used (Yards)</label>
        <input 
          type="number" 
          id="actual_fabric_yds" 
          name="actual_fabric_yds" 
          min="0.1"
          step="0.01"
          required
          placeholder="e.g., 90.5"
          className="w-full p-3 bg-white text-black border-2 border-gray-900 rounded focus:border-blue-700 focus:ring-2 focus:ring-blue-700 font-medium placeholder-gray-500"
        />
      </div>

      <SubmitButton />
    </form>
  )
}
