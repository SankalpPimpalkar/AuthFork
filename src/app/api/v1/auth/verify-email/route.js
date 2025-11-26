import db from "@/db";
import { usersTable } from "@/db/schema";
import ErrorHandler from "@/utils/ErrorHandler";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { code } = await req.json()
        const userId = req.headers.get('x-user-id')

        const [userData] = await db
            .select()
            .from(usersTable)
            .where(eq(usersTable.id, userId))

        const isCorrectCode = await bcrypt.compare(code, userData.emailVerificationSecret)

        if (!isCorrectCode) {
            return NextResponse.json({
                success: false,
                message: "Incorrect Verification Code"
            }, { status: 401 })
        }

        await db
            .update(usersTable)
            .set({ emailVerified: new Date() })
            .where(eq(usersTable.id, userId))

        return NextResponse.json({
            success: true,
            message: "Email verified"
        }, { status: 200 })

    } catch (error) {
        ErrorHandler(error)
    }
}
