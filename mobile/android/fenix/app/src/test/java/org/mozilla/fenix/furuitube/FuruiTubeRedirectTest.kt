/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

package org.mozilla.fenix.furuitube

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner

@RunWith(RobolectricTestRunner::class)
class FuruiTubeRedirectTest {

    @Test
    fun testRootRedirect() {
        assertEquals("https://yt.nasfurui.es/", FuruiTubeRedirect.mapTarget("https://youtube.com"))
        assertEquals("https://yt.nasfurui.es/", FuruiTubeRedirect.mapTarget("https://youtube.com/"))
        assertEquals("https://yt.nasfurui.es/", FuruiTubeRedirect.mapTarget("http://youtube.com"))
        assertEquals("https://yt.nasfurui.es/", FuruiTubeRedirect.mapTarget("https://www.youtube.com/"))
        assertEquals("https://yt.nasfurui.es/", FuruiTubeRedirect.mapTarget("https://m.youtube.com"))
        assertEquals("https://yt.nasfurui.es/", FuruiTubeRedirect.mapTarget("https://m.youtube.com/"))
    }

    @Test
    fun testWatchRedirect() {
        assertEquals(
            "https://yt.nasfurui.es/watch?v=dQw4w9WgXcQ",
            FuruiTubeRedirect.mapTarget("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
        )
        assertEquals(
            "https://yt.nasfurui.es/watch?v=dQw4w9WgXcQ",
            FuruiTubeRedirect.mapTarget("https://m.youtube.com/watch?v=dQw4w9WgXcQ")
        )
        assertEquals(
            "https://yt.nasfurui.es/watch?v=dQw4w9WgXcQ",
            FuruiTubeRedirect.mapTarget("https://youtu.be/dQw4w9WgXcQ")
        )
    }

    @Test
    fun testEmbedAndLive() {
        assertEquals(
            "https://yt.nasfurui.es/watch?v=dQw4w9WgXcQ",
            FuruiTubeRedirect.mapTarget("https://www.youtube.com/embed/dQw4w9WgXcQ")
        )
        assertEquals(
            "https://yt.nasfurui.es/watch?v=dQw4w9WgXcQ",
            FuruiTubeRedirect.mapTarget("https://www.youtube.com/live/dQw4w9WgXcQ")
        )
    }

    @Test
    fun testSearchResults() {
        assertEquals(
            "https://yt.nasfurui.es/results?q=funny%20cats",
            FuruiTubeRedirect.mapTarget("https://www.youtube.com/results?search_query=funny cats")
        )
    }

    @Test
    fun testShortsAndFeeds() {
        assertEquals("https://yt.nasfurui.es/", FuruiTubeRedirect.mapTarget("https://m.youtube.com/shorts/dQw4w9WgXcQ"))
        assertEquals("https://yt.nasfurui.es/", FuruiTubeRedirect.mapTarget("https://www.youtube.com/feed/subscriptions"))
        assertEquals("https://yt.nasfurui.es/", FuruiTubeRedirect.mapTarget("https://www.youtube.com/@mkbhd"))
    }

    @Test
    fun testPassthroughAndBypass() {
        assertNull(FuruiTubeRedirect.mapTarget("https://www.youtube.com/signin"))
        assertNull(FuruiTubeRedirect.mapTarget("https://www.youtube.com/accounts"))
        assertNull(FuruiTubeRedirect.mapTarget("https://www.youtube.com/api/test"))
        assertNull(FuruiTubeRedirect.mapTarget("https://www.youtube.com/watch?v=dQw4w9WgXcQ&furuitube=off"))
    }

    @Test
    fun testNonYouTube() {
        assertNull(FuruiTubeRedirect.mapTarget("https://google.com"))
        assertNull(FuruiTubeRedirect.mapTarget("https://yt.nasfurui.es/"))
    }
}
