npx nuxi cleanup
pnpm i
pnpm build
pm2 restart vnseea-client --update-env
pm2 restart vnseea-web --update-env 
pm2 restart vnseea-mobile-socket  --update-env