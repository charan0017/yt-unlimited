FROM ubuntu:18.04

ENV NVM_DIR /root/.nvm

WORKDIR /home/app/

RUN apt-get update \
  && apt-get install -y curl \
  && apt-get install -y firefox

RUN curl -sL https://github.com/mozilla/geckodriver/releases/download/v0.28.0/geckodriver-v0.28.0-linux64.tar.gz \
  > geckodriver-v0.28.0-linux64.tar.gz \
  && tar -xvzf geckodriver* \
  && chmod +x geckodriver \
  && mv geckodriver /usr/local/bin/

RUN curl -sL https://deb.nodesource.com/setup_12.x | bash \ 
  && apt-get install -y nodejs

COPY package*.json ./
RUN npm install

COPY dist ./