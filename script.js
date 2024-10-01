// script.js
let klantData = [];
let origineleVolgorde = [];

function laadKlantData() {
    const url = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/klantData-vNrf7k3yxNYNA5EqfBf8xdTAbLvyvN.json';

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Received data:', data);
            if (data && data.customers && Array.isArray(data.customers)) {
                klantData = data.customers;
                origineleVolgorde = klantData.map(klant => klant.id);
                console.log('Processed customer data:', klantData);
                toonKlanten();
                populateTimeDropdown();
            } else {
                throw new Error('Invalid data structure received from the server.');
            }
        })
        .catch(error => {
            console.error('Error loading customer data:', error);
            alert('Error loading customer data. Please check the console for more details.');
        });
}

function toonKlanten(filter = '', sorteer = false, sorteerOpTijd = null) {
    console.log('Displaying customers. Filter:', filter, 'Sort:', sorteer, 'Sort by time:', sorteerOpTijd);
    const klantLijst = document.getElementById('klant-lijst');
    klantLijst.innerHTML = '';
    
    let klanten = klantData.filter(klant => 
        klant.name.toLowerCase().includes(filter.toLowerCase()) ||
        (klant.customerNumber && klant.customerNumber.includes(filter)) ||
        (klant.timeSlot && klant.timeSlot.toLowerCase().includes(filter.toLowerCase()))
    );

    if (sorteer) {
        klanten.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sorteerOpTijd) {
        klanten = klanten.filter(klant => {
            if (sorteerOpTijd === 'will be picked up') {
                return !klant.timeSlot;
            }
            if (!klant.timeSlot) return false;
            const klantUur = parseInt(klant.timeSlot.split(':')[0]);
            const [startUur, eindUur] = sorteerOpTijd.split('-').map(t => parseInt(t));
            return klantUur >= startUur && klantUur < eindUur;
        });
    } else {
        klanten.sort((a, b) => origineleVolgorde.indexOf(a.id) - origineleVolgorde.indexOf(b.id));
    }

    klanten.forEach(klant => {
        const div = document.createElement('div');
        div.className = 'klant-kader';
        div.id = `klant-${klant.id}`;
        div.innerHTML = `
            <div class="mb-4">
                <span class="font-semibold text-lg">${klant.name}</span><br>
                <span class="text-sm text-gray-500">Customer number: ${klant.customerNumber}</span><br>
                <span class="text-sm text-gray-500">${klant.timeSlot || 'No time slot'}</span>
            </div>
            <div class="flex flex-wrap justify-between items-center">
                <button class="details-button flex-grow mr-2 mb-2" onclick="toonKlantInfo('${klant.id}')">Details</button>
                <button class="mail-button flex-grow mb-2" onclick="sendMail('${klant.id}')">Send email</button>
            </div>
        `;
        klantLijst.appendChild(div);
    });
}

function toonKlantInfo(klantId) {
    console.log('Displaying customer info for ID:', klantId);
    const klant = klantData.find(k => k.id === klantId);
    const klantDiv = document.getElementById(`klant-${klantId}`);
    
    const bestaandeDetails = klantDiv.querySelector('.klant-details');
    if (bestaandeDetails) {
        bestaandeDetails.remove();
    }

    const detailsDiv = document.createElement('div');
    detailsDiv.className = 'klant-details mt-4';
    detailsDiv.innerHTML = `
        <div class="w-full mb-4">
            <button class="back-button" onclick="verbergKlantInfo('${klantId}')">Back</button>
        </div>
        <div class="w-full">
            <h2 class="text-xl font-semibold mb-2">${klant.name}</h2>
            <p class="mb-2">Customer number: ${klant.customerNumber}</p>
            <p class="mb-2">Time slot: ${klant.timeSlot || 'No time slot'}</p>
            <p class="mb-2">Preferences: ${klant.voorkeuren || 'No preferences specified'}</p>
        </div>
        <div id="map-${klantId}" class="w-full mb-4" style="height: 300px;"></div>
        <div id="photo-buttons-${klantId}" class="w-full mb-4"></div>
        <div id="photo-container-${klantId}" class="hidden w-full">
            <img id="klant-voertuig-${klantId}" src="" alt="Customer's vehicle" class="mb-4 max-w-full h-auto">
        </div>
    `;

    klantDiv.appendChild(detailsDiv);

    if (klant.locatie) {
        const [lat, lng] = klant.locatie.split(', ').map(parseFloat);
        const map = L.map(`map-${klantId}`).setView([lat, lng], 18);
        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
        }).addTo(map);
        L.marker([lat, lng]).addTo(map);
    }

    const photoButtonsContainer = document.getElementById(`photo-buttons-${klantId}`);
    const photos = [
        { key: 'voertuigFoto', label: 'Photo 1' },
        { key: 'voertuigFoto1', label: 'Photo 2' },
        { key: 'voertuigFoto2', label: 'Photo 3' }
    ];

    photos.forEach(photo => {
        if (klant[photo.key]) {
            const button = document.createElement('button');
            button.textContent = photo.label;
            button.className = 'photo-button mr-2 mb-2';
            button.onclick = () => toonFoto(klant[photo.key], klantId);
            photoButtonsContainer.appendChild(button);
        }
    });
}

