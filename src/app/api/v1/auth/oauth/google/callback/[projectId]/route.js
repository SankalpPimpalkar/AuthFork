import db from "@/db";
import { oauthProvidersTables, sessionsTable, usersTable } from "@/db/schema";
import ErrorHandler from "@/utils/ErrorHandler";
import { and, eq } from "drizzle-orm";
import { OAuth2Client } from "google-auth-library";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { cookieOptions } from "../../../../credentials/login/route";
import jwt from "jsonwebtoken";
import { UAParser } from "ua-parser-js";


export async function GET(req) {
    try {
        const searchParams = req.nextUrl.searchParams
        const cookieStore = await cookies()
        const code = searchParams.get("code");
        const state = searchParams.get("state");
        const userAgent = req.headers.get("user-agent") || "";
        const ua = new UAParser(userAgent).getResult();
        const ip =
            req.headers.get("x-forwarded-for") ||
            req.headers.get("x-real-ip") ||
            "0.0.0.0";

        if (!code) {
            return NextResponse.json({
                success: false,
                message: "Missing authorization code"
            }, { status: 400 });
        }

        const { projectId } = JSON.parse(state) || "authfork";
        let clientId = process.env.GOOGLE_CLIENT_ID
        let clientSecret = process.env.GOOGLE_CLIENT_SECRET
        let redirectUrl = `${process.env.BASE_URL}/api/v1/auth/oauth/google/callback/authfork`

        if (projectId != "authfork") {
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

        const { tokens } = await client.getToken(code)
        client.setCredentials(tokens)

        const ticket = await client.verifyIdToken({
            idToken: tokens.id_token,
            audience: clientId
        })

        const payload = ticket.getPayload()

        if (!payload.email) {
            return NextResponse.json({
                success: false,
                message: "No email returned from Google"
            }, { status: 400 })
        }

        const [existingUser] = await db
            .select()
            .from(usersTable)
            .where(eq(usersTable.email, payload.email))

        let user;

        if (existingUser) {
            const [response] = await db
                .update(usersTable)
                .set({
                    image: payload.picture,
                    name: payload.name
                })
                .where(eq(usersTable.id, existingUser.id))
                .returning()

            user = response

        } else {
            const [response] = await db
                .insert(usersTable)
                .values({
                    name: payload.name,
                    email: payload.email,
                    image: payload.picture,
                    emailVerified: new Date(),
                    provider: "google",
                    providerId: payload.sub
                })
                .returning()

            user = response
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

        return NextResponse.redirect(`${process.env.BASE_URL}/user/profile`)

    } catch (error) {
        ErrorHandler(error)
    }
}