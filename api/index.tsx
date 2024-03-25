import { Frog } from 'frog'
import { app as createShortcut } from './routes/createShortcut.js'
import { app as swapShortcut } from './routes/swapShortcut.js'
 
export const app = new Frog({
  assetsPath: '/',
  basePath: '/',
});

 
app.route('/example', createShortcut)
app.route('/swap', swapShortcut)