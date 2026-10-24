'use client'

import { useState, type FormEvent } from 'react'
import { authClient } from '@/lib/auth/client'

type Status = 'idle' | 'loading' | 'sent' | 'error'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    const trimmed = email.trim()
    if (!trimmed) return

    setStatus('loading')
    setErrorMessage('')

    const { error } = await authClient.signIn.magicLink({
      email: trimmed,
      callbackURL: `${window.location.origin}/auth/magic-link`,
    })

    if (error) {
      setStatus('error')
      setErrorMessage(error.message ?? 'Não foi possível enviar o link de acesso.')
      return
    }
    setStatus('sent')
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-8">
      <div className="mx-auto max-w-md">
        <h1 className="text-2xl font-bold text-zinc-900">Calculadora L.U.C.R.E.</h1>
        <p className="mb-6 text-sm text-zinc-500">Entre para acessar seus presets.</p>

        {status === 'sent' ? (
          <div className="rounded border border-zinc-200 bg-white p-6">
            <p className="text-sm text-zinc-700">
              Enviamos um link de acesso para <strong>{email}</strong>.
            </p>
            <p className="mt-2 text-sm text-zinc-500">
              Verifique sua caixa de entrada e clique no link para entrar.
            </p>
          </div>
        ) : (
          <form
            onSubmit={onSubmit}
            className="flex flex-col gap-3 rounded border border-zinc-200 bg-white p-6"
          >
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium text-zinc-700">Email</span>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="voce@clinica.com"
                className="rounded border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900"
              />
            </label>
            {status === 'error' ? (
              <span className="text-xs text-red-600">{errorMessage}</span>
            ) : null}
            <button
              type="submit"
              disabled={status === 'loading'}
              className="rounded bg-zinc-800 px-4 py-2 text-sm text-white hover:bg-zinc-700 disabled:opacity-50"
            >
              {status === 'loading' ? 'Enviando…' : 'Enviar link de acesso'}
            </button>
          </form>
        )}
      </div>
    </main>
  )
}
