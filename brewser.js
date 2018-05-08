var bars = firebase.database().ref("bars").orderByChild("rating");
var beers = firebase.database().ref("beers").orderByChild("brand");
var types = firebase.database().ref("types");
var today = new Date();
var myMap = L.map('map').setView([49.197060, 16.611837], 13);
var searchValue;
var searchType;
var barResult = false;
var markers = L.markerClusterGroup({
	showCoverageOnHover: false,
	maxClusterRadius: 60,
});
var resultText = document.getElementById("resultText");
var loaderBars = document.getElementById("loaderBars");

var IP;
/*
	funkcia vrati IP adresu zariadenia, ktora sluzi pri hodnoteni podniku
*/
function getIP(json) {
    var dIP = json.ip;
    IP = dIP.split('.').join('dot');
}

L.tileLayer('https://api.mapbox.com/styles/v1/matonator/cjd1izzzd2ief2smdribefn36/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWF0b25hdG9yIiwiYSI6ImNqYXBldDZpMjByOWQyeHBmZG0zZ2V5Y2IifQ.ggo9fPdzc6mkotN1eicbMQ', {
    attribution: 'BrewserMap',
    minZoom: 11,
    maxZoom: 20,
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1IjoibWF0b25hdG9yIiwiYSI6ImNqYXBldDZpMjByOWQyeHBmZG0zZ2V5Y2IifQ.ggo9fPdzc6mkotN1eicbMQ'
}).addTo(myMap);

var beerIcon = L.icon({
    iconUrl: 'pictograms/beer10.png',
    iconSize:     [20, 40], 
    iconAnchor:   [12, 39], 
    popupAnchor:  [-2, -38]
});

