import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Homeal database...\n");

  // ==================== TEST USERS ====================

  // 1. Super Admin
  const superAdmin = await prisma.user.upsert({
    where: { email: "superadmin@homeal.co.uk" },
    update: {},
    create: {
      name: "Homeal Super Admin",
      email: "superadmin@homeal.co.uk",
      phone: "+447700100001",
      role: "SUPER_ADMIN",
      firebaseUid: "test-superadmin-uid-001",
      isActive: true,
    },
  });
  console.log(`Super Admin: ${superAdmin.email} (ID: ${superAdmin.id})`);

  // 2. Chef Admin (with kitchen)
  const chefUser = await prisma.user.upsert({
    where: { email: "chef@homeal.co.uk" },
    update: {},
    create: {
      name: "Priya's Kitchen",
      email: "chef@homeal.co.uk",
      phone: "+447700100002",
      role: "CHEF",
      firebaseUid: "test-chef-uid-001",
      isActive: true,
    },
  });

  const chef = await prisma.chef.upsert({
    where: { userId: chefUser.id },
    update: {},
    create: {
      userId: chefUser.id,
      kitchenName: "Priya's Home Kitchen",
      description: "Authentic South Indian home-cooked meals made with love. Specialising in dosa, idli, sambar, and traditional thalis.",
      cuisineTypes: JSON.stringify(["South Indian", "North Indian", "Snacks"]),
      deliveryRadius: 10.0,
      isVerified: true,
      isOnline: true,
      operatingHours: JSON.stringify({
        mon: { open: "08:00", close: "21:00" },
        tue: { open: "08:00", close: "21:00" },
        wed: { open: "08:00", close: "21:00" },
        thu: { open: "08:00", close: "21:00" },
        fri: { open: "08:00", close: "21:00" },
        sat: { open: "09:00", close: "22:00" },
        sun: { open: "09:00", close: "20:00" },
      }),
      commissionRate: 15.0,
      latitude: 51.5074,
      longitude: -0.1278,
    },
  });
  console.log(`Chef Admin: ${chefUser.email} (Kitchen: ${chef.kitchenName})`);

  // 3. End User / Customer
  const customer = await prisma.user.upsert({
    where: { email: "customer@homeal.co.uk" },
    update: {},
    create: {
      name: "Test Customer",
      email: "customer@homeal.co.uk",
      phone: "+447700100003",
      role: "CUSTOMER",
      firebaseUid: "test-customer-uid-001",
      isActive: true,
      dietaryPrefs: JSON.stringify(["Vegetarian"]),
    },
  });

  // Add a default address for the customer
  await prisma.address.upsert({
    where: { id: "test-address-001" },
    update: {},
    create: {
      id: "test-address-001",
      userId: customer.id,
      label: "Home",
      line1: "42 Baker Street",
      city: "London",
      state: "Greater London",
      zipCode: "NW1 6XE",
      latitude: 51.5237,
      longitude: -0.1585,
      isDefault: true,
    },
  });
  console.log(`Customer: ${customer.email} (ID: ${customer.id})`);

  // ==================== CATEGORIES ====================

  const categories = [
    { name: "South Indian", icon: "🍛", sortOrder: 1 },
    { name: "North Indian", icon: "🫓", sortOrder: 2 },
    { name: "Chinese", icon: "🥡", sortOrder: 3 },
    { name: "Snacks & Starters", icon: "🍿", sortOrder: 4 },
    { name: "Breads", icon: "🫓", sortOrder: 5 },
    { name: "Rice & Biryani", icon: "🍚", sortOrder: 6 },
    { name: "Desserts", icon: "🍮", sortOrder: 7 },
    { name: "Beverages", icon: "🥤", sortOrder: 8 },
    { name: "Thali", icon: "🍽️", sortOrder: 9 },
    { name: "Pickles & Chutneys", icon: "🫙", sortOrder: 10 },
    { name: "Sweets", icon: "🍬", sortOrder: 11 },
    { name: "Cakes & Bakery", icon: "🎂", sortOrder: 12 },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: { icon: cat.icon, sortOrder: cat.sortOrder },
      create: cat,
    });
  }
  console.log(`\nCreated ${categories.length} food categories`);

  // ==================== SAMPLE MENU ====================

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const menu = await prisma.menu.upsert({
    where: { id: "test-menu-001" },
    update: {},
    create: {
      id: "test-menu-001",
      chefId: chef.id,
      name: "Today's Special Thali",
      date: today,
      isActive: true,
    },
  });

  const southIndianCat = await prisma.category.findUnique({ where: { name: "South Indian" } });

  const menuItems = [
    { name: "Masala Dosa", description: "Crispy dosa with potato masala, served with sambar & coconut chutney", price: 5.99, isVeg: true, calories: 320, prepTime: 15 },
    { name: "Idli Sambar", description: "Soft steamed idli (4 pcs) with sambar and chutneys", price: 4.49, isVeg: true, calories: 240, prepTime: 10 },
    { name: "South Indian Thali", description: "Full meal with rice, sambar, rasam, 2 sabji, curd, papad & dessert", price: 8.99, isVeg: true, calories: 650, prepTime: 25 },
    { name: "Chicken Biryani", description: "Hyderabadi-style dum biryani with raita", price: 9.99, isVeg: false, calories: 550, prepTime: 30 },
    { name: "Mango Lassi", description: "Fresh mango blended with yogurt", price: 2.99, isVeg: true, calories: 180, prepTime: 5 },
  ];

  for (const item of menuItems) {
    await prisma.menuItem.upsert({
      where: { id: `test-item-${item.name.toLowerCase().replace(/\s/g, "-")}` },
      update: {},
      create: {
        id: `test-item-${item.name.toLowerCase().replace(/\s/g, "-")}`,
        menuId: menu.id,
        categoryId: southIndianCat?.id,
        ...item,
      },
    });
  }
  console.log(`Created ${menuItems.length} sample menu items`);

  // ==================== CHEF SERVICE ====================

  await prisma.service.upsert({
    where: { id: "test-service-001" },
    update: {},
    create: {
      id: "test-service-001",
      chefId: chef.id,
      type: "INDIVIDUAL_TIFFIN",
      name: "Daily Tiffin Service",
      description: "Home-cooked meals delivered fresh to your door",
      basePrice: 6.99,
      minOrder: 1,
      isActive: true,
    },
  });
  console.log("Created sample tiffin service");

  // ==================== SUMMARY ====================

  console.log("\n========================================");
  console.log("  HOMEAL TEST ACCOUNTS");
  console.log("========================================");
  console.log("");
  console.log("  SUPER ADMIN (Super Admin Panel)");
  console.log("  Email: superadmin@homeal.co.uk");
  console.log("  Firebase UID: test-superadmin-uid-001");
  console.log("");
  console.log("  CHEF ADMIN (Chef Admin Panel)");
  console.log("  Email: chef@homeal.co.uk");
  console.log("  Firebase UID: test-chef-uid-001");
  console.log("  Kitchen: Priya's Home Kitchen");
  console.log("");
  console.log("  CUSTOMER (Mobile App / End User)");
  console.log("  Email: customer@homeal.co.uk");
  console.log("  Firebase UID: test-customer-uid-001");
  console.log("  Address: 42 Baker Street, London NW1 6XE");
  console.log("");
  console.log("========================================");
  console.log("  Test login endpoint:");
  console.log("  POST /api/v1/auth/test-login");
  console.log("  Body: { \"email\": \"chef@homeal.co.uk\" }");
  console.log("========================================\n");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
