$(document).ready(function () {

    const geocodingAPIkey = 'AIzaSyAVNZ2_elkGOvb8xXsyF5NSS9PQnW_Ze8k';
    const ticketmasterAPIkey = '1FADcqMEkzQiSakwUoKLPibod91GMG6g';
    let geoURL;
    let ticketURL;
    let radius = 20;
    let size = 20;
    let unit = 'miles';


    getCoords('Arlington').then(function (coords) {
        getEvents(coords).then(function (result) {
            console.log(result);
        });
    });


    async function getCoords(userInput) {
        geoURL = "https://maps.googleapis.com/maps/api/geocode/json?address=" + userInput + "&key=" + geocodingAPIkey

        const response = await $.ajax({
            url: geoURL,
            method: "GET"
        });

        const latitude = response.results[0].geometry.location.lat;
        const longitude = response.results[0].geometry.location.lng;
        const coords = latitude + ',' + longitude;

        return coords;
    }

    async function getEvents(coords) {
        ticketURL = "https://app.ticketmaster.com/discovery/v2/events.json?latlong=" + coords + "&radius=" + radius + "&unit=" + unit + "&size=" + size + "&classificationName=music&apikey=" + ticketmasterAPIkey;

        const response = await $.ajax({
            type: "GET",
            url: ticketURL,
            async: true,
            dataType: "json",
            // function(json) {
            //     console.log(json);
            // }
        });
        return response;
    }



    // EXAMPLE URLS FOR API DATA
    // GOOGLE GEOCODE
    // https://maps.googleapis.com/maps/api/geocode/json?address=Paris&key=AIzaSyAVNZ2_elkGOvb8xXsyF5NSS9PQnW_Ze8k
    // https://maps.googleapis.com/maps/api/geocode/json?address=1600+Amphitheatre+Parkway,+Mountain+View,+CA&key=AIzaSyAVNZ2_elkGOvb8xXsyF5NSS9PQnW_Ze8k
    //  https://maps.googleapis.com/maps/api/geocode/json?address=22201&key=AIzaSyAVNZ2_elkGOvb8xXsyF5NSS9PQnW_Ze8k

    // TICKETMASTER
    // https://app.ticketmaster.com/discovery/v2/events.json?latlong=38.839787,-77.061339&radius=10&unit=miles&size=200&stateCode=VA&countryCode=US&apikey=1FADcqMEkzQiSakwUoKLPibod91GMG6g
    // https://app.ticketmaster.com/discovery/v2/events.json?latlong=32.735687,-97.10806559999999&radius=20&unit=miles&size=20&classificationName=music&apikey=1FADcqMEkzQiSakwUoKLPibod91GMG6g

});