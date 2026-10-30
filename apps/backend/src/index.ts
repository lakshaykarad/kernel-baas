import express from 'express';
import cookieParser from 'cookie-parser'
import cors from 'cors';
import authRoutes from './modules/auth/auth.routes.js';
import projectRoutes from './modules/projects/project.routes.js'; 

const app = express();
const PORT = 8000;

app.use(cors({
  origin: 'http://localhost:5173',  
  credentials: true  
}));

app.use(express.json()); 
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes )
// The original sanity check route
app.get('/', (req, res) => {
  res.json({ 
    status: "success", 
    message: "Kernel BaaS backend is successfully running!" 
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});