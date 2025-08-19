let CACHE_NAME = "op rafale-cache-v1";
let urlsToCache = [
  "./",
  "./index.html",
  "./op rafale.css",
  "./op rafale.js",
  "./antiaircraft gun.png",
  "./artilleryfire.mp3",
  "./blastplane.png",
  "./bullets colliding.mp3",
  "./cannon image.png",
  "./cannongun_fire.mp3",
  "./explosion-01.mp3",
  "./gnfire.mp3",
  "./hitting machinegun.mp3",
  "./hitting sound1.mp3",
  "./jet engine.mp3",
  "./jet missile sound.mp3",
  "./planepic.png",
  "./planepic2.png",
  "./player blast pic.png",
  "./sky strike  design 2.png",
  "./sky strike for mobile.png",
  "./skystrike logo.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener("fetch", (event) => [
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  ),
]);
