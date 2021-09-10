cd ~/full-mern-stack/client
yarn build
rm -rf ../server/static
mv build/ ../server/static
cd -
