let tempDataStore = []; // Global variable to store data temporarily

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
        document.getElementById("location").innerHTML = "Geolocation is not supported by this browser.";
    }
}

function showPosition(position) {
    console.log('position:', position)
    document.getElementById("location").innerHTML = "Latitude: " + position.coords.latitude +
    "<br>Longitude: " + position.coords.longitude;
}

function showError(error) {
    var manualLocationDiv = document.getElementById("manualLocation");
    switch(error.code) {
        case error.PERMISSION_DENIED:
            document.getElementById("location").innerHTML = "User denied the request for Geolocation. Please input manually:";
            manualLocationDiv.style.display = "block";
            break;
        case error.POSITION_UNAVAILABLE:
            document.getElementById("location").innerHTML = "Location information is unavailable. Please input manually:";
            manualLocationDiv.style.display = "block";
            break;
        case error.TIMEOUT:
            document.getElementById("location").innerHTML = "The request to get user location timed out. Please input manually:";
            manualLocationDiv.style.display = "block";
            break;
        case error.UNKNOWN_ERROR:
            document.getElementById("location").innerHTML = "An unknown error occurred. Please input manually:";
            manualLocationDiv.style.display = "block";
            break;
    }
}


function updateData() {
    const name = document.getElementById("name").value;
    const address = document.getElementById("address").value;
    const service = document.getElementById("service").value;
    const remark = document.getElementById("remark").value;
    let latitude = document.getElementById("manualLatitude").value;
    let longitude = document.getElementById("manualLongitude").value;

    if (latitude === '' || longitude === '') {
        const locationParts = document.getElementById("location").innerHTML.split('<br>');
        latitude = locationParts.length > 0 ? locationParts[0].split(': ')[1] : 'Not Available';
        longitude = locationParts.length > 1 ? locationParts[1].split(': ')[1] : 'Not Available';
    }

    const timestamp = new Date().toISOString(); // Record the current time in ISO format

    const newRecord = {
        name: name,
        address: address,
        service: service,
        remark: remark,
        location: {
            latitude: latitude,
            longitude: longitude
        },
        timestamp: timestamp // Include the timestamp in the record
    };

    tempDataStore.push(newRecord);
}


function downloadUpdatedData() {
    if (tempDataStore.length > 0) {
        downloadJSON(tempDataStore, "updated_data.json");
    } else {
        alert("No data to download.");
    }
}


function downloadJSON(data, filename) {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", filename);
    dlAnchorElem.click();
}
