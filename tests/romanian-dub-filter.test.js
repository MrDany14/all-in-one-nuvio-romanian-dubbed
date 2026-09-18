"use strict";

var assert = require("assert");
var filter = require("../providers/romanian-dub-filter.js");

assert.strictEqual(filter.isRomanianDubbed({ url: "a", audioLang: "ro" }), true);
assert.strictEqual(filter.isRomanianDubbed({ url: "b", name: "Movie RO-DUB" }), true);
assert.strictEqual(filter.isRomanianDubbed({
  url: "c",
  subtitles: [{ language: "ro", name: "Romanian" }]
}), false);
assert.strictEqual(filter.isRomanianDubbed({ url: "d", name: "Movie 1080p" }), false);

var streams = filter.filterRomanianDubbed([
  { url: "same", audioLanguage: "Romanian" },
  { url: "same", audioLanguage: "Romanian" },
  { url: "subtitle", subtitles: [{ language: "ro" }] }
]);

assert.deepStrictEqual(streams.map(function(stream) { return stream.url; }), ["same"]);
console.log("Romanian dub filter tests passed");
