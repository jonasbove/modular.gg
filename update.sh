#!/bin/bash
echo "UPDATING\n"

cd /home/student.aau.dk/cd83rc/gitHook/modular.gg
git pull

npm install

pm2 restart server.js
