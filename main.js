import '/styles.css';

const regionsUrl = 'https://covid-api.com/api/regions';
const reportsUrl = 'https://covid-api.com/api/reports';

const body = document.body;


const provinceContainer = document.createElement('div');
provinceContainer.style.display = 'flex';
provinceContainer.style.alignItems = 'center';
provinceContainer.style.marginBottom = '20px';

const regionDropdown = document.createElement('select');
regionDropdown.id = 'regions';
provinceContainer.appendChild(regionDropdown);

const provinceInput = document.createElement('input');
provinceInput.id = 'province-input';
provinceInput.placeholder = 'Enter province ISO code';
provinceInput.style.marginLeft = '10px';
provinceContainer.appendChild(provinceInput);

const buttonFetchReports = document.createElement('button');
buttonFetchReports.id = 'fetch-reports';
buttonFetchReports.textContent = 'Generate Report';
buttonFetchReports.style.marginLeft = '10px';
provinceContainer.appendChild(buttonFetchReports);

body.appendChild(provinceContainer);


const dateContainer = document.createElement('div');
dateContainer.style.display = 'flex';
dateContainer.style.alignItems = 'center';
dateContainer.style.marginBottom = '20px';

const dateInput = document.createElement('input');
dateInput.id = 'date-input';
dateInput.type = 'date';
dateContainer.appendChild(dateInput);

const buttonDate = document.createElement('button');
buttonDate.id = 'button-date';
buttonDate.textContent = 'Get Data by Date';
buttonDate.style.marginLeft = '10px';
dateContainer.appendChild(buttonDate);

body.appendChild(dateContainer);

const reportDataSection = document.createElement('div');
reportDataSection.id = 'reportData';
body.appendChild(reportDataSection);

const resultsContainer = document.createElement('div');
resultsContainer.id = 'results';
body.appendChild(resultsContainer);

const errorSection = document.createElement('div');
errorSection.id = 'error';
errorSection.style.display = 'none';
body.appendChild(errorSection);

const ListOfRegions = async () => {
    try {
        const response = await fetch(regionsUrl);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        populateRegionDropdown(data.data);
    } catch (error) {
        console.error('Error fetching regions:', error);
        errorSection.style.display = 'block';
        errorSection.textContent = 'Error loading regions.';
    }
};

const populateRegionDropdown = (regions) => {
    regions.forEach(region => {
        const option = document.createElement('option');
        option.value = region.name;
        option.textContent = region.name;
        regionDropdown.appendChild(option);
    });
};

const Reports = async () => {
    const regionName = regionDropdown.value;
    const provinceISO = provinceInput.value.trim();
    resultsContainer.innerHTML = '';

    if (!provinceISO) {
        alert('Please enter a valid province ISO code.');
        return;
    }

    const url = `${reportsUrl}?region_name=${regionName}&region_province=${provinceISO}`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        displayReports(data.data);
    } catch (error) {
        console.error('Error fetching reports:', error);
        errorSection.style.display = 'block';
        errorSection.textContent = 'Error fetching reports.';
    }
};

const displayReports = (reports) => {
    if (reports.length === 0) {
        resultsContainer.innerHTML = '<p>No reports found for the selected region and province.</p>';
        return;
    }

    reports.forEach(report => {
        const reportDiv = document.createElement('div');
        reportDiv.classList.add('report');
        reportDiv.innerHTML = `
            <h3>${report.date}</h3>
            <p><strong>Confirmed Cases:</strong> ${report.confirmed}</p>
            <p><strong>Deaths:</strong> ${report.deaths}</p>
            <p><strong>Recovered:</strong> ${report.recovered}</p>
        `;
        resultsContainer.appendChild(reportDiv);
    });
};

const getdatabydate = async () => {
    const date = dateInput.value;

    try {
        const response = await fetch(`https://covid-api.com/api/reports/total?date=${date}`);
        const data = await response.json();
        if (data.data) {
            displayData(data.data);
        } else {
            console.error('No data available for this date');
            errorSection.style.display = 'block';
            errorSection.textContent = 'No data available for this date.';
        }
    } catch (error) {
        console.error('Error fetching data by date:', error);
        errorSection.style.display = 'block';
        errorSection.textContent = 'Error fetching data by date.';
    }
};

const displayData = (data) => {
    reportDataSection.innerHTML = `
        <h3>COVID-19 Data:</h3>
        <p>Date: ${data.date || 'N/A'}</p>
        <p>Last Update: ${data.last_update || 'N/A'}</p>
        <p>Confirmed: ${data.confirmed || 'N/A'}</p>
        <p>Deaths: ${data.deaths || 'N/A'}</p>
        <p>Recovered: ${data.recovered || 'N/A'}</p>
        <p>Active: ${data.active || 'N/A'}</p>
        <p>Fatality Rate: ${data.fatality_rate || 'N/A'}</p>
    `;
};

buttonDate.addEventListener('click', getdatabydate);
buttonFetchReports.addEventListener('click', Reports);

ListOfRegions();
