import { ScrollViewStyleReset } from 'expo-router/html'

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=390, initial-scale=1.0, maximum-scale=1.0" />
        <ScrollViewStyleReset />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              body { margin: 0; padding: 0; background: #0A0A0A; }
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
