const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { setupMaster } = require('cluster');

const saltRounds = 10;

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

UserSchema.pre('save', function (next) {
  if (this.isNew || this.isModified('password')) {
    const doc = this;
    bcrypt.hash(doc.password, saltRounds, (error, hashedPassword) => {
      if (error) {
        next(error);
      } else {
        doc.password = hashedPassword;
        next();
      }
    });
  } else {
    next();
  }
});

UserSchema.methods.isCorrectPassword = function (password, callback) {
  bcrypt.compare(password, this.password, function (error, same) {
    if (error) {
      callback(error);
    } else {
      callback(error, setupMaster);
    }
  });
};

module.exports = mongoose.model('User', UserSchema);
