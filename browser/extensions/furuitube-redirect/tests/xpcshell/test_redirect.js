/* Any copyright is dedicated to the Public Domain.
   http://creativecommons.org/publicdomain/zero/1.0/ */

"use strict";

// redirect.js is a plain background script (no module): expose its directory
// through a resource: URL, which loadSubScript accepts, and load it as-is.
const scope = {};
Services.io
  .getProtocolHandler("resource")
  .QueryInterface(Ci.nsISubstitutingProtocolHandler)
  .setSubstitution(
    "furuitube-redirect-test",
    Services.io.newFileURI(do_get_cwd())
  );
Services.scriptloader.loadSubScript(
  "resource://furuitube-redirect-test/redirect.js",
  scope
);

const FURUITUBE = "https://yt.nasfurui.es";
const ID = "dQw4w9WgXcQ";

add_task(function test_video_links() {
  for (const url of [
    `https://www.youtube.com/watch?v=${ID}`,
    `https://youtube.com/watch?v=${ID}&t=42s&list=PL123`,
    `https://m.youtube.com/watch?v=${ID}`,
    `http://www.youtube.com/watch?feature=share&v=${ID}`,
    `https://youtu.be/${ID}?si=abc`,
    `https://www.youtube.com/embed/${ID}?autoplay=1`,
    `https://www.youtube.com/live/${ID}`,
  ]) {
    Assert.equal(
      scope.furuiTubeTarget(url),
      `${FURUITUBE}/watch?v=${ID}`,
      `${url} opens the same video in FuruiTube`
    );
  }
});

add_task(function test_search() {
  Assert.equal(
    scope.furuiTubeTarget(
      "https://www.youtube.com/results?search_query=a+b%26c"
    ),
    `${FURUITUBE}/results?q=a%20b%26c`
  );
  Assert.equal(
    scope.furuiTubeTarget("https://www.youtube.com/results"),
    `${FURUITUBE}/`
  );
});

add_task(function test_distractions_go_home() {
  for (const url of [
    "https://www.youtube.com/",
    "https://youtube.com",
    "https://www.youtube.com/@midudev",
    "https://www.youtube.com/shorts/abcdefghijk",
    "https://www.youtube.com/feed/subscriptions",
    "https://www.youtube.com/playlist?list=PL123",
    "https://www.youtube.com/watch?v=short",
    "https://www.youtube.com/watch",
    "https://youtu.be/",
  ]) {
    Assert.equal(scope.furuiTubeTarget(url), `${FURUITUBE}/`, url);
  }
});

add_task(function test_untouched() {
  for (const url of [
    "https://yt.nasfurui.es/watch?v=" + ID,
    "https://music.youtube.com/",
    "https://studio.youtube.com/",
    "https://accounts.google.com/",
    "https://www.youtube-nocookie.com/embed/" + ID,
    "https://notyoutube.com/",
    "https://evil.example/?u=https://www.youtube.com/",
    "https://www.youtube.com/signin?action_handle_signin=true",
    "https://www.youtube.com/oembed?url=x",
    "https://www.youtube.com/feeds/videos.xml?channel_id=UC1",
    "https://www.youtube.com/iframe_api",
    "https://www.youtube.com/watch?v=" + ID + "&furuitube=off",
    "ftp://www.youtube.com/",
    "not a url",
  ]) {
    Assert.equal(scope.furuiTubeTarget(url), null, url);
  }
});
