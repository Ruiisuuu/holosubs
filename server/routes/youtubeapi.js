require('dotenv').config();
const {google} = require('googleapis');
const youtube = google.youtube({
    version: 'v3',
    auth: process.env.GOOGLE_API_KEY
});

const replaceAt = (str, index, replacement) => {
    return str.substr(0, index) + replacement + str.substr(index + replacement.length);
}

module.exports = {
    getChannelInfo: async (channelId) => {
        const vtuberInfo = await youtube.channels.list({
            "part": [ "id", "snippet" ],
            "id": [ channelId ],
            "maxResults": 1
        });
        return vtuberInfo.data.items[0].snippet;
    },
    getVideoInfo: async (videoId) => {
        const videoInfo = await youtube.videos.list({
            "part": [ "id", "snippet" ],
            "id": [ videoId ],
            "maxResults": 1
        });
        return videoInfo.data.items[0].snippet;
    },
    getAllSourcesInfoForVtuber: async (channelId) => {
        // "uploads" playlist's id is the channel's id except the 2nd char
        const playlistId = replaceAt(channelId, 1, "U");
        let videoList = [];
        let playListQuery = {};
        let nextPageToken = null;
        //do { COMMENTED OUT FOR PROOF OF CONCEPT PURPOSES
            playListQuery = await youtube.playlistItems.list({
                "part": [ "id", "snippet" ],
                "maxResults": 50,
                "pageToken": nextPageToken,
                "playlistId": playlistId
            });
            videoList = [...videoList, ...playListQuery.data.items];
            if(playListQuery.data.nextPageToken !== null) // Get next page
                nextPageToken = playListQuery.data.nextPageToken;
            else nextPageToken = null;
        //} while (nextPageToken);
        return videoList;
    },
    getAllSubtitlesInfoForSource: async (videoId) => {
        let subtitleList = [];
        let searchQuery = {};
        let nextPageToken = null;
        do {
            searchQuery = await youtube.search.list({
                "part": [ "id", "snippet" ],
                "maxResults": 50,
                "q": `https://www.youtube.com/watch?v=${videoId}`,
                "safeSearch": "none",
                "type": [ "video" ]
              });
            subtitleList = [...subtitleList, ...searchQuery.data.items];
            if(searchQuery.data.nextPageToken !== null) // Get next page
                nextPageToken = searchQuery.data.nextPageToken;
            else nextPageToken = null;
        } while (nextPageToken);
        return subtitleList;
    }
}