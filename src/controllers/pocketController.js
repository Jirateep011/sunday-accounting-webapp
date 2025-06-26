const Pocket = require('../models/Pocket');
const User = require('../models/User');

const defaultPockets = [
  { name: 'เงินเดือน', type: 'income', icon: '💰' },
  { name: 'โบนัส', type: 'income', icon: '🎁' },
  { name: 'รายได้พิเศษ', type: 'income', icon: '💵' },
  { name: 'อาหาร', type: 'expense', icon: '🍽️' },
  { name: 'การเดินทาง', type: 'expense', icon: '🚗' },
  { name: 'ที่พัก', type: 'expense', icon: '🏠' },
  { name: 'สาธารณูปโภค', type: 'expense', icon: '💡' },
  { name: 'ความบันเทิง', type: 'expense', icon: '🎮' }
];

exports.createPocket = async (req, res) => {
  try {
    const { name, type, icon } = req.body;
    const user = await User.findById(req.user._id);
    
    const pocket = new Pocket({
      name,
      type,
      icon,
      userId: req.user._id,
      createdByEmail: user.email
    });
    await pocket.save();
    res.status(201).json(pocket);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPockets = async (req, res) => {
  try {
    const { email } = req.query;
    let query = { userId: req.user._id };
    
    // Add email filter if provided
    if (email) {
      query.createdByEmail = email;
    }
    
    let pockets = await Pocket.find(query);

    // ถ้าไม่มี pockets ให้สร้าง default pockets
    if (pockets.length === 0) {
      const user = await User.findById(req.user._id);
      const defaultPocketsWithUser = defaultPockets.map(pocket => ({
        ...pocket,
        userId: req.user._id,
        createdByEmail: user.email
      }));
      
      pockets = await Pocket.insertMany(defaultPocketsWithUser);
    }

    res.json(pockets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updatePocket = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, icon } = req.body;
    const pocket = await Pocket.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      { name, icon },
      { new: true }
    );
    if (!pocket) {
      return res.status(404).json({ error: 'Pocket not found' });
    }
    res.json(pocket);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deletePocket = async (req, res) => {
  try {
    const { id } = req.params;
    const pocket = await Pocket.findOneAndDelete({ _id: id, userId: req.user._id });
    if (!pocket) {
      return res.status(404).json({ error: 'Pocket not found' });
    }
    res.json({ message: 'Pocket deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
