import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { specs } from './swagger.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import eventRoutes from './routes/events.js';
import inscriptionRoutes from './routes/inscriptions.js';
import paymentRoutes from './routes/payments.js';
import { EventModel } from './models/eventModel.js';
import cron from 'node-cron';
import adminRoutes from "./routes/admin.js";
import path from 'path';
import { fileURLToPath } from 'url';
import fs from "fs";



// Chaque jour à 3h du matin
cron.schedule('0 3 * * *', async () => {
  console.log("🧹 Nettoyage des anciens événements...");
  await EventModel.deleteExpiredEvents();
});


dotenv.config();
const app = express();


const uploadsDir = path.resolve(process.cwd(), "uploads");

console.log("📁 uploadsDir =", uploadsDir);
console.log("📁 uploads exists?", fs.existsSync(uploadsDir));
if (fs.existsSync(uploadsDir)) {
  console.log("📄 uploads files:", fs.readdirSync(uploadsDir).slice(0, 20));
}

app.use("/uploads", express.static(uploadsDir));
app.get("/health", (req, res) => res.json({ ok: true, uploadsDir }));



// ✅ route test (pour vérifier que le serveur répond)
app.get('/health', (req, res) => res.json({ ok: true }));



// ✅ Autoriser le frontend (localhost:5173)
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());

// 📚 Documentation Swagger
app.use('/api-docs', swaggerUi.serve)
app.get('/api-docs', swaggerUi.setup(specs))

app.use("/api/admin", adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/inscriptions', inscriptionRoutes);
app.use('/api/payments', paymentRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

// 📤 Exporter l'app pour les tests
export default app;

// 🚀 Démarrer le serveur uniquement en production
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

