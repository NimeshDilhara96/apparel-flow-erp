import prisma from '@/lib/prisma'
import { determineTrafficLight, calculateWastage } from '@/lib/calculations'

export async function processVerification(
  orderId: string,
  verifierId: string,
  decision: 'APPROVED' | 'REJECTED',
  itemsData: { componentId: string, actualQty: number }[],
  rejectionNote?: string
) {
  // 1. Fetch Order and Recipe data from DB
  const order = await prisma.cuttingOrder.findUnique({
    where: { id: orderId },
    include: { items: true, recipe: true }
  });

  if (!order) throw new Error("Order not found");
  if (order.status !== 'PENDING_VERIFICATION') throw new Error("Order is not pending verification");

  let hasRed = false;
  
  // 2. Traffic Light Logic - Determine GREEN, YELLOW, RED
  const updatedItems = itemsData.map(input => {
    const expected = order.items.find(i => i.component_id === input.componentId)?.expected_qty || 0;
    
    // Use the pure function for business logic
    const status = determineTrafficLight(expected, input.actualQty);
    if (status === 'RED') hasRed = true;

    return { ...input, expected, status };
  });

  // 3. SERVER-SIDE HARD STOP ENFORCEMENT
  if (decision === 'APPROVED' && hasRed) {
    throw new Error("422_UNPROCESSABLE_ENTITY"); 
  }

  // Rejection note is mandatory if rejected
  if (decision === 'REJECTED' && (!rejectionNote || rejectionNote.trim() === '')) {
    throw new Error("Rejection note is mandatory");
  }

  // 4. Calculate Wastage % (only if approved)
  let wastagePct = null;
  if (decision === 'APPROVED') {
    wastagePct = calculateWastage(order.actual_fabric_yds, order.recipe.std_fabric_yards, order.target_qty);
  }

  // 5. Update data via Database Transaction (Immutable Audit Trail)
  return await prisma.$transaction(async (tx) => {
    // Update status and actual_qty for Items
    for (const item of updatedItems) {
      await tx.verificationItem.updateMany({
        where: { order_id: orderId, component_id: item.componentId },
        data: { actual_qty: item.actualQty, status: item.status }
      });
    }

    // Change Order status
    const nextStatus = decision === 'APPROVED' ? 'VERIFIED' : 'REJECTED';
    await tx.cuttingOrder.update({
      where: { id: orderId },
      data: { status: nextStatus }
    });

    // Write Verification Log (Audit Trail)
    await tx.verificationLog.create({
      data: {
        order_id: orderId,
        verifier_id: verifierId,
        decision: decision,
        rejection_note: decision === 'REJECTED' ? rejectionNote : null,
        wastage_pct: wastagePct
      }
    });

    return { success: true };
  });
}
