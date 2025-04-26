import express from 'express';
import mongoose from 'mongoose';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import authRoutes from './routes/authRoutes.js';
import ticketRoutes from './routes/ticketRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import Config from './utils/Config.js';
import bodyParser  from 'body-parser';
import cookieParser from 'cookie-parser';
import expressLayouts from 'express-ejs-layouts';
import cors from 'cors';

const app = express();
const PORT = 3000;
const DATABASE_URL = Config.databaseUrl;

const swaggerDocument = YAML.load('./swagger.yaml');
mongoose.connect(DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("✅ Connected to MongoDB Atlas"))
.catch(err => console.error("❌ MongoDB connection error:", err));
// Import routes


// Use Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('views', './views');
app.set('layout', 'layout');
app.use(cookieParser());
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));


// Use routes
app.use('/auth', authRoutes);  // All auth routes (e.g., /auth/login)
app.use('/tickets', ticketRoutes);  // All ticket-related routes (e.g., /tickets/create)
app.use('/admin', adminRoutes);
// Server
app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
    console.log(`📚 Swagger docs at http://localhost:${PORT}/api-docs`);
});
