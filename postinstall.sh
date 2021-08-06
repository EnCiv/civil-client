#!/bin/bash

echo '*************************************************************************'
echo POSTINSTALL
echo '*************************************************************************'

echo '*************************************************************************'
echo Symbolick link
echo '*************************************************************************'

#mkdir -p ./node_modules/syn
# on windows environment make sure /tmp exisits so that stream uploads of pictures will work
#mkdir -p /tmp
#mkdir -p ./assets/js
#pwd
#cp ./node_modules/socket.io-stream/socket.io-stream.js ./assets/js/
#
# create the WebComponents index files
#
# we need to do this before we can babel-transpile the whole project
# first we need to babel-transpile the web-components template so we can use it in the indexer
#babel app/components/web-components-template.jsx app/components/data-components-template.js --ignore **/__tests__ --out-dir dist/components --source-maps
# then we need to babel-transpile the indexer, and create the web-components index 
#babel app/tools/react-directory-indexer.js --ignore **/__tests__ --out-dir dist/tools --source-maps
#node dist/tools/react-directory-indexer.js app/web-components/
#node dist/tools/react-directory-indexer.js --data app/data-components/

echo '*************************************************************************'
echo TRANSPILE
echo '*************************************************************************'

npm run transpile  || {
  echo Could not transpile;
  exit 1
}
echo "transpile ok"

#echo '*************************************************************************'
#echo WEBPACK
#echo '*************************************************************************'
#
#npm run packbuild  || {
#  echo Could not webpack;
#  exit 1
#}
#echo "webpack ok"


