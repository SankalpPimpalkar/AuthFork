import db from "@/db";
import { usersTable } from "@/db/schema";
import ErrorHandler from "@/utils/ErrorHandler";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import generateVerificationCode from "@/utils/generateVerificationCodeaa";
import resend from "@/utils/resend";
import { VerificationEmailTemplate } from "../../../../../../emails/VerificationEmailTemplate";

export async function POST(req) {
    try {
        const userId = req.headers.get('x-user-id')
        const verificationCode = generateVerificationCode()
        const hashedEmailSecret = await bcrypt.hash(verificationCode, 10)

        const [userData] = await db
            .update(usersTable)
            .set({ emailVerificationSecret: hashedEmailSecret })
            .where(eq(usersTable.id, userId))
            .returning()

        await resend.emails.send({
            from: 'Shanky <onboarding@resend.dev>',
            to: userData.email,
            subject: 'Verification Code for AuthFork',
            react: VerificationEmailTemplate({ name: userData.name, code: verificationCode })
        })

        return NextResponse.json({
            success: true,
            message: "Email Sent to your mailbox"
        }, { status: 200 })

    } catch (error) {
        ErrorHandler(error)
    }
}
