/* Any copyright is dedicated to the Public Domain.
   http://creativecommons.org/publicdomain/zero/1.0/ */

"use strict";

const FURUITUBE = "https://yt.nasfurui.es";
const ID = "dQw4w9WgXcQ";

// Records the FuruiTube and embedded-player requests the browser starts and
// cancels them, so the test never reaches the real network.
function recordRequests() {
  const seen = [];
  const observer = {
    observe(subject) {
      const channel = subject.QueryInterface(Ci.nsIChannel);
      const url = channel.URI.spec;
      if (url.startsWith(FURUITUBE) || url.includes("youtube.com/embed/")) {
        seen.push(url);
        channel.cancel(Cr.NS_ERROR_ABORT);
      }
    },
  };
  Services.obs.addObserver(observer, "http-on-modify-request");
  return {
    seen,
    stop: () => Services.obs.removeObserver(observer, "http-on-modify-request"),
  };
}

add_task(async function test_top_level_navigation_is_redirected() {
  for (const [from, to] of [
    [`https://www.youtube.com/watch?v=${ID}`, `${FURUITUBE}/watch?v=${ID}`],
    [`https://youtu.be/${ID}`, `${FURUITUBE}/watch?v=${ID}`],
    ["https://www.youtube.com/", `${FURUITUBE}/`],
  ]) {
    const requests = recordRequests();
    await BrowserTestUtils.withNewTab("about:blank", async browser => {
      BrowserTestUtils.startLoadingURIString(browser, from);
      await TestUtils.waitForCondition(
        () => requests.seen.includes(to),
        `${from} is replaced by a request to ${to}`
      );
    });
    requests.stop();
    Assert.deepEqual(requests.seen, [to], `${from} only reaches FuruiTube`);
  }
});

add_task(async function test_embedded_player_is_not_redirected() {
  const requests = recordRequests();
  await BrowserTestUtils.withNewTab("https://example.com/", async browser => {
    await SpecialPowers.spawn(browser, [ID], async id => {
      const frame = content.document.createElement("iframe");
      frame.src = `https://www.youtube.com/embed/${id}`;
      content.document.body.appendChild(frame);
    });
    await TestUtils.waitForCondition(
      () => requests.seen.length,
      "The embed request was started"
    );
  });
  requests.stop();

  Assert.deepEqual(
    requests.seen,
    [`https://www.youtube.com/embed/${ID}`],
    "The iframe loads the real YouTube player and is not sent to FuruiTube"
  );
});

add_task(async function test_private_windows_are_redirected() {
  const win = await BrowserTestUtils.openNewBrowserWindow({ private: true });
  const requests = recordRequests();
  BrowserTestUtils.startLoadingURIString(
    win.gBrowser.selectedBrowser,
    `https://www.youtube.com/watch?v=${ID}`
  );
  await TestUtils.waitForCondition(
    () => requests.seen.length,
    "A request was started in the private window"
  );
  requests.stop();
  Assert.deepEqual(
    requests.seen,
    [`${FURUITUBE}/watch?v=${ID}`],
    "Private windows are redirected too"
  );
  await BrowserTestUtils.closeWindow(win);
});
