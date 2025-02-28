"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
exports.__esModule = true;
var config_manager_1 = require("@ckb-lumos/config-manager");
var indexer_1 = require("@ckb-lumos/indexer");
var immutable_1 = require("immutable");
var base_1 = require("@ckb-lumos/base");
var helpers_1 = require("@ckb-lumos/helpers");
var common_scripts_1 = require("@ckb-lumos/common-scripts");
var ckb_js_toolkit_1 = require("ckb-js-toolkit");
config_manager_1.initializeConfig();
function sleep(ms) {
    return new Promise(function (resolve) { return setTimeout(resolve, ms); });
}
function main() {
    var e_1, _a;
    return __awaiter(this, void 0, void 0, function () {
        var indexer, tip, collector, cells, _b, _c, cell, e_1_1, funding_cell, code_cell, inputs, deps, outputs, skeleton, signatures, tx, rpc, res;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    indexer = new indexer_1.Indexer("http://127.0.0.1:8114", "./indexed-data");
                    indexer.startForever();
                    return [4 /*yield*/, indexer.tip()];
                case 1:
                    tip = _d.sent();
                    console.log(tip);
                    collector = new indexer_1.CellCollector(indexer, {
                        lock: {
                            code_hash: "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
                            hash_type: "type",
                            args: "0xcc38ca2352de33fabae029878e83c4c85561ed1f"
                        },
                        data: "any"
                    });
                    cells = [];
                    _d.label = 2;
                case 2:
                    _d.trys.push([2, 7, 8, 13]);
                    _b = __asyncValues(collector.collect());
                    _d.label = 3;
                case 3: return [4 /*yield*/, _b.next()];
                case 4:
                    if (!(_c = _d.sent(), !_c.done)) return [3 /*break*/, 6];
                    cell = _c.value;
                    cells.push(cell);
                    _d.label = 5;
                case 5: return [3 /*break*/, 3];
                case 6: return [3 /*break*/, 13];
                case 7:
                    e_1_1 = _d.sent();
                    e_1 = { error: e_1_1 };
                    return [3 /*break*/, 13];
                case 8:
                    _d.trys.push([8, , 11, 12]);
                    if (!(_c && !_c.done && (_a = _b["return"]))) return [3 /*break*/, 10];
                    return [4 /*yield*/, _a.call(_b)];
                case 9:
                    _d.sent();
                    _d.label = 10;
                case 10: return [3 /*break*/, 12];
                case 11:
                    if (e_1) throw e_1.error;
                    return [7 /*endfinally*/];
                case 12: return [7 /*endfinally*/];
                case 13:
                    funding_cell = cells[1];
                    code_cell = cells[0];
                    console.log("code cell", code_cell);
                    inputs = immutable_1.List([
                        funding_cell
                    ]);
                    deps = immutable_1.List([
                        {
                            out_point: code_cell.out_point,
                            dep_type: "code"
                        }
                    ]);
                    outputs = immutable_1.List([
                        {
                            cell_output: {
                                capacity: "0x2363e7f00",
                                lock: {
                                    code_hash: base_1.utils.ckbHash(code_cell.data).serializeJson(),
                                    hash_type: "type",
                                    args: "0x00"
                                }
                            },
                            data: "0x0000000000000000000000000000002000000000000000000000000000000020"
                        }
                    ]);
                    skeleton = helpers_1.TransactionSkeleton({
                        cellProvider: indexer,
                        inputs: inputs,
                        outputs: outputs,
                        cellDeps: deps
                    });
                    return [4 /*yield*/, common_scripts_1.secp256k1Blake160.payFee(skeleton, "ckt1qyqvcwx2ydfduvl6htsznpuws0zvs4tpa50sd3c4sw", BigInt(100000000))];
                case 14:
                    skeleton = _d.sent();
                    skeleton = common_scripts_1.secp256k1Blake160.prepareSigningEntries(skeleton);
                    console.log(JSON.stringify(helpers_1.createTransactionFromSkeleton(skeleton), null, 2));
                    console.log(skeleton.get("signingEntries").toArray());
                    signatures = ["0xc005f95648decb00449c668fff743f406e7eaaba3e7547a3132d553702f2f0616e9f7d741aae10566d52b51ab2ce5ab854f72129307e1d6f257f7531dac1accc01"];
                    tx = helpers_1.sealTransaction(skeleton, signatures);
                    console.log(tx);
                    rpc = new ckb_js_toolkit_1.RPC("http://127.0.0.1:8114");
                    return [4 /*yield*/, rpc.send_transaction(tx)];
                case 15:
                    res = _d.sent();
                    console.log(res);
                    console.log("END");
                    return [2 /*return*/];
            }
        });
    });
}
main();
