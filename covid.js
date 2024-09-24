import '/styles.scss'; 
import Chart from 'chart.js/auto';

const regionsUrl = 'https://covid-api.com/api/regions';
const reportsUrl = 'https://covid-api.com/api/reports';

export const ListOfRegions = async (regionDropdown, errorSection) => {
    try {
        const response = await fetch(regionsUrl);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        const sortedRegions = data.data.sort((a, b) => a.name.localeCompare(b.name));
        populateRegionDropdown(sortedRegions, regionDropdown);
    } catch (error) {
        console.error('Error fetching regions:', error);
        errorSection.style.display = 'block';
        errorSection.textContent = 'Error loading regions.';
    }
};

const populateRegionDropdown = (regions, regionDropdown) => {
    regionDropdown.innerHTML = '';
    regions.forEach(region => {
        const option = document.createElement('option');
        option.value = region.name;
        option.textContent = region.name;
        regionDropdown.appendChild(option);
    });
};

export const fetchProvincesForRegion = async (regionName, provinceDropdown, errorSection) => {
    try {
        const response = await fetch(`${reportsUrl}?region_name=${regionName}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        const provinces = [...new Set(data.data.map(report => report.region.province).filter(Boolean))];
        populateProvinceDropdown(provinces, provinceDropdown);
    } catch (error) {
        console.error('Error fetching provinces:', error);
        errorSection.style.display = 'block';
        errorSection.textContent = 'Error loading provinces.';
    }
};

const populateProvinceDropdown = (provinces, provinceDropdown) => {
    provinceDropdown.innerHTML = '';
    provinces.forEach(province => {
        const option = document.createElement('option');
        option.value = province;
        option.textContent = province;
        provinceDropdown.appendChild(option);
    });
};

export const Reports = async (regionDropdown, provinceDropdown, resultsContainer, errorSection) => {
    const regionName = regionDropdown.value;
    const provinceISO = provinceDropdown.value;
    resultsContainer.innerHTML = '';

    if (!provinceISO) {
        alert('Please select a valid province.');
        return;
    }

    const url = `${reportsUrl}?region_name=${regionName}&region_province=${provinceISO}`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        displayReports(data.data, resultsContainer);
        createCharts(data.data);
    } catch (error) {
        console.error('Error fetching reports:', error);
        errorSection.style.display = 'block';
        errorSection.textContent = 'Error fetching reports.';
    }
};

const displayReports = (reports, resultsContainer) => {
    resultsContainer.innerHTML = '';
    if (reports.length === 0) {
        resultsContainer.innerHTML = '<p>No reports found for the selected region and province.</p>';
        return;
    }

    reports.forEach(report => {
        const reportDiv = document.createElement('div');
        reportDiv.classList.add('report');
        reportDiv.innerHTML = `
            <h3><strong>COVID-19 Data for ${report.region.province} on ${report.date}</strong></h3>
            <p>Confirmed Cases: ${report.confirmed}</p>
            <p>Deaths: ${report.deaths}</p>
            <p>Recovered: ${report.recovered}</p>
        `;
        resultsContainer.appendChild(reportDiv);
    });
};

const createCharts = (reports) => {
    const dates = reports.map(report => report.date);
    const confirmed = reports.map(report => report.confirmed);
    const deaths = reports.map(report => report.deaths);
    const recovered = reports.map(report => report.recovered);

  
    const ctxConfirmed = document.getElementById('covidChartConfirmed').getContext('2d');
    new Chart(ctxConfirmed, {
        type: 'bar',
        data: {
            labels: dates,
            datasets: [{
                label: 'Confirmed Cases',
                data: confirmed,
                backgroundColor: 'rgba(255, 99, 132, 0.6)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    
    const ctxDeaths = document.getElementById('covidChartDeaths').getContext('2d');
    new Chart(ctxDeaths, {
        type: 'bar',
        data: {
            labels: dates,
            datasets: [{
                label: 'Deaths',
                data: deaths,
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });


    const ctxRecovered = document.getElementById('covidChartRecovered').getContext('2d');
    new Chart(ctxRecovered, {
        type: 'pie',
        data: {
            labels: ['Recovered', 'Deaths'],
            datasets: [{
                data: [recovered.reduce((a, b) => a + b, 0), deaths.reduce((a, b) => a + b, 0)],
                backgroundColor: [
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(255, 99, 132, 0.6)'
                ],
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Total Recovered vs Deaths'
                }
            }
        }
    });
};

export const getdatabydate = async (date, reportDataSection, errorSection) => {
    try {
        const response = await fetch(`https://covid-api.com/api/reports/total?date=${date}`);
        const data = await response.json();
        if (data.data) {
            displayData(data.data, reportDataSection);
            createDateChart(data.data); 
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

const displayData = (data, reportDataSection) => {
    reportDataSection.innerHTML = ''; 

    const dataCard = document.createElement('div');
    dataCard.classList.add('data-card');

    dataCard.innerHTML = `
        <h3>COVID-19 Data for ${data.date}</h3>
        <p><strong>Last Update:</strong> ${data.last_update || 'N/A'}</p>
        <p><strong>Confirmed:</strong> ${data.confirmed || 'N/A'}</p>
        <p><strong>Deaths:</strong> ${data.deaths || 'N/A'}</p>
        <p><strong>Recovered:</strong> ${data.recovered || 'N/A'}</p>
        <p><strong>Active:</strong> ${data.active || 'N/A'}</p>
        <p><strong>Fatality Rate:</strong> ${data.fatality_rate ? (data.fatality_rate * 100).toFixed(2) + '%' : 'N/A'}</p>
    `;

    reportDataSection.appendChild(dataCard);
};

const createDateChart = (data) => {
    const ctxDate = document.getElementById('covidChartByDate').getContext('2d');
    new Chart(ctxDate, {
        type: 'line',
        data: {
            labels: [data.date],
            datasets: [
                {
                    label: 'Confirmed Cases',
                    data: [data.confirmed],
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.6)',
                    fill: true
                },
                {
                    label: 'Deaths',
                    data: [data.deaths],
                    borderColor: 'rgba(54, 162, 235, 1)',
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                    fill: true
                },
                {
                    label: 'Recovered',
                    data: [data.recovered],
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    fill: true
                }
            ]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
};