function popUp(snapshot){
	var rating = Math.floor((-1) * snapshot.child("rating").val())
	var remainderRating = Math.round(10 * ((-1) * snapshot.child("rating").val() - rating));

	var popup = createDiv("popup");
	var popupContent = createDiv("popupContent");
	var popupPicture = createDiv("popupPicture");

	popupPicture.innerHTML = "<img src=\"barimages/" + snapshot.key + ".jpg\" width=\"195px\" height=\"195px\">";
	
	var popupInfo = createDiv("popupInfo");
	var popupNameRatingContainer = createDiv("popupNameRatingContainer");
	var popupInfoLeftContainer = createDiv("popupInfoLeftContainer");
	var popupHours = createDiv("popupHours");
	var barHours = [];
	for(i = 0; i < 7; i++){
		if(snapshot.child("hours").child(i).child("opened").val()){
			barHours[i] = snapshot.child("hours").child(i).child("from").val() + " - " + snapshot.child("hours").child(i).child("to").val()
		} else barHours[i] = "Zatvorené";
	}

	popupHours.insertAdjacentHTML('beforeend', "<div class='popupHoursDays'><b>PO:</b> &nbsp &nbsp</div><div class='popupHoursValues'>" + barHours[1] + "</div><div class='popupHoursDays'><b>UT:</b> &nbsp &nbsp</div><div class='popupHoursValues'>" + barHours[2] + "</div><div class='popupHoursDays'><b>ST:</b> &nbsp &nbsp</div><div class='popupHoursValues'>" + barHours[3] + "</div><div class='popupHoursDays'><b>ŠT:</b> &nbsp &nbsp</div><div class='popupHoursValues'>" + barHours[4] + "</div><div class='popupHoursDays'><b>PI:</b> &nbsp &nbsp</div><div class='popupHoursValues'>" + barHours[5] + "</div><div class='popupHoursDays'><b>SO:</b> &nbsp &nbsp</div><div class='popupHoursValues'>" + barHours[6] +  "</div><div class='popupHoursDays'><b>NE:</b> &nbsp &nbsp</div><div class='popupHoursValues'>" + barHours[0] + "</div>");
	(popupName = createDiv("popupName")).innerHTML = snapshot.child("name").val();
	popupNameRatingContainer.appendChild(popupName);
	var barRating = createDiv("barRating");
	var ratingArray = [];
	for (i = 0; i < rating; i++) { 
		var barFullBeerRating = createDiv("beerRatingPictogram");
		ratingArray.push(barFullBeerRating);
		barFullBeerRating.innerHTML = "<img src=\"pictograms/beer10.png\" width=\"10px\" height=\"20px\">";
		barRating.appendChild(barFullBeerRating);
	}

	var barRemainderBeerRating = createDiv("beerRatingPictogram");
	ratingArray.push(barRemainderBeerRating);
	barRemainderBeerRating.innerHTML = "<img src=\"pictograms/beer" + remainderRating + ".png\" width=\"10px\" height=\"20px\">";
	barRating.appendChild(barRemainderBeerRating);

	for (i = 0; i < (4 - rating); i++) { 
		var barEmptyBeerRating = createDiv("beerRatingPictogram");
		ratingArray.push(barEmptyBeerRating);
		barEmptyBeerRating.innerHTML = "<img src=\"pictograms/beer0.png\" width=\"10px\" height=\"20px\">";
		barRating.appendChild(barEmptyBeerRating);
	}
	var barRatingText = createDiv("barRatingText");
	if(snapshot.child("ratings").child(IP).val() == null){
		barRatingText.innerHTML = "(nehodnotené)";
		ratingHover(ratingArray);
		ratingArray[0].onclick = function(){
			rater(barRatingText, 1, snapshot, barRating);
		}
		ratingArray[1].onclick = function(){
			rater(barRatingText, 2, snapshot, barRating);
		}
		ratingArray[2].onclick = function(){
			rater(barRatingText, 3, snapshot, barRating);
		}
		ratingArray[3].onclick = function(){
			rater(barRatingText, 4, snapshot, barRating);
		}
		ratingArray[4].onclick = function(){
			rater(barRatingText, 5, snapshot, barRating);
		}
	} else{
		barRatingText.innerHTML = "(hodnotené <b>" + snapshot.child("ratings").child(IP).child("rating").val() + ",0</b>)";
	}
	barRating.appendChild(barRatingText);
	popupNameRatingContainer.appendChild(barRating);
	(barRatingSquare = createDiv("barRatingSquare")).innerHTML = rating + "," + remainderRating;
	if(rating >= 4){
		barRatingSquare.style.borderColor = "rgb(55, 145, 27)"
		barRatingSquare.style.color = "rgb(55, 145, 27)"
	} else if(rating >= 2){
		barRatingSquare.style.borderColor = "rgb(239, 130, 40)"
		barRatingSquare.style.color = "rgb(239, 130, 40)"
	}
	popupNameRatingContainer.appendChild(barRatingSquare);
	(popupRatingCount = createDiv("popupRatingCount")).innerHTML = "(" + snapshot.child("count").val() + " hodnotení)";
	popupNameRatingContainer.appendChild(popupRatingCount);

	var popupAddress = "<div class='popupPictogram'><img src=\"pictograms/addressColorRed.png\" width=\"15px\" height=\"15px\"></div><div class = 'popupInfoSlot'>" + snapshot.child("address").val() + "</div>";

	var popupWeb = "<div class='popupPictogram'><img src=\"pictograms/webColorRed.png\" width=\"15px\" height=\"15px\"></div><div class = 'popupInfoSlot'>" + snapshot.child("web").val() + "</div>";

	var popupPhone = "<div class='popupPictogram'><img src=\"pictograms/phoneColorRed.png\" width=\"15px\" height=\"15px\"></div><div class = 'popupInfoSlot'>" + snapshot.child("phone").val() + "</div>";

	var popupAttributes = createDiv("popupAttributes");

	var popupAttributesCard = createDiv("popupAttributesIcon");
	if(!snapshot.child("attributes").child("card").val()){
		popupAttributesCard.style.opacity = 0.3;
	}
	popupAttributesCard.innerHTML = "<img src=\"pictograms/card.png\" width=\"25px\" height=\"25px\" title='Platba kartou'>"
	popupAttributes.appendChild(popupAttributesCard);

	var popupAttributesFood = createDiv("popupAttributesIcon");
	if(!snapshot.child("attributes").child("food").val()){
		popupAttributesFood.style.opacity = 0.3;
	}
	popupAttributesFood.innerHTML = "<img src=\"pictograms/food.png\" width=\"25px\" height=\"25px\" title='Varia jedlo'>"
	popupAttributes.appendChild(popupAttributesFood);

	var popupAttributesWifi = createDiv("popupAttributesIcon");
	if(!snapshot.child("attributes").child("wifi").val()){
		popupAttributesWifi.style.opacity = 0.3;
	}
	popupAttributesWifi.innerHTML = "<img src=\"pictograms/wifi.png\" width=\"25px\" height=\"25px\" title='Internet'>"
	popupAttributes.appendChild(popupAttributesWifi);

	var popupAttributesDog = createDiv("popupAttributesIcon");
	if(!snapshot.child("attributes").child("dogs").val()){
		popupAttributesDog.style.opacity = 0.3;
	}
	popupAttributesDog.innerHTML = "<img src=\"pictograms/dog.png\" width=\"25px\" height=\"25px\" title='Psi su vitané'>"
	popupAttributes.appendChild(popupAttributesDog);

	popupInfoLeftContainer.insertAdjacentHTML('beforeend', popupAddress);
	popupInfoLeftContainer.insertAdjacentHTML('beforeend', popupWeb);
	popupInfoLeftContainer.insertAdjacentHTML('beforeend', popupPhone);
	popupInfoLeftContainer.appendChild(popupAttributes);

	popupInfo.appendChild(popupNameRatingContainer);
	popupInfo.appendChild(popupHours);	
	popupInfo.appendChild(popupInfoLeftContainer);
	
	var popupBeerMenuContainer = createDiv("popupBeerMenuContainer");
	var popupDraftBeersTop = createDiv("popupBeersTop");
	popupDraftBeersTop.innerHTML = "Čapované pivá";
	var popupBottleBeersTop = createDiv("popupBeersTop");
	popupBottleBeersTop.innerHTML = "Fľaškové pivá";	
	var popupDraftBeersContainer = createDiv("popupDraftBeersContainer");
	var popupBottleBeersContainer = createDiv("popupBottleBeersContainer");
	var path = "bars/" + snapshot.key + "/beers" 
	var beerDataRef = firebase.database().ref(path)
	beerDataRef.once("value").then(function(snap){
		snap.forEach(function(childSnapshot){
			var s = "beers/" + childSnapshot.key;
			var beerDB = firebase.database().ref(s);
			beerDB.once("value").then(function(snapshot) {
				var draft = snapshot.child("draft").val();
				var beerDiv = createDiv("popupBeerDiv");
				var popupBeer = createDiv("popupBeer");
				var brand = snapshot.child('brand').val()
				var name = snapshot.child('name').val();
				var plato = snapshot.child('p').val();
				var type = snapshot.child("type").val();
				popupBeer.onclick = function(){
					popup.parentNode.removeChild(popup);
					myMap.setView([49.197060, 16.611837], 13);				
					searchValue = snapshot.key;
					searchType = "beer";
					barResult = false;
					document.getElementById("searchRemoverContainer").style.display = "block";
					markers.clearLayers();
					document.getElementById("searcher").value = brand + ' ' + name + ' ' + plato + '°' + " - " + type;
					document.getElementById("barsResults").innerHTML = "";

					if(draft){
						resultText.innerHTML = "V zadanej lokalite sa zobrazujú bary, ktoré čapujú - \xa0 <b>" + brand + ' ' + name + ' ' + plato + '°' + "</b>:"
					} else{
						resultText.innerHTML = "V zadanej lokalite sa zobrazujú bary, ktoré majú fľaškové pivo -  \xa0 <b>" + brand + ' ' + name + ' ' + plato + '°' + "</b>:"
					}
					setTimeout(function(){
						refresh()
					}, 300);
					
				}
				popupBeer.innerHTML = "<b>" + brand + "</b> " + name + " " + plato + "°" + " " + "(" + type + ")"
				beerDiv.appendChild(popupBeer)
	    		if(draft){
	    			popupDraftBeersContainer.appendChild(beerDiv);
	    		} else{
	    			popupBottleBeersContainer.appendChild(beerDiv);
	    		}
	    		
	    	});
	    });
  	});
	var popupBeerActualisationDate = createDiv("popupBeerActualisationDate");
	popupBeerActualisationDate.innerHTML = "Aktualizované " + snapshot.child("beerActualisation").val();
	popupContent.appendChild(popupPicture);
	popupContent.appendChild(popupInfo);
	popupBeerMenuContainer.appendChild(popupDraftBeersTop);
	popupBeerMenuContainer.appendChild(popupBottleBeersTop);
	popupBeerMenuContainer.appendChild(popupDraftBeersContainer);
	popupBeerMenuContainer.appendChild(popupBottleBeersContainer);
	popupBeerMenuContainer.appendChild(popupBeerActualisationDate);
	popupContent.appendChild(popupBeerMenuContainer);
	popup.appendChild(popupContent);
	document.body.appendChild(popup);
	popup.style.visiblity = "visible";
	window.onclick = function(event) {
	    if (event.target == popup) {
	    	popup.parentNode.removeChild(popup);
	    }
	}
}

