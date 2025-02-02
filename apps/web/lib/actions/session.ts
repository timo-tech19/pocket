'use server'

import { jwtVerify, SignJWT } from 'jose'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export type Session = {
    user: {
        id: string
        name: string
        //   role: Role;
    }
    // accessToken: string;
    // refreshToken: string;
}
const secretKey = process.env.SESSION_SECRET_KEY!
const encodedKey = new TextEncoder().encode(secretKey)

export async function createSession(payload: Session) {
    const expiredAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    const session = await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(encodedKey)

    const requestCookies = await cookies()

    requestCookies.set('session', session, {
        httpOnly: true,
        secure: true,
        expires: expiredAt,
        sameSite: 'lax',
        path: '/',
    })
}

export async function getSession() {
    const requestCookies = await cookies()
    const cookie = requestCookies.get('session')?.value

    if (!cookie) return null

    try {
        const { payload } = await jwtVerify(cookie, encodedKey, {
            algorithms: ['HS256'],
        })

        return payload as Session
    } catch (error) {
        console.log('Failed to verify the session', error)
        return redirect('/auth/signin')
    }
}

export async function deleteSession() {
    const requestCookies = await cookies()

    requestCookies.delete('session')
}
