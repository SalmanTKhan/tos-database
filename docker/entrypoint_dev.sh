#!/bin/bash
set -eu
cd /var/www/base/

BASEDIR=/var/www/base/
cd ${BASEDIR}


/bin/bash ${BASEDIR}/build.sh
/bin/bash ${BASEDIR}/bootstrap.sh

cp -rn ./tos-build/dist/* ./tos-web/dist/
cp -rn ./skeleton-distbuild/* ./tos-web/dist/
cp -rn ./skeleton-distweb/* ./tos-web/dist/




echo "nginx READY!"
/usr/sbin/nginx 

cd ${BASEDIR}/tos-web-rest/
npm install 
node src/index.js
# WAITING