import { saveRelayAttempt } from "./webhook_store.ts";
import type { RelayAttempt, WebhookLog } from "./types.ts";

function buildForwardHeaders(log: WebhookLog): Headers {
  const headers = new Headers();

  for (const [key, value] of Object.entries(log.headers)) {
    const lower = key.toLowerCase();

    if (
      lower === "host" ||
      lower === "content-length" ||
      lower === "connection" ||
      lower === "accept-encoding"
    ) {
      continue;
    }

    headers.set(key, value);
  }

  headers.set("x-hookcheck-relayed", "true");
  headers.set("x-hookcheck-channel", log.channel);
  headers.set("x-hookcheck-log-id", log.id);

  return headers;
}

export async function relayWebhook(
  log: WebhookLog,
  targetUrl: string,
): Promise<RelayAttempt> {
  const startedAt = performance.now();

  try {
    const response = await fetch(targetUrl, {
      method: log.method,
      headers: buildForwardHeaders(log),
      body: log.bodyText,
    });

    const responseBody = await response.text();

    const attempt: RelayAttempt = {
      id: crypto.randomUUID(),
      channel: log.channel,
      webhookLogId: log.id,
      targetUrl,
      status: response.ok ? "success" : "error",
      responseStatus: response.status,
      responseBody: responseBody.slice(0, 4000),
      errorMessage: null,
      durationMs: Math.round(performance.now() - startedAt),
      createdAt: new Date().toISOString(),
    };

    await saveRelayAttempt(attempt);

    return attempt;
  } catch (error) {
    const attempt: RelayAttempt = {
      id: crypto.randomUUID(),
      channel: log.channel,
      webhookLogId: log.id,
      targetUrl,
      status: "error",
      responseStatus: null,
      responseBody: null,
      errorMessage: error instanceof Error ? error.message : String(error),
      durationMs: Math.round(performance.now() - startedAt),
      createdAt: new Date().toISOString(),
    };

    await saveRelayAttempt(attempt);

    return attempt;
  }
}