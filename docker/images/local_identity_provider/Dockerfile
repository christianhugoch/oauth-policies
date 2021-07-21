FROM node:12

WORKDIR /local_identity_provider
COPY ./docker/images/local_identity_provider/app/ .
COPY ./docker/cfg/local_cert/server/server.crt .
COPY ./docker/cfg/local_cert/server/server.key .

COPY ./docker/cfg/local_cert/server/full_chain.crt .

RUN npm install

STOPSIGNAL SIGTERM
EXPOSE 3333
EXPOSE 443

CMD node ./app.js
