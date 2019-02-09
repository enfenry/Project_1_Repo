$(document).ready(function () {

    var config = {
        apiKey: "AIzaSyAAcY2NfP7w8YTzprHrP77SGLAvMAi8c5c",
        authDomain: "bootcampak-48e6f.firebaseapp.com",
        databaseURL: "https://bootcampak-48e6f.firebaseio.com",
        projectId: "bootcampak-48e6f",
        storageBucket: "bootcampak-48e6f.appspot.com",
        messagingSenderId: "833308392906"
      };

    firebase.initializeApp(config);

    var database = firebase.database(); 

    const geocodingAPIkey = 'AIzaSyAVNZ2_elkGOvb8xXsyF5NSS9PQnW_Ze8k';
    const ticketmasterAPIkey = '1FADcqMEkzQiSakwUoKLPibod91GMG6g';
    let geoURL;
    let reverseGeoURL;
    let radius = 15;
    let size = 10;
    let maxPages = (1000 / size) - 1;
    let unit = 'miles';
    let today = getToday();
    let weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    let DOM = {
        inputLocation: $('#cityInput'),
        searchButton: $('#searchBtn'),
        container: $('.container'),
        results: $('#results'),
        pagesTop: $('#pages-top'),
        pagesBottom: $('#pages-bottom'),
        events: $('#events')
    }

    DOM.searchButton.on('click', function () {
        event.preventDefault();
        let input = DOM.inputLocation.val().trim();

        getCoords(input).then(function (coords) {
            let ticketURL = "https://app.ticketmaster.com/discovery/v2/events.json?latlong=" + coords + "&startDateTime=" + today + "T14:00:00Z&sort=date,asc&radius=" + radius + "&unit=" + unit + "&size=" + size + "&classificationName=music&apikey=" + ticketmasterAPIkey;
            getEvents(ticketURL).then(function (result) {
                if (result._embedded !== undefined) {
                    displayPgBtns(result, DOM.pagesTop);
                    displayResults(result, DOM.events);
                    displayPgBtns(result, DOM.pagesBottom);
                }
                else {
                    getArea(coords).then(function(area){
                        DOM.events.html("No events found near " + area + ". Try refining your search. It's possible Ticketmaster may not be available in this area.");
                    });
                }
            });
        });
    });

    function displayPgBtns(result, div) {
        if (result._links.first.href !== result._links.last.href) {
            let firstURL = "https://app.ticketmaster.com" + result._links.first.href + "&apikey=" + ticketmasterAPIkey;
            let selfURL = "https://app.ticketmaster.com" + result._links.self.href + "&apikey=" + ticketmasterAPIkey;
            let lastURL = "https://app.ticketmaster.com" + result._links.last.href + "&apikey=" + ticketmasterAPIkey;

            let genericURL = createGenericURL(firstURL);

            let maxURL = getMaxURL(lastURL);
            let maxPgNum = getPageNum(maxURL) + 1;

            let currentPgNum = getPageNum(selfURL) + 1;

            div.html('');

            if (currentPgNum <= 5) {
                let i = 0;
                let j = Math.min(7,maxPgNum);
                do {
                        let pgBtn = createPageBtn(i + 1, genericURL + '&page=' + i);
                        styleCurrentBtn(pgBtn, currentPgNum);
                        div.append(pgBtn);
                        i++;
                } while (i < j);
                if (j !== maxPgNum) {
                let ellipseBtn2 = createFakeBtn('...');
                div.append(ellipseBtn2);
                let maxPgBtn = createPageBtn(maxPgNum, maxURL);
                div.append(maxPgBtn);
                }
            }
            else if (maxPgNum - currentPgNum <= 5) {
                let firstPgBtn = createPageBtn('1', firstURL);
                div.append(firstPgBtn);
                let ellipseBtn1 = createFakeBtn('...');
                div.append(ellipseBtn1);
                let i =7;
                do {
                    let pgBtn = createPageBtn(maxPgNum - i + 1, genericURL + '&page=' + (maxPgNum - i));
                    styleCurrentBtn(pgBtn, currentPgNum);
                    div.append(pgBtn);
                    i--;
                } while (i > 0);
            }
            else {
                let firstPgBtn = createPageBtn('1', firstURL);
                div.append(firstPgBtn);
                let ellipseBtn1 = createFakeBtn('...');
                div.append(ellipseBtn1);
                for (let i = 0; i < 5; i++) {
                    let pgBtn = createPageBtn(currentPgNum + i - 2, genericURL + '&page=' + (currentPgNum + i - 3));
                    styleCurrentBtn(pgBtn, currentPgNum);
                    div.append(pgBtn);
                }
                let ellipseBtn2 = createFakeBtn('...');
                div.append(ellipseBtn2);
                let maxPgBtn = createPageBtn(maxPgNum, maxURL);
                div.append(maxPgBtn);
            }
        }
    }

    function displayResults(result, div) {
        div.empty();
        for (let i = 0; i < result._embedded.events.length; i++) {

            let thisEvent = result._embedded.events[i];
            let attractions = thisEvent._embedded.attractions;
            if (attractions !== undefined) {
                for (let j = 0; j < attractions.length; j++) {

                    const artistName = attractions[j].name;
                    const genreSummary = createGenreSummary(thisEvent);
                    const venueSummary = createVenueSummary(thisEvent);
                    const dateSummary = createDateSummary(thisEvent);
                    const priceSummary = createPriceSummary(thisEvent);
                    const ticketLink = thisEvent.url;

                    const time = convertTime(thisEvent.dates.start.localTime);

                    spotifyData(artistName, venueSummary, dateSummary, priceSummary, ticketLink, time);

    

                }
            }
        }
    }

    function styleCurrentBtn(button, currentPgNum) {
        if (button.text() == currentPgNum) {
            button.attr('style', 'background-color:cyan');
        }
    }

    function createGenericURL(url) {
        let startLocat = url.indexOf('page=');
        let subStr = url.substring(startLocat, url.length);
        let subLocat = subStr.indexOf('&');
        return genericURL = url.substring(0, startLocat) + url.substring(startLocat + subLocat, url.length);
    }

    function getPageNum(url) {
        let startLocat = url.indexOf('page=');
        if (startLocat === -1) {
            return 0;
        }
        let subStr = url.substring(startLocat, url.length);
        let subLocat = subStr.indexOf('&');
        let pgNum = parseInt(subStr.substring(5, subLocat));
        return pgNum;
    }

    function getMaxURL(lastURL) {
        let startLocat = lastURL.indexOf('page=');
        let subStr = lastURL.substring(startLocat, lastURL.length);
        let subLocat = subStr.indexOf('&');
        let lastPgNum = parseInt(subStr.substring(5, subLocat));
        let maxURL = lastURL.substring(0, startLocat) + 'page=' + Math.min(lastPgNum, maxPages) + lastURL.substring(startLocat + subLocat, lastURL.length);
        return maxURL;
    }

    // creates a page button that doesn't include a function
    // e.g. for current page or '...'
    function createFakeBtn(text) {
        let newBtn = $('<button>');
        newBtn.text(text);
        return newBtn;
    }

    function createPageBtn(text, url) {
        let newBtn = $('<button>');
        newBtn.text(text);
        newBtn.on('click', function () {
            event.preventDefault();
            getEvents(url).then(function (result) {
                displayPgBtns(result, DOM.pagesTop);
                displayResults(result, DOM.events);
                displayPgBtns(result, DOM.pagesBottom);
                document.body.scrollTop = document.documentElement.scrollTop = 0;
            });
        });
        return newBtn;
    }

    function getToday() {
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1;
        var yyyy = today.getFullYear();

        if (dd < 10) {
            dd = '0' + dd;
        }
        if (mm < 10) {
            mm = '0' + mm;
        }
        today = yyyy + '-' + mm + '-' + dd;
        return today;
    }

    function convertTime(string) {
        let hour = parseInt(string.substring(0, 2));
        let tail;
        if (hour < 12) {
            tail = 'AM';
        }
        else {
            if (hour > 12) {
                hour -= 12;
            }
            tail = 'PM';
        }
        let short = hour + string.substring(2, string.length - 3);

        return short + tail;
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

    function createSpan(content, className) {
        let newSpan = $('<span>');
        newSpan.addClass(className);
        newSpan.html(content);
        return newSpan;
    }

    function openInNewTab(url) {
        let win = window.open(url, '_blank');
        win.focus();
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

    function createDateSummary(event) {
        let dateString = event.dates.start.localDate;
        let format = "YYYY-MM-DD";
        let convertedDate = moment(dateString, format);
        let newDate = new Date(convertedDate.format("MMM DD, YYYY"))
        let weekDay = weekdays[newDate.getDay()];
        let newDateString = convertedDate.format("MMM Do, YYYY")
        return weekDay + ', ' + newDateString;
    }

    function createPriceSummary(event) {
        if (event.priceRanges !== undefined) {
            const priceData = event.priceRanges[0];
            const min = priceData.min;
            const max = priceData.max;
            const currency = priceData.currency;
            const minCurrency = OSREC.CurrencyFormatter.format(min, { currency: currency });
            const maxCurrency = OSREC.CurrencyFormatter.format(max, { currency: currency });
            if (min === max) {
                return 'Price: ' + minCurrency;
            }
            else {
                return 'Price Range: ' + minCurrency + ' - ' + maxCurrency;
            }
        }
        else {
            return 'Price: N/A';
        }
    }

    function createGenreSummary(event) {
        let classification = event.classifications[0];
        let genreSummary;
        const genre = classification.genre;
        const subGenre = classification.subGenre;
        if (genre !== undefined && genre.name !== 'Undefined') {
            if (subGenre !== undefined && subGenre.name !== 'Undefined' && genre.name !== subGenre.name) {
                const subGenreName = classification.subGenre.name;
                genreSummary = genre.name + ' / ' + subGenre.name;
            }
            else {
                genreSummary = genre.name;
            }
        }
        else {
            genreSummary = "";
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

    async function getArea(coords) {
        reverseGeoURL = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + coords + "&key=" + geocodingAPIkey;

        const response = await $.ajax({
            url: reverseGeoURL,
            method: "GET"
        });
        for (let i= 0; i < response.results.length; i++) {
            for (let j = 0; j < response.results[i].types.length; j++) {
                if (response.results[i].types[j] === 'administrative_area_level_2') {
                    return response.results[i].formatted_address;
                }
            }
        }
    }

    async function getEvents(url) {

        const response = await $.ajax({
            type: "GET",
            url: url,
            async: true,
            dataType: "json"
        });
        return response;
    }
    
    var allArtists = [];
    var token = 'BQAgomWbGBDJi3GlEGkJ2tYZz0RZAxNDlBRZ_4YP0tEiKzTlcz3vHhsEIqgSad0zQLlUierhlXlvRINi-CQ';

    // spotify API calls
    var spotifyData = function(artist, venueSummary, dateSummary, priceSummary, ticketLink, time) {
        console.log(token);
        $.ajax({
        url: `https://api.spotify.com/v1/search?q=${artist}&type=artist&limit=50`,
        method:"GET",
        headers: {'Authorization':`Bearer ${token}`},
        }).then(function(response) {
            
            console.log(response);
    
            var thisArtist = {
                name: '',
                followers: 0,
                iden: '',
                topTracks: [],
                venueSummary: '',
                dateSummary: '',
                priceSummary: '',
                ticketLink: '',
                time: ''
            };
    
            if (response.artists.items.length === 0) {
                thisArtist.name = 'Artist not in Spotify';
                thisArtist.cover = ''; // insert picture of the right dimensions
                thisArtist.followers = 'follower data not available';
                thisArtist.iden = '';
                thisArtist.topTracks.push('No top songs to display');
                console.log("empty!!");
    
                allArtists.push(thisArtist);
                
            } else {
                thisArtist.name = response.artists.items[0].name;
                thisArtist.cover = response.artists.items[0].images[2].url;
                thisArtist.followers = response.artists.items[0].followers.total;
                thisArtist.iden = response.artists.items[0].id;
                thisArtist.venueSummary = venueSummary,
                thisArtist.dateSummary = dateSummary,
                thisArtist.priceSummary = priceSummary,
                thisArtist.ticketLink = ticketLink,
                thisArtist.time = time
    
                $.ajax({
                    url: `https://api.spotify.com/v1/artists/${thisArtist.iden}/top-tracks?country=US`,
                    method:"GET",
                    headers: {'Authorization':`Bearer ${token}`},
                }).then(function(response) {
                    console.log(response);
                    for (i=0; i<5; i++) {
                        currentSong = response.tracks[i].name;
                        // currentSong = currentSong.substring(0, currentSong.length - 1);
                        thisArtist.topTracks.push(currentSong);
                    }
        
                    // pushing artist object to allArtists object
                    allArtists.push(thisArtist);
    
                    database.ref('/artists').push(thisArtist);
        
            
                });
            }
    
    
        
    
        });
    
    
    
    };

    var numberWithCommas = function(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    database.ref('/artists').on("child_added", function(childSnapshot) {
        console.log(childSnapshot.val());
        var name = childSnapshot.val().name;
        var followers = childSnapshot.val().followers;
        var cover = childSnapshot.val().cover;
        var topTracks = childSnapshot.val().topTracks;
        var venueSummary = childSnapshot.val().venueSummary;
        var dateSummary = childSnapshot.val().dateSummary;
        var priceSummary = childSnapshot.val().priceSummary;
        var ticketLink = childSnapshot.val().ticketLink;
        var time = childSnapshot.val().time;

    
        var newArtist = $("<div>");
        $(newArtist).html(`
        <p><b>Artist Name: </b><span id="name">${name}</span></p> 
        <p><b>Followers: </b><span id="followers">${numberWithCommas(followers)}</span> </p>
        <p><b>Album Cover:</b><span id="cover"><img src='${cover}'></span> </p>
        <p><b>Venue Summary:</b><span id="cover">${venueSummary}</span> </p>
        <p><b>Date Summary:</b><span id="cover">${dateSummary}</span> </p>
        <p><b>Price Summary:</b><span id="cover">${priceSummary}</span> </p>
        <p><b>Ticket Link:</b><span id="cover">${ticketLink}</span> </p>
        <p><b>Time:</b><span id="cover">${time}</span> </p>
        <table class="table table-hover" id='tracks-table'>
            <thead class='thead-dark'>
                <tr>
                <th scope="col">Top Songs</th>
                </tr>
            </thead>
            <tbody>
            </tbody>
        </table>
        `)
    
        for (i=0; i < topTracks.length; i++) {
            var newRow = "<tr><td>"+topTracks[i];
            $("#tracks-table > tbody").append(newRow);
        }
    
        // console.log(topTracks);
        $('#events').append(newArtist);
    })

    // EXAMPLE URLS FOR API DATA
    // GOOGLE GEOCODE
    // https://maps.googleapis.com/maps/api/geocode/json?address=1600+Amphitheatre+Parkway,+Mountain+View,+CA&key=AIzaSyAVNZ2_elkGOvb8xXsyF5NSS9PQnW_Ze8k
    //  https://maps.googleapis.com/maps/api/geocode/json?address=22201&key=AIzaSyAVNZ2_elkGOvb8xXsyF5NSS9PQnW_Ze8k

    // TICKETMASTER
    // https://app.ticketmaster.com/discovery/v2/events.json?latlong=38.839787,-77.061339&radius=10&unit=miles&size=200&stateCode=VA&countryCode=US&apikey=1FADcqMEkzQiSakwUoKLPibod91GMG6g
    // https://app.ticketmaster.com/discovery/v2/events.json?latlong=32.735687,-97.10806559999999&radius=20&unit=miles&size=20&classificationName=music&apikey=1FADcqMEkzQiSakwUoKLPibod91GMG6g

    // possible app name - Earshot? or Nearshot?
});