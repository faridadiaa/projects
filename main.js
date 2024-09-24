import { ListOfRegions, fetchProvincesForRegion, Reports, getdatabydate } from '/covid.js';

document.querySelector('#app').innerHTML = `
  <div id="province-container">
    <select id="regions" class="province-container__dropdown province-container__dropdown--region"></select>
    <select id="province-dropdown" class="province-container__dropdown province-container__dropdown--province" style="margin-left: 10px;"></select>
    <button id="fetch-reports" class="province-container__button">Fetch Reports</button>
  </div>
  <div id="results-container"></div>
  <div id="error-section" class="error-section" style="display: none;"></div>
  
  <div class="chart-container">
    <canvas id="covidChartConfirmed"></canvas>
    <canvas id="covidChartDeaths"></canvas>
    <canvas id="covidChartRecovered"></canvas>
  </div>
  
  <div id="date-container">
    <input type="date" id="date-input" />
    <button id="fetch-date-reports" class="province-container__button">Fetch Reports by Date</button>
    <div id="report-data-section"></div>
  </div>
  <div id="date-error-section" class="error-section" style="display: none;"></div>
  <canvas id="covidChartByDate"></canvas>
`;

const regionDropdown = document.getElementById('regions');
const provinceDropdown = document.getElementById('province-dropdown');
const resultsContainer = document.getElementById('results-container');
const errorSection = document.getElementById('error-section');
const reportDataSection = document.getElementById('report-data-section');
const dateErrorSection = document.getElementById('date-error-section');

ListOfRegions(regionDropdown, errorSection);
regionDropdown.addEventListener('change', () => fetchProvincesForRegion(regionDropdown.value, provinceDropdown, errorSection));
document.getElementById('fetch-reports').addEventListener('click', () => Reports(regionDropdown, provinceDropdown, resultsContainer, errorSection));
document.getElementById('fetch-date-reports').addEventListener('click', () => {
    const date = document.getElementById('date-input').value;
    if (!date) {
        alert('Please select a date.');
        return;
    }
    getdatabydate(date, reportDataSection, dateErrorSection);
});
