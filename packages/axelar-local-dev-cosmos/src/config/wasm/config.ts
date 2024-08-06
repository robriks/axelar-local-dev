import path from "path";
import { ChainConfig, CosmosChainInfo } from "../../types";
import { Path } from "../../path";

export const defaultWasmConfig: ChainConfig = {
  dockerPath: Path.docker("wasm"),
  lcdWaitTimeout: 180000,
  rpcWaitTimeout: 180000,
  onCompleted: () => {},
};

export const defaultWasmChainInfo: Omit<CosmosChainInfo, "owner"> = {
  prefix: "wasm",
  denom: "uwasm",
  lcdUrl: "http://127.0.0.1/wasm-lcd",
  rpcUrl: "http://127.0.0.1/wasm-rpc",
  wsUrl: "ws://127.0.0.1/wasm-rpc/websocket",
};
