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

function bigIntToLeHex(x: bigint) {
    // TODO: won't work for nubers larger than 8 bytes
    const buf = Buffer.alloc(16);
    buf.writeBigInt64LE(x);
    return '0x' + buf.toString('hex').padEnd(32, '0');
}

async function main() {
    // const indexer = new Indexer("http://127.0.0.1:8114", "./indexed-data");
    const indexer = new Indexer("http://aggron.leapdao.org:8114", "./indexed-data-aggron");
    indexer.startForever();

    // await sleep(10000);
    //     let tip = await indexer.tip();
    // console.log(tip);

    let collector = new CellCollector(indexer, {
        lock: {
            code_hash: poolCodeHash,
            hash_type: "data",
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

    // console.log('funding cells:', cells_use);
    // return;
    // console.log(cells_user);

    // todo - pick funding cells by capacity

    let pool_cell = cells_f[0];

    // TODO: @JK to rename this 
    let code_cell = cells_user.filter((cell) => {
        return cell.out_point.tx_hash === '0x2161417ecaa7e2c796456923e7be023cfec694a1eb6c6eb074da44372b7545f3'; 
    })[0];

    let funding_cell = cells_use[0];
    console.log(pool_cell, code_cell, funding_cell);

    let inputs: List<Cell> = List([
        pool_cell,
        funding_cell,
        // cells_use[1],
    ]);

    let deps: List<CellDep> = List([
        // pool logic
        {
            out_point: code_cell.out_point,
            dep_type: "code" as DepType,
        },
        // SECP256k1Blake160 code 
        // taken from https://github.com/nervosnetwork/rfcs/blob/master/rfcs/0024-ckb-system-script-list/0024-ckb-system-script-list.md
        {
            out_point: {
                index: '0x0',
                tx_hash: '0xf8de3bb47d055cdf460d93a2a6e1b05f7432f9777c8c474abf4eec1d4aee5d37',
            },
            dep_type: "dep_group" as DepType,
        },
        // find SUDT script
        {
            out_point: {
                index: '0x0',
                tx_hash: '0xc1b2ae129fad7465aaa9acc9785f842ba3e6e8b8051d899defa89f5508a77958',
            },
            dep_type: "code" as DepType,
        }
    ]);

    const parsePoolData = (poolData: HexString, poolCap: bigint, fundCap: bigint, outCap: bigint) => {
        const cCKB_total_supply = BigInt(poolData.slice(0, 34));
        const CKB_total_supply = BigInt("0x" + poolData.slice(34, 66));

        const depositAmount = fundCap - (poolCap + fundCap - outCap);

        const x = depositAmount * cCKB_total_supply / CKB_total_supply;


        const new_cCKB_total_supply = cCKB_total_supply + x;
        const new_CKB_total_supply = CKB_total_supply + BigInt(depositAmount);

        console.log('here:', new_cCKB_total_supply, cCKB_total_supply + x);
        console.log('FEEEEEE!!!!', poolCap + fundCap - (outCap + BigInt(14200000000)));

        return ["0x" + new_cCKB_total_supply.toString(16).padStart(32, "0") + new_CKB_total_supply.toString(16).padStart(32, "0"), x];
    }

    // 142 is the capacity of the second output
    let newPoolCapacity = BigInt(pool_cell.cell_output.capacity) + BigInt(funding_cell.cell_output.capacity) - BigInt(14200000000);

    let [newPoolData, x] = parsePoolData(pool_cell.data, BigInt(pool_cell.cell_output.capacity), BigInt(funding_cell.cell_output.capacity), newPoolCapacity);
    console.log(newPoolData, x);



    console.log('poolcell', pool_cell);

      const lockScript: Script = {
        hash_type: 'data' as HashType,
        code_hash: poolCodeHash,
        args: '0x00',
      }
    const lockHash = utils.computeScriptHash(lockScript);

    // 142 is the capacity of the second output
    let newPoolCapacityHex = "0x" + newPoolCapacity.toString(16);

    let outputs: List<Cell> = List([
        {
            cell_output: {
                capacity: newPoolCapacityHex,
                lock: {
                    code_hash: utils.ckbHash(code_cell.data).serializeJson(),
                    hash_type: "data" as HashType,
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
                    hash_type: 'data' as HashType,
                    args: lockHash
                }

            },
            data: bigIntToLeHex(x as bigint) as string,
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

    // return;

    let signatures = ["0x2093926377b66569bceffa81e20187777fb0cddcd35f09fd871ff6a26ebdaf2513137af09bba2df9f0803fc1db18132329f21ed20d6c0222fd2cb089d0931e7401"];

    const tx = sealTransaction(skeleton, signatures);

    console.log(tx);


    const rpc = new RPC("http://aggron.leapdao.org:8114");
    let res = await rpc.send_transaction(tx);
    console.log(res);

    console.log("END");
}

main();
