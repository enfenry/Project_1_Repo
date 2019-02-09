// firebase config info
var config = {
    apiKey: "AIzaSyAAcY2NfP7w8YTzprHrP77SGLAvMAi8c5c",
    authDomain: "bootcampak-48e6f.firebaseapp.com",
    databaseURL: "https://bootcampak-48e6f.firebaseio.com",
    projectId: "bootcampak-48e6f",
    storageBucket: "bootcampak-48e6f.appspot.com",
    messagingSenderId: "833308392906"
  };

// Initializing firebase
firebase.initializeApp(config);

var database = firebase.database(); 

// Spotify token (currently getting using Postman)
// var token = 'BQCEG_pclrgAeeVrLjvkrxiHrU6RsnohLAhd0rmdVsyWaU_THxgcFDIYMSErpiTvp0_2GoPWMugST9Sd3Nk';
var token = ''

// getting token from callback URL
if (window.location.pathname.includes('callback')) {
    console.log("you are on right page!");
    var url = window.location.href;
    var access_token = new URL(url).hash.split('&').filter(function(el) { if(el.match('access_token') !== null) return true; })[0].split('=')[1];
    access_token = {
        token: access_token
    }

    // updating token in firebase
    database.ref('/tokens').set(access_token);

}

// retrieving token
database.ref('/tokens').on("value", function(snapshot) {

    // Log everything that's coming out of snapshot
    console.log(snapshot.val());
    token = snapshot.val().token;
    console.log(token);
    // Handle the errors
  }, function(errorObject) {
    console.log("Errors handled: " + errorObject.code);
  });


// array to store all artists
var allArtists = [];



// API calls to search endpoint, using artist name
var spotifyData = function(artist) {
    $.ajax({
    url: `https://api.spotify.com/v1/search?q=${artist}&type=artist&limit=10`,
    method:"GET",
    headers: {'Authorization':`Bearer ${token}`},
    }).then(function(response) {
        
        console.log(response);

        // creating artist object
        var thisArtist = {
            name: '',
            followers: 0,
            iden: '',
            topTracks: [],
            topTracksPrint: []
        };

        // if artist information is not found in Spotify
        if (response.artists.items.length === 0) {
            thisArtist.name = 'Artist not in Spotify';
            thisArtist.cover = ''; // insert picture of the right dimensions
            thisArtist.followers = 'follower data not available';
            thisArtist.iden = '';
            thisArtist.topTracks.push('No top songs to display');

            // push artist to all artists array
            allArtists.push(thisArtist);
        
        // if artist is found in Spotify
        } else {
            thisArtist.name = response.artists.items[0].name;
            thisArtist.cover = response.artists.items[0].images[2].url;
            thisArtist.followers = response.artists.items[0].followers.total;
            thisArtist.iden = response.artists.items[0].id;

            // api call to artist endpoint, using artist ID
            $.ajax({
                url: `https://api.spotify.com/v1/artists/${thisArtist.iden}/top-tracks?country=US`,
                method:"GET",
                headers: {'Authorization':`Bearer ${token}`},
            }).then(function(response) {
                console.log(response);

                // looping over top tracks and putting them in an array
                for (i=0; i<5; i++) {
                    currentSong = response.tracks[i].name;
                    // currentSong = currentSong.substring(0, currentSong.length - 1);
                    thisArtist.topTracks.push(currentSong);
                }

                // adding html to top tracks, table printing  
                for (i=0; i < thisArtist.topTracks.length; i++) {
                    var newRow = "<tr><td>"+thisArtist.topTracks[i];
                    thisArtist.topTracksPrint.push(newRow);
                }
    
                // pushing artist object to allArtists object
                allArtists.push(thisArtist);

                // pusing to firebase
                database.ref('/artists').push(thisArtist);
    
        
            });
        }


    

    });



};


// UI

// regex to print thousand separators
var numberWithCommas = function(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}


// add an artist
$("#add").click(function() {
    var getArtist = $("#get-artist").val().trim();
    spotifyData(getArtist);

})

// printing all artists using firebase
database.ref('/artists').on("child_added", function(childSnapshot) {
    console.log(childSnapshot.val());

    var name = childSnapshot.val().name;
    var followers = childSnapshot.val().followers;
    var cover = childSnapshot.val().cover;
    var topTracks = childSnapshot.val().topTracks;
    var topTracksPrint = childSnapshot.val().topTracksPrint;

    var newArtist = $("<div>");
    $(newArtist).html(`
    <p><b>Artist Name: </b><span id="name">${name}</span></p> 
    <p><b>Followers: </b><span id="followers">${numberWithCommas(followers)}</span> </p>
    <p><b>Album Cover:</b><span id="cover"><img src='${cover}'></span> </p>
    <table class="table table-sm table-hover" id='tracks-table'>
        <thead class='thead-dark'>
            <tr>
            <th scope="col">Top Songs</th>
            </tr>
        </thead>
        <tbody>
            ${topTracksPrint.join("")};
        </tbody>
    </table>
    `)

    $('#main-artist').append(newArtist);
})

// - to do
//     - implicit login vs token // USE HEROKU
//         - token will have to be manually refreshed
//         - implicit requires callback page
//     - What to show if artist is not available in Spotify database? - DONE
//     - Web player
//     - list of top tracks - DONE
//     - pushing to firebase? - DONE
//     - error handling - DONE
//     - organizing code - DONE
//     - store favorites


// implicit grant

// 'https://accounts.spotify.com/authorize?client_id=8a60777b279f46b8a9d4c902df38889e&redirect_uri=https:%2F%2Fansarkhan.github.io%2Fproject-1-setup%2Fcallback%2F&scope=user-read-private%20user-read-email&response_type=token'

//token for web player
// BQA2bMrjMwRy9GuLJCGBR7Lz1g_2gAfCerpYdskRQDOMVIN7TP6B85SHRoSuAlSl9tkbcoO3jlcDLR5Mgeyy6mFJXS1V2wHO8pHzqEmZqve1JntkX7gUddhn6iJ5Lm3B5SCq4yGvSMalOsInH7hTNXmzODkRk1PeG-G_