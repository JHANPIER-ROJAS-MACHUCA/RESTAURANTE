require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRouter = require('./routes/auth');
const pedidosRouter = require('./routes/pedidos');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Servir frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Rutas API
app.use('/auth', authRouter);
app.use('/pedidos', pedidosRouter);

app.listen(PORT, () => {
    console.log(`🍽 RestaurApp corriendo en http://localhost:${PORT}`);
});