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

const flattenSource = data => {
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

new Chart(chartOpt);
