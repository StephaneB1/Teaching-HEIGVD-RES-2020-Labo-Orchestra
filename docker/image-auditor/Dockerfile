FROM node:12.16

# install nano
RUN apt-get update && apt-get install nano
# telnet for testing
RUN apt-get install telnet

WORKDIR /opt/app

COPY src/ /opt/app

RUN npm install
RUN npm install moment 

# Excute auditor.js
CMD ["node", "/opt/app/app.js"]
