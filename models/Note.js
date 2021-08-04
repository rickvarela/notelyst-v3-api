const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
  _id: {
    type: String,
  },
  owner_id: {
    type: String,
    required: true,
  },
  editorState: {
    type: Object,
    required: true,
  },
});

module.exports = mongoose.model('Note', NoteSchema);
