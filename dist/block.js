"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Block = exports.BLOCK_SUBSIDY = exports.EMPTY_SCRIPT = exports.BLOCK_VERSION = exports.BTC = void 0;
const merkleRoot_1 = require("./merkleRoot");
const transaction_1 = require("./transaction");
const utils_1 = require("./utils");
exports.BTC = 100000000; // Number of blocks before a coinbase transaction can be spent
exports.BLOCK_VERSION = 2; // Current Bitcoin block version
exports.EMPTY_SCRIPT = new Uint8Array([0x00]);
exports.BLOCK_SUBSIDY = 6.25; // Empty script
class Block {
    constructor(previousHash, transaction, bits) {
        this.transactions = []; // List of transactions included in the block
        this.merkleRoot = ""; // Merkle root of the transactions in the block
        this.version = exports.BLOCK_VERSION;
        this.previousHash = previousHash;
        this.merkleRoot = this.calculateMerkleRoot(transaction);
        this.timestamp = Math.floor(Date.now() / 1000);
        this.nonce = 0;
        this.bits = "1f00ffff";
        this.txCount = transaction.length;
        this.transactions = transaction;
        this.hash = this.calculateHash().toString("hex");
    }
    setTarget(difficulty) {
        return difficulty;
    }
    calculateHash() {
        const headerHex = this.constructHeaderBuffer();
        return (0, utils_1.doubleSHA256)(headerHex);
    }
    constructBits(target) {
        const targetBuffer = Buffer.from(target, "hex");
        const exponent = targetBuffer.readUInt8(3);
        const mantissa = targetBuffer.readUInt32BE(4);
        const bitsExponent = exponent.toString(16).padStart(2, "0");
        const bitsMantissa = mantissa.toString(16).padStart(6, "0");
        const bits = bitsExponent + bitsMantissa;
        console.log(bits);
        return bits;
    }
    constructHeaderBuffer() {
        const buffers = [];
        buffers.push(Buffer.from([
            this.version & 0xff,
            (this.version >> 8) & 0xff,
            (this.version >> 16) & 0xff,
            (this.version >> 24) & 0xff,
        ]));
        buffers.push(Buffer.from(this.previousHash, "hex"));
        buffers.push(Buffer.from(this.merkleRoot, "hex"));
        const timestampBytes = Buffer.alloc(4);
        timestampBytes.writeInt32LE(this.timestamp);
        buffers.push(timestampBytes);
        buffers.push(Buffer.from("1f00ffff", "hex"));
        const nonceBytes = Buffer.alloc(4);
        nonceBytes.writeUInt32LE(this.nonce);
        buffers.push(nonceBytes);
        const blockheader = Buffer.concat(buffers);
        return blockheader;
    }
    createTransaction(tx) {
        const transaction = new transaction_1.Transaction(tx);
        this.addTransaction(transaction.getTx());
        return transaction;
    }
    calculateblockFees() {
        let totalFee = 0;
        this.transactions.forEach((transaction) => totalFee + transaction.fee);
        return totalFee;
    }
    addTransaction(transaction) {
        this.transactions.push(transaction);
        this.txCount = this.transactions.length;
        this.updateMerkleRoot(this.transactions);
        return this.txCount;
    }
    calculateWeight() { }
    addCoinbaseTransaction(tx) {
        tx.vout[0].value += this.calculateblockFees();
        tx.vout[1].scriptpubkey = `6a24aa21a9ed${this.getwtxidCommitment().toString("hex")}`;
        console.log("Coinbase", tx.getTxId());
        this.transactions.unshift(tx.getTx());
        return { serializeCoinbase: tx.serializeWithWitness() };
    }
    getwtxidCommitment() {
        console.log((0, utils_1.doubleSHA256)(Buffer.from(this.calculatewTxidRoot + "0".repeat(64), "hex")));
        return (0, utils_1.doubleSHA256)(Buffer.from(this.calculatewTxidRoot + "0".repeat(64), "hex"));
    }
    calculatewTxidRoot(transactions) {
        const wtxids = transactions.map((el) => el.wtxid);
        wtxids.unshift("0".repeat(64)); /// for coinbase
        return (0, merkleRoot_1.constructMerkleTree)(wtxids);
    }
    updateMerkleRoot(transaction) {
        this.merkleRoot = this.calculateMerkleRoot(transaction);
    }
    calculateMerkleRoot(transactions) {
        if (transactions.length === 0) {
            throw new Error("empty transactions for create merkle root");
        }
        const txids = transactions.map((el) => el.txid);
        return (0, merkleRoot_1.constructMerkleTree)(txids).toString("hex");
    }
}
exports.Block = Block;