'use client'

import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth/client'

export function SignOutButton({ email }: { email: string | null }) {
  const router = useRouter()

  async function signOut() {
    await authClient.signOut()
    router.push('/auth/sign-in')
    router.refresh()
  }

  return (
    <div className="flex items-center gap-3">
      {email ? <span className="text-sm text-zinc-500">{email}</span> : null}
      <button
        type="button"
        onClick={signOut}
        className="rounded border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-50"
      >
        Sair
      </button>
    </div>
  )
}
