var tag = document.getElementById("youtube-iframe-api");
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var youtubeBaseUrl = 'https://www.youtube.com/watch?v=';

var player;
function createNewPlayer(videoId, callback){
    player = new YT.Player('player', {
        height: '390',
        width: '640',
        videoId: videoId,
        events: {
            'onReady': function(event){
                onPlayerReady(event, callback);
            },
            'onStateChange': onPlayerStateChange
        }
    });
}


function onPlayerReady(event, callback) {
    event.target.playVideo();
    callback();
}

var done = false;
function onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.PLAYING && !done) {
        done = true;
    }
}

function playYoutubeVideo(videoId, callback){
    if(!player){
        createNewPlayer(videoId, function(){
            callback(player.getVideoData().author != "");
        })
    }
    else{
        changeYoutubeVideo(videoId);
        setTimeout(function(){
            while(player.getVideoData == undefined);
            callback(player.getVideoData().author != "");
        }, 10000)
    }
}

function changeYoutubeVideo(videoId) {
    player.loadVideoById({'videoId': videoId});
}