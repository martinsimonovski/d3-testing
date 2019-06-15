import * as d3 from 'd3';
import '../styles/index.scss';
import colors from './colors';
import moment from 'moment';
import utils from './utils';

/*
const conf = {
  data: data,
  container: '#chart',
  box_padding: 10,
  metrics: {
    type: 'yearly',
    from: '2018-01-01',
    to: null,
    subType: 'months'
  }
};
*/

function getBoundaries(metrics) {
  let months = [];
  let headerRanges = [];
  let subHeaderRanges = [];
  let dateBoundary = [];

  if (metrics.type === 'overall') {
    const years = utils.getOverallYears(metrics.startDate);
    headerRanges = [utils.getOverallBoundaries(years)];
    months = [headerRanges[0].startDate, headerRanges[0].endDate];
    subHeaderRanges = utils.getOverallYearBoundaries(years);
  } else if (metrics.type === 'yearly') {
    months = utils.getMonthsOfTheYear(metrics.startDate);
    headerRanges = [utils.getYearBoundary(metrics.startDate)];
    subHeaderRanges = utils.getMonthsRange(months);
  } else if (metrics.type === 'quarterly') {
    const quarter = utils.getQuarter(metrics.startDate);
    months = utils.getQuarterMonths(metrics.startDate);
    subHeaderRanges = utils.getMonthsRange(months);
    headerRanges = [utils.getQuarterHeaderRanges(months, quarter)];
    if (metrics.subType === 'week') {
      subHeaderRanges = utils.getWeeksRange(
        headerRanges[0].startDate,
        headerRanges[0].endDate
      );
    }
  } else if (metrics.type === 'monthly') {
    const sDate = moment(metrics.startDate);
    const eDate = metrics.endDate
      ? moment(metrics.endDate)
      : sDate.clone().endOf('month');
    subHeaderRanges = utils.getWeeksRange(
      sDate.format('DD MMM YYYY'),
      eDate.format('DD MMM YYYY')
    );

    headerRanges = [
      utils.getMontlyBoundaries(
        sDate.format('DD MMM YYYY'),
        eDate.format('DD MMM YYYY')
      )
    ];
    headerRanges[0].name = 'Monthly by Week';
    months = [headerRanges[0].startDate, headerRanges[0].endDate];

    if (metrics.subType === 'days') {
      subHeaderRanges = utils.getDaysRange(sDate, eDate);
    }
  }

  dateBoundary[0] = moment(months[0], 'MMM YYYY')
    .startOf('month')
    .toDate();
  dateBoundary[1] = moment(months[months.length - 1], 'MMM YYYY')
    .endOf('month')
    .toDate();

  return {
    months,
    headerRanges,
    subHeaderRanges,
    dateBoundary
  };
}

