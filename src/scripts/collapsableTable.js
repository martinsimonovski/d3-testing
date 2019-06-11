import * as d3 from 'd3';
import '../styles/index.scss';

import data from './data';

const chartOpt = {
  width: 1200,
  height: 700,
  container: '#chart',
  background: 'white',
  data: data
};

const Chart = opts => {
  const container = d3.select(opts.container);
  const margin = 60;
  const width = opts.width - 2 * margin;
  const height = opts.height - 2 * margin;
  const duration = 300;
  const barHeight = 40;
  const barWidth = width * 1;

  // d3.SVG
  const svg = container
    .append('div')
    .classed('svg-container', true)
    .append('svg')
    .classed('table-svg', true)
    .attr('preserveAspectRatio', 'xMinYMin meet')
    .attr('viewBox', '0 0 ' + width + ' ' + height);

  data.forEach(function(d) {
    d.name = d.firstName + ' ' + d.lastName;
    if (d.assignments) {
      d._assignments = d.assignments;
      d.assignments = null;
    } else {
      d.assignments = d._assignments;
      d._assignments = null;
    }
  });

  draw(data);

  function draw(source) {
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
    console.log(source);

    svg
      .transition()
      .duration(duration)
      .attr('viewBox', '0 0 ' + width + ' ' + y0);

    d3.select(self.frameElement)
      .transition()
      .duration(duration)
      .style('height', height + 'px');

    let childRow = svg.selectAll('.children').data(shownChildren);

    const childEnter = childRow
      .enter()
      .append('g', ':first-child')
      .classed('children', true)
      .attr('transform', function(d) {
        console.log('Child Enter: ' + d.name + ',' + d.y);
        return 'translate(' + d.parentX + ',' + d.parentY + ')';
      });

    const childRect = childEnter
      .append('rect')
      .attr('height', barHeight)
      .attr('width', barWidth)
      .style('fill', '#eaeaea');

    const childText = childEnter
      .append('text')
      .attr('dy', 15)
      .attr('dx', 5.5)
      .text(function(d) {
        if (d.name.length > 70) {
          return d.name.substring(0, 67) + '...';
        } else {
          return d.name;
        }
      });

    // Transition nodes to their new position.
    childEnter
      .transition()
      .duration(duration)
      .attr('transform', function(d) {
        console.log('Child Enter Transition: ' + d.name + ',' + d.y);
        return 'translate(' + d.x + ',' + d.y + ')';
      })
      .style('opacity', 1);

    childRow
      .transition()
      .duration(duration)
      .attr('transform', function(d) {
        console.log('Child Row Transition: ' + d.name + ',' + d.y);
        return 'translate(' + d.x + ',' + d.y + ')';
      })
      .style('opacity', 1)
      .select('rect')
      .style('stroke', '#acacac')
      .style('fill', 'white');

    const tableRow = svg.selectAll('.tableRow').data(source);
    const rowEnter = tableRow
      .enter()
      .append('g')
      .classed('tableRow', true)
      .attr('transform', function(d) {
        return 'translate(' + d.x + ',' + d.y + ')';
      });

    const rowRect = rowEnter
      .append('rect')
      .attr('height', barHeight)
      .attr('width', barWidth)
      .style('stroke', '#acacac')
      .style('fill', '#eaeaea')
      .on('click', click);

    const rowText = rowEnter
      .append('text')
      .attr('dy', 15)
      .attr('dx', 5.5)
      .text(function(d) {
        if (d.name.length > 70) {
          return d.name.substring(0, 67) + '...';
        } else {
          return d.name;
        }
      })
      .on('click', click);

    rowEnter
      .transition()
      .duration(duration)
      .attr('transform', function(d) {
        return 'translate(' + d.x + ',' + d.y + ')';
      })
      .style('opacity', 1);

    tableRow
      .transition()
      .duration(duration)
      .attr('transform', function(d) {
        return 'translate(' + d.x + ',' + d.y + ')';
      })
      .style('opacity', 1)
      .select('rect')
      .style('stroke', '#acacac')
      .style('fill', '#eaeaea');

    function click(d) {
      if (d.assignments) {
        d._assignments = d.assignments;
        d.assignments = null;
      } else {
        d.assignments = d._assignments;
        d._assignments = null;
      }
      draw(source);
    }
  }
};

new Chart(chartOpt);
