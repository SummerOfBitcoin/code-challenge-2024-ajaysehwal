# Summer of Bitcoin 2024: Mine your first block

## Overview

In this challenge, My tasked with the simulation of mining process of a block, which includes validating and including transactions from a given set of transactions.
The repository contains a folder `mempool` which contains JSON files.
These files represent individual transactions, some of which may be invalid. my goal is to successfully mine a block by including only the valid transactions

### Teck Stack

Typescript, Object-Oriented Programming

### Packages or liberay

1. secap256K1
2. crypto
3. ripemd160
4. varuint-bitcoin
5. ts-node
6. tsc-watch
7. nodemon

## Design Approch


# Block Construction Program

The block construction program follows a modular design approach, with distinct components for transaction validation, block formation, mining algorithm and add block in blockchain

# creating a valid block includes

- Validating transactions: Ensuring each transaction follows the rules of the Bitcoin protocol, including correct format, inputs, outputs, and verify signature.
- Block structure:

```sh
  {
    hash : doublehash(blockheader) // block header (verison , previousHash, merkleRoot, timestamp, bits nonce)
    verison : 4,
    timestamp : Math.ceil(Date.now()/1000),
    bits : BigInt(0x1f00ffff),
    merkleRoot : merkle root of all transactions id ,
    transactionCount: count of valid transaction,
    witnessMerkleRoot: merkle root of all transactions ids with witness data,
    transaction : transaction in raw format,
 }

```
- Block Formation: The block header is constructed with essential information such as version, previous block hash, Merkle root of transactions, timestamp, difficulty target (bits), and nonce. Valid transactions are selected from the mempool to include in the block

- Mining algorithm: A proof-of-work algorithm is implemented to find a valid nonce that satisfies the current network difficulty target. This involves repeatedly hashing the block header with different nonce values until a suitable hash is found

- Transaction inclusion: Selecting valid transactions from the mempool to include in the block.

## Pseudo Code

# Mempool Clas

Used for extract transactions for mempool folder

```sh
 export class MemoryPool {
  private transactions: Transaction[] = [];
  private mempoolFolder: string;

  constructor(mempoolFolder: string) {
    this.mempoolFolder = mempoolFolder;
    this.loadTransactions();
  }

  getTransactions(): Transaction[] {
    // return transactions
  }

  private loadTransactions(): void {
     // extract transactions from mempool folder  and push them into transaction array
  }
```

# Mining Class

```sh

 class Miner {
  protected mineBlock?: MineBlock;
  private validTransactions: BlockTransaction[] = [];
  constructor(private memoryPool: MemoryPool) {}
  async start(chain: Blockchain) {
  // start mining with valid transactions
}
  private getValidTransactions(): BlockTransaction[] {
    // send all transaction in validator class and extract onyl valid tranaction
 }
  

```
# Proof of Work Algorithm : 

```sh 
 class MineBlock {
  started: number = Date.now();
  ended: number = Date.now();
  constructor(
    protected chain: Blockchain,
    protected block: Block,
  ) {}

  get duration(): number {
   // block creation time
  }
  async start() {
    this.block.hash = doubleSHA256(header);
    while (
      BigInt('0x'+(this.block.hash)) > this.block.difficulty &&
      this.block.nonce < this.MAX_NONCE
    ) {
      this.block.nonce++;
      // update nonce instead of create while block header again and again
      header.writeUInt32LE(this.block.nonce, 80 - 4); 
      this.block.hash = doubleSHA256(header)
    }
  }
}
```
# Transaction Validation Class

```sh
export class Validator {
  public validateBatch(transactions) {
    const validTransactions = [];
    for (const transaction of transactions) {
      if (this.start(transaction)) {
        validTransactions.push(transaction.getTx());
      }
    }
    return validTransactions;
  }

  public start(transaction: Transaction): boolean {
   // check all possible consensus protocol
  }
  private scriptVerification(transaction: Transaction): {
    // verify transaction script or signature
  }

  private checkTransactionSize(transaction: Transaction){
    // verify transaction size
  }

  private checkOutputValues() {
   // verify outputs values
  }

  private checkLockTime() {
    // verify locktime
  }

  private checkInputOutputNotEmpty() {
    // for transaction input output is empty or not
  }

  private checkInputOutputValue(): boolean {
   // verify if output is more than input
  }
}

```

# Transaction class 

Transaction class handle all serialization, creating txids, and wtxids

