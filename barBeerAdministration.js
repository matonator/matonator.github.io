var testbar = firebase.database().ref("bars/-L5oBxUij8JVRfAmVAdE");
var testbarBeers = firebase.database().ref("bars/-L5oBxUij8JVRfAmVAdE/beers")
var beers = firebase.database().ref("beers");
var types = firebase.database().ref("types");
var beerData = [];
var bars = firebase.database().ref("bars");
var today = new Date();

/*
var bar = bars.push()

"-L5oCxSpgJTmddjTErGe" nealko
"-L5oCuC6JEPW6u_ZOpa1" : special
"-L5oCrflGJgPRNGOgj6c" : tmavy leziak
-L5oCodyU87NaKMu06u7 : tmavy leziak
"-L5oClnBLCgHHTQkh43-"  leziak
-L5oCioAiwcw8hGjcyqg leziak
-L5oCgBPKtmpGld3qKyj nealko


bar.set({
	"address" : "Joštova 4",
      "attributes" : {
        "card" : true,
        "dogs" : false,
        "food" : false,
        "wifi" : false
      },
      "beers" : {
        "-L5oCuC6JEPW6u_ZOpa1" : {
          "type" : "špeciál"
        },
        "-L5oCodyU87NaKMu06u7" : {
          "type" : "tmavý ležiak"
        },
        "-L5oCrflGJgPRNGOgj6c" : {
          "type" : "tmavý ležiak"
        },
        "-L5oClnBLCgHHTQkh43-" : {
          "type" : "ležiak"
        },
        "-L5oCioAiwcw8hGjcyqg" : {
          "type" : "ležiak"
        },
        "-L5oCgBPKtmpGld3qKyj" : {
          "type" : "nealko"
        },
        "-L5oCxSpgJTmddjTErGe" : {
          "type" : "nealko"
        }
      },
      "hours" : [ {
        "from" : "10:00",
        "opened" : true,
        "to" : "22:00"
      }, {
        "from" : "10:00",
        "opened" : true,
        "to" : "21:00"
      }, {
        "from" : "10:00",
        "opened" : true,
        "to" : "21:00"
      }, {
        "from" : "10:00",
        "opened" : true,
        "to" : "22:00"
      }, {
        "from" : "10:00",
        "opened" : true,
        "to" : "22:00"
      }, {
        "from" : "12:00",
        "opened" : true,
        "to" : "24:00"
      }, {
        "from" : "12:00",
        "opened" : true,
        "to" : "24:00"
      } ],
      "lat" : 49.197770,
      "lon" : 16.605932,
      "name" : "U lva",
      "phone" : "+420 533 187 791",
      "rating" : -2.5,
      "ratings" : {
        "count" : 20,
        "total" : 50
      },
      "web" : "www.ulva.cz"
    
})
*/
(function loadBeers(){
	testbarBeers.once("value").then(function(snapshot){
		snapshot.forEach(function(beer){
			beerData.push(beer.key);
		});
	});
}());

var loaderDraftBeers = document.getElementById("loaderDraftBeers");
var loaderBottleBeers = document.getElementById("loaderBottleBeers");
(function beerListWriter(){
	testbarBeers.once("value").then(function(snapshot){
		loaderDraftBeers.style.display = "none";
		loaderBottleBeers.style.display = "none";
		snapshot.forEach(function(beer){
			var s = "beers/" + beer.key;
			var beerDB = firebase.database().ref(s);
			beerDB.once("value").then(function(snapshot) {
				beerItemCreator(snapshot)
			});
		});
	});
	
}());

var beerWarningMessage = document.getElementById("warningMessageDiv");
var searcher = document.getElementById("beerSearcher");
var results = document.getElementById("searchResults");
var timeout = null;
searcher.addEventListener("input", search);

document.addEventListener('click', function(event) {
  var click = searcher.contains(event.target);
  if (!click) {
    results.style.display = "none";
  }
});

