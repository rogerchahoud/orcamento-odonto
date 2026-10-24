'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth/client'

export default function MagicLinkPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function verify() {
      const params = new URLSearchParams(window.location.search)
      if (params.get('error')) {
        setError('Link inválido ou expirado. Solicite um novo link de acesso.')
        return
      }

      // Processa o neon_auth_session_verifier presente na URL, estabelecendo a sessão.
      await authClient.getSession()

      if (!cancelled) {
        router.replace('/')
        router.refresh()
      }
    }

    verify()
    return () => {
      cancelled = true
    }
  }, [router])

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-8">
      <div className="mx-auto max-w-md text-center">
        {error ? (
          <div className="rounded border border-zinc-200 bg-white p-6">
            <p className="text-sm text-red-600">{error}</p>
            <button
              type="button"
              onClick={() => router.push('/auth/sign-in')}
              className="mt-4 rounded bg-zinc-800 px-4 py-2 text-sm text-white hover:bg-zinc-700"
            >
              Voltar para o login
            </button>
          </div>
        ) : (
          <p className="text-sm text-zinc-500">Verificando seu link…</p>
        )}
      </div>
    </main>
  )
}
