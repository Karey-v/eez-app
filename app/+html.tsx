import { ScrollViewStyleReset } from 'expo-router/html'

// This file controls the HTML shell for the Expo web export.
// It constrains the app to a 390px mobile viewport, centered on desktop,
// with a dark background — so the Vercel deploy always looks like a phone.
export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        {/* Expo's required reset: html/body/root height:100%, body overflow:hidden, root display:flex */}
        <ScrollViewStyleReset />
        {/* Phone-frame constraint: max-width 390px, centered, dark outer background */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              html, body {
                background-color: #0A0A0A;
              }
              body {
                display: flex;
                justify-content: center;
                align-items: stretch;
              }
              #root {
                max-width: 390px;
                width: 100%;
                height: auto;
                min-height: 100vh;
                flex-shrink: 0;
                box-shadow:
                  0 0 0 1px rgba(255, 255, 255, 0.07),
                  0 8px 48px rgba(0, 0, 0, 0.85);
                overflow-x: hidden;
                overflow-y: auto;
              }
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
