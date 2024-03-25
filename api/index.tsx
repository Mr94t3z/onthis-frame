import { Button, Frog, TextInput, parseEther } from 'frog';
import { handle } from 'frog/vercel';
import fetch from 'node-fetch';
// import { abi } from './abi.js';
// import { abi } from './abiOnchain.js'
// import { abi } from './erc20Abi.js';

// Define the type for the CSV row
interface SwapData {
  shortcutAddress: string;
  description: string;
  token: string;
  originChain: string;
  destinationChain: string;
}

const apiData: SwapData[] = [];
let currentPage = 1;
const itemsPerPage = 1;
let totalPages = 0;

// Define unsupported chain(s)
const unsupportedChain = ['Mainnet', 'Arbitrum', 'Polygon'];

async function readCSV() {
  const csvUrl = 'https://raw.githubusercontent.com/Mr94t3z/request-farcaster-api/master/resources/data.csv';
  const response = await fetch(csvUrl);
  const csvText = await response.text();

  const rows = csvText.split('\n');
  rows.forEach((row, index) => {
    if (index === 0) return; // Skip header row
    const columns = row.split(',');
    const originChain = columns[3].trim(); // Trim the originChain value
    const destinationChain = columns[4].trim(); // Trim the destinationChain value
    // Check if neither the origin chain nor the destination chain is in the unsupported chain list, if so, add to apiData
    if (!unsupportedChain.includes(originChain) && !unsupportedChain.includes(destinationChain)) {
      const swapData: SwapData = {
        shortcutAddress: columns[0],
        description: columns[1],
        token: columns[2],
        originChain: originChain,
        destinationChain: destinationChain,
      };
      apiData.push(swapData);
    }
  });

  totalPages = Math.ceil(apiData.length / itemsPerPage);
  console.log('CSV file successfully processed.');
}


// Call function to populate data
readCSV();

// Initialize Frog app
export const app = new Frog({
  assetsPath: '/',
  basePath: '/api/frame',
});

// Initial frame
app.frame('/', (c) => {
  currentPage = 1;
  return c.res({
    action: '/dashboard',
    image: '/images/dashboard.jpeg',
    intents: [
      <Button action="/dashboard" value="dashboard page">Let's Get Started!</Button>,
    ],
  });
});

// Dashboard frame state
app.frame('/dashboard', (c) => {
  const { buttonValue } = c;

  if (buttonValue === 'next' && currentPage < totalPages) {
    currentPage++;
  } else if (buttonValue === 'back' && currentPage > 1) {
    currentPage--;
  }

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, apiData.length);
  const displayData = apiData.slice(startIndex, endIndex);

  return c.res({
    action: '/dashboard',
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
        {displayData.map((item, index) => (
          <div key={index} style={{ alignItems: 'center', color: 'black', display: 'flex', fontSize: 30, flexDirection: 'column', marginBottom: 60 }}>
            <p style={{ justifyContent: 'center', textAlign: 'center', fontSize: 40}}>💰 {item.token}</p>
            <p>{item.description}</p>
            <p>
              <img src={
                item.originChain === 'Mainnet' ? '/images/chain/eth.png' :
                item.originChain === 'Optimism' ? '/images/chain/op.png' :
                item.originChain === 'Base' ? '/images/chain/base.png' :
                item.originChain === 'Arbitrum' ? '/images/chain/arb.png' :
                item.originChain === 'Polygon' ? '/images/chain/polygon.png' :
                '/images/icon.png'
              } width='40px' height='40px' alt="Chain logo" />
              &nbsp;
              {item.originChain}
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <span>🔀</span>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <img src={
                item.destinationChain === 'Mainnet' ? '/images/chain/eth.png' :
                item.destinationChain === 'Optimism' ? '/images/chain/op.png' :
                item.destinationChain === 'Base' ? '/images/chain/base.png' :
                item.destinationChain === 'Arbitrum' ? '/images/chain/arb.png' :
                item.destinationChain === 'Polygon' ? '/images/chain/polygon.png' :
                '/images/icon.png'
              } width='40px' height='40px' alt="Chain logo" />
              &nbsp;
              {item.destinationChain}
            </p>
            <p>Contract : {item.shortcutAddress} </p> 
          </div>
        ))}
      </div>
    ),
    intents: [
      currentPage > 1 && <Button value="back">⬅️ Previous</Button>,
      ...displayData.map(item => (
        // <Button action='/getAddress' value={item.description}>💰 {item.token}</Button>
        <Button action={`/transaction/${encodeURIComponent(item.shortcutAddress)}/${encodeURIComponent(item.token)}/${encodeURIComponent(item.description)}/${encodeURIComponent(item.originChain)}/${encodeURIComponent(item.destinationChain)}`} value={`💰 ${item.token}`}>
          {`💰 ${item.token}`} {/* Add content inside the button */}
        </Button>
      )),
      currentPage < totalPages && <Button value="next">Next ➡️</Button>,
    ],
  });
});

