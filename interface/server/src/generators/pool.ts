import { indexer, rpc } from "../index";
import { common, secp256k1Blake160 } from "@ckb-lumos/common-scripts";
import { CellCollector } from "@ckb-lumos/indexer";
import { TransactionSkeleton } from "@ckb-lumos/helpers";
import { List, Record, Map } from "immutable";
import {
  core,
  HexString,
  Script,
  Cell,
  CellDep,
  Address,
  CellProvider,
  Hash,
  PackedSince,
  Transaction,
  WitnessArgs,
  Input,
  DepType,
  HashType,
  utils,
} from "@ckb-lumos/base";


const POOL_CODE_HASH = "0x9b6e16123e192dcc568fec19f428831cc653ed5dd9ce819d060c17c50159cfcc0";
const POOL_CODE_ID = "0x0000000000000000000000000000000000000000";
const SIGNED_CODE_HASH = "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8";
const SUDT_CODE_HASH = "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8"; // TODO:: get correct code hash

// TODO:: Still needs logic
export const getPoolBalance = async (lockScript: Script) => {
  let balance = BigInt(0);

  const collector = indexer.collector({ lock: lockScript, type: null });

  const cells: Cell[] = [];
  for await (const cell of collector.collect()) {
    cells.push(cell);
  }

  return cells
    .map((cell) =>
      BigInt(
        // @ts-ignore
        cell.cell_output.capacity
      )
    )
    .reduce((balance, capacity) => (balance = balance += capacity));
};

const getLatestPoolCell = async (): Promise<Cell> => {
  let collector = new CellCollector(indexer, {
    lock: {
      code_hash: POOL_CODE_HASH,
      hash_type: "type",
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
      code_hash: SIGNED_CODE_HASH,
      hash_type: "type",
      args: POOL_CODE_ID,
    },
    data: "any",
  });
  let pool_cells = [];
  for await (const cell of collector.collect()) {
    pool_cells.push(cell);
  }
  if (pool_cells.length == 0) {
    throw new Error("No code cell found");
  }
  return pool_cells[0];
}

const parsePoolData = (poolData: HexString, depositCapacity: HexString) => {
  const cCKB_total_supply = BigInt(poolData.slice(0, 34));
  const CKB_total_supply = BigInt("0x" + poolData.slice(34, 66));

  const x = BigInt(depositCapacity) * cCKB_total_supply / CKB_total_supply;

  const new_cCKB_total_supply = cCKB_total_supply + x;
  const new_CKB_total_supply = CKB_total_supply + BigInt(depositCapacity);

  return ["0x" + new_cCKB_total_supply.toString(16).padStart(32, "0") + new_CKB_total_supply.toString(16).padStart(32, "0"), x];
}

const getFundingCell = async (senderLockScriptArgs: HexString, amount: string): Promise<Cell> => {
  let collector = new CellCollector(indexer, {
    lock: {
      code_hash: SIGNED_CODE_HASH,
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
    return BigInt(cell.cell_output) > BigInt(amount)
  })
  if (potential_cells.length == 0) {
    throw new Error("No cell is big enough");
  }
  return potential_cells[0];
}

export const buildDepositTx = async (params) => {
  const { sender, senderArgs, amount, txFee } = params;

  const pool_cell = await getLatestPoolCell();
  const code_cell = await getPoolCodeCell();
  const fund_cell = await getFundingCell(senderArgs, amount);

  let inputs: List<Cell> = List([
    pool_cell,
    fund_cell
  ]);

  let deps: List<CellDep> = List([
    {
      out_point: code_cell.out_point,
      dep_type: "code" as DepType,
    }
  ]);

  let [newPoolData, cCKBMinted] = parsePoolData(pool_cell.data, fund_cell.cell_output.capacity);

  const lockScript = {
    hash_type: "type" as HashType,
    code_hash: POOL_CODE_HASH,
    args: POOL_CODE_ID,
  }
  const SUDT_OWNER = utils.computeScriptHash(lockScript);

  let witnesses: List<HexString> = List(["0x00", ""])
  
  let outputs: List<Cell> = List([
    {
      cell_output: {
        capacity: "0x" + (BigInt(pool_cell.cell_output.capacity) + BigInt(amount)).toString(16),
        lock: {
          // @ts-ignore
          code_hash: utils.ckbHash(code_cell.data).serializeJson(),
          hash_type: "type" as HashType,
          args: "0x00",
        },
      },
      data: newPoolData as string,
    },
    {
      cell_output: {
        capacity: "0x" + (BigInt(fund_cell.cell_output.capacity) - BigInt(amount) - BigInt(txFee)).toString(16),
        lock: {
          code_hash: SIGNED_CODE_HASH,
          hash_type: "type" as HashType,
          args: senderArgs,
        },
        type: {
          code_hash: SUDT_CODE_HASH,
          hash_type: "type" as HashType,
          args: SUDT_OWNER,
        },
      },
      data: cCKBMinted as string,
    }
  ]);

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
