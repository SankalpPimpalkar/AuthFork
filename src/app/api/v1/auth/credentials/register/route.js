import db from "@/db";
import { usersTable } from "@/db/schema";
import ErrorHandler from "@/utils/ErrorHandler";
import generateVerificationCode from "@/utils/generateVerificationCodeaa";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import resend from "@/utils/resend";
import { VerificationEmailTemplate } from "../../../../../../../emails/VerificationEmailTemplate";

export async function POST(req) {
    try {
        const { name, email, password } = await req.json()

        if (!name || !email || !password) {
            return NextResponse.json({
                success: false,
                message: "All Fields are required (name, email, password)"
            }, { status: 404 })
        }

        const [existingUser] = await db
            .select()
            .from(usersTable)
            .where(eq(usersTable.email, email))

        if (existingUser) {
            return NextResponse.json({
                success: false,
                message: "Email is already taken"
            }, { status: 404 })
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        const verificationCode = generateVerificationCode()
        const hashedEmailSecret = await bcrypt.hash(verificationCode, 10)

        await db
            .insert(usersTable)
            .values({
                name,
                email,
                password: hashedPassword,
                emailVerificationSecret: hashedEmailSecret
            })

        await resend.emails.send({
            from: 'Shanky <onboarding@resend.dev>',
            to: email,
            subject: 'Verification Code for AuthFork',
            react: VerificationEmailTemplate({ name: name, code: verificationCode })
        })

        return NextResponse.json({
            success: true,
            message: "User registered. Please Verify your account",
        }, { status: 201 })

    } catch (error) {
        ErrorHandler(error)
    }
}