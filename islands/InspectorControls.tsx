import { useState } from "preact/hooks";

type Props = {
  channel: string;
  webhookUrl: string;
  initialName: string;
  initialForwardTo: string | null;
};

export function InspectorControls(
  { channel, webhookUrl, initialName, initialForwardTo }: Props,
) {
  const [name, setName] = useState(initialName);
  const [forwardTo, setForwardTo] = useState(initialForwardTo ?? "");
  const [status, setStatus] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function copyWebhookUrl() {
    await navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  async function saveSettings() {
    setStatus("Salvando...");

    const response = await fetch(`/api/channels/${channel}`, {
      method: "PUT",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        name,
        forwardTo,
      }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setStatus(data?.error ?? "Erro ao salvar.");
      return;
    }

    setStatus("Configurações salvas.");
    setTimeout(() => {
      location.reload();
    }, 500);
  }

  async function clearLogs() {
    const confirmed = confirm(
      "Tem certeza que deseja limpar os logs deste canal?",
    );

    if (!confirmed) return;

    setStatus("Limpando logs...");

    const response = await fetch(`/api/logs/${channel}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      setStatus("Erro ao limpar logs.");
      return;
    }

    location.reload();
  }

  return (
    <div class="mt-6 space-y-4">
      <div class="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
        <div class="flex items-start justify-between gap-4">
          <div class="min-w-0">
            <p class="mb-2 text-sm text-zinc-500">Webhook URL</p>
            <code class="break-all text-emerald-300">
              {webhookUrl}
            </code>
          </div>

          <button
            type="button"
            onClick={copyWebhookUrl}
            class="shrink-0 rounded-xl bg-emerald-400 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-emerald-300"
          >
            {copied ? "Copiado" : "Copiar"}
          </button>
        </div>
      </div>

      <div class="grid gap-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-4 md:grid-cols-2">
        <label class="block">
          <span class="text-sm font-medium text-zinc-300">
            Nome do canal
          </span>

          <input
            value={name}
            onInput={(event) => {
              setName((event.currentTarget as HTMLInputElement).value);
            }}
            class="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-emerald-400"
            placeholder="Ex: Stripe dev"
          />
        </label>

        <label class="block">
          <span class="text-sm font-medium text-zinc-300">
            Relay para endpoint
          </span>

          <input
            value={forwardTo}
            onInput={(event) => {
              setForwardTo((event.currentTarget as HTMLInputElement).value);
            }}
            class="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-emerald-400"
            placeholder="https://meu-backend.com/webhooks/stripe"
          />
        </label>

        <div class="flex flex-wrap items-center gap-3 md:col-span-2">
          <button
            type="button"
            onClick={saveSettings}
            class="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-zinc-200"
          >
            Salvar configurações
          </button>

          <button
            type="button"
            onClick={clearLogs}
            class="rounded-xl border border-red-500/40 px-4 py-2 text-sm font-semibold text-red-300 hover:bg-red-500/10"
          >
            Limpar logs
          </button>

          {status && (
            <span class="text-sm text-zinc-500">
              {status}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}