export const gantt = config => {
  const { metrics, container, data } = config;
  const element = d3.select(container);
  const chartWidth = element._groups[0][0].offsetWidth;
  const chartHeight = 500;
  const cellHeight = 30;

  draw('initial');
  function draw(state) {
    d3.select(container)._groups[0][0].innerHTML = '';
    let { months, headerRanges, subHeaderRanges, dateBoundary } = getBoundaries(
      metrics
    );

    // DEFINE DIMENSIONS
    let margin = { top: 20, right: 50, bottom: 100, left: 50 };
    let width = d3.max([chartWidth, 500]) - margin.left - margin.right;
    let height = chartHeight - margin.top - margin.bottom;

    const x = d3
      .scaleTime()
      .domain(dateBoundary)
      .range([0, width]);

    const y = d3.scaleBand().range([0, height], 0.1);

    y.domain(data.map((d, i) => i + 1));

    // DEFINE AXISES
    const xAxis = d3.axisBottom().tickFormat(d3.timeFormat('%d/%m/%Y'));
    const yAxis = d3
      .axisLeft()
      .tickSize(0)
      .tickPadding(6);

    // DEFINE SECTIONS
    const headerSection = element
      .append('div')
      .attr('class', 'header-section')
      .style('height', cellHeight)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', cellHeight)
      .append('g');

    const periodSection = element
      .append('div')
      .attr('class', 'period-section')
      .style('height', cellHeight)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', cellHeight)
      .append('g');

    switch (state) {
      case 'initial':
        headerSection.attr('transform', `translate(${margin.left}, 30)`);
        periodSection.attr('transform', `translate(${margin.left}, 0)`);
        break;
    }

    const drawArea = element
      .append('div')
      .attr('class', 'draw-area')
      .append('svg')
      .attr('class', 'drawareaSvg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);

    const svg = drawArea
      .append('g')
      .attr('transform', `translate(${margin.left}, 0)`)
      .call(appendStartLine);

    function appendStartLine() {
      d3.selectAll('.start-lines')
        .data(data)
        .enter()
        .append('line')
        .attr('class', 'start-lines')
        .attr('stroke', d => d.color)
        .attr('x1', d => x(new Date(d.startDate)) + 10)
        .attr('x2', d => x(new Date(d.endDate)) + 10)
        .attr('y1', 0)
        .attr('y2', (d, i) => y(i + 1) + 20);

      d3.selectAll('.endLines')
        .data(data)
        .enter()
        .append('line')
        .attr('stroke', d => d.color)
        .attr('class', 'end-lines')
        .attr('x1', d => x(new Date(d.endDate)) + 5)
        .attr('x2', d => x(new Date(d.endDate)) + 5)
        .attr('y1', 0)
        .attr('y2', (d, i) => y(i + 1) + 20);
    }

    const lines = svg.append('g').attr('transform', 'translate(0, 0)');

    headerSection
      .selectAll('.bar')
      .data(headerRanges)
      .enter()
      .append('text')
      .attr('class', 'first-title')
      .attr('y', -5)
      .attr('x', d => x(new Date(d.startDate)) + getWidth(d) / 2)
      .attr('width', d => getWidth(d))
      .attr('height', y.bandwidth())
      .text(d => d.name);

    periodSection
      .append('rect')
      .attr('x', x(new Date(dateBoundary[0])))
      .attr(
        'width',
        Math.abs(x(new Date(dateBoundary[0])) - x(new Date(dateBoundary[1])))
      )
      .attr('height', cellHeight)
      .attr('class', 'Date-Block-Outline');

    periodSection
      .append('g')
      .selectAll('.bar')
      .data(subHeaderRanges)
      .enter()
      .append('rect')
      .attr('x', d => x(new Date(d.startDate)))
      .attr('width', d => getWidth(d))
      .attr('height', cellHeight)
      .attr(
        'class',
        d => `Date-Block Date-${moment(d.startDate).format('MMYYYY')}`
      );

    periodSection
      .append('g')
      .selectAll('.bar')
      .data(subHeaderRanges)
      .enter()
      .append('text')
      .attr('x', d => x(new Date(d.startDate)) + 10)
      .attr('width', d => getWidth(d))
      .attr('y', cellHeight - 10)
      .text(d => d.name)
      .attr(
        'class',
        d => `second-title Date Date-${moment(d).format('MMYYYY')}`
      );

    lines
      .selectAll('.lines')
      .data(subHeaderRanges)
      .enter()
      .append('line')
      .attr('class', 'date-line')
      .attr('x1', d => x(new Date(d.startDate)))
      .attr('x2', d => x(new Date(d.startDate)))
      .attr('y1', 0)
      .attr('y2', height);

    const bars = svg.append('g').attr('transform', 'translate(0, 20)');

    const blocks = bars
      .selectAll('.bar')
      .data(data)
      .enter()
      .append('g')
      .attr('class', 'single-block cp')
      .attr('transform', d => {
        if (d.startDate) {
          return `translate(${x(new Date(d.startDate))}, 0)`;
        }
      })
      .call(appendBar);

    function getWidth(node) {
      if (endsAfter(node)) {
        width = Math.abs(
          x(new Date(dateBoundary[1])) - x(new Date(node.startDate))
        );
      } else if (startsBefore(node)) {
        width = Math.abs(
          x(new Date(dateBoundary[0])) - x(new Date(node.endDate))
        );
      } else {
        width = getActualWidth(node);
      }
      return width;
    }

    function getActualWidth(node) {
      return Math.abs(x(new Date(node.endDate)) - x(new Date(node.startDate)));
    }

    function startsBefore(node) {
      return moment(node.startDate, 'MM/DD/YYYY').isBefore(dateBoundary[0]);
    }

    function endsAfter(node) {
      return moment(node.endDate, 'MM/DD/YYYY').isAfter(dateBoundary[1]);
    }

    function appendBar(d, i) {
      d.append('rect')
        .attr('class', 'Single-node')
        .attr('rx', 5)
        .attr('ry', 5)
        .attr('height', 20)
        .attr('x', 0)
        .attr('y', (d, i) => {
          console.log(y(i + 1));
          return y(i + 1);
        })
        .attr('width', d => (d.startDate ? getActualWidth(d) + 10 : 0))
        .attr('fill', (d, i) => `#${colors[i]}`);
    }
  }
};
