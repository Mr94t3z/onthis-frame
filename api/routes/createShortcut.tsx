import { Button, Frog, TextInput } from 'frog'
import { abi } from '../resources/abiOnchain.js';
// import { abi } from '../resources/abi.js';
// import { abi } from '../resources/erc20Abi.js';
 
export const app = new Frog()
 
app.frame('/', (c) => {
  return c.res({
    action: '/finish',
    image: (
        <div
        style={{
          alignItems: 'center',
          background: 'white',
          backgroundSize: '100% 100%',
          display: 'flex',
          flexDirection: 'column',
          flexWrap: 'nowrap',
          height: '100%',
          justifyContent: 'center',
          textAlign: 'center',
          width: '100%',
          color: 'white',
          fontSize: 60,
          fontStyle: 'normal',
          letterSpacing: '-0.025em',
          lineHeight: 1.4,
          marginTop: 0,
          padding: '0 120px',
          whiteSpace: 'pre-wrap',
        }}
      >
          <div style={{ alignItems: 'center', color: 'black', display: 'flex', fontSize: 30, flexDirection: 'column', marginBottom: 60 }}>
          <p style={{ justifyContent: 'center', textAlign: 'center', fontSize: 40}}>Perform to Create Shortcut</p>
          </div>
      </div>
    ),
    intents: [
      <TextInput placeholder="Enter Pool Address..." />,
      <Button.Transaction target="/create">Create Shortcut</Button.Transaction>,
    ]
  })
})
 
app.frame('/finish', (c) => {
  const { transactionId } = c
  return c.res({
    image: (
      <div style={{ color: 'white', display: 'flex', fontSize: 60 }}>
        Transaction ID: {transactionId}
      </div>
    )
  })
})

 
app.transaction('/create', async (c, next) => {
    await next();
    const txParams = await c.res.json();
    txParams.attribution = false;
    console.log(txParams);
    c.res = new Response(JSON.stringify(txParams), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  },
   (c) => {
    const { inputText } = c;
    // Contract transaction call
    return c.contract({
      abi: abi,
      chainId: 'eip155:8453',
      functionName: 'createShortcut',
      args: [
        inputText as `0x${string}`, // Pool address
        3, // pType as uint8
        BigInt(8453), // _cId as uint256, assuming it's the same as your chainId
      ],
      to : '0x892C413A65193bC42A5FF23103E6231465b3861c',
      
    })
  })
  
  