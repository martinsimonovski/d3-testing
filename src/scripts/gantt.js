import * as d3 from 'd3';
import '../styles/index.scss';
import moment from 'moment';
import * as utils from './utils';

export const gantt = config => {
  const { metrics, container, data, headerAdd, showChildColor } = config;
  if (!headerAdd) headerAdd = () => {};

  const element = d3.select(container);
  const chartWidth = element._groups[0][0].offsetWidth;
  const cellHeight = 30;
  const leftSideWidth = 300;
  const rawData = JSON.parse(JSON.stringify(data));
  const convertedData = utils.convertDataResource(data);

  const CHART_TYPES = {
    RESOURCE: 'resource',
    PROJECT: 'project'
  };

  draw('initial', convertedData);
  function draw(state, data, chartType = 'resource') {
    const chartHeight = d3.max([data.length * cellHeight + 120]);
    d3.select(container)._groups[0][0].innerHTML = '';
    let { headerRanges, subHeaderRanges, dateBoundary } = utils.getBoundaries(
      metrics
    );

    // DEFINE DIMENSIONS AND SCALES
    let margin = { top: 20, right: 0, bottom: 100, left: 0 };
    let width = d3.max([chartWidth, 500]) - margin.left - margin.right;
    let height = chartHeight - margin.top - margin.bottom;

    const t = d3.transition().duration(500);

    const x = d3
      .scaleTime()
      .domain(dateBoundary)
      .range([0, width - leftSideWidth]);

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
      .attr('width', width)
      .attr('height', cellHeight);

    const leftSideHeader = periodSection
      .append('g')
      .attr('width', 300)
      .attr('height', 30);

    leftSideHeader
      .append('rect')
      .attr('width', leftSideWidth)
      .attr('height', cellHeight)
      .attr('class', 'Date-Block-Outline');

    leftSideHeader
      .append('text')
      .text('Resources')
      .attr('x', 10)
      .attr('y', cellHeight - 10);

    const symbolGenerator = d3
      .symbol()
      .type(d3.symbolCross)
      .size(80);

    const pathData = symbolGenerator();

    leftSideHeader
      .append('path')
      .attr('width', 20)
      .attr('height', 20)
      .attr('d', pathData)
      .attr('transform', `translate(${leftSideWidth - 30}, ${cellHeight - 15})`)
      .style('fill', 'grey')
      .on('click', headerAdd);

    const periodRanges = periodSection
      .append('g')
      .attr('transform', `translate(${leftSideWidth}, 0)`);

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
      .attr('height', height);

    const leftSideCells = drawArea.append('g');

    const svg = drawArea
      .append('g')
      .attr('width', width - leftSideWidth)
      .attr('transform', `translate(${margin.left + leftSideWidth}, 0)`);

    const lines = svg.append('g').attr('transform', 'translate(0, 0)');

    headerSection
      .selectAll('.bar')
      .data(headerRanges)
      .enter()
      .append('text')
      .attr('class', 'first-title')
      .attr('y', -5)
      .attr(
        'x',
        d => x(new Date(d.startDate)) + leftSideWidth / 2 + getWidth(d) / 2
      )
      .attr('width', d => getWidth(d))
      .attr('height', y.bandwidth())
      .text(d => d.name);

    periodRanges
      .append('rect')
      .attr('x', x(new Date(dateBoundary[0])))
      .attr(
        'width',
        Math.abs(x(new Date(dateBoundary[0])) - x(new Date(dateBoundary[1])))
      )
      .attr('height', cellHeight)
      .attr('class', 'Date-Block-Outline');

    periodRanges
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

    periodRanges
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

    const cells = leftSideCells
      .selectAll('.headers')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', 0)
      .attr('y', (d, i) => y(i + 1))
      .attr('width', leftSideWidth)
      .attr('height', cellHeight)
      .attr('class', 'Date-Block-Outline');

    leftSideCells
      .selectAll('.headers')
      .data(data)
      .enter()
      .append('text')
      .attr('class', d => (d.isParent ? 'header-parent' : 'header-child'))
      .attr('x', d => (d.isParent ? 10 : 30))
      .attr('y', (d, i) => y(i + 1) - 10 + cellHeight)
      .text(d => d.name);

    const bars = svg.append('g').attr('transform', 'translate(0, 0)');

    let { parents, childs } = utils.splitNodes(data);
    if (chartType === CHART_TYPES.PROJECT) {
      parents = utils.convertParentDataProject(parents);
    } else {
      parents = utils.convertParentDataResource(parents);
    }

    // Add the parent bars
    const parentBlocks = bars
      .selectAll('.bar')
      .data(parents)
      .enter()
      .append('g');

    const parentRects = parentBlocks
      .selectAll('.bar')
      .data(d => d.dates)
      .enter()
      .append('g')
      .attr('class', 'single-block cp')
      .attr('transform', d => {
        if (d.startDate) {
          return `translate(${x(new Date(d.startDate))}, 0)`;
        }
      })
      .call(appendParentBar);

    parentRects.transition(t).attr('opacity', 1);

    // Add the child bars
    const childsBlocks = bars
      .selectAll('.bar')
      .data(childs)
      .enter()
      .append('g');

    const childRects = childsBlocks
      .selectAll('.bar')
      .data(d => d.dates)
      .enter()
      .append('g')
      .attr('class', 'single-block cp')
      .attr('transform', d => {
        if (d.startDate) {
          return `translate(${x(new Date(d.startDate))}, 0)`;
        }
      })
      .call(appendBar);

    childRects.transition(t).attr('opacity', 1);

    const horizontalLines = bars
      .selectAll('.bar')
      .data(data)
      .enter()
      .append('line')
      .attr('class', 'date-line')
      .attr('x1', 0)
      .attr('x2', x(new Date(dateBoundary[1])))
      .attr('y1', (d, i) => y(i + 1))
      .attr('y2', (d, i) => y(i + 1));

    leftSideCells.raise(); // hide the bars

    // TOOLTIP
    const tooltipWidth = 100;
    const tooltip = drawArea
      .append('g')
      .attr('class', 'tooltip')
      .style('display', 'none');

    tooltip
      .append('rect')
      .attr('width', tooltipWidth)
      .attr('height', 20)
      .attr('fill', 'white')
      .style('opacity', 0.5);

    tooltip
      .append('text')
      .attr('x', tooltipWidth / 2)
      .attr('y', 15)
      .style('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold');

    tooltip.raise();

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

    function mouseover() {
      const self = d3.select(this);
      switchColors(self);
      tooltip.style('display', 'inline');
    }

    function mousemove(d) {
      let xPosition = d3.event.pageX;
      let yPosition = d3.event.pageY - 100;

      if (d.type === CHART_TYPES.PROJECT && chartType === CHART_TYPES.PROJECT) {
        tooltip
          .attr('transform', 'translate(' + xPosition + ',' + yPosition + ')')
          .select('text')
          .text(`Needed: ${d.needed}% Current: ${d.current}`);
      } else {
        tooltip
          .attr('transform', 'translate(' + xPosition + ',' + yPosition + ')')
          .select('text')
          .text(`Assigned: ${d.assigned}%`);
      }
    }

    function mouseout() {
      const self = d3.select(this);
      switchColors(self);
      tooltip.style('display', 'none');
    }

    function switchColors(self) {
      const color = self.attr('fill');
      const dataColor = self.attr('data-color');
      const project = self.attr('data-project');

      d3.selectAll(`.${project}`)
        .attr('fill', dataColor)
        .attr('data-color', color);
    }

    function appendBar(d) {
      d.append('rect')
        .attr('class', 'Single-node')
        .attr('rx', 5)
        .attr('ry', 5)
        .attr('height', 20)
        .attr('x', 0)
        .attr('y', d => y(d.position + 1) + 5)
        .attr('width', d => (d.startDate ? getActualWidth(d) : 0))
        .attr(
          'fill',
          d =>
            `#${showChildColor || d.type === 'resource' ? d.color : 'd8d8d8'}`
        )
        .attr('data-color', d => `#${d.color}`)
        .attr('data-project', d => `project-${d.parentId}`)
        .attr('class', d => `project-${d.parentId}`)
        .on('click', clickBar)
        .on('mouseover', mouseover)
        .on('mouseout', mouseout)
        .on('mousemove', mousemove);
    }

    function appendParentBar(d) {
      d.append('rect')
        .attr('class', 'Single-node')
        .attr('rx', 0)
        .attr('ry', 0)
        .attr('height', 20)
        .attr('x', 0)
        .attr('y', (d, i) => y(d.position + 1) + 5)
        .attr('width', d => (d.startDate ? getActualWidth(d) : 0))
        .attr('fill', d => `#${d.color}`)
        .on('mouseover', mouseover)
        .on('mouseout', mouseout)
        .on('mousemove', mousemove);
    }

    function clickBar(d) {
      let converted = [];
      if (d.type === 'resource') {
        converted = utils.convertDataResource(rawData);
        draw('initial', converted, CHART_TYPES.RESOURCE);
      } else {
        converted = utils.convertDataProject(rawData, d.parentId);
        draw('initial', converted, CHART_TYPES.PROJECT);
      }
    }
  }
};
