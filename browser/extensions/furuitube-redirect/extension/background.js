/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

/* global browser, furuiTubeTarget */

// Only top-level navigations are redirected. Sub-frames (the YouTube player
// embedded by FuruiTube) and every other resource type are left untouched.
browser.webRequest.onBeforeRequest.addListener(
  details => {
    const target = furuiTubeTarget(details.url);
    return target ? { redirectUrl: target } : {};
  },
  {
    urls: [
      "*://youtube.com/*",
      "*://www.youtube.com/*",
      "*://m.youtube.com/*",
      "*://youtu.be/*",
    ],
    types: ["main_frame"],
  },
  ["blocking"]
);
