const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Smart Canteen Pro database...');

  // Clean existing data
  await prisma.stockMovement.deleteMany();
  await prisma.inventoryItem.deleteMany();
  await prisma.foodWasteRecord.deleteMany();
  await prisma.complaint.deleteMany();
  await prisma.feedback.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.loyaltyTransaction.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.category.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.canteenSetting.deleteMany();
  await prisma.user.deleteMany();

  // 1. Password hashes
  const studentPassword = await bcrypt.hash('Student@123', 10);
  const staffPassword = await bcrypt.hash('Staff@123', 10);
  const adminPassword = await bcrypt.hash('Admin@123', 10);

  // 2. Users
  const student1 = await prisma.user.create({
    data: {
      name: 'Yashraj Ghate',
      email: 'student@rscoe.edu',
      passwordHash: studentPassword,
      role: 'STUDENT',
      phone: '+91 98220 12345',
      studentId: 'RBT25CB042',
      department: 'CSBS',
      year: 'S.Y. B.Tech',
      loyaltyPoints: 160,
      favorites: '[]',
    },
  });

  const student2 = await prisma.user.create({
    data: {
      name: 'Piyush Lokhande',
      email: 'piyush@rscoe.edu',
      passwordHash: studentPassword,
      role: 'STUDENT',
      phone: '+91 98220 54321',
      studentId: 'RBT25CB043',
      department: 'CSBS',
      year: 'S.Y. B.Tech',
      loyaltyPoints: 90,
      favorites: '[]',
    },
  });

  const staff = await prisma.user.create({
    data: {
      name: 'Rameshwar (Kitchen Lead)',
      email: 'staff@canteen.rscoe.edu',
      passwordHash: staffPassword,
      role: 'STAFF',
      phone: '+91 94220 99887',
      department: 'Canteen Operations',
      year: 'Staff',
      loyaltyPoints: 0,
    },
  });

  const admin = await prisma.user.create({
    data: {
      name: 'Prof. Sharma (Canteen Admin)',
      email: 'admin@canteen.rscoe.edu',
      passwordHash: adminPassword,
      role: 'ADMIN',
      phone: '+91 98230 11223',
      department: 'Administration',
      year: 'Faculty',
      loyaltyPoints: 0,
    },
  });

  console.log('Created Users: Student, Staff, Admin');

  // 3. Categories (10 required categories)
  const categoriesData = [
    { name: 'Breakfast', slug: 'breakfast', description: 'Fresh morning meals and quick bites to start your day', icon: 'Sun', displayOrder: 1 },
    { name: 'Snacks', slug: 'snacks', description: 'Crispy, savory snacks perfect for tea and study breaks', icon: 'Cookie', displayOrder: 2 },
    { name: 'Main Course', slug: 'main-course', description: 'Wholesome hearty lunch and dinner plates', icon: 'Utensils', displayOrder: 3 },
    { name: 'South Indian', slug: 'south-indian', description: 'Authentic dosas, idlis, and vadas with fresh chutney and sambar', icon: 'Flame', displayOrder: 4 },
    { name: 'North Indian', slug: 'north-indian', description: 'Rich curries, paneer specials, and hot tandoori breads', icon: 'Soup', displayOrder: 5 },
    { name: 'Chinese', slug: 'chinese', description: 'Wok-tossed noodles, fried rice, and Indo-Chinese classics', icon: 'Boxes', displayOrder: 6 },
    { name: 'Beverages', slug: 'beverages', description: 'Fresh chai, cold brews, fruit coolers, and shakes', icon: 'Coffee', displayOrder: 7 },
    { name: 'Desserts', slug: 'desserts', description: 'Sweet treats, brownies, and ice cream scoops', icon: 'Cake', displayOrder: 8 },
    { name: 'Healthy Food', slug: 'healthy-food', description: 'Fresh salads, sprout bowls, and protein-packed choices', icon: 'Salad', displayOrder: 9 },
    { name: 'Combos and Meal Deals', slug: 'combos-meal-deals', description: 'Value-packed combo platters and student budget meals', icon: 'Sparkles', displayOrder: 10 },
  ];

  const categories = {};
  for (const cat of categoriesData) {
    categories[cat.slug] = await prisma.category.create({ data: cat });
  }
  console.log('Created 10 Categories');

  // 4. Menu Items
  const menuItemsData = [
    // Breakfast
    {
      name: 'Poha with Sev & Lemon',
      description: 'Traditional Maharashtrian flattened rice tossed with mustard seeds, turmeric, peanuts, and fresh coriander.',
      price: 30,
      imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80',
      categoryId: categories['breakfast'].id,
      isVeg: true,
      stockQuantity: 40,
      prepTimeMinutes: 5,
      ingredients: 'Poha, Peanuts, Mustard, Green Chili, Lemon, Sev',
      allergens: 'Peanuts',
      rating: 4.8,
      ratingCount: 35,
      isFeatured: true,
      isBestSeller: true,
      customizationOptions: JSON.stringify([
        { name: 'Spice Level', choices: ['Mild', 'Medium', 'Spicy'] },
        { name: 'Add-ons', choices: ['Extra Sev (+₹5)', 'Extra Lemon Slice (+₹0)'] }
      ]),
    },
    {
      name: 'Upma with Coconut Chutney',
      description: 'Roasted semolina cooked with seasoned vegetables, cashews, and served hot with freshly ground chutney.',
      price: 35,
      imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80',
      categoryId: categories['breakfast'].id,
      isVeg: true,
      stockQuantity: 30,
      prepTimeMinutes: 7,
      ingredients: 'Semolina, Mustard, Ginger, Curry Leaves, Coconut',
      allergens: 'Gluten, Tree Nuts',
      rating: 4.5,
      ratingCount: 22,
    },
    // Snacks
    {
      name: 'Samosa (2 pc)',
      description: 'Crisp golden pastry pockets stuffed with spiced potatoes and green peas, served with mint and tamarind chutneys.',
      price: 25,
      imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
      categoryId: categories['snacks'].id,
      isVeg: true,
      stockQuantity: 50,
      prepTimeMinutes: 5,
      ingredients: 'Refined Flour, Potatoes, Green Peas, Spices, Oil',
      allergens: 'Gluten',
      rating: 4.9,
      ratingCount: 88,
      isFeatured: true,
      isBestSeller: true,
      customizationOptions: JSON.stringify([
        { name: 'Chutney', choices: ['Mint & Tamarind', 'Only Mint', 'Only Tamarind'] },
        { name: 'Extra', choices: ['Fried Green Chili (+₹0)', 'Extra Chutney Cup (+₹5)'] }
      ]),
    },
    {
      name: 'Vada Pav (2 pc)',
      description: 'Mumbai style spicy potato fritters sandwiched in fresh pav with garlic dry chutney and fried green chillies.',
      price: 30,
      imageUrl: 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=600&auto=format&fit=crop&q=80',
      categoryId: categories['snacks'].id,
      isVeg: true,
      stockQuantity: 45,
      prepTimeMinutes: 5,
      ingredients: 'Potato, Besan, Pav, Garlic, Red Chili, Spices',
      allergens: 'Gluten',
      rating: 4.9,
      ratingCount: 110,
      isBestSeller: true,
    },
    // South Indian
    {
      name: 'Masala Dosa',
      description: 'Crisp fermented rice crepe spread with mild spiced potato bhaji, served with steaming sambar and coconut chutney.',
      price: 70,
      imageUrl: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&auto=format&fit=crop&q=80',
      categoryId: categories['south-indian'].id,
      isVeg: true,
      stockQuantity: 35,
      prepTimeMinutes: 12,
      ingredients: 'Rice, Urad Dal, Potato, Onions, Mustard, Coconut',
      allergens: 'None',
      rating: 4.8,
      ratingCount: 64,
      isFeatured: true,
      isBestSeller: true,
      customizationOptions: JSON.stringify([
        { name: 'Butter', choices: ['Regular', 'Extra Butter (+₹15)'] },
        { name: 'Style', choices: ['Normal Crisp', 'Extra Crispy'] }
      ]),
    },
    {
      name: 'Idli Vada Combo',
      description: 'Two fluffy steamed rice cakes paired with one crispy medu vada, served with traditional sambar and chutney.',
      price: 55,
      imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80',
      categoryId: categories['south-indian'].id,
      isVeg: true,
      stockQuantity: 40,
      prepTimeMinutes: 6,
      ingredients: 'Rice, Urad Dal, Curry Leaves, Black Pepper, Sambar Spices',
      allergens: 'None',
      rating: 4.7,
      ratingCount: 42,
    },
    // Main Course
    {
      name: 'Veg Dum Biryani',
      description: 'Fragrant basmati rice layered with garden vegetables, saffron milk, and aromatic spices cooked in handi dum style.',
      price: 110,
      imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80',
      categoryId: categories['main-course'].id,
      isVeg: true,
      stockQuantity: 25,
      prepTimeMinutes: 15,
      ingredients: 'Basmati Rice, Paneer, Beans, Carrots, Saffron, Spices',
      allergens: 'Dairy',
      rating: 4.9,
      ratingCount: 95,
      isFeatured: true,
      isBestSeller: true,
      customizationOptions: JSON.stringify([
        { name: 'Portion', choices: ['Regular', 'Large (+₹40)'] },
        { name: 'Accompaniment', choices: ['Cucumber Raita', 'Boondi Raita', 'Salan'] }
      ]),
    },
    {
      name: 'Pav Bhaji Plate',
      description: 'Spicy thick vegetable curry garnished with fresh butter and onions, served with two toasted butter pavs.',
      price: 80,
      imageUrl: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=600&auto=format&fit=crop&q=80',
      categoryId: categories['main-course'].id,
      isVeg: true,
      stockQuantity: 30,
      prepTimeMinutes: 10,
      ingredients: 'Potatoes, Cauliflower, Tomatoes, Capsicum, Butter, Pav',
      allergens: 'Dairy, Gluten',
      rating: 4.8,
      ratingCount: 71,
      customizationOptions: JSON.stringify([
        { name: 'Butter', choices: ['Standard Butter', 'Amul Butter Overflow (+₹20)'] },
        { name: 'Extra Pav', choices: ['None', '2 Extra Pav (+₹20)'] }
      ]),
    },
    // North Indian
    {
      name: 'Paneer Butter Masala with 2 Naan',
      description: 'Cubes of fresh cottage cheese simmered in a luscious creamy tomato and cashew nut gravy, paired with clay oven naans.',
      price: 130,
      imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop&q=80',
      categoryId: categories['north-indian'].id,
      isVeg: true,
      stockQuantity: 20,
      prepTimeMinutes: 15,
      ingredients: 'Paneer, Cashews, Cream, Tomatoes, Spices, Naan',
      allergens: 'Dairy, Nuts, Gluten',
      rating: 4.9,
      ratingCount: 54,
      isFeatured: true,
    },
    {
      name: 'Chole Bhature (2 Bhature)',
      description: 'Robust Punjabi chickpea masala served with oversized puffed golden bhaturas, pickled carrot, and onion rings.',
      price: 90,
      imageUrl: 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=600&auto=format&fit=crop&q=80',
      categoryId: categories['north-indian'].id,
      isVeg: true,
      stockQuantity: 28,
      prepTimeMinutes: 12,
      ingredients: 'Chickpeas, Refined Flour, Spices, Onion, Ginger',
      allergens: 'Gluten',
      rating: 4.8,
      ratingCount: 67,
    },
    // Chinese
    {
      name: 'Veg Hakka Noodles',
      description: 'Wok-tossed thin egg-free noodles with shredded cabbage, bell peppers, carrots, spring onions, and oriental sauces.',
      price: 85,
      imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&auto=format&fit=crop&q=80',
      categoryId: categories['chinese'].id,
      isVeg: true,
      stockQuantity: 30,
      prepTimeMinutes: 12,
      ingredients: 'Noodles, Cabbage, Bell Peppers, Soya Sauce, Vinegar',
      allergens: 'Gluten, Soy',
      rating: 4.6,
      ratingCount: 39,
      customizationOptions: JSON.stringify([
        { name: 'Spice Level', choices: ['Regular', 'Extra Spicy Schezwan (+₹10)'] },
        { name: 'Portion', choices: ['Full Plate', 'Half Plate (-₹25)'] }
      ]),
    },
    {
      name: 'Veg Schezwan Fried Rice',
      description: 'Fluffy long grain rice stir-fried in hot house-made Schezwan sauce with diced vegetables and crunchy spring onions.',
      price: 85,
      imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&auto=format&fit=crop&q=80',
      categoryId: categories['chinese'].id,
      isVeg: true,
      stockQuantity: 25,
      prepTimeMinutes: 12,
      ingredients: 'Rice, Schezwan Sauce, Garlic, French Beans, Carrots',
      allergens: 'Soy',
      rating: 4.7,
      ratingCount: 44,
    },
    // Beverages
    {
      name: 'Masala Chai',
      description: 'Slow-simmered Assam black tea brewed with fresh ginger, crushed green cardamom, cloves, and whole buffalo milk.',
      price: 20,
      imageUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600&auto=format&fit=crop&q=80',
      categoryId: categories['beverages'].id,
      isVeg: true,
      stockQuantity: 80,
      prepTimeMinutes: 4,
      ingredients: 'Assam Tea, Fresh Milk, Cardamom, Ginger, Sugar',
      allergens: 'Dairy',
      rating: 5.0,
      ratingCount: 140,
      isFeatured: true,
      isBestSeller: true,
      customizationOptions: JSON.stringify([
        { name: 'Sugar', choices: ['Regular Sugar', 'Less Sugar', 'No Sugar'] },
        { name: 'Flavor', choices: ['Adrak Cardamom', 'Strong Kadak'] }
      ]),
    },
    {
      name: 'Cold Coffee with Ice Cream',
      description: 'Rich blended espresso with chilled milk and topped with a scoop of vanilla ice cream and chocolate drizzle.',
      price: 55,
      imageUrl: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=600&auto=format&fit=crop&q=80',
      categoryId: categories['beverages'].id,
      isVeg: true,
      stockQuantity: 40,
      prepTimeMinutes: 5,
      ingredients: 'Coffee Beans, Whole Milk, Vanilla Ice Cream, Cocoa',
      allergens: 'Dairy',
      rating: 4.8,
      ratingCount: 82,
      isBestSeller: true,
    },
    {
      name: 'Fresh Lime Soda',
      description: 'Zesty hand-squeezed fresh lime juice topped with chilled sparkling club soda, black salt, and roasted cumin.',
      price: 35,
      imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80',
      categoryId: categories['beverages'].id,
      isVeg: true,
      stockQuantity: 50,
      prepTimeMinutes: 4,
      ingredients: 'Fresh Lime, Club Soda, Rock Salt, Mint',
      allergens: 'None',
      rating: 4.7,
      ratingCount: 31,
      customizationOptions: JSON.stringify([
        { name: 'Type', choices: ['Sweet & Salt', 'Only Sweet', 'Only Salted'] }
      ]),
    },
    // Desserts
    {
      name: 'Chocolate Brownie with Fudge',
      description: 'Decadent warm walnut fudge brownie made with 60% dark chocolate and topped with silky hot fudge sauce.',
      price: 45,
      imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop&q=80',
      categoryId: categories['desserts'].id,
      isVeg: true,
      stockQuantity: 25,
      prepTimeMinutes: 3,
      ingredients: 'Dark Chocolate, Cocoa, Flour, Butter, Walnuts',
      allergens: 'Dairy, Gluten, Nuts',
      rating: 4.9,
      ratingCount: 46,
      isFeatured: true,
      // Marking this as surplus for food waste demonstration!
      isSurplus: true,
      surplusDiscountPercent: 20,
      surplusExpiryTime: 'Today by 18:00',
      customizationOptions: JSON.stringify([
        { name: 'Serve', choices: ['Warm Heated', 'Room Temperature'] },
        { name: 'Topping', choices: ['Chocolate Drizzle', 'Vanilla Ice Cream Scoop (+₹20)'] }
      ]),
    },
    {
      name: 'Gulab Jamun (2 pc)',
      description: 'Soft milk solid dumplings fried to a deep golden brown and soaked in aromatic cardamom and rose syrup.',
      price: 35,
      imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
      categoryId: categories['desserts'].id,
      isVeg: true,
      stockQuantity: 35,
      prepTimeMinutes: 3,
      ingredients: 'Mawa, Flour, Rose Water, Cardamom, Sugar',
      allergens: 'Dairy, Gluten',
      rating: 4.8,
      ratingCount: 50,
    },
    // Healthy Food
    {
      name: 'Sprouted Moong Salad Bowl',
      description: 'Organic sprouted green moong beans tossed with crunchy cucumbers, ripe tomatoes, pomegranate, and lemon-mint dressing.',
      price: 50,
      imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80',
      categoryId: categories['healthy-food'].id,
      isVeg: true,
      stockQuantity: 20,
      prepTimeMinutes: 6,
      ingredients: 'Sprouted Moong, Pomegranate, Cucumber, Lemon, Rock Salt',
      allergens: 'None',
      rating: 4.7,
      ratingCount: 28,
      isFeatured: true,
    },
    {
      name: 'Fresh Fruit Chaat Bowl',
      description: 'Seasonal diced fruits including papaya, apple, banana, and pineapple sprinkled with chaat masala and lemon.',
      price: 55,
      imageUrl: 'https://images.unsplash.com/photo-1490474418585-fb9adc8fd0e0?w=600&auto=format&fit=crop&q=80',
      categoryId: categories['healthy-food'].id,
      isVeg: true,
      stockQuantity: 20,
      prepTimeMinutes: 5,
      ingredients: 'Papaya, Apple, Banana, Pineapple, Chaat Masala',
      allergens: 'None',
      rating: 4.6,
      ratingCount: 19,
    },
    // Combos and Meal Deals
    {
      name: 'Student Deluxe Thali Combo',
      description: 'Complete lunch platter with Paneer Sabji, Dal Tadka, Jeera Rice, 3 Butter Rotis, Gulab Jamun, Salad & Papad.',
      price: 140,
      imageUrl: 'https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?w=600&auto=format&fit=crop&q=80',
      categoryId: categories['combos-meal-deals'].id,
      isVeg: true,
      stockQuantity: 25,
      prepTimeMinutes: 15,
      ingredients: 'Paneer, Dal, Basmati Rice, Wheat Flour, Gulab Jamun, Papad',
      allergens: 'Dairy, Gluten',
      rating: 4.9,
      ratingCount: 112,
      isFeatured: true,
      isBestSeller: true,
    },
    {
      name: 'Snack Break Combo (2 Samosa + Masala Chai)',
      description: 'The quintessential college snack deal: two hot crispy samosas with sweet and spicy chutney paired with cutting masala chai.',
      price: 40,
      imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
      categoryId: categories['combos-meal-deals'].id,
      isVeg: true,
      stockQuantity: 40,
      prepTimeMinutes: 6,
      ingredients: 'Samosas, Assam Chai, Spices, Mint Chutney',
      allergens: 'Gluten, Dairy',
      rating: 5.0,
      ratingCount: 150,
      isFeatured: true,
      isBestSeller: true,
    },
  ];

  const createdMenuItems = [];
  for (const item of menuItemsData) {
    const created = await prisma.menuItem.create({ data: item });
    createdMenuItems.push(created);
  }
  console.log(`Created ${createdMenuItems.length} Menu Items across all 10 categories`);

  // 5. Coupons
  const couponsData = [
    {
      code: 'WELCOME20',
      description: '20% off on your order up to ₹50 for students',
      discountType: 'PERCENTAGE',
      discountValue: 20,
      minOrderAmount: 100,
      maxDiscount: 50,
      validUntil: new Date('2027-12-31'),
      usageLimit: 500,
      timesUsed: 14,
      isActive: true,
    },
    {
      code: 'HUNGRY50',
      description: 'Flat ₹50 off on orders above ₹200',
      discountType: 'FLAT',
      discountValue: 50,
      minOrderAmount: 200,
      maxDiscount: 50,
      validUntil: new Date('2027-12-31'),
      usageLimit: 200,
      timesUsed: 22,
      isActive: true,
    },
    {
      code: 'CHAI10',
      description: 'Flat ₹10 off on beverage orders above ₹30',
      discountType: 'FLAT',
      discountValue: 10,
      minOrderAmount: 30,
      maxDiscount: 10,
      validUntil: new Date('2027-12-31'),
      usageLimit: 300,
      timesUsed: 40,
      isActive: true,
    },
    {
      code: 'EXPIRED10',
      description: 'Expired promo for test handling',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      minOrderAmount: 50,
      maxDiscount: 20,
      validUntil: new Date('2025-01-01'), // Already expired
      usageLimit: 50,
      timesUsed: 50,
      isActive: false,
    },
  ];

  for (const coup of couponsData) {
    await prisma.coupon.create({ data: coup });
  }
  console.log('Created Coupons');

  // 6. Inventory Items
  const inventoryData = [
    { name: 'Basmati Rice', category: 'Groceries', currentStock: 45, unit: 'kg', minThreshold: 15, supplierName: 'Pune Agro Wholesale', supplierPhone: '+91 98901 22334', costPerUnit: 85, expiryDate: new Date('2027-06-30') },
    { name: 'Fresh Paneer', category: 'Dairy', currentStock: 18, unit: 'kg', minThreshold: 8, supplierName: 'Katraj Dairy Cooperative', supplierPhone: '+91 98223 44556', costPerUnit: 340, expiryDate: new Date('2026-10-28') },
    { name: 'Amul Taaza Milk', category: 'Dairy', currentStock: 60, unit: 'liters', minThreshold: 20, supplierName: 'Katraj Dairy Cooperative', supplierPhone: '+91 98223 44556', costPerUnit: 58, expiryDate: new Date('2026-10-26') },
    { name: 'Assam Tea Leaves', category: 'Beverages', currentStock: 12, unit: 'kg', minThreshold: 5, supplierName: 'Wagh Bakri Distributors', supplierPhone: '+91 98500 77889', costPerUnit: 420, expiryDate: new Date('2027-10-15') },
    { name: 'Potatoes (Batata)', category: 'Vegetables', currentStock: 80, unit: 'kg', minThreshold: 25, supplierName: 'Market Yard Pune', supplierPhone: '+91 97654 32100', costPerUnit: 28, expiryDate: new Date('2026-11-10') },
    { name: 'Onions', category: 'Vegetables', currentStock: 50, unit: 'kg', minThreshold: 20, supplierName: 'Market Yard Pune', supplierPhone: '+91 97654 32100', costPerUnit: 35, expiryDate: new Date('2026-11-15') },
    { name: 'Refined Sunflower Oil', category: 'Groceries', currentStock: 40, unit: 'liters', minThreshold: 15, supplierName: 'Fortune Agro', supplierPhone: '+91 99221 66554', costPerUnit: 130, expiryDate: new Date('2027-04-10') },
    { name: 'Pav Loaves (Packets of 12)', category: 'Bakery', currentStock: 35, unit: 'packets', minThreshold: 10, supplierName: 'Modern Bread Pune', supplierPhone: '+91 98224 88776', costPerUnit: 35, expiryDate: new Date('2026-10-25') },
    { name: 'Dark Chocolate Chips', category: 'Bakery', currentStock: 8, unit: 'kg', minThreshold: 4, supplierName: 'Baker Supplies Co', supplierPhone: '+91 98600 33221', costPerUnit: 520, expiryDate: new Date('2027-02-28') },
  ];

  for (const inv of inventoryData) {
    const createdInv = await prisma.inventoryItem.create({ data: inv });
    await prisma.stockMovement.create({
      data: {
        inventoryItemId: createdInv.id,
        changeType: 'RESTOCK',
        quantity: inv.currentStock,
        reason: 'Initial weekly batch intake',
        recordedBy: 'Rameshwar',
      }
    });
  }
  console.log('Created Inventory Items & Initial Movements');

  // 7. Food Waste Records (demonstrating waste tracking & sustainability)
  await prisma.foodWasteRecord.createMany({
    data: [
      { itemName: 'Boiled Potatoes', quantity: 2.5, unit: 'kg', estimatedValue: 70, reason: 'Overprepared for breakfast service', recordedBy: 'Rameshwar' },
      { itemName: 'Cooked Rice', quantity: 1.8, unit: 'kg', estimatedValue: 120, reason: 'End of day surplus', recordedBy: 'Rameshwar' },
      { itemName: 'Pav Bread', quantity: 4.0, unit: 'packets', estimatedValue: 140, reason: 'Passed freshness limit', recordedBy: 'Rameshwar' },
    ]
  });

  // 8. Canteen Settings
  const settingsData = [
    { key: 'canteen_name', value: 'Smart Canteen Pro - RSCOE' },
    { key: 'opening_time', value: '08:00' },
    { key: 'closing_time', value: '20:00' },
    { key: 'max_orders_per_slot', value: '30' },
    { key: 'crowd_status', value: 'MODERATE' }, // LOW, MODERATE, BUSY
    { key: 'tax_rate_percent', value: '5' }, // 5% GST
    { key: 'loyalty_earn_rate', value: '10' }, // 1 point per 10 rupees
    { key: 'loyalty_point_value', value: '0.50' }, // 1 point = 0.50 rupees
  ];

  for (const s of settingsData) {
    await prisma.canteenSetting.create({ data: s });
  }

  // 9. Historical Orders (Matching the downloaded CSV sales report for consistency)
  const chaiItem = createdMenuItems.find(i => i.name === 'Masala Chai');
  const samosaItem = createdMenuItems.find(i => i.name === 'Samosa (2 pc)');
  const biryaniItem = createdMenuItems.find(i => i.name === 'Veg Dum Biryani');
  const coffeeItem = createdMenuItems.find(i => i.name === 'Cold Coffee with Ice Cream');
  const sodaItem = createdMenuItems.find(i => i.name === 'Fresh Lime Soda');
  const idliItem = createdMenuItems.find(i => i.name === 'Idli Vada Combo');
  const brownieItem = createdMenuItems.find(i => i.name === 'Chocolate Brownie with Fudge');
  const dosaItem = createdMenuItems.find(i => i.name === 'Masala Dosa');

  // Past completed orders
  const pastOrder1 = await prisma.order.create({
    data: {
      orderNumber: 'ORD-20261014-001',
      tokenNumber: 'SC-1001',
      userId: student1.id,
      status: 'COLLECTED',
      subtotal: 170,
      discountAmount: 0,
      taxAmount: 0,
      totalAmount: 170,
      paymentMethod: 'DEMO_UPI',
      paymentStatus: 'PAID',
      pickupSlot: 'Immediate (10-15 mins)',
      qrCodeData: 'SCP-VERIFY:ORD-20261014-001:SC-1001:PAID',
      placedAt: new Date('2026-10-14T10:15:00Z'),
      confirmedAt: new Date('2026-10-14T10:16:00Z'),
      preparingAt: new Date('2026-10-14T10:18:00Z'),
      readyAt: new Date('2026-10-14T10:26:00Z'),
      collectedAt: new Date('2026-10-14T10:29:00Z'),
      verifiedByStaffId: staff.id,
      items: {
        create: [
          { menuItemId: biryaniItem.id, itemName: biryaniItem.name, itemPrice: 110, quantity: 1, lineTotal: 110 },
          { menuItemId: chaiItem.id, itemName: chaiItem.name, itemPrice: 20, quantity: 3, lineTotal: 60 },
        ]
      }
    }
  });

  const pastOrder2 = await prisma.order.create({
    data: {
      orderNumber: 'ORD-20261015-002',
      tokenNumber: 'SC-1002',
      userId: student2.id,
      status: 'COLLECTED',
      subtotal: 145,
      discountAmount: 0,
      taxAmount: 0,
      totalAmount: 145,
      paymentMethod: 'CASH_ON_PICKUP',
      paymentStatus: 'PAID',
      pickupSlot: '13:00 - 13:15',
      qrCodeData: 'SCP-VERIFY:ORD-20261015-002:SC-1002:PAID',
      placedAt: new Date('2026-10-15T12:45:00Z'),
      confirmedAt: new Date('2026-10-15T12:46:00Z'),
      preparingAt: new Date('2026-10-15T12:50:00Z'),
      readyAt: new Date('2026-10-15T13:02:00Z'),
      collectedAt: new Date('2026-10-15T13:08:00Z'),
      verifiedByStaffId: staff.id,
      items: {
        create: [
          { menuItemId: dosaItem.id, itemName: dosaItem.name, itemPrice: 70, quantity: 1, lineTotal: 70 },
          { menuItemId: samosaItem.id, itemName: samosaItem.name, itemPrice: 25, quantity: 2, lineTotal: 50 },
          { menuItemId: chaiItem.id, itemName: chaiItem.name, itemPrice: 20, quantity: 1, lineTotal: 25 }, // adjusted
        ]
      }
    }
  });

  // Active Live Order 1: READY for staff scanner demo!
  const liveOrderReady = await prisma.order.create({
    data: {
      orderNumber: 'ORD-20261023-008',
      tokenNumber: 'SC-1008',
      userId: student1.id,
      status: 'READY',
      subtotal: 105,
      discountAmount: 0,
      taxAmount: 0,
      totalAmount: 105,
      paymentMethod: 'DEMO_UPI',
      paymentStatus: 'PAID',
      pickupSlot: 'Immediate (10-15 mins)',
      specialInstructions: 'Make the chai extra ginger kadak please!',
      qrCodeData: 'SCP-VERIFY:ORD-20261023-008:SC-1008:PAID',
      placedAt: new Date(Date.now() - 15 * 60 * 1000),
      confirmedAt: new Date(Date.now() - 14 * 60 * 1000),
      preparingAt: new Date(Date.now() - 12 * 60 * 1000),
      readyAt: new Date(Date.now() - 2 * 60 * 1000),
      items: {
        create: [
          { menuItemId: samosaItem.id, itemName: samosaItem.name, itemPrice: 25, quantity: 2, lineTotal: 50 },
          { menuItemId: coffeeItem.id, itemName: coffeeItem.name, itemPrice: 55, quantity: 1, lineTotal: 55 },
        ]
      }
    }
  });

  // Active Live Order 2: PREPARING for kitchen board demo!
  const liveOrderPreparing = await prisma.order.create({
    data: {
      orderNumber: 'ORD-20261023-009',
      tokenNumber: 'SC-1009',
      userId: student2.id,
      status: 'PREPARING',
      subtotal: 110,
      discountAmount: 0,
      taxAmount: 0,
      totalAmount: 110,
      paymentMethod: 'CAMPUS_CARD',
      paymentStatus: 'PAID',
      pickupSlot: 'Immediate (10-15 mins)',
      qrCodeData: 'SCP-VERIFY:ORD-20261023-009:SC-1009:PAID',
      placedAt: new Date(Date.now() - 8 * 60 * 1000),
      confirmedAt: new Date(Date.now() - 7 * 60 * 1000),
      preparingAt: new Date(Date.now() - 5 * 60 * 1000),
      items: {
        create: [
          { menuItemId: biryaniItem.id, itemName: biryaniItem.name, itemPrice: 110, quantity: 1, lineTotal: 110 },
        ]
      }
    }
  });

  // Active Live Order 3: PLACED for staff accept/reject demo!
  const liveOrderPlaced = await prisma.order.create({
    data: {
      orderNumber: 'ORD-20261023-010',
      tokenNumber: 'SC-1010',
      userId: student1.id,
      status: 'PLACED',
      subtotal: 125,
      discountAmount: 20,
      couponCode: 'WELCOME20',
      taxAmount: 0,
      totalAmount: 105,
      paymentMethod: 'DEMO_UPI',
      paymentStatus: 'PAID',
      pickupSlot: 'Scheduled: 16:30',
      specialInstructions: 'Pack in paper bag',
      qrCodeData: 'SCP-VERIFY:ORD-20261023-010:SC-1010:PAID',
      placedAt: new Date(Date.now() - 2 * 60 * 1000),
      items: {
        create: [
          { menuItemId: dosaItem.id, itemName: dosaItem.name, itemPrice: 70, quantity: 1, lineTotal: 70 },
          { menuItemId: idliItem.id, itemName: idliItem.name, itemPrice: 55, quantity: 1, lineTotal: 55 },
        ]
      }
    }
  });

  // 10. Loyalty Transactions
  await prisma.loyaltyTransaction.createMany({
    data: [
      { userId: student1.id, orderId: pastOrder1.id, points: 17, type: 'EARNED', description: 'Points earned for Order ORD-20261014-001' },
      { userId: student1.id, points: 100, type: 'BONUS', description: 'Welcome College Student Reward' },
      { userId: student2.id, orderId: pastOrder2.id, points: 14, type: 'EARNED', description: 'Points earned for Order ORD-20261015-002' },
      { userId: student2.id, points: 50, type: 'BONUS', description: 'Campus Sign-up Perk' },
    ]
  });

  // 11. Notifications
  await prisma.notification.createMany({
    data: [
      { userId: student1.id, title: 'Order Ready for Pickup! 🔔', message: 'Your token SC-1008 is freshly prepared and ready at Counter 1.', type: 'ORDER_STATUS', link: '/orders' },
      { userId: student1.id, title: 'Flash Surplus Deal 🌿', message: 'Chocolate Brownies are now 20% off to minimize food waste before closing!', type: 'PROMOTION', link: '/menu' },
      { userId: student2.id, title: 'Order Confirmed', message: 'Your Veg Biryani is currently being prepared in the kitchen.', type: 'ORDER_STATUS', link: '/orders' },
    ]
  });

  // 12. Feedback & Complaint
  await prisma.feedback.create({
    data: {
      userId: student1.id,
      orderId: pastOrder1.id,
      rating: 5,
      category: 'Food Quality',
      comments: 'The Veg Biryani was delicious and served piping hot! Token pickup was smooth with zero wait time.',
    }
  });

  await prisma.complaint.create({
    data: {
      ticketNumber: 'CMP-2026-101',
      userId: student2.id,
      orderId: pastOrder2.id,
      subject: 'Chutney quantity was low',
      description: 'The Masala Dosa tasted great, but only a tiny cup of coconut chutney was provided.',
      status: 'RESOLVED',
      adminResponse: 'Thank you for the feedback, Piyush! We have instructed the South Indian counter to provide complimentary refill cups.',
      resolvedAt: new Date('2026-10-16T14:00:00Z'),
    }
  });

  // 13. Audit Log
  await prisma.auditLog.createMany({
    data: [
      { userId: admin.id, action: 'SYSTEM_BOOT', details: 'Smart Canteen Pro initialized with 10 categories and initial menu.' },
      { userId: staff.id, action: 'ORDER_READY', details: 'Marked token SC-1008 as ready for pickup at Counter 1.' },
    ]
  });

  console.log('Database seeded successfully with all required demonstration records!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
