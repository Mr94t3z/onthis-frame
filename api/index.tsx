import { Button, Frog, TextInput, parseEther } from 'frog';
import { handle } from 'frog/vercel';
import fetch from 'node-fetch';

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

// Function to fetch and parse CSV data from GitHub
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
    // Check if neither the origin chain nor the destination chain is 'Polygon', if so, add to apiData
    if (originChain !== 'Polygon' && destinationChain !== 'Polygon') {
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
    image: '/dashboard.jpeg',
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
                item.originChain === 'Mainnet' ? '/eth.png' :
                item.originChain === 'Optimism' ? '/op.png' :
                item.originChain === 'Base' ? '/base.png' :
                item.originChain === 'Arbitrum' ? '/arb.png' :
                item.originChain === 'Polygon' ? '/polygon.png' :
                '/other.png'
              } width='40px' height='40px' alt="Chain logo" />
              &nbsp;
              {item.originChain}
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <span>🔀</span>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <img src={
                item.destinationChain === 'Mainnet' ? '/eth.png' :
                item.destinationChain === 'Optimism' ? '/op.png' :
                item.destinationChain === 'Base' ? '/base.png' :
                item.destinationChain === 'Arbitrum' ? '/arb.png' :
                item.destinationChain === 'Polygon' ? '/polygon.png' :
                '/other.png'
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
        <Button action='/transaction' value={item.token}>💰 {item.token}</Button>
      )),
      currentPage < totalPages && <Button value="next">Next ➡️</Button>,
    ],
  });
});


app.frame('/transaction', (c) => {

  return c.res({
    action: '/transaction',
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
            <p style={{ justifyContent: 'center', textAlign: 'center', fontSize: 40}}>Swap</p>
          </div>
      </div>
    ),
    intents: [
      <TextInput placeholder="Enter the amount..." />,
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

// Export handlers
export const GET = handle(app);
export const POST = handle(app);
