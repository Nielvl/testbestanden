'use client'

const { useState, useEffect } = React;

function App() {
  const [klantData, setKlantData] = useState([]);
  const [origineleVolgorde, setOrigineleVolgorde] = useState([]);
  const [filter, setFilter] = useState('');
  const [sorteer, setSorteer] = useState(false);
  const [sorteerOpTijd, setSorteerOpTijd] = useState('');
  const [expandedKlant, setExpandedKlant] = useState(null);

  useEffect(() => {
    laadKlantData();
  }, []);

  function laadKlantData() {
    const url = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/klantData-79rzSamqJXxYZL5DYYvjd6mQLKnuVE.json';

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
          setKlantData(data.customers);
          setOrigineleVolgorde(data.customers.map(klant => klant.id));
        } else {
          throw new Error('Invalid data structure received from the server.');
        }
      })
      .catch(error => {
        console.error('Error loading customer data:', error);
        alert('Error loading customer data. Please check the console for more details.');
      });
  }

  function displayKlanten() {
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

    return klanten;
  }

  function sendMail(klant) {
    const subject = encodeURIComponent(`Customer ${klant.name} (Customer number: ${klant.customerNumber}) has been delivered`);
    const body = encodeURIComponent(`The customer ${klant.name} (Customer number: ${klant.customerNumber}) has been delivered.`);
    window.location.href = `mailto:sales@vanlaethem.eu?subject=${subject}&body=${body}`;
  }

  function toonKlantInfo(klantId) {
    setExpandedKlant(expandedKlant === klantId ? null : klantId);
  }

  function KlantDetails({ klant }) {
    useEffect(() => {
      if (klant.locatie) {
        const [lat, lng] = klant.locatie.split(', ').map(parseFloat);
        const map = L.map(`map-${klant.id}`).setView([lat, lng], 17);
        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        }).addTo(map);
        L.marker([lat, lng]).addTo(map);

        return () => {
          map.remove();
        };
      }
    }, [klant]);

    return (
      <div className="klant-details mt-4">
        <div className="w-full mb-4">
          <button className="back-button" onClick={() => toonKlantInfo(klant.id)}>Back</button>
        </div>
        <div className="klant-info">
          <h2 className="text-xl font-semibold mb-2">{klant.name}</h2>
          <p className="mb-2">Customer number: {klant.customerNumber}</p>
          <p className="mb-2">Time slot: {klant.timeSlot || 'No time slot'}</p>
          <p className="mb-2">Preferences: {klant.voorkeuren || 'No preferences specified'}</p>
        </div>
        {klant.locatie && (
          <div id={`map-${klant.id}`} className="map mb-4"></div>
        )}
        <div className="w-full mb-4">
          {['voertuigFoto', 'voertuigFoto1', 'voertuigFoto2'].map((key, index) => 
            klant[key] && (
              <button key={key} className="photo-button mr-2 mb-2" onClick={() => window.open(klant[key], '_blank')}>
                Photo {index + 1}
              </button>
            )
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Customer Management for Forklift Driver</h1>
      
      <input
        type="text"
        placeholder="Search for a customer (name, number or time slot)..."
        className="w-full p-2 mb-8 border rounded"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />
      
      <div className="flex flex-wrap justify-between mb-8">
        <button
          className="details-button mb-2"
          onClick={() => {
            setSorteer(!sorteer);
            setSorteerOpTijd('');
          }}
        >
          {sorteer ? 'Original order' : 'Sort alphabetically'}
        </button>
        <select
          className="p-2 border rounded mb-2"
          value={sorteerOpTijd}
          onChange={(e) => {
            setSorteerOpTijd(e.target.value);
            setSorteer(false);
          }}
        >
          <option value="">Sort by time</option>
          {[...Array(12)].map((_, i) => (
            <option key={i} value={`${i}-${i+1}`}>
              {`${i.toString().padStart(2, '0')}:00 - ${(i+1).toString().padStart(2, '0')}:00`}
            </option>
          ))}
          <option value="will be picked up">Will be picked up</option>
        </select>
        <button className="capture-button mb-2">Scan delivery note</button>
      </div>
      
      <div id="klant-lijst" className="mb-8">
        {displayKlanten().map(klant => (
          <div key={klant.id} className="klant-kader">
            <div className="mb-4">
              <span className="font-semibold text-lg">{klant.name}</span><br />
              <span className="text-sm text-gray-500">Customer number: {klant.customerNumber}</span><br />
              <span className="text-sm text-gray-500">{klant.timeSlot || 'No time slot'}</span>
            </div>
            <div className="flex flex-wrap justify-between items-center">
              <button className="details-button flex-grow mr-2 mb-2" onClick={() => toonKlantInfo(klant.id)}>
                {expandedKlant === klant.id ? 'Back' : 'Details'}
              </button>
              <button className="mail-button flex-grow mb-2" onClick={() => sendMail(klant)}>Send email</button>
            </div>
            {expandedKlant === klant.id && <KlantDetails klant={klant} />}
          </div>
        ))}
      </div>
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));