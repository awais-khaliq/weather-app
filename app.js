/* ===== SkyPulse — Weather App Logic ===== */

const API_BASE = 'https://api.weatherapi.com/v1';
const STORAGE_KEY_API = 'skypulse_api_key';
const STORAGE_KEY_LAST = 'skypulse_last_city';

// DOM refs
const $ = (id) => document.getElementById(id);

const dom = {
    appContainer: $('app-container'),
    particles: $('particles'),
    searchInput: $('search-input'),
    searchBtn: $('search-btn'),
    apiKeyModal: $('api-key-modal'),
    apiKeyInput: $('api-key-input'),
    saveApiKeyBtn: $('save-api-key-btn'),
    welcomeState: $('welcome-state'),
    loadingState: $('loading-state'),
    errorState: $('error-state'),
    errorTitle: $('error-title'),
    errorMessage: $('error-message'),
    weatherContent: $('weather-content'),
    cityName: $('city-name'),
    regionCountry: $('region-country'),
    tempValue: $('temp-value'),
    conditionIcon: $('condition-icon'),
    conditionText: $('condition-text'),
    lastUpdated: $('last-updated'),
    heroWeatherIcon: $('hero-weather-icon'),
    feelsLike: $('feels-like'),
    humidity: $('humidity'),
    wind: $('wind'),
    pressure: $('pressure'),
    visibility: $('visibility'),
    uvIndex: $('uv-index'),
    hourlyScroll: $('hourly-scroll'),
    forecastGrid: $('forecast-grid'),
    sunrise: $('sunrise'),
    sunset: $('sunset'),
    moonrise: $('moonrise'),
    moonPhase: $('moon-phase'),
};

let apiKey = localStorage.getItem(STORAGE_KEY_API) || '';

// ===== INIT =====
function init() {
    createParticles();
    setupEventListeners();

    if (!apiKey) {
        dom.apiKeyModal.classList.remove('hidden');
    } else {
        dom.apiKeyModal.classList.add('hidden');
        const lastCity = localStorage.getItem(STORAGE_KEY_LAST);
        if (lastCity) fetchWeather(lastCity);
    }
}

// ===== PARTICLES =====
function createParticles() {
    const count = 30;
    for (let i = 0; i < count; i++) {
        const p = document.createElement('div');
        p.classList.add('particle');
        const size = Math.random() * 6 + 2;
        p.style.width = `${size}px`;
        p.style.height = `${size}px`;
        p.style.left = `${Math.random() * 100}%`;
        p.style.animationDuration = `${Math.random() * 15 + 10}s`;
        p.style.animationDelay = `${Math.random() * 10}s`;
        dom.particles.appendChild(p);
    }
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    dom.saveApiKeyBtn.addEventListener('click', saveApiKey);
    dom.apiKeyInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') saveApiKey();
    });

    dom.searchBtn.addEventListener('click', handleSearch);
    dom.searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
}

function saveApiKey() {
    const key = dom.apiKeyInput.value.trim();
    if (!key) {
        dom.apiKeyInput.style.borderColor = '#ef4444';
        dom.apiKeyInput.focus();
        return;
    }
    apiKey = key;
    localStorage.setItem(STORAGE_KEY_API, key);
    dom.apiKeyModal.classList.add('hidden');
}

function handleSearch() {
    const city = dom.searchInput.value.trim();
    if (!city) return;
    fetchWeather(city);
}

// ===== FETCH WEATHER =====
async function fetchWeather(city) {
    showState('loading');

    try {
        const res = await fetch(
            `${API_BASE}/forecast.json?key=${apiKey}&q=${encodeURIComponent(city)}&days=3&aqi=no&alerts=no`
        );

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            if (res.status === 401 || res.status === 403) {
                showError('Invalid API Key', 'Your API key is invalid or expired. Please refresh and enter a new one.');
                localStorage.removeItem(STORAGE_KEY_API);
                return;
            }
            if (res.status === 400) {
                showError('City Not Found', `We couldn't find "${city}". Please check the name and try again.`);
                return;
            }
            showError('Something Went Wrong', err.error?.message || 'An unexpected error occurred.');
            return;
        }

        const data = await res.json();
        localStorage.setItem(STORAGE_KEY_LAST, city);
        renderWeather(data);
    } catch (err) {
        showError('Network Error', 'Could not connect to WeatherAPI. Please check your internet connection.');
    }
}

// ===== RENDER =====
function renderWeather(data) {
    const { location, current, forecast } = data;
    const today = forecast.forecastday[0];

    // -- Location & temp
    dom.cityName.textContent = location.name;
    dom.regionCountry.textContent = `${location.region ? location.region + ', ' : ''}${location.country}`;
    dom.tempValue.textContent = Math.round(current.temp_c);
    dom.conditionIcon.src = `https:${current.condition.icon}`;
    dom.conditionIcon.alt = current.condition.text;
    dom.conditionText.textContent = current.condition.text;
    dom.heroWeatherIcon.src = `https:${current.condition.icon}`.replace('64x64', '128x128');
    dom.heroWeatherIcon.alt = current.condition.text;
    dom.lastUpdated.textContent = `Updated ${formatTime(current.last_updated)}`;

    // -- Stats
    dom.feelsLike.textContent = `${Math.round(current.feelslike_c)}°C`;
    dom.humidity.textContent = `${current.humidity}%`;
    dom.wind.textContent = `${current.wind_kph} km/h ${current.wind_dir}`;
    dom.pressure.textContent = `${current.pressure_mb} mb`;
    dom.visibility.textContent = `${current.vis_km} km`;
    dom.uvIndex.textContent = `${current.uv} — ${getUVLabel(current.uv)}`;

    // -- Sun & Moon
    dom.sunrise.textContent = today.astro.sunrise;
    dom.sunset.textContent = today.astro.sunset;
    dom.moonrise.textContent = today.astro.moonrise;
    dom.moonPhase.textContent = today.astro.moon_phase;

    // -- Hourly
    renderHourly(today.hour, location.localtime);

    // -- Forecast
    renderForecast(forecast.forecastday);

    // -- Dynamic background
    updateBackground(current.condition.code, current.is_day);

    showState('weather');
}

