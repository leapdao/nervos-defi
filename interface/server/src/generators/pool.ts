import { indexer } from "../index";
import { secp256k1Blake160 } from "@ckb-lumos/common-scripts";
import { CellCollector } from "@ckb-lumos/indexer";
import { TransactionSkeleton } from "@ckb-lumos/helpers";
import { List } from "immutable";
import {
  HexString,
  Cell,
  CellDep,
  DepType,
  HashType,
  utils,
} from "@ckb-lumos/base";

const POOL_CODE_HASH = "0x25bb89d7e601d70d2111c5ced8effc7a7c0d8a459e55f3efe193c0ff0bf07ce1";
const EMPTY_ARGS = "0x0000000000000000000000000000000000000000";
const SECP256k1Blake160CodeHash = "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8";
const SUDT_CODE_HASH = "0x48dbf59b4c7ee1547238021b4869bceedf4eea6b43772e5d66ef8865b6ae7212";
const CODE_TX_HASH = "0x2161417ecaa7e2c796456923e7be023cfec694a1eb6c6eb074da44372b7545f3";
const ISSUED_SUDT_HASH = "0x135a8ac34a12f5885fe671912a8d3c6f42dd31920d4eb65ca80039a808725bd6";

const POOL_LOGIC_DEP = {
  out_point: {
    index: '0x0',
    tx_hash: '0x2161417ecaa7e2c796456923e7be023cfec694a1eb6c6eb074da44372b7545f3'
  },
  dep_type: "code" as DepType,
}
const BLAKE_DEP = {
  out_point: {
    index: '0x0',
    tx_hash: '0xf8de3bb47d055cdf460d93a2a6e1b05f7432f9777c8c474abf4eec1d4aee5d37',
  },
  dep_type: "dep_group" as DepType,
};
const SUDT_DEP = {
  out_point: {
    index: '0x0',
    tx_hash: '0xc1b2ae129fad7465aaa9acc9785f842ba3e6e8b8051d899defa89f5508a77958',
  },
  dep_type: "code" as DepType,
};

export interface PoolDepositParams {
  sender: string;
  senderArgs: string;
  amount: string;
  txFee: string;
}

export interface Balance {
  cCKB: string,
  CKB: string
}

export const getPoolBalance = async (): Promise<Balance> => {
  const pool_cell = await getLatestPoolCell();
  return {
    cCKB: (BigInt(pool_cell.data.slice(0, 34))).toString(),
    CKB: (BigInt("0x" + pool_cell.data.slice(34, 66))).toString()
  };
}

const getLatestPoolCell = async (): Promise<Cell> => {
  let collector = new CellCollector(indexer, {
    lock: {
      code_hash: POOL_CODE_HASH,
      hash_type: "data",
      args: "0x00",
    },
    data: "any",
  });
  let pool_cells = [];
  for await (const cell of collector.collect()) {
    pool_cells.push(cell);
  }
  if (pool_cells.length == 0) {
    throw new Error("No pool cell found");
  }
  return pool_cells[0];
}

const getPoolCodeCell = async (): Promise<Cell> => {
  let collector = new CellCollector(indexer, {
    lock: {
      code_hash: SECP256k1Blake160CodeHash,
      hash_type: "type",
      args: EMPTY_ARGS,
    },
    data: "any",
  });
  let pool_cells = [];
  for await (const cell of collector.collect()) {
    pool_cells.push(cell);
  }
  let code_cell = pool_cells.filter((cell) => {
    return cell.out_point.tx_hash === CODE_TX_HASH; 
  })[0];
  
  if (!code_cell) {
    throw new Error("No code cell found");
  }

  return code_cell;
}

const parsePoolData = (depositAmount:bigint, poolData: HexString,  poolCap: bigint, fundCap: bigint, outCap: bigint) => {
  const cCKB_total_supply = BigInt(poolData.slice(0, 34));
  const CKB_total_supply = BigInt("0x" + poolData.slice(34, 66));

  const x = depositAmount * cCKB_total_supply / CKB_total_supply;

  const new_cCKB_total_supply = cCKB_total_supply + x;
  const new_CKB_total_supply = CKB_total_supply + BigInt(depositAmount);

  
  return ["0x" + new_cCKB_total_supply.toString(16).padStart(32, "0")
    + new_CKB_total_supply.toString(16).padStart(32, "0"), x];
}

export const getDepositBalance = async (senderLockScriptArgs) => {

  const lockScript = {
    hash_type: "data" as HashType,
    code_hash: POOL_CODE_HASH,
    args: '0x00',
  }
  const SUDT_OWNER = utils.computeScriptHash(lockScript);

  let collector = new CellCollector(indexer, {
    lock: {
      code_hash: SECP256k1Blake160CodeHash,
      hash_type: "type",
      args: senderLockScriptArgs,
    },
    type: {
      code_hash: SUDT_CODE_HASH,
      hash_type: "data",
      args: SUDT_OWNER
    },
  });

  let totalDeposits: bigint = BigInt(0);
  for await (const cell of collector.collect()) {
    let halfString = cell.data.slice(0, 18);
    totalDeposits += BigInt(hexStringToArrayBuffer(halfString));
  };
  return totalDeposits;
}

