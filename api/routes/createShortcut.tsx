import { Button, Frog, TextInput } from 'frog'
import { abi } from '../resources/abiOnchain.js';
import dotenv from 'dotenv';
 
export const app = new Frog()

// Load environment variables from .env file
dotenv.config();
 
// Frame createShortcut function
app.frame('/create-shortcut', (c) => {
    return c.res({
      action: '/destination-chain-shortcut',
      image: '/images/origin-chain.jpeg',
      intents: [
        <Button value="10">Optimism</Button>,
        <Button value="8453">Base</Button>,
      ]
    })
  })
  
  app.frame('/destination-chain-shortcut', (c) => {
    const {buttonValue} = c;
    const originChain = buttonValue;
  
    return c.res({
      action: `/input-token-shortcut/${originChain}`,
      image: '/images/destination-chain.jpeg',
      intents: [
        // <Button value="1">Mainnet</Button>,
        <Button value="10">Optimism</Button>,
        <Button value="137">Polygon</Button>,
        <Button value="8453">Base</Button>,
        <Button value="42161">Arbitrum</Button>,
      ]
    })
  })
  
  
  app.frame('/input-token-shortcut/:originChain', (c) => {
    const {buttonValue} = c;
  
    const {originChain} = c.req.param();
  
    const destinationChain = buttonValue;
    
    return c.res({
      action: `/validate-shortcut/${originChain}/${destinationChain}`,
      image: '/images/input-token.jpeg',
      intents: [
        <TextInput placeholder="Enter Token Address..." />,
        <Button action='/create-shortcut'>Cancel 🙅🏻‍♂️</Button>,
        <Button>Confirm</Button>,
      ]
    })
  })
  
  app.frame('/validate-shortcut/:originChain/:destinationChain', async (c) => {
    const { inputText } = c;
    const { originChain, destinationChain } = c.req.param();
  
    const address = inputText as `0x${string}`;
    const chainId = originChain;
  
    let validate_address, response;
  
    try {
      // const request = await fetch(`${process.env.ONCHAIN_HIGHEST_POOL_API_URL}/${address}/${chainId}`);
      const request = await fetch(`https://create.onthis.xyz/api/highest-pool-tvl/${address}/${chainId}`);
      const data = await request.json();
  
      if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address) || data === null || data.pool === null || data.pool === '') {
        validate_address = `❌ The token address seems not valid or cannot be found in the highest pool!`;
      } else {
        validate_address = 'is valid';
        response = data;
      }    
    } catch (error) {
      console.error('An error occurred while fetching or processing data:', error);
      validate_address = `❌ The token address seems not valid or cannot be found in the highest pool!`;
    }
  
    const { pool, pType } = response; 
  
    
    function getOriginChainInfo(originChain: string) {
      switch (originChain) {
        case '1':
          return { logo: '/images/chain/eth.png', name: 'Mainnet' };
        case '10':
          return { logo: '/images/chain/op.png', name: 'Optimism' };
        case '137':
          return { logo: '/images/chain/polygon.png', name: 'Polygon' };
        case '8453':
          return { logo: '/images/chain/base.png', name: 'Base' };
        case '42161':
          return { logo: '/images/chain/arb.png', name: 'Arbitrum' };
        default:
          return { logo: '/images/icon.png', name: '' };
      }
    }  
  
    const getDestinationChainInfo = (destinationChain: string) => {
      switch (destinationChain) {
        case '1':
          return { name: 'Mainnet', logo: '/images/chain/eth.png' };
        case '10':
          return { name: 'Optimism', logo: '/images/chain/op.png' };
        case '137':
          return { name: 'Polygon', logo: '/images/chain/polygon.png' };
        case '8453':
          return { name: 'Base', logo: '/images/chain/base.png' };
        case '42161':
          return { name: 'Arbitrum', logo: '/images/chain/arb.png' };
        default:
          return { name: '', logo: '/images/icon.png' };
      }
    };
  
    const originChainInfo = getOriginChainInfo(originChain);
    const destinationChainInfo = getDestinationChainInfo(destinationChain);
  
    return c.res({
      action: `/finish-create-shortcut/${originChain}`,
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
          {validate_address === 'is valid' ? (
            <>
              <p>
                <img src={originChainInfo.logo} width='40px' height='40px' alt="Chain logo" />
                &nbsp;
                {originChainInfo.name}
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <span>🔀</span>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <img src={destinationChainInfo.logo} width='40px' height='40px' alt="Chain logo" />
                &nbsp;
                {destinationChainInfo.name}
              </p>
            </>
          ) : (
            <p>{validate_address}</p>
          )}
        </div>
      </div>
      ),
      intents: [
        validate_address === 'is valid' && (
          <Button action='/create-shortcut'>Cancel 🙅🏻‍♂️</Button>
        ),
        validate_address === 'is valid' ? (
          <Button.Transaction target={`/submit-create-shortcut/${originChain}/${destinationChain}/${pool}/${pType}`}>Create Shortcut</Button.Transaction>
          // <Button action={`/submit-create-shortcut/${originChain}/${destinationChain}`}>Create Shortcut</Button>
        ) : (
          <Button action='/create-shortcut'>Try Again</Button>
        ),
      ]
    });
  });
  
  
  app.transaction('/submit-create-shortcut/:originChain/:destinationChain/:pool/:pType', (c) => {
    const {originChain, destinationChain, pool, pType} = c.req.param();
  
    const _cId = destinationChain;
    // Convert pType to number if necessary
    const pTypeNumber = parseInt(pType);
    if (isNaN(pTypeNumber)) {
      throw new Error(`Invalid pType: ${pType}`);
    }
  
    // Get the chain ID
    const getChainId = (chain: string) => {
      switch (chain) {
        case '10':
          return 'eip155:10';
        case '8453':
          return 'eip155:8453';
        case '84532':
          return 'eip155:84532';
        case '7777777':
          return 'eip155:7777777';
        default:
          throw new Error(`Unsupported chain: ${chain}`);
      }
    };
  
    const chainIdStr = getChainId(originChain);
  
    // Get Contract Chain
    const getContractChain = (contractChain: string) => {
      switch (contractChain) {
        case '1':
          return process.env.MAINNET_ONCHAIN_CONTRACT;
        case '10':
          return process.env.OPTIMISM_ONCHAIN_CONTRACT;
        case '137':
          return process.env.POLYGON_ONCHAIN_CONTRACT;
        case '8453':
          return process.env.BASE_ONCHAIN_CONTRACT;
        case '42161':
          return process.env.ARBITRUM_ONCHAIN_CONTRACT;
        default:
          throw new Error(`Unsupported chain: ${contractChain}`);
      }
    };
  
    const contractChain = getContractChain(originChain);
  
    // Contract transaction call
    return c.contract({
      abi: abi,
      chainId: chainIdStr,
      functionName: 'createShortcut',
      args: [
        pool as `0x${string}`, // Use the pool address fetched from the API
        pTypeNumber, // Use the pType from the API response
        BigInt(_cId), // Use the chainId from the request context
      ],
      to : contractChain as `0x${string}`,
    });
  });
   
  app.frame('/finish-create-shortcut/:originChain', (c) => {
    const { transactionId } = c;
  
    const { originChain } = c.req.param();
  
    let originChainScan = '';
  
    switch (originChain) {
      case '10':
        originChainScan = 'https://optimistic.etherscan.io/tx/';
        break;
      case '8453':
        originChainScan = 'https://basescan.org/tx/';
        break;
      case '84532':
        originChainScan = 'https://base-sepolia.blockscout.com/tx/';
        break;
      case '7777777':
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
      image: '/images/shortcut-created.jpeg',
      intents: [
          <Button.Reset>🏠 Home</Button.Reset>,
          buttonLink
      ]
    })
  })