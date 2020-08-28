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
config_manager_1.initializeConfig();
function sleep(ms) {
    return new Promise(function (resolve) { return setTimeout(resolve, ms); });
}
function main() {
    var e_1, _a, e_2, _b, e_3, _c;
    return __awaiter(this, void 0, void 0, function () {
        var indexer, collector, collector1, collector2, cells_f, _d, _e, cell, e_1_1, cells_user, _f, _g, cell, e_2_1, cells_use, _h, _j, cell, e_3_1, pool_cell, code_cell, funding_cell;
        return __generator(this, function (_k) {
            switch (_k.label) {
                case 0:
                    indexer = new indexer_1.Indexer("http://127.0.0.1:8114", "./indexed-data");
                    indexer.startForever();
                    collector = new indexer_1.CellCollector(indexer, {
                        lock: {
                            code_hash: "0x9b6e16123e192dcc568fec19f428831cc653ed5dd9ce819d060c17c50159cfcc",
                            hash_type: "type",
                            args: "0x00"
                        },
                        data: "any"
                    });
                    collector1 = new indexer_1.CellCollector(indexer, {
                        lock: {
                            code_hash: "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
                            hash_type: "type",
                            args: "0x0000000000000000000000000000000000000000"
                        },
                        data: "any"
                    });
                    collector2 = new indexer_1.CellCollector(indexer, {
                        lock: {
                            code_hash: "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
                            hash_type: "type",
                            args: "0xcc38ca2352de33fabae029878e83c4c85561ed1f"
                        },
                        data: "any"
                    });
                    cells_f = [];
                    _k.label = 1;
                case 1:
                    _k.trys.push([1, 6, 7, 12]);
                    _d = __asyncValues(collector.collect());
                    _k.label = 2;
                case 2: return [4 /*yield*/, _d.next()];
                case 3:
                    if (!(_e = _k.sent(), !_e.done)) return [3 /*break*/, 5];
                    cell = _e.value;
                    cells_f.push(cell);
                    _k.label = 4;
                case 4: return [3 /*break*/, 2];
                case 5: return [3 /*break*/, 12];
                case 6:
                    e_1_1 = _k.sent();
                    e_1 = { error: e_1_1 };
                    return [3 /*break*/, 12];
                case 7:
                    _k.trys.push([7, , 10, 11]);
                    if (!(_e && !_e.done && (_a = _d["return"]))) return [3 /*break*/, 9];
                    return [4 /*yield*/, _a.call(_d)];
                case 8:
                    _k.sent();
                    _k.label = 9;
                case 9: return [3 /*break*/, 11];
                case 10:
                    if (e_1) throw e_1.error;
                    return [7 /*endfinally*/];
                case 11: return [7 /*endfinally*/];
                case 12:
                    cells_user = [];
                    _k.label = 13;
                case 13:
                    _k.trys.push([13, 18, 19, 24]);
                    _f = __asyncValues(collector1.collect());
                    _k.label = 14;
                case 14: return [4 /*yield*/, _f.next()];
                case 15:
                    if (!(_g = _k.sent(), !_g.done)) return [3 /*break*/, 17];
                    cell = _g.value;
                    cells_user.push(cell);
                    _k.label = 16;
                case 16: return [3 /*break*/, 14];
                case 17: return [3 /*break*/, 24];
                case 18:
                    e_2_1 = _k.sent();
                    e_2 = { error: e_2_1 };
                    return [3 /*break*/, 24];
                case 19:
                    _k.trys.push([19, , 22, 23]);
                    if (!(_g && !_g.done && (_b = _f["return"]))) return [3 /*break*/, 21];
                    return [4 /*yield*/, _b.call(_f)];
                case 20:
                    _k.sent();
                    _k.label = 21;
                case 21: return [3 /*break*/, 23];
                case 22:
                    if (e_2) throw e_2.error;
                    return [7 /*endfinally*/];
                case 23: return [7 /*endfinally*/];
                case 24:
                    cells_use = [];
                    _k.label = 25;
                case 25:
                    _k.trys.push([25, 30, 31, 36]);
                    _h = __asyncValues(collector2.collect());
                    _k.label = 26;
                case 26: return [4 /*yield*/, _h.next()];
                case 27:
                    if (!(_j = _k.sent(), !_j.done)) return [3 /*break*/, 29];
                    cell = _j.value;
                    cells_use.push(cell);
                    _k.label = 28;
                case 28: return [3 /*break*/, 26];
                case 29: return [3 /*break*/, 36];
                case 30:
                    e_3_1 = _k.sent();
                    e_3 = { error: e_3_1 };
                    return [3 /*break*/, 36];
                case 31:
                    _k.trys.push([31, , 34, 35]);
                    if (!(_j && !_j.done && (_c = _h["return"]))) return [3 /*break*/, 33];
                    return [4 /*yield*/, _c.call(_h)];
                case 32:
                    _k.sent();
                    _k.label = 33;
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
                    return [2 /*return*/];
            }
        });
    });
}
main();
