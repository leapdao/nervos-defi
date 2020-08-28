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
var SECP256k1Blake160CodeHash = '0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8';
var EMPTY_ARGS = "0x0000000000000000000000000000000000000000";
// inputs
var userLockArgs = '0x4e7a1bae99f17d4008b4f15a9b809240ca213ca3';
var userAddress = 'ckt1qyqyu7sm46vlzl2qpz60zk5mszfypj3p8j3srahsnn';
var poolCodeHash = '0x25bb89d7e601d70d2111c5ced8effc7a7c0d8a459e55f3efe193c0ff0bf07ce1';
config_manager_1.initializeConfig();
function sleep(ms) {
    return new Promise(function (resolve) { return setTimeout(resolve, ms); });
}
function main() {
    var e_1, _a, e_2, _b, e_3, _c;
    return __awaiter(this, void 0, void 0, function () {
        var indexer, collector, collector1, collector2, cells_f, _d, _e, cell, e_1_1, cells_user, _f, _g, cell, e_2_1, cells_use, _h, _j, cell, e_3_1, pool_cell, code_cell, funding_cell, inputs, deps, parsePoolData, _k, newPoolData, x, capacityHex, lockScript, lockHash, outputs, skeleton, signatures, tx, rpc, res;
        return __generator(this, function (_l) {
            switch (_l.label) {
                case 0:
                    indexer = new indexer_1.Indexer("http://127.0.0.1:8114", "./indexed-data");
                    indexer.startForever();
                    collector = new indexer_1.CellCollector(indexer, {
                        lock: {
                            code_hash: poolCodeHash,
                            hash_type: "type",
                            args: "0x00"
                        },
                        data: "any"
                    });
                    collector1 = new indexer_1.CellCollector(indexer, {
                        lock: {
                            code_hash: SECP256k1Blake160CodeHash,
                            hash_type: "type",
                            args: EMPTY_ARGS
                        },
                        data: "any"
                    });
                    collector2 = new indexer_1.CellCollector(indexer, {
                        lock: {
                            code_hash: SECP256k1Blake160CodeHash,
                            hash_type: "type",
                            args: userLockArgs
                        },
                        data: "any"
                    });
                    cells_f = [];
                    _l.label = 1;
                case 1:
                    _l.trys.push([1, 6, 7, 12]);
                    _d = __asyncValues(collector.collect());
                    _l.label = 2;
                case 2: return [4 /*yield*/, _d.next()];
                case 3:
                    if (!(_e = _l.sent(), !_e.done)) return [3 /*break*/, 5];
                    cell = _e.value;
                    cells_f.push(cell);
                    _l.label = 4;
                case 4: return [3 /*break*/, 2];
                case 5: return [3 /*break*/, 12];
                case 6:
                    e_1_1 = _l.sent();
                    e_1 = { error: e_1_1 };
                    return [3 /*break*/, 12];
                case 7:
                    _l.trys.push([7, , 10, 11]);
                    if (!(_e && !_e.done && (_a = _d["return"]))) return [3 /*break*/, 9];
                    return [4 /*yield*/, _a.call(_d)];
                case 8:
                    _l.sent();
                    _l.label = 9;
                case 9: return [3 /*break*/, 11];
                case 10:
                    if (e_1) throw e_1.error;
                    return [7 /*endfinally*/];
                case 11: return [7 /*endfinally*/];
                case 12:
                    cells_user = [];
                    _l.label = 13;
                case 13:
                    _l.trys.push([13, 18, 19, 24]);
                    _f = __asyncValues(collector1.collect());
                    _l.label = 14;
                case 14: return [4 /*yield*/, _f.next()];
                case 15:
                    if (!(_g = _l.sent(), !_g.done)) return [3 /*break*/, 17];
                    cell = _g.value;
                    cells_user.push(cell);
                    _l.label = 16;
                case 16: return [3 /*break*/, 14];
                case 17: return [3 /*break*/, 24];
                case 18:
                    e_2_1 = _l.sent();
                    e_2 = { error: e_2_1 };
                    return [3 /*break*/, 24];
                case 19:
                    _l.trys.push([19, , 22, 23]);
                    if (!(_g && !_g.done && (_b = _f["return"]))) return [3 /*break*/, 21];
                    return [4 /*yield*/, _b.call(_f)];
                case 20:
                    _l.sent();
                    _l.label = 21;
                case 21: return [3 /*break*/, 23];
                case 22:
                    if (e_2) throw e_2.error;
                    return [7 /*endfinally*/];
                case 23: return [7 /*endfinally*/];
                case 24:
                    cells_use = [];
                    _l.label = 25;
                case 25:
                    _l.trys.push([25, 30, 31, 36]);
                    _h = __asyncValues(collector2.collect());
                    _l.label = 26;
                case 26: return [4 /*yield*/, _h.next()];
                case 27:
                    if (!(_j = _l.sent(), !_j.done)) return [3 /*break*/, 29];
                    cell = _j.value;
                    cells_use.push(cell);
                    _l.label = 28;
                case 28: return [3 /*break*/, 26];
                case 29: return [3 /*break*/, 36];
                case 30:
                    e_3_1 = _l.sent();
                    e_3 = { error: e_3_1 };
                    return [3 /*break*/, 36];
                case 31:
                    _l.trys.push([31, , 34, 35]);
                    if (!(_j && !_j.done && (_c = _h["return"]))) return [3 /*break*/, 33];
                    return [4 /*yield*/, _c.call(_h)];
                case 32:
                    _l.sent();
                    _l.label = 33;
                case 33: return [3 /*break*/, 35];
                case 34:
                    if (e_3) throw e_3.error;
                    return [7 /*endfinally*/];
                case 35: return [7 /*endfinally*/];
                case 36:
                    pool_cell = cells_f[0];
                    code_cell = cells_user[0];
                    funding_cell = cells_use[0];
                    console.log(pool_cell, code_cell, funding_cell);
                    inputs = immutable_1.List([
                        pool_cell,
                        funding_cell
                    ]);
                    deps = immutable_1.List([
                        {
                            out_point: code_cell.out_point,
                            dep_type: "code"
                        }
                    ]);
                    parsePoolData = function (poolData, depositCapacity) {
                        var cCKB_total_supply = BigInt(poolData.slice(0, 34));
                        var CKB_total_supply = BigInt("0x" + poolData.slice(34, 66));
                        var x = BigInt(depositCapacity) * cCKB_total_supply / CKB_total_supply;
                        var new_cCKB_total_supply = cCKB_total_supply + x;
                        var new_CKB_total_supply = CKB_total_supply + BigInt(depositCapacity);
                        return ["0x" + new_cCKB_total_supply.toString(16).padStart(32, "0") + new_CKB_total_supply.toString(16).padStart(32, "0"), x];
                    };
                    _k = parsePoolData(pool_cell.data, funding_cell.cell_output.capacity), newPoolData = _k[0], x = _k[1];
                    console.log(newPoolData, x);
                    capacityHex = "0x" + (BigInt(pool_cell.cell_output.capacity) + BigInt(funding_cell.cell_output.capacity) - BigInt(14200000000)).toString(16);
                    console.log('capacityHex', capacityHex);
                    console.log('poolcell', pool_cell);
                    lockScript = {
                        hash_type: 'type',
                        code_hash: poolCodeHash,
                        args: EMPTY_ARGS
                    };
                    lockHash = base_1.utils.computeScriptHash(lockScript);
                    outputs = immutable_1.List([
                        {
                            cell_output: {
                                capacity: capacityHex,
                                lock: {
                                    code_hash: base_1.utils.ckbHash(code_cell.data).serializeJson(),
                                    hash_type: "type",
                                    args: "0x00"
                                }
                            },
                            data: newPoolData
                        },
                        {
                            cell_output: {
                                capacity: '0x34e62ce00',
                                lock: {
                                    code_hash: SECP256k1Blake160CodeHash,
                                    hash_type: 'type',
                                    args: userLockArgs
                                },
                                type: {
                                    code_hash: '0x48dbf59b4c7ee1547238021b4869bceedf4eea6b43772e5d66ef8865b6ae7212',
                                    hash_type: 'type',
                                    args: lockHash
                                }
                            },
                            data: '0x' + x.toString(16).padStart(32, '0')
                        }
                    ]);
                    skeleton = helpers_1.TransactionSkeleton({
                        cellProvider: indexer,
                        inputs: inputs,
                        outputs: outputs,
                        cellDeps: deps,
                        witnesses: immutable_1.List(['0x00', '0x55000000100000005500000055000000410000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'])
                    });
                    //skeleton = await secp256k1Blake160.payFee(skeleton, userAddress, BigInt(10000000000));
                    skeleton = common_scripts_1.secp256k1Blake160.prepareSigningEntries(skeleton);
                    console.log('after fee');
                    console.log(JSON.stringify(helpers_1.createTransactionFromSkeleton(skeleton), null, 2));
                    console.log(skeleton.get("signingEntries").toArray());
                    signatures = ["0xe4e8e42baa3e95f0bc31246e83adcfc98e7d6fc452e473096d9b8d12868aa09f184d4c81fc94ad351bc5c6866bfab32540fe6c70b36db42f15f1b70b18ff1f0201"];
                    tx = helpers_1.sealTransaction(skeleton, signatures);
                    console.log(tx);
                    rpc = new ckb_js_toolkit_1.RPC("http://127.0.0.1:8114");
                    return [4 /*yield*/, rpc.send_transaction(tx)];
                case 37:
                    res = _l.sent();
                    console.log(res);
                    console.log("END");
                    return [2 /*return*/];
            }
        });
    });
}
main();
