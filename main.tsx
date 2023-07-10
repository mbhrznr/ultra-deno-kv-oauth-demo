import { type Context, createServer } from "ultra/server.ts";
import { loadSync } from "std/dotenv/mod.ts";
import {
  createGitHubOAuth2Client,
  getSessionAccessToken,
  getSessionId,
  handleCallback,
  signIn,
  signOut,
} from "kv_oauth";

import App from "./app.tsx";

loadSync({ export: true });

const oauth2Client = createGitHubOAuth2Client();

function request(ctx: Context) {
  return new Request(ctx.req.url, {
    body: ctx.req.body,
    headers: ctx.req.headers,
    method: ctx.req.method,
  });
}

const server = await createServer({
  importMapPath: import.meta.resolve("./importMap.json"),
});

server
  .get("/", async (ctx) => {
    const sessionId = await getSessionId(request(ctx));
    const isSignedIn = sessionId != null;
    const accessToken = isSignedIn
      ? await getSessionAccessToken(oauth2Client, sessionId)
      : null;
    const result = await server.render(
      <App {...{ accessToken, isSignedIn }} />,
    );

    return ctx.body(result, 200, {
      "content-type": "text/html; charset=utf-8",
    });
  })
  .get("/signin", async (ctx) => {
    return await signIn(request(ctx), oauth2Client);
  })
  .get("/callback", async (ctx) => {
    const { response } = await handleCallback(request(ctx), oauth2Client);
    return response;
  })
  .get("/signout", async (ctx) => {
    return await signOut(request(ctx));
  });

Deno.serve(server.fetch);
