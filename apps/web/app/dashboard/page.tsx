import { getSession } from '@/lib/actions/session'
import { redirect } from 'next/navigation'

async function DashboardPage() {
    const session = await getSession()

    if (!session || !session.user) {
        return redirect('/auth/signin')
    }

    return <div>DashboardPage</div>
}

export default DashboardPage
