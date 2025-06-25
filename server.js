const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Income = require('./src/models/Income');
const Expense = require('./src/models/Expense');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Could not connect to MongoDB:', err));

// Routes
// Get all income
app.get('/api/income', async (req, res) => {
  try {
    const income = await Income.find();
    res.json(income);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add new income
app.post('/api/income', async (req, res) => {
  const income = new Income({
    amount: req.body.amount,
    description: req.body.description,
    date: req.body.date,
    pocketId: req.body.pocketId
  });

  try {
    const newIncome = await income.save();
    res.status(201).json(newIncome);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all expenses
app.get('/api/expenses', async (req, res) => {
  try {
    const expenses = await Expense.find();
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add new expense
app.post('/api/expenses', async (req, res) => {
  const expense = new Expense({
    amount: req.body.amount,
    description: req.body.description,
    date: req.body.date,
    pocketId: req.body.pocketId
  });

  try {
    const newExpense = await expense.save();
    res.status(201).json(newExpense);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete income
app.delete('/api/income/:id', async (req, res) => {
  try {
    await Income.findByIdAndDelete(req.params.id);
    res.json({ message: 'Income deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete expense
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
