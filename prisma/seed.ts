import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. For Testing Create 3 user
  await prisma.user.createMany({
    data: [
      { email: 'supervisor@webtezza.com', password_hash: 'hashed_pw', role: Role.cutting_supervisor, full_name: 'John Supervisor' },
      { email: 'verifier@webtezza.com', password_hash: 'hashed_pw', role: Role.cutting_verifier, full_name: 'Jane Verifier' },
      { email: 'sewing@webtezza.com', password_hash: 'hashed_pw', role: Role.sewing_supervisor, full_name: 'Mike Sewing' },
    ],
    skipDuplicates: true,
  });

  // 2. Recipe A: "Casual Blouse" (Code: REC-BL01) Create
  const recipeA = await prisma.recipe.upsert({
    where: { recipe_code: 'REC-BL01' },
    update: {},
    create: {
      recipe_code: 'REC-BL01',
      name: 'Casual Blouse',
      category: 'Blouse',
      std_fabric_yards: 1.8,
      wastage_cap: 5.0,
      components: {
        create: [
          { component_name: 'Front Body Panel', pieces_per_garment: 1 },
          { component_name: 'Back Body Panel', pieces_per_garment: 1 },
          { component_name: 'Sleeves (Left & Right)', pieces_per_garment: 2 },
          { component_name: 'Collar & Stand', pieces_per_garment: 1 },
          { component_name: 'Sleeve Cuffs', pieces_per_garment: 2 },
        ],
      },
    },
  });

  // 3. Recipe B: "Crop Top" (Code: REC-CT02) Create
  const recipeB = await prisma.recipe.upsert({
    where: { recipe_code: 'REC-CT02' },
    update: {},
    create: {
      recipe_code: 'REC-CT02',
      name: 'Crop Top',
      category: 'Crop Top',
      std_fabric_yards: 1.1,
      wastage_cap: 8.0,
      components: {
        create: [
          { component_name: 'Front Chest Panel', pieces_per_garment: 1 },
          { component_name: 'Back Support Panel', pieces_per_garment: 1 },
          { component_name: 'Neck Binding Strip', pieces_per_garment: 1 },
          { component_name: 'Hem Elastic Casing', pieces_per_garment: 1 },
          { component_name: 'Side Strap Accents', pieces_per_garment: 2 },
        ],
      },
    },
  });

  console.log('✅ Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
