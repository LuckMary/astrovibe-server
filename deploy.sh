#!/bin/bash

gtar czf package.tar.gz src

scp -i "./key" package.tar.gz root@185.119.59.33:~/astrovibe_api
rm package.tar.gz

ssh -i "./key" root@185.119.59.33 << 'ENDSSH'
cd astrovibe_api
rm -rf src
tar xf package.tar.gz -C ./
rm package.tar.gz
pm2 stop astrovibe_api
pm2 start astrovibe_api
ENDSSH