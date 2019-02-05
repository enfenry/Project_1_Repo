$(document).ready(function () {

    const geocodingAPIkey = 'AIzaSyAVNZ2_elkGOvb8xXsyF5NSS9PQnW_Ze8k';
    const ticketmasterAPIkey = '1FADcqMEkzQiSakwUoKLPibod91GMG6g';
    let geoURL;
    let ticketURL;
    let radius = 20;
    let size = 20;
    let unit = 'miles';

    let DOM = {
        inputLocation: $('#cityInput'),
        searchButton: $('#searchBtn'),
        container: $('.container'),
        results: $('#results')
    }

    DOM.searchButton.on('click', function () {
        event.preventDefault();
        let input = DOM.inputLocation.val().trim();

        getCoords(input).then(function (coords) {
            let ticketURL = "https://app.ticketmaster.com/discovery/v2/events.json?latlong=" + coords + "&radius=" + radius + "&unit=" + unit + "&size=" + size + "&classificationName=music&apikey=" + ticketmasterAPIkey;
            getEvents(ticketURL).then(function (result) {

                if (result._embedded !== undefined) {
                    for (let i = 0; i < result._embedded.events.length; i++) {

                        let thisEvent = result._embedded.events[i];
                        let attractions = thisEvent._embedded.attractions;

                        for (let j = 0; j < attractions.length; j++) {

                            const artistName = attractions[j].name;

                            const genreSummary = createGenreSummary(thisEvent);

                            const venueSummary = createVenueSummary(thisEvent)

                            const date = thisEvent.dates.start.localDate;
                            const time = thisEvent.dates.start.localTime;
                            // const timeZone = thisEvent.dates.timezone;
                            // const timeSummary = time + ' - ' + timeZone;

                            const priceSummary = createPriceSummary(thisEvent);

                            const ticketLink = thisEvent.url;

                            let resultDiv = $('<div>');
                            let artistSpan = createSpan(artistName, 'artistName');
                            let genreSpan = createSpan(genreSummary, 'genreSummary');
                            let venueSpan = createSpan(venueSummary, 'venueSummary');
                            let dateSpan = createSpan(date, 'date');
                            let timeSpan = createSpan(time, 'time');
                            // let timeSpan = createSpan(timeSummary,'timeSummary');
                            let priceSpan = createSpan(priceSummary, 'priceSummary');
                            let ticketBtn = createLinkButton('Buy Tickets', ticketLink, 'ticketLink')

                            resultDiv.empty();
                            resultDiv.append(artistSpan);
                            resultDiv.append('<br />')
                            resultDiv.append(genreSpan);
                            resultDiv.append('<br />')
                            resultDiv.append(venueSpan);
                            resultDiv.append('<br />')
                            resultDiv.append(dateSpan);
                            resultDiv.append('<br />')
                            resultDiv.append(timeSpan);
                            resultDiv.append('<br />')
                            resultDiv.append(priceSpan);
                            resultDiv.append('<br />')
                            resultDiv.append(ticketBtn);
                            resultDiv.append('<br />')
                            resultDiv.append('<br />')
                            DOM.results.append(resultDiv);
                        }
                    }
                }
                else {
                    // TODO: Error handling when no results found
                    console.log('Ticketmaster may not be available in this area.')
                    DOM.results.html('Ticketmaster may not be available in this area.');
                }

                console.log(result._links);
                console.log(result._links.first);
                console.log(result._links.self);
                console.log(result._links.next);
                console.log(result._links.last);
            });
        });
    });

    function displayResults(result) {
        
    }

    function createLinkButton(text, url, className) {
        let newBtn = $('<button>');
        newBtn.attr('url', url);
        newBtn.text(text)
        newBtn.addClass(className);
        newBtn.on('click', function () {
            openInNewTab(url);
        });
        return newBtn;
    }

    function openInNewTab(url) {
        let win = window.open(url, '_blank');
        win.focus();
    }

    function createSpan(content, className) {
        let newSpan = $('<span>');
        newSpan.addClass(className);
        newSpan.html(content);
        return newSpan;
    }

    function createVenueSummary(event) {
        const venue = event._embedded.venues[0];
        const venueName = venue.name;
        const venueCity = venue.city.name;
        const countryCode = venue.country.countryCode;
        let venueLocation;
        if (countryCode === 'US') {
            const venueState = venue.state.stateCode;
            venueLocation = venueCity + ', ' + venueState;
        }
        else {
            venueLocation = venueCity + ', ' + countryCode;
        }

        if (venueName !== undefined) {
            return venueName + ' - ' + venueLocation;
        }
        else {
            return venueLocation;
        }
    }

    function createPriceSummary(event) {
        if (event.priceRanges !== undefined) {
            const priceData = event.priceRanges[0];
            const min = priceData.min;
            const max = priceData.max;
            const currency = priceData.currency;
            if (min === max) {
                return 'Price: ' + min + ' ' + currency
            }
            else {
                return 'Price Range: ' + min + ' - ' + max + ' ' + currency
            }
        }
        else {
            return 'Price: N/A';
        }
    }

    function createGenreSummary(event) {
        let classification = event.classifications[0];
        const genre = classification.genre.name;
        let genreSummary;
        if (classification.subGenre !== undefined && genre !== classification.subGenre.name) {
            const subGenre = classification.subGenre.name;
            genreSummary = genre + ' / ' + subGenre;
        }
        else {
            genreSummary = genre
        }
        return genreSummary;
    }

    async function getCoords(userInput) {
        geoURL = "https://maps.googleapis.com/maps/api/geocode/json?address=" + userInput + "&key=" + geocodingAPIkey;

        const response = await $.ajax({
            url: geoURL,
            method: "GET"
        });

        const latitude = response.results[0].geometry.location.lat;
        const longitude = response.results[0].geometry.location.lng;
        const coords = latitude + ',' + longitude;

        return coords;
    }

    async function getEvents(url) {

        const response = await $.ajax({
            type: "GET",
            url: url,
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
    // https://maps.googleapis.com/maps/api/geocode/json?address=1600+Amphitheatre+Parkway,+Mountain+View,+CA&key=AIzaSyAVNZ2_elkGOvb8xXsyF5NSS9PQnW_Ze8k
    //  https://maps.googleapis.com/maps/api/geocode/json?address=22201&key=AIzaSyAVNZ2_elkGOvb8xXsyF5NSS9PQnW_Ze8k

    // TICKETMASTER
    // https://app.ticketmaster.com/discovery/v2/events.json?latlong=38.839787,-77.061339&radius=10&unit=miles&size=200&stateCode=VA&countryCode=US&apikey=1FADcqMEkzQiSakwUoKLPibod91GMG6g
    // https://app.ticketmaster.com/discovery/v2/events.json?latlong=32.735687,-97.10806559999999&radius=20&unit=miles&size=20&classificationName=music&apikey=1FADcqMEkzQiSakwUoKLPibod91GMG6g

    // possible app name - Earshot? or Nearshot?
});