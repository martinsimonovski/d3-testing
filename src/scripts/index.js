import * as d3 from 'd3';
import '../styles/index.scss';
import colors from './colors';

import data from './data';
// tutorial
// https://codepen.io/mcolynuck/pen/gxJerq
// https://jsfiddle.net/jallison/2d5rhmo1/17/
// http://layer0.authentise.com/gantt-chart-with-reactjs-and-d3js.html
// https://jsfiddle.net/matehu/w7h81xz2/
// https://jsfiddle.net/matehu/w7h81xz2/
// https://bl.ocks.org/varun-raj/5d2caa6a9ad7de08bd5d86698e3a2403
// http://bl.ocks.org/oluckyman/6199145

const chartOpt = {
  width: 1200,
  height: 700,
  container: '#chart',
  background: 'white',
  data: data,
  from: '2017-1-1',
  to: '2019-6-11',
  tick: 'day' // [day, week, month, threeMonths, ]
};

const flattenSource = source => {
  let x0 = 0,
    y0 = 0,
    barHeight = 20,
    padding = 1,
    shownChildren = [];

  source.forEach(d => {
    d.x = x0;
    d.y = y0;
    let parentX = x0;
    let parentY = y0;

    y0 = y0 + barHeight + padding;

    if (d.assignments) {
      d.assignments.forEach(data => {
        data.x = x0;
        data.y = y0;
        data.parentX = parentX;
        data.parentY = parentY;
        y0 = y0 + barHeight + padding;

        data.name = data.project.name;
        shownChildren.push(data);
      });
    } else if (d._assignments) {
      d._assignments.forEach(data => {
        data.x = parentX;
        data.y = parentY;
        data.parentX = parentX;
        data.parentY = parentY;
        data.name = data.project.name;

        shownChildren.push(data);
      });
    }
  });
};

const Chart = opts => {
  const container = d3.select(opts.container);
  const margin = 60;
  const width = opts.width; // - 2 * margin;
  const height = opts.height; // - 2 * margin;
  const duration = 300;
  const barHeight = 40;
  const barWidth = width * 1;

  // FLATTEN DATA
  const flatData = [];
  data.forEach(item => {
    const assignments = item.assignments;
    delete item.assignments;
    item.parent = null;
    item.name = item.firstName + ' ' + item.lastName;
    flatData.push(item);

    assignments.forEach(a => {
      a.parent = item.id;
      a.name = a.project.name;
      flatData.push(a);
    });
  });

  // FORMAT
  const parseDate = d3.timeParse('%Y-%m-%d');
  const timeScale = d3
    .scaleTime()
    .domain([parseDate(opts.from), parseDate(opts.to)])
    .range([0, width]);

  var svg = d3
    .selectAll('#chart')
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('class', 'svg');

  function makeGantt(data, width, height) {
    const topPadding = 100;
    const sidePadding = 100;

    makeGrid(sidePadding, topPadding, width, height);
  }

  function makeGrid(sP, tP, w, h) {
    const xAxis = d3
      .axisBottom(timeScale)
      .ticks(d3.timeMonth, 1)
      .tickSize(-h + tP + 20, 0, 0)
      .tickFormat(d3.timeFormat('%d %b'));

    const grid = svg
      .append('g')
      .attr('class', 'grid')
      .attr('transform', 'translate(' + sP + ', ' + (h - 50) + ')')
      .call(xAxis)
      .selectAll('text')
      .style('text-anchor', 'middle')
      .attr('fill', '#000')
      .attr('stroke', 'none')
      .attr('font-size', 10)
      .attr('dy', '1em');
  }

  function drawRects(theArray, theGap, theTopPad, theSidePad, theBarHeight) {
    const rectangles = svg
      .append('g')
      .selectAll('rect')
      .data(theArray)
      .enter();

    const innerRects = rectangles
      .append('rect')
      .attr('rx', 3)
      .attr('ry', 3)
      .attr('x', function(d) {
        return timeScale(parseDate(d.from)) + theSidePad;
      })
      .attr('y', function(d, i) {
        return i * theGap + theTopPad;
      })
      .attr('width', function(d) {
        const ts = parseDate(d.to);
        const tt = parseDate(d.from);
        console.log({
          d: d.project ? d.project.name : '',
          ts,
          tt,
          diff: ts - tt
        });
        return timeScale(parseDate(d.to)) - timeScale(parseDate(d.from));
      })
      .attr('height', theBarHeight)
      .attr('stroke', 'none')
      .attr('fill', (d, i) => `#${colors[i]}`);

    var rectText = rectangles
      .append('text')
      .text(function(d) {
        return d.project ? d.project.name : '';
      })
      .attr('x', function(d) {
        return (
          (timeScale(parseDate(d.to)) - timeScale(parseDate(d.from))) / 2 +
          timeScale(parseDate(d.from)) +
          theSidePad
        );
      })
      .attr('y', function(d, i) {
        return i * theGap + 14 + theTopPad;
      })
      .attr('font-size', 11)
      .attr('text-anchor', 'middle')
      .attr('text-height', theBarHeight)
      .attr('fill', '#fff');
  }

  makeGantt(flatData, 1200, 700);
  drawRects(flatData, 25, 100, 100, 20);
};

