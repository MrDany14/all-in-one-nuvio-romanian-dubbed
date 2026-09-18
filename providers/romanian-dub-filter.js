"use strict";

var ROMANIAN_AUDIO_RE = /\b(?:ro|ron|rum|romanian|romana|română)\b/i;
var ROMANIAN_DUB_RE = /(?:\bro\s*[-._ ]?\s*dub(?:bed|bing)?\b|\bromanian\s+(?:dub|dubbed|audio)\b|\baudio\s+(?:ro|romanian|romana|română)\b|\bdublat(?:[ăaei]?\s+în|\s+in)?\s+(?:limba\s+)?rom[aâ]n[aă]\b|\bdublaj\s+(?:ro|romanian|romana|română)\b)/i;
var SUBTITLE_RE = /\b(?:sub(?:title|titrat|titled)?|vostfr|sub\s*ro|subtitrare)\b/i;

function collectText(value, output) {
  if (value === null || value === undefined) return;
  if (Array.isArray(value)) {
    value.forEach(function(item) { collectText(item, output); });
    return;
  }
  if (typeof value === "object") {
    collectText(value.language, output);
    collectText(value.lang, output);
    collectText(value.name, output);
    collectText(value.label, output);
    collectText(value.code, output);
    return;
  }
  output.push(String(value));
}

function fieldText(stream, names) {
  var values = [];
  names.forEach(function(name) { collectText(stream && stream[name], values); });
  return values.join(" ");
}

function isRomanianDubbed(stream) {
  if (!stream || typeof stream !== "object") return false;

  var audioText = fieldText(stream, [
    "audioLanguage", "audioLanguages", "audio", "audioLang", "audio_language",
    "audioTrack", "audioTracks", "tracks"
  ]);
  var languageText = fieldText(stream, ["language", "languages", "lang"]);
  var descriptiveText = fieldText(stream, [
    "name", "title", "description", "quality", "sourceName", "provider"
  ]);
  var subtitleText = fieldText(stream, [
    "subtitle", "subtitles", "subtitleLanguage", "subtitleLanguages",
    "uSubtitles", "forcedSubtitles"
  ]);

  var hasRomanianAudio = ROMANIAN_AUDIO_RE.test(audioText) ||
    (ROMANIAN_AUDIO_RE.test(languageText) && !SUBTITLE_RE.test(languageText));
  var hasRomanianDubLabel = ROMANIAN_DUB_RE.test(audioText + " " + descriptiveText);
  var subtitleOnly = !hasRomanianAudio && !hasRomanianDubLabel &&
    ROMANIAN_AUDIO_RE.test(subtitleText) && SUBTITLE_RE.test(subtitleText);

  return !subtitleOnly && (hasRomanianAudio || hasRomanianDubLabel);
}

function filterRomanianDubbed(streams) {
  var seen = {};
  return (Array.isArray(streams) ? streams : []).filter(function(stream) {
    if (!isRomanianDubbed(stream)) return false;
    var url = String(stream.url || "");
    if (!url || seen[url]) return false;
    seen[url] = true;
    return true;
  });
}

function wrap(provider) {
  var original = provider && provider.getStreams;
  if (typeof original !== "function") return { getStreams: function() { return Promise.resolve([]); } };

  return {
    getStreams: function(id, type, season, episode) {
      return Promise.resolve().then(function() {
        return original(id, type, season, episode);
      }).then(filterRomanianDubbed).catch(function() {
        return [];
      });
    }
  };
}

module.exports = {
  isRomanianDubbed: isRomanianDubbed,
  filterRomanianDubbed: filterRomanianDubbed,
  wrap: wrap
};
