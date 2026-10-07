import prisma from '@/lib/prisma'
import { CreateOrderSchema, CreateOrderInput } from '@/schemas/order.schema'

export async function createCuttingOrder(data: CreateOrderInput, userId: string) {
  // 1. Zod හරහා දත්ත වල නිරවද්‍යතාවය (Validation) පරීක්ෂා කිරීම
  const validatedData = CreateOrderSchema.parse(data)

  // 2. අදාළ Recipe එක සහ එහි Components DB එකෙන් ලබාගැනීම
  const recipe = await prisma.recipe.findUnique({
    where: { id: validatedData.recipe_id },
    include: { components: true }
  })

  if (!recipe) {
    throw new Error("Recipe not found")
  }

  // 3. Database Transaction එකක් හරහා Order එක සහ Verification Items එකවර නිර්මාණය කිරීම
  const result = await prisma.$transaction(async (tx) => {
    // අලුත් Order එක සෑදීම
    const order = await tx.cuttingOrder.create({
      data: {
        order_no: `ORD-${Date.now()}`, // සරල අංකයක්
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
      status: null // තවම ගණන් කර නැත
    }))

    // ගණනය කළ අගයන් Verification Items වගුවට ඇතුළත් කිරීම
    await tx.verificationItem.createMany({
      data: verificationItems
    })

    return order
  })

  return result
}
