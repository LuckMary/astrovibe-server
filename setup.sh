#!/bin/bash

gtar czvf package.tar.gz package.json package-lock.json .env src

scp -i "./key" package.tar.gz root@185.119.59.33:~/.
rm package.tar.gz

ssh -i "./key" root@185.119.59.33 << 'ENDSSH'
pm2 stop astrovibe_api
pm2 delete astrovibe_api
rm -rf astrovibe_api
mkdir astrovibe_api
tar xf package.tar.gz -C ./astrovibe_api
rm package.tar.gz
cd astrovibe_api
npm install --no-audit --only=prod
pm2 start src/app.js --name "astrovibe_api"
ENDSSH

# tar czf src.tar.gz src

# scp src.tar.gz root@79.132.138.106:~/astrovibe_api
# rm src.tar.gz

# ssh root@79.132.138.106 << 'ENDSSH'
# cd astrovibe_api
# rm -rf src
# tar xf src.tar.gz -C ./
# rm src.tar.gz
# pm2 start src/app.js --name "astrovibe_api"
# ENDSSH