export const abi = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "pool",
        "type": "address"
      },
      {
        "internalType": "uint8",
        "name": "pType",
        "type": "uint8"
      },
      {
        "internalType": "uint256",
        "name": "_cId",
        "type": "uint256"
      }
    ],
    "name": "createShortcut",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const