const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

const param = urlParams.get('id');

console.log(param);


document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/infos/' + param)
    .then(response => response.json())
    .then(
        data => {console.log(data)
        console.log(data.name)

        const nameDiv = document.getElementById('name')
        const addressDiv = document.getElementById('address')
        const timesDiv = document.getElementById('times')
        const offerDiv = document.getElementById('offer')
        const efficencyDiv = document.getElementById('efficency')
        const ambienceDiv = document.getElementById('ambience')
        const serviceDiv = document.getElementById('service')
        const priceDiv = document.getElementById('price')
        const ratingDiv = document.getElementById('overallrating')

        const imageDiv = document.getElementById('image')

        const name = document.createElement('p');
        name.innerText = data.name
        nameDiv.appendChild(name);

        const address = document.createElement('p');
        address.innerText = data.address
        addressDiv.appendChild(address);

        const times = document.createElement('p');
        times.innerText = data.times
        timesDiv.appendChild(times);

        const offer = document.createElement('p');
        offer.innerText = data.offer
        offerDiv.appendChild(offer);times

        const efficency = document.createElement('p');
        efficency.innerText = data.efficency
        efficencyDiv.appendChild(efficency);

        const ambience = document.createElement('p');
        ambience.innerText = data.ambience
        ambienceDiv.appendChild(ambience);

        const service = document.createElement('p');
        service.innerText = data.service
        serviceDiv.appendChild(service);

        const price = document.createElement('p');
        price.innerText = data.price
        priceDiv.appendChild(price);

        const rating = document.createElement('p');
        rating.innerText = data.rating
        ratingDiv.appendChild(rating);

        for (let key in data.image) {
            if (data.image.hasOwnProperty(key)) {
                // Neues Bild-Element erstellen
                const img = document.createElement('img');
                // Die Quelle des Bildes setzen
                img.src = 'media/' + data.image[key];
                // Optional: Alt-Text setzen
                img.alt = `Image ${key}`;
                // Bild-Element in den Container einfügen
                imageDiv.appendChild(img);
            }
        }



})
});