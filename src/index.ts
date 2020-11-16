import fs from 'fs';
import path from 'path';
import { Builder, By, Key, until } from 'selenium-webdriver';
import firefox from 'selenium-webdriver/firefox';
import { YT } from './consts';
// import Xvfb from 'xvfb';
import waitForUserInput from './helpers/waitForUserInput';
import { ConfigType } from './types/types';

const DEFAULT_VIDEO_CONFIG: ConfigType = {
  VIDEO_TITLE: 'Test Video 2',
  VIDEO_DESCRIPTION: 'Test Description 2',
  VIDEO_VISIBILITY: 'PRIVATE',
  VIDEO_MADE_FOR_KIDS: false,
};

const YTUnlimited = async (video: string, config = DEFAULT_VIDEO_CONFIG) => {
  try {
    if (!video) {
      throw new Error('Please provide video path.');
    }
    // var xvfb = new Xvfb();
    // xvfb.startSync();
    const VIDEO_PATH = `${process.cwd()}/${video}`;
    const cookiesFilePath = path.join(process.cwd(), 'yt_cookies.json');
    const cookiesFileExists = fs.existsSync(cookiesFilePath);

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
      await driver.get(YT.URL);
      for await (let cookie of cookies) {
        await driver.manage().addCookie({ ...cookie, sameSite: 'Strict' });
      }
      await driver.navigate().refresh();
      await driver.navigate().to(YT.UPLOAD_URL);
      const videoField = await driver.findElement(
        By.xpath(YT.INPUT_FILE_VIDEO)
      );
      await videoField.sendKeys(VIDEO_PATH);
      await driver.wait(until.elementLocated(By.id(YT.TEXTBOX)));
      const [titleField, descriptionField] = await driver.findElements(
        By.id(YT.TEXTBOX)
      );
      await titleField.click();
      await titleField.sendKeys(Key.COMMAND, 'a');
      await titleField.sendKeys(config.VIDEO_TITLE);
      await descriptionField.click();
      await descriptionField.sendKeys(Key.COMMAND, 'a');
      await descriptionField.sendKeys(config.VIDEO_DESCRIPTION);
      await (
        await driver.findElement(
          By.name(
            config.VIDEO_MADE_FOR_KIDS ? 'MADE_FOR_KIDS' : 'NOT_MADE_FOR_KIDS'
          )
        )
      ).click();
      await (await driver.findElement(By.id(YT.NEXT_BUTTON))).click();
      await (await driver.findElement(By.id(YT.NEXT_BUTTON))).click();
      await (
        await driver.findElement(By.name(config.VIDEO_VISIBILITY))
      ).click();
      await driver.wait(until.elementLocated(By.id(YT.UPLOAD_STATUS)));
      const videoURL = await (
        await driver.findElement(By.css(YT.VIDEO_URL))
      ).getText();
      const videoId = videoURL.split(YT.VIDEO_ID_PREFIX).pop();
      await (await driver.findElement(By.id(YT.DONE_BUTTON))).click();
      await driver.wait(until.elementLocated(By.css(YT.CLOSE_BUTTON)));
      await driver.quit();
      // xvfb.stopSync();
      console.log(`Uploaded: ${videoURL}`, videoId);
    } else {
      await driver.get(YT.STACKOVERFLOW);
      await waitForUserInput(
        'We need your cookies first. Go to browser login via google on stackoverflow. Navigate back to youtube and press enter here when done.'
      );
      const cookies = await driver.manage().getCookies();
      await fs.promises.writeFile(
        cookiesFilePath,
        JSON.stringify(cookies, null, 2)
      );
    }
  } catch (error) {
    console.log(error);
  }
};

YTUnlimited(process.argv.slice(2)[0] || 'video.mp4');

export default YTUnlimited;
