import db from "@/db";
import { projectsTable } from "@/db/schema";
import ErrorHandler from "@/utils/ErrorHandler";
import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req) {
    try {
        const userId = req.headers.get('x-user-id')

        const projects = await db
            .select()
            .from(projectsTable)
            .where(eq(projectsTable.ownerId, userId))
            .orderBy(desc(projectsTable.updatedAt))

        return NextResponse.json({
            succes: true,
            message: "Fetched User Projects",
            data: projects
        }, { status: 200 })

    } catch (error) {
        ErrorHandler(error)
    }
}

export async function POST(req) {
    try {
        const { projectName } = await req.json()
        const userId = req.headers.get('x-user-id')

        const [newProject] = await db
            .insert(projectsTable)
            .values({
                ownerId: userId,
                name: projectName
            })
            .returning()

        return NextResponse.json({
            succes: true,
            message: "New Project Created",
            data: newProject
        }, { status: 201 })

    } catch (error) {
        ErrorHandler(error)
    }
}