FROM node:20.13.0-bullseye

RUN apt-get update && apt-get install -y \
    htop \
    openssh-server \
    openssh-client \
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgbm1 \
    libgcc1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    lsb-release \
    wget \
    cron \
    curl \
    xdg-utils \
    chromium \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package.json package-lock.json* ./

COPY . /app/
RUN rm /app/node_modules -rf
RUN ls -l /app
ENV APP_PATH "/app"
ENV SCRIPTS_PATH $APP_PATH/Dockerfiles/scripts

EXPOSE 3000

ENV PORT 3000


# Grant 'R-X' permissions
RUN chmod -R u+rx $SCRIPTS_PATH/*

# Env variables
ENV OPENAI_API_KEY="NA"

RUN npm ci
RUN npm run build

COPY ./Dockerfiles/monit-cron /etc/cron.d/monit-cron
RUN chmod 0744 /etc/cron.d/monit-cron
RUN cron
# Define ENTRYPOINT array with arguments for 'entrpoint.sh'.
ENTRYPOINT ["/bin/bash","Dockerfiles/scripts/entrypoint.sh"]