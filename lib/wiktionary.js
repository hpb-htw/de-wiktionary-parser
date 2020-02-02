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
Object.defineProperty(exports, "__esModule", { value: true });
//import XMLStream from "xml-stream";
var XMLStream = require("xml-stream");
var fs = require("fs");
/**
 * parse a XML dump file from http://dumps.wikimedia.org/backup-index.html
 * Result of this function is a Promise. See Unit test for Usage.
 *
 */
function parseWikiXml(dumpFile, collectNewEntry) {
    return __awaiter(this, void 0, void 0, function () {
        var xmlFile, count, promisses;
        var _this = this;
        return __generator(this, function (_a) {
            console.log("call parseWiki");
            xmlFile = fs.createReadStream(dumpFile);
            count = 0;
            promisses = new Promise(function (resolve, reject) {
                var xml = new XMLStream(xmlFile);
                xml.preserve('text', true);
                xml.on("endElement: page", function (page) { return __awaiter(_this, void 0, void 0, function () {
                    var ns, id, title, originText, text, ex_1;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                ns = page["ns"];
                                if (!(ns === '0')) return [3 /*break*/, 4];
                                ++count;
                                id = Number.parseInt(page["id"]);
                                title = page["title"];
                                originText = page["revision"]["text"]["$children"];
                                _a.label = 1;
                            case 1:
                                _a.trys.push([1, 3, , 4]);
                                text = joinText(originText);
                                return [4 /*yield*/, collectNewEntry({
                                        id: id,
                                        title: title,
                                        text: text
                                    })];
                            case 2:
                                _a.sent();
                                return [3 /*break*/, 4];
                            case 3:
                                ex_1 = _a.sent();
                                reject(ex_1);
                                return [3 /*break*/, 4];
                            case 4: return [2 /*return*/];
                        }
                    });
                }); });
                xml.on("end", function () {
                    resolve(count);
                });
            });
            return [2 /*return*/, promisses];
        });
    });
}
exports.parseWikiXml = parseWikiXml;
function joinText(text) {
    return text.map(function (line) { return escape(line); }).join("");
}
// XML entities.
var entities = {
    '"': '&quot;',
    '&': '&amp;',
    '\'': '&apos;',
    '<': '&lt;',
    '>': '&gt;'
};
// Escapes text for XML.
function escape(value) {
    return value.replace(/"|&|'|<|>/g, function (entity) {
        return entities[entity];
    });
}
//# sourceMappingURL=wiktionary.js.map