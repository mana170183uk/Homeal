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

  const approvedAt = new Date();
  const trialEndsAt = new Date(approvedAt);
  trialEndsAt.setMonth(trialEndsAt.getMonth() + 3);

  const chef = await prisma.chef.upsert({
    where: { userId: chefUser.id },
    update: {
      isVerified: true,
      approvedAt,
      trialEndsAt,
      plan: "UNLIMITED",
    },
    create: {
      userId: chefUser.id,
      kitchenName: "Priya's Home Kitchen",
      description: "Authentic South Indian home-cooked meals made with love. Specialising in dosa, idli, sambar, and traditional thalis.",
      cuisineTypes: JSON.stringify(["South Indian", "North Indian", "Snacks"]),
      deliveryRadius: 10.0,
      isVerified: true,
      isOnline: true,
      approvedAt,
      trialEndsAt,
      plan: "UNLIMITED",
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
  console.log(`Chef Admin: ${chefUser.email} (Kitchen: ${chef.kitchenName}, Approved, Trial ends: ${trialEndsAt.toISOString().slice(0, 10)})`);

  // 4. Pending Chef (awaiting approval)
  const pendingChefUser = await prisma.user.upsert({
    where: { email: "pending-chef@homeal.co.uk" },
    update: {},
    create: {
      name: "Ravi Kumar",
      email: "pending-chef@homeal.co.uk",
      phone: "+447700100004",
      role: "CHEF",
      firebaseUid: "test-pending-chef-uid-001",
      isActive: true,
    },
  });

  await prisma.chef.upsert({
    where: { userId: pendingChefUser.id },
    update: {},
    create: {
      userId: pendingChefUser.id,
      kitchenName: "Ravi's Curry House",
      description: "North Indian curries and tandoori specialties",
      cuisineTypes: JSON.stringify(["North Indian", "Tandoori"]),
      isVerified: false,
    },
  });
  console.log(`Pending Chef: ${pendingChefUser.email} (Awaiting approval)`);

  // ==================== ADDITIONAL TEST CHEFS ====================

  const testChefs = [
    {
      userEmail: "chef-watford@homeal.co.uk",
      userName: "Anita's Kitchen",
      phone: "+447700100010",
      firebaseUid: "test-chef-watford-001",
      kitchenName: "Anita's Home Kitchen",
      description: "Authentic Gujarati home-cooked meals. Fresh dhokla, thepla, undhiyu and more — just like maa makes!",
      cuisineTypes: JSON.stringify(["Gujarati", "Snacks", "Thali"]),
      latitude: 51.6565,
      longitude: -0.3903,
      menuName: "Gujarati Thali Special",
      items: [
        { name: "Gujarati Thali", description: "Dal, sabji, rotli, rice, papad, pickle & sweet", price: 7.99, isVeg: true, calories: 580, prepTime: 20 },
        { name: "Dhokla", description: "Steamed fermented gram flour cake with tempering", price: 3.49, isVeg: true, calories: 160, prepTime: 10 },
        { name: "Pav Bhaji", description: "Spiced mixed veg mash with buttered pav buns", price: 5.49, isVeg: true, calories: 420, prepTime: 15 },
      ],
    },
    {
      userEmail: "chef-harrow@homeal.co.uk",
      userName: "Mama Chen's Wok",
      phone: "+447700100011",
      firebaseUid: "test-chef-harrow-001",
      kitchenName: "Mama Chen's Wok",
      description: "Home-style Chinese and Indo-Chinese street food. Hakka noodles, manchurian, and dim sum made fresh daily.",
      cuisineTypes: JSON.stringify(["Chinese", "Indo-Chinese", "Street Food"]),
      latitude: 51.5836,
      longitude: -0.3340,
      menuName: "Wok Specials",
      items: [
        { name: "Hakka Noodles", description: "Stir-fried egg noodles with vegetables and soy", price: 6.49, isVeg: false, calories: 380, prepTime: 15 },
        { name: "Veg Manchurian", description: "Crispy veg balls in spicy indo-chinese gravy", price: 5.99, isVeg: true, calories: 340, prepTime: 20 },
        { name: "Chicken Fried Rice", description: "Wok-tossed rice with chicken and egg", price: 7.49, isVeg: false, calories: 450, prepTime: 15 },
        { name: "Spring Rolls (6 pcs)", description: "Crispy rolls stuffed with vegetables", price: 4.49, isVeg: true, calories: 280, prepTime: 12 },
      ],
    },
    {
      userEmail: "chef-ealing@homeal.co.uk",
      userName: "Nana's Caribbean",
      phone: "+447700100012",
      firebaseUid: "test-chef-ealing-001",
      kitchenName: "Nana's Caribbean Kitchen",
      description: "Authentic Caribbean flavours from the islands. Jerk chicken, rice & peas, plantain and curry goat.",
      cuisineTypes: JSON.stringify(["Caribbean", "Jamaican", "West Indian"]),
      latitude: 51.5130,
      longitude: -0.3089,
      menuName: "Island Flavours",
      items: [
        { name: "Jerk Chicken", description: "Grilled spiced chicken with rice & peas", price: 8.99, isVeg: false, calories: 520, prepTime: 25 },
        { name: "Curry Goat", description: "Slow-cooked goat in Caribbean spices with rice", price: 9.99, isVeg: false, calories: 580, prepTime: 30 },
        { name: "Ackee & Saltfish", description: "Traditional Jamaican breakfast served with fried dumpling", price: 7.49, isVeg: false, calories: 440, prepTime: 20 },
      ],
    },
    {
      userEmail: "chef-birmingham@homeal.co.uk",
      userName: "Fatima's Biryani",
      phone: "+447700100013",
      firebaseUid: "test-chef-birmingham-001",
      kitchenName: "Fatima's Biryani House",
      description: "Famous Lucknowi biryani and kebabs, slow-cooked to perfection. Halal certified.",
      cuisineTypes: JSON.stringify(["Mughlai", "Biryani", "Kebabs"]),
      latitude: 52.4862,
      longitude: -1.8904,
      menuName: "Biryani & Kebab Feast",
      items: [
        { name: "Lucknowi Biryani", description: "Fragrant dum biryani with tender lamb", price: 10.99, isVeg: false, calories: 620, prepTime: 35 },
        { name: "Seekh Kebab (4 pcs)", description: "Chargrilled spiced lamb mince kebabs", price: 6.99, isVeg: false, calories: 380, prepTime: 15 },
        { name: "Paneer Biryani", description: "Vegetarian biryani with paneer and saffron", price: 8.49, isVeg: true, calories: 520, prepTime: 30 },
        { name: "Gulab Jamun (4 pcs)", description: "Soft milk dumplings in rose syrup", price: 3.99, isVeg: true, calories: 320, prepTime: 5 },
      ],
    },
    {
      userEmail: "chef-manchester@homeal.co.uk",
      userName: "Auntie Meera",
      phone: "+447700100014",
      firebaseUid: "test-chef-manchester-001",
      kitchenName: "Auntie Meera's Kitchen",
      description: "Homestyle South Asian comfort food. Butter chicken, dal makhani and naan — just like your mum's cooking.",
      cuisineTypes: JSON.stringify(["North Indian", "Punjabi", "Comfort Food"]),
      latitude: 53.4808,
      longitude: -2.2426,
      menuName: "Comfort Food Menu",
      items: [
        { name: "Butter Chicken", description: "Creamy tomato-based chicken curry", price: 8.49, isVeg: false, calories: 480, prepTime: 20 },
        { name: "Dal Makhani", description: "Slow-cooked black lentils in butter and cream", price: 5.99, isVeg: true, calories: 350, prepTime: 25 },
        { name: "Garlic Naan (2 pcs)", description: "Fresh tandoor-baked garlic naan", price: 2.99, isVeg: true, calories: 260, prepTime: 8 },
      ],
    },
  ];

  for (const tc of testChefs) {
    const tcUser = await prisma.user.upsert({
      where: { email: tc.userEmail },
      update: {},
      create: {
        name: tc.userName,
        email: tc.userEmail,
        phone: tc.phone,
        role: "CHEF",
        firebaseUid: tc.firebaseUid,
        isActive: true,
      },
    });

    const tcChef = await prisma.chef.upsert({
      where: { userId: tcUser.id },
      update: { isVerified: true, isOnline: true, latitude: tc.latitude, longitude: tc.longitude },
      create: {
        userId: tcUser.id,
        kitchenName: tc.kitchenName,
        description: tc.description,
        cuisineTypes: tc.cuisineTypes,
        deliveryRadius: 10.0,
        isVerified: true,
        isOnline: true,
        approvedAt,
        trialEndsAt,
        plan: "UNLIMITED",
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
        latitude: tc.latitude,
        longitude: tc.longitude,
      },
    });

    const tcMenuId = `test-menu-${tc.userEmail.split("@")[0]}`;
    const tcMenu = await prisma.menu.upsert({
      where: { id: tcMenuId },
      update: {},
      create: {
        id: tcMenuId,
        chefId: tcChef.id,
        name: tc.menuName,
        date: today,
        isActive: true,
      },
    });

    for (const item of tc.items) {
      const itemId = `test-item-${tc.userEmail.split("@")[0]}-${item.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
      await prisma.menuItem.upsert({
        where: { id: itemId },
        update: {},
        create: {
          id: itemId,
          menuId: tcMenu.id,
          categoryId: southIndianCat?.id,
          ...item,
        },
      });
    }

    console.log(`  Test Chef: ${tc.kitchenName} (${tc.userEmail}) at [${tc.latitude}, ${tc.longitude}]`);
  }
  console.log(`Created ${testChefs.length} additional test chefs with menus`);

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
  console.log("  CHEF ADMIN - APPROVED (Chef Admin Panel)");
  console.log("  Email: chef@homeal.co.uk");
  console.log("  Firebase UID: test-chef-uid-001");
  console.log("  Kitchen: Priya's Home Kitchen");
  console.log("  Status: Approved, Unlimited Plan (3-month trial)");
  console.log("");
  console.log("  CHEF ADMIN - PENDING (Awaiting Approval)");
  console.log("  Email: pending-chef@homeal.co.uk");
  console.log("  Firebase UID: test-pending-chef-uid-001");
  console.log("  Kitchen: Ravi's Curry House");
  console.log("  Status: Pending approval");
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
