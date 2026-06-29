import { define } from "@/utils.ts";
import { listWebhookLogs } from "@/lib/webhook_store.ts";
import { LiveWebhookPanel } from "@/islands/LiveWebhookPanel.tsx";

export default define.page(async (_ctx) => {
  const channel = _ctx.params.channel;
  const logs = await listWebhookLogs(channel);

  return (
    <main class="min-h-screen bg-zinc-950 text-zinc-100">
      <section class="mx-auto max-w-6xl px-6 py-10">
        <div class="mb-10">
          <a href="/" class="text-sm text-zinc-500 hover:text-zinc-300">
            ← Novo inspector
          </a>

          <h1 class="mt-6 text-4xl font-bold tracking-tight">
            Inspector: <span class="text-emerald-400">{channel}</span>
          </h1>

          <p class="mt-3 max-w-2xl text-zinc-400">
            Envie webhooks para a URL abaixo. Os registros expiram automaticamente
            após 24 horas.
          </p>

          <div class="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
            <p class="mb-2 text-sm text-zinc-500">Webhook URL</p>
            <code class="break-all text-emerald-300">
              {new URL(`/api/hooks/${channel}`, _ctx.url).toString()}
            </code>
          </div>

          <div class="mt-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
            <p class="mb-2 text-sm text-zinc-500">Teste com curl</p>
            <pre class="overflow-x-auto text-sm text-zinc-300">
{`curl -X POST ${new URL(`/api/hooks/${channel}`, _ctx.url).toString()} \\
  -H "content-type: application/json" \\
  -d '{"event":"payment.succeeded","amount":14990}'`}
            </pre>
          </div>
        </div>

        <LiveWebhookPanel channel={channel} initialLogs={logs} />
      </section>
    </main>
  );
});