let klantData = [];
let origineleVolgorde = [];
let isTimeSort = true;
let warehouseList = [];

document.addEventListener('DOMContentLoaded', initializeData);

function initializeData() {
    klantData = customerData.customers;
    origineleVolgorde = klantData.map(klant => klant.id);
    warehouseList = warehouseData.warehouses;
    console.log('Processed customer data:', klantData);
    toonKlanten('', true);
    toonMagazijnen();
    scrollNaarHuidigeTijd();
}

function scrollNaarHuidigeTijd() {
    const nu = new Date();
    const huidigeUur = nu.getHours();
    const tijdSlot = `${huidigeUur.toString().padStart(2, '0')}:00`;

    console.log('Zoeken naar tijdslot:', tijdSlot);

    setTimeout(() => {
        const klantenVanUur = document.querySelectorAll(`[data-timeslot^="${tijdSlot}"]`);
        if (klantenVanUur.length > 0) {
            console.log('Gevonden element:', klantenVanUur[0]);
            
            const searchContainer = document.querySelector('.search-container');
            const searchContainerHeight = searchContainer.offsetHeight;
            
            const elementRect = klantenVanUur[0].getBoundingClientRect();
            const absoluteElementTop = elementRect.top + window.pageYOffset;
            const middleOfViewport = window.innerHeight / 2;
            
            window.scrollTo({
                top: absoluteElementTop - searchContainerHeight - 20,
                behavior: 'smooth'
            });
        } else {
            console.log('Geen element gevonden voor tijdslot:', tijdSlot);
        }
    }, 500);
}

