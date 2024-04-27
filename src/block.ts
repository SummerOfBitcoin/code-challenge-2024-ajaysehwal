import { BitcoinWriter } from "./buffer";
import { BlockTransaction } from "./interface";
import { calualateMerkleRoot } from "./merkleRoot";
import { Transaction } from "./transaction";
import { doubleSHA256 } from "./utils";
export const BLOCK_VERSION = 4;
export const EMPTY_SCRIPT = new Uint8Array([0x00]);
export const BLOCK_SUBSIDY = 6.25;
export class Block {
  public readonly timestamp: number;
  public version: number;
  public readonly previousHash: string;
  public nonce: number;
  public transactions: BlockTransaction[] = [];
  public merkleRoot: string;
  public hash: string = "";
  protected bits: bigint;
  protected txCount: number;
  protected totalfees: number;
  protected witnessMerkleRoot: string;
  constructor(
    previousHash: string,
    transaction: BlockTransaction[],
    bits: bigint = BigInt(0x1f00fff)
  ) {
    this.version = BLOCK_VERSION;
    this.previousHash = previousHash;
    this.timestamp = Math.ceil(Date.now() / 1000);
    this.nonce = 0;
    this.bits = bits;
    this.txCount = transaction.length;
    this.transactions = transaction;
    this.totalfees = this.calculateblockFees(transaction);
    this.merkleRoot = this.getmerkleRoot(transaction);
    this.witnessMerkleRoot = this.calculatewTxidRoot(transaction);
    this.calculateBlockWeight();
  }
  get difficulty(): bigint {
    return (
      (this.bits & BigInt(0x00ffffff)) *
      BigInt(2) ** (BigInt(8) * ((this.bits >> BigInt(24)) - BigInt(3)))
    );
  }

  public calculateHash(): Buffer {
    const headerHex = this.headerBuffer();
    return doubleSHA256(headerHex);
  }
  public headerBuffer(): Buffer {
    const buffer = Buffer.allocUnsafe(80);
    const writer = new BitcoinWriter(buffer);
    writer.writeUint32(this.version);
    writer.writeBuffer(Buffer.from(this.previousHash, "hex").reverse());
    writer.writeBuffer(Buffer.from(this.merkleRoot, "hex").reverse());
    writer.writeUint32(this.timestamp);
    writer.writeUint32(Number(this.bits));
    writer.writeUint32(this.nonce);
    console.log(buffer.toString("hex"));
    return buffer;
  }
  createTransaction(tx: Transaction): Transaction {
    const transaction = new Transaction(tx);
    this.addTransaction(transaction.getTx());
    return transaction;
  }
  private calculateblockFees(transaction: BlockTransaction[]) {
    let totalFee = 0;
    for (const tx of transaction) {
      totalFee += tx.fee;
    }
    return totalFee;
  }
  addTransaction(transaction: BlockTransaction): number {
    this.transactions.push(transaction);
    this.txCount = this.transactions.length;
    this.merkleRoot = this.getmerkleRoot(this.transactions);
    return this.txCount;
  }
  addCoinbaseTransaction(tx: Transaction) {
    tx.vout[0].value += this.totalfees;
    const startstring = "6a24aa21a9ed";
    const commitment = this.getwtxidCommitment();
    const scriptPubKey = Buffer.from(startstring + commitment, "hex");
    tx.vout[1].scriptpubkey = scriptPubKey.toString("hex");
    this.transactions.unshift(tx.getTx());
    this.merkleRoot = this.getmerkleRoot(this.transactions);
    this.txCount++;
    return { serializeCoinbase: tx.serializeWithWitness() };
  }
  private getwtxidCommitment() {
    const wxidRoot = Buffer.from(this.witnessMerkleRoot, "hex").reverse();
    const witnessNullVector = Buffer.alloc(32).reverse();
    const commitment = doubleSHA256(
      Buffer.concat([wxidRoot, witnessNullVector])
    );
    return commitment.toString("hex");
  }
  private reverseByteOrder(hexString: string): string {
    const hexBytes = Buffer.from(hexString, "hex");
    const reversedBytes = Buffer.from(hexBytes.reverse());
    const reversedHexString = reversedBytes.toString("hex");
    return reversedHexString;
  }

  private calculatewTxidRoot(transactions: BlockTransaction[]) {
    const wtxids = transactions.map((el) => el.wtxid);
    wtxids.unshift("0".repeat(64)); /// for coinbase
    return calualateMerkleRoot(wtxids);
  }
  private calculateBlockWeight() {
    let txweight = 0;
    for (let tx of this.transactions) {
      txweight += tx.weight;
    }
  }
  private getmerkleRoot(transactions: BlockTransaction[]) {
    if (transactions.length === 0) {
      throw new Error("empty transactions for create merkle root");
    }
    const txids = transactions.map((el) => el.txid);
    return calualateMerkleRoot(txids);
  }
 
}
