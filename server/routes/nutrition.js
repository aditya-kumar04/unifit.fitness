const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');

// Food database (in production, this would be a proper database)
const FOOD_DATABASE = {
  // Proteins
  'chicken breast': { name: 'Chicken Breast (100g)', cal: 165, p: 31, c: 0, f: 3.6, category: 'protein' },
  'chicken': { name: 'Chicken Breast (150g)', cal: 200, p: 38, c: 0, f: 5, category: 'protein' },
  'egg': { name: 'Boiled Eggs (2)', cal: 156, p: 13, c: 1, f: 11, category: 'protein' },
  'whey protein': { name: 'Whey Protein Shake', cal: 150, p: 30, c: 5, f: 2, category: 'protein' },
  'protein': { name: 'Whey Protein Shake', cal: 150, p: 30, c: 5, f: 2, category: 'protein' },
  'dal': { name: 'Dal (1 bowl)', cal: 180, p: 12, c: 30, f: 2, category: 'protein' },
  'paneer': { name: 'Paneer (100g)', cal: 265, p: 18, c: 2.5, f: 21, category: 'protein' },
  'fish': { name: 'Fish Fillet (100g)', cal: 206, p: 22, c: 0, f: 12, category: 'protein' },
  'tikka': { name: 'Chicken Tikka (200g)', cal: 336, p: 40, c: 10, f: 15, category: 'protein' },
  
  // Carbs
  'rice': { name: 'Steamed Rice (1 cup)', cal: 206, p: 4, c: 45, f: 0, category: 'carbs' },
  'roti': { name: 'Wheat Roti (2 pcs)', cal: 160, p: 5, c: 33, f: 2, category: 'carbs' },
  'oats': { name: 'Oats (70g)', cal: 250, p: 9, c: 45, f: 5, category: 'carbs' },
  'banana': { name: 'Banana (1 medium)', cal: 105, p: 1, c: 27, f: 0, category: 'carbs' },
  'toast': { name: 'Brown Toast (2 slices)', cal: 140, p: 5, c: 26, f: 2, category: 'carbs' },
  'bread': { name: 'Brown Toast (2 slices)', cal: 140, p: 5, c: 26, f: 2, category: 'carbs' },
  'potato': { name: 'Potato (100g)', cal: 77, p: 2, c: 17, f: 0.1, category: 'carbs' },
  'sweet potato': { name: 'Sweet Potato (100g)', cal: 86, p: 1.6, c: 20, f: 0.1, category: 'carbs' },
  
  // Fats
  'almonds': { name: 'Almonds (30g)', cal: 174, p: 6, c: 6, f: 15, category: 'fats' },
  'peanut butter': { name: 'Peanut Butter (1 tbsp)', cal: 94, p: 4, c: 3, f: 8, category: 'fats' },
  'avocado': { name: 'Avocado (100g)', cal: 160, p: 2, c: 9, f: 15, category: 'fats' },
  'olive oil': { name: 'Olive Oil (1 tbsp)', cal: 119, p: 0, c: 0, f: 14, category: 'fats' },
  
  // Dairy
  'milk': { name: 'Milk (250ml)', cal: 150, p: 8, c: 12, f: 8, category: 'dairy' },
  'yogurt': { name: 'Greek Yogurt (150g)', cal: 100, p: 17, c: 6, f: 0, category: 'dairy' },
  'cheese': { name: 'Cottage Cheese (100g)', cal: 82, p: 11, c: 3, f: 2, category: 'dairy' },
  
  // Vegetables
  'broccoli': { name: 'Broccoli (100g)', cal: 34, p: 2.8, c: 7, f: 0.4, category: 'vegetables' },
  'spinach': { name: 'Spinach (100g)', cal: 23, p: 2.9, c: 3.6, f: 0.4, category: 'vegetables' },
  'tomato': { name: 'Tomato (100g)', cal: 18, p: 0.9, c: 3.9, f: 0.2, category: 'vegetables' },
  
  // Common Indian dishes
  'biryani': { name: 'Chicken Biryani (1 plate)', cal: 290, p: 15, c: 35, f: 12, category: 'meals' },
  'curry': { name: 'Chicken Curry (1 bowl)', cal: 220, p: 18, c: 12, f: 10, category: 'meals' },
  'sambar': { name: 'Sambar (1 bowl)', cal: 120, p: 4, c: 20, f: 3, category: 'meals' },
  'idli': { name: 'Idli (2 pcs)', cal: 156, p: 4, c: 30, f: 1, category: 'meals' },
  'dosa': { name: 'Masala Dosa (1)', cal: 240, p: 6, c: 38, f: 8, category: 'meals' }
};

