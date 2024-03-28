import { Button, Frog, TextInput, parseEther } from 'frog';
import { handle } from 'frog/vercel';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
// Uncomment this packages to tested on local server
// import { devtools } from 'frog/dev';
// import { serveStatic } from 'frog/serve-static';


// Load environment variables from .env file
dotenv.config();

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
  const csvUrl = process.env.CSV_API_URL;

  // Check if csvUrl is defined before attempting to fetch
  if (!csvUrl) {
    console.error('CSV_API_URL is not defined');
    return;
  }

  try {
    const response = await fetch(csvUrl);

    // Check if the fetch was successful
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.status} ${response.statusText}`);
    }

    const csvText = await response.text();
    const rows = csvText.split('\n');

    rows.forEach((row, index) => {
      if (index === 0 || row.trim() === '') return; // Skip header row and empty rows

      const columns = row.split(',');
      if (columns.length < 5) { // Assuming 5 columns expected
        console.error(`Skipping malformed row: ${row}`);
        return;
      }

      const originChain = columns[3].trim();
      const destinationChain = columns[4].trim();

      if (!unsupportedChain.includes(originChain)) {
        const swapData = {
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
  } catch (error) {
    console.error('Error loading or processing CSV:', error);
  }
}



// Call function to populate data
readCSV();

// Initialize Frog app
export const app = new Frog({
  assetsPath: '/',
  basePath: '/api/frame',
});

// Support Open Frames
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

// Initial frame
app.frame('/', (c) => {
  currentPage = 1;
  return c.res({
    image: '/images/dashboard.jpeg',
    intents: [
      <Button action="/create-shortcut">👉🏻 Create Shortcut</Button>,
      <Button action="/swap-shortcut">Swap Shortcut 👈🏻</Button>,
    ],
  });
});

// Swap Shortcut frame state
app.frame('/swap-shortcut', (c) => {
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
    action: '/swap-shortcut',
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
        <Button action={`/transaction/${item.shortcutAddress}/${item.token}/${item.description}/${item.originChain}/${item.destinationChain}`} value={`💰 ${item.token}`}>
          {`💰 ${item.token}`}
        </Button>
      )),
      currentPage < totalPages && <Button value="next">Next ➡️</Button>,
    ],
  });
});


app.frame('/transaction/:shortcutAddress/:token/:description/:originChain/:destinationChain', (c) => {
  const { shortcutAddress, token, description, originChain, destinationChain } = c.req.param();

  return c.res({
    action: `/finish/${originChain}`,
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
      // <Button action={`/swap-shortcut`}>Cancel 🙅🏻‍♂️</Button>,
      <Button.Reset>Cancel 🙅🏻‍♂️</Button.Reset>,
      <Button.Transaction target={`/transfer/${shortcutAddress}/${originChain}`}>Transfer ETH</Button.Transaction>,
    ],
  });
});

app.transaction('/transfer/:shortcutAddress/:originChain', async (c, next) => {
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
  // Send transaction response.
  const { inputText } = c;
  const value = inputText ? inputText : '0';

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
  // console.log('Shortcut Address:', shortcutAddress, typeof shortcutAddress);
  // console.log('Chain ID:', chainIdStr, typeof chainIdStr);

  return c.send({
    chainId: chainIdStr,
    to: shortcutAddress as `0x${string}`,
    value: parseEther(value),
  })
});


app.frame('/finish/:originChain', (c) => {
  const { transactionId } = c
  const { originChain } = c.req.param();

  let originChainScan = '';

  switch (originChain) {
    case 'Optimism':
      originChainScan = 'https://optimistic.etherscan.io/tx/';
      break;
    case 'Base':
      originChainScan = 'https://basescan.org/tx/';
      break;
    case 'Base Sepolia':
      originChainScan = 'https://base-sepolia.blockscout.com/tx/';
      break;
    case 'Zora':
      originChainScan = 'https://zora.superscan.network/tx/';
      break;
    default:
      break;
  }
  
  const buttonLink = transactionId && originChainScan ? (
    <Button.Link href={`${originChainScan}${transactionId}`}>
      View on {originChain}
    </Button.Link>
  ) : null;

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
      buttonLink
    ],
  })
})


// Uncomment this line code to tested on local server
// devtools(app, { serveStatic });

// Export handlers
export const GET = handle(app);
export const POST = handle(app);