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
      bannerImage: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&q=80&fit=crop",
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
      dailyOrderCap: 25,
      orderCutoffTime: "14:00",
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
      bannerImage: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80&fit=crop",
      isVerified: false,
    },
  });
  console.log(`Pending Chef: ${pendingChefUser.email} (Awaiting approval)`);

  // ==================== ADDITIONAL TEST CHEFS (UK-wide) ====================

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Category name → ID lookup (seeded later, so we reference by name and resolve after seeding categories)
  const categoryMap: Record<string, string> = {};

  const testChefs = [
    // --- LONDON ---
    {
      userEmail: "chef-watford@homeal.co.uk",
      userName: "Anita's Kitchen",
      phone: "+447700100010",
      firebaseUid: "test-chef-watford-001",
      kitchenName: "Anita's Home Kitchen",
      description: "Authentic Gujarati home-cooked meals. Fresh dhokla, thepla, undhiyu and more — just like maa makes!",
      cuisineTypes: JSON.stringify(["Gujarati", "Snacks", "Thali"]),
      bannerImage: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80&fit=crop",
      latitude: 51.6565,
      longitude: -0.3903,
      menuName: "Gujarati Thali Special",
      items: [
        { name: "Gujarati Thali", description: "Dal, sabji, rotli, rice, papad, pickle & sweet", price: 7.99, isVeg: true, calories: 580, prepTime: 20, category: "Thali", image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&q=80&fit=crop" },
        { name: "Dhokla", description: "Steamed fermented gram flour cake with tempering", price: 3.49, isVeg: true, calories: 160, prepTime: 10, category: "Snacks & Starters", image: "https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?w=600&q=80&fit=crop" },
        { name: "Pav Bhaji", description: "Spiced mixed veg mash with buttered pav buns", price: 5.49, isVeg: true, calories: 420, prepTime: 15, category: "Snacks & Starters", image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&q=80&fit=crop" },
        { name: "Mango Pickle (250g jar)", description: "Traditional homemade aam ka achaar — tangy & spicy", price: 3.99, isVeg: true, calories: 40, prepTime: 0, category: "Pickles & Chutneys", image: "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=600&q=80&fit=crop" },
        { name: "Coconut Barfi (6 pcs)", description: "Fresh coconut and condensed milk fudge", price: 4.49, isVeg: true, calories: 220, prepTime: 5, category: "Sweets", image: "https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=600&q=80&fit=crop" },
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
      bannerImage: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1200&q=80&fit=crop",
      latitude: 51.5836,
      longitude: -0.3340,
      menuName: "Wok Specials",
      items: [
        { name: "Hakka Noodles", description: "Stir-fried egg noodles with vegetables and soy", price: 6.49, isVeg: false, calories: 380, prepTime: 15, category: "Chinese", image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&q=80&fit=crop" },
        { name: "Veg Manchurian", description: "Crispy veg balls in spicy indo-chinese gravy", price: 5.99, isVeg: true, calories: 340, prepTime: 20, category: "Chinese", image: "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=600&q=80&fit=crop" },
        { name: "Chicken Fried Rice", description: "Wok-tossed rice with chicken and egg", price: 7.49, isVeg: false, calories: 450, prepTime: 15, category: "Rice & Biryani", image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&q=80&fit=crop" },
        { name: "Spring Rolls (6 pcs)", description: "Crispy rolls stuffed with vegetables", price: 4.49, isVeg: true, calories: 280, prepTime: 12, category: "Snacks & Starters", image: "https://images.unsplash.com/photo-1515669097368-22e68427d265?w=600&q=80&fit=crop" },
        { name: "Chilli Garlic Sauce (200ml)", description: "Homemade hot sauce — perfect with momos & noodles", price: 2.99, isVeg: true, calories: 15, prepTime: 0, category: "Pickles & Chutneys", image: "https://images.unsplash.com/photo-1472476443507-c7a5948772fc?w=600&q=80&fit=crop" },
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
      bannerImage: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200&q=80&fit=crop",
      latitude: 51.5130,
      longitude: -0.3089,
      menuName: "Island Flavours",
      items: [
        { name: "Jerk Chicken", description: "Grilled spiced chicken with rice & peas", price: 8.99, isVeg: false, calories: 520, prepTime: 25, category: "North Indian", image: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=600&q=80&fit=crop" },
        { name: "Curry Goat", description: "Slow-cooked goat in Caribbean spices with rice", price: 9.99, isVeg: false, calories: 580, prepTime: 30, category: "North Indian", image: "https://images.unsplash.com/photo-1574484284002-952d92456975?w=600&q=80&fit=crop" },
        { name: "Ackee & Saltfish", description: "Traditional Jamaican breakfast served with fried dumpling", price: 7.49, isVeg: false, calories: 440, prepTime: 20, category: "Snacks & Starters", image: "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=600&q=80&fit=crop" },
        { name: "Rum Cake", description: "Rich moist cake soaked in dark rum — Caribbean classic", price: 6.99, isVeg: true, calories: 380, prepTime: 5, category: "Cakes & Bakery", image: "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=600&q=80&fit=crop", eggOption: "both" },
      ],
    },
    // --- BIRMINGHAM ---
    {
      userEmail: "chef-birmingham@homeal.co.uk",
      userName: "Fatima's Biryani",
      phone: "+447700100013",
      firebaseUid: "test-chef-birmingham-001",
      kitchenName: "Fatima's Biryani House",
      description: "Famous Lucknowi biryani and kebabs, slow-cooked to perfection. Halal certified.",
      cuisineTypes: JSON.stringify(["Mughlai", "Biryani", "Kebabs"]),
      bannerImage: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80&fit=crop",
      latitude: 52.4862,
      longitude: -1.8904,
      menuName: "Biryani & Kebab Feast",
      items: [
        { name: "Lucknowi Biryani", description: "Fragrant dum biryani with tender lamb", price: 10.99, isVeg: false, calories: 620, prepTime: 35, category: "Rice & Biryani", image: "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?w=600&q=80&fit=crop" },
        { name: "Seekh Kebab (4 pcs)", description: "Chargrilled spiced lamb mince kebabs", price: 6.99, isVeg: false, calories: 380, prepTime: 15, category: "Snacks & Starters", image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=600&q=80&fit=crop" },
        { name: "Paneer Biryani", description: "Vegetarian biryani with paneer and saffron", price: 8.49, isVeg: true, calories: 520, prepTime: 30, category: "Rice & Biryani", image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=600&q=80&fit=crop" },
        { name: "Gulab Jamun (4 pcs)", description: "Soft milk dumplings in rose syrup", price: 3.99, isVeg: true, calories: 320, prepTime: 5, category: "Sweets", image: "https://images.unsplash.com/photo-1567337710282-00832b415979?w=600&q=80&fit=crop" },
        { name: "Sheermal Bread (2 pcs)", description: "Saffron-infused Mughlai bread baked in tandoor", price: 2.99, isVeg: true, calories: 240, prepTime: 10, category: "Breads", image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80&fit=crop" },
      ],
    },
    {
      userEmail: "chef-bham-bakes@homeal.co.uk",
      userName: "Sarah's Bakes",
      phone: "+447700100020",
      firebaseUid: "test-chef-bham-bakes-001",
      kitchenName: "Sarah's Home Bakery",
      description: "Freshly baked cakes, cupcakes & treats from my Birmingham kitchen. Custom orders welcome!",
      cuisineTypes: JSON.stringify(["Bakery", "Cakes", "Desserts"]),
      bannerImage: "https://images.unsplash.com/photo-1486887396153-fa416526c108?w=1200&q=80&fit=crop",
      sellerType: "BAKERY" as const,
      cakeEnabled: true,
      bakeryEnabled: true,
      latitude: 52.4730,
      longitude: -1.9173,
      menuName: "Bakery Fresh",
      items: [
        { name: "Victoria Sponge Cake", description: "Classic sponge with jam & cream filling", price: 14.99, isVeg: true, calories: 480, prepTime: 60, category: "Cakes & Bakery", image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&q=80&fit=crop", eggOption: "both" },
        { name: "Chocolate Cupcakes (6 pcs)", description: "Rich Belgian chocolate cupcakes with buttercream", price: 8.99, isVeg: true, calories: 320, prepTime: 30, category: "Cakes & Bakery", image: "https://images.unsplash.com/photo-1587668178277-295251f900ce?w=600&q=80&fit=crop", eggOption: "both" },
        { name: "Lemon Drizzle Loaf", description: "Zesty lemon cake with sugar glaze", price: 7.99, isVeg: true, calories: 350, prepTime: 45, category: "Cakes & Bakery", image: "https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=600&q=80&fit=crop", eggOption: "both" },
        { name: "Scones (4 pcs)", description: "Buttery scones with clotted cream & jam", price: 5.99, isVeg: true, calories: 240, prepTime: 20, category: "Cakes & Bakery", image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600&q=80&fit=crop", eggOption: "egg" },
        { name: "Banana Bread", description: "Moist banana bread with walnuts", price: 6.49, isVeg: true, calories: 280, prepTime: 40, category: "Cakes & Bakery", image: "https://images.unsplash.com/photo-1483695028939-5bb13f8648b0?w=600&q=80&fit=crop", eggOption: "eggless" },
      ],
    },
    // --- MANCHESTER ---
    {
      userEmail: "chef-manchester@homeal.co.uk",
      userName: "Auntie Meera",
      phone: "+447700100014",
      firebaseUid: "test-chef-manchester-001",
      kitchenName: "Auntie Meera's Kitchen",
      description: "Homestyle South Asian comfort food. Butter chicken, dal makhani and naan — just like your mum's cooking.",
      cuisineTypes: JSON.stringify(["North Indian", "Punjabi", "Comfort Food"]),
      bannerImage: "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=1200&q=80&fit=crop",
      latitude: 53.4808,
      longitude: -2.2426,
      menuName: "Comfort Food Menu",
      items: [
        { name: "Butter Chicken", description: "Creamy tomato-based chicken curry", price: 8.49, isVeg: false, calories: 480, prepTime: 20, category: "North Indian", image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&q=80&fit=crop" },
        { name: "Dal Makhani", description: "Slow-cooked black lentils in butter and cream", price: 5.99, isVeg: true, calories: 350, prepTime: 25, category: "North Indian", image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&q=80&fit=crop" },
        { name: "Garlic Naan (2 pcs)", description: "Fresh tandoor-baked garlic naan", price: 2.99, isVeg: true, calories: 260, prepTime: 8, category: "Breads", image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&q=80&fit=crop" },
        { name: "Mixed Pickle (300g jar)", description: "Hot & tangy homemade achaar with raw mango, lime & chilli", price: 4.49, isVeg: true, calories: 30, prepTime: 0, category: "Pickles & Chutneys", image: "https://images.unsplash.com/photo-1625398407796-82650a8c135f?w=600&q=80&fit=crop" },
        { name: "Masala Chai (Flask, 500ml)", description: "Spiced tea brewed with cardamom, ginger & cinnamon", price: 2.49, isVeg: true, calories: 90, prepTime: 5, category: "Beverages", image: "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=600&q=80&fit=crop" },
      ],
    },
    {
      userEmail: "chef-manchester-pickles@homeal.co.uk",
      userName: "Grandma Patel",
      phone: "+447700100021",
      firebaseUid: "test-chef-mcr-pickle-001",
      kitchenName: "Patel's Pickles & Masalas",
      description: "Traditional Gujarati pickles, chutneys, masala powders & papads — recipes passed down 3 generations.",
      cuisineTypes: JSON.stringify(["Pickles", "Masalas", "Homemade Store"]),
      bannerImage: "https://images.unsplash.com/photo-1540914124281-342587941389?w=1200&q=80&fit=crop",
      latitude: 53.4631,
      longitude: -2.2913,
      menuName: "Homemade Store",
      items: [
        { name: "Lime Pickle (500g)", description: "Tangy lime pickle aged for 30 days in mustard oil", price: 4.99, isVeg: true, calories: 35, prepTime: 0, category: "Pickles & Chutneys", image: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=600&q=80&fit=crop" },
        { name: "Green Chilli Pickle (300g)", description: "Fiery stuffed green chilli pickle", price: 3.99, isVeg: true, calories: 25, prepTime: 0, category: "Pickles & Chutneys", image: "https://images.unsplash.com/photo-1598511726623-d2e9996892f0?w=600&q=80&fit=crop" },
        { name: "Garam Masala Powder (200g)", description: "Freshly ground 12-spice blend — no additives", price: 3.49, isVeg: true, calories: 10, prepTime: 0, category: "Pickles & Chutneys", image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&q=80&fit=crop" },
        { name: "Handmade Papad (20 pcs)", description: "Crispy moong dal papads — sun-dried at home", price: 4.99, isVeg: true, calories: 40, prepTime: 0, category: "Snacks & Starters", image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&q=80&fit=crop" },
        { name: "Tamarind Chutney (250ml)", description: "Sweet & sour imli chutney — perfect with samosas", price: 2.99, isVeg: true, calories: 60, prepTime: 0, category: "Pickles & Chutneys", image: "https://images.unsplash.com/photo-1517244683847-7456b63c5969?w=600&q=80&fit=crop" },
        { name: "Garlic Chutney Powder (150g)", description: "Dry garlic chutney — sprinkle on anything!", price: 2.49, isVeg: true, calories: 20, prepTime: 0, category: "Pickles & Chutneys", image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&q=80&fit=crop" },
      ],
    },
    // --- LEEDS ---
    {
      userEmail: "chef-leeds@homeal.co.uk",
      userName: "Yusuf's Kitchen",
      phone: "+447700100022",
      firebaseUid: "test-chef-leeds-001",
      kitchenName: "Yusuf's Grill House",
      description: "Charcoal-grilled kebabs, shawarma wraps and fresh Middle Eastern dips. Halal certified.",
      cuisineTypes: JSON.stringify(["Middle Eastern", "Turkish", "Kebabs"]),
      bannerImage: "https://images.unsplash.com/photo-1555992336-fb0d29498b13?w=1200&q=80&fit=crop",
      latitude: 53.8008,
      longitude: -1.5491,
      menuName: "Grill & Mezze",
      items: [
        { name: "Chicken Shawarma Wrap", description: "Marinated chicken with garlic sauce, pickles & salad", price: 7.49, isVeg: false, calories: 420, prepTime: 15, category: "Snacks & Starters", image: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=600&q=80&fit=crop" },
        { name: "Mixed Grill Platter", description: "Lamb kofta, chicken tikka, seekh kebab with rice", price: 12.99, isVeg: false, calories: 680, prepTime: 25, category: "North Indian", image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=80&fit=crop" },
        { name: "Falafel Plate", description: "Crispy falafel with hummus, tabbouleh & warm pita", price: 6.99, isVeg: true, calories: 380, prepTime: 15, category: "Snacks & Starters", image: "https://images.unsplash.com/photo-1593001872095-7d5b3868fb1d?w=600&q=80&fit=crop" },
        { name: "Hummus & Pita (serves 2)", description: "Creamy chickpea dip with warm flatbread", price: 3.99, isVeg: true, calories: 240, prepTime: 10, category: "Snacks & Starters", image: "https://images.unsplash.com/photo-1541014741259-de529411b96a?w=600&q=80&fit=crop" },
        { name: "Baklava (4 pcs)", description: "Flaky pastry layers with pistachios & honey", price: 4.99, isVeg: true, calories: 280, prepTime: 5, category: "Desserts", image: "https://images.unsplash.com/photo-1519676867240-f03562e64548?w=600&q=80&fit=crop", eggOption: "egg" },
      ],
    },
    // --- GLASGOW ---
    {
      userEmail: "chef-glasgow@homeal.co.uk",
      userName: "Mrs. Singh",
      phone: "+447700100023",
      firebaseUid: "test-chef-glasgow-001",
      kitchenName: "Singh's Sweet Shop",
      description: "Authentic Indian sweets, mithai & snacks made fresh daily in Glasgow. Perfect for festivals & celebrations.",
      cuisineTypes: JSON.stringify(["Sweets", "Indian", "Mithai"]),
      bannerImage: "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=1200&q=80&fit=crop",
      latitude: 55.8642,
      longitude: -4.2518,
      menuName: "Mithai & Snacks",
      items: [
        { name: "Kaju Katli (250g box)", description: "Premium cashew nut fudge with silver leaf", price: 8.99, isVeg: true, calories: 350, prepTime: 5, category: "Sweets", image: "https://images.unsplash.com/photo-1548943487-a2e4e43b4853?w=600&q=80&fit=crop", eggOption: "eggless" },
        { name: "Jalebi (10 pcs)", description: "Crispy saffron spirals soaked in sugar syrup", price: 4.99, isVeg: true, calories: 400, prepTime: 15, category: "Sweets", image: "https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?w=600&q=80&fit=crop", eggOption: "eggless" },
        { name: "Rasgulla (6 pcs)", description: "Soft spongy cheese balls in sugar syrup", price: 5.49, isVeg: true, calories: 280, prepTime: 10, category: "Sweets", image: "https://images.unsplash.com/photo-1514517521153-1be72277b32f?w=600&q=80&fit=crop", eggOption: "eggless" },
        { name: "Samosa (6 pcs)", description: "Crispy potato & pea filled pastries", price: 4.49, isVeg: true, calories: 360, prepTime: 12, category: "Snacks & Starters", image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=600&q=80&fit=crop" },
        { name: "Besan Ladoo (8 pcs)", description: "Gram flour & ghee ladoos — melt in your mouth", price: 5.99, isVeg: true, calories: 420, prepTime: 5, category: "Sweets", image: "https://images.unsplash.com/photo-1612203985729-70726954388c?w=600&q=80&fit=crop", eggOption: "eggless" },
      ],
    },
    // --- BRISTOL ---
    {
      userEmail: "chef-bristol@homeal.co.uk",
      userName: "Maya's Dosa Bar",
      phone: "+447700100024",
      firebaseUid: "test-chef-bristol-001",
      kitchenName: "Maya's South Indian Kitchen",
      description: "Crispy dosas, fluffy idlis & steaming filter coffee from Bristol. Authentic South Indian flavours.",
      cuisineTypes: JSON.stringify(["South Indian", "Dosa", "Coffee"]),
      bannerImage: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1200&q=80&fit=crop",
      latitude: 51.4545,
      longitude: -2.5879,
      menuName: "South Indian Specials",
      items: [
        { name: "Masala Dosa", description: "Crispy rice & lentil crepe with spiced potato filling", price: 5.99, isVeg: true, calories: 320, prepTime: 12, category: "South Indian", image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80&fit=crop" },
        { name: "Rava Dosa", description: "Semolina dosa — crispy & lacy", price: 5.49, isVeg: true, calories: 280, prepTime: 10, category: "South Indian", image: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&q=80&fit=crop" },
        { name: "Idli Vada Combo", description: "2 idlis + 1 vada with sambar & chutney", price: 4.99, isVeg: true, calories: 340, prepTime: 10, category: "South Indian", image: "https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=600&q=80&fit=crop" },
        { name: "Mysore Pak (6 pcs)", description: "Melt-in-mouth gram flour & ghee sweet from Karnataka", price: 4.99, isVeg: true, calories: 380, prepTime: 5, category: "Sweets", image: "https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=600&q=80&fit=crop", eggOption: "eggless" },
        { name: "Filter Coffee (2 cups)", description: "Traditional drip coffee brewed with chicory", price: 2.99, isVeg: true, calories: 60, prepTime: 5, category: "Beverages", image: "https://images.unsplash.com/photo-1495147466023-ac5c588e2e94?w=600&q=80&fit=crop" },
      ],
    },
    // --- EDINBURGH ---
    {
      userEmail: "chef-edinburgh@homeal.co.uk",
      userName: "Zara's Cakes",
      phone: "+447700100025",
      firebaseUid: "test-chef-edinburgh-001",
      kitchenName: "Zara's Cake Studio",
      description: "Bespoke cakes, brownies & desserts in Edinburgh. Custom birthday & wedding cakes available.",
      cuisineTypes: JSON.stringify(["Cakes", "Bakery", "Desserts"]),
      bannerImage: "https://images.unsplash.com/photo-1464305795204-6f5bbfc7fb81?w=1200&q=80&fit=crop",
      sellerType: "CAKE" as const,
      cakeEnabled: true,
      latitude: 55.9533,
      longitude: -3.1883,
      menuName: "Cake & Dessert Menu",
      items: [
        { name: "Red Velvet Cake (8 inch)", description: "Cream cheese frosted red velvet — serves 10-12", price: 24.99, isVeg: true, calories: 520, prepTime: 120, category: "Cakes & Bakery", image: "https://images.unsplash.com/photo-1616541823729-00fe0aacd32c?w=600&q=80&fit=crop", eggOption: "both" },
        { name: "Brownie Box (9 pcs)", description: "Fudgy dark chocolate brownies with sea salt", price: 9.99, isVeg: true, calories: 340, prepTime: 30, category: "Cakes & Bakery", image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&q=80&fit=crop", eggOption: "both" },
        { name: "Carrot Cake (6 inch)", description: "Spiced carrot cake with cream cheese icing — serves 6-8", price: 16.99, isVeg: true, calories: 450, prepTime: 90, category: "Cakes & Bakery", image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600&q=80&fit=crop", eggOption: "both" },
        { name: "Cookie Box (12 pcs)", description: "Assorted cookies — choc chip, oatmeal, snickerdoodle", price: 7.99, isVeg: true, calories: 180, prepTime: 20, category: "Cakes & Bakery", image: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600&q=80&fit=crop", eggOption: "egg" },
        { name: "Mango Cheesecake (6 inch)", description: "No-bake mango cheesecake — tropical bliss", price: 15.99, isVeg: true, calories: 400, prepTime: 60, category: "Desserts", image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=600&q=80&fit=crop", eggOption: "eggless" },
      ],
    },
    // --- CARDIFF ---
    {
      userEmail: "chef-cardiff@homeal.co.uk",
      userName: "Raj's Thali",
      phone: "+447700100026",
      firebaseUid: "test-chef-cardiff-001",
      kitchenName: "Raj's Thali House",
      description: "Rajasthani thalis and dal baati churma — a taste of the desert from Cardiff.",
      cuisineTypes: JSON.stringify(["Rajasthani", "North Indian", "Thali"]),
      bannerImage: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=1200&q=80&fit=crop",
      latitude: 51.4816,
      longitude: -3.1791,
      menuName: "Rajasthani Feast",
      items: [
        { name: "Rajasthani Thali", description: "Dal baati churma, gatte ki sabji, papad, pickle & sweet", price: 9.99, isVeg: true, calories: 680, prepTime: 25, category: "Thali", image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600&q=80&fit=crop" },
        { name: "Dal Baati Churma", description: "Baked wheat balls with lentils & sweet crumble", price: 7.49, isVeg: true, calories: 520, prepTime: 20, category: "North Indian", image: "https://images.unsplash.com/photo-1505253758473-96b7015fcd40?w=600&q=80&fit=crop" },
        { name: "Pyaaz Kachori (4 pcs)", description: "Crispy onion-filled pastries — Jodhpur style", price: 4.99, isVeg: true, calories: 340, prepTime: 12, category: "Snacks & Starters", image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&q=80&fit=crop" },
        { name: "Churma Ladoo (6 pcs)", description: "Traditional Rajasthani wheat & ghee ladoos", price: 5.49, isVeg: true, calories: 400, prepTime: 5, category: "Sweets", image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&q=80&fit=crop", eggOption: "eggless" },
      ],
    },
    // --- LIVERPOOL ---
    {
      userEmail: "chef-liverpool@homeal.co.uk",
      userName: "Amma's Tiffin",
      phone: "+447700100027",
      firebaseUid: "test-chef-liverpool-001",
      kitchenName: "Amma's Tiffin Service",
      description: "Daily home-cooked tiffins delivered in Liverpool. Healthy, fresh, no preservatives. Weekly subscription available.",
      cuisineTypes: JSON.stringify(["South Indian", "Tiffin", "Healthy"]),
      bannerImage: "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=1200&q=80&fit=crop",
      latitude: 53.4084,
      longitude: -2.9916,
      menuName: "Daily Tiffin",
      items: [
        { name: "Veg Lunch Box", description: "Rice, sambar, rasam, sabji, curd & papad", price: 6.49, isVeg: true, calories: 480, prepTime: 15, category: "Thali", image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&q=80&fit=crop" },
        { name: "Non-Veg Lunch Box", description: "Rice, chicken curry, dal, sabji & pickle", price: 7.99, isVeg: false, calories: 560, prepTime: 20, category: "Thali", image: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=600&q=80&fit=crop" },
        { name: "Ragi Dosa", description: "Healthy finger millet dosa — high protein, gluten-free", price: 4.99, isVeg: true, calories: 220, prepTime: 10, category: "South Indian", image: "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=600&q=80&fit=crop" },
        { name: "Curd Rice", description: "Cooling yogurt rice tempered with curry leaves — comfort in a bowl", price: 3.99, isVeg: true, calories: 260, prepTime: 5, category: "Rice & Biryani", image: "https://images.unsplash.com/photo-1516714435131-44d6b64dc6a2?w=600&q=80&fit=crop" },
        { name: "Fresh Lemonade (500ml)", description: "Homemade nimbu pani with mint & ginger", price: 1.99, isVeg: true, calories: 50, prepTime: 3, category: "Beverages", image: "https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=600&q=80&fit=crop" },
      ],
    },
    // --- NOTTINGHAM ---
    {
      userEmail: "chef-nottingham@homeal.co.uk",
      userName: "Bake My Day",
      phone: "+447700100028",
      firebaseUid: "test-chef-nottingham-001",
      kitchenName: "Bake My Day Nottingham",
      description: "Artisan breads, sourdough & pastries baked fresh every morning. Also: homemade jams & preserves.",
      cuisineTypes: JSON.stringify(["Bakery", "Breads", "Artisan"]),
      bannerImage: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&q=80&fit=crop",
      sellerType: "BAKERY" as const,
      bakeryEnabled: true,
      latitude: 52.9548,
      longitude: -1.1581,
      menuName: "Bakery Menu",
      items: [
        { name: "Sourdough Loaf", description: "Wild-yeast sourdough — 24hr ferment, crusty outside, soft inside", price: 4.99, isVeg: true, calories: 180, prepTime: 0, category: "Breads", image: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&q=80&fit=crop" },
        { name: "Garlic & Herb Focaccia", description: "Italian flatbread with rosemary, garlic & olive oil", price: 5.49, isVeg: true, calories: 220, prepTime: 0, category: "Breads", image: "https://images.unsplash.com/photo-1573821663912-569905455b1c?w=600&q=80&fit=crop" },
        { name: "Cinnamon Rolls (4 pcs)", description: "Soft rolls with cinnamon sugar & cream cheese glaze", price: 6.99, isVeg: true, calories: 310, prepTime: 15, category: "Cakes & Bakery", image: "https://images.unsplash.com/photo-1509365390695-33aee754301f?w=600&q=80&fit=crop", eggOption: "egg" },
        { name: "Strawberry Jam (250g jar)", description: "Homemade strawberry preserve — summer in a jar", price: 3.99, isVeg: true, calories: 40, prepTime: 0, category: "Pickles & Chutneys", image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600&q=80&fit=crop" },
        { name: "Mixed Berry Muffins (4 pcs)", description: "Blueberry & raspberry muffins — fluffy & moist", price: 5.99, isVeg: true, calories: 260, prepTime: 10, category: "Cakes & Bakery", image: "https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=600&q=80&fit=crop", eggOption: "egg" },
      ],
    },
  ];

  // We seed categories first, then reference them for items (handled below)

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
    { name: "South Indian", icon: "🍛", sortOrder: 1, type: "FOOD" as const },
    { name: "North Indian", icon: "🫓", sortOrder: 2, type: "FOOD" as const },
    { name: "Chinese", icon: "🥡", sortOrder: 3, type: "FOOD" as const },
    { name: "Snacks & Starters", icon: "🍿", sortOrder: 4, type: "FOOD" as const },
    { name: "Breads", icon: "🍞", sortOrder: 5, type: "FOOD" as const },
    { name: "Rice & Biryani", icon: "🍚", sortOrder: 6, type: "FOOD" as const },
    { name: "Desserts", icon: "🍮", sortOrder: 7, type: "FOOD" as const },
    { name: "Thali", icon: "🍽️", sortOrder: 8, type: "FOOD" as const },
    { name: "Pickles & Chutneys", icon: "🫙", sortOrder: 9, type: "PRODUCT" as const },
    { name: "Sweets", icon: "🍬", sortOrder: 10, type: "PRODUCT" as const },
    { name: "Cakes & Bakery", icon: "🎂", sortOrder: 11, type: "PRODUCT" as const },
    { name: "Beverages", icon: "🥤", sortOrder: 12, type: "PRODUCT" as const },
  ];

  for (const cat of categories) {
    const c = await prisma.category.upsert({
      where: { name: cat.name },
      update: { icon: cat.icon, sortOrder: cat.sortOrder, type: cat.type },
      create: cat,
    });
    categoryMap[cat.name] = c.id;
  }
  console.log(`\nCreated ${categories.length} food categories`);

  // ==================== SAMPLE MENU (Priya's Kitchen) ====================

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

  const menuItems = [
    { name: "Masala Dosa", description: "Crispy dosa with potato masala, served with sambar & coconut chutney", price: 5.99, isVeg: true, calories: 320, prepTime: 15, category: "South Indian", image: "https://images.unsplash.com/photo-1630383249896-424e482df921?w=600&q=80&fit=crop" },
    { name: "Idli Sambar", description: "Soft steamed idli (4 pcs) with sambar and chutneys", price: 4.49, isVeg: true, calories: 240, prepTime: 10, category: "South Indian", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80&fit=crop" },
    { name: "South Indian Thali", description: "Full meal with rice, sambar, rasam, 2 sabji, curd, papad & dessert", price: 8.99, isVeg: true, calories: 650, prepTime: 25, category: "Thali", image: "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=600&q=80&fit=crop" },
    { name: "Chicken Biryani", description: "Hyderabadi-style dum biryani with raita", price: 9.99, isVeg: false, calories: 550, prepTime: 30, category: "Rice & Biryani", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&q=80&fit=crop" },
    { name: "Mango Lassi", description: "Fresh mango blended with yogurt", price: 2.99, isVeg: true, calories: 180, prepTime: 5, category: "Beverages", image: "https://images.unsplash.com/photo-1527685609591-44b0aef2400b?w=600&q=80&fit=crop" },
    { name: "Lemon Rice", description: "Tangy tempered rice with peanuts & curry leaves", price: 4.49, isVeg: true, calories: 290, prepTime: 10, category: "Rice & Biryani", image: "https://images.unsplash.com/photo-1596560548464-f010549b84d7?w=600&q=80&fit=crop" },
    { name: "Andhra Chicken Pickle (250g)", description: "Spicy bone-in chicken pickle in sesame oil", price: 5.99, isVeg: false, calories: 60, prepTime: 0, category: "Pickles & Chutneys", image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&q=80&fit=crop" },
  ];

  for (const item of menuItems) {
    const { category: catName, ...itemData } = item;
    await prisma.menuItem.upsert({
      where: { id: `test-item-${item.name.toLowerCase().replace(/\s/g, "-").slice(0, 25)}` },
      update: { categoryId: categoryMap[catName] || undefined, ...itemData },
      create: {
        id: `test-item-${item.name.toLowerCase().replace(/\s/g, "-").slice(0, 25)}`,
        menuId: menu.id,
        categoryId: categoryMap[catName] || undefined,
        ...itemData,
      },
    });
  }
  console.log(`Created ${menuItems.length} menu items for Priya's Kitchen`);

  // ==================== MULTI-DAY SCHEDULE (Priya's Kitchen) ====================
  // Create menus for the next 6 days to test the scheduler
  const scheduleDays = [
    { offset: 1, name: "Tomorrow's Thali", closed: false, items: [
      { name: "Veg Thali Deluxe", price: 7.99, isVeg: true, prepTime: 20, stockCount: 15 },
      { name: "Paneer Butter Masala", price: 6.49, isVeg: true, prepTime: 15, stockCount: 20 },
      { name: "Jeera Rice", price: 3.49, isVeg: true, prepTime: 10, stockCount: 30 },
    ]},
    { offset: 2, name: "Midweek Special", closed: false, items: [
      { name: "Chole Bhature", price: 5.99, isVeg: true, prepTime: 20, stockCount: 12 },
      { name: "Aloo Paratha", price: 4.49, isVeg: true, prepTime: 15, stockCount: 20 },
      { name: "Raita", price: 1.99, isVeg: true, prepTime: 5, stockCount: 30 },
    ]},
    { offset: 3, name: "Biryani Day", closed: false, items: [
      { name: "Veg Biryani", price: 7.49, isVeg: true, prepTime: 25, stockCount: 15 },
      { name: "Chicken Biryani", price: 9.99, isVeg: false, prepTime: 30, stockCount: 10 },
      { name: "Gulab Jamun (2 pcs)", price: 2.49, isVeg: true, prepTime: 5, stockCount: 25 },
    ]},
    { offset: 4, name: "Closed Day", closed: true, items: [] },
    { offset: 5, name: "Weekend Feast", closed: false, items: [
      { name: "Dosa Festival", price: 8.99, isVeg: true, prepTime: 20, stockCount: 10 },
      { name: "Pongal with Chutney", price: 4.99, isVeg: true, prepTime: 15, stockCount: 20 },
      { name: "Filter Coffee", price: 1.99, isVeg: true, prepTime: 5, stockCount: 40 },
      { name: "Rava Kesari", price: 2.99, isVeg: true, prepTime: 10, stockCount: 15 },
    ]},
    { offset: 6, name: "Sunday Special", closed: false, items: [
      { name: "Hyderabadi Biryani", price: 10.99, isVeg: false, prepTime: 35, stockCount: 8 },
      { name: "Full South Indian Thali", price: 9.99, isVeg: true, prepTime: 25, stockCount: 10 },
    ]},
  ];

  for (const sched of scheduleDays) {
    const schedDate = new Date(today);
    schedDate.setDate(schedDate.getDate() + sched.offset);
    const schedDateOnly = new Date(schedDate.toISOString().split("T")[0] + "T00:00:00.000Z");
    const menuId = `test-sched-${sched.offset}`;

    await prisma.menu.upsert({
      where: { id: menuId },
      update: { isClosed: sched.closed, name: sched.name },
      create: {
        id: menuId,
        chefId: chef.id,
        name: sched.name,
        date: schedDateOnly,
        isActive: true,
        isClosed: sched.closed,
      },
    });

    for (let idx = 0; idx < sched.items.length; idx++) {
      const item = sched.items[idx];
      const itemId = `ti-sched-${sched.offset}-${idx}`;
      await prisma.menuItem.upsert({
        where: { id: itemId },
        update: { ...item },
        create: {
          id: itemId,
          menuId,
          ...item,
          sortOrder: idx,
        },
      });
    }
  }
  console.log(`Created ${scheduleDays.length} scheduled day menus for Priya's Kitchen`);

  // ==================== MENU TEMPLATE (Priya's Kitchen) ====================
  await prisma.menuTemplate.upsert({
    where: { id: "test-template-001" },
    update: {},
    create: {
      id: "test-template-001",
      chefId: chef.id,
      name: "Standard South Indian Thali",
      items: JSON.stringify([
        { name: "Masala Dosa", price: 5.99, isVeg: true, prepTime: 15, stockCount: 20 },
        { name: "Idli Sambar (4 pcs)", price: 4.49, isVeg: true, prepTime: 10, stockCount: 25 },
        { name: "South Indian Thali", price: 8.99, isVeg: true, prepTime: 25, stockCount: 15 },
        { name: "Mango Lassi", price: 2.99, isVeg: true, prepTime: 5, stockCount: 30 },
      ]),
    },
  });
  console.log("Created 1 menu template for Priya's Kitchen");

  // ==================== CREATE ALL TEST CHEFS WITH MENUS & CATEGORIES ====================

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
      update: { isVerified: true, isOnline: true, latitude: tc.latitude, longitude: tc.longitude, bannerImage: tc.bannerImage },
      create: {
        userId: tcUser.id,
        kitchenName: tc.kitchenName,
        description: tc.description,
        cuisineTypes: tc.cuisineTypes,
        bannerImage: tc.bannerImage,
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
        ...(tc.sellerType ? { sellerType: tc.sellerType } : {}),
        ...(tc.cakeEnabled ? { cakeEnabled: tc.cakeEnabled } : {}),
        ...(tc.bakeryEnabled ? { bakeryEnabled: tc.bakeryEnabled } : {}),
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

    for (let idx = 0; idx < tc.items.length; idx++) {
      const { category: catName, ...itemData } = tc.items[idx];
      const shortKey = tc.userEmail.split("@")[0].slice(0, 20);
      const itemId = `ti-${shortKey}-${idx}`;
      await prisma.menuItem.upsert({
        where: { id: itemId },
        update: { categoryId: categoryMap[catName] || undefined, ...itemData },
        create: {
          id: itemId,
          menuId: tcMenu.id,
          categoryId: categoryMap[catName] || undefined,
          ...itemData,
        },
      });
    }

    console.log(`  Chef: ${tc.kitchenName} (${tc.items.length} items) — ${tc.latitude.toFixed(2)}°N`);
  }
  console.log(`Created ${testChefs.length} chefs across the UK with ${testChefs.reduce((s, c) => s + c.items.length, 0)} products`);

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
