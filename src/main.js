import * as d3 from 'd3';

const CONFIG = {
    deputes: { count: 577, rows: 10 },
    senateurs: { count: 348, rows: 8 },
    width: 900,
    height: 500,
    margin: { top: 50, right: 50, bottom: 50, left: 50 }
};

const PARTY_COLORS = {
    // Assemblée Nationale
    'RN': '#000030',
    'LR': '#0066cc',
    'REN': '#ffeb00',
    'RE': '#ffeb00',
    'MODEM': '#ff9900',
    'HOR': '#00ffff',
    'SOC': '#ff8080',
    'ECO': '#00c000',
    'LFI': '#cc2443',
    'GDR': '#dd0000',
    'LIOT': '#808080',
    'NI': '#999999',
    // Sénat
    'SER': '#ff8080',
    'CRCE': '#dd0000',
    'CRC': '#dd0000',
    'UC': '#00ffff',
    'RDPI': '#ffeb00',
    'RDSE': '#ff9900',
    'RTLI': '#808080',
    'UMP': '#0066cc',
    'UDI': '#00ffff'
};

let currentHouse = 'deputes';
let currentYear = '2024';
let dataCache = {};
let convictions = [];

const LEGISLATURES = {
    deputes: [
        { value: '2024', label: '2024-Présent' },
        { value: '2022', label: '2022-2024' },
        { value: '2017', label: '2017-2022' },
        { value: '2012', label: '2012-2017' }
    ],
    senateurs: [
        { value: '2023', label: '2023-Présent' },
        { value: '2017', label: '2017-2023' }
    ]
};

async function init() {
    try {
        const convictionsData = await d3.json('./data/convictions.json');
        convictions = convictionsData;
        updateYearSelector();
        setupEventListeners();
        await loadAndRender();
    } catch (error) {
        console.error("Failed to load convictions:", error);
    }
}

function updateYearSelector() {
    const selector = d3.select('#year-select');
    const options = LEGISLATURES[currentHouse];

    selector.selectAll('option').remove();

    selector.selectAll('option')
        .data(options)
        .enter()
        .append('option')
        .attr('value', d => d.value)
        .text(d => d.label);

    currentYear = options[0].value;
    selector.property('value', currentYear);
}

async function loadAndRender() {
    const cacheKey = `${currentHouse}_${currentYear}`;
    if (!dataCache[cacheKey]) {
        let filename = `./data/${currentHouse}_${currentYear}.json`;

        try {
            const rawData = await d3.json(filename);
            if (currentHouse === 'deputes') {
                dataCache[cacheKey] = rawData.deputes.map(d => d.depute);
            } else {
                dataCache[cacheKey] = rawData.senateurs ? rawData.senateurs.map(s => s.senateur) : [];
            }
        } catch (e) {
            console.error(`Failed to load ${filename}`, e);
            dataCache[cacheKey] = [];
        }
    }
    render();
}

function setupEventListeners() {
    d3.select('#house-select').on('change', function() {
        currentHouse = this.value;
        updateYearSelector();
        loadAndRender();
    });

    d3.select('#year-select').on('change', function() {
        currentYear = this.value;
        loadAndRender();
    });
}

function calculateSeatPositions(count, rows) {
    const positions = [];
    const maxRadius = 380;
    const rowSpacing = 30;
    const center = { x: CONFIG.width / 2, y: CONFIG.height - 40 };

    // Calculate total weight (sum of radii) to distribute seats proportionally
    let totalRadiusSum = 0;
    for (let r = 0; r < rows; r++) {
        totalRadiusSum += (maxRadius - r * rowSpacing);
    }

    let seatIndex = 0;
    for (let r = 0; r < rows; r++) {
        const rowRadius = maxRadius - (r * rowSpacing);
        const rowWeight = rowRadius / totalRadiusSum;
        const seatsInRow = Math.round(count * rowWeight);

        // Ensure we don't go over total count on last rows
        const actualSeatsInRow = Math.min(seatsInRow, count - seatIndex);

        for (let s = 0; s < actualSeatsInRow; s++) {
            const angleRange = Math.PI - 0.2; // Leave a small margin at the ends
            const angleStep = angleRange / (actualSeatsInRow - 1);
            const angle = Math.PI + 0.1 + (s * angleStep);

            positions.push({
                x: center.x + rowRadius * Math.cos(angle),
                y: center.y + rowRadius * Math.sin(angle),
                row: r,
                col: s
            });
            seatIndex++;
        }
    }

    // If we have some seats left due to rounding, add them to outer rows or spread them
    // (In practice, Math.round and the loop should be close enough for a visualization)

    return positions;
}