function search(){
	var value = searcher.value.toUpperCase();
	clearTimeout(timeout);
	timeout = setTimeout(function () {
		if(value == null || value == ""){
			results.style.display = "none";
		} else{
			results.innerHTML = "";
			beers.once("value").then(function(snapshot) {
				snapshot.forEach(function(childSnapshot) {
					var brand = childSnapshot.child("brand").val();
					var name = childSnapshot.child("name").val();
					var key = childSnapshot.key;
					if (brand.toUpperCase().startsWith(value) || name.toUpperCase().startsWith(value)) {
						var plato = childSnapshot.child("p").val();
						var type = childSnapshot.child("type").val();
						var draft = childSnapshot.child("draft").val();
						var keyPush = String(key);
						var typePush = String(type);
						if (draft){
							type = type + " (čap.)"
						} else{
							type = type + " (fľaš.)"
						}
						results.style.display = "block";
						var beerItem = createDiv("result-item");
						beerItem.innerHTML = brand + ' ' + name + ' ' + plato + '°' + " - " + type;
						results.appendChild(beerItem);
						beerItem.onclick = function(){
							searcher.value = "";
							var data={keyPush: typePush}
							var updates = {};
  							updates['/beers/'] = data;
  							var index = beerData.indexOf(keyPush);
  							if(index > -1){
								warningMessageContainer.style.display = "flex";
								window.onclick = function(event) {
	    							if (event.target == warningMessageContainer) {
	    								warningMessageContainer.style.display = "none"
	    								searcher.focus();
	    							}
								}
								document.getElementById("xDiv").onclick = function(){
									warningMessageContainer.style.display = "none"
									searcher.focus();
								}
  							} else{
  								beerData.push(keyPush)
  								beerItemCreator(childSnapshot);
  								testbarBeers.child(keyPush).set({
									"type" : typePush
								})
								testbar.update({
									"beerActualisation" : actualisationDate
								})
  							}
							
						}
					}
				});
			});
		}
	}, 200);
		
}

var actualisationDate = today.getDate() + "." + (today.getMonth() + 1) + ". " + today.getFullYear();

function beerItemCreator(snapshot){
	var beerItemDiv = createDiv("beerItemDiv");
	var beer = createDiv("beer");
	var beerRemover = createDiv("beerRemover");
	beerItemDiv.id = snapshot.key;
	beer.innerHTML = snapshot.child('brand').val() + " " + snapshot.child('name').val() + " " + snapshot.child('p').val() + "°";
	beerRemover.innerHTML = "<img src='pictograms/beerRemover.png' height='13px' width='13px'>";
	beerItemDiv.appendChild(beerRemover);
	beerItemDiv.appendChild(beer);
	if(snapshot.child("draft").val()){
		draftBeersContainer.appendChild(beerItemDiv);
	} else{
		bottleBeersContainer.appendChild(beerItemDiv);
	}
	beerRemover.onclick = function(){
		if(snapshot.child("draft").val()){
			draftBeersContainer.removeChild(beerItemDiv);
		} else{
			bottleBeersContainer.removeChild(beerItemDiv);
		}
		var index = beerData.indexOf(snapshot.key);
		if (index > -1) {
    		beerData.splice(index, 1);
		}
		testbarBeers.child(snapshot.key).remove();
		testbar.update({
			"beerActualisation" : actualisationDate
		})

	}
}

var addBeerButton = document.getElementById("addBeerButton");

addBeerButton.onclick = function(){
	var brewery = document.getElementById("brewery");
	var beerName = document.getElementById("beerName");
	var plato = document.getElementById("plato");
	if(brewery.value == null || brewery.value == "" || plato.value == null || plato.value == ""){

	} else {
		var name = beerName.value;
		var draft = true;
		var type = document.getElementById("selectType").value;
		if(document.querySelector('input[name="isDraft"]:checked').value == "bottle"){
			draft = false;
		}
		if(name == null){
			name = ""
		}
		var newBeer = beers.push();
		newBeer.set({
			"brand": brewery.value,
			"draft": draft,
			"name": name,
			"p": plato.value,
			"type": type
		});
		var beerKey = newBeer.key;
		testbarBeers.child(beerKey).set({
			"type" : type
		})
		beerData.push(beerKey)
		var beerItemDiv = createDiv("beerItemDiv");
		var beer = createDiv("beer");
		var beerRemover = createDiv("beerRemover");
		beerItemDiv.id = beerKey;
		beer.innerHTML = brewery.value + " " + name + " " + plato.value + "°";
		beerRemover.innerHTML = "<img src='pictograms/beerRemover.png' height='13px' width='13px'>";
		beerItemDiv.appendChild(beerRemover);
		beerItemDiv.appendChild(beer);
		if(draft){
			draftBeersContainer.appendChild(beerItemDiv);
		} else{
			bottleBeersContainer.appendChild(beerItemDiv);
		}
		testbar.update({
			"beerActualisation" : actualisationDate
		})
		beerRemover.onclick = function(){
			if(draft){
				draftBeersContainer.removeChild(beerItemDiv);
			} else{
				bottleBeersContainer.removeChild(beerItemDiv);
			}
			var index = beerData.indexOf(beerKey);
			if (index > -1) {
	    		beerData.splice(index, 1);
			}
			testbarBeers.child(beerKey).remove();
			testbar.update({
				"beerActualisation" : actualisationDate
			})
		}
	}
}

function createDiv(name){
	var div = document.createElement("div");
	div.className = name;
	return div;
}