// app.frame('/getAddress', (c) => {
//   const { buttonValue } = c

//   return c.res({
//     action: '/transaction',
//     image: (
//       <div
//         style={{
//           alignItems: 'center',
//           background: 'white',
//           backgroundSize: '100% 100%',
//           display: 'flex',
//           flexDirection: 'column',
//           flexWrap: 'nowrap',
//           height: '100%',
//           justifyContent: 'center',
//           textAlign: 'center',
//           width: '100%',
//           color: 'white',
//           fontSize: 60,
//           fontStyle: 'normal',
//           letterSpacing: '-0.025em',
//           lineHeight: 1.4,
//           marginTop: 0,
//           padding: '0 120px',
//           whiteSpace: 'pre-wrap',
//         }}
//       >
//           <div style={{ alignItems: 'center', color: 'black', display: 'flex', fontSize: 30, flexDirection: 'column', marginBottom: 60 }}>
//             <p style={{ justifyContent: 'center', textAlign: 'center', fontSize: 40}}>{buttonValue}</p>
//           </div>
//       </div>
//     ),
//     intents: [
//       <TextInput placeholder="Enter your EVM wallet address..." />,
//       <Button action='/transaction' value={buttonValue}>Submit</Button>
//     ],
//   });
// });

app.frame('/transaction/:shortcutAddress/:token/:description/:originChain/:destinationChain', (c) => {
  const { shortcutAddress, token, description, originChain, destinationChain } = c.req.param()

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
          <p style={{ justifyContent: 'center', textAlign: 'center', fontSize: 40}}>💰 {token}</p>
            <p>{description}</p>
            <p>
              <img src={
                originChain === 'Mainnet' ? '/images/chain/eth.png' :
                originChain === 'Optimism' ? '/images/chain/op.png' :
                originChain === 'Base' ? '/images/chain/base.png' :
                originChain === 'Arbitrum' ? '/images/chain/arb.png' :
                originChain === 'Polygon' ? '/images/chain/polygon.png' :
                '/images/icon.png'
              } width='40px' height='40px' alt="Chain logo" />
              &nbsp;
              {originChain}
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <span>🔀</span>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <img src={
                destinationChain === 'Mainnet' ? '/images/chain/eth.png' :
                destinationChain === 'Optimism' ? '/images/chain/op.png' :
                destinationChain === 'Base' ? '/images/chain/base.png' :
                destinationChain === 'Arbitrum' ? '/images/chain/arb.png' :
                destinationChain === 'Polygon' ? '/images/chain/polygon.png' :
                '/images/icon.png'
              } width='40px' height='40px' alt="Chain logo" />
              &nbsp;
              {destinationChain}
            </p>
            <p>Contract : {shortcutAddress} </p> 
          </div>
      </div>
    ),
    intents: [
      <TextInput placeholder="Enter ETH Amount..." />,
      <Button.Transaction target={`/transfer/${shortcutAddress}/${originChain}`}>Transfer ETH</Button.Transaction>,
    ],
  });
});

