
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Income = require('./src/models/Income');
const Expense = require('./src/models/Expense');
const authController = require('./src/controllers/authController');
const auth = require('./src/middleware/auth');

const app = express();
app.use(cors());
app.use(express.json());

// Routes
const pocketRoutes = require('./src/routes/pockets');
const incomeRoutes = require('./src/routes/income');
const expenseRoutes = require('./src/routes/expenses');
app.use('/api/pockets', pocketRoutes);
app.use('/api/income', incomeRoutes);
app.use('/api/expenses', expenseRoutes);

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Could not connect to MongoDB:', err));

// Auth Routes
app.post('/api/auth/register', authController.register);
app.post('/api/auth/login', authController.login);

// Protected Routes - require authentication
app.use(['/api/income', '/api/expenses', '/api/pockets'], auth);
app.delete('/api/expenses/:id', async (req, res) => {
  try {
    await Expense.findByIdAndDelete(req.params.id);
    res.json({ message: 'Expense deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update income
app.put('/api/income/:id', async (req, res) => {
  try {
    const income = await Income.findById(req.params.id);
    if (income) {
      income.amount = req.body.amount || income.amount;
      income.description = req.body.description || income.description;
      income.date = req.body.date || income.date;
      income.pocketId = req.body.pocketId || income.pocketId;
      const updatedIncome = await income.save();
      res.json(updatedIncome);
    } else {
      res.status(404).json({ message: 'Income not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update expense
app.put('/api/expenses/:id', async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (expense) {
      expense.amount = req.body.amount || expense.amount;
      expense.description = req.body.description || expense.description;
      expense.date = req.body.date || expense.date;
      expense.pocketId = req.body.pocketId || expense.pocketId;
      const updatedExpense = await expense.save();
      res.json(updatedExpense);
    } else {
      res.status(404).json({ message: 'Expense not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server is running on port ${port}`));
