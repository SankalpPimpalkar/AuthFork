import db from "@/db";
import { usersTable, sessionsTable } from "@/db/schema";
import ErrorHandler from "@/utils/ErrorHandler";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import { UAParser } from "ua-parser-js";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export const cookieOptions = {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 90,
};


export async function POST(req) {
    try {
        const { email, password } = await req.json()
        const cookieStore = await cookies()
        const userAgent = req.headers.get("user-agent") || "";
        const ua = new UAParser(userAgent).getResult();
        const ip =
            req.headers.get("x-forwarded-for") ||
            req.headers.get("x-real-ip") ||
            "0.0.0.0";

        if (!email || !password) {
            return NextResponse.json({
                success: false,
                message: "All Fields are required (email, password)"
            }, { status: 400 })
        }

        const [user] = await db
            .select()
            .from(usersTable)
            .where(eq(usersTable.email, email))

        if (!user) {
            return NextResponse.json({
                success: false,
                message: "User does not exist with this email"
            }, { status: 404 })
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password)

        if (!isPasswordCorrect) {
            return NextResponse.json({
                success: false,
                message: "Wrong Password"
            }, { status: 404 })
        }

        const [session] = await db
            .insert(sessionsTable)
            .values({
                userId: user.id,
                device: ua.os.name || "Unknown",
                ipAddress: ip || "0.0.0.0",
                expiresAt: new Date(Date.now() + cookieOptions.maxAge * 1000)
            })
            .returning()

        const sessionToken = jwt.sign({ sessionId: session.id }, process.env.JWT_SECRET)

        cookieStore.set("session", sessionToken, cookieOptions)

        return NextResponse.json({
            success: true,
            message: "User logged In"
        }, { status: 200 })

    } catch (error) {
        ErrorHandler(error)
    }
}