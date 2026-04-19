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
        {/* Phone-frame constraint: 390px centered, dark outer background */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              html { background: #0A0A0A; margin: 0; padding: 0; }
              body { background: #0A0A0A; margin: 0; padding: 0; display: flex; justify-content: center; min-height: 100vh; }
              #root { width: 390px !important; max-width: 390px !important; min-width: 390px !important; overflow: hidden !important; position: relative; background: #0A0A0A; transform-origin: top center; }
            `,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var root = document.getElementById('root');
                if (root && window.innerWidth > 430) {
                  root.style.width = '390px';
                  root.style.maxWidth = '390px';
                  root.style.margin = '0 auto';
                  root.style.overflow = 'hidden';
                }
              })();
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
