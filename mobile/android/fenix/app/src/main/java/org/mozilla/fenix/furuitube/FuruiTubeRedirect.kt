/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

package org.mozilla.fenix.furuitube

import android.net.Uri
import androidx.core.net.toUri

object FuruiTubeRedirect {
    const val FURUITUBE_ORIGIN = "https://yt.nasfurui.es"
    const val BYPASS_PARAM = "furuitube"
    const val BYPASS_VALUE = "off"

    val YOUTUBE_HOSTS = setOf(
        "youtube.com",
        "www.youtube.com",
        "m.youtube.com",
    )

    val PASSTHROUGH_PREFIXES = listOf(
        "/signin",
        "/accounts",
        "/oembed",
        "/feeds/",
        "/api/",
        "/youtubei/",
        "/iframe_api",
        "/s/",
    )

    private val VIDEO_ID_REGEX = Regex("^[\\w-]{11}$")
    private val EMBED_OR_LIVE_REGEX = Regex("^/(?:embed|live)/([^/?#]+)")

    fun furuiTubeWatch(id: String): String {
        return if (VIDEO_ID_REGEX.matches(id)) {
            "$FURUITUBE_ORIGIN/watch?v=$id"
        } else {
            "$FURUITUBE_ORIGIN/"
        }
    }

    /**
     * Maps a YouTube URL to the FuruiTube URL that should replace it.
     *
     * @param rawUrl The URL being navigated to.
     * @return The FuruiTube URL, or null to leave the URL alone.
     */
    fun mapTarget(rawUrl: String): String? {
        val parsed = try {
            rawUrl.toUri()
        } catch (_: Exception) {
            return null
        }

        val scheme = parsed.scheme?.lowercase() ?: return null
        if (scheme != "http" && scheme != "https") {
            return null
        }

        val host = parsed.host?.lowercase() ?: return null

        if (host == "youtu.be") {
            val videoId = parsed.pathSegments.firstOrNull().orEmpty()
            return furuiTubeWatch(videoId)
        }

        if (host !in YOUTUBE_HOSTS) {
            return null
        }

        if (parsed.getQueryParameter(BYPASS_PARAM) == BYPASS_VALUE) {
            return null
        }

        val path = parsed.path.orEmpty()
        if (PASSTHROUGH_PREFIXES.any { path.startsWith(it) }) {
            return null
        }

        if (path == "/watch") {
            val v = parsed.getQueryParameter("v").orEmpty()
            return furuiTubeWatch(v)
        }

        val match = EMBED_OR_LIVE_REGEX.find(path)
        if (match != null) {
            val videoId = match.groupValues[1]
            return furuiTubeWatch(videoId)
        }

        if (path == "/results") {
            val query = parsed.getQueryParameter("search_query")
            return if (!query.isNullOrEmpty()) {
                "$FURUITUBE_ORIGIN/results?q=${Uri.encode(query)}"
            } else {
                "$FURUITUBE_ORIGIN/"
            }
        }

        // Home, channels, playlists, Shorts, feeds...: no distractions.
        return "$FURUITUBE_ORIGIN/"
    }
}
