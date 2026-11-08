/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

// Single place to point the browser at a different FuruiTube deployment.
const FURUITUBE_ORIGIN = "https://yt.nasfurui.es";

// Appending ?furuitube=off to a YouTube URL disables the redirect for that
// navigation (needed to sign in to a YouTube/Premium account).
const BYPASS_PARAM = "furuitube";
const BYPASS_VALUE = "off";

const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
]);

// Sign-in flow and machine endpoints that must reach YouTube untouched.
const PASSTHROUGH_PREFIXES = [
  "/signin",
  "/accounts",
  "/oembed",
  "/feeds/",
  "/api/",
  "/youtubei/",
  "/iframe_api",
  "/s/",
];

const VIDEO_ID = /^[\w-]{11}$/;

function furuiTubeWatch(id) {
  return VIDEO_ID.test(id)
    ? `${FURUITUBE_ORIGIN}/watch?v=${id}`
    : `${FURUITUBE_ORIGIN}/`;
}

/**
 * Maps a YouTube URL to the FuruiTube URL that should replace it.
 *
 * @param {string} rawUrl The URL being navigated to.
 * @returns {string|null} The FuruiTube URL, or null to leave the URL alone.
 */
function furuiTubeTarget(rawUrl) {
  let url;
  try {
    url = new URL(rawUrl);
  } catch (e) {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    return null;
  }

  if (url.hostname === "youtu.be") {
    return furuiTubeWatch(url.pathname.split("/")[1] ?? "");
  }
  if (!YOUTUBE_HOSTS.has(url.hostname)) {
    return null;
  }
  if (url.searchParams.get(BYPASS_PARAM) === BYPASS_VALUE) {
    return null;
  }

  const path = url.pathname;
  if (PASSTHROUGH_PREFIXES.some(prefix => path.startsWith(prefix))) {
    return null;
  }
  if (path === "/watch") {
    return furuiTubeWatch(url.searchParams.get("v") ?? "");
  }
  const videoPath = path.match(/^\/(?:embed|live)\/([^/?#]+)/);
  if (videoPath) {
    return furuiTubeWatch(videoPath[1]);
  }
  if (path === "/results") {
    const query = url.searchParams.get("search_query");
    return query
      ? `${FURUITUBE_ORIGIN}/results?q=${encodeURIComponent(query)}`
      : `${FURUITUBE_ORIGIN}/`;
  }
  // Home, channels, playlists, Shorts, feeds...: no distractions.
  return `${FURUITUBE_ORIGIN}/`;
}
