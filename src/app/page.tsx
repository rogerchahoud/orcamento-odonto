import { listPresets } from "@/lib/presets/repository";
import { LucreWizard } from "@/components/LucreWizard";

export const dynamic = "force-dynamic";

export default function Home() {
  const presets = listPresets();

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-bold text-zinc-900">Calculadora L.U.C.R.E.</h1>
        <p className="mb-6 text-sm text-zinc-500">
          Preço mínimo e preço recomendado por procedimento.
        </p>
        <LucreWizard initialPresets={presets} />
      </div>
    </main>
  );
}
