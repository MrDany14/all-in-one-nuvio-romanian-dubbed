"use strict";

var PROVIDERS = [
  "1shows.js", "4khdhub.js", "allanime.js", "allmovieland.js", "allwish.js",
  "anidb.js", "anikototv.js", "anime-sama.js", "animekai.js", "animepahe.js",
  "animesalt.js", "animetsu.js", "animeworld.js", "animezey.js", "castle.js",
  "cineby.js", "cinefreak.js", "cinemacity.js", "ctgmovies.js", "dahmermovies-4k.js",
  "dahmermovies.js", "desiflix.js", "dooflix.js", "einthusan.js", "fibwatch.js",
  "goated.js", "gramcinema.js", "hdghartv.js", "hdhub4u.js", "hianime.js",
  "hindmoviez.js", "kisskh.js", "kurage.js", "moonflix.js", "movieblast.js",
  "moviebox.js", "movies4u.js", "moviesdrive.js", "movieshunt.js", "movix.js",
  "nakios.js", "netmirror.js", "onlykdrama.js", "peachify.js", "persianstremio.js",
  "playimdb.js", "purstream.js", "showbox.js", "topcartoons.js", "torrentio.js",
  "uhdmovies.js", "vegamovies.js", "videasy.js", "vidfast.js", "vidlink.js",
  "vidlove.js", "vidrock.js", "vidsrc.js", "vixsrc.js", "xpass.js", "zinkmovies.js"
];

var filter = require("./romanian-dub-filter.js");

function loadProvider(file) {
  try {
    return require("./" + file);
  } catch (error) {
    return null;
  }
}

function getStreams(id, type, season, episode) {
  var requests = PROVIDERS.map(function(file) {
    var provider = loadProvider(file);
    if (!provider || typeof provider.getStreams !== "function") return Promise.resolve([]);
    return Promise.resolve().then(function() {
      return provider.getStreams(id, type, season, episode);
    }).catch(function() {
      return [];
    });
  });

  return Promise.all(requests).then(function(results) {
    return filter.filterRomanianDubbed([].concat.apply([], results));
  }).catch(function() {
    return [];
  });
}

module.exports = { getStreams: getStreams };
