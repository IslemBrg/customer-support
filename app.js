const express = require('express');
const mongoose = require('mongoose');
const app = express();
const PORT = 3000;
const DATABASE_URL = 'mongodb+srv://islem:islem123@support-ticket.1qcqtby.mongodb.net/?retryWrites=true&w=majority&appName=Support-Ticket';
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml');
mongoose.connect(DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("✅ Connected to MongoDB Atlas"))
.catch(err => console.error("❌ MongoDB connection error:", err));
// Import routes
const authRoutes = require('./routes/authRoutes');
const ticketRoutes = require('./routes/ticketRoutes');

// Use Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(express.json());

// Use routes
app.use('/auth', authRoutes);  // All auth routes (e.g., /auth/login)
app.use('/tickets', ticketRoutes);  // All ticket-related routes (e.g., /tickets/create)
// Server
app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
    console.log(`📚 Swagger docs at http://localhost:${PORT}/api-docs`);
});
