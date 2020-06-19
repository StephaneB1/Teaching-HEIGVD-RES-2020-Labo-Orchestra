FROM node:14.4.0

COPY src /opt/app/

WORKDIR /opt/app/

RUN npm install


ENTRYPOINT ["node", "/opt/app/app.js"]
