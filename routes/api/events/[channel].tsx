import { define } from "@/utils.ts";
import { watchLatestWebhook } from "@/lib/webhook_store.ts";

const encoder = new TextEncoder();

function sse(data: unknown, event = "message") {
  return encoder.encode(
    `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`,
  );
}

export const handler = define.handlers({
  async GET(ctx) {
    const channel = ctx.params.channel;

    const body = new ReadableStream({
      async start(controller) {
        controller.enqueue(
          sse(
            {
              channel,
              connectedAt: new Date().toISOString(),
            },
            "connected",
          ),
        );

        const watcher = await watchLatestWebhook(channel);

        try {
          for await (const entries of watcher) {
            const latest = entries[0]?.value;

            if (latest) {
              controller.enqueue(sse(latest, "webhook"));
            }
          }
        } catch (error) {
          controller.enqueue(
            sse(
              {
                error: String(error),
              },
              "error",
            ),
          );
        }
      },
    });

    return new Response(body, {
      headers: {
        "content-type": "text/event-stream",
        "cache-control": "no-cache",
        "connection": "keep-alive",
        "access-control-allow-origin": "*",
      },
    });
  },
});