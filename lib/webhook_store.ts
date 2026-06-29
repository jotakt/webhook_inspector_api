import { getKv } from "./kv.ts";
import type { ChannelConfig, RelayAttempt, WebhookLog } from "./types.ts";

const ONE_DAY_MS = 1000 * 60 * 60 * 24;
const THIRTY_DAYS_MS = 1000 * 60 * 60 * 24 * 30;

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

    if (logs.length >= limit) break;
  }

  return logs.sort((a, b) => {
    return new Date(b.receivedAt).getTime() -
      new Date(a.receivedAt).getTime();
  });
}

export async function clearWebhookLogs(channel: string) {
  const kv = await getKv();

  const entries = kv.list({
    prefix: ["webhook_logs", channel],
  });

  const atomic = kv.atomic();

  for await (const entry of entries) {
    atomic.delete(entry.key);
  }

  atomic.delete(["webhook_latest", channel]);

  await atomic.commit();
}

export async function watchLatestWebhook(channel: string) {
  const kv = await getKv();

  return kv.watch<WebhookLog | null>([
    ["webhook_latest", channel],
  ]);
}

export async function getChannelConfig(
  channel: string,
): Promise<ChannelConfig> {
  const kv = await getKv();

  const result = await kv.get<ChannelConfig>(["channel_config", channel]);

  if (result.value) {
    return result.value;
  }

  const now = new Date().toISOString();

  const config: ChannelConfig = {
    channel,
    name: channel,
    forwardTo: null,
    createdAt: now,
    updatedAt: now,
  };

  await kv.set(["channel_config", channel], config, {
    expireIn: THIRTY_DAYS_MS,
  });

  return config;
}

export async function saveChannelConfig(
  config: ChannelConfig,
): Promise<ChannelConfig> {
  const kv = await getKv();

  const updated: ChannelConfig = {
    ...config,
    updatedAt: new Date().toISOString(),
  };

  await kv.set(["channel_config", config.channel], updated, {
    expireIn: THIRTY_DAYS_MS,
  });

  return updated;
}

export async function saveRelayAttempt(attempt: RelayAttempt) {
  const kv = await getKv();

  await kv.set(
    ["relay_attempts", attempt.channel, attempt.id],
    attempt,
    { expireIn: ONE_DAY_MS },
  );
}

export async function listRelayAttempts(
  channel: string,
  limit = 50,
): Promise<RelayAttempt[]> {
  const kv = await getKv();

  const entries = kv.list<RelayAttempt>({
    prefix: ["relay_attempts", channel],
  });

  const attempts: RelayAttempt[] = [];

  for await (const entry of entries) {
    attempts.push(entry.value);

    if (attempts.length >= limit) break;
  }

  return attempts.sort((a, b) => {
    return new Date(b.createdAt).getTime() -
      new Date(a.createdAt).getTime();
  });
}