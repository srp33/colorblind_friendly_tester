FROM rocker/tidyverse:4.2.1

RUN install2.r --error magick 

RUN installGithub.r clauswilke/colorblindr

RUN apt-get update \
 && apt-get install -y curl "libmagick++-dev"

RUN curl -fsSL https://deb.nodesource.com/setup_19.x | bash - && \
    apt-get install -y nodejs

WORKDIR /app

COPY package.json package.json
COPY package-lock.json package-lock.json

RUN npm install

COPY . .
RUN chmod -R 777 /app/

CMD ["node", "app.js"]
#CMD ["/bin/bash"]
