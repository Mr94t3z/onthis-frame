import { Button, Frog, TextInput } from 'frog';
import { handle } from 'frog/vercel';
import csvParser from 'csv-parser';
import fs from 'fs';

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

// Function to read and parse CSV data
function readCSV() {
  fs.createReadStream('./api/resources/data.csv') 
    .pipe(csvParser()) 
    .on('data', (row: any) => {
      // Transform row data to match SwapData interface
      const swapData: SwapData = {
        shortcutAddress: row['SHORTCUT ADDRESS'],
        description: row['DESCRIPTION'],
        token: row['TOKEN'],
        originChain: row['ORIGIN CHAIN'],
        destinationChain: row['DESTINATION CHAIN']
      };
      apiData.push(swapData);
    })
    .on('end', () => {
      totalPages = Math.ceil(apiData.length / itemsPerPage);
      console.log('CSV file successfully processed.');
    })
    .on('error', (error) => {
      console.error('Error processing CSV file:', error);
    });
}

// Call function to populate data
readCSV();

// Initialize Frog app
export const app = new Frog({
  assetsPath: '/',
  basePath: '/',
});

// Initial frame
app.frame('/', (c) => {
  currentPage = 1;
  return c.res({
    action: '/leaderboard',
    image: '/dashboard.jpeg',
    intents: [
      <Button action="/leaderboard" value="leaderboard page">Connect Wallet</Button>,
    ],
  });
});

// Looping leaderboard frame
app.frame('/leaderboard', (c) => {
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
    action: '/leaderboard',
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
     <Button value="submit">Transfer</Button>,
    ],
  });
});

// Export handlers
export const GET = handle(app);
export const POST = handle(app);
