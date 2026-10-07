'use server'

import { processVerification } from '@/services/verify.service'
import { requireRole } from '@/lib/session'
import { revalidatePath } from 'next/cache'

export async function submitVerificationAction(
  orderId: string, 
  decision: 'APPROVED' | 'REJECTED', 
  itemsData: { componentId: string, actualQty: number }[], 
  rejectionNote?: string
) {
  try {
    // 1. Role Verification: Only 'cutting_verifier' is allowed
    const session = await requireRole(['cutting_verifier'])

    // 2. Execute Business Logic
    await processVerification(orderId, session.userId, decision, itemsData, rejectionNote)

    // Refresh UI
    revalidatePath('/verifier')
    return { success: true }
    
  } catch (error: any) {
    if (error.message === '403_FORBIDDEN') {
      return { success: false, error: "Access Denied: Only Cutting Verifiers can perform this action." }
    }
    if (error.message === '422_UNPROCESSABLE_ENTITY') {
      return { success: false, error: "SERVER SECURITY HARD-STOP: Cannot approve batch with missing components (RED)." }
    }
    return { success: false, error: error.message || "An error occurred during verification." }
  }
}
