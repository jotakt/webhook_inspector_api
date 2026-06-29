import { App, staticFiles } from "fresh";
import { define, type State } from "./utils.ts";

export const app = new App<State>();

app.use(staticFiles());

app.use(async (ctx) => {
  ctx.state.shared = "hello";
  return await ctx.next();
});

const exampleLoggerMiddleware = define.middleware((ctx) => {
  console.log(`${ctx.req.method} ${ctx.req.url}`);
  return ctx.next();
});

app.use(exampleLoggerMiddleware);

app.get("/health", () => {
  return new Response("ok");
});

app.fsRoutes();

export default app;