function renderHourly(hours, localtime) {
    const now = new Date(localtime);
    const currentHour = now.getHours();

    dom.hourlyScroll.innerHTML = hours.map((h, i) => {
        const isNow = i === currentHour;
        const time = i === currentHour ? 'Now' : formatHour(h.time);
        const rain = h.chance_of_rain > 0 ? `💧 ${h.chance_of_rain}%` : '';
        return `
            <div class="hourly-card ${isNow ? 'now' : ''}">
                <span class="hourly-time">${time}</span>
                <img src="https:${h.condition.icon}" alt="${h.condition.text}" width="36" height="36">
                <span class="hourly-temp">${Math.round(h.temp_c)}°</span>
                ${rain ? `<span class="hourly-rain">${rain}</span>` : ''}
            </div>
        `;
    }).join('');

    // Scroll to current hour
    requestAnimationFrame(() => {
        const nowCard = dom.hourlyScroll.querySelector('.now');
        if (nowCard) nowCard.scrollIntoView({ inline: 'center', behavior: 'smooth' });
    });
}

function renderForecast(days) {
    dom.forecastGrid.innerHTML = days.map((d, i) => {
        const dayName = i === 0 ? 'Today' : getDayName(d.date);
        return `
            <div class="forecast-card">
                <span class="forecast-day">${dayName}</span>
                <img src="https:${d.day.condition.icon}" alt="${d.day.condition.text}" width="40" height="40">
                <span class="forecast-condition">${d.day.condition.text}</span>
                <span class="forecast-rain">💧 ${d.day.daily_chance_of_rain}%</span>
                <div class="forecast-temps">
                    <span class="forecast-high">${Math.round(d.day.maxtemp_c)}°</span>
                    <span class="forecast-low">${Math.round(d.day.mintemp_c)}°</span>
                </div>
            </div>
        `;
    }).join('');
}

// ===== DYNAMIC BACKGROUND =====
function updateBackground(code, isDay) {
    const root = document.documentElement;

    // Weather code groups from WeatherAPI docs
    const themes = {
        clear:   { start: '#1a73e8', mid: '#4fc3f7', end: '#0d47a1' },
        clearNight: { start: '#0f0c29', mid: '#302b63', end: '#24243e' },
        cloudy:  { start: '#546e7a', mid: '#78909c', end: '#37474f' },
        rain:    { start: '#1a237e', mid: '#283593', end: '#0d1b3e' },
        snow:    { start: '#4a6572', mid: '#7b95a5', end: '#334955' },
        thunder: { start: '#1a1a2e', mid: '#16213e', end: '#0f3460' },
        mist:    { start: '#636e72', mid: '#b2bec3', end: '#2d3436' },
    };

    let theme;
    if (code === 1000) {
        theme = isDay ? themes.clear : themes.clearNight;
    } else if ([1003, 1006, 1009].includes(code)) {
        theme = themes.cloudy;
    } else if ([1063, 1150, 1153, 1168, 1171, 1180, 1183, 1186, 1189, 1192, 1195, 1198, 1201, 1240, 1243, 1246].includes(code)) {
        theme = themes.rain;
    } else if ([1066, 1069, 1072, 1114, 1117, 1204, 1207, 1210, 1213, 1216, 1219, 1222, 1225, 1237, 1249, 1252, 1255, 1258, 1261, 1264].includes(code)) {
        theme = themes.snow;
    } else if ([1087, 1273, 1276, 1279, 1282].includes(code)) {
        theme = themes.thunder;
    } else if ([1030, 1135, 1147].includes(code)) {
        theme = themes.mist;
    } else {
        theme = isDay ? themes.clear : themes.clearNight;
    }

    root.style.setProperty('--bg-start', theme.start);
    root.style.setProperty('--bg-mid', theme.mid);
    root.style.setProperty('--bg-end', theme.end);
}

// ===== HELPERS =====
function showState(state) {
    dom.welcomeState.classList.add('hidden');
    dom.loadingState.classList.add('hidden');
    dom.errorState.classList.add('hidden');
    dom.weatherContent.classList.add('hidden');

    switch (state) {
        case 'welcome': dom.welcomeState.classList.remove('hidden'); break;
        case 'loading': dom.loadingState.classList.remove('hidden'); break;
        case 'error':   dom.errorState.classList.remove('hidden'); break;
        case 'weather': dom.weatherContent.classList.remove('hidden'); break;
    }
}

function showError(title, message) {
    dom.errorTitle.textContent = title;
    dom.errorMessage.textContent = message;
    showState('error');
}

function formatTime(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function formatHour(timeStr) {
    const d = new Date(timeStr);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
}

function getDayName(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function getUVLabel(uv) {
    if (uv <= 2) return 'Low';
    if (uv <= 5) return 'Moderate';
    if (uv <= 7) return 'High';
    if (uv <= 10) return 'Very High';
    return 'Extreme';
}

// ===== START =====
document.addEventListener('DOMContentLoaded', init);
