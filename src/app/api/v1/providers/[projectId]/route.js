import db from "@/db";
import { oauthProvidersTables, projectsTable } from "@/db/schema";
import ErrorHandler from "@/utils/ErrorHandler";
import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { validate } from "uuid";

export async function GET(req, { params }) {
    try {
        const userId = req.headers.get('x-user-id')
        const { projectId } = await params

        const projectData = await db
            .select()
            .from(projectsTable)
            .where(eq(projectsTable.id, projectId))

        if (projectData) {
            if (projectData[0].ownerId != userId) {
                return NextResponse.json({
                    success: false,
                    message: "Unauthorized Access"
                }, { status: 401 })
            }
        } else {
            return NextResponse.json({
                success: false,
                message: "Project Not Found"
            }, { status: 404 })
        }

        const projects = await db
            .select()
            .from(oauthProvidersTables)
            .where(eq(oauthProvidersTables.projectId, projectId))
            .orderBy(desc(oauthProvidersTables.updatedAt))

        return NextResponse.json({
            success: true,
            message: "Fetched OAuth Providers of Project",
            data: projects
        }, { status: 200 })

    } catch (error) {
        ErrorHandler(error)
    }
}

export async function POST(req, { params }) {
    try {
        const userId = req.headers.get('x-user-id')
        const { projectId } = await params
        const { providerName, clientId, clientSecret, isEnabled } = await req.json()

        const projectData = await db
            .select()
            .from(projectsTable)
            .where(eq(projectsTable.id, projectId))

        if (projectData) {
            if (projectData[0].ownerId != userId) {
                return NextResponse.json({
                    success: false,
                    message: "Unauthorized Access"
                }, { status: 401 })
            }
        } else {
            return NextResponse.json({
                success: false,
                message: "Project Not Found"
            }, { status: 404 })
        }

        const [newOAuthProvider] = await db
            .insert(oauthProvidersTables)
            .values({
                projectId,
                providerName,
                clientId,
                clientSecret,
                isEnabled: !!isEnabled
            })
            .returning()

        return NextResponse.json({
            success: true,
            message: "New OAuth Provider Created in Project",
            data: newOAuthProvider
        }, { status: 201 })

    } catch (error) {
        ErrorHandler(error)
    }
}

export async function PUT(req, { params }) {
    try {
        const userId = req.headers.get('x-user-id')
        const { projectId } = await params
        const { providerId, clientId, clientSecret, isEnabled } = await req.json()

        const projectData = await db
            .select()
            .from(projectsTable)
            .where(eq(projectsTable.id, projectId))

        if (projectData) {
            if (projectData[0].ownerId != userId) {
                return NextResponse.json({
                    success: false,
                    message: "Unauthorized Access"
                }, { status: 401 })
            }
        } else {
            return NextResponse.json({
                success: false,
                message: "Project Not Found"
            }, { status: 404 })
        }

        if (!validate(providerId)) {
            return NextResponse.json({
                success: false,
                message: "ProviderId is required"
            }, { status: 400 })
        }

        const updatedFields = {}

        if (clientId) updatedFields.clientId = clientId
        if (clientSecret) updatedFields.clientSecret = clientSecret
        if (typeof isEnabled == "boolean") updatedFields.isEnabled = isEnabled

        const [newOAuthProvider] = await db
            .update(oauthProvidersTables)
            .set(updatedFields)
            .where(eq(oauthProvidersTables.id, providerId))
            .returning()

        return NextResponse.json({
            success: true,
            message: "New OAuth Provider Created in Project",
            data: newOAuthProvider
        }, { status: 201 })

    } catch (error) {
        ErrorHandler(error)
    }
}