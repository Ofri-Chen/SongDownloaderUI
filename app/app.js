var lastFmApiBaseUrl = 'http://ws.audioscrobbler.com/2.0/?method=artist.gettoptracks&artist=Artist_Name&limit=Limit&api_key=5cfe225d4173261c71b97704dc74031c&format=json';

var songDownloaderAPIPort = 3000;
var songDownloaderAPIBaseUrl = 'http://localhost:' + songDownloaderAPIPort + '/v1/';
var downloadTracksRoute = 'tracksArray';


var app = angular.module('app', []);
app.controller('appCtrl', ['$scope',
    function($scope) {
        $scope.tracks = [];
        // $scope.someList = [1,2,3];
        $scope.artist = 'Metallica';
        $scope.limit = '5';
        $scope.currentTab = 0;

        $scope.submit = function(){
            getTracks($scope.artist, $scope.limit ,function(trackNames){
                $scope.tracks.push({artist: $scope.artist, tracks: trackNames});
                $scope.$apply();

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
                    $scope.$apply();
                }, false);


            })
        }


        $scope.downloadAll = function(){
            downloadArtistsSongs($scope.tracks[$scope.currentTab]);
        }
    }
]);

function getTracks(artist, limit, callback)
{
    var lastFmApiInfo = lastFmApiBaseUrl.replace('Artist_Name', artist).replace('Limit', limit);

    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            parseTrackNames(xmlHttp.responseText, function(trackNames){
                callback(trackNames);
            });
    };

    xmlHttp.open('GET', lastFmApiInfo, true);
    xmlHttp.send(null);
}

function downloadArtistsSongs(tracks){

    console.log(tracks);
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            alert('Sucess !');
    };

    xmlHttp.open('POST', songDownloaderAPIBaseUrl + downloadTracksRoute, true);
    xmlHttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xmlHttp.send(tracks);
}

function parseTrackNames(rawTracks, callback){
    var trackNames = [];
    var trackArray = JSON.parse(rawTracks).toptracks.track;

    for(var i = 0; i < trackArray.length; i++){
        trackNames.push(trackArray[i].name);
    }
    callback(trackNames);
}