import { ScrollViewStyleReset } from 'expo-router/html'

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
        <ScrollViewStyleReset />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              * { box-sizing: border-box; }
              html, body { margin: 0; padding: 0; background: #0A0A0A; display: flex; justify-content: center; align-items: flex-start; min-height: 100vh; }
              #root { width: 390px; flex-shrink: 0; position: relative; overflow: hidden; background: #0A0A0A; }
            `,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              function fixLayout() {
                var root = document.getElementById('root');
                if (!root) return;
                var vw = window.innerWidth;
                if (vw > 430) {
                  var scale = Math.min(1, (window.innerHeight - 40) / 844);
                  root.style.transform = 'scale(' + scale + ')';
                  root.style.transformOrigin = 'top center';
                  root.style.height = '844px';
                  root.style.width = '390px';
                  root.style.margin = '20px auto';
                }
              }
              window.addEventListener('load', fixLayout);
              window.addEventListener('resize', fixLayout);
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
