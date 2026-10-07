'use server'

import { createCuttingOrder } from '@/services/order.service'
import { requireRole } from '@/lib/session'
import { revalidatePath } from 'next/cache'

export async function submitOrderAction(prevState: any, formData: FormData) {
  try {
    // RBAC Check
    const session = await requireRole(['cutting_supervisor'])

    // get data from form data
    const data = {
      recipe_id: formData.get('recipe_id') as string,
      target_qty: Number(formData.get('target_qty')),
      fabric_roll_id: formData.get('fabric_roll_id') as string,
      actual_fabric_yds: Number(formData.get('actual_fabric_yds')),
    }

    // create order
    await createCuttingOrder(data, session.userId)

    // refresh UI
    revalidatePath('/supervisor')
    return { success: true, message: "Order created successfully!", error: '' }
  } catch (error: any) {
    if (error.message === '403_FORBIDDEN') {
      return { success: false, message: '', error: "Access Denied: Only Cutting Supervisors can create orders." }
    }
    return { success: false, message: '', error: error.message || "Failed to create order. Check your inputs." }
  }
}
