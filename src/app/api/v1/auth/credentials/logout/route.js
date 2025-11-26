import db from "@/db";
import { sessionsTable } from "@/db/schema";
import ErrorHandler from "@/utils/ErrorHandler";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";


export async function POST(req) {
    try {
        const cookieStore = await cookies()
        const session = cookieStore.get("session") || ""

        const decodedToken = jwt.verify(session.value, process.env.JWT_SECRET)

        if (!decodedToken.sessionId) {
            return NextResponse.json({
                success: false,
                message: "Invalid Token"
            }, { status: 401 })
        }

        await db
            .delete(sessionsTable)
            .where(eq(sessionsTable.id, decodedToken.sessionId))

        cookieStore.delete("session")

        return NextResponse.json({
            success: true,
            message: "User logged Out"
        }, { status: 200 })

    } catch (error) {
        ErrorHandler(error)
    }
}