import { z } from 'zod'

export const CreateOrderSchema = z.object({
  recipe_id: z.string().min(1, "Recipe ID is required"),
  target_qty: z.number().int().positive("Target quantity must be a positive integer"),
  fabric_roll_id: z.string().min(1, "Fabric Roll ID is required"),
  actual_fabric_yds: z.number().positive("Actual fabric yards must be a positive number"),
})

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>
