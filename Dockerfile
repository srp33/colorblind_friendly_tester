FROM rocker/tidyverse:4.2.2

RUN apt update \
 && apt install curl -y

RUN curl -fsSL https://deb.nodesource.com/setup_19.x | bash - &&\
    apt-get install -y nodejs

WORKDIR /app

COPY package.json package.json
COPY package-lock.json package-lock.json

RUN npm install

COPY . .

CMD ["node", "app.js"]
