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
        container: $('.container')
    }

    DOM.searchButton.on('click', function () {
        event.preventDefault();
        let input = DOM.inputLocation.val().trim();

        getCoords(input).then(function (coords) {
            getEvents(coords).then(function (result) {

                if (result._embedded !== undefined) {
                    let i = 0;

                    const artistName = result._embedded.events[i]._embedded.attractions[0].name;

                    const genre = result._embedded.events[i].classifications[0].genre.name;
                    const subGenre = result._embedded.events[i].classifications[0].subGenre.name;
                    const genreSummary = genre + ' / ' + subGenre;

                    const venue = result._embedded.events[i]._embedded.venues[0];
                    const venueSummary = createVenueSummary(venue)

                    const date = result._embedded.events[i].dates.start.localDate;
                    const time = result._embedded.events[i].dates.start.localTime;
                    const timeZone = result._embedded.events[i].dates.timezone;
                    const timeSummary = time + ' - ' + timeZone;

                    const priceData = result._embedded.events[i].priceRanges[0];
                    const priceSummary = createPriceSummary(priceData);

                    const ticketLink = result._embedded.events[i].url;

                    console.log(artistName, genreSummary, venueSummary, date, time, timeZone, priceSummary, ticketLink);
                    // console.log(result._embedded);

                    DOM.container.append(createSpan(artistName,'artistName'));
                    DOM.container.append(createSpan(genreSummary,'genreSummary'));
                    DOM.container.append(createSpan(venueSummary,'venueSummary'));
                    DOM.container.append(createSpan(timeSummary,'timeSummary'));
                    DOM.container.append(createSpan(priceSummary,'priceSummary'));
                    DOM.container.append(createLinkButton('Buy Tickets',ticketLink,'ticketLink'));

                }
                else {
                    // TODO: Error handling when no results found
                    console.log('Ticketmaster may not be available in this area.')
                    DOM.container.append('Ticketmaster may not be available in this area.');
                }
            });
        });
    });

    function createLinkButton(text,url,className) {
        let newBtn = $('<button>');
        newBtn.attr('url',url);
        newBtn.text(text)
        newBtn.addClass(className);
        newBtn.on('click',function () {
            openInNewTab(url);
        });
        return newBtn;
    }

    function openInNewTab(url) {
        let win = window.open(url, '_blank');
        win.focus();
      }

    function createSpan(content,className) {
        let newSpan = $('<span>');
        newSpan.addClass(className);
        newSpan.html(content);
        return newSpan;
    }

    function createVenueSummary(venue) {
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

    function createPriceSummary(priceData) {
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

    async function getCoords(userInput) {
        geoURL = "https://maps.googleapis.com/maps/api/geocode/json?address=" + userInput + "&key=" + geocodingAPIkey
        console.log(geoURL);
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
        console.log(ticketURL);

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