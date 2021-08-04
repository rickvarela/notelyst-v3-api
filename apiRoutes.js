const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Note = require('./models/Note');

const router = express.Router();

const withAuth = (req, res, next) => {
  const token = req.cookies.noteLystToken;
  if (!token) {
    res.status(401).send('Unauthorized: no token provided');
  } else {
    jwt.verify(token, process.env.SECRET, (error, decoded) => {
      if (error) {
        res.status(401).send('Unauthorized: invalid token');
      } else {
        res.locals.decoded = decoded;
        next();
      }
    });
  }
};

router.get('/checkauth', (req, res) => {
  const token = req.cookies.noteLystToken;
  jwt.verify(token, process.env.SECRET, (error, decoded) => {
    if (error) {
      res.status(200).json({
        authUser: null,
      });
    } else {
      res.status(200).json({
        authUser: {
          username: decoded.username,
          _id: decoded._id,
        },
      });
    }
  });
});

router.post('/delete', (req, res) => {
  res.clearCookie('noteLystToken');
  return res.sendStatus(200);
});

router.post('/signup', (req, res) => {
  const { username, email, password } = req.body;
  const _id = mongoose.Types.ObjectId();
  const user = new User({ _id, username, email, password });
  user.save((error) => {
    if (error) {
      res.status(500).send('Error registering');
    } else {
      const payload = {
        _id,
        username,
      };
      const token = jwt.sign(payload, process.env.SECRET, {
        expiresIn: '1h',
      });
      res
        .cookie('noteLystToken', token, {
          domain: 'rickvarela.com',
          httpOnly: true,
        })
        .sendStatus(200);
    }
  });
});

router.post('/auth', (req, res) => {
  const { username, email, password } = req.body;
  User.findOne({ username }, (error, user) => {
    if (error) {
      res.status(500).json({
        error: 'Internal error please try again',
      });
    } else if (!user) {
      res.status(401).json(500);
    } else {
      user.isCorrectPassword(password, (error, same) => {
        if (error) {
          res.status(500).json({
            error: 'Incorrect email or password',
          });
        } else {
          const payload = {
            username,
            _id: user._id,
          };
          const token = jwt.sign(payload, process.env.SECRET, {
            expiresIn: '1h',
          });
          res
            .cookie('noteLystToken', token, {
              domain: 'rickvarela.com',
              httpOnly: true,
            })
            .sendStatus(200);
        }
      });
    }
  });
});

router.post('/note', withAuth, (req, res) => {
  const { _id, editorState } = req.body;
  const note = new Note({
    _id,
    owner_id: res.locals.decoded._id,
    editorState,
  });
  Note.findOneAndUpdate({ _id }, note, { upsert: true })
    .then(() => {
      res.sendStatus(200);
    })
    .catch((error) => {
      res.status(500).send('Server error');
    });
});

router.get('/notes/user', withAuth, (req, res) => {
  Note.find({ owner_id: res.locals.decoded._id }, (err, docs) => {
    res.status(200).json(docs);
  });
});

router.post('/note/delete', withAuth, (req, res) => {
  const { _idToDelete } = req.body;
  Note.findByIdAndDelete(_idToDelete, (err, docs) => {
    res.status(200).json(docs);
  });
});

module.exports = router;
