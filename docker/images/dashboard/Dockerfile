FROM node:12 as build

RUN apt-get install git
RUN git clone https://github.com/christianhugoch/oauth-policy-dashboard
WORKDIR /oauth-policy-dashboard
COPY ./docker/images/dashboard/.env .

RUN npm install
RUN npm run build


FROM nginx:stable-alpine

COPY --from=build /oauth-policy-dashboard/build /var/www/html/policy-dashboard/
COPY ./docker/images/dashboard/nginx.conf /etc/nginx/nginx.conf
COPY ./docker/cfg/local_cert/server/full_chain.crt /local_cert/server/full_chain.crt
COPY ./docker/cfg/local_cert/server/server.key /local_cert/server/server.key

EXPOSE 443
CMD ["nginx", "-g", "daemon off;"]
