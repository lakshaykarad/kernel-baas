import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { db } from '../../core/db.js';
import jwt from 'jsonwebtoken';

// Super admin
export const setupAdmin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required." });
      return;
    }

    // 1. Enforce Single-Admin Architecture
    const existingAdmin = await db.admin.findFirst();
    if (existingAdmin) {
      res.status(403).json({ error: "Master Admin already exists. Only one owner allowed." });
      return;
    }

    // 2. Hash the password securely
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 3. Create the Super Admin
    const admin = await db.admin.create({
      data: {
        email,
        passwordHash
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


export const loginAdmin = async (req: Request, res : Response) =>{
  try {
    const {email, password} = req.body;
    if(!email || !password){
      res.status(400).json({error : "Email and password are required."});
      return;
    }

    const admin = await db.admin.findUnique({where : {email}});
    if (!admin){
      res.status(404).json({error : "Invalid email or password."})
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, admin.passwordHash)

    if(!isPasswordValid){
      res.status(401).json({error: "Invalid email or password."})
      return;
    }

    const accessToken = jwt.sign(
      { adminId: admin.id},
      process.env.JWT_ACCESS_SECRET || "fallback_access_secret",
      { expiresIn: '15m' }
    );
 
    const refreshToken = jwt.sign(
      { adminId: admin.id },
      process.env.JWT_REFRESH_SECRET || "fallback_refresh_secret",
      { expiresIn: '7d' }
    );

    await db.adminSession.create({
      data: {
        adminId : admin.id,
        refreshToken
      }
    });

    res.cookie('kernel_refresh', refreshToken, {
      httpOnly : true,
      secure : process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7*24*60*60*1000
    });

    res.status(200).json({
      message : "Login successful",
      accessToken
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({error : "Internal server error."});
  }
};