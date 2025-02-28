import { HexString, Hash, Script } from "@ckb-lumos/base";
import { TransactionSkeletonType } from "@ckb-lumos/helpers";
import { Api } from "./Api";
import { TxMap } from "../stores/TxTrackerStore";

export interface CkbTransferParams {
  sender: string;
  recipient: string;
  amount: BigInt;
  txFee: BigInt;
}

export interface Balance {
  CKB: BigInt,
  cCKB: BigInt
}

export interface PoolDepositParams {
  sender: string;
  senderArgs: string;
  amount: BigInt | string;
  txFee: BigInt | string;
}

export type Transaction = GenericTransaction | CkbTransfer;

export interface GenericTransaction {
  params: any;
  description: string;
  txSkeleton: TransactionSkeletonType;
}

export interface CkbTransfer {
  params: CkbTransferParams;
  description: string;
  txSkeleton: TransactionSkeletonType;
}

class DappService {
  dappServerUri: string;
  constructor(dappServerUri) {
    this.dappServerUri = dappServerUri;
  }

  async getLatestBlock(): Promise<number> {
    const response = await Api.get(this.dappServerUri, "/latest-block");
    return Number(response.payload.blockNumber);
  }

  async fetchTransactionStatuses(txHashes: Hash[]) {
    console.log("fetchTransactionStatuses", txHashes);
    const response = await Api.post(this.dappServerUri, "/fetch-tx-status", {
      txHashes,
    });
    return response.payload.txStatuses as TxMap;
  }

  async fetchCkbBalance(lockScript: Script): Promise<BigInt> {
    const response = await Api.post(this.dappServerUri, "/ckb/get-balance", {
      lockScript,
    });
    return BigInt(response.payload.balance);
  }

  async fetchPoolBalance(): Promise<Balance> {
    const response = await Api.get(this.dappServerUri, "/pool/get-balance");
    return response.payload.balance;    
  }

  async fetchDepositBalance(senderArgs): Promise<BigInt> {
    const response = await Api.post(this.dappServerUri,
      "/pool/get-deposit-balance",
      { senderArgs });
    
      return BigInt(response.payload.balance);    
  }

  async buildTransferCkbTx(params: CkbTransferParams): Promise<CkbTransfer> {
    const response = await Api.post(this.dappServerUri, "/ckb/build-transfer", {
      sender: params.sender,
      recipient: params.recipient,
      amount: params.amount.toString(),
      txFee: params.txFee.toString(),
    });

    const data = response.payload;
    data.params = parseCkbTransferParams(data.params);
    data.description = "Spin DEFi - CKB Transfer Request"; // Description to display on Keyperring
    return data;
  }

  async buildPoolDeposit(params: PoolDepositParams): Promise<any> {
    const response = await Api.post(this.dappServerUri,
      "/pool/deposit-build",
      stringifyPoolDepositParams(params));

    const data = response.payload;
    data.params = parsePoolDepositParams(data.params);
    data.description = "Spin DEFi - Lend pool deposit"; // Description to display on Keyperring
    return data;
  } 


  async buildPoolWithdraw(params): Promise<any> {
    const response = await Api.post(this.dappServerUri, "/pool/withdraw-build", {
      sender: params.sender,
      amount: params.amount.toString(),
      txFee: params.txFee.toString(),
    });

    const data = response.payload;
    data.params = parseCkbTransferParams(data.params);
    data.description = "Spin DEFi - CKB Transfer Request"; // Description to display on Keyperring
    return data;
  } 

  async transferCkb(
    params: CkbTransferParams,
    signatures: HexString[]
  ): Promise<Hash> {
    const response = await Api.post(this.dappServerUri, "/ckb/send-transfer", {
      params: stringifyCkbTransferParams(params),
      signatures,
    });

    return response.payload.txHash as Hash;
  }

  async transferDepositToPool(params: PoolDepositParams, signatures: HexString[]): Promise<Hash> {
    const response = await Api.post(this.dappServerUri, "/pool/deposit-transfer", {
      params: stringifyPoolDepositParams(params),
      signatures,
    });

    return response.payload.txHash as Hash;
  }

  async transferWithdrawFromPool(params, signatures: HexString[]): Promise<Hash> {
    const response = await Api.post(this.dappServerUri, "/pool/withdraw-transfer", {
      params: stringifyCkbTransferParams(params),
      signatures,
    });

    return response.payload.txHash as Hash;
  }
}

export const parseCkbTransferParams = (params) => {
  return {
    sender: params.sender,
    amount: BigInt(params.amount),
    recipient: params.recipient,
    txFee: BigInt(params.txFee),
  };
};

export const stringifyCkbTransferParams = (params: CkbTransferParams) => {
  return {
    sender: params.sender,
    amount: params.amount.toString(),
    recipient: params.recipient,
    txFee: params.txFee.toString(),
  };
};

export const parsePoolDepositParams = (params: PoolDepositParams) => {
  return {
    sender: params.sender,
    senderArgs: params.senderArgs,
    amount: BigInt(params.amount),
    txFee: BigInt(params.txFee),
  };
};

export const stringifyPoolDepositParams = (params: PoolDepositParams) => {
  return {
    sender: params.sender,
    senderArgs: params.senderArgs,
    amount: params.amount.toString(),
    txFee: params.txFee.toString(),
  };
};

export const dappService = new DappService(
  process.env.REACT_APP_DAPP_SERVER_URI
);