```sh  

xport class Transaction {
  public version: number = 0;
  public locktime: number = 0;
  public vin: Vin[] = [];
  public vout: Vout[] = [];
  static SIGHASH_ALL = 0x00000001;
  static SIGHASH_NONE = 0x00000002;
  static SIGHASH_SINGLE = 0x00000003;
  static SIGHASH_ANYONECANPAY = 0x00000080;

  constructor(tx) {
    this.txid = this.getTxId();
    this.version = tx.version;
    this.locktime = tx.locktime;
    this.vin = tx.vin.map((input: any) => new Vin(input));
    this.vout = tx.vout.map((output: any) => new Vout(output));
  }

  public clone() {
    // clone transaction which used in creating message hash for verify signature of transaction
  }
  public calculatefee() {
    // return input value - output value
   
  }
  public serialize() {
    // serialize transaction without witness data
  
  }
  public serializeWithWitness{
    //serialize transaction with witness data
  }
  public getTxIdReverseByteOrder() {
   // return reverse byte txid
  }
 
  public getTxId() {
    // doublehash(this.serialize())
  }
  public getfileName() {
    // hash(reversedtxid).reverse()
  }
  public getWtxid() {
    // doublehash(this.serializeWithWitness())
   
  }
  public isCoinbase() {
     //check is transaction coinbase or not
  }
}
```

# Block Class

```sh
export class Block {
  constructor(
    previousHash,
    transaction,
    bits,
  ) {
  }
  get difficulty() {
     // bits to difficulty
  }

  public headerBuffer() {
   // serialize header
  }
  createTransaction(tx) {
   // add valid transaction in block
  }
 
  addCoinbaseTransaction(tx) {
    // add coinbase transaction by miner
  }
  private getwtxidCommitment() {
    // wxidcommitment which add in coinbase transaction second output scriptpubkey
  }

  private calculatewTxidRoot() {
    // merkle root of wtxids
  }
  private calculateBlockWeight() {
   // block weight
  }
  private getmerkleRoot(transactions: BlockTransaction[]) {
   // merkle root of txids
 
}

```


## Results and Performance:

Block Mining Time: 3 min to 5 min
Total Transaction Fee Collected : 18090157 sats
Total Weight of Block : 3980172
Number of Valid Transactions : approx 3572 for (p2pkh and p2wpkh)

# Performance Optimizations
To improve the mining performance, the following optimizations were implemented:

- Parallel Mining: The mining process can be parallelized by distributing the nonce search across multiple threads or processes. However, this optimization was not implemented in the current version due to time constraints.
- Efficient Hashing: The project utilizes the crypto module provided by Node.js for double SHA-256 hashing. While this is suitable for simulation purposes, more efficient hashing algorithms or hardware acceleration (e.g., GPU or FPGA) could be explored for improving performance in a production environment.


# Conclusion
The Summer of Bitcoin 2024 challenge provided a hands-on learning experience in understanding the intricacies of the Bitcoin protocol, particularly the process of mining a block and validating transactions. Through this project, several key insights were gained:

- Transaction Validation Complexities: Implementing the transaction validation process highlighted the intricate details and nuances involved in ensuring the validity of transactions according to the Bitcoin consensus rules. Aspects such as script verification, input/output value checks, and locktime validations required a thorough understanding of the protocol specifications.
- Proof-of-Work Algorithm Efficiency: The proof-of-work mining algorithm, while conceptually straightforward, presented challenges in terms of optimizing performance and efficiency. Techniques such as header buffer reuse and efficient hashing algorithms played a crucial role in improving mining speed.
- Modular Design and Extensibility: The modular design approach employed in this project demonstrated the importance of separating concerns and promoting code reusability and maintainability. This design philosophy facilitates future extensions and modifications to the codebase.
- Blockchain Consensus and Decentralization: Solving this problem deepened the understanding of the underlying principles of blockchain technology, such as consensus mechanisms, decentralization, and the importance of adhering to well-defined rules and protocols.

Potential areas for future improvement or research include:

- Performance Optimizations: Exploring more advanced techniques for parallelizing the mining process, leveraging hardware acceleration (e.g., GPUs or FPGAs), and implementing efficient data structures and algorithms to further enhance mining speed and transaction processing.
Scalability and Throughput: Investigating scalability solutions to increase the transaction throughput and block capacity, while maintaining decentralization and security guarantees.
- Alternative Consensus Mechanisms: Researching and implementing alternative consensus mechanisms beyond proof-of-work, such as proof-of-stake, delegated proof-of-stake, or hybrid approaches, to address energy efficiency concerns and improve scalability.
Integration with Blockchain Networks: Extending the project to integrate with real-world blockchain networks, such as the Bitcoin mainnet or testnets, to gain practical experience in peer-to-peer networking, block propagation, and node synchronization.
- Smart Contract Integration: Incorporating support for smart contracts and exploring the execution of decentralized applications (DApps) on top of the blockchain infrastructure.

# During the problem-solving process, the following resources and references were consulted:

- Mastering Grokking Bitcoin by Kalle Rosenbaum
- (https://www.oreilly.com/)
- (https://learnmeabitcoin.com/technical/)
- (https://en.bitcoin.it/wiki/Main_Page/)
Bitcoin Improvement Proposals (BIPs) (https://github.com/bitcoin/bips)
StackExchange Bitcoin Community (https://bitcoin.stackexchange.com/)

The Summer of Bitcoin 2024 challenge provided a valuable learning experience and served as a stepping stone towards further exploration and development in the realm of blockchain technology and decentralized systems.