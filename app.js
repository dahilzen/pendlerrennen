var map = L.map('map').setView([49.1817115, 9.2249324], 12);
L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
    attribution: '<a href="http://www.osm.org">OpenStreetMap</a> | <a href="https://www.twitter.com/dahilzen">David Hilzendegen</a>'
}).addTo(map);
map.scrollWheelZoom.disable();
map.zoomControl.remove();

var bikeIcon = L.icon({
    iconUrl: './icons/bike.svg',
    iconSize: [40, 40], // size of the icon
    iconAnchor: [20, 20], // point of the icon which will correspond to marker's location
});

var autoIcon = L.icon({
    iconUrl: './icons/auto.svg',
    iconSize: [30, 30], // size of the icon
    iconAnchor: [15, 15], // point of the icon which will correspond to marker's location
});

var bahnIcon = L.icon({
    iconUrl: './icons/bahn.svg',
    iconSize: [30, 30], // size of the icon
    iconAnchor: [15, 15], // point of the icon which will correspond to marker's location
});

var rennradIcon = L.icon({
    iconUrl: './icons/rennrad.svg',
    iconSize: [40, 40], // size of the icon
    iconAnchor: [20, 20], // point of the icon which will correspond to marker's location
});

var greenIcon = L.icon({
    iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

var origin = L.marker([49.22320992690439, 9.21920257621372]).addTo(map);
var destination = L.marker([49.138696, 9.219295], { icon: greenIcon }).addTo(map);

var auto_data = d3.csv('./data/auto.csv')
var bahn_data = d3.csv('./data/bahn.csv')
var e_bike_data = d3.csv('./data/e_bike.csv')
var rennrad_data = d3.csv('./data/rennrad.csv')

Promise.all([auto_data, bahn_data, e_bike_data, rennrad_data]).then(function(raw_data) {

    var auto = raw_data[0];
    var bahn = raw_data[1];
    var bike = raw_data[2];
    var rennrad = raw_data[3];

    var polylineGroup;
    var markerGroup;
    var timerInterval;
    var totalSeconds = 0;

    function draw() {

        polylineGroup = L.layerGroup().addTo(map);
        markerGroup = L.layerGroup().addTo(map);

        var polylines = []
        for (var i = raw_data.length - 1; i >= 0; i--) {
            colors = ['#d7191c', '#fdae61', '#abd9e9', '#2c7bb6'];
            polylines[i] = new L.polyline([], {
                color: colors[i],
                smoothFactor: 0.7,
                noClip: false,
            }).addTo(polylineGroup);
        }

        function playInterval(data, i, temp, icon) {
            var j = -1;
            var marker = L.marker([data[i].lat, data[i].lon], { icon: icon }).addTo(markerGroup);
            setInterval(function() {
                j++;
                if (j < data.length) {
                    marker.setLatLng([data[j].lat, data[j].lon]).update();
                    polylines[i].addLatLng([data[j].lat, data[j].lon]);
                }
            }, temp);
        }

        var secondsLabel = document.getElementById("counterSec");

        function setTime() {
            if (totalSeconds < 50) {
                ++totalSeconds;
                secondsLabel.innerHTML = pad(totalSeconds % 60);
            } else {
                document.getElementById('startText').innerHTML = 'Nochmal!'
                document.getElementById('start').style.display = 'block';
                document.getElementById('start').onclick = startAgain;
            }
        }

        function pad(val) {
            var valString = val + "";
            if (valString.length < 2) {
                return "0" + valString;
            } else {
                return valString;
            }
        }

        document.getElementById('start').style.display = 'none';
        timerInterval = setInterval(setTime, 1000);
        playInterval(auto, 0, 21.5, autoIcon);
        playInterval(bike, 2, 19, bikeIcon);
        playInterval(rennrad, 3, 18, rennradIcon);
        playInterval(bahn, 1, 25.9, bahnIcon);
    }

    function startAgain() {
        clearInterval(timerInterval);
        totalSeconds = 0;
        document.getElementById('start').style.display = 'none';
        map.removeLayer(markerGroup);
        map.removeLayer(polylineGroup);
        draw();
    }

    document.getElementById('start').onclick = draw;

});
