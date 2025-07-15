const Expense = require('../models/Expense');

// Get all expenses
exports.getAllExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.user._id }).sort({ date: -1 });
    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching expenses' });
  }
};

// Create new expense
exports.createExpense = async (req, res) => {
  try {
    const { amount, description, date, pocketId } = req.body;
    const newExpense = new Expense({
      amount,
      description,
      date,
      pocketId,
      userId: req.user._id,
      createdByEmail: req.user.email
    });
    const savedExpense = await newExpense.save();
    res.status(201).json(savedExpense);
  } catch (error) {
    res.status(500).json({ error: 'Error creating expense' });
  }
};

// Get expense by ID
exports.getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    res.status(200).json(expense);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching expense' });
  }
};

// Update expense
exports.updateExpense = async (req, res) => {
  try {
    const { amount, description, date, pocketId } = req.body;
    const updatedExpense = await Expense.findByIdAndUpdate(
      req.params.id,
      {
        amount,
        description,
        date,
        pocketId
      },
      { new: true }
    );
    if (!updatedExpense) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    res.status(200).json(updatedExpense);
  } catch (error) {
    res.status(500).json({ error: 'Error updating expense' });
  }
};

// Delete expense
exports.deleteExpense = async (req, res) => {
  try {
    const deletedExpense = await Expense.findByIdAndDelete(req.params.id);
    if (!deletedExpense) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    res.status(200).json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting expense' });
  }
};