//funkcia vytvori HTML blok pre jeden bar a naplni ho informaciami
function resultItem(bar){
	myMap.removeLayer(markers);
	var day = today.getDay();
	var key = bar.key;
	var lat = bar.child("lat").val();
	var lon = bar.child("lon").val();
	var name = bar.child("name").val();
	var address = bar.child("address").val();
	var marker = L.marker([lat, lon], {icon: beerIcon});
	var barPopup = document.createElement('div');
	barPopup.innerHTML = "<div class='barMarker'><div class='barNamePopup'>" + name + "</div></div>"
	marker.bindPopup(barPopup);
	barPopup.onclick = function (){
		popUp(bar);
	}
	markers.addLayer(marker);
	myMap.addLayer(markers);
	var rating = Math.floor((-1) * bar.child("rating").val())
	var remainderRating = Math.round(10 * ((-1) * bar.child("rating").val() - rating));
	var barContainer = createDiv("barContainer");
	var infoContainer = createDiv("infoContainer");
	var basicInfo = createDiv("basicInfo");
	(barPicture = createDiv("barPicture")).innerHTML = "<img src=\"barimages/" + key + ".jpg\" width=\"100px\" height=\"100px\">";
	var barNameContainer = createDiv("barNameContainer");

	(barName = createDiv("barName")).innerHTML = name;
	barNameContainer.appendChild(barName);
	(barAddress = createDiv("barAddress")).innerHTML = bar.child("address").val();
	(addressPictogram = createDiv("pictogram")).innerHTML = "<img src=\"pictograms/addressColorRed.png\" width=\"13px\" height=\"13px\">";
	(webPictogram = createDiv("pictogram")).innerHTML = "<img src=\"pictograms/webColorRed.png\" width=\"13px\" height=\"13px\">";
	(phonePictogram = createDiv("pictogram")).innerHTML = "<img src=\"pictograms/phoneColorRed.png\" width=\"13px\" height=\"13px\">";
	(clockPictogram = createDiv("pictogram")).innerHTML = "<img src=\"pictograms/clockColorRed.png\" width=\"13px\" height=\"13px\">";
	(barWeb = createDiv("barWeb")).innerHTML = bar.child("web").val();;
	(barPhone = createDiv("barPhone")).innerHTML = bar.child("phone").val();
	var barAttributes = createDiv("barAttributes");
	var attributesCard = createDiv("barAttributesIcon");


	if(!bar.child("attributes").child("card").val()){
		attributesCard.style.opacity = 0.3;
	}
	attributesCard.innerHTML = "<img src=\"pictograms/card.png\" width=\"22px\" height=\"22px\" title='Platba Kartou'>"
	barAttributes.appendChild(attributesCard);
	var attributesFood = createDiv("barAttributesIcon");
	if(!bar.child("attributes").child("food").val()){
		attributesFood.style.opacity = 0.3;
	}
	attributesFood.innerHTML = "<img src=\"pictograms/food.png\" width=\"22px\" height=\"22px\" title='Varia jedlo'>"
	barAttributes.appendChild(attributesFood);
	var attributesWifi = createDiv("barAttributesIcon");
	if(!bar.child("attributes").child("wifi").val()){
		attributesWifi.style.opacity = 0.3;
	}
	attributesWifi.innerHTML = "<img src=\"pictograms/wifi.png\" width=\"22px\" height=\"22px\" title='Internet'>"
	barAttributes.appendChild(attributesWifi);
	var attributesDog = createDiv("barAttributesIcon");
	if(!bar.child("attributes").child("dogs").val()){
		attributesDog.style.opacity = 0.3;
	}
	attributesDog.innerHTML = "<img src=\"pictograms/dog.png\" width=\"22px\" height=\"22px\" title='Psi su vitané'>"
	barAttributes.appendChild(attributesDog);


	var barHours = createDiv("barHours");
	if (bar.child("hours").child(day).child("opened").val()){
		var from = bar.child("hours").child(day).child("from").val();
		var to = bar.child("hours").child(day).child("to").val();
		barHours.innerHTML = "Dnes otvorené " + from + " - " + to +"";
	} else{
		barHours.innerHTML = "Dnes zatvorené";
	}
	var barRatingContainer = createDiv("barRatingContainer");
	var barRating = createDiv("barRating")
	var barRatingText = createDiv("barRatingText")

	var ratingArray = [];
	for (i = 0; i < rating; i++) { 
		var barFullBeerRating = createDiv("beerRatingPictogram");
		ratingArray.push(barFullBeerRating);
		barFullBeerRating.innerHTML = "<img src=\"pictograms/beer10.png\" width=\"10px\" height=\"20px\">";
		barRating.appendChild(barFullBeerRating);
	}

	var barRemainderBeerRating = createDiv("beerRatingPictogram");
	ratingArray.push(barRemainderBeerRating);
	barRemainderBeerRating.innerHTML = "<img src=\"pictograms/beer" + remainderRating + ".png\" width=\"10px\" height=\"20px\">";
	barRating.appendChild(barRemainderBeerRating);

	for (i = 0; i < (4 - rating); i++) { 
		var barEmptyBeerRating = createDiv("beerRatingPictogram");
		ratingArray.push(barEmptyBeerRating);
		barEmptyBeerRating.innerHTML = "<img src=\"pictograms/beer0.png\" width=\"10px\" height=\"20px\">";
		barRating.appendChild(barEmptyBeerRating);
	}
	if(bar.child("ratings").child(IP).val() == null){
		barRatingText.innerHTML = "(nehodnotené)";
		ratingHover(ratingArray);
		ratingArray[0].onclick = function(){
			rater(barRatingText, 1, bar, barRating);
		}
		ratingArray[1].onclick = function(){
			rater(barRatingText, 2, bar, barRating);
		}
		ratingArray[2].onclick = function(){
			rater(barRatingText, 3, bar, barRating);
		}
		ratingArray[3].onclick = function(){
			rater(barRatingText, 4, bar, barRating);
		}
		ratingArray[4].onclick = function(){
			rater(barRatingText, 5, bar, barRating);
		}
	} else{
		barRatingText.innerHTML = "(hodnotené <b>" + bar.child("ratings").child(IP).child("rating").val() + "</b>)";
	}
	barRating.appendChild(barRatingText);
	(barRatingSquare = createDiv("barRatingSquare")).innerHTML = rating + "," + remainderRating;
	if(rating >= 4){
		barRatingSquare.style.borderColor = "rgb(55, 145, 27)"
		barRatingSquare.style.color = "rgb(55, 145, 27)"
	} else if(rating >= 2){
		barRatingSquare.style.borderColor = "rgb(239, 130, 40)"
		barRatingSquare.style.color = "rgb(239, 130, 40)"
	}
	barRatingContainer.appendChild(barRating);
	barRatingContainer.appendChild(barRatingSquare);

	var barPhoneAttributesContainer = createDiv("barPhoneAttributesContainer");

	barPhoneAttributesContainer.appendChild(phonePictogram);
	barPhoneAttributesContainer.appendChild(barPhone);
	barPhoneAttributesContainer.appendChild(barAttributes);		
	basicInfo.appendChild(barNameContainer);	
	basicInfo.appendChild(addressPictogram);
	basicInfo.appendChild(barAddress);
	basicInfo.appendChild(clockPictogram);
	basicInfo.appendChild(barHours);
	basicInfo.appendChild(webPictogram);
	basicInfo.appendChild(barWeb);
	basicInfo.appendChild(barRatingContainer);
	basicInfo.appendChild(barPhoneAttributesContainer);
	infoContainer.appendChild(barPicture);
	infoContainer.appendChild(basicInfo);

	infoContainer.onclick = function(){
		markers.zoomToShowLayer(marker, function(){
			marker.openPopup();
		});
		myMap.panTo(new L.LatLng(lat, lon), {animate: true, duration: 0.7});
	}
	barContainer.appendChild(infoContainer);
	document.getElementById("barsResults").appendChild(barContainer);
	barName.onclick = function (){
		popUp(bar);
	}				
}

