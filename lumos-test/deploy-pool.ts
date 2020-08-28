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

    // await sleep(10000);
    let tip = await indexer.tip();
    console.log(tip);

    let collector = new CellCollector(indexer, {
        lock: {
            code_hash:
                "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
            hash_type: "type",
            args: "0xcc38ca2352de33fabae029878e83c4c85561ed1f",
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

    skeleton = await secp256k1Blake160.payFee(skeleton, "ckt1qyqvcwx2ydfduvl6htsznpuws0zvs4tpa50sd3c4sw", BigInt(10000000000));
    skeleton = secp256k1Blake160.prepareSigningEntries(skeleton);

    console.log(JSON.stringify(createTransactionFromSkeleton(skeleton), null, 2));

    console.log(skeleton.get("signingEntries").toArray());

    // return;

    let signatures = ["0x1e2fa5028bf1032a89b684918ad96e0988223e9b2d13f2ef0db32103f0272cd7225bbcbf74fdd2e00b1361b52b2ebe7973dfb1f7f61b4e7139dbb34d606b219200"];

    const tx = sealTransaction(skeleton, signatures);

    console.log(tx);


    const rpc = new RPC("http://127.0.0.1:8114");
    let res = await rpc.send_transaction(tx);
    console.log(res);

    console.log("END");
}
main();
