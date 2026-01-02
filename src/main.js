import './style.css';
import { loadItinerary } from './itinerary.js';
import { initUI } from './ui.js';
import { initMap } from './map.js';
import feather from 'feather-icons';

document.addEventListener('DOMContentLoaded', function () {
    loadItinerary();
    initUI();
    initMap();
    feather.replace();
});
