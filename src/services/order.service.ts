import prisma from '@/lib/prisma'
import { CreateOrderSchema, CreateOrderInput } from '@/schemas/order.schema'

export async function createCuttingOrder(data: CreateOrderInput, userId: string) {
  // zod validation
  const validatedData = CreateOrderSchema.parse(data)

  // get recipe data from db 
  const recipe = await prisma.recipe.findUnique({
    where: { id: validatedData.recipe_id },
    include: { components: true }
  })

  if (!recipe) {
    throw new Error("Recipe not found")
  }

  // create order and verification items
  const result = await prisma.$transaction(async (tx) => {
    // create new order
    const order = await tx.cuttingOrder.create({
      data: {
        order_no: `ORD-${Date.now()}`, // order number
        recipe_id: recipe.id,
        target_qty: validatedData.target_qty,
        fabric_roll_id: validatedData.fabric_roll_id,
        actual_fabric_yds: validatedData.actual_fabric_yds,
        created_by: userId,
        status: 'PENDING_VERIFICATION' // Initial state
      }
    })

    // Multiplier Engine: Target Qty * pieces_per_garment
    const verificationItems = recipe.components.map(comp => ({
      order_id: order.id,
      component_id: comp.id,
      expected_qty: validatedData.target_qty * comp.pieces_per_garment,
      status: null // pending verification
    }))

    // 
    await tx.verificationItem.createMany({
      data: verificationItems
    })

    return order
  })

  return result
}
