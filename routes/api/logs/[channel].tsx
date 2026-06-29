import { define } from "@/utils.ts";
import { clearWebhookLogs } from "@/lib/webhook_store.ts";

export const handler = define.handlers({
  async DELETE(ctx) {
    const channel = ctx.params.channel;

    await clearWebhookLogs(channel);

    return Response.json({
      ok: true,
      channel,
      cleared: true,
    });
  },
});