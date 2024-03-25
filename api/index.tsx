import { Frog } from 'frog'
import { app as createShortcut } from './routes/createShortcut.js'
import { app as swapShortcut } from './routes/swapShortcut.js'
import { handle } from 'frog/vercel';
 
export const app = new Frog({
  assetsPath: '/',
  basePath: '/',
});

app.use(async (c, next) => {

  console.log('Incoming request:', c.req);

  await next();
  const isFrame = c.res.headers.get('content-type')?.includes('html');

  if (isFrame) {
    let html = await c.res.text();
    const metaTag = '<meta property="of:accepts:xmtp" content="2024-02-01" />';
    html = html.replace(/(<head>)/i, `$1${metaTag}`);
    c.res = new Response(html, {
      headers: {
        'content-type': 'text/html',
      },
    });
  }

  console.log('Outgoing response:', c.res);
});
 
app.route('/create-shortcut', createShortcut)
app.route('/swap-shortcut', swapShortcut)

// Export handlers
export const GET = handle(app);
export const POST = handle(app);