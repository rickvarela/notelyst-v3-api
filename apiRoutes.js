const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

const router = express.Router();

const withAuth = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    res.status(401).send('Unauthorized: no token provided');
  } else {
    jwt.verify(token, secret, (error, decoded) => {
      if (error) {
        res.status(401).send('Unauthorized: invalid token');
      } else {
        console.log(decoded);
        req.username = decoded.username;
        next();
      }
    });
  }
};

router.get('/checkauth', (req, res) => {
  const token = req.cookies.noteLystToken;
  console.log(token);
  jwt.verify(token, process.env.SECRET, (error, decoded) => {
    if (error) {
      console.log(error);
      res.status(200).json({
        authUser: null,
      });
    } else {
      res.status(200).json({
        authUser: {
          username: decoded.username,
        },
      });
    }
  });
});

router.post('/delete', (req, res) => {
  console.log('DELETE');
  res.clearCookie('noteLystToken');
  return res.sendStatus(200);
});

router.post('/signup', (req, res) => {
  console.log('SIGNUP');
  const { username, email, password } = req.body;
  const _id = mongoose.Types.ObjectId();
  console.log(_id);
  const user = new User({ _id, username, email, password });
  user.save((error) => {
    if (error) {
      console.log(error);
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
  console.log('auth');
  User.findOne({ username }, (error, user) => {
    if (error) {
      console.log(error);
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
          const payload = { username };
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

module.exports = router;
