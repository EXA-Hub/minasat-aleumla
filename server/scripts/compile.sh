tsc
cd dist
mkdir obfuscated
javascript-obfuscator server.js --output obfuscated/server.js
javascript-obfuscator wss.js --output obfuscated/wss.js
cd obfuscated
npx bytenode --compile server.js
npx bytenode --compile wss.js
mv server.jsc 1.js
mv wss.jsc 2.js
echo "Target Versions is node:v16.14.2 npm:7.20.6"
echo "Using node:$(node -v) npm:$(npm -v)"
echo "if not the correct version, please run 'nvm use 16.14.2' then 'npm i -g npm@7.20.6' then recompile"
echo "check for the node version using 'nvm ls' and use 'nvm alias default 16.14.2' to set the default version"
echo "done"
