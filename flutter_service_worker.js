'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "assets/AssetManifest.json": "297be9edacec356dff36502781091873",
"assets/assets/Alton.mp3": "257da69cb6dcac5c1521420122afca52",
"assets/assets/Alton2.mp3": "a32885202c4760b616718fdc63b85da7",
"assets/assets/Foster.mp3": "f6999f806dab18a1c8bf3a5ac6ca1077",
"assets/assets/godfrey.mp3": "e9846121bcea458e02ae4120ff56b7ec",
"assets/assets/Hamel.mp3": "1c9ef9cf9af13828e67bdffb913ee304",
"assets/assets/img1.jpg": "9b1bacc75633ea90db52e9f0a751fca4",
"assets/assets/MCHS-Identity-WHiteText-340-300x134.png": "5098eb8e69fac6d905f026319bda0fbc",
"assets/assets/mchslogo.png": "5098eb8e69fac6d905f026319bda0fbc",
"assets/assets/Moro.mp3": "5d0af30bcae1f3a9998c0700c1faa51a",
"assets/assets/New%2520Douglas-Leef-121687-Tower%25203-Panel_mixdown.mp3": "8b08292fed17218a3e191b944c9e1ba6",
"assets/assets/new%2520Fort%2520Russell%252021687%2520Tower%25202-Panel%25201-2_mixdown_01.mp3": "a598c7dc1e490ea93d2f8d02fdb04a95",
"assets/assets/Omphghent-Olive%2520121687-Tower%25203-Panel%25202_mixdown_01.mp3": "4765036a0c046fce3b4f3bb81397245e",
"assets/assets/textFiles/0.txt": "7da2349ba1bfd6dc148b3e7220e79aeb",
"assets/assets/textFiles/1.txt": "46bd3d5fa8950aafd919e324b60a3f92",
"assets/assets/textFiles/2.txt": "ab5db6c02a04c0a921cce5ec36afd28e",
"assets/assets/textFiles/3.txt": "3df852a3127787bb1c5ed3bb7d3347d2",
"assets/assets/textFiles/4.txt": "df3a2db21b156cc52f8749342c5d63ff",
"assets/assets/textFiles/5.txt": "6cdeae2c7eaa758f580b08ab48f64e59",
"assets/assets/textFiles/6.txt": "bf92645821ecb9d34dff6436a0c9f572",
"assets/assets/TheGentileGiant.mp3": "b62dcb92d9313d2818881492f94e3bbe",
"assets/assets/Venice-121687-Tower%25207%2520Panel%25201.swav_mixdown_01.mp3": "9b73d5a1cfdcdb887bc00acd8499e552",
"assets/FontManifest.json": "dc3d03800ccca4601324923c0b1d6d57",
"assets/fonts/MaterialIcons-Regular.otf": "1288c9e28052e028aba623321f7826ac",
"assets/NOTICES": "db1a899bd029035993a15146345d24b0",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "6d342eb68f170c97609e9da345464e5e",
"favicon.png": "5dcef449791fa27946b3d35ad8803796",
"icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
"icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1",
"index.html": "dab1cd171ee3162414c4035d3147e4f3",
"/": "dab1cd171ee3162414c4035d3147e4f3",
"main.dart.js": "f386301ca5764bd12ca7499f14f3c71f",
"manifest.json": "4d6b2a0bbdd2e5256b41721b24bd8a14",
"version.json": "ca12139e319d49223850171f342167bd"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "/",
"main.dart.js",
"index.html",
"assets/NOTICES",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value + '?revision=' + RESOURCES[value], {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache.
        return response || fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