const hexStringToArrayBuffer = (hexString: string) => {
  // remove the leading 0x
  hexString = hexString.replace(/^0x/, '');
  
  // ensure even number of characters
  if (hexString.length % 2 != 0) {
      console.log('WARNING: expecting an even number of characters in the hexString');
  }
  
  // check for some non-hex characters
  var bad = hexString.match(/[G-Z\s]/i);
  if (bad) {
      console.log('WARNING: found non-hex characters', bad);    
  }
  
  // split the string into pairs of octets
  var pairs = hexString.match(/[\dA-F]{2}/gi);
  
  // convert the octets to integers
  var integers = pairs.map(function(s) {
      return parseInt(s, 16);
  });

  var array = new Uint8Array(integers); 

  const view = new DataView(array.buffer);
  return view.getBigInt64(0, true);
}

const getFundingCell = async (senderLockScriptArgs: HexString, amount: string): Promise<Cell> => {
  let collector = new CellCollector(indexer, {
    lock: {
      code_hash: SECP256k1Blake160CodeHash,
      hash_type: "type",
      args: senderLockScriptArgs,
    },
    data: "any",
  });
  let pool_cells = [];
  for await (const cell of collector.collect()) {
    pool_cells.push(cell);
  }
  let potential_cells = pool_cells.filter((cell) => {
    return BigInt(cell.cell_output.capacity) > BigInt(amount)
  })
  if (potential_cells.length == 0) {
    throw new Error("No cell is big enough");
  }
  return potential_cells[0];
}

const bigIntToLeHex = (x: bigint) => {
  // TODO: won't work for nubers larger than 8 bytes
  const buf = Buffer.alloc(16);
  buf.writeBigInt64LE(x);
  return '0x' + buf.toString('hex').padEnd(32, '0');
}

export const buildDepositTx = async (params: PoolDepositParams) => {
  const { sender, senderArgs, amount, txFee } = params;

  const pool_cell = await getLatestPoolCell();
  // const code_cell = await getPoolCodeCell();
  const fund_cell = await getFundingCell(senderArgs, amount);

  let inputs: List<Cell> = List([
    pool_cell,
    fund_cell
  ]);

  let deps: List<CellDep> = List([
    POOL_LOGIC_DEP,
    BLAKE_DEP,
    SUDT_DEP
  ]);

  // let newPoolCapacity = BigInt(pool_cell.cell_output.capacity) + BigInt(fund_cell.cell_output.capacity) - BigInt(14200000000);

  let newPoolCapacity = BigInt(pool_cell.cell_output.capacity) + BigInt(amount);

  let [newPoolData, cCKBMinted] = parsePoolData(BigInt(amount),
    pool_cell.data,
    BigInt(pool_cell.cell_output.capacity),
    BigInt(fund_cell.cell_output.capacity),
    newPoolCapacity);
  
  const lockScript = {
    hash_type: "data" as HashType,
    code_hash: POOL_CODE_HASH,
    args: '0x00',
  }
  const SUDT_OWNER = utils.computeScriptHash(lockScript);

  let witnesses: List<HexString> = List(['0x00', '0x55000000100000005500000055000000410000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'])
  
  let newPoolCapacityHex = "0x" + newPoolCapacity.toString(16);

  const secondOutputCapacity = "0x" + (BigInt(pool_cell.cell_output.capacity) + BigInt(fund_cell.cell_output.capacity) - BigInt(txFee) - newPoolCapacity).toString(16); 
    
  let outputs: List<Cell> = List([
    {
      cell_output: {
        capacity: newPoolCapacityHex,
        lock: {
          // @ts-ignore
          // code_hash: utils.ckbHash(code_cell.data).serializeJson(),
          code_hash: POOL_CODE_HASH,
          hash_type: "data" as HashType,
          args: "0x00",
        },
      },
      data: newPoolData as string,
    },
    {
      cell_output: {
        capacity: secondOutputCapacity,
        lock: {
          code_hash: SECP256k1Blake160CodeHash,
          hash_type: "type" as HashType,
          args: senderArgs,
        },
        type: {
          code_hash: SUDT_CODE_HASH,
          hash_type: "data" as HashType,
          args: SUDT_OWNER,
        },
      },
      data: bigIntToLeHex(cCKBMinted as bigint) as string,
    }
  ]);

  console.log(outputs);

  let txSkeleton = TransactionSkeleton({
    // @ts-ignore
    cellProvider: indexer,
    inputs: inputs,
    outputs: outputs,
    cellDeps: deps,
    witnesses
  });

  txSkeleton = secp256k1Blake160.prepareSigningEntries(txSkeleton);
  return txSkeleton;
};

export const buildWithdrawTx = async (params) => {
  const { sender, recipient, amount, txFee } = params;

  let txSkeleton = TransactionSkeleton({
    // @ts-ignore
    cellProvider: indexer,
  });

  txSkeleton = await secp256k1Blake160.transfer(
    txSkeleton,
    sender,
    recipient,
    BigInt(amount)
  );
  txSkeleton = await secp256k1Blake160.payFee(
    txSkeleton,
    sender,
    BigInt(txFee)
  );
  txSkeleton = secp256k1Blake160.prepareSigningEntries(txSkeleton);
  return txSkeleton;
};
