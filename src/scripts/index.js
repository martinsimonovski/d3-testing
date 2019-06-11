import * as d3 from 'd3';
import '../styles/index.scss';

import data from './data';
// tutorial
// https://codepen.io/mcolynuck/pen/gxJerq

const chartOpt = {
  width: 1200,
  height: 700,
  container: '#chart',
  background: 'white',
  data: data,
  from: '2019-1-1',
  to: '2019-6-11',
  tick: 'day' // [day, week, month, threeMonths, ]
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

  // function vertLabels(theGap, theTopPad, theSidePad, theBarHeight, theColorScale){
  //   var numOccurances = new Array();
  //   var prevGap = 0;

  //   for (var i = 0; i < categories.length; i++){
  //     numOccurances[i] = [categories[i], getCount(categories[i], catsUnfiltered)];
  //   }

  //   var axisText = svg.append("g") //without doing this, impossible to put grid lines behind text
  //    .selectAll("text")
  //    .data(numOccurances)
  //    .enter()
  //    .append("text")
  //    .text(function(d){
  //     return d[0];
  //    })
  //    .attr("x", 10)
  //    .attr("y", function(d, i){
  //     if (i > 0){
  //         for (var j = 0; j < i; j++){
  //           prevGap += numOccurances[i-1][1];
  //          // console.log(prevGap);
  //           return d[1]*theGap/2 + prevGap*theGap + theTopPad;
  //         }
  //     } else{
  //     return d[1]*theGap/2 + theTopPad;
  //     }
  //    })
  //    .attr("font-size", 11)
  //    .attr("text-anchor", "start")
  //    .attr("text-height", 14)
  //    .attr("fill", function(d){
  //     for (var i = 0; i < categories.length; i++){
  //         if (d[0] == categories[i]){
  //         //  console.log("true!");
  //           return d3.rgb(theColorScale(i)).darker();
  //         }
  //     }
  //    });

  // }

  makeGantt(flatData, 1200, 700);
};

new Chart(chartOpt);
