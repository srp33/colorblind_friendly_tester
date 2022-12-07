FROM rocker/tidyverse:4.2.2

RUN apt update \
 && apt install -y \
 curl \
 libmagick++-dev

RUN install2.r --error magick 
#RUN ulimit -u 10000 ; install2.r --error magick 

RUN installGithub.r clauswilke/colorblindr

RUN curl -fsSL https://deb.nodesource.com/setup_19.x | bash - && \
    apt-get install -y nodejs

WORKDIR /app

COPY package.json package.json
COPY package-lock.json package-lock.json

RUN npm install

COPY . .
RUN chmod -R 777 /app/

CMD ["node", "app.js"]
