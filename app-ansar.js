// - Spotify
// - function to make a API call
// - function to get band followers
// - function to get latest album cover for band
// - function to play top songs
// - function to authenticate user 

// https://stackoverflow.com/questions/32956443/invalid-redirect-uri-on-spotify-auth

// https://stackoverflow.com/questions/28389699/access-control-allow-origin-denied-spotify-api CORS error
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

// var artistName = 'eminem';
var token = 'BQC9aFGd3ndwmAx1YoXnvYTgx3PShb5kdt2d_pWEN5P0zIAnuaNJEihUANkitw13VAs3tjgTkgj7suPv_fU';
var allArtists = [];




var spotifyData = function(artist) {
    $.ajax({
    url: `https://api.spotify.com/v1/search?q=${artist}&type=artist&limit=10`,
    method:"GET",
    headers: {'Authorization':`Bearer ${token}`},
    }).then(function(response) {
        
        console.log(response);

        var thisArtist = {
            name: '',
            followers: 0,
            iden: '',
            topTracks: []
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


// UI

// regex to print commas for followers
var numberWithCommas = function(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}


// add an artist
$("#add").click(function() {
    var getArtist = $("#get-artist").val().trim();
    spotifyData(getArtist);

})

// function to remove text after "-" in title
var truncateTitle = function(str) {
    str = str.substring(0, str.indexOf('-'));
    return str
}

database.ref('/artists').on("child_added", function(childSnapshot) {
    console.log(childSnapshot.val());
    var name = childSnapshot.val().name;
    var followers = childSnapshot.val().followers;
    var cover = childSnapshot.val().cover;
    var topTracks = childSnapshot.val().topTracks;

    var newArtist = $("<div>");
    $(newArtist).html(`
    <p><b>Artist Name: </b><span id="name">${name}</span></p> 
    <p><b>Followers: </b><span id="followers">${numberWithCommas(followers)}</span> </p>
    <p><b>Album Cover:</b><span id="cover"><img src='${cover}'></span> </p>
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

    console.log(topTracks);
    $('#main-artist').append(newArtist);
})

thisArtist.name = response.artists.items[0].name;
thisArtist.cover = response.artists.items[0].images[2].url;
thisArtist.followers = response.artists.items[0].followers.total;
thisArtist.iden = response.artists.items[0].id;


thisArtist.venueSummary = venueSummary,
thisArtist.dateSummary = dateSummary,
thisArtist.priceSummary = priceSummary,
thisArtist.ticketLink = ticketLink,
thisArtist.time = time

// Extra

// var printArtists = function() {
//     $('#main-artist').empty();

//     var printList = function(arr) {
//         arr.forEach(element => {
//             printEle = `<li>${element}`;
//             // printEleF = printEle.substring(0, printEle.length - 1);
//             truncateTitle(printEle);
//             printTop.push(printEle);
//         });
//         return(printTop);
//     }

    

//     allArtists.forEach((element, index, val) => {
//         var newArtist = $("<div>");
//         $(newArtist).html(`
//         <p><b>Artist Name: </b><span id="name">${element.name}</span></p> 
//         <p><b>Followers: </b><span id="followers">${numberWithCommas(element.followers)}</span> </p>
//         <table class="table table-hover" id='train-table'>
//             <thead class='thead-dark'>
//                 <tr>
//                 <th scope="col">Top Songs</th>
//                 </tr>
//             </thead>
//             <tbody>
//             </tbody>
//         </table>

//         <p><b>Album Cover:</b><span id="cover"><img src='${element.cover}'></span> </p>
//         `);
//         $('#main-artist').append(newArtist);

//     });
// }


// implicit grant

// 'https://accounts.spotify.com/authorize?client_id=8a60777b279f46b8a9d4c902df38889e&redirect_uri=https:%2F%2Fansarkhan.github.io%2Fproject-1-setup%2Fcallback.html%2F&scope=user-read-private%20user-read-email&response_type=token'

//token for web player
// BQA2bMrjMwRy9GuLJCGBR7Lz1g_2gAfCerpYdskRQDOMVIN7TP6B85SHRoSuAlSl9tkbcoO3jlcDLR5Mgeyy6mFJXS1V2wHO8pHzqEmZqve1JntkX7gUddhn6iJ5Lm3B5SCq4yGvSMalOsInH7hTNXmzODkRk1PeG-G_