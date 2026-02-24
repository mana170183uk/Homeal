/**
 * Setup Manisha's Kitchen: set online, create 7 days of menus with items
 * Run: cd packages/db && npx tsx scripts/setup-manisha-menus.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CHEF_ID = "70b104b8-a785-4d20-92f7-936922f9e925";

// Indian home-cooked meal items for a week
const MENU_ITEMS = [
  // Day 1 (Today)
  [
    { name: "Paneer Butter Masala", price: 7.99, isVeg: true, calories: 420, prepTime: 25, desc: "Rich, creamy tomato-based paneer curry — a classic favourite" },
    { name: "Dal Tadka", price: 4.99, isVeg: true, calories: 280, prepTime: 15, desc: "Yellow lentils tempered with cumin, garlic and ghee" },
    { name: "Jeera Rice", price: 3.49, isVeg: true, calories: 320, prepTime: 15, desc: "Fragrant basmati rice with toasted cumin seeds" },
    { name: "Tandoori Roti (4 pcs)", price: 2.49, isVeg: true, calories: 240, prepTime: 10, desc: "Freshly made whole wheat flatbread" },
    { name: "Chicken Curry", price: 8.99, isVeg: false, calories: 450, prepTime: 30, desc: "Home-style chicken curry with aromatic spices" },
    { name: "Mango Lassi", price: 2.99, isVeg: true, calories: 180, prepTime: 5, desc: "Chilled yoghurt drink blended with fresh mango" },
  ],
  // Day 2
  [
    { name: "Chole Bhature", price: 6.99, isVeg: true, calories: 520, prepTime: 20, desc: "Spicy chickpea curry with fluffy fried bread" },
    { name: "Aloo Gobi", price: 5.49, isVeg: true, calories: 250, prepTime: 20, desc: "Potato and cauliflower dry curry with turmeric" },
    { name: "Plain Paratha (2 pcs)", price: 2.99, isVeg: true, calories: 280, prepTime: 10, desc: "Flaky layered whole wheat bread" },
    { name: "Raita", price: 1.99, isVeg: true, calories: 80, prepTime: 5, desc: "Cool yoghurt with cucumber and mint" },
    { name: "Lamb Keema", price: 9.49, isVeg: false, calories: 480, prepTime: 30, desc: "Minced lamb cooked with peas and spices" },
    { name: "Masala Chai", price: 1.99, isVeg: true, calories: 90, prepTime: 5, desc: "Traditional spiced tea with cardamom and ginger" },
  ],
  // Day 3
  [
    { name: "Rajma Chawal", price: 5.99, isVeg: true, calories: 420, prepTime: 20, desc: "Red kidney bean curry served with steamed rice" },
    { name: "Bhindi Masala", price: 5.49, isVeg: true, calories: 200, prepTime: 20, desc: "Crispy okra stir-fried with onion and spices" },
    { name: "Naan (2 pcs)", price: 2.99, isVeg: true, calories: 320, prepTime: 10, desc: "Soft tandoori naan bread" },
    { name: "Green Salad", price: 1.99, isVeg: true, calories: 50, prepTime: 5, desc: "Fresh cucumber, tomato, onion with lime dressing" },
    { name: "Butter Chicken", price: 8.99, isVeg: false, calories: 490, prepTime: 30, desc: "Tender chicken in a rich, buttery tomato sauce" },
    { name: "Gulab Jamun (3 pcs)", price: 3.49, isVeg: true, calories: 280, prepTime: 10, desc: "Soft milk dumplings soaked in cardamom syrup" },
  ],
  // Day 4
  [
    { name: "Palak Paneer", price: 7.49, isVeg: true, calories: 380, prepTime: 25, desc: "Cottage cheese cubes in creamy spinach gravy" },
    { name: "Toor Dal", price: 4.49, isVeg: true, calories: 260, prepTime: 15, desc: "Pigeon pea lentils with a smoky tadka" },
    { name: "Pulao Rice", price: 3.99, isVeg: true, calories: 350, prepTime: 20, desc: "Aromatic vegetable pulao with whole spices" },
    { name: "Chapati (4 pcs)", price: 2.49, isVeg: true, calories: 240, prepTime: 10, desc: "Soft whole wheat chapatis" },
    { name: "Fish Curry", price: 9.99, isVeg: false, calories: 380, prepTime: 25, desc: "White fish in a tangy coconut curry" },
    { name: "Kheer", price: 3.49, isVeg: true, calories: 250, prepTime: 20, desc: "Creamy rice pudding with cardamom and nuts" },
  ],
  // Day 5
  [
    { name: "Kadhi Pakora", price: 5.99, isVeg: true, calories: 340, prepTime: 25, desc: "Gram flour fritters in tangy yoghurt curry" },
    { name: "Mixed Vegetable Sabzi", price: 5.49, isVeg: true, calories: 220, prepTime: 20, desc: "Seasonal vegetables with cumin and coriander" },
    { name: "Steamed Rice", price: 2.99, isVeg: true, calories: 290, prepTime: 15, desc: "Plain steamed basmati rice" },
    { name: "Pickle & Papad", price: 1.49, isVeg: true, calories: 60, prepTime: 2, desc: "Mango pickle with crispy papadum" },
    { name: "Chicken Biryani", price: 9.99, isVeg: false, calories: 550, prepTime: 40, desc: "Layered dum biryani with tender chicken pieces" },
    { name: "Sweet Lassi", price: 2.49, isVeg: true, calories: 150, prepTime: 5, desc: "Chilled sweetened yoghurt drink" },
  ],
  // Day 6
  [
    { name: "Chana Masala", price: 5.99, isVeg: true, calories: 350, prepTime: 20, desc: "Spiced chickpeas in tomato-onion gravy" },
    { name: "Baingan Bharta", price: 5.49, isVeg: true, calories: 190, prepTime: 25, desc: "Smoky mashed aubergine with spices" },
    { name: "Garlic Naan (2 pcs)", price: 3.49, isVeg: true, calories: 360, prepTime: 10, desc: "Soft naan topped with garlic and butter" },
    { name: "Onion Bhaji (4 pcs)", price: 3.49, isVeg: true, calories: 260, prepTime: 15, desc: "Crispy onion fritters" },
    { name: "Mutton Rogan Josh", price: 10.99, isVeg: false, calories: 520, prepTime: 45, desc: "Tender mutton in a rich Kashmiri spice gravy" },
    { name: "Jalebi (4 pcs)", price: 2.99, isVeg: true, calories: 320, prepTime: 15, desc: "Crispy saffron-soaked sweet spirals" },
  ],
  // Day 7
  [
    { name: "Malai Kofta", price: 7.99, isVeg: true, calories: 450, prepTime: 30, desc: "Paneer-potato dumplings in creamy cashew sauce" },
    { name: "Moong Dal", price: 4.49, isVeg: true, calories: 240, prepTime: 15, desc: "Light green gram lentils with turmeric" },
    { name: "Lemon Rice", price: 3.49, isVeg: true, calories: 310, prepTime: 15, desc: "Tangy South Indian rice with curry leaves and peanuts" },
    { name: "Stuffed Paratha (2 pcs)", price: 3.49, isVeg: true, calories: 340, prepTime: 15, desc: "Aloo-stuffed parathas served with butter" },
    { name: "Egg Curry", price: 6.99, isVeg: false, calories: 350, prepTime: 20, desc: "Boiled eggs in a spiced onion-tomato gravy", eggOption: "egg" },
    { name: "Gajar Halwa", price: 3.99, isVeg: true, calories: 300, prepTime: 25, desc: "Warm carrot pudding with ghee, cardamom and nuts" },
  ],
];

async function main() {
  console.log("Setting Manisha's Kitchen online...");

  // Set chef online with operating hours
  await prisma.chef.update({
    where: { id: CHEF_ID },
    data: {
      isOnline: true,
      operatingHours: JSON.stringify({
        Monday: { open: "09:00", close: "21:00", enabled: true },
        Tuesday: { open: "09:00", close: "21:00", enabled: true },
        Wednesday: { open: "09:00", close: "21:00", enabled: true },
        Thursday: { open: "09:00", close: "21:00", enabled: true },
        Friday: { open: "09:00", close: "21:00", enabled: true },
        Saturday: { open: "10:00", close: "22:00", enabled: true },
        Sunday: { open: "10:00", close: "20:00", enabled: true },
      }),
    },
  });
  console.log("Chef set online with operating hours.");

  // Get category IDs
  const categories = await prisma.category.findMany();
  const catMap = new Map(categories.map((c) => [c.name, c.id]));

  // Create menus for 7 days
  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const date = new Date();
    date.setDate(date.getDate() + dayOffset);
    const dateStr = date.toISOString().split("T")[0];
    const dayItems = MENU_ITEMS[dayOffset];

    console.log(`Creating menu for ${dateStr} (${dayItems.length} items)...`);

    // Upsert menu for this date
    const menu = await prisma.menu.upsert({
      where: { chefId_date: { chefId: CHEF_ID, date: new Date(dateStr + "T00:00:00.000Z") } },
      update: { isActive: true, isClosed: false, name: `Daily Menu - ${dateStr}` },
      create: {
        chefId: CHEF_ID,
        date: new Date(dateStr + "T00:00:00.000Z"),
        name: `Daily Menu - ${dateStr}`,
        isActive: true,
        isClosed: false,
      },
    });

    // Delete existing items for this menu (clean slate)
    await prisma.menuItem.deleteMany({ where: { menuId: menu.id } });

    // Create items
    for (let i = 0; i < dayItems.length; i++) {
      const item = dayItems[i];
      // Try to match a category
      let categoryId: string | null = null;
      if (item.name.includes("Biryani") || item.name.includes("Rice") || item.name.includes("Pulao")) {
        categoryId = catMap.get("Rice & Biryani") || null;
      } else if (item.name.includes("Lassi") || item.name.includes("Chai")) {
        categoryId = catMap.get("Beverages") || null;
      } else if (item.name.includes("Gulab") || item.name.includes("Kheer") || item.name.includes("Halwa") || item.name.includes("Jalebi")) {
        categoryId = catMap.get("Desserts") || null;
      } else if (item.name.includes("Naan") || item.name.includes("Roti") || item.name.includes("Paratha") || item.name.includes("Chapati") || item.name.includes("Bhature")) {
        categoryId = catMap.get("Breads") || null;
      } else if (item.name.includes("Bhaji") || item.name.includes("Papad") || item.name.includes("Salad") || item.name.includes("Raita")) {
        categoryId = catMap.get("Snacks & Starters") || null;
      } else if (item.isVeg) {
        categoryId = catMap.get("North Indian") || null;
      } else {
        categoryId = catMap.get("North Indian") || null;
      }

      await prisma.menuItem.create({
        data: {
          menuId: menu.id,
          name: item.name,
          description: item.desc,
          price: item.price,
          isVeg: item.isVeg,
          isAvailable: true,
          calories: item.calories,
          prepTime: item.prepTime,
          categoryId,
          stockCount: 20,
          eggOption: (item as any).eggOption || null,
          sortOrder: i,
        },
      });
    }
  }

  console.log("\nDone! Manisha's Kitchen has 7 days of menus with 42 items total.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
