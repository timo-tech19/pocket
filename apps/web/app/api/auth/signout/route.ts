import { deleteSession } from '@/lib/actions/session'
import { authFetch } from '@/lib/auth-fetch'
import { BACKEND_URL } from '@/lib/constants'
import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
    const response = await authFetch(`${BACKEND_URL}/auth/signout`, {
        method: 'POST',
    })

    if (response.ok) await deleteSession()

    revalidatePath('/', 'layout')
    revalidatePath('/', 'page')
    return NextResponse.redirect(new URL('/', req.nextUrl))
}
