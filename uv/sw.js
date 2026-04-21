// Service worker: registers Ultraviolet's URL interceptor so that any
// fetch matching __uv$config.prefix is rewritten and proxied through /bare/.
importScripts('/uv/uv.bundle.js');
importScripts('/uv/uv.config.js');
importScripts('/uv/uv.sw.js');

const sw = new UVServiceWorker();

self.addEventListener('fetch', (event) => {
    event.respondWith(
        (async () => {
            if (sw.route(event)) return await sw.fetch(event);
            return await fetch(event.request);
        })()
    );
});
