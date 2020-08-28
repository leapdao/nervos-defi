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

    await sleep(10000);
    let tip = await indexer.tip();
    console.log(tip);

    let collector = new CellCollector(indexer, {
        lock: {
            code_hash:
                "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
            hash_type: "type",
            args: "0x4e7a1bae99f17d4008b4f15a9b809240ca213ca3",
        },
        data: "any",
    });

    let cells = [];
    for await (const cell of collector.collect()) {
        cells.push(cell);
    }

    let code_collector = new CellCollector(indexer, {
        lock: {
            code_hash:
                "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
            hash_type: "type",
            args: "0x0000000000000000000000000000000000000000",
        },
        data: "any",
    });

    let cells_c = [];
    for await (const cell of code_collector.collect()) {
        cells_c.push(cell);
    }



    let funding_cell = cells[0];
    let code_cell = cells_c[0];




    let inputs: List<Cell> = List([
        // funding_cell
    ]);

    let deps: List<CellDep> = List([
        {
            out_point: code_cell.out_point,
            dep_type: "code" as DepType,
        }
    ]);

    // console.log(utils.ckbHash(code_cell.data).serializeJson());

    let outputs: List<Cell> = List([
        {
            cell_output: {
                capacity: "0x2363e7f00",
                lock: {
                    code_hash: utils.ckbHash(code_cell.data).serializeJson(),
                    hash_type: "type" as HashType,
                    args: "0x00",
                },
            },
            data: "0x0000000000000000000000000000002000000000000000000000000000000020",
        }
    ]);

    let skeleton = TransactionSkeleton({
        cellProvider: indexer,
        inputs: inputs,
        outputs: outputs,
        cellDeps: deps,
    });

    skeleton = await secp256k1Blake160.payFee(skeleton, "ckt1qyqyu7sm46vlzl2qpz60zk5mszfypj3p8j3srahsnn", BigInt(10000000000));
    skeleton = secp256k1Blake160.prepareSigningEntries(skeleton);

    console.log(JSON.stringify(createTransactionFromSkeleton(skeleton), null, 2));

    console.log(skeleton.get("signingEntries").toArray());

    let signatures = ["0xb74773b8c445f159d960f652a36736e21b05635562ece3125082e655077d6b962b008190ecf08aeed36e627da6020023637ed65553ef167fff918c45ea23721800"];

    const tx = sealTransaction(skeleton, signatures);

    console.log(tx);


    const rpc = new RPC("http://127.0.0.1:8114");
    let res = await rpc.send_transaction(tx);
    console.log(res);

    console.log("END");
}
main();
