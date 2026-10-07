// ApparelFlow ERP - Database Seed Script
// Seeds: 3 factory users (one per role) + 2 production recipes with components

import { PrismaClient, UserRole } from "@prisma/client";
import { createHash } from "crypto";

const prisma = new PrismaClient();

// Simple password hash (SHA-256) — for demo purposes
// In production, use bcrypt or argon2
function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

async function main() {
  console.log("🌱 Seeding ApparelFlow ERP database...\n");

  // =========================================
  // 1. SEED USERS (3 Roles)
  // =========================================
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: "supervisor@apparelflow.com" },
      update: {},
      create: {
        email: "supervisor@apparelflow.com",
        passwordHash: hashPassword("supervisor123"),
        role: UserRole.cutting_supervisor,
        fullName: "Nimal Perera",
      },
    }),
    prisma.user.upsert({
      where: { email: "verifier@apparelflow.com" },
      update: {},
      create: {
        email: "verifier@apparelflow.com",
        passwordHash: hashPassword("verifier123"),
        role: UserRole.cutting_verifier,
        fullName: "Kamani Silva",
      },
    }),
    prisma.user.upsert({
      where: { email: "sewing@apparelflow.com" },
      update: {},
      create: {
        email: "sewing@apparelflow.com",
        passwordHash: hashPassword("sewing123"),
        role: UserRole.sewing_supervisor,
        fullName: "Ruwan Fernando",
      },
    }),
  ]);

  console.log(`✅ Seeded ${users.length} users:`);
  users.forEach((u) =>
    console.log(`   • ${u.fullName} (${u.role}) — ${u.email}`)
  );

  // =========================================
  // 2. SEED RECIPE A: Casual Blouse (REC-BL01)
  // =========================================
  const blouse = await prisma.recipe.upsert({
    where: { recipeCode: "REC-BL01" },
    update: {},
    create: {
      recipeCode: "REC-BL01",
      name: "Casual Blouse",
      category: "Blouse",
      stdFabricYards: 1.8,
      wastageCap: 5.0,
      components: {
        create: [
          { componentName: "Front Body Panel", piecesPerGarment: 1 },
          { componentName: "Back Body Panel", piecesPerGarment: 1 },
          { componentName: "Sleeves (Left & Right)", piecesPerGarment: 2 },
          { componentName: "Collar & Stand", piecesPerGarment: 1 },
          { componentName: "Sleeve Cuffs", piecesPerGarment: 2 },
        ],
      },
    },
    include: { components: true },
  });

  console.log(
    `\n✅ Seeded Recipe: ${blouse.name} (${blouse.recipeCode}) — ${blouse.components.length} components`
  );
  blouse.components.forEach((c) =>
    console.log(`   • ${c.componentName}: ${c.piecesPerGarment} pcs/garment`)
  );

  // =========================================
  // 3. SEED RECIPE B: Crop Top (REC-CT02)
  // =========================================
  const cropTop = await prisma.recipe.upsert({
    where: { recipeCode: "REC-CT02" },
    update: {},
    create: {
      recipeCode: "REC-CT02",
      name: "Crop Top",
      category: "Crop Top",
      stdFabricYards: 1.1,
      wastageCap: 8.0,
      components: {
        create: [
          { componentName: "Front Chest Panel", piecesPerGarment: 1 },
          { componentName: "Back Support Panel", piecesPerGarment: 1 },
          { componentName: "Neck Binding Strip", piecesPerGarment: 1 },
          { componentName: "Hem Elastic Casing", piecesPerGarment: 1 },
          { componentName: "Side Strap Accents", piecesPerGarment: 2 },
        ],
      },
    },
    include: { components: true },
  });

  console.log(
    `\n✅ Seeded Recipe: ${cropTop.name} (${cropTop.recipeCode}) — ${cropTop.components.length} components`
  );
  cropTop.components.forEach((c) =>
    console.log(`   • ${c.componentName}: ${c.piecesPerGarment} pcs/garment`)
  );

  console.log("\n🎉 Database seeding complete!");
  console.log("\n📋 Demo Credentials:");
  console.log("   ┌─────────────────────────────────────────────────────────┐");
  console.log("   │ Role                │ Email                  │ Password │");
  console.log("   ├─────────────────────┼────────────────────────┼──────────┤");
  console.log("   │ Cutting Supervisor  │ supervisor@apparelflow │ super123 │");
  console.log("   │ Cutting Verifier    │ verifier@apparelflow   │ veri123  │");
  console.log("   │ Sewing Supervisor   │ sewing@apparelflow     │ sew123   │");
  console.log("   └─────────────────────────────────────────────────────────┘");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seed error:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