// Search food database
router.get('/foods', authenticate, async (req, res) => {
  try {
    const { q, category } = req.query;
    let foods = Object.values(FOOD_DATABASE);
    
    if (q) {
      const query = q.toLowerCase();
      foods = foods.filter(food => 
        food.name.toLowerCase().includes(query) ||
        food.category.toLowerCase().includes(query)
      );
    }
    
    if (category) {
      foods = foods.filter(food => food.category === category);
    }
    
    // Limit results
    const limit = parseInt(req.query.limit) || 20;
    foods = foods.slice(0, limit);
    
    res.json({
      foods,
      categories: [...new Set(Object.values(FOOD_DATABASE).map(f => f.category))]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get daily nutrition
router.get('/daily', authenticate, async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
    const endOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate() + 1);
    
    const user = await User.findById(req.user._id);
    
    // Get meals for the specified date
    const dailyMeals = user.nutrition?.meals?.filter(meal => {
      const mealDate = new Date(meal.date);
      return mealDate >= startOfDay && mealDate < endOfDay;
    }) || [];
    
    // Calculate totals
    const totals = dailyMeals.reduce((acc, meal) => {
      acc.cal += meal.cal || 0;
      acc.p += meal.p || 0;
      acc.c += meal.c || 0;
      acc.f += meal.f || 0;
      return acc;
    }, { cal: 0, p: 0, c: 0, f: 0 });
    
    // Get water intake
    const waterIntake = user.nutrition?.waterIntake?.filter(water => {
      const waterDate = new Date(water.date);
      return waterDate >= startOfDay && waterDate < endOfDay;
    }) || [];
    
    res.json({
      date: startOfDay.toISOString().split('T')[0],
      meals: dailyMeals,
      totals,
      waterIntake: waterIntake.length,
      goals: user.nutrition?.goals || { cal: 2000, p: 150, c: 250, f: 65 }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Log meal
router.post('/meals', authenticate, [
  body('name').notEmpty().trim().withMessage('Meal name is required'),
  body('cal').isNumeric().withMessage('Calories must be a number'),
  body('p').isNumeric().withMessage('Protein must be a number'),
  body('c').isNumeric().withMessage('Carbs must be a number'),
  body('f').isNumeric().withMessage('Fat must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { name, cal, p, c, f, type = 'custom' } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user.nutrition) {
      user.nutrition = { meals: [], waterIntake: [], goals: {} };
    }
    
    const meal = {
      name,
      cal: parseFloat(cal),
      p: parseFloat(p),
      c: parseFloat(c),
      f: parseFloat(f),
      type,
      date: new Date()
    };
    
    user.nutrition.meals.push(meal);
    await user.save();
    
    res.status(201).json({
      message: 'Meal logged successfully',
      meal
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update water intake
router.post('/water', authenticate, [
  body('glasses').isInt({ min: 1, max: 20 }).withMessage('Glasses must be between 1 and 20')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { glasses } = req.body;
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    const user = await User.findById(req.user._id);
    if (!user.nutrition) {
      user.nutrition = { meals: [], waterIntake: [], goals: {} };
    }
    
    // Remove existing water entries for today and add new ones
    user.nutrition.waterIntake = user.nutrition.waterIntake.filter(water => {
      const waterDate = new Date(water.date);
      return waterDate < startOfDay;
    });
    
    // Add new water entries
    for (let i = 0; i < glasses; i++) {
      user.nutrition.waterIntake.push({
        date: new Date(),
        glass: i + 1
      });
    }
    
    await user.save();
    
    res.json({
      message: 'Water intake updated successfully',
      glasses
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get nutrition goals
router.get('/goals', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const goals = user.nutrition?.goals || { cal: 2000, p: 150, c: 250, f: 65 };
    
    res.json({ goals });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update nutrition goals
router.put('/goals', authenticate, [
  body('cal').isNumeric().withMessage('Calories goal must be a number'),
  body('p').isNumeric().withMessage('Protein goal must be a number'),
  body('c').isNumeric().withMessage('Carbs goal must be a number'),
  body('f').isNumeric().withMessage('Fat goal must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { cal, p, c, f } = req.body;
    
    await User.findByIdAndUpdate(req.user._id, {
      'nutrition.goals': {
        cal: parseFloat(cal),
        p: parseFloat(p),
        c: parseFloat(c),
        f: parseFloat(f)
      }
    });
    
    res.json({
      message: 'Nutrition goals updated successfully',
      goals: { cal, p, c, f }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get nutrition analytics
router.get('/analytics', authenticate, async (req, res) => {
  try {
    const { period = 'week' } = req.query;
    const user = await User.findById(req.user._id);
    
    let startDate;
    const endDate = new Date();
    
    switch (period) {
      case 'week':
        startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(endDate.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
    
    const meals = user.nutrition?.meals?.filter(meal => 
      new Date(meal.date) >= startDate && new Date(meal.date) <= endDate
    ) || [];
    
    // Calculate daily averages
    const dailyTotals = {};
    meals.forEach(meal => {
      const day = new Date(meal.date).toISOString().split('T')[0];
      if (!dailyTotals[day]) {
        dailyTotals[day] = { cal: 0, p: 0, c: 0, f: 0, meals: 0 };
      }
      dailyTotals[day].cal += meal.cal;
      dailyTotals[day].p += meal.p;
      dailyTotals[day].c += meal.c;
      dailyTotals[day].f += meal.f;
      dailyTotals[day].meals += 1;
    });
    
    const days = Object.keys(dailyTotals);
    const avgCalories = days.length > 0 ? days.reduce((sum, day) => sum + dailyTotals[day].cal, 0) / days.length : 0;
    const avgProtein = days.length > 0 ? days.reduce((sum, day) => sum + dailyTotals[day].p, 0) / days.length : 0;
    
    res.json({
      period,
      days: days.length,
      totalMeals: meals.length,
      dailyAverages: {
        calories: Math.round(avgCalories),
        protein: Math.round(avgProtein)
      },
      dailyBreakdown: dailyTotals,
      goals: user.nutrition?.goals || { cal: 2000, p: 150, c: 250, f: 65 }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
