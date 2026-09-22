npx nuxi cleanup
pnpm i
pnpm build
pm2 restart demo-vnseea-client --update-env
pm2 restart demo-vnseea-web --update-env 
pm2 restart vnseea-web-realtime --update-env
