import { Response } from "express";
import crypto from "node:crypto";
import { AdminRequest } from "../../middlewares/adminAuth.js";
import { db } from "../../core/db.js";

export const createProject = async (req: AdminRequest, res: Response) => {
    try {
        const { name } = req.body;
        const adminId = req.adminId;

        if (!name || !adminId) {
            return res
                .status(400)
                .json({ error: "Project name and Admin identity are required." });
        }

        const project = await db.project.create({
            data: {
                name,
                adminId: adminId!,
            },
        });

        const rawApiKey = `kernel_live_${crypto.randomBytes(24).toString("hex")}`;

        const keyHash = crypto.createHash("sha256").update(rawApiKey).digest("hex");

        await db.apiKey.create({
            data: {
                keyHash,
                projectId: project.id,
            },
        });

        res.status(201).json({
            message: "Project created successfully",
            project: {
                id: project.id,
                name: project.name,
            },
            apiKey: rawApiKey,
            warning: "Copy this Api key now. You will never be able to see it again.",
        });
    } catch (error) {
        console.error("Project creation error:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};
