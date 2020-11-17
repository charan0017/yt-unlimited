"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const upload_1 = __importDefault(require("./upload"));
upload_1.default(process.argv.slice(2)[0] || 'video.mp4');
//# sourceMappingURL=index.js.map