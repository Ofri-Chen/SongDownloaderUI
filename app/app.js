var lastFmApiBaseUrl = 'http://ws.audioscrobbler.com/2.0/?method=artist.gettoptracks&artist=Artist_Name&limit=Limit&api_key=5cfe225d4173261c71b97704dc74031c&format=json';

var songDownloaderAPIPort = 3000;
var songDownloaderAPIBaseUrl = 'http://localhost:' + songDownloaderAPIPort + '/v1/';
var downloadTracksRoute = 'tracksArray';
var downloadSingleTrackRoute = 'track/Artist_Name/Track_Name';
var youtubeApi = 'https://www.googleapis.com/youtube/v3/search?part=snippet&q=TrackName&type=video&maxResults=Max_Results&key=AIzaSyDOegfItpZ_goZccL_pmREwZoNXoaYZNaw';


var app = angular.module('app', []);
app.controller('appCtrl', ['$scope',
    function($scope) {
        $scope.tracks = [];
        if(JSON.parse(window.localStorage.getItem('tracks')) != null){
            $scope.tracks = JSON.parse(window.localStorage.getItem('tracks'));
        }
        $scope.artist = 'Metallica';
        $scope.limit = '5';
        $scope.trackName = 'Enter Sandman';
        $scope.currentTab = 0;
        $scope.lyrics = true;
        $scope.currentArtist = getCurrentArtist();

        $scope.submitArtist = function(){
            if(validateArtistName($scope.artist, $scope.tracks)){
                getTracks($scope.artist, $scope.limit ,function(trackNames){
                    $scope.tracks.push({artist: $scope.artist, tracks: trackNames});
                    $scope.currentTab = $scope.tracks.length - 1;
                    $scope.currentArtist = $scope.tracks[$scope.tracks.length - 1].artist;
                    $scope.$apply();
                    emphasizeCurrentTab($scope.currentTab, $scope.tracks.length);
                    updateLocalStorage($scope.tracks);
                })
            }
        };

        $scope.removeTrackBtn = function(){
            var index = $scope.tracks[$scope.currentTab].tracks.indexOf(
                event.currentTarget.parentElement.getElementsByClassName('trackName')[0].innerHTML);
            $scope.tracks[$scope.currentTab].tracks.splice(index, 1);
            updateLocalStorage($scope.tracks);
        };

        $scope.removeTabBtn = function(){
            var tabName = event.currentTarget.parentElement.getElementsByClassName('tabName')[0].innerHTML;
            for(var i = 0; i < $scope.tracks.length; i++) {
                if(tabName == $scope.tracks[i].artist){
                    if($scope.currentTab == i){
                        if($scope.currentTab == $scope.tracks.length - 1){
                            //remove the last tab, while it's emphasized
                            if($scope.currentTab != 0){
                                $scope.currentTab--;
                                emphasizeCurrentTab($scope.currentTab, $scope.tracks.length);
                            }
                        }
                    }
                    else{
                        if($scope.currentTab > i){
                            $scope.currentTab--;
                        }
                    }

                    $scope.tracks.splice(i, 1);
                    break;
                }
            }

            $scope.currentArtist = $scope.tracks.length > 0 ? $scope.tracks[$scope.currentTab].artist : '';

            updateLocalStorage($scope.tracks);
        };

        $scope.tabClick = function(){
            var clickedBtnHtml = event.currentTarget.querySelector('div').innerHTML;
            for(var i = 0; i < $scope.tracks.length; i++){
                if(clickedBtnHtml == $scope.tracks[i].artist){
                    $scope.currentTab = i;
                    $scope.currentArtist = $scope.tracks[i].artist;
                    break;
                }
            }

            emphasizeCurrentTab($scope.currentTab, $scope.tracks.length);
        };

        $scope.downloadTrack = function(){
            downloadSong($scope.artist, $scope.trackName, $scope.lyrics);
        };

        $scope.downloadAll = function(){
            downloadArtistsSongs($scope.tracks[$scope.currentTab], $scope.lyrics);
        };

        $scope.playVideo = function(){
            var trackName = getTrackName(event);
            getYoutubeVideoId($scope.currentArtist, trackName, $scope.lyrics, 1, playVideo);
        };

        function playVideo(trackName, videoId, tries){
            if(videoId){
                playYoutubeVideo(videoId, function(isVideoWorking){
                    if(!isVideoWorking){
                        getYoutubeVideoId($scope.currentArtist, trackName, $scope.lyrics, tries + 1, playVideo);
                    }
                });
            }
        }

        function getCurrentArtist(){
            return $scope.tracks.length > 0 ? $scope.tracks[0].artist : '';
        }
    }
]);

function getTracks(artist, limit, callback)
{
    var lastFmApiInfo = lastFmApiBaseUrl.replace('Artist_Name', artist).replace('Limit', limit);

    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
            var response = JSON.parse(xmlHttp.responseText);

            if (response.error != undefined) { // error
                alert(response.message);
            }
            else { // no error
                parseTrackNames(response, function (trackNames) {
                    callback(trackNames);
                });
            }
        }
    };

    xmlHttp.open('GET', lastFmApiInfo, true);
    xmlHttp.send(null);
}

function downloadArtistsSongs(tracks, lyrics){
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            alert('Sucess !');
    };

    if(lyrics){
        xmlHttp.open('POST', songDownloaderAPIBaseUrl + downloadTracksRoute, true);
    }
    else{
        xmlHttp.open('POST', songDownloaderAPIBaseUrl + downloadTracksRoute + '/noLyrics', true);
    }

    xmlHttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xmlHttp.send(JSON.stringify(tracks));
}

function downloadSong(artist, trackName, lyrics){
    var baseRequestUrl = songDownloaderAPIBaseUrl + downloadSingleTrackRoute;
    var requestUrl = '';
    if(lyrics){
        requestUrl = baseRequestUrl
            .replace('Artist_Name', artist)
            .replace('Track_Name', trackName);
    }
    else{
        requestUrl = (baseRequestUrl + '/noLyrics')
            .replace('Artist_Name', artist)
            .replace('Track_Name', trackName);
    }


    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            alert('Sucess !');
    };

    xmlHttp.open('GET', requestUrl, true);
    xmlHttp.send();
}

function parseTrackNames(rawTracksArray, callback){
    var trackArray = rawTracksArray.toptracks.track;
    var trackNames = [];

    for(var i = 0; i < trackArray.length; i++){
        trackNames.push(trackArray[i].name);
    }

    callback(trackNames);
}

function validateArtistName(artistName, tracks){
    if(tracks){
        for(var i = 0; i < tracks.length; i++){
            if(tracks[i].artist == artistName){
                return false;
            }
        }
    }
    return true;
}

function emphasizeCurrentTab(index/*, length*/){
    var tabs = document.querySelectorAll('.tab .tab-button');
    if(tabs.length > 0){
        for(var i = 0; i < tabs.length; i++){
            tabs[i].style.background = 'linear-gradient(#6493C3, #BCD8F5)';
        }
        tabs[index].style.background = 'linear-gradient(#336BA2, #5D9EDF)';
    }
}

function updateLocalStorage(tracks){
    window.localStorage.setItem('tracks', JSON.stringify(tracks));
}

function getYoutubeVideoId(artist, trackName, lyrics, tries,callback){
    var name = artist + ' - ' + trackName;
    console.log(name);
    if(lyrics){
        name += ' lyrics';
    }

    var youtubeApiInfo = youtubeApi.replace('TrackName', name).replace('Max_Results', tries);
    var videoId = '';
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200){
            videoId = JSON.parse(xmlHttp.responseText).items[tries - 1].id.videoId;
        }
        console.log('trackname:', trackName);
        callback(trackName, videoId, tries);
    };

    xmlHttp.open('GET', youtubeApiInfo, true);
    xmlHttp.send();
}

function getTrackName(event){
    var trackName = event.currentTarget.getElementsByClassName('trackName')[0].innerHTML;
    return trackName;
}