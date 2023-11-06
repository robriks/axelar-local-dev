import path from "path";
import {
  CosmosClient,
  IBCRelayerClient,
  AxelarListener,
  AxelarCosmosContractCallEvent,
  AxelarCosmosContractCallWithTokenEvent,
  AxelarIBCEvent,
} from "..";

describe("E2E - Listener", () => {
  let wasmClient: CosmosClient;
  let axelarClient: CosmosClient;
  let relayerClient: IBCRelayerClient;
  let srcChannelId: string;
  let destChannelId: string;
  let axelarListener: AxelarListener;
  let testMnemonic =
    "illness step primary sibling donkey body sphere pigeon inject antique head educate";

  async function executeContractCall() {
    // Upload the wasm contract
    const _path = path.resolve(__dirname, "../..", "wasm/multi_send.wasm");
    const response = await wasmClient.uploadWasm(_path);
    console.log("Uploaded wasm:", response.codeId);

    // Instantiate the contract
    const { client } = wasmClient;
    const ownerAddress = await wasmClient.getOwnerAccount();
    const { contractAddress } = await client.instantiate(
      ownerAddress,
      response.codeId,
      {
        channel: srcChannelId,
      },
      "amazing random contract",
      "auto"
    );
    console.log("Deployed contract:", contractAddress);

    const denom = wasmClient.chainInfo.denom;

    const execution = await client.execute(
      ownerAddress,
      contractAddress,
      {
        multi_send_to_evm: {
          destination_chain: "ethereum",
          destination_address: "0x49324C7f83568861AB1b66E547BB1B66431f1070",
          recipients: ["0x49324C7f83568861AB1b66E547BB1B66431f1070"],
        },
      },
      "auto",
      "test",
      [{ amount: "1000000", denom }]
    );

    // console.log(JSON.stringify(execution, null, 2));

    // // while (true) {
    const packets = await relayerClient.relayPackets();
    // // sleep 5
    // // await new Promise((r) => setTimeout(r, 5000));
    // // }
  }

  beforeAll(async () => {
    wasmClient = await CosmosClient.create("wasm");
    axelarClient = await CosmosClient.create("axelar");

    // Initialize the connection and channel
    relayerClient = await IBCRelayerClient.create(testMnemonic);
    await relayerClient.fundRelayerAccountsIfNeeded();
    await relayerClient.initConnection(true);
    const { dest, src } = await relayerClient.createChannel("B", true);
    srcChannelId = src.channelId;
    destChannelId = dest.channelId;
    console.log("Created IBC Channel:", src, dest);

    axelarListener = new AxelarListener(axelarClient.getChainInfo());
  });

  it("should receive ibc events from call contract", (done) => {
    (async () => {
      axelarListener.listen(AxelarIBCEvent, (args) => {
        console.log("Any event", args);
      });
      axelarListener.listen(AxelarCosmosContractCallEvent, (args) => {
        console.log("Received ContractCall", args);
        done();
      });
      axelarListener.listen(AxelarCosmosContractCallWithTokenEvent, (args) => {
        console.log("Received ContractCallWithToken:", args);
        done();
      });

      await executeContractCall();
    })();
  });
});
