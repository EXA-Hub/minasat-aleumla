tsc
cd dist
esbuild server.js --bundle --platform=node --target=node16 --external:dotenv --external:express --external:ws --outdir=out
cd out
mkdir obfuscated
javascript-obfuscator server.js --output obfuscated/combined.js
cd obfuscated
npx bytenode --compile combined.js
mv combined.jsc 1.js
echo "Target Versions is node:v16.14.2 npm:7.20.6"
echo "Using node:$(node -v) npm:$(npm -v)"
echo "if not the correct version, please run 'nvm use 16.14.2' then 'npm i -g npm@7.20.6' then recompile"
echo "check for the node version using 'nvm ls' and use 'nvm alias default 16.14.2' to set the default version"
echo "done"
