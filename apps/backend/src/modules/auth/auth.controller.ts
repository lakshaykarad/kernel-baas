import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { db } from '../../core/db.js';

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