function verbergKlantInfo(klantId) {
    const klantDiv = document.getElementById(`klant-${klantId}`);
    const detailsDiv = klantDiv.querySelector('.klant-details');
    if (detailsDiv) {
        detailsDiv.remove();
    }
}

function toonFoto(url, klantId) {
    console.log('Displaying photo for customer ID:', klantId);
    const img = document.getElementById(`klant-voertuig-${klantId}`);
    img.src = url;
    document.getElementById(`photo-container-${klantId}`).classList.remove('hidden');
}

function sendMail(klantId) {
    console.log('Sending email for customer ID:', klantId);
    const klant = klantData.find(k => k.id === klantId);
    const subject = encodeURIComponent(`Customer ${klant.name} (Customer number: ${klant.customerNumber}) has been delivered`);
    const body = encodeURIComponent(`The customer ${klant.name} (Customer number: ${klant.customerNumber}) has been delivered.`);
    window.location.href = `mailto:sales@vanlaethem.eu?subject=${subject}&body=${body}`;
}

function populateTimeDropdown() {
    const dropdown = document.getElementById('time-dropdown');
    for (let i = 0; i < 12; i++) {
        const option = document.createElement('option');
        option.value = `${i}-${i+1}`;
        option.textContent = `${i.toString().padStart(2, '0')}:00 - ${(i+1).toString().padStart(2, '0')}:00`;
        dropdown.appendChild(option);
    }
    const pickupOption = document.createElement('option');
    pickupOption.value = 'will be picked up';
    pickupOption.textContent = 'Will be picked up';
    dropdown.appendChild(pickupOption);
}

function compressImage(img) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    let width = img.width;
    let height = img.height;
    const maxWidth = 1000;
    const maxHeight = 1000;

    if (width > height) {
        if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
        }
    } else {
        if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
        }
    }

    canvas.width = width;
    canvas.height = height;

    ctx.drawImage(img, 0, 0, width, height);

    return canvas.toDataURL('image/jpeg', 0.7);
}

function processImage(imageData) {
    Tesseract.recognize(imageData, 'eng+nld', {
        logger: m => console.log(m)
    }).then(({ data: { text } }) => {
        console.log("Extracted text:", text);
        const customerInfo = extractCustomerInfo(text);
        if (customerInfo && customerInfo.isValid) {
            console.log("Valid customer information found:", customerInfo);
            document.getElementById('klant-zoek').value = customerInfo.searchTerm;
            toonKlanten(customerInfo.searchTerm);
        } else {
            console.log("No valid customer information found");
            alert('Er is iets niet juist. Geen geldige klantinformatie gevonden in de afbeelding. Probeer opnieuw met een duidelijkere foto.');
        }
    });
}

function extractCustomerInfo(text) {
    const lines = text.split('\n');
    let customerNumber = null;

    for (let line of lines) {
        line = line.trim();

        const numberMatch = line.match(/\b400\d{3,4}\b/);
        if (numberMatch) {
            customerNumber = numberMatch[0];
            console.log("Found customer number:", customerNumber);
            return { searchTerm: customerNumber, isValid: true };
        }
    }

    // If no customer number is found, search for a customer name
    for (let line of lines) {
        line = line.trim();
        if (line.length > 3 && !/^\d+$/.test(line)) {  // Ignore lines that are just numbers
            const matchedCustomer = klantData.find(klant => 
                klant.name.toLowerCase().includes(line.toLowerCase())
            );
            if (matchedCustomer) {
                console.log("Found matching customer name:", matchedCustomer.name);
                return { searchTerm: matchedCustomer.name, isValid: true };
            }
        }
    }

    return { isValid: false };
}

// Event listeners
document.addEventListener('DOMContentLoaded', laadKlantData);

document.getElementById('klant-zoek').addEventListener('input', (e) => toonKlanten(e.target.value));

document.getElementById('sort-button').onclick = () => {
    toonKlanten(document.getElementById('klant-zoek').value, true);
    document.getElementById('sort-button').classList.add('hidden');
    document.getElementById('time-dropdown-container').classList.add('hidden');
    document.getElementById('original-button').classList.remove('hidden');
};

document.getElementById('time-dropdown').onchange = (e) => {
    toonKlanten(document.getElementById('klant-zoek').value, false, e.target.value);
};

document.getElementById('original-button').onclick = () => {
    toonKlanten(document.getElementById('klant-zoek').value);
    document.getElementById('original-button').classList.add('hidden');
    document.getElementById('sort-button').classList.remove('hidden');
    document.getElementById('time-dropdown-container').classList.remove('hidden');
};

const captureButton = document.getElementById('capture-button');
const fileInput = document.getElementById('file-input');

captureButton.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const compressedImage = compressImage(img);
                processImage(compressedImage);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});