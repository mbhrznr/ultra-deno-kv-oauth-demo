import useAsset from "ultra/hooks/use-asset.js";

export default function App(
  { accessToken, isSignedIn }: {
    accessToken: string | null;
    isSignedIn: boolean;
  },
) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <title>Ultra Deno KV OAuth Demo</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="shortcut icon" href={useAsset("/favicon.ico")} />
      </head>
      <body>
        <main>
          <p>Provider: GitHub</p>
          <p>Signed in: {String(isSignedIn)}</p>
          <p>
            Your access token: {accessToken
              ? (
                <span style={{ filter: "blur(3px)" }}>
                  {accessToken} (intentionally blurred)
                </span>
              )
              : null}
          </p>
          <p>
            <a href="/signin">Sign in</a>
          </p>
          <p>
            <a href="/signout">Sign out</a>
          </p>
          <p>
            <a href="https://github.com/mbhrznr/ultra-deno-kv-oauth-demo">
              Source code
            </a>
          </p>
        </main>
      </body>
    </html>
  );
}
