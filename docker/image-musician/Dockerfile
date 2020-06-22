FROM node:14.4.0

# install nano
RUN apt-get update && apt-get install nano
# telnet for testing
RUN apt-get install telnet

COPY src /opt/app/

RUN npm install
RUN npm install uuid 

ENTRYPOINT ["node", "/opt/app/app.js"]
