const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./src/routes/authRoutes');

const app = express();

mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(console.log('Connected to DB')).catch(e => console.log('Unable to connect to MongoDB Atlas', e));

app.use(express.json());
app.use('/auth', authRoutes);

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});