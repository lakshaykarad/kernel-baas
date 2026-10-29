import express from 'express';
import cookieParser from 'cookie-parser'
import authRoutes from './modules/auth/auth.routes.js';
import projectRoutes from './modules/projects/project.routes.js'; 

const app = express();
const PORT = 8000;

// 1. MUST HAVE THIS: Tells Express to parse incoming JSON bodies from Postman/ThunderClient
app.use(express.json()); 
app.use(cookieParser());
// 2. MUST HAVE THIS: Connects the URL "/api/auth" to the auth.routes.ts file you created
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