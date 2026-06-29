import { useEffect, useMemo, useState } from "preact/hooks";
import type { WebhookLog } from "@/lib/types.ts";

type Props = {
  channel: string;
  initialLogs: WebhookLog[];
};

export function LiveWebhookPanel({ channel, initialLogs }: Props) {
  const [logs, setLogs] = useState<WebhookLog[]>(initialLogs);
  const [status, setStatus] = useState<"connecting" | "connected" | "error">(
    "connecting",
  );
  const [selectedId, setSelectedId] = useState<string | null>(
    initialLogs[0]?.id ?? null,
  );

  useEffect(() => {
    const source = new EventSource(`/api/events/${channel}`);

    source.addEventListener("connected", () => {
      setStatus("connected");
    });

    source.addEventListener("webhook", (event) => {
      const log = JSON.parse((event as MessageEvent).data) as WebhookLog;

      setLogs((current) => {
        const withoutDuplicate = current.filter((item) => item.id !== log.id);
        return [log, ...withoutDuplicate].slice(0, 50);
      });

      setSelectedId(log.id);
    });

    source.onerror = () => {
      setStatus("error");
    };

    return () => {
      source.close();
    };
  }, [channel]);

  const selectedLog = useMemo(() => {
    return logs.find((log) => log.id === selectedId) ?? logs[0] ?? null;
  }, [logs, selectedId]);

  return (
    <section class="grid gap-6 lg:grid-cols-[380px_1fr]">
      <aside class="rounded-2xl border border-zinc-800 bg-zinc-900">
        <div class="flex items-center justify-between border-b border-zinc-800 p-4">
          <div>
            <h2 class="font-semibold">Requisições</h2>
            <p class="text-sm text-zinc-500">{logs.length} armazenadas</p>
          </div>

          <StatusBadge status={status} />
        </div>

        <div class="max-h-160 overflow-y-auto">
          {logs.length === 0 && (
            <div class="p-6 text-sm text-zinc-500">
              Nenhum webhook recebido ainda.
            </div>
          )}

          {logs.map((log) => (
            <button
              type="button"
              onClick={() => setSelectedId(log.id)}
              class={`block w-full border-b border-zinc-800 p-4 text-left transition hover:bg-zinc-800 ${
                selectedLog?.id === log.id ? "bg-zinc-800" : ""
              }`}
            >
              <div class="flex items-center justify-between gap-3">
                <span class="rounded-md bg-emerald-500/10 px-2 py-1 text-xs font-bold text-emerald-300">
                  {log.method}
                </span>
                <span class="text-xs text-zinc-500">
                  {new Date(log.receivedAt).toLocaleTimeString()}
                </span>
              </div>

              <p class="mt-3 truncate text-sm text-zinc-300">
                {log.contentType ?? "sem content-type"}
              </p>

              <p class="mt-1 text-xs text-zinc-500">
                {log.sizeBytes} bytes
              </p>
            </button>
          ))}
        </div>
      </aside>

      <article class="rounded-2xl border border-zinc-800 bg-zinc-900">
        {!selectedLog ? (
          <div class="p-8 text-zinc-500">
            Selecione uma requisição para inspecionar.
          </div>
        ) : (
          <WebhookDetails log={selectedLog} />
        )}
      </article>
    </section>
  );
}

function StatusBadge({ status }: { status: "connecting" | "connected" | "error" }) {
  const label = {
    connecting: "conectando",
    connected: "ao vivo",
    error: "erro",
  }[status];

  const className = {
    connecting: "bg-yellow-500/10 text-yellow-300",
    connected: "bg-emerald-500/10 text-emerald-300",
    error: "bg-red-500/10 text-red-300",
  }[status];

  return (
    <span class={`rounded-full px-3 py-1 text-xs font-semibold ${className}`}>
      {label}
    </span>
  );
}

function WebhookDetails({ log }: { log: WebhookLog }) {
  return (
    <div>
      <div class="border-b border-zinc-800 p-5">
        <div class="flex flex-wrap items-center gap-3">
          <span class="rounded-md bg-emerald-500/10 px-2 py-1 text-xs font-bold text-emerald-300">
            {log.method}
          </span>

          <h2 class="font-mono text-sm text-zinc-300">
            {log.id}
          </h2>
        </div>

        <p class="mt-3 text-sm text-zinc-500">
          Recebido em {new Date(log.receivedAt).toLocaleString()}
        </p>
      </div>

      <div class="space-y-6 p-5">
        <DetailBlock title="Headers" value={log.headers} />
        <DetailBlock title="Query Params" value={log.query} />

        {log.bodyJson !== null ? (
          <DetailBlock title="Body JSON" value={log.bodyJson} />
        ) : (
          <TextBlock title="Body bruto" value={log.bodyText} />
        )}
      </div>
    </div>
  );
}

function DetailBlock({ title, value }: { title: string; value: unknown }) {
  return (
    <section>
      <h3 class="mb-2 text-sm font-semibold text-zinc-400">{title}</h3>
      <pre class="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-300">
        {JSON.stringify(value, null, 2)}
      </pre>
    </section>
  );
}

function TextBlock({ title, value }: { title: string; value: string }) {
  return (
    <section>
      <h3 class="mb-2 text-sm font-semibold text-zinc-400">{title}</h3>
      <pre class="overflow-x-auto whitespace-pre-wrap rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-300">
        {value || "(body vazio)"}
      </pre>
    </section>
  );
}