function rater(text, n, snapshot, ratingContainer){
	ratingContainer.innerHTML = "";
	for(i = 0; i < n; i++){
		(pictogram = createDiv("beerRatingPictogram")).innerHTML = "<img src=\"pictograms/beerOutlined.png\" width=\"10px\" height=\"20px\">";
		ratingContainer.appendChild(pictogram);
	}
	for(i = 0; i < 5-n; i++){
		(pictogram = createDiv("beerRatingPictogram")).innerHTML = "<img src=\"pictograms/beer0.png\" width=\"10px\" height=\"20px\">";
		ratingContainer.appendChild(pictogram);
	}
	(text = createDiv("barRatingText")).innerHTML = "(hodnotené <b>"+ n +"</b>)";
	ratingContainer.appendChild(text);
	var count = snapshot.child("count").val() + 1;
	var total = snapshot.child("total").val() + n;
	var rating = (-1 * Math.round(total/count * 10) / 10)
	var ratingRef = firebase.database().ref("bars/" +  snapshot.key + "/ratings/" + IP);
	var barRef = firebase.database().ref("bars/" +  snapshot.key);
	ratingRef.set({
		"rating": n
	});
	barRef.update({
		"count" : count,
		"total": total,
		"rating": rating
	})
}

/*	
	funkcia pri presune mysi cez piktogram hodnotenia zabezpeci snizenie priehladnosti ostatnych piktogramov napravo od neho
	param array: pole elementov
*/
function ratingHover(array){
	array[0].onmouseover = function(){
		for(j = 1; j < 5; j++){
			array[j].style.opacity = "0.2";
		}		
	}
	array[0].onmouseout = function(){
		for(j = 1; j < 5; j++){
			array[j].style.opacity = "1";
		}		
	}

	array[1].onmouseover = function(){
		for(j = 2; j < 5; j++){
			array[j].style.opacity = "0.2";
		}		
	}
	array[1].onmouseout = function(){
		for(j = 2; j < 5; j++){
			array[j].style.opacity = "1";
		}		
	}

	array[2].onmouseover = function(){
		for(j = 3; j < 5; j++){
			array[j].style.opacity = "0.2";
		}		
	}
	array[2].onmouseout = function(){
		for(j = 3; j < 5; j++){
			array[j].style.opacity = "1";
		}		
	}

	array[3].onmouseover = function(){
		for(j = 4; j < 5; j++){
			array[j].style.opacity = "0.2";
		}		
	}
	array[3].onmouseout = function(){
		for(j = 4; j < 5; j++){
			array[j].style.opacity = "1";
		}		
	}
}

