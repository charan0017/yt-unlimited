<p align="center">
  <img src="https://janusmarcin.pl/icon.svg"/>
</p>

# Youtube Unlimited

> JavaScript tool which allows you to upload videos bypassing youtube API limit of 6 uploads per 24h.

## Getting Started

This script uses headless browser to run tasks, so you need few things to make it work first.

### Requirements

1. Install [FireFox](https://www.mozilla.org/en-US/firefox/new/) on your machine.
2. Download [Geckodriver](https://github.com/mozilla/geckodriver/releases) and add it your system PATH

### Installation

You can use it as a regular package:

```jsx
npm install yt-unlimited
```

Or you can clone this repo to run it from CLI

## First Run

If you are running this script for the first time it will ask you to login on YouTube. 

FireFox window should open:

1. Please navigate to [youtube.com](http://youtube.com) if not redirected already.
2. Login to your account.
3. Do not close the browser.
4. When successfully logged in go back tour terminal and press Enter.
5. File youtube_cookies.json should be created. Read important note below.

If you have problems with youtube login like for ex. "This browser is not secure" try navigate to other site with google auth ([https://stackoverflow.com/](https://stackoverflow.com/) will do) login via google and navigate back to youtube. You should be logged in. You can now press enter in your terminal.

## IMPORTANT

Do not share **youtube_cookies.json** file with anybody or do not add it to any git repo. This is your youtube account credentials for authentication. 

## Usage

YTUnlimited function returns promise with video id.

### NPM Package

```jsx
import YTUnlimited from 'yt-unlimited';

YTUnlimited('video.mp4', {
  VIDEO_TITLE: 'Video Title',
  VIDEO_DESCRIPTION: 'Video Description',
  VIDEO_VISIBILITY: 'PRIVATE',
  VIDEO_MADE_FOR_KIDS: false,
  VIDEO_CATEGORY: 'CREATOR_VIDEO_CATEGORY_PETS',
  VIDEO_TAGS: ['cats', 'pets'],
});
```

### CLI

```jsx
node dist/index.js video.mp4
```

For video details edit /dist/video_metadata.json file.

### Options

```jsx
type ConfigType = {
  VIDEO_TITLE: string;
  VIDEO_DESCRIPTION: string;
  VIDEO_VISIBILITY: 'PUBLIC' | 'UNLISTED' | 'PRIVATE';
  VIDEO_MADE_FOR_KIDS: boolean;
  VIDEO_CATEGORY: VideoCategoriesType;
  VIDEO_TAGS: string[];
}

enum VideoCategoriesType {
  Film = 'CREATOR_VIDEO_CATEGORY_FILM',
  Autos = 'CREATOR_VIDEO_CATEGORY_AUTOS',
  Music = 'CREATOR_VIDEO_CATEGORY_MUSIC',
  Pets = 'CREATOR_VIDEO_CATEGORY_PETS',
  Sports = 'CREATOR_VIDEO_CATEGORY_SPORTS',
  Travel = 'CREATOR_VIDEO_CATEGORY_TRAVEL',
  Gadgets = 'CREATOR_VIDEO_CATEGORY_GADGETS',
  People = 'CREATOR_VIDEO_CATEGORY_PEOPLE',
  Comedy = 'CREATOR_VIDEO_CATEGORY_COMEDY',
  Entertainment = 'CREATOR_VIDEO_CATEGORY_ENTERTAINMENT',
  News = 'CREATOR_VIDEO_CATEGORY_NEWS',
  HowTo = 'CREATOR_VIDEO_CATEGORY_HOWTO',
  Education = 'CREATOR_VIDEO_CATEGORY_EDUCATION',
  Science = 'CREATOR_VIDEO_CATEGORY_SCIENCE',
  Goverment = 'CREATOR_VIDEO_CATEGORY_GOVERNMENT',
}
```

## StepByStep Installation on Ubuntu 18.04

### Install FireFox

```bash
sudo apt install firefox
```

### Install Geckodriver

1. Go to [Geckodriver repo](https://github.com/mozilla/geckodriver/releases) check latest release number in my case it is **0.28.0** and download it with command for example:
2. wget https://github.com/mozilla/geckodriver/releases/download/v0.28.0/geckodriver-v0.28.0-linux64.tar.gz
3. Extract: tar -xvzf geckodriver*
4. Make it executable: chmod +x geckodriver
5. Move it to your PATH folder: sudo mv geckodriver /usr/local/bin/

### Clone this repo and run npm install

```bash
git clone https://github.com/schriker/yt-unlimited.git
```

```bash
npm install
```

### Run

Before uploading video you have to be authenticated youtube user. Please check [First Run](https://github.com/schriker/yt-unlimited#first-run) section for more details. If you are running this script on remote server via SSH it will throw an error trying to open browser. Solution is to run this script first on your local machine (where browser can be opened and you can log in) to obtain youtube_cookies.json file and then copy that file to your remote server.

```bash
node dist/index.js video.mp4
```

## Docker
You can mount your cookies and video file in docker-compose.yaml:

```yaml
    volumes: 
      - ./video.mp4:/home/app/video.mp4
      - ./youtube_cookies.json:/home/app/youtube_cookies.json
```

And run to start conatiner and upload video:

```bash
docker-compose up
```