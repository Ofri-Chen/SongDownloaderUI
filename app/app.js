var lastFmApiBaseUrl = 'http://ws.audioscrobbler.com/2.0/?method=artist.gettoptracks&artist=Artist_Name&limit=Limit&api_key=5cfe225d4173261c71b97704dc74031c&format=json';

var songDownloaderAPIPort = 3000;
var songDownloaderAPIBaseUrl = 'http://localhost:' + songDownloaderAPIPort + '/v1/';
var downloadTracksRoute = 'tracksArray';
var downloadSingleTrackRoute = 'track/Artist_Name/Track_Name';


var app = angular.module('app', []);
app.controller('appCtrl', ['$scope',
    function($scope) {
        $scope.tracks = [];
        $scope.artist = 'Metallica';
        $scope.limit = '5';
        $scope.trackName = 'Enter Sandman';
        $scope.currentTab = 0;
        $scope.noLyrics = false;

        $scope.submitArtist = function(){
            if(validateArtistName($scope.artist, $scope.tracks)){
                getTracks($scope.artist, $scope.limit ,function(trackNames){
                    $scope.tracks.push({artist: $scope.artist, tracks: trackNames});
                    $scope.currentTab = $scope.tracks.length - 1;
                    $scope.$apply();
                    emphasizeCurrentTab($scope.currentTab, $scope.tracks.length);

                    var removeTrackElements = document.getElementsByClassName('removeBtn');
                    for(var i = 0; i < removeTrackElements.length; i++){
                        removeTrackElements[i].addEventListener('click', function(event){
                            var index = $scope.tracks[0].tracks.indexOf(event.target.nextElementSibling.innerHTML);
                            $scope.tracks[0].tracks.splice(index, 1);
                            $scope.$apply();
                        }, false);
                    }

                    var tabs = document.querySelectorAll('.tab button');
                    var tab = tabs[tabs.length - 1];
                    tab.addEventListener('click', function(event){
                        var clickedBtnHtml = event.target.innerHTML;

                        var tabsElements = document.querySelectorAll('.tab button');
                        for(var i = 0; i < tabsElements.length; i++){
                            if(tabsElements[i].innerHTML == clickedBtnHtml){
                                $scope.currentTab = i;
                                break;
                            }
                        }

                        emphasizeCurrentTab($scope.currentTab, $scope.tracks.length);
                        $scope.$apply();
                    }, false);
                })
            }
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
    for(var i = 0; i < length; i++){
        tabs[i].style.background = 'linear-gradient(#6493C3, #BCD8F5)';
    }
    tabs[index].style.background = 'linear-gradient(#336BA2, #5D9EDF)';
}