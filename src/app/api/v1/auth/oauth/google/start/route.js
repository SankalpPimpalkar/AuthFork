import { NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import db from "@/db";
import ErrorHandler from "@/utils/ErrorHandler";
import { oauthProvidersTables } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function POST(req) {
    try {
        const searchParams = req.nextUrl.searchParams
        const projectId = searchParams.get("projectId")
        let clientId = process.env.GOOGLE_CLIENT_ID
        let clientSecret = process.env.GOOGLE_CLIENT_SECRET
        let redirectUrl = `${process.env.BASE_URL}/api/v1/auth/oauth/google/callback/authfork`

        if (projectId) {
            const [project] = await db
                .select()
                .from(oauthProvidersTables)
                .where(
                    and(
                        eq(oauthProvidersTables.projectId, projectId),
                        eq(oauthProvidersTables.isEnabled, true)
                    )
                )

            if (project) {
                clientId = project.clientId
                clientSecret = project.clientSecret
                redirectUrl = `${process.env.BASE_URL}/api/v1/auth/oauth/google/callback/${project.projectId}`
            }
        }

        const client = new OAuth2Client({
            client_id: clientId,
            client_secret: clientSecret,
            redirectUri: redirectUrl
        })

        const url = client.generateAuthUrl({
            access_type: "offline",
            prompt: "consent",
            scope: ["openid", "email", "profile"],
            state: JSON.stringify({ projectId: projectId || "authfork" }),
        })

        return NextResponse.json({
            success: true,
            message: "Google Redirect Url Created",
            data: url
        }, { status: 200 })

    } catch (error) {
        ErrorHandler(error)
    }
}