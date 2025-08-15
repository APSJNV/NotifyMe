const express = require('express');
const Note = require('../models/Note');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// CREATE
router.post('/', verifyToken, async (req, res) => {
  try {
    const { subject, description } = req.body;
    if (!subject || !description) {
      return res.status(400).json({ error: 'Subject and description are required' });
    }
    const note = await Note.create({
      subject: subject.trim(),
      description: description.trim(),
      user: req.user.userId
    });
    res.status(201).json({ message: 'Note created', note });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ ALL
router.get('/', verifyToken, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.userId }).sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ ONE
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user.userId });
    if (!note) return res.status(404).json({ error: 'Note not found' });
    res.json(note);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { subject, description } = req.body;
    const updatedNote = await Note.findOneAndUpdate(
      { _id: req.params.id, user: req.user.userId },
      { subject, description },
      { new: true }
    );
    if (!updatedNote) return res.status(404).json({ error: 'Note not found' });
    res.json({ message: 'Note updated', note: updatedNote });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const deletedNote = await Note.findOneAndDelete({ _id: req.params.id, user: req.user.userId });
    if (!deletedNote) return res.status(404).json({ error: 'Note not found' });
    res.json({ message: 'Note deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// SEARCH
router.get('/search/:query', verifyToken, async (req, res) => {
  try {
    const notes = await Note.find({
      user: req.user.userId,
      $or: [
        { subject: { $regex: req.params.query, $options: 'i' } },
        { description: { $regex: req.params.query, $options: 'i' } }
      ]
    }).sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
