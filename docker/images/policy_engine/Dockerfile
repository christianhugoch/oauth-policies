FROM node:12

WORKDIR /policy_engine
COPY . .

RUN cp /policy_engine/docker/images/policy_engine/.env .
RUN cp /policy_engine/docker/images/policy_engine/app_settings.yml .
RUN npm install --production
RUN npm run build_prod

STOPSIGNAL SIGTERM
RUN chmod +x /policy_engine/docker/images/policy_engine/entry_point.bash
CMD /policy_engine/docker/images/policy_engine/entry_point.bash

