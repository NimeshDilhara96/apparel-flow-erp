import { cookies } from 'next/headers'

//get details from current login
export async function getServerSession() {
  const cookieStore = await cookies()
  const role = cookieStore.get('user_role')?.value
  const userId = cookieStore.get('user_id')?.value

  if (!role || !userId) {
    return null
  }

  return { role, userId }
}

//check the correct  role to run the API(Hard-Stop)
export async function requireRole(allowedRoles: string[]) {
  const session = await getServerSession()
  
  if (!session || !allowedRoles.includes(session.role)) {
    throw new Error('403_FORBIDDEN')
  }
  
  return session
}
