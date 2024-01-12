cd ~/full-mern-stack-app/client
yarn build
rm -rf ../server/static
mv build/ ../server/static
cd -
