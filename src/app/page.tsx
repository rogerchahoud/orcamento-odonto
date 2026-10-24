import { auth } from '@/lib/auth/server'
import { listPresets } from '@/lib/presets/repository'
import { LucreWizard } from '@/components/LucreWizard'
import { SignOutButton } from '@/components/SignOutButton'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const { data } = await auth.getSession()
  const userId = data?.user?.id ?? null
  const presets = userId ? await listPresets(userId) : []

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">Calculadora L.U.C.R.E.</h1>
            <p className="text-sm text-zinc-500">
              Preço mínimo e preço recomendado por procedimento.
            </p>
          </div>
          <SignOutButton email={data?.user?.email ?? null} />
        </div>
        <LucreWizard initialPresets={presets} />
      </div>
    </main>
  )
}
