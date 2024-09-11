const express = require('express');
const app = express();
require('dotenv').config();
const db = require('./db');


const bodyParser = require('body-parser');
app.use(bodyParser.json());
const PORT = process.env.PORT || 5000;

const userRoutes = require('./routes/userRoutes');
app.use('/user', userRoutes);

const candidateRoutes = require('./routes/candidateRoutes');
app.use('/candidate', candidateRoutes);

app.listen(PORT, () => {
    console.log('listening on port 5000');
});