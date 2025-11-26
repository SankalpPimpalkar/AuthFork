import db from "@/db";
import { usersTable, sessionsTable } from "@/db/schema";
import ErrorHandler from "@/utils/ErrorHandler";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { and, eq, gt } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
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

        const [response] = await db
            .select({
                user: usersTable,
                session: sessionsTable
            })
            .from(sessionsTable)
            .where(
                and(
                    eq(sessionsTable.id, decodedToken.sessionId),
                    gt(sessionsTable.expiresAt, new Date())
                )
            )
            .leftJoin(usersTable, eq(usersTable.id, sessionsTable.userId))

        if (!response.session.id) {
            cookieStore.delete("session")
            return NextResponse.json({
                success: false,
                message: "Session Expired"
            }, { status: 404 })
        }

        return NextResponse.json({
            success: true,
            message: "User details fetched",
            data: response.user
        }, { status: 200 })

    } catch (error) {
        ErrorHandler(error)
    }
}