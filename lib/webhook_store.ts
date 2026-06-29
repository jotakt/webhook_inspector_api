import { getKv } from "./kv.ts";
import type { WebhookLog } from "./types.ts";

const ONE_DAY_MS = 1000 * 60 * 60 * 24;

export async function saveWebhookLog(log: WebhookLog) {
  const kv = await getKv();

  const logKey = ["webhook_logs", log.channel, log.id];
  const latestKey = ["webhook_latest", log.channel];

  await kv.atomic()
    .set(logKey, log, { expireIn: ONE_DAY_MS })
    .set(latestKey, log, { expireIn: ONE_DAY_MS })
    .commit();
}

export async function listWebhookLogs(
  channel: string,
  limit = 50,
): Promise<WebhookLog[]> {
  const kv = await getKv();

  const entries = kv.list<WebhookLog>({
    prefix: ["webhook_logs", channel],
  });

  const logs: WebhookLog[] = [];

  for await (const entry of entries) {
    logs.push(entry.value);

    if (logs.length >= limit) {
      break;
    }
  }

  return logs.sort((a, b) => {
    return new Date(b.receivedAt).getTime() -
      new Date(a.receivedAt).getTime();
  });
}

export async function watchLatestWebhook(channel: string) {
  const kv = await getKv();

  return kv.watch<WebhookLog | null>([
    ["webhook_latest", channel],
  ]);
}