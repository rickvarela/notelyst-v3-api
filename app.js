const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const apiRoutes = require('./apiRoutes');
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: 'https://www.rickvarela.com',
    credentials: true,
  })
);

app.use('/api', apiRoutes);

app.set('port', process.env.PORT || 5000);

const server = app.listen(app.get('port'), () => {
  console.log(`Express server is listening on port ${server.address().port}`);
});

const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.dxbor.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`;

mongoose
  .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Mongoose is connected'))
  .catch((error) => console.log('Error', error));
