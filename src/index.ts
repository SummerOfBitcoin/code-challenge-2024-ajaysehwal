import * as fs from "fs";
import { Transaction } from "./transaction";
import { BlockTransaction } from "./interface";
import { Blockchain } from "./blockchain";
import { Block } from "./block";
import { MemoryPool } from "./memorypool";
import { Validator } from "./validate";
import { coinbaseTX } from "./coinbase";
import { doubleSHA256 } from "./utils";
export const BLOCK_SUBSIDY = 1250000000;
export class MineBlock {
  started: number = Date.now();
  ended: number = Date.now();
  hashes: number = 0;
  private MAX_NONCE: number = 4294967295;
  constructor(
    protected chain: Blockchain,
    protected block: Block,
  ) {}

  get duration(): number {
    return this.ended - this.started;
  }
   reverseBytes(hexString: string): string {
    if (hexString.length % 2 !== 0) {
        throw new Error("Hexadecimal string length must be even.");
    }
    const reversedHexString = hexString.match(/.{2}/g)?.reverse()?.join("") || "";
    return reversedHexString;
}
  async start() {
    const header = this.block.headerBuffer();
    this.block.hash = doubleSHA256(header).toString("hex");
    while (
      BigInt('0x'+this.reverseBytes(this.block.hash)) > this.block.difficulty &&
      this.block.nonce < this.MAX_NONCE
    ) {
      this.block.nonce++;
      header.writeUInt32LE(this.block.nonce, 80 - 4);
      this.block.hash = doubleSHA256(header).toString("hex")
      this.hashes++;
    }
    console.log("Block mined", this.block.hash, `in ${this.hashes} iterations`);
  }
}
export class Miner {
  protected mineBlock?: MineBlock;
  private validTransactions: BlockTransaction[] = [];
  constructor(private memoryPool: MemoryPool) {}
  async start(chain: Blockchain) {
    const coinbase = coinbaseTX();

    const validtransaction = this.getValidTransactions();
    const block = new Block(
      "0".repeat(64),
      validtransaction,
      BigInt(0x1f00ffff)
    );
    const { serializeCoinbase } = block.addCoinbaseTransaction(coinbase);
    const mineBlock = new MineBlock(chain, block);
    await mineBlock.start();
    chain.addBlock(block);
    const txids = block.transactions.map((tx) => tx.txid);
      const reversedTxids = txids.map((txid) =>
      txid.match(/.{2}/g)?.reverse()?.join("") || ""
    );
    const output = `${block
      .headerBuffer()
      .toString("hex")}\n${serializeCoinbase}\n${reversedTxids.join("\n")}`;
    fs.writeFileSync("output.txt", output);
  }

  private getValidTransactions(): BlockTransaction[] {
    const transactionsToValidate: Transaction[] = [];
    this.memoryPool.getTransactions().forEach((tx: Transaction) => {
      transactionsToValidate.push(tx);
    });
    const validator = new Validator();
    this.validTransactions = validator.validateBatch(transactionsToValidate);
    return this.validTransactions;
  }
}
const blockchain = new Blockchain();
const memoryPool = new MemoryPool("./mempool");
const miner = new Miner(memoryPool);
miner.start(blockchain);
console.log(blockchain);
