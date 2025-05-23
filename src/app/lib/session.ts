import 'server-only'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { cache, ReactNode } from 'react'
import {redirect} from "next/navigation";
import {connectMongo} from "@/app/lib/database";
import {IUser, User} from "@/app/models";

const secretKey = process.env.SESSION_SECRET
const encodedKey = new TextEncoder().encode(secretKey)

export type SessionPayload = {
    userId: string;
    expiresAt: Date;
}

export const checkAuth = async (route: any) => {
    const session = await verifySession()
    if(!session.isAuth) {
        redirect('/login');
    }
    return route;
}

export const verifySession = cache(async (): Promise<{isAuth: Boolean, userId: string, user: IUser}> => {
    const cookie = (await cookies()).get('session')?.value
    const session = await decrypt(cookie)

    if (!session?.userId) {
        redirect('/logout')
    }

    await connectMongo();
    const user = await User.findOne({ _id: session.userId });
    if(!user) {
        redirect('/logout');
    }
    return { isAuth: true, userId: session.userId, user: user.toJSON() }
})

export async function deleteSession() {
    (await cookies()).delete('session')
}

export async function updateSession() {
    const session = (await cookies()).get('session')?.value
    const payload = await decrypt(session)

    if (!session || !payload) {
        return null
    }

    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    const cookie = await cookies();
    cookie.set('session', session, {
        httpOnly: true,
        secure: true,
        expires: expires,
        sameSite: 'lax',
        path: '/',
    })
}

export async function createSession(userId: string) {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    const session = await encrypt({ userId, expiresAt })
    const cookie = await cookies();
    cookie.set('session', session, {
        httpOnly: true,
        secure: true,
        expires: expiresAt,
        sameSite: 'lax',
        path: '/',
    })
}

export async function encrypt(payload: SessionPayload) {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(encodedKey)
}

export async function decrypt(session: string | undefined = '') {
    try {
        const { payload } = await jwtVerify<SessionPayload>(session, encodedKey, {
            algorithms: ['HS256'],
        })
        return payload
    } catch (error) {
        console.log('Failed to verify session')
    }
}