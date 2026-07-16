import Plan from '../models/Plan.js';

// @desc    Get all plans
// @route   GET /api/plans
// @access  Private
export const getPlans = async (req, res) => {
  try {
    const plans = await Plan.find({});
    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get active plans
// @route   GET /api/plans/active
// @access  Private/Public (Public checkin pages might need this too)
export const getActivePlans = async (req, res) => {
  try {
    const plans = await Plan.find({ isActive: true });
    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a plan
// @route   POST /api/plans
// @access  Private
export const createPlan = async (req, res) => {
  const { name, durationMonths, feeAmount, description } = req.body;

  try {
    const plan = new Plan({
      name,
      durationMonths: Number(durationMonths),
      feeAmount: Number(feeAmount),
      description,
    });

    const createdPlan = await plan.save();
    res.status(201).json(createdPlan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a plan
// @route   PUT /api/plans/:id
// @access  Private
export const updatePlan = async (req, res) => {
  const { name, durationMonths, feeAmount, description, isActive } = req.body;

  try {
    const plan = await Plan.findById(req.params.id);

    if (plan) {
      plan.name = name || plan.name;
      plan.durationMonths = durationMonths !== undefined ? Number(durationMonths) : plan.durationMonths;
      plan.feeAmount = feeAmount !== undefined ? Number(feeAmount) : plan.feeAmount;
      plan.description = description !== undefined ? description : plan.description;
      plan.isActive = isActive !== undefined ? isActive : plan.isActive;

      const updatedPlan = await plan.save();
      res.json(updatedPlan);
    } else {
      res.status(404).json({ message: 'Plan not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a plan
// @route   DELETE /api/plans/:id
// @access  Private
export const deletePlan = async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);

    if (plan) {
      await plan.deleteOne();
      res.json({ message: 'Plan removed' });
    } else {
      res.status(404).json({ message: 'Plan not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
