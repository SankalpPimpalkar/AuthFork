// src/proxy.js
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import db from '@/db';
import { sessionsTable, usersTable } from '@/db/schema';
import { and, eq, gt } from 'drizzle-orm';

export async function proxy(request) {
    const token = request.cookies.get('session')?.value;
    console.log("🔥 Proxy is running");

    if (!token) {
        return NextResponse.json({ success: false, message: "Token is missing" }, { status: 401 });
    }

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        return NextResponse.json({ success: false, message: "Invalid Token" }, { status: 401 });
    }

    const [response] = await db
        .select({
            user: usersTable,
            session: sessionsTable
        })
        .from(sessionsTable)
        .where(
            and(
                eq(sessionsTable.id, decoded.sessionId),
                gt(sessionsTable.expiresAt, new Date())
            )
        )
        .leftJoin(usersTable, eq(usersTable.id, sessionsTable.userId));

    if (!response?.session?.id) {
        return NextResponse.json({ success: false, message: "Session Expired" }, { status: 404 });
    }

    const res = NextResponse.next({
        request: {
            headers: new Headers({
                ...request.headers,
                'x-user-id': response.user.id,
            }),
        },
    });

    return res;
}

export const config = {
    matcher: [
        '/api/v1/projects/:path*',
        '/api/v1/providers/:path*',
    ],
};
