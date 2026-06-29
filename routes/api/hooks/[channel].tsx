import { define } from "@/utils.ts";
import { relayWebhook } from "@/lib/relay.ts";
import {
  getChannelConfig,
  saveWebhookLog,
} from "@/lib/webhook_store.ts";
import type { WebhookLog } from "@/lib/types.ts";

function headersToObject(headers: Headers): Record<string, string> {
  const result: Record<string, string> = {};

  for (const [key, value] of headers.entries()) {
    result[key] = value;
  }

  return result;
}

function searchParamsToObject(url: URL): Record<string, string> {
  const result: Record<string, string> = {};

  for (const [key, value] of url.searchParams.entries()) {
    result[key] = value;
  }

  return result;
}

function tryParseJson(bodyText: string, contentType: string | null): unknown | null {
  if (!contentType?.includes("application/json")) {
    return null;
  }

  try {
    return JSON.parse(bodyText);
  } catch {
    return null;
  }
}

async function handleWebhook(ctx: any) {
  const channel = ctx.params.channel;
  const req = ctx.req;
  const url = new URL(req.url);
  const contentType = req.headers.get("content-type");
  const bodyText = await req.text();

  const log: WebhookLog = {
    id: crypto.randomUUID(),
    channel,
    method: req.method,
    url: req.url,
    path: url.pathname,
    query: searchParamsToObject(url),
    headers: headersToObject(req.headers),
    bodyText,
    bodyJson: tryParseJson(bodyText, contentType),
    contentType,
    receivedAt: new Date().toISOString(),
    sizeBytes: new TextEncoder().encode(bodyText).byteLength,
    remoteAddr: req.headers.get("x-forwarded-for") ??
      req.headers.get("x-real-ip") ??
      null,
  };

  await saveWebhookLog(log);

  const config = await getChannelConfig(channel);

  let relay = null;

  if (config.forwardTo) {
    relay = await relayWebhook(log, config.forwardTo);
  }

  return new Response(
    JSON.stringify(
      {
        ok: true,
        saved: true,
        relayed: Boolean(relay),
        relay,
        source: "file-route",
        channel,
        id: log.id,
        method: req.method,
        receivedAt: log.receivedAt,
      },
      null,
      2,
    ),
    {
      status: 202,
      headers: {
        "content-type": "application/json",
        "access-control-allow-origin": "*",
      },
    },
  );
}

export const handler = define.handlers({
  POST: handleWebhook,
  PUT: handleWebhook,
  PATCH: handleWebhook,
  DELETE: handleWebhook,

  OPTIONS() {
    return new Response(null, {
      status: 204,
      headers: {
        "access-control-allow-origin": "*",
        "access-control-allow-methods": "POST, PUT, PATCH, DELETE, OPTIONS",
        "access-control-allow-headers": "*",
      },
    });
  },
});