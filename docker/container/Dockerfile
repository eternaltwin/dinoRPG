FROM node:18

# not mandatory if you EXPORT a fixed port. See below.
ARG YOUR_APP_WEB_HTTP_PORT
ARG UID=1000
ARG GID=1000

RUN apt -y update \
	&& apt install -y git

RUN yarn global add @vue/cli -g

WORKDIR /www

RUN apt autoremove -y \
    && apt autoclean -y \
    && apt clean -y \
    && rm -rf /var/lib/apt/lists/*

# Or just use EXPORT 8080
EXPOSE ${YOUR_APP_WEB_HTTP_PORT}
# If yout want use vue-cli UI you need to also EXPORT 8000

RUN groupmod -g $GID node && usermod -u $UID -g $GID node

USER node
RUN curl https://sh.rustup.rs -sSf | sh -s -- -y

# switch to npm if you chose it as package manager
CMD ["yarn", "serve"]
