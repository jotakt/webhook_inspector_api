import { define } from "@/utils.ts";
import {
  getChannelConfig,
  listRelayAttempts,
  listWebhookLogs,
} from "@/lib/webhook_store.ts";
import { LiveWebhookPanel } from "@/islands/LiveWebhookPanel.tsx";
import { InspectorControls } from "@/islands/InspectorControls.tsx";
import type { RelayAttempt } from "@/lib/types.ts";

export default define.page(async (ctx) => {
  const channel = ctx.params.channel;
  const logs = await listWebhookLogs(channel);
  const config = await getChannelConfig(channel);
  const relayAttempts = await listRelayAttempts(channel);
  const webhookUrl = new URL(`/api/hooks/${channel}`, ctx.url).toString();

  return (
    <main class="min-h-screen bg-zinc-950 text-zinc-100">
      <section class="mx-auto max-w-6xl px-6 py-10">
        <div class="mb-10">
          <div class="flex items-center gap-4 text-sm">
            <a href="/" class="text-zinc-500 hover:text-zinc-300">
              ← Novo inspector
            </a>

            <a href="/docs" class="text-zinc-500 hover:text-zinc-300">
              Docs
            </a>
          </div>

          <h1 class="mt-6 text-4xl font-bold tracking-tight">
            Inspector:{" "}
            <span class="text-emerald-400">{config.name || channel}</span>
          </h1>

          <p class="mt-3 max-w-2xl text-zinc-400">
            Envie webhooks para a URL abaixo. Os registros expiram
            automaticamente após 24 horas.
          </p>

          <InspectorControls
            channel={channel}
            webhookUrl={webhookUrl}
            initialName={config.name}
            initialForwardTo={config.forwardTo}
          />

          <div class="mt-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
            <p class="mb-2 text-sm text-zinc-500">Teste com curl</p>
            <pre class="overflow-x-auto text-sm text-zinc-300">
{`curl -X POST ${webhookUrl} \\
  -H "content-type: application/json" \\
  -d '{"event":"payment.succeeded","amount":14990}'`}
            </pre>
          </div>
        </div>

        <LiveWebhookPanel channel={channel} initialLogs={logs} />

        <RelayHistory attempts={relayAttempts} />
      </section>
    </main>
  );
});

function RelayHistory({ attempts }: { attempts: RelayAttempt[] }) {
  return (
    <section class="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900">
      <div class="border-b border-zinc-800 p-5">
        <h2 class="font-semibold">Histórico do relay</h2>
        <p class="mt-1 text-sm text-zinc-500">
          Últimas tentativas de encaminhamento deste canal.
        </p>
      </div>

      {attempts.length === 0 ? (
        <div class="p-5 text-sm text-zinc-500">
          Nenhuma tentativa de relay registrada.
        </div>
      ) : (
        <div class="divide-y divide-zinc-800">
          {attempts.map((attempt) => (
            <div class="p-5">
              <div class="flex flex-wrap items-center gap-3">
                <span
                  class={`rounded-md px-2 py-1 text-xs font-bold ${
                    attempt.status === "success"
                      ? "bg-emerald-500/10 text-emerald-300"
                      : "bg-red-500/10 text-red-300"
                  }`}
                >
                  {attempt.status}
                </span>

                <span class="text-sm text-zinc-400">
                  {attempt.responseStatus ?? "sem status"}
                </span>

                <span class="text-sm text-zinc-500">
                  {attempt.durationMs}ms
                </span>

                <span class="text-sm text-zinc-500">
                  {new Date(attempt.createdAt).toLocaleString()}
                </span>
              </div>

              <p class="mt-3 break-all text-sm text-zinc-300">
                {attempt.targetUrl}
              </p>

              {attempt.errorMessage && (
                <p class="mt-2 text-sm text-red-300">
                  {attempt.errorMessage}
                </p>
              )}

              {attempt.responseBody && (
                <pre class="mt-3 max-h-48 overflow-auto rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-xs text-zinc-400">
                  {attempt.responseBody}
                </pre>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}