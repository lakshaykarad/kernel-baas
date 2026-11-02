import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { db } from '../../core/db.js';
import jwt from 'jsonwebtoken'; 


export const setupAdmin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required." })
      return;
    }

    const existingSuperAdmin = await db.admin.findFirst({
      where: { isSuperAdmin: true }
    })

    if (existingSuperAdmin) {
      res.status(403).json({ error: "Master Admin already exists. Only one owner allowed." });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const admin = await db.admin.create({
      data: {
        email,
        passwordHash,
        isSuperAdmin: true
      }
    });
    res.status(201).json({
      message: "Master Admin created successfully.",
      adminId: admin.id
    });
  } catch (error) {
    console.error("Setup error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


export const registerAdmin = async(req : Request, res : Response) =>{
  try {
    const {email, password} = req.body;

    if (!email || !password) {
      res.status(400).json({ error : "Email and password are required." });
      return;
    }

    const existing = await db.admin.findUnique({where : {email} }); 

    if (existing){
      return res.status(400).json({error : "Email is already registered."});
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const admin = await db.admin.create({
      data : {
        email, 
        passwordHash,
        isSuperAdmin : false
      }
    });
    res.status(201).json({
      message : "Developer account created successfully.",
      adminID : admin.id
    });
  } catch (error) {
    console.error("Register error: ", error);
    res.status(500).json({error : "Internal server error"});
  }
};


export const loginAdmin = async(req : Request, res : Response) => {
  try {
    const {email, password} = req.body;

    if (!email || !password) {
      return res.status(400).json({ error : "Email and password are required." });
    
    }
    
    const admin = await db.admin.findUnique({where : {email}});

    if(!admin){
      return res.status(404).json({error : "Invalid email or password"})
    }

    const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);

    if (!isPasswordValid) {
      res.status(401).json({ error: "Invalid email or password." });
      return;
    }

    const accessToken = jwt.sign(
      {adminId : admin.id, isSuperAdmin : admin.isSuperAdmin},
      process.env.JWT_ACCESS_SECRET || "fallback_access_secret",
      {expiresIn : '15m'}
    )

    const refreshToken = jwt.sign(
      { adminId: admin.id, isSuperAdmin: admin.isSuperAdmin },
      process.env.JWT_REFRESH_SECRET || "fallback_refresh_secret",
      { expiresIn: '7d' }
    );
    await db.adminSession.create({
      data: {
        adminId: admin.id,
        refreshToken
      }
    });

    res.cookie('kernel_refresh', refreshToken, {
      httpOnly : true,
      secure : process.env.NODE_ENV === 'production',
      sameSite : 'lax',
      maxAge : 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({
      message: "Login successful",
      accessToken,
      isSuperAdmin: admin.isSuperAdmin,
      email: admin.email
    });

  } catch (error) {
    console.error("Login error: ", error);
    res.status(500).json({error : "Internal server error"});

  }
};


export const refreshAdmin = async(req : Request, res : Response) =>{
  try {
    const refreshToken = req.cookies.kernel_refresh;

    if(!refreshToken){
      return res.status(401).json({error : "No refresh token provided."});
    }

    let payload : any;

    try {
      payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || "fallback_refresh_secret")
    } catch (error) {
      return res.status(403).json({error : "Invalid or expired refresh token."})
    }

    const session = await db.adminSession.findUnique({
      where : {refreshToken},
      include : {admin : true}
    });

    if(!session){
      return res.status(404).json({error : "Session has been revoked or does not exist."});
    }

    const newAccessToken = jwt.sign(
      {adminId : session.admin.id, isSuperAdmin : session.admin.isSuperAdmin},
      process.env.JWT_ACCESS_SECRET || "fallback_access_secret",
      {expiresIn : '15m'}
    )

    res.status(200).json({
     message: "Token refreshed successfully.",
      accessToken : newAccessToken,
      isSuperAdmin : session.admin.isSuperAdmin,
      email : session.admin.email
    });

  } catch (error) {
    console.error("Refresh error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};