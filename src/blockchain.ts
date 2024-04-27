import { Block } from "./block";
export class Blockchain {
  public chain: Block[] = [];
  public getHead(): Block {
    return this.chain[this.chain.length - 1];
  }
  private getHeight(): number {
    return this.chain.length;
  }
  public addBlock(block: Block) {
    this.chain.push(block);
  }
}
