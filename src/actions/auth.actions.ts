'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'

export async function loginWithEmail(email: string) {
  const user = await prisma.user.findUnique({
    where: { email }
  })
  
  if (!user) {
    throw new Error('User not found')
  }

  const cookieStore = await cookies()
  cookieStore.set('user_id', user.id, { path: '/' })
  cookieStore.set('user_role', user.role, { path: '/' })
  cookieStore.set('user_email', user.email, { path: '/' })
  cookieStore.set('user_name', user.full_name, { path: '/' })
  
  if (user.role === 'cutting_supervisor') {
    redirect('/supervisor')
  } else if (user.role === 'cutting_verifier') {
    redirect('/verifier')
  } else if (user.role === 'sewing_supervisor') {
    redirect('/sewing')
  } else {
    redirect('/')
  }
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete('user_id')
  cookieStore.delete('user_role')
  cookieStore.delete('user_email')
  cookieStore.delete('user_name')
  redirect('/')
}