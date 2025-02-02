import { getProfile } from '@/lib/actions/profile'

async function ProfilePage() {
    const data = await getProfile()

    return (
        <div>
            <h1>Profile page</h1>
            <p>{data?.message}</p>
        </div>
    )
}

export default ProfilePage
