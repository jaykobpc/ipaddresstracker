import "./scss/main.scss";
import axios from "axios";
import Nprogress from 'nprogress';

const API_KEY = import.meta.env.VITE_IPIFY_APIKEY;
const IPIFY_URL = "https://geo.ipify.org/api/v1";

Nprogress.configure({ parent: '#main' });

const searchForm = document.getElementById("searchForm");
const inputForm = document.getElementById("inputForm");
const ipResult = document.getElementById("ipresult");
const locationResult = document.getElementById("locationresult");
const resultzone = document.getElementById("resultzone");
const resultIsp = document.getElementById("resultisp");

// Load default Map

class App {
  #map;
  #zoomLevel = 12;

  constructor() {
    this._loadMap();
    searchForm.addEventListener("submit", this._searchQuery.bind(this));
    this._queryIP();
  }

  _searchQuery(evt) {
    evt.preventDefault();
    //
    if (inputForm.value) {
      this._queryIP(inputForm.value);
    }
  }

  _queryIP(ipaddress) {
    Nprogress.start();
    let defaultURL = `${IPIFY_URL}?apiKey=${API_KEY}`;
    let paramIP = `${IPIFY_URL}?apiKey=${API_KEY}&ipAddress=${ipaddress}`;
    //
    axios
      .get(!ipaddress ? defaultURL : paramIP)
      .then(({ data }) => {
        ipResult.textContent = data?.ip;
        locationResult.textContent = `${data?.location.city} ${data?.location.region}`;
        resultzone.textContent = data?.location.timezone;
        resultIsp.textContent = data.isp;
        this._updateMap(
          [data?.location.lat, data?.location.lng],
          data?.location.city
        );
        //
        Nprogress.done();
      })
      .catch(err => {
        console.log('Error: ' + err);
        Nprogress.done();
      })
  }

  _loadMap(position = [51.505, -0.09]) {
    this.#map = null;
    this.#map = L.map("map").setView(position, this.#zoomLevel);

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);
  }

  _updateMap(position, city) {
    this.#map.setView(position, this.#zoomLevel, {
      animate: true,
      pan: {
        duration: 1,
      },
    });

    // add marker
    L.marker(position).addTo(this.#map).bindPopup(city).openPopup();
  }
}

const app = new App();
