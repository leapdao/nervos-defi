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


initializeConfig();


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    const indexer = new Indexer("http://127.0.0.1:8114", "./indexed-data");
    indexer.startForever();

    let collector = new CellCollector(indexer, {
        lock: {
            code_hash:
                "0x9b6e16123e192dcc568fec19f428831cc653ed5dd9ce819d060c17c50159cfcc",
            hash_type: "type",
            args: "0x00",
        },
        data: "any",
    });

    let collector1 = new CellCollector(indexer, {
        lock: {
            code_hash:
                "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
            hash_type: "type",
            args: "0x0000000000000000000000000000000000000000",
        },
        data: "any",
    });

    let collector2 = new CellCollector(indexer, {
        lock: {
            code_hash:
                "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
            hash_type: "type",
            args: "0xcc38ca2352de33fabae029878e83c4c85561ed1f",
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

    let outputs: List<Cell> = List([
        {
            cell_output: {
                capacity: "0x" + (BigInt(pool_cell.cell_output.capacity) + BigInt(funding_cell.cell_output.capacity)).toString(16),
                lock: {
                    code_hash: utils.ckbHash(code_cell.data).serializeJson(),
                    hash_type: "type" as HashType,
                    args: "0x00",
                },
            },
            data: newPoolData,
        },
        {

        }
    ]);




    // let funding_cell =
    // let funding_cell = cells_user[0];


}

main();
