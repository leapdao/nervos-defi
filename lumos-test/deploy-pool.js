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
    var e_1, _a, e_2, _b;
    return __awaiter(this, void 0, void 0, function () {
        var indexer, tip, collector, cells, _c, _d, cell, e_1_1, code_collector, cells_c, _e, _f, cell, e_2_1, funding_cell, code_cell, inputs, deps, outputs, skeleton, signatures, tx, rpc, res;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    indexer = new indexer_1.Indexer("http://127.0.0.1:8114", "./indexed-data");
                    indexer.startForever();
                    return [4 /*yield*/, sleep(10000)];
                case 1:
                    _g.sent();
                    return [4 /*yield*/, indexer.tip()];
                case 2:
                    tip = _g.sent();
                    console.log(tip);
                    collector = new indexer_1.CellCollector(indexer, {
                        lock: {
                            code_hash: "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
                            hash_type: "type",
                            args: "0x4e7a1bae99f17d4008b4f15a9b809240ca213ca3"
                        },
                        data: "any"
                    });
                    cells = [];
                    _g.label = 3;
                case 3:
                    _g.trys.push([3, 8, 9, 14]);
                    _c = __asyncValues(collector.collect());
                    _g.label = 4;
                case 4: return [4 /*yield*/, _c.next()];
                case 5:
                    if (!(_d = _g.sent(), !_d.done)) return [3 /*break*/, 7];
                    cell = _d.value;
                    cells.push(cell);
                    _g.label = 6;
                case 6: return [3 /*break*/, 4];
                case 7: return [3 /*break*/, 14];
                case 8:
                    e_1_1 = _g.sent();
                    e_1 = { error: e_1_1 };
                    return [3 /*break*/, 14];
                case 9:
                    _g.trys.push([9, , 12, 13]);
                    if (!(_d && !_d.done && (_a = _c["return"]))) return [3 /*break*/, 11];
                    return [4 /*yield*/, _a.call(_c)];
                case 10:
                    _g.sent();
                    _g.label = 11;
                case 11: return [3 /*break*/, 13];
                case 12:
                    if (e_1) throw e_1.error;
                    return [7 /*endfinally*/];
                case 13: return [7 /*endfinally*/];
                case 14:
                    code_collector = new indexer_1.CellCollector(indexer, {
                        lock: {
                            code_hash: "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
                            hash_type: "type",
                            args: "0x0000000000000000000000000000000000000000"
                        },
                        data: "any"
                    });
                    cells_c = [];
                    _g.label = 15;
                case 15:
                    _g.trys.push([15, 20, 21, 26]);
                    _e = __asyncValues(code_collector.collect());
                    _g.label = 16;
                case 16: return [4 /*yield*/, _e.next()];
                case 17:
                    if (!(_f = _g.sent(), !_f.done)) return [3 /*break*/, 19];
                    cell = _f.value;
                    cells_c.push(cell);
                    _g.label = 18;
                case 18: return [3 /*break*/, 16];
                case 19: return [3 /*break*/, 26];
                case 20:
                    e_2_1 = _g.sent();
                    e_2 = { error: e_2_1 };
                    return [3 /*break*/, 26];
                case 21:
                    _g.trys.push([21, , 24, 25]);
                    if (!(_f && !_f.done && (_b = _e["return"]))) return [3 /*break*/, 23];
                    return [4 /*yield*/, _b.call(_e)];
                case 22:
                    _g.sent();
                    _g.label = 23;
                case 23: return [3 /*break*/, 25];
                case 24:
                    if (e_2) throw e_2.error;
                    return [7 /*endfinally*/];
                case 25: return [7 /*endfinally*/];
                case 26:
                    funding_cell = cells[0];
                    code_cell = cells_c[0];
                    inputs = immutable_1.List([
                    // funding_cell
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
                    return [4 /*yield*/, common_scripts_1.secp256k1Blake160.payFee(skeleton, "ckt1qyqyu7sm46vlzl2qpz60zk5mszfypj3p8j3srahsnn", BigInt(10000000000))];
                case 27:
                    skeleton = _g.sent();
                    skeleton = common_scripts_1.secp256k1Blake160.prepareSigningEntries(skeleton);
                    console.log(JSON.stringify(helpers_1.createTransactionFromSkeleton(skeleton), null, 2));
                    console.log(skeleton.get("signingEntries").toArray());
                    signatures = ["0xb74773b8c445f159d960f652a36736e21b05635562ece3125082e655077d6b962b008190ecf08aeed36e627da6020023637ed65553ef167fff918c45ea23721800"];
                    tx = helpers_1.sealTransaction(skeleton, signatures);
                    console.log(tx);
                    rpc = new ckb_js_toolkit_1.RPC("http://127.0.0.1:8114");
                    return [4 /*yield*/, rpc.send_transaction(tx)];
                case 28:
                    res = _g.sent();
                    console.log(res);
                    console.log("END");
                    return [2 /*return*/];
            }
        });
    });
}
main();
