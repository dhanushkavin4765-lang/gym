import Trainer from '../models/Trainer.js';

// @desc    Get all trainers
// @route   GET /api/trainers
// @access  Private
export const getTrainers = async (req, res) => {
  try {
    const trainers = await Trainer.find({});
    res.json(trainers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a trainer
// @route   POST /api/trainers
// @access  Private
export const createTrainer = async (req, res) => {
  const { fullName, specialization, mobile, email, salary, shift, photo } = req.body;

  try {
    const trainer = new Trainer({
      fullName,
      specialization,
      mobile,
      email,
      salary: Number(salary),
      shift,
      photo,
    });

    const createdTrainer = await trainer.save();
    res.status(201).json(createdTrainer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a trainer
// @route   PUT /api/trainers/:id
// @access  Private
export const updateTrainer = async (req, res) => {
  const { fullName, specialization, mobile, email, salary, shift, photo, isActive } = req.body;

  try {
    const trainer = await Trainer.findById(req.params.id);

    if (trainer) {
      trainer.fullName = fullName || trainer.fullName;
      trainer.specialization = specialization || trainer.specialization;
      trainer.mobile = mobile || trainer.mobile;
      trainer.email = email !== undefined ? email : trainer.email;
      trainer.salary = salary !== undefined ? Number(salary) : trainer.salary;
      trainer.shift = shift || trainer.shift;
      trainer.photo = photo !== undefined ? photo : trainer.photo;
      trainer.isActive = isActive !== undefined ? isActive : trainer.isActive;

      const updatedTrainer = await trainer.save();
      res.json(updatedTrainer);
    } else {
      res.status(404).json({ message: 'Trainer not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a trainer
// @route   DELETE /api/trainers/:id
// @access  Private
export const deleteTrainer = async (req, res) => {
  try {
    const trainer = await Trainer.findById(req.params.id);

    if (trainer) {
      await trainer.deleteOne();
      res.json({ message: 'Trainer removed successfully' });
    } else {
      res.status(404).json({ message: 'Trainer not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