function toonKlanten(filter = '', sorteer = true) {
    console.log('Displaying customers. Filter:', filter, 'Sort:', sorteer);
    const klantLijst = document.getElementById('klant-lijst');
    klantLijst.innerHTML = '';
    
    let klanten = klantData.filter(klant => 
        klant.name.toLowerCase().includes(filter.toLowerCase()) ||
        (klant.customerNumber && klant.customerNumber.includes(filter)) ||
        (klant.timeSlot && klant.timeSlot.toLowerCase().includes(filter.toLowerCase()))
    );

    if (sorteer) {
        klanten.sort((a, b) => {
            if (!a.timeSlot && !b.timeSlot) return 0;
            if (!a.timeSlot) return 1;
            if (!b.timeSlot) return -1;
            return a.timeSlot.localeCompare(b.timeSlot);
        });
    } else {
        klanten.sort((a, b) => a.name.localeCompare(b.name));
    }

    klanten.forEach(klant => {
        const div = document.createElement('div');
        div.className = 'klant-kader';
        div.id = `klant-${klant.id}`;
        div.dataset.timeslot = klant.timeSlot ? klant.timeSlot.split(' - ')[0] + '-' + klant.timeSlot.split(' - ')[1] : 'no-timeslot';
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
        <div id="map-${klantId}" class="w-full h-64 mt-4 cursor-pointer"></div>
    `;
    klantDiv.appendChild(detailsDiv);

    if (klant.locatie) {
        const [lat, lng] = klant.locatie.split(', ').map(parseFloat);
        const map = L.map(`map-${klantId}`).setView([lat, lng], 17);
        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        }).addTo(map);
        L.marker([lat, lng]).addTo(map);

        map.on('click', function() {
            const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
            window.open(googleMapsUrl, '_blank');
        });

        const mapElement = document.getElementById(`map-${klantId}`);
        mapElement.title = "Klik om te openen in Google Maps";
    }
}

function verbergKlantInfo(klantId) {
    const klantDiv = document.getElementById(`klant-${klantId}`);
    const detailsDiv = klantDiv.querySelector('.klant-details');
    if (detailsDiv) {
        detailsDiv.remove();
    }
}

function sendMail(klantId) {
    const klant = klantData.find(k => k.id === klantId);
    const subject = encodeURIComponent(`Customer ${klant.name} (Customer number: ${klant.customerNumber}) has been delivered`);
    const body = encodeURIComponent(`The customer ${klant.name} (Customer number: ${klant.customerNumber}) has been delivered.`);
    window.location.href = `mailto:sales@vanlaethem.eu?subject=${subject}&body=${body}`;
}

function toonMagazijnen(filter = '') {
    const magazijnLijst = document.getElementById('warehouse-lijst');
    magazijnLijst.innerHTML = '';
    
    const magazijnen = warehouseList.filter(magazijn => 
        magazijn.name.toLowerCase().includes(filter.toLowerCase()) ||
        magazijn.address.toLowerCase().includes(filter.toLowerCase())
    );

    magazijnen.forEach(magazijn => {
        const div = document.createElement('div');
        div.className = 'klant-kader';
        div.innerHTML = `
            <div class="mb-4">
                <span class="font-semibold text-lg">${magazijn.name}</span><br>
                <span class="text-sm text-gray-500">${magazijn.address}</span><br>
            </div>
            <button class="details-button" onclick="toonMagazijnInfo('${magazijn.id}')">Details</button>
        `;
        magazijnLijst.appendChild(div);
    });
}

function toonMagazijnInfo(magazijnId) {
    const magazijn = warehouseList.find(w => w.id === magazijnId);
    const magazijnDiv = document.querySelector(`[onclick="toonMagazijnInfo('${magazijnId}')"]`).parentNode;
    
    const bestaandeDetails = magazijnDiv.querySelector('.magazijn-details');
    if (bestaandeDetails) {
        bestaandeDetails.remove();
        return;
    }

    const detailsDiv = document.createElement('div');
    detailsDiv.className = 'magazijn-details mt-4';
    detailsDiv.innerHTML = `
        <p>Type: ${magazijn.type}</p>
        <div id="map-${magazijnId}" class="w-full h-64 mt-4">
            <div class="loading-indicator">Kaart wordt geladen...</div>
        </div>
    `;
    magazijnDiv.appendChild(detailsDiv);

    if (magazijn.location) {
        setTimeout(() => {
            const mapContainer = document.getElementById(`map-${magazijnId}`);
            mapContainer.innerHTML = '';

            const [lat, lng] = magazijn.location.split(', ').map(parseFloat);
            const map = L.map(`map-${magazijnId}`, {
                attributionControl: false,
                zoomControl: false
            }).setView([lat, lng], 17);

            L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                attribution: ''
            }).addTo(map);

            L.marker([lat, lng]).addTo(map);

            map.invalidateSize();
        }, 100);
    }
}

// Event listeners en initialisatie
document.addEventListener('DOMContentLoaded', () => {
    const zoekInput = document.getElementById('klant-zoek');
    const clearSearch = document.getElementById('clear-search');
    const captureButtonMain = document.getElementById('capture-button-main');
    const captureButtonSearch = document.getElementById('capture-button-search');
    const warehouseZoekInput = document.getElementById('warehouse-zoek');
    const clearWarehouseSearch = document.getElementById('clear-warehouse-search');
    const scrollTopButton = document.getElementById('scroll-top');
    const sortTimeButton = document.getElementById('sort-time');
    const sortAlphaButton = document.getElementById('sort-alpha');
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    zoekInput.addEventListener('focus', () => clearSearch.style.display = 'block');
    zoekInput.addEventListener('blur', () => {
        setTimeout(() => {
            if (zoekInput.value === '' && document.activeElement !== captureButtonMain && document.activeElement !== captureButtonSearch) {
                clearSearch.style.display = 'none';
            }
        }, 100);
    });
    zoekInput.addEventListener('input', (e) => {
        toonKlanten(e.target.value, isTimeSort);
        clearSearch.style.display = e.target.value ? 'block' : 'none';
    });

    clearSearch.addEventListener('click', () => {
        zoekInput.value = '';
        toonKlanten('', isTimeSort);
        zoekInput.focus();
    });

    sortTimeButton.addEventListener('click', () => {
        if (!isTimeSort) {
            isTimeSort = true;
            updateSortButtons();
            toonKlanten('', true);
        }
    });

    sortAlphaButton.addEventListener('click', () => {
        if (isTimeSort) {
            isTimeSort = false;
            updateSortButtons();
            toonKlanten('', false);
        }
    });

    captureButtonMain.addEventListener('click', handleCapture);
    captureButtonSearch.addEventListener('click', handleCapture);

    scrollTopButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 100) {
            captureButtonMain.style.display = 'none';
            captureButtonSearch.style.display = 'flex';
            scrollTopButton.style.display = 'flex';
        } else {
            captureButtonMain.style.display = 'flex';
            captureButtonSearch.style.display = 'none';
            scrollTopButton.style.display = 'none';
        }
    });

    warehouseZoekInput.addEventListener('input', (e) => {
        toonMagazijnen(e.target.value);
        clearWarehouseSearch.style.display = e.target.value ? 'block' : 'none';
    });

    clearWarehouseSearch.addEventListener('click', () => {
        warehouseZoekInput.value = '';
        toonMagazijnen();
        warehouseZoekInput.focus();
    });

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            button.classList.add('active');
            document.getElementById(`${button.id.split('-')[1]}-content`).classList.add('active');
        });
    });

    initializeData();
});

function updateSortButtons() {
    document.getElementById('sort-time').classList.toggle('active', isTimeSort);
    document.getElementById('sort-alpha').classList.toggle('active', !isTimeSort);
}

function handleCapture() {
    const fileInput = document.getElementById('file-input');
    fileInput.click();
    fileInput.onchange = function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = new Image();
                img.onload = function() {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0, img.width, img.height);
                    const imageDataUrl = canvas.toDataURL('image/jpeg');
                    performOCR(imageDataUrl);
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    };
}

function performOCR(imageData) {
    Tesseract.recognize(imageData, 'eng', { logger: m => console.log(m) })
        .then(({ data: { text } }) => {
            console.log('OCR Result:', text);
            processOCRResult(text);
        })
        .catch(error => {
            console.error('OCR Error:', error);
            alert('Error processing the image. Please try again.');
        });
}

function processOCRResult(text) {
    const customerNumberMatch = text.match(/\b40\d{4,5}\b/);
    if (customerNumberMatch) {
        const customerNumber = customerNumberMatch[0];
        console.log('Gevonden klantnummer:', customerNumber);
        document.getElementById('klant-zoek').value = customerNumber;
        toonKlanten(customerNumber, isTimeSort);
    } else {
        console.log('Geen geldig klantnummer gevonden in de tekst');
        alert('Geen geldig klantnummer gevonden in de afbeelding. Probeer opnieuw.');
    }
}
