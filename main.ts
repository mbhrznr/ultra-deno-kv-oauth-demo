// deno run --allow-net --allow-read --allow-env --unstable
import {
  Application,
  Context,
  Router,
} from "https://deno.land/x/oak@v12.5.0/mod.ts";
import { loadSync } from "https://deno.land/std@0.192.0/dotenv/mod.ts";
import {
  createGitHubOAuth2Client,
  getSessionAccessToken,
  getSessionId,
  handleCallback,
  signIn,
  signOut,
} from "https://deno.land/x/deno_kv_oauth@v0.2.4/mod.ts";

loadSync({ export: true });

const oauth2Client = createGitHubOAuth2Client();

/**
 * This is required for Oak to convert between web-standard
 * and Oak `Request` and `Response` interfaces.
 *
 * @see {@link https://github.com/oakserver/oak/issues/533}
 */
export async function wrapOakRequest(
  ctx: Context,
  fn: (request: Request) => Promise<Response>,
) {
  const req = new Request(ctx.request.url.toString(), {
    body: ctx.request.originalRequest.getBody().body,
    headers: ctx.request.headers,
    method: ctx.request.method,
  });

  const response = await fn(req);

  ctx.response.status = response.status;
  ctx.response.headers = response.headers;
  ctx.response.body = response.body;
}

const router = new Router();
router
  .get("/", async (context) => {
    await wrapOakRequest(context, async (request) => {
      const sessionId = await getSessionId(request);
      const isSignedIn = sessionId !== null;
      const accessToken = isSignedIn
        ? await getSessionAccessToken(oauth2Client, sessionId)
        : null;

      const accessTokenInnerText = accessToken !== null
        ? `<span style="filter:blur(3px)">${accessToken}</span> (intentionally blurred for security)`
        : accessToken;

      const body = `
        <p>Provider: GitHub</p>
        <p>Signed in: ${isSignedIn}</p>
        <p>Your access token: ${accessTokenInnerText}</p>
        <p>
          <a href="/signin">Sign in</a>
        </p>
        <p>
          <a href="/signout">Sign out</a>
        </p>
        <p>
          <a href="https://dash.deno.com/playground/oak-deno-kv-oauth-demo">Source code</a>
        </p>
      `;

      return new Response(body, {
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    });
  })
  .get("/signin", async (context) => {
    await wrapOakRequest(context, async (request) => {
      return await signIn(request, oauth2Client);
    });
  })
  .get("/callback", async (context) => {
    await wrapOakRequest(context, async (request) => {
      const { response } = await handleCallback(request, oauth2Client);
      return response;
    });
  })
  .get("/signout", async (context) => {
    await wrapOakRequest(context, async (request) => {
      return await signOut(request);
    });
  });

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

const port = 8000;
app.listen({ port: 8000 });
console.log(`Listening on http://localhost:${port}/`);