// new Chart(chartOpt);

// --------------------------------------------------------------------------
import { ganttChart } from './time-working';
var data2 = [
  {
    id: 1,
    title:
      'Make significant improvements in the UI/UX Design Process Make significant improvements in the UI/UX Design Process',
    startDate: '08/08/2016',
    endDate: '03/09/2017',
    value: 67,
    term: 'Short Term',
    completion_percentage: 29,
    color: '#770051'
  },
  {
    id: 2,
    title:
      'Make significant improvements in the UI/UX Design Process Make significant improvements in the UI/UX Design Process',
    startDate: '11/01/2017',
    endDate: '03/09/2018',
    value: 67,
    term: 'Short Term',
    completion_percentage: 29,
    color: '#05f20c'
  },
  {
    id: 3,
    title:
      'Make significant improvements in the UI/UX Design Process Make significant improvements in the UI/UX Design Process',
    startDate: '04/15/2017',
    endDate: '06/14/2017',
    value: 67,
    term: 'Short Term',
    completion_percentage: 29,
    color: '#914ae1'
  },
  {
    id: 4,
    title:
      'Make significant improvements in the UI/UX Design Process Make significant improvements in the UI/UX Design Process',
    startDate: '06/11/2017',
    endDate: '08/30/2017',
    value: 67,
    term: 'Short Term',
    completion_percentage: 29,
    color: '#b79d3b'
  },
  {
    id: 5,
    title:
      'Make significant improvements in the UI/UX Design Process Make significant improvements in the UI/UX Design Process',
    startDate: '07/31/2017',
    endDate: '12/09/2017',
    value: 67,
    term: 'Short Term',
    completion_percentage: 29,
    color: '#423db6'
  }
];

// data = [];

var cycles = [
  {
    id: 1,
    name: 'Cycle 1',
    start_date: '01/01/2017',
    end_date: '02/28/2017'
  },
  {
    id: 2,
    name: 'Cycle 2',
    start_date: '05/01/2017',
    end_date: '06/30/2017'
  },
  {
    id: 3,
    name: 'Cycle 3',
    start_date: '07/01/2017',
    end_date: '10/30/2017'
  },
  {
    id: 3,
    name: 'Cycle 4',
    start_date: '10/01/2017',
    end_date: '12/30/2017'
  }
];

var config = {
  data: data2, // Your actuall data
  element: '#chart', // The element for rendering the chart
  box_padding: 10, // Padding for the blocks
  // metrics: { type: 'overall', years: [2016, 2017, 2018] }, // Type of gantt
  // metrics: { type: 'sprint', year: 2017, cycles: cycles }, // Type of gantt
  metrics: { type: 'yearly', year: 2017 }, // Type of gantt
  // metrics: { type: 'monthly', month: 'March 2017' }, // For Monthly Data
  // metrics: {
  //   type: 'quarterly',
  //   months: ['January 2017', 'February 2017', 'March 2017']
  // }, // For quarterly or half yearly data
  onClick: function(data) {
    console.log(data); // Onclick of each node
  },
  onEmptyButtonClick: function() {
    console.log('Empty Clicked');
  },
  onAreaClick: function(location) {
    console.log('Clicked On' + location);
  }
};

// ganttChart(config);
import { gantt } from './gantt';

const flatData = [];
data.forEach(item => {
  const assignments = item.assignments;
  delete item.assignments;
  item.parent = null;
  item.name = item.firstName + ' ' + item.lastName;
  flatData.push(item);

  assignments.forEach(a => {
    a.parent = item.id;
    a.name = a.project.name;
    a.color = a.project.color;
    flatData.push(a);
  });
});
console.log(flatData);

const conf = {
  data: flatData,
  container: '#chart',
  box_padding: 10,
  metrics: {
    type: 'yearly',
    startDate: '2018-01-01 10:11:12.123456',
    endDate: null,
    subType: 'months'
  }
};
gantt(conf);
