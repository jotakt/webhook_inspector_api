import { define } from "@/utils.ts";

export default define.page(() => {
  const channel = crypto.randomUUID().slice(0, 8);

  return (
    <main class="min-h-screen bg-zinc-950 text-zinc-100">
      <section class="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-6 py-20 text-center">
        <p class="mb-4 rounded-full border border-zinc-800 px-4 py-1 text-sm text-zinc-400">
          Fresh + Deno KV + Server-Sent Events
        </p>

        <h1 class="max-w-3xl text-5xl font-bold tracking-tight md:text-7xl">
          Webhook Inspector 
        </h1>

        <h3 class="max-w-3xl text-5xl tracking-tight md:text-7xl">simples, rápido e temporário.</h3>

        <p class="mt-6 max-w-2xl text-lg leading-8 text-zinc-400">
          Gere uma URL exclusiva, receba webhooks externos, inspecione headers,
          query params e payloads em tempo real.
        </p>

        <div class="mt-10 flex flex-col gap-4 sm:flex-row">
          <a
            href={`/inspect/${channel}`}
            class="rounded-2xl bg-emerald-400 px-6 py-3 font-semibold text-zinc-950 transition hover:bg-emerald-300"
          >
            Criar inspector
          </a>

          <a
            href="/docs"
            class="rounded-2xl border border-zinc-700 px-6 py-3 font-semibold text-zinc-100 transition hover:bg-zinc-900"
          >
            Ver documentação
          </a>
        </div>

        <p class="mt-8 text-sm text-zinc-600">
          Os registros são temporários e expiram automaticamente.
        </p>
      </section>
    </main>
  );
});