app.transaction('/transfer/:shortcutAddress/:originChain', (c) => {
  // Send transaction response.
  const { inputText } = c;
  const value = inputText ? inputText : '0';

  // const value = inputText ? BigInt(inputText) : BigInt(0);
  // const valueInEth = inputText ? parseFloat(inputText) : 0;
  // const value = BigInt(Math.round(valueInEth * 10**18));

  // Get the chain ID
  const getChainId = (chain: string) => {
    switch (chain) {
      case 'Optimism':
        return 'eip155:10';
      case 'Base':
        return 'eip155:8453';
      case 'Base Sepolia':
        return 'eip155:84532';
      case 'Zora':
        return 'eip155:7777777';
      default:
        throw new Error(`Unsupported chain: ${chain}`);
    }
  };

  const { shortcutAddress, originChain } = c.req.param();
  const chainIdStr = getChainId(originChain);

  // Log the data type of shortcutAddress and chainIdStr
  console.log('Shortcut Address:', shortcutAddress, typeof shortcutAddress);
  // console.log('Chain ID:', chainIdStr, typeof chainIdStr);


  return c.send({
    chainId: chainIdStr,
    to: '0x8d9da47221ea063cab0ec945074c363a0c0f6a93',
    value: parseEther(value),
  })


  // return c.res({ 
  //   chainId: chainIdStr,
  //   method: 'eth_sendTransaction',
  //   params: { 
  //     to: shortcutAddress as `0x${string}`, 
  //     value: parseEther(value), 
  //   }, 
  // });

  // return c.contract({
  //   abi,
  //   chainId: chainIdStr,
  //   functionName: 'transfer',
  //   args: [
  //     '0x0000000000000000000000000000000000000000',
  //     value,
  //   ],
  //   to: shortcutAddress as `0x${string}`,
  // });

  // return c.contract({
  //   abi,
  //   chainId: chainIdStr,
  //   functionName: 'mint',
  //   args:[69420n],
  //   to: '0x130946d8dF113e45f44e13575012D0cFF1E53e37',
  //   value: parseEther(value),
  // });
  
  
  // const value = inputText ? BigInt(Math.round(parseFloat(inputText) * 1000)) : BigInt(0); // Convert floating-point number to integer

  // // Convert the value to the smallest token unit (e.g., wei)
  // const tokenValue = value * BigInt(10) ** BigInt(15); // Adjust the power of 10 accordingly based on token decimals

//   const contractResponse = c.contract({
//     abi,
//     chainId: chainIdStr,
//     functionName: 'approve',
//     args: [
//       '0x130946d8dF113e45f44e13575012D0cFF1E53e37',
//       parseEther('0.005'), // Example: Approve 100 tokens
//     ],
//     to: '0x0000000000000000000000000000000000000000'
//   });

//   // Wait for the approval transaction to be mined
//   await contractResponse;

//   // // Now, send the approved tokens to another address
//   return c.contract({
//     abi,
//     chainId: chainIdStr,
//     functionName: 'transfer',
//     args: [
//       shortcutAddress as `0x${string}`,
//       parseEther('0.005'), 
//     ],
//     to: '0x0000000000000000000000000000000000000000'
//   });
});

app.transaction('/send-ether', (c) => {
  const { inputText } = c;
  const value = inputText ? inputText : '0';

  // Send transaction response.
  return c.send({
    chainId: 'eip155:8453',
    to: '0x17b217d4b29063c96d59d5a54211582bee9cfb0d',
    value: parseEther(value),
  })
})


// app.transaction('/mint/:shortcutAddress', async (c) => {
//   // Contract transaction response.

//   const { shortcutAddress } = c.req.param();

//   const { inputText } = c;

//   const value = inputText ? BigInt(inputText) : BigInt(0);
//   // Convert the value to the smallest token unit (e.g., wei)
//   const tokenValue = value * BigInt(10) ** BigInt(18); 

//   const contractResponse = c.contract({
//     abi,
//     chainId: 'eip155:8453',
//     functionName: 'approve',
//     args: [
//       shortcutAddress as `0x${string}`, // Convert accounts to string
//       tokenValue, // Example: Approve 100 tokens
//     ],
//     to: '0x4200000000000000000000000000000000000006' // Replace with your actual token contract address
//   });

//   // Wait for the approval transaction to be mined
//   await contractResponse;

//   // Now, send the approved tokens to another address
//   return c.contract({
//     abi,
//     chainId: 'eip155:8453',
//     functionName: 'transfer',
//     args: [
//       shortcutAddress as `0x${string}`, // Replace with the address you want to send the tokens to
//       tokenValue, // Example: Send 100 tokens
//     ],
//     to: '0x4200000000000000000000000000000000000006' // Replace with your actual token contract address
//   });
// })


app.frame('/finish', (c) => {
  const { transactionId } = c
  return c.res({
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
            <p style={{ justifyContent: 'center', textAlign: 'center', fontSize: 40}}>🧾 Transaction ID:</p>
            <p>{transactionId}</p>
          </div>
      </div>
    ),
    intents: [
      <Button.Reset>🏠 Home</Button.Reset>,
      <Button.Redirect location={`https://basescan.org/tx/${transactionId}`}>
        View on BaseScan
      </Button.Redirect>,
    ],
  })
})

// Export handlers
export const GET = handle(app);
export const POST = handle(app);
