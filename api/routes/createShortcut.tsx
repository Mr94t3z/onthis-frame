import { Frog } from 'frog';
// import { abi } from './resources/abi.js';
// import { abi } from './resources/abiOnchain.js';
// import { abi } from './resources/erc20Abi.js';
 
export const app = new Frog()
 
app.frame('/', (c) => {
  return c.res({
    image : '/images/dashboard_black.jpeg',
  })
})

export default app;