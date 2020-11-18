import fs from 'fs';
import path from 'path';
import { Builder, By, Key, until, WebElement } from 'selenium-webdriver';
import firefox from 'selenium-webdriver/firefox';
import { YT } from './consts';
import waitForUserInput from './helpers/waitForUserInput';
import { ConfigType, VideoCategoriesType } from './types/types';
import videoMetada from './video_metadata.json';

const DEFAULT_VIDEO_CONFIG: ConfigType = {
  VIDEO_TITLE: 'Video Title',
  VIDEO_DESCRIPTION: 'Video Description',
  VIDEO_VISIBILITY: 'PRIVATE',
  VIDEO_MADE_FOR_KIDS: false,
  VIDEO_CATEGORY: VideoCategoriesType.Film,
  VIDEO_TAGS: [],
};

const fieldInput = (field: WebElement, text: string) => {
  return new Promise<void>(async (resolve, reject) => {
    try {
      await field.click();
      await field.sendKeys(Key.COMMAND, 'a');
      await field.sendKeys(text);
      resolve();
    } catch (error) {
      reject(error);
    }
  });
};

const YTUnlimited = (video: string, config?: ConfigType) => {
  return new Promise<string | void>(async (resolve, reject) => {
    try {
      if (!video) {
        throw new Error('Please provide video path.');
      }
      const isCLI = !!process.argv.slice(2)[0];
      const VIDEO_PATH = `${process.cwd()}/${video}`;
      const cookiesFilePath = path.join(process.cwd(), YT.COOKIES);
      const cookiesFileExists = fs.existsSync(cookiesFilePath);

      if (isCLI) {
        config = videoMetada as ConfigType;
      } else {
        config = {
          ...DEFAULT_VIDEO_CONFIG,
          ...config,
        };
      }

      const options = new firefox.Options();
      if (cookiesFileExists) {
        options.headless(); 
      }

      let driver = await new Builder()
        .forBrowser('firefox')
        .setFirefoxOptions(options)
        .build();

      if (cookiesFileExists) {
        const cookiesFile = await fs.promises.readFile(cookiesFilePath);
        const cookies = JSON.parse(cookiesFile.toString());
        isCLI ? console.log('Working.') : null;
        await driver.get(YT.URL);
        for await (let cookie of cookies) {
          await driver.manage().addCookie({ ...cookie, sameSite: 'Strict' });
        }
        await driver.navigate().refresh();
        await driver.navigate().to(YT.UPLOAD_URL);
        const isLogedInUrl = await driver.getCurrentUrl();
        if (isLogedInUrl.includes(YT.LOGIN_URL)) {
          await driver.quit();
          throw new Error(
            `User not authenticated. Please check your cookies file or try to get new one.`
          );
        }
        isCLI ? console.log('Added cookies.') : null;

        const videoField = await driver.findElement(
          By.css(YT.INPUT_FILE_VIDEO)
        );

        await videoField.sendKeys(VIDEO_PATH);
        await driver.wait(until.elementLocated(By.id(YT.TEXTBOX)));
        isCLI ? console.log(`Loaded file: ${video}`) : null;
        const [titleField, descriptionField] = await driver.findElements(
          By.id(YT.TEXTBOX)
        );
        await fieldInput(
          titleField,
          config.VIDEO_TITLE || DEFAULT_VIDEO_CONFIG.VIDEO_TITLE!
        );
        await fieldInput(
          descriptionField,
          config.VIDEO_DESCRIPTION || DEFAULT_VIDEO_CONFIG.VIDEO_DESCRIPTION!
        );
        await (
          await driver.findElement(
            By.name(
              config.VIDEO_MADE_FOR_KIDS ? 'MADE_FOR_KIDS' : 'NOT_MADE_FOR_KIDS'
            )
          )
        ).click();
        await (await driver.findElement(By.css(YT.ADVANCED_BUTTON))).click();
        if (config.VIDEO_TAGS && config.VIDEO_TAGS.length) {
          const tagsField = await driver.findElement(By.css(YT.TAGS_CONTAINER));
          await fieldInput(tagsField, config.VIDEO_TAGS.join(','));
        }
        await (await driver.findElement(By.css(YT.CATEGORY_DROPDOWN))).click();
        await (
          await driver.findElement(
            By.css(`paper-item[test-id='${config.VIDEO_CATEGORY}']`)
          )
        ).click();
        await (await driver.findElement(By.id(YT.NEXT_BUTTON))).click();
        await (await driver.findElement(By.id(YT.NEXT_BUTTON))).click();
        await (
          await driver.findElement(By.name(config.VIDEO_VISIBILITY!))
        ).click();
        isCLI ? console.log('Video details filled.') : null;
        isCLI ? console.log('Uploading...') : null;
        await driver.wait(until.elementLocated(By.id(YT.UPLOAD_STATUS)));
        const videoURL = await (
          await driver.findElement(By.css(YT.VIDEO_URL))
        ).getText();
        const videoId = videoURL.split(YT.VIDEO_ID_PREFIX).pop();
        await (await driver.findElement(By.id(YT.DONE_BUTTON))).click();
        await driver.wait(until.elementLocated(By.css(YT.CLOSE_BUTTON)));
        await driver.quit();
        isCLI ? console.log(`Uploaded - ${videoURL}`) : null;
        resolve(videoId);
      } else {
        await driver.get(YT.URL);
        await waitForUserInput(
          'We need your cookies first. Go to browser login and press enter here when done.'
        );
        const cookies = await driver.manage().getCookies();
        await fs.promises.writeFile(
          cookiesFilePath,
          JSON.stringify(cookies, null, 2)
        );
        resolve();
        await driver.quit();
      }
    } catch (error) {
      console.log(error);
      reject(error);
    }
  });
};

export default YTUnlimited;
