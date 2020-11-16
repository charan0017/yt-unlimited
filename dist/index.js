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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const selenium_webdriver_1 = require("selenium-webdriver");
const firefox_1 = __importDefault(require("selenium-webdriver/firefox"));
const consts_1 = require("./consts");
const waitForUserInput_1 = __importDefault(require("./helpers/waitForUserInput"));
const DEFAULT_VIDEO_CONFIG = {
    VIDEO_TITLE: 'Test Video 2',
    VIDEO_DESCRIPTION: 'Test Description 2',
    VIDEO_VISIBILITY: 'PRIVATE',
    VIDEO_MADE_FOR_KIDS: false,
};
const YTUnlimited = (video, config = DEFAULT_VIDEO_CONFIG) => __awaiter(void 0, void 0, void 0, function* () {
    var e_1, _a;
    try {
        if (!video) {
            throw new Error('Please provide video path.');
        }
        const VIDEO_PATH = `${process.cwd()}/${video}`;
        const cookiesFilePath = path_1.default.join(process.cwd(), 'yt_cookies.json');
        const cookiesFileExists = fs_1.default.existsSync(cookiesFilePath);
        const options = new firefox_1.default.Options();
        if (cookiesFileExists) {
            options.headless();
        }
        let driver = yield new selenium_webdriver_1.Builder()
            .forBrowser('firefox')
            .setFirefoxOptions(options)
            .build();
        if (cookiesFileExists) {
            const cookiesFile = yield fs_1.default.promises.readFile(cookiesFilePath);
            const cookies = JSON.parse(cookiesFile.toString());
            yield driver.get(consts_1.YT.URL);
            try {
                for (var cookies_1 = __asyncValues(cookies), cookies_1_1; cookies_1_1 = yield cookies_1.next(), !cookies_1_1.done;) {
                    let cookie = cookies_1_1.value;
                    yield driver.manage().addCookie(Object.assign(Object.assign({}, cookie), { sameSite: 'Strict' }));
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (cookies_1_1 && !cookies_1_1.done && (_a = cookies_1.return)) yield _a.call(cookies_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            yield driver.navigate().refresh();
            yield driver.navigate().to(consts_1.YT.UPLOAD_URL);
            const videoField = yield driver.findElement(selenium_webdriver_1.By.xpath(consts_1.YT.INPUT_FILE_VIDEO));
            yield videoField.sendKeys(VIDEO_PATH);
            yield driver.wait(selenium_webdriver_1.until.elementLocated(selenium_webdriver_1.By.id(consts_1.YT.TEXTBOX)));
            const [titleField, descriptionField] = yield driver.findElements(selenium_webdriver_1.By.id(consts_1.YT.TEXTBOX));
            yield titleField.click();
            yield titleField.sendKeys(selenium_webdriver_1.Key.COMMAND, 'a');
            yield titleField.sendKeys(config.VIDEO_TITLE);
            yield descriptionField.click();
            yield descriptionField.sendKeys(selenium_webdriver_1.Key.COMMAND, 'a');
            yield descriptionField.sendKeys(config.VIDEO_DESCRIPTION);
            yield (yield driver.findElement(selenium_webdriver_1.By.name(config.VIDEO_MADE_FOR_KIDS ? 'MADE_FOR_KIDS' : 'NOT_MADE_FOR_KIDS'))).click();
            yield (yield driver.findElement(selenium_webdriver_1.By.id(consts_1.YT.NEXT_BUTTON))).click();
            yield (yield driver.findElement(selenium_webdriver_1.By.id(consts_1.YT.NEXT_BUTTON))).click();
            yield (yield driver.findElement(selenium_webdriver_1.By.name(config.VIDEO_VISIBILITY))).click();
            yield driver.wait(selenium_webdriver_1.until.elementLocated(selenium_webdriver_1.By.id(consts_1.YT.UPLOAD_STATUS)));
            const videoURL = yield (yield driver.findElement(selenium_webdriver_1.By.css(consts_1.YT.VIDEO_URL))).getText();
            const videoId = videoURL.split(consts_1.YT.VIDEO_ID_PREFIX).pop();
            yield (yield driver.findElement(selenium_webdriver_1.By.id(consts_1.YT.DONE_BUTTON))).click();
            yield driver.wait(selenium_webdriver_1.until.elementLocated(selenium_webdriver_1.By.css(consts_1.YT.CLOSE_BUTTON)));
            yield driver.quit();
            console.log(`Uploaded: ${videoURL}`, videoId);
        }
        else {
            yield driver.get(consts_1.YT.STACKOVERFLOW);
            yield waitForUserInput_1.default('We need your cookies first. Go to browser login via google on stackoverflow. Navigate back to youtube and press enter here when done.');
            const cookies = yield driver.manage().getCookies();
            yield fs_1.default.promises.writeFile(cookiesFilePath, JSON.stringify(cookies, null, 2));
        }
    }
    catch (error) {
        console.log(error);
    }
});
YTUnlimited(process.argv.slice(2)[0] || 'video.mp4');
exports.default = YTUnlimited;
//# sourceMappingURL=index.js.map