/*	
	funkcia vytvori HTML element "div" a priradi mu meno triedy na zaklade jej parametru
	param name: pozadovany nazov elementu
*/
function createDiv(name){
	var div = document.createElement("div");
	div.className = name;
	return div;
}


var searcher = document.getElementById("searcher");
var results = document.getElementById("searchResults");
var timeout = null;
searcher.addEventListener("input", search);

//funkcia search vyhladava z databazy bud typ piva, konkretne pivo, alebo bary. 
function search(){
	var value = searcher.value.toUpperCase();
	clearTimeout(timeout);
	timeout = setTimeout(function () {
		if(value == null || value == ""){
			results.style.display = "none";
		} else{
			results.innerHTML = "";
			function findResults(callback){
				var barCategory = false;
				var beerCategory = false;
				var typesCategory = false;
				types.once("value").then(function(snapshot) {
					snapshot.forEach(function(childSnapshot) {
						var type = childSnapshot.key;
						var accentLess = removeAccents(type.toUpperCase());
						if(accentLess.startsWith(value) || (accentLess.indexOf(" " + value) !== -1)){
							if(!typesCategory){
								var category = '<div class="itemCategory">Typy pív</div>';
								results.insertAdjacentHTML('beforeend', category);
								typesCategory = true;
							}
							callback(true);
							results.style.display = "block";
							var typeItem = createDiv("resultItem");
							typeItem.innerHTML = type;
							results.appendChild(typeItem);
							typeItem.onclick = function(){
								noResults.style.display = "none";
								loaderBars.style.display = "block";
								searchType = "type";
								searchValue = type;
								barResult = false;
								document.getElementById("searchRemoverContainer").style.display = "block";
								markers.clearLayers();
								document.getElementById("searcher").value = type;
								document.getElementById("barsResults").innerHTML = "";
								barsByBeerType(type);
								resultText.innerHTML = "V zadanej lokalite sa zobrazujú bary, ktoré čapujú typ piva - \xa0 <b>" + type +"<b>:"
							}
						}
					});
				});

				bars.once("value").then(function(snapshot) {
					snapshot.forEach(function(childSnapshot) {
						var name = childSnapshot.child("name").val();
						var accentLess = removeAccents(name.toUpperCase());
						if (accentLess.startsWith(value) || (accentLess.indexOf(" " + value) !== -1)) {
							if(!barCategory){
								var category = '<div class="itemCategory">Bary</div>';
								results.insertAdjacentHTML('beforeend', category);
								barCategory = true;
							}
							callback(true);
							results.style.display = "block";
							var lat = childSnapshot.child("lat").val();
							var lon = childSnapshot.child("lon").val();
							var rating = Math.floor((-1) * childSnapshot.child("rating").val());
							var remainderRating = Math.round(10 * ((-1) * childSnapshot.child("rating").val() - rating));
							var barItem = createDiv("resultItem");
							(barRatingSquare = createDiv("barRatingSquareSmall")).innerHTML = rating + "," + remainderRating;
							if(rating >= 4){
								barRatingSquare.style.borderColor = "rgb(55, 145, 27)"
								barRatingSquare.style.color = "rgb(55, 145, 27)"
							} else if(rating >= 2){
								barRatingSquare.style.borderColor = "rgb(239, 130, 40)"
								barRatingSquare.style.color = "rgb(239, 130, 40)"
							}
							barItem.innerHTML = name;
							barItem.appendChild(barRatingSquare);
							results.appendChild(barItem);
							barItem.onclick = function(){
								noResults.style.display = "none";
								document.getElementById("searchRemoverContainer").style.display = "none";
								searcher.value = null;
								searchValue = null;
								searchType = null;
								barResult = true;
								openFilter.className = "filterItem";
								cardFilter.className = "filterItem";
								foodFilter.className = "filterItem";
								wifiFilter.className = "filterItem";
								dogsFilter.className = "filterItem";
								markers.clearLayers();
								document.getElementById("barsResults").innerHTML = "";
								resultItem(childSnapshot);
								myMap.panTo(new L.LatLng(lat, lon));
								resultText.innerHTML = "Zobrazuje sa bar \xa0 <b>" + name +"<b>:"

							}
						}
					});
				});

				beers.once("value").then(function(snapshot) {
					snapshot.forEach(function(childSnapshot) {
						var brand = childSnapshot.child("brand").val();
						var name = childSnapshot.child("name").val();
						var beerResult =  brand + " " + name;
						var accentLess = removeAccents(beerResult.toUpperCase());
						var key = childSnapshot.key;
						if (accentLess.startsWith(value) || (accentLess.indexOf(" " + value) !== -1)) {
							var plato = childSnapshot.child("p").val();
							var type = childSnapshot.child("type").val();
							var draft = childSnapshot.child("draft").val();
							if (draft){
								type = type + " (čap.)"
							} else{
								type = type + " (fľaš.)"
							}
							if(!beerCategory){
								var category = '<div class="itemCategory">Pivá</div>';
								results.insertAdjacentHTML('beforeend', category);
								beerCategory = true;
							}
							callback(true);
							results.style.display = "block";
							var beerItem = createDiv("resultItem");
							beerItem.innerHTML = brand + ' ' + name + ' ' + plato + '°' + " - " + type;
							results.appendChild(beerItem);
							beerItem.onclick = function(){
								noResults.style.display = "none";
								loaderBars.style.display = "block";
								barResult = false;
								searchValue = key;
								searchType = "beer";
								document.getElementById("searchRemoverContainer").style.display = "block";
								markers.clearLayers();
								document.getElementById("searcher").value = brand + ' ' + name + ' ' + plato + '°' + " - " + type;
								document.getElementById("barsResults").innerHTML = "";
								barsByBeer(key);
								if(draft){
									resultText.innerHTML = "V zadanej lokalite sa zobrazujú bary, ktoré čapujú - \xa0 <b>" + brand + ' ' + name + ' ' + plato + '°' + "</b>:"
								} else{
									resultText.innerHTML = "V zadanej lokalite sa zobrazujú bary, ktoré majú fľaškové pivo -  \xa0 <b>" + brand + ' ' + name + ' ' + plato + '°' + "</b>:"
								}
							}
						}
					});
				});
			}
			findResults(function(callback){
				if(!callback){
					var empty = createDiv("emptyResult");
					empty.innerHTML = ("Pre zadaný výraz sa nenašli žiadne výsledky");
					results.appendChild(empty);
					results.style.display = "block";
				}
			});
		}
	}, 400);
}

//funkcia, ktora sa spusti pri prvom nacitani webstranky. Sluzi na zobrazovanie vsetkych barov z databazy bez obmedzenia
(function startUp(){
	bars.once("value").then(function(snapshot) {
		loaderBars.style.display = "none";
		snapshot.forEach(function(childSnapshot) {
			resultItem(childSnapshot);
		});
	});
	myMap.addLayer(markers);
	resultText.innerHTML = "V zadanej lokalite sa zobrazujú sa všetky bary:"
}());

var noResults = document.getElementById("noResults");

//funkcia sluzi na zobrazovanie barov len na zaklade useku mapy
function barsByMap(){
	bars.once("value").then(function(snapshot) {
		loaderBars.style.display = "none";
		noResults.style.display = "block";
		snapshot.forEach(function(childSnapshot) {
			barFilter(childSnapshot);
		});
	});
}

/*
	funkcia sluzi na zobrazovanie barov na zaklade typu
	param type: typ piva
*/
function barsByBeerType(type){
	bars.once("value").then(function(snap){
		loaderBars.style.display = "none";
		noResults.style.display = "block";
		snap.forEach(function(childSnapshot){
			childSnapshot.child("beers").forEach(function(beerchild){
					if(beerchild.child("type").val() == type){
						barFilter(childSnapshot);
					}
				
			})
		})
	});		
}

/*
	funkcia sluzi na zobrazovanie barov na zaklade konkretneho piva
	param key: kluc piva z databazy
*/
function barsByBeer(key){
	var path = "beers/" + key;
	bars.once("value").then(function(snap){
		loaderBars.style.display = "none";
		noResults.style.display = "block";
		snap.forEach(function(childSnapshot){
			var found = false;
			if(childSnapshot.child(path).val()){
				found = true;
			}
		  	if(!found){
		  		return;
		  	}
			barFilter(childSnapshot);
		});
	});
}
//funkcia vrati suradnice rohov, ktore ohranicuju mapu
function getMapBounds(){
	var bounds = myMap.getBounds();
	var nWlat = bounds.getNorthWest().lat;
	var nWlon = bounds.getNorthWest().lng;
	var sElat = bounds.getSouthEast().lat;
	var sElon = bounds.getSouthEast().lng;
	var boundArray = [nWlat,nWlon, sElat, sElon];
	return boundArray
}

/*
	funkcia sluzi na urcenie, ci dany bar splna uzivatelom zadane filtre
	param bar: data baru
*/
function barFilter(bar){
	var open = document.getElementById("open").className;
	var food = document.getElementById("food").className;
	var wifi = document.getElementById("wifi").className;
	var dogs = document.getElementById("dogs").className;
	var card = document.getElementById("card").className;
	var day = today.getDay();
	var a = getMapBounds();
	if(open == "filterItemSelected"){
		if (!(bar.child("hours").child(day).child("opened").val())){
			return;
		}
	}
	if(card == "filterItemSelected"){
		if (!(bar.child("attributes").child("card").val())){
			return;
		}
	}
	if(food == "filterItemSelected"){
		if (!(bar.child("attributes").child("food").val())){
			return;
		}
	}
	if(wifi == "filterItemSelected"){
		if (!(bar.child("attributes").child("wifi").val())){
			return;
		}
	}
	if(dogs == "filterItemSelected"){
		if (!(bar.child("attributes").child("dogs").val())){
			return;
		}
	}
	lat = bar.child("lat").val()
	lon = bar.child("lon").val()
	if(!(lon <= a[3] & lon >= a[1] & lat <= a[0] & lat >= a[2])){
		return;
	}
	noResults.style.display = "none";
	resultItem(bar);
	return;	
}

var filter = document.getElementById("filter");
var filterDropdown = document.getElementById("filterDropdown");
var searchRemoverButton = document.getElementById("searchRemoverButton");
var refreshButton = document.getElementById("refreshButton");
var refreshInfo = document.getElementById("refreshInfo");
var clicks = 0;

refreshButton.onclick = function(){
	clicks += 1;
	document.getElementById("refreshButtonPictogram").style.transform = "rotate("+(clicks*720)+"deg)"
	refresh();
	refreshInfo.style.display = "none";
}

/*
	funkcia sa spusti po stlaceni tlacidla pre obnovenie barov pre zadany usek mapy
*/
function refresh(){
	noResults.style.display = "none";
	loaderBars.style.display = "block";
	setTimeout(function (){
	}, 1000);
	myMap.removeLayer(markers);
	markers.clearLayers();
	if(barResult){
		resultText.innerHTML = "Zobrazujú sa všetky bary v zadanej lokalite:";
	}
	document.getElementById("barsResults").innerHTML = "";
	if(searchType == "type"){
		barsByBeerType(searchValue);
	} else if(searchType == "beer"){
		barsByBeer(searchValue);
	} else{
		barsByMap();
	}
}

searchRemoverButton.onclick = function(){
	document.getElementById("searchRemoverContainer").style.display = "none";
	searcher.value = null;
	searchValue = null;
	searchType = null;
	searcher.focus();
	refresh();
	resultText.innerHTML = "Zobrazujú sa všetky bary v zadanej lokalite:"
}

document.addEventListener('click', function(event) {
  var click = searcher.contains(event.target);
  if (!click) {
    results.style.display = "none";
  }
});

var openFilter = document.getElementById("open");
var foodFilter = document.getElementById("food");
var wifiFilter = document.getElementById("wifi");
var dogsFilter = document.getElementById("dogs");
var cardFilter = document.getElementById("card");


/*
	funkcia po kliknuti na filter zmeni nazov triedy elementu daneho filtra a pomocou funkcie refresh obnovi vysledky barov
	param filter: element reprezentujuci filter 

*/
function filterClick(filter){
	loaderBars.style.display = "flex";
	if(filter.className == "filterItem"){
    	filter.className = "filterItemSelected";
    } else{
    	filter.className = "filterItem";
    }
    refresh();
}

cardFilter.onclick = function(){
	filterClick(cardFilter);
}
openFilter.onclick = function(){
	filterClick(openFilter);
}
foodFilter.onclick = function(){
	filterClick(foodFilter);
}
wifiFilter.onclick = function(){
	filterClick(wifiFilter);
}
dogsFilter.onclick = function(){
	filterClick(dogsFilter);
}

myMap.on('moveend', function(){
	refreshInfo.style.display = "flex";
})


/*funkcia odstrani zo slova diakritiku. Vyuzivaju sa v nej iba velke pismena, pretoze tato funkcia je volana iba na retazec s velkymi pismenami
	param strAccents: retazec s diakritikou
*/
function removeAccents(strAccents) {
		var strAccents = strAccents.split('');
		var strAccentsOut = new Array();
		var strAccentsLen = strAccents.length;
		var accents = "ÁČĎĚÉÍĽĹŇÓÔŔŘŠŤŮÚÝŽ"; 
		var accentsOut = "ACDEEILLNOORRSTUUYZ";
		for (i = 0; i < strAccentsLen; i++) {
			if (accents.indexOf(strAccents[i]) != -1) {
				strAccentsOut[i] = accentsOut.substr(accents.indexOf(strAccents[i]), 1);
			} else
				strAccentsOut[i] = strAccents[i];
		}
		strAccentsOut = strAccentsOut.join('');
		return strAccentsOut;
}