function render() {
    const houseConfig = CONFIG[currentHouse];
    const cacheKey = `${currentHouse}_${currentYear}`;
    const data = dataCache[cacheKey] || [];
    const positions = calculateSeatPositions(houseConfig.count, houseConfig.rows);

    const svg = d3.select('#hemicycle')
        .html('')
        .append('svg')
        .attr('viewBox', `0 0 ${CONFIG.width} ${CONFIG.height}`);

    const seats = svg.selectAll('.seat-group')
        .data(positions.slice(0, data.length))
        .enter()
        .append('g')
        .attr('class', 'seat-group')
        .attr('transform', d => `translate(${d.x},${d.y})`);

    seats.each(function(d, i) {
        const official = data[i];
        const officialConvictions = convictions.filter(c => {
            const match = c.name.toLowerCase() === official.nom.toLowerCase();
            if (match) console.log(`Found match for ${official.nom}`);
            return match;
        });
        const g = d3.select(this)
            .style('cursor', 'pointer')
            .on('mouseover', (event) => showTooltip(event, official, officialConvictions))
            .on('mouseout', hideTooltip)
            .on('click', () => showDetail(official, officialConvictions));

        // Base seat circle
        g.append('circle')
            .attr('class', 'seat')
            .attr('r', 8)
            .attr('fill', PARTY_COLORS[official.groupe_sigle] || '#ccc')
            .attr('stroke', '#fff')
            .attr('stroke-width', 1);

        // Conviction markers
        if (officialConvictions.length > 0) {
            // Draw rings for each conviction
            officialConvictions.forEach((c, index) => {
                g.append('circle')
                    .attr('class', 'conviction-marker')
                    .attr('r', 10 + (index * 3))
                    .attr('fill', 'none')
                    .attr('stroke', '#e74c3c')
                    .attr('stroke-width', 1.5)
                    .attr('opacity', 0.8)
                    .style('pointer-events', 'none');
            });
        }
    });
}

function showTooltip(event, official, officialConvictions) {
    const tooltip = d3.select('#tooltip');
    const convictionText = officialConvictions.length > 0
        ? `<br/><span style="color: #e74c3c;">⚠️ ${officialConvictions.length} condamnation(s)</span>`
        : '';

    tooltip.classed('hidden', false)
        .html(`<strong>${official.nom}</strong><br/>${official.groupe_sigle || 'Sans groupe'}${convictionText}`)
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 20) + 'px');
}

function hideTooltip() {
    d3.select('#tooltip').classed('hidden', true);
}

function showDetail(official, officialConvictions) {
    const panel = d3.select('#info-panel');
    panel.classed('hidden', false);

    d3.select('#info-name').text(official.nom);
    d3.select('#info-party').text(official.groupe_sigle);

    const convictionsDiv = d3.select('#info-convictions').html('');

    if (officialConvictions.length > 0) {
        officialConvictions.forEach(c => {
            const item = convictionsDiv.append('div').attr('class', 'conviction-item');
            item.append('div').attr('class', 'conviction-type').text(c.type + ` (${c.year})`);
            item.append('div').attr('class', 'conviction-desc').text(c.description);
            item.append('div').attr('class', 'conviction-source').text(`Source: ${c.source}`);
        });
    } else {
        convictionsDiv.append('p').text('Aucune condamnation recensée dans notre base.');
    }
}

init();
