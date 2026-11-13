# Deployment

`npm run build` outputs a static site in `dist/`. It is a single-page app, so the host must serve
`index.html` for unknown paths.

| Host | Setup |
|---|---|
| **Vercel** | Import the repo. `vercel.json` already rewrites all paths to `index.html`. |
| **Netlify** | Build command `npm run build`, publish directory `dist`. `public/_redirects` handles SPA routing. |
| **Cloudflare Pages** | Build `npm run build`, output `dist`. `_redirects` is supported. |
| **Nginx** | `try_files $uri /index.html;` |
| **GitHub Pages / sub-path** | Set `base: '/your-path/'` in `vite.config.ts` and add a 404.html copy of index.html. |
