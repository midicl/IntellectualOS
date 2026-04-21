// Ultraviolet runtime config — loaded by both the page and the service worker.
// `prefix: '/service/'` matches the existing iframe code which builds URLs as
// `/service/<base64-url>`, and `encodeUrl/decodeUrl` use base64 to match.
self.__uv$config = {
    prefix: '/service/',
    bare: '/bare/',
    encodeUrl: (str) => str ? encodeURIComponent(btoa(unescape(encodeURIComponent(str)))) : str,
    decodeUrl: (str) => str ? decodeURIComponent(escape(atob(decodeURIComponent(str)))) : str,
    handler: '/uv/uv.handler.js',
    client: '/uv/uv.client.js',
    bundle: '/uv/uv.bundle.js',
    config: '/uv/uv.config.js',
    sw: '/uv/uv.sw.js',
};
