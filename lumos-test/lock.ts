import { initializeConfig, getConfig } from "@ckb-lumos/config-manager";
import { Indexer, CellCollector } from "@ckb-lumos/indexer";
import { List, Record, Map } from "immutable";
import {
    core,
    HexString,
    Cell,
    Script,
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
} from "@ckb-lumos/base";
import { utils } from "@ckb-lumos/base";
import {
    generateAddress, parseAddress, createTransactionFromSkeleton,
    sealTransaction, TransactionSkeleton
} from "@ckb-lumos/helpers";
import { secp256k1Blake160 } from "@ckb-lumos/common-scripts";
import { RPC } from "ckb-js-toolkit";

const SECP256k1Blake160CodeHash = '0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8';
const EMPTY_ARGS = "0x0000000000000000000000000000000000000000";


// inputs
const userLockArgs = '0x4e7a1bae99f17d4008b4f15a9b809240ca213ca3';
const userAddress = 'ckt1qyqyu7sm46vlzl2qpz60zk5mszfypj3p8j3srahsnn';
const poolCodeHash = '0x25bb89d7e601d70d2111c5ced8effc7a7c0d8a459e55f3efe193c0ff0bf07ce1';

initializeConfig();


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    const indexer = new Indexer("http://127.0.0.1:8114", "./indexed-data");
    indexer.startForever();

    let collector = new CellCollector(indexer, {
        lock: {
            code_hash: poolCodeHash,
            hash_type: "type",
            args: "0x00",
        },
        data: "any",
    });

    let collector1 = new CellCollector(indexer, {
        lock: {
            code_hash: SECP256k1Blake160CodeHash,
            hash_type: "type",
            args: EMPTY_ARGS,
        },
        data: "any",
    });

    let collector2 = new CellCollector(indexer, {
        lock: {
            code_hash: SECP256k1Blake160CodeHash,
            hash_type: "type",
            args: userLockArgs,
        },
        data: "any",
    });

    let cells_f = [];
    for await (const cell of collector.collect()) {
        cells_f.push(cell);
    }
    let cells_user = [];
    for await (const cell of collector1.collect()) {
        cells_user.push(cell);
    }
    let cells_use = [];
    for await (const cell of collector2.collect()) {
        cells_use.push(cell);
    }

    // console.log(cells_f);
    // console.log(cells_user);

    // todo - pick funding cells by capacity

    let pool_cell = cells_f[0];
    let code_cell = cells_user[0];
    let funding_cell = cells_use[0];
    console.log(pool_cell, code_cell, funding_cell);

    let inputs: List<Cell> = List([
        pool_cell,
        funding_cell
    ]);

    let deps: List<CellDep> = List([
        {
            out_point: code_cell.out_point,
            dep_type: "code" as DepType,
        }
    ]);

    const parsePoolData = (poolData: HexString, depositCapacity: HexString) => {
        const cCKB_total_supply = BigInt(poolData.slice(0, 34));
        const CKB_total_supply = BigInt("0x" + poolData.slice(34, 66));

        const x = BigInt(depositCapacity) * cCKB_total_supply / CKB_total_supply;

        const new_cCKB_total_supply = cCKB_total_supply + x;
        const new_CKB_total_supply = CKB_total_supply + BigInt(depositCapacity);

        return ["0x" + new_cCKB_total_supply.toString(16).padStart(32, "0") + new_CKB_total_supply.toString(16).padStart(32, "0"), x];
    }

    let [newPoolData, x] = parsePoolData(pool_cell.data, funding_cell.cell_output.capacity);
    console.log(newPoolData, x);

    // 142 is the capacity of the second output
    let capacityHex = "0x" + (BigInt(pool_cell.cell_output.capacity) + BigInt(funding_cell.cell_output.capacity) - BigInt(14200000000)).toString(16);
    console.log('capacityHex', capacityHex);

    console.log('poolcell', pool_cell);

      const lockScript: Script = {
        hash_type: 'type' as HashType,
        code_hash: poolCodeHash,
        args: EMPTY_ARGS,
      }
    const lockHash = utils.computeScriptHash(lockScript);

    let outputs: List<Cell> = List([
        {
            cell_output: {
                capacity: capacityHex,
                lock: {
                    code_hash: utils.ckbHash(code_cell.data).serializeJson(),
                    hash_type: "type" as HashType,
                    args: "0x00",
                },
            },
            data: newPoolData as string,
        },
        {
            cell_output: {
                capacity: '0x34e62ce00',
                lock: {
                    code_hash: SECP256k1Blake160CodeHash,
                    hash_type: 'type' as HashType,
                    args: userLockArgs
                },
                type: {
                    code_hash: '0x48dbf59b4c7ee1547238021b4869bceedf4eea6b43772e5d66ef8865b6ae7212',
                    hash_type: 'type' as HashType,
                    args: lockHash
                }

            },
            data: '0x' + x.toString(16).padStart(32, '0'),
        }
    ]);

    let skeleton = TransactionSkeleton({
        cellProvider: indexer,
        inputs: inputs,
        outputs: outputs,
        cellDeps: deps,
        witnesses: List(['0x00', '0x55000000100000005500000055000000410000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000']),
    });

    //skeleton = await secp256k1Blake160.payFee(skeleton, userAddress, BigInt(10000000000));

    skeleton = secp256k1Blake160.prepareSigningEntries(skeleton);
    console.log('after fee');
    console.log(JSON.stringify(createTransactionFromSkeleton(skeleton), null, 2));

    console.log(skeleton.get("signingEntries").toArray());

    //return;

    let signatures = ["0xe4e8e42baa3e95f0bc31246e83adcfc98e7d6fc452e473096d9b8d12868aa09f184d4c81fc94ad351bc5c6866bfab32540fe6c70b36db42f15f1b70b18ff1f0201"];

    const tx = sealTransaction(skeleton, signatures);

    console.log(tx);


    const rpc = new RPC("http://127.0.0.1:8114");
    let res = await rpc.send_transaction(tx);
    console.log(res);

    console.log("END");
}

main();
