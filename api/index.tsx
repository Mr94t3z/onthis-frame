import { Button, Frog, TextInput, parseEther } from 'frog';
import { handle } from 'frog/vercel';
import fetch from 'node-fetch';
// import { abiOnchain } from './abiOnchain.js'
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

// Looping dashboard frame
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
        <Button action='/transaction' value={item.description}>💰 {item.token}</Button>
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

app.frame('/transaction', (c) => {
  const { buttonValue } = c

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
            <p style={{ justifyContent: 'center', textAlign: 'center', fontSize: 40}}>{buttonValue}</p>
          </div>
      </div>
    ),
    intents: [
      <TextInput placeholder="Enter ETH amount..." />,
      <Button.Transaction target="/transfer">Transfer</Button.Transaction>,
    ],
  });
});

app.transaction('/transfer', (c) => {
  // Send transaction response.
  const { inputText } = c;
  const value = inputText ? inputText : '0';
  return c.send({
    chainId: 'eip155:84532',
    to: '0x130946d8dF113e45f44e13575012D0cFF1E53e37',
    value: parseEther(value),
  });
});

// app.transaction('/mint', async (c) => {
//   // Contract transaction response.

//   const { inputText } = c;
//   const accounts =

//   const value = inputText ? BigInt(inputText) : BigInt(0);
//   // Convert the value to the smallest token unit (e.g., wei)
//   const tokenValue = value * BigInt(10) ** BigInt(18); 

//   const contractResponse = c.contract({
//     abi,
//     chainId: 'eip155:8453',
//     functionName: 'approve',
//     args: [
//       `0x${accounts}`, // Convert accounts to string
//       tokenValue, // Example: Approve 100 tokens
//     ],
//     to: '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed' // Replace with your actual token contract address
//   });

//   // Wait for the approval transaction to be mined
//   await contractResponse;

//   // Now, send the approved tokens to another address
//   return c.contract({
//     abi,
//     chainId: 'eip155:8453',
//     functionName: 'transfer',
//     args: [
//       '0x17b217d4b29063c96d59d5a54211582bee9cfb0d', // Replace with the address you want to send the tokens to
//       tokenValue, // Example: Send 100 tokens
//     ],
//     to: '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed' // Replace with your actual token contract address
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
    ],
  })
})

// Export handlers
export const GET = handle(app);
export const POST = handle(app);
