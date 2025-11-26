import db from "@/db"
import { projectsTable } from "@/db/schema"
import ErrorHandler from "@/utils/ErrorHandler"
import { and, eq } from "drizzle-orm"
import { NextResponse } from "next/server"
import { validate } from "uuid"


export async function DELETE(req, { params }) {
    try {
        const { projectId } = await params
        const userId = req.headers.get('x-user-id')

        if (!validate(projectId)) {
            return NextResponse.json({
                success: false,
                message: "ProjectId is not valid"
            }, { status: 400 })
        }

        const [response] = await db
            .delete(projectsTable)
            .where(
                and(
                    eq(projectsTable.id, String(projectId)),
                    eq(projectsTable.ownerId, userId)
                )
            )
            .returning()

        if (!response.id) {
            return NextResponse.json({
                success: false,
                message: "Project not Found"
            }, { status: 404 })
        }

        return NextResponse.json({
            success: true,
            message: "Project Deleted"
        }, { status: 200 })

    } catch (error) {
        ErrorHandler(error)
    }
}