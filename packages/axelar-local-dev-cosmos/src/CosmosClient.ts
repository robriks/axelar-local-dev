import fs from "fs";
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { GasPrice } from "@cosmjs/stargate";
import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { Decimal } from "@cosmjs/math";
import { CosmosChainInfo } from "./types";

export class CosmosClient {
  chainInfo: CosmosChainInfo;
  owner: DirectSecp256k1HdWallet;
  client: SigningCosmWasmClient;

  private constructor(
    chainInfo: CosmosChainInfo,
    owner: DirectSecp256k1HdWallet,
    client: SigningCosmWasmClient
  ) {
    this.chainInfo = chainInfo;
    this.owner = owner;
    this.client = client;
  }

  static async create(chainInfo: CosmosChainInfo) {
    const walletOptions = {
      prefix: "wasm",
    };
    const clientOptions = {
      gasPrice: new GasPrice(Decimal.fromAtomics("1", 6), chainInfo.denom),
    };

    const owner = await DirectSecp256k1HdWallet.fromMnemonic(
      chainInfo.owner.mnemonic,
      walletOptions
    );

    const client = await SigningCosmWasmClient.connectWithSigner(
      chainInfo.rpcUrl,
      owner,
      clientOptions
    );

    return new CosmosClient(chainInfo, owner, client);
  }

  getBalance(address: string) {
    return this.client
      .getBalance(address, this.chainInfo.denom)
      .then((res) => res.amount);
  }

  async uploadWasm(path: string) {
    const wasm = fs.readFileSync(path);

    return this.client.upload(
      this.chainInfo.owner.address,
      new Uint8Array(wasm),
      "auto"
    );
  }

  async getOwnerBalance() {
    return this.owner.getAccounts().then((accounts) => accounts[0].address);
  }
}
