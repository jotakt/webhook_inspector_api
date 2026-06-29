import { define } from "@/utils.ts";
import {
  getChannelConfig,
  saveChannelConfig,
} from "@/lib/webhook_store.ts";

export const handler = define.handlers({
  async GET(ctx) {
    const channel = ctx.params.channel;
    const config = await getChannelConfig(channel);

    return Response.json(config);
  },

  async PUT(ctx) {
    const channel = ctx.params.channel;
    const body = await ctx.req.json().catch(() => null);

    if (!body) {
      return Response.json(
        { ok: false, error: "Invalid JSON body" },
        { status: 400 },
      );
    }

    const current = await getChannelConfig(channel);

    const name = typeof body.name === "string" && body.name.trim()
      ? body.name.trim().slice(0, 80)
      : channel;

    const forwardTo = typeof body.forwardTo === "string" &&
        body.forwardTo.trim()
      ? body.forwardTo.trim()
      : null;

    if (forwardTo) {
      try {
        const url = new URL(forwardTo);

        if (!["http:", "https:"].includes(url.protocol)) {
          return Response.json(
            { ok: false, error: "forwardTo must be an HTTP or HTTPS URL" },
            { status: 400 },
          );
        }
      } catch {
        return Response.json(
          { ok: false, error: "Invalid forwardTo URL" },
          { status: 400 },
        );
      }
    }

    const updated = await saveChannelConfig({
      ...current,
      name,
      forwardTo,
    });

    return Response.json({
      ok: true,
      config: updated,
    });
  },
});