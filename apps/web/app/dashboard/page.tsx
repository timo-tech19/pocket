import { getSession } from '@/lib/actions/session'
import { Role } from '@/lib/types'
import { redirect } from 'next/navigation'

async function DashboardPage() {
    const session = await getSession()

    if (!session || !session.user) {
        return redirect('/auth/signin')
    }

    if (session.user.role !== Role.ADMIN) redirect('/')

    return <div>DashboardPage</div>
}

export default DashboardPage
