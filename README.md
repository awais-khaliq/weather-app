# SkyPulse: Real-Time Weather Analysis Tool

A web-based meteorological application designed to provide comprehensive, real-time weather data and forecasts across global locations.

## Overview

SkyPulse serves as a streamlined interface for environmental data retrieval, utilizing the WeatherAPI to supply users with live atmospheric conditions, hourly predictions, and multi-day outlooks. The application focuses on data clarity and visual fidelity, using a custom-built rendering engine that adapts the interface aesthetics based on the retrieved weather status.

## Core Features

* Global City Search: Instant access to meteorological data for any international locality.
* Detailed Atmospheric Metrics: Real-time tracking of temperature, apparent temperature ("feels like"), humidity, barometric pressure, UV index, and visibility.
* Short-Term Forecasting: A granular 24-hour breakdown including precipitation probabilities and temperature fluctuations.
* Long-Term Outlook: A 3-day overview highlighting expected daily extremes and condition trends.
* Astronomical Data: Accurate calculations for sunrise, sunset, and lunar phases.
* Adaptive Environment Engine: A dynamic CSS background system that adjusts color palettes and particle effects in response to specific weather states (Rain, Snow, Thunder, etc.).
* Responsive Design: Optimized for both desktop and mobile viewports with a frosted glassmorphism interface.

## Technical Implementation

* Frontend: Semantic HTML5 and Vanilla JavaScript (ES6+).
* Styling: Advanced CSS3 utilizing custom properties (CSS variables), Flexbox/Grid layouts, and hardware-accelerated animations.
* Data Persistence: LocalStorage integration for API key management and session state.
* API Integration: Asynchronous Fetch API calls to WeatherAPI for JSON data parsing.

## Installation and Setup

1. Clone the repository to your local machine.
2. Obtain a standard API key from WeatherAPI.
3. Open `index.html` in a web browser.
4. Input your API key within the application settings to begin data retrieval.

## Project Structure

* index.html: Document structure and accessibility definitions.
* style.css: Global design system, adaptive themes, and animation keyframes.
* app.js: Core logic, API communication, and dynamic DOM manipulation.
