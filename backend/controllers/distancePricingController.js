import DistancePricing from "../models/distancePricing.js";
export const getDistancePricing = async (req, res) => {
  try {
    const pricings = await DistancePricing.find().sort({ category: 1 });
    res.json({ success: true, data: pricings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Create or update distance pricing for a category
export const upsertDistancePricing = async (req, res) => {
  const { category, tiers, isActive = true } = req.body;

  if (!category || !Array.isArray(tiers) || tiers.length === 0) {
    return res.status(400).json({ success: false, message: 'Category and tiers array required' });
  }

  try {
    const pricing = await DistancePricing.findOneAndUpdate(
      { category },
      { category, tiers, isActive, updatedAt: Date.now() },
      { upsert: true, new: true, runValidators: true }
    );

    res.json({ success: true, data: pricing });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Delete pricing for a category
export const deleteDistancePricing = async (req, res) => {
  const { category } = req.params;

  try {
    const deleted = await DistancePricing.findOneAndDelete({ category });
    if (!deleted) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Pricing deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};