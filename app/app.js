var lastFmApiBaseUrl = 'http://ws.audioscrobbler.com/2.0/?method=artist.gettoptracks&artist=Artist_Name&limit=Limit&api_key=5cfe225d4173261c71b97704dc74031c&format=json';

var songDownloaderAPIPort = 3000;
var songDownloaderAPIBaseUrl = 'http://localhost:' + songDownloaderAPIPort + '/v1/';
var downloadTracksRoute = 'tracksArray';
var downloadSingleTrackRoute = 'track/Artist_Name/Track_Name';


var app = angular.module('app', []);
app.controller('appCtrl', ['$scope',
    function($scope) {
        $scope.tracks = JSON.parse(window.localStorage.getItem('tracks'));
        $scope.artist = 'Metallica';
        $scope.limit = '5';
        $scope.trackName = 'Enter Sandman';
        $scope.currentTab = 0;
        $scope.noLyrics = false;

        $scope.tabLoad = function(){
            // alert();
            // emphasizeCurrentTab($scope.currentTab, $scope.tracks.length);
        };


        $scope.submitArtist = function(){
            if(validateArtistName($scope.artist, $scope.tracks)){
                getTracks($scope.artist, $scope.limit ,function(trackNames){
                    $scope.tracks.push({artist: $scope.artist, tracks: trackNames});
                    $scope.currentTab = $scope.tracks.length - 1;
                    $scope.$apply();
                    emphasizeCurrentTab($scope.currentTab, $scope.tracks.length);
                    updateLocalStorage($scope.tracks);
                })
            }
        };

        $scope.removeBtn = function(){
            var index = $scope.tracks[$scope.currentTab].tracks.indexOf(event.currentTarget.parentElement.getElementsByClassName('trackName')[0].innerHTML);
            console.log(index);
            $scope.tracks[$scope.currentTab].tracks.splice(index, 1);
            updateLocalStorage($scope.tracks);
        };

        $scope.tabClick = function(){
            var clickedBtnHtml = event.currentTarget.innerHTML;

            for(var i = 0; i < $scope.tracks.length; i++){
                if(clickedBtnHtml == $scope.tracks[i].artist){
                    $scope.currentTab = i;
                    break;
                }
            }

            emphasizeCurrentTab($scope.currentTab, $scope.tracks.length);
        };

        $scope.downloadTrack = function(){
            downloadSong($scope.artist, $scope.trackName, !$scope.noLyrics);
        };

        $scope.downloadAll = function(){
            downloadArtistsSongs($scope.tracks[$scope.currentTab], !$scope.noLyrics);
        };
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
    console.log('artist:', artist);
    console.log('trackName:', trackName);
    if(lyrics){
        var requestUrl = (songDownloaderAPIBaseUrl + downloadSingleTrackRoute)
            .replace('Artist_Name', artist)
            .replace('Track_Name', trackName);
    }
    else{
        var requestUrl = (songDownloaderAPIBaseUrl + downloadSingleTrackRoute + '/noLyrics')
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
    for(var i = 0; i < tracks.length; i++){
        if(tracks[i].artist == artistName){
            return false;
        }
    }
    return true;
}

function emphasizeCurrentTab(index, length){
    var tabs = document.querySelectorAll('.tab button');
    if(tabs.length > 0){
        for(var i = 0; i < length; i++){
            tabs[i].style.background = 'linear-gradient(#6493C3, #BCD8F5)';
        }
        tabs[index].style.background = 'linear-gradient(#336BA2, #5D9EDF)';
    }
}

function updateLocalStorage(tracks){
    window.localStorage.setItem('tracks', JSON.stringify(tracks));
}