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
      latitude: 51.6565,
      longitude: -0.3903,
      menuName: "Gujarati Thali Special",
      items: [
        { name: "Gujarati Thali", description: "Dal, sabji, rotli, rice, papad, pickle & sweet", price: 7.99, isVeg: true, calories: 580, prepTime: 20, category: "Thali" },
        { name: "Dhokla", description: "Steamed fermented gram flour cake with tempering", price: 3.49, isVeg: true, calories: 160, prepTime: 10, category: "Snacks & Starters" },
        { name: "Pav Bhaji", description: "Spiced mixed veg mash with buttered pav buns", price: 5.49, isVeg: true, calories: 420, prepTime: 15, category: "Snacks & Starters" },
        { name: "Mango Pickle (250g jar)", description: "Traditional homemade aam ka achaar — tangy & spicy", price: 3.99, isVeg: true, calories: 40, prepTime: 0, category: "Pickles & Chutneys" },
        { name: "Coconut Barfi (6 pcs)", description: "Fresh coconut and condensed milk fudge", price: 4.49, isVeg: true, calories: 220, prepTime: 5, category: "Sweets" },
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
        { name: "Hakka Noodles", description: "Stir-fried egg noodles with vegetables and soy", price: 6.49, isVeg: false, calories: 380, prepTime: 15, category: "Chinese" },
        { name: "Veg Manchurian", description: "Crispy veg balls in spicy indo-chinese gravy", price: 5.99, isVeg: true, calories: 340, prepTime: 20, category: "Chinese" },
        { name: "Chicken Fried Rice", description: "Wok-tossed rice with chicken and egg", price: 7.49, isVeg: false, calories: 450, prepTime: 15, category: "Rice & Biryani" },
        { name: "Spring Rolls (6 pcs)", description: "Crispy rolls stuffed with vegetables", price: 4.49, isVeg: true, calories: 280, prepTime: 12, category: "Snacks & Starters" },
        { name: "Chilli Garlic Sauce (200ml)", description: "Homemade hot sauce — perfect with momos & noodles", price: 2.99, isVeg: true, calories: 15, prepTime: 0, category: "Pickles & Chutneys" },
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
        { name: "Jerk Chicken", description: "Grilled spiced chicken with rice & peas", price: 8.99, isVeg: false, calories: 520, prepTime: 25, category: "North Indian" },
        { name: "Curry Goat", description: "Slow-cooked goat in Caribbean spices with rice", price: 9.99, isVeg: false, calories: 580, prepTime: 30, category: "North Indian" },
        { name: "Ackee & Saltfish", description: "Traditional Jamaican breakfast served with fried dumpling", price: 7.49, isVeg: false, calories: 440, prepTime: 20, category: "Snacks & Starters" },
        { name: "Rum Cake", description: "Rich moist cake soaked in dark rum — Caribbean classic", price: 6.99, isVeg: true, calories: 380, prepTime: 5, category: "Cakes & Bakery" },
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
      latitude: 52.4862,
      longitude: -1.8904,
      menuName: "Biryani & Kebab Feast",
      items: [
        { name: "Lucknowi Biryani", description: "Fragrant dum biryani with tender lamb", price: 10.99, isVeg: false, calories: 620, prepTime: 35, category: "Rice & Biryani" },
        { name: "Seekh Kebab (4 pcs)", description: "Chargrilled spiced lamb mince kebabs", price: 6.99, isVeg: false, calories: 380, prepTime: 15, category: "Snacks & Starters" },
        { name: "Paneer Biryani", description: "Vegetarian biryani with paneer and saffron", price: 8.49, isVeg: true, calories: 520, prepTime: 30, category: "Rice & Biryani" },
        { name: "Gulab Jamun (4 pcs)", description: "Soft milk dumplings in rose syrup", price: 3.99, isVeg: true, calories: 320, prepTime: 5, category: "Sweets" },
        { name: "Sheermal Bread (2 pcs)", description: "Saffron-infused Mughlai bread baked in tandoor", price: 2.99, isVeg: true, calories: 240, prepTime: 10, category: "Breads" },
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
      latitude: 52.4730,
      longitude: -1.9173,
      menuName: "Bakery Fresh",
      items: [
        { name: "Victoria Sponge Cake", description: "Classic sponge with jam & cream filling", price: 14.99, isVeg: true, calories: 480, prepTime: 60, category: "Cakes & Bakery" },
        { name: "Chocolate Cupcakes (6 pcs)", description: "Rich Belgian chocolate cupcakes with buttercream", price: 8.99, isVeg: true, calories: 320, prepTime: 30, category: "Cakes & Bakery" },
        { name: "Lemon Drizzle Loaf", description: "Zesty lemon cake with sugar glaze", price: 7.99, isVeg: true, calories: 350, prepTime: 45, category: "Cakes & Bakery" },
        { name: "Scones (4 pcs)", description: "Buttery scones with clotted cream & jam", price: 5.99, isVeg: true, calories: 240, prepTime: 20, category: "Cakes & Bakery" },
        { name: "Banana Bread", description: "Moist banana bread with walnuts", price: 6.49, isVeg: true, calories: 280, prepTime: 40, category: "Cakes & Bakery" },
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
      latitude: 53.4808,
      longitude: -2.2426,
      menuName: "Comfort Food Menu",
      items: [
        { name: "Butter Chicken", description: "Creamy tomato-based chicken curry", price: 8.49, isVeg: false, calories: 480, prepTime: 20, category: "North Indian" },
        { name: "Dal Makhani", description: "Slow-cooked black lentils in butter and cream", price: 5.99, isVeg: true, calories: 350, prepTime: 25, category: "North Indian" },
        { name: "Garlic Naan (2 pcs)", description: "Fresh tandoor-baked garlic naan", price: 2.99, isVeg: true, calories: 260, prepTime: 8, category: "Breads" },
        { name: "Mixed Pickle (300g jar)", description: "Hot & tangy homemade achaar with raw mango, lime & chilli", price: 4.49, isVeg: true, calories: 30, prepTime: 0, category: "Pickles & Chutneys" },
        { name: "Masala Chai (Flask, 500ml)", description: "Spiced tea brewed with cardamom, ginger & cinnamon", price: 2.49, isVeg: true, calories: 90, prepTime: 5, category: "Beverages" },
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
      latitude: 53.4631,
      longitude: -2.2913,
      menuName: "Homemade Store",
      items: [
        { name: "Lime Pickle (500g)", description: "Tangy lime pickle aged for 30 days in mustard oil", price: 4.99, isVeg: true, calories: 35, prepTime: 0, category: "Pickles & Chutneys" },
        { name: "Green Chilli Pickle (300g)", description: "Fiery stuffed green chilli pickle", price: 3.99, isVeg: true, calories: 25, prepTime: 0, category: "Pickles & Chutneys" },
        { name: "Garam Masala Powder (200g)", description: "Freshly ground 12-spice blend — no additives", price: 3.49, isVeg: true, calories: 10, prepTime: 0, category: "Pickles & Chutneys" },
        { name: "Handmade Papad (20 pcs)", description: "Crispy moong dal papads — sun-dried at home", price: 4.99, isVeg: true, calories: 40, prepTime: 0, category: "Snacks & Starters" },
        { name: "Tamarind Chutney (250ml)", description: "Sweet & sour imli chutney — perfect with samosas", price: 2.99, isVeg: true, calories: 60, prepTime: 0, category: "Pickles & Chutneys" },
        { name: "Garlic Chutney Powder (150g)", description: "Dry garlic chutney — sprinkle on anything!", price: 2.49, isVeg: true, calories: 20, prepTime: 0, category: "Pickles & Chutneys" },
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
      latitude: 53.8008,
      longitude: -1.5491,
      menuName: "Grill & Mezze",
      items: [
        { name: "Chicken Shawarma Wrap", description: "Marinated chicken with garlic sauce, pickles & salad", price: 7.49, isVeg: false, calories: 420, prepTime: 15, category: "Snacks & Starters" },
        { name: "Mixed Grill Platter", description: "Lamb kofta, chicken tikka, seekh kebab with rice", price: 12.99, isVeg: false, calories: 680, prepTime: 25, category: "North Indian" },
        { name: "Falafel Plate", description: "Crispy falafel with hummus, tabbouleh & warm pita", price: 6.99, isVeg: true, calories: 380, prepTime: 15, category: "Snacks & Starters" },
        { name: "Hummus & Pita (serves 2)", description: "Creamy chickpea dip with warm flatbread", price: 3.99, isVeg: true, calories: 240, prepTime: 10, category: "Snacks & Starters" },
        { name: "Baklava (4 pcs)", description: "Flaky pastry layers with pistachios & honey", price: 4.99, isVeg: true, calories: 280, prepTime: 5, category: "Desserts" },
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
      latitude: 55.8642,
      longitude: -4.2518,
      menuName: "Mithai & Snacks",
      items: [
        { name: "Kaju Katli (250g box)", description: "Premium cashew nut fudge with silver leaf", price: 8.99, isVeg: true, calories: 350, prepTime: 5, category: "Sweets" },
        { name: "Jalebi (10 pcs)", description: "Crispy saffron spirals soaked in sugar syrup", price: 4.99, isVeg: true, calories: 400, prepTime: 15, category: "Sweets" },
        { name: "Rasgulla (6 pcs)", description: "Soft spongy cheese balls in sugar syrup", price: 5.49, isVeg: true, calories: 280, prepTime: 10, category: "Sweets" },
        { name: "Samosa (6 pcs)", description: "Crispy potato & pea filled pastries", price: 4.49, isVeg: true, calories: 360, prepTime: 12, category: "Snacks & Starters" },
        { name: "Besan Ladoo (8 pcs)", description: "Gram flour & ghee ladoos — melt in your mouth", price: 5.99, isVeg: true, calories: 420, prepTime: 5, category: "Sweets" },
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
      latitude: 51.4545,
      longitude: -2.5879,
      menuName: "South Indian Specials",
      items: [
        { name: "Masala Dosa", description: "Crispy rice & lentil crepe with spiced potato filling", price: 5.99, isVeg: true, calories: 320, prepTime: 12, category: "South Indian" },
        { name: "Rava Dosa", description: "Semolina dosa — crispy & lacy", price: 5.49, isVeg: true, calories: 280, prepTime: 10, category: "South Indian" },
        { name: "Idli Vada Combo", description: "2 idlis + 1 vada with sambar & chutney", price: 4.99, isVeg: true, calories: 340, prepTime: 10, category: "South Indian" },
        { name: "Mysore Pak (6 pcs)", description: "Melt-in-mouth gram flour & ghee sweet from Karnataka", price: 4.99, isVeg: true, calories: 380, prepTime: 5, category: "Sweets" },
        { name: "Filter Coffee (2 cups)", description: "Traditional drip coffee brewed with chicory", price: 2.99, isVeg: true, calories: 60, prepTime: 5, category: "Beverages" },
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
      latitude: 55.9533,
      longitude: -3.1883,
      menuName: "Cake & Dessert Menu",
      items: [
        { name: "Red Velvet Cake (8 inch)", description: "Cream cheese frosted red velvet — serves 10-12", price: 24.99, isVeg: true, calories: 520, prepTime: 120, category: "Cakes & Bakery" },
        { name: "Brownie Box (9 pcs)", description: "Fudgy dark chocolate brownies with sea salt", price: 9.99, isVeg: true, calories: 340, prepTime: 30, category: "Cakes & Bakery" },
        { name: "Carrot Cake (6 inch)", description: "Spiced carrot cake with cream cheese icing — serves 6-8", price: 16.99, isVeg: true, calories: 450, prepTime: 90, category: "Cakes & Bakery" },
        { name: "Cookie Box (12 pcs)", description: "Assorted cookies — choc chip, oatmeal, snickerdoodle", price: 7.99, isVeg: true, calories: 180, prepTime: 20, category: "Cakes & Bakery" },
        { name: "Mango Cheesecake (6 inch)", description: "No-bake mango cheesecake — tropical bliss", price: 15.99, isVeg: true, calories: 400, prepTime: 60, category: "Desserts" },
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
      latitude: 51.4816,
      longitude: -3.1791,
      menuName: "Rajasthani Feast",
      items: [
        { name: "Rajasthani Thali", description: "Dal baati churma, gatte ki sabji, papad, pickle & sweet", price: 9.99, isVeg: true, calories: 680, prepTime: 25, category: "Thali" },
        { name: "Dal Baati Churma", description: "Baked wheat balls with lentils & sweet crumble", price: 7.49, isVeg: true, calories: 520, prepTime: 20, category: "North Indian" },
        { name: "Pyaaz Kachori (4 pcs)", description: "Crispy onion-filled pastries — Jodhpur style", price: 4.99, isVeg: true, calories: 340, prepTime: 12, category: "Snacks & Starters" },
        { name: "Churma Ladoo (6 pcs)", description: "Traditional Rajasthani wheat & ghee ladoos", price: 5.49, isVeg: true, calories: 400, prepTime: 5, category: "Sweets" },
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
      latitude: 53.4084,
      longitude: -2.9916,
      menuName: "Daily Tiffin",
      items: [
        { name: "Veg Lunch Box", description: "Rice, sambar, rasam, sabji, curd & papad", price: 6.49, isVeg: true, calories: 480, prepTime: 15, category: "Thali" },
        { name: "Non-Veg Lunch Box", description: "Rice, chicken curry, dal, sabji & pickle", price: 7.99, isVeg: false, calories: 560, prepTime: 20, category: "Thali" },
        { name: "Ragi Dosa", description: "Healthy finger millet dosa — high protein, gluten-free", price: 4.99, isVeg: true, calories: 220, prepTime: 10, category: "South Indian" },
        { name: "Curd Rice", description: "Cooling yogurt rice tempered with curry leaves — comfort in a bowl", price: 3.99, isVeg: true, calories: 260, prepTime: 5, category: "Rice & Biryani" },
        { name: "Fresh Lemonade (500ml)", description: "Homemade nimbu pani with mint & ginger", price: 1.99, isVeg: true, calories: 50, prepTime: 3, category: "Beverages" },
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
      latitude: 52.9548,
      longitude: -1.1581,
      menuName: "Bakery Menu",
      items: [
        { name: "Sourdough Loaf", description: "Wild-yeast sourdough — 24hr ferment, crusty outside, soft inside", price: 4.99, isVeg: true, calories: 180, prepTime: 0, category: "Breads" },
        { name: "Garlic & Herb Focaccia", description: "Italian flatbread with rosemary, garlic & olive oil", price: 5.49, isVeg: true, calories: 220, prepTime: 0, category: "Breads" },
        { name: "Cinnamon Rolls (4 pcs)", description: "Soft rolls with cinnamon sugar & cream cheese glaze", price: 6.99, isVeg: true, calories: 310, prepTime: 15, category: "Cakes & Bakery" },
        { name: "Strawberry Jam (250g jar)", description: "Homemade strawberry preserve — summer in a jar", price: 3.99, isVeg: true, calories: 40, prepTime: 0, category: "Pickles & Chutneys" },
        { name: "Mixed Berry Muffins (4 pcs)", description: "Blueberry & raspberry muffins — fluffy & moist", price: 5.99, isVeg: true, calories: 260, prepTime: 10, category: "Cakes & Bakery" },
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
    { name: "South Indian", icon: "🍛", sortOrder: 1 },
    { name: "North Indian", icon: "🫓", sortOrder: 2 },
    { name: "Chinese", icon: "🥡", sortOrder: 3 },
    { name: "Snacks & Starters", icon: "🍿", sortOrder: 4 },
    { name: "Breads", icon: "🍞", sortOrder: 5 },
    { name: "Rice & Biryani", icon: "🍚", sortOrder: 6 },
    { name: "Desserts", icon: "🍮", sortOrder: 7 },
    { name: "Beverages", icon: "🥤", sortOrder: 8 },
    { name: "Thali", icon: "🍽️", sortOrder: 9 },
    { name: "Pickles & Chutneys", icon: "🫙", sortOrder: 10 },
    { name: "Sweets", icon: "🍬", sortOrder: 11 },
    { name: "Cakes & Bakery", icon: "🎂", sortOrder: 12 },
  ];

  for (const cat of categories) {
    const c = await prisma.category.upsert({
      where: { name: cat.name },
      update: { icon: cat.icon, sortOrder: cat.sortOrder },
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
    { name: "Masala Dosa", description: "Crispy dosa with potato masala, served with sambar & coconut chutney", price: 5.99, isVeg: true, calories: 320, prepTime: 15, category: "South Indian" },
    { name: "Idli Sambar", description: "Soft steamed idli (4 pcs) with sambar and chutneys", price: 4.49, isVeg: true, calories: 240, prepTime: 10, category: "South Indian" },
    { name: "South Indian Thali", description: "Full meal with rice, sambar, rasam, 2 sabji, curd, papad & dessert", price: 8.99, isVeg: true, calories: 650, prepTime: 25, category: "Thali" },
    { name: "Chicken Biryani", description: "Hyderabadi-style dum biryani with raita", price: 9.99, isVeg: false, calories: 550, prepTime: 30, category: "Rice & Biryani" },
    { name: "Mango Lassi", description: "Fresh mango blended with yogurt", price: 2.99, isVeg: true, calories: 180, prepTime: 5, category: "Beverages" },
    { name: "Lemon Rice", description: "Tangy tempered rice with peanuts & curry leaves", price: 4.49, isVeg: true, calories: 290, prepTime: 10, category: "Rice & Biryani" },
    { name: "Andhra Chicken Pickle (250g)", description: "Spicy bone-in chicken pickle in sesame oil", price: 5.99, isVeg: false, calories: 60, prepTime: 0, category: "Pickles & Chutneys" },
  ];

  for (const item of menuItems) {
    const { category: catName, ...itemData } = item;
    await prisma.menuItem.upsert({
      where: { id: `test-item-${item.name.toLowerCase().replace(/\s/g, "-").slice(0, 25)}` },
      update: { categoryId: categoryMap[catName] || undefined },
      create: {
        id: `test-item-${item.name.toLowerCase().replace(/\s/g, "-").slice(0, 25)}`,
        menuId: menu.id,
        categoryId: categoryMap[catName] || undefined,
        ...itemData,
      },
    });
  }
  console.log(`Created ${menuItems.length} menu items for Priya's Kitchen`);

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

    for (let idx = 0; idx < tc.items.length; idx++) {
      const { category: catName, ...itemData } = tc.items[idx];
      const shortKey = tc.userEmail.split("@")[0].slice(0, 20);
      const itemId = `ti-${shortKey}-${idx}`;
      await prisma.menuItem.upsert({
        where: { id: itemId },
        update: { categoryId: categoryMap[catName] || undefined },
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
