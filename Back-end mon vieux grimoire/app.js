const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
require("dotenv").config();

const bookRoutes = require('./routes/Book.js'); 
const userRoutes = require('./routes/User.js');

const app = express();

async function connectToDatabase() {
  try {
      await mongoose.connect(process.env.DB_URI);
      console.log('Connexion à MongoDB réussie !');
  } catch (error) {
      console.error('Connexion à MongoDB échouée !', error);
      
  }
}
connectToDatabase();



app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

app.use(express.json());
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/api/books', bookRoutes);
app.use('/api/auth', userRoutes);



// Exportation // 
module.exports = app;

