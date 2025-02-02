import { createSession } from '@/lib/actions/session'
import { Role } from '@/lib/types'
import { redirect } from 'next/navigation'
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)

    const accessToken = searchParams.get('accessToken')
    const refreshToken = searchParams.get('refreshToken')
    const userId = searchParams.get('userId')
    const name = searchParams.get('name')
    const role = searchParams.get('role')

    if (!accessToken || !refreshToken || !userId || !name)
        throw new Error('Google Oauth Failed!')

    await createSession({
        user: {
            id: userId,
            name: name,
            role: role as Role,
        },
        accessToken,
        refreshToken,
    })

    redirect('/')
}
