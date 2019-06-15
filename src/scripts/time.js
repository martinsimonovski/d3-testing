import * as d3 from 'd3';
import '../styles/index.scss';
import colors from './colors';
import moment from 'moment';

export const ganttChart = config => {
  window.moment = moment;
  const data = config.data;
  const ELEMENT = d3.select(config.element);
  const CHART_WIDTH = ELEMENT._groups[0][0].offsetWidth;
  const CHART_HEIGHT = d3.max([data.length * 80 + 100, 300]),
    PROGRESSBAR_WIDTH = 200,
    PROGRESSBAR_BOUNDARY = 380,
    EMPTYBLOCK_WIDTH = (80 * CHART_WIDTH) / 100,
    EMPTYBLOCK_HEIGHT = 150,
    BUTTON_COLOR = '#15bfd8';

  const currentDay = {
    start_date: moment()
      .startOf('day')
      .toDate(),
    end_date: moment()
      .endOf('day')
      .toDate()
  };

  draw('initial');

  function draw(state) {
    let date_boundary = [];
    let subheader_ranges = [];
    let months = [];
    let header_ranges = [];

    d3.select(config.element)._groups[0][0].innerHTML = '';

    if (config.metrics.type == 'monthly') {
      months = [config.metrics.month];
      header_ranges = getMonthsRange(months);
      subheader_ranges = getDaysRange(months);
    } else if (config.metrics.type == 'overall') {
      const years = config.metrics.years,
        yearsRange = [];
      years.map(function(year) {
        months = months.concat(getMonthsOftheYear(year));
        yearsRange.push(getYearBoundary(year));
      });
      header_ranges = [
        {
          name: 'Overall View',
          start_date: yearsRange[0].start_date,
          end_date: yearsRange[yearsRange.length - 1].end_date
        }
      ];
      subheader_ranges = yearsRange;
    } else {
      if (config.metrics.type == 'quarterly') {
        months = config.metrics.months;
        subheader_ranges = getMonthsRange(months);
        const year = moment(config.metrics.months[0], 'MMMM YYYY').format(
          'YYYY'
        );

        header_ranges = [
          {
            start_date: moment(config.metrics.months[0], 'MMMM YYYY')
              .startOf('month')
              .toDate(),
            end_date: moment(
              config.metrics.months[config.metrics.months.length - 1],
              'MMMM YYYY'
            )
              .endOf('month')
              .toDate(),
            name: year
          }
        ];
      } else if (config.metrics.type == 'yearly') {
        months = getMonthsOftheYear(config.metrics.year);
        subheader_ranges = getMonthsRange(months);
        header_ranges = [getYearBoundary(config.metrics.year)];
      } else if (config.metrics.type == 'sprint') {
        months = getMonthsOftheYear(config.metrics.year);
        subheader_ranges = config.metrics.cycles;
        header_ranges = [getYearBoundary(config.metrics.year)];
      }
    }

    date_boundary[0] = moment(months[0], 'MMM YYYY')
      .startOf('month')
      .toDate();
    date_boundary[1] = moment(months[months.length - 1], 'MMM YYYY')
      .endOf('month')
      .toDate();

    let margin = { top: 20, right: 50, bottom: 100, left: 50 },
      width = d3.max([CHART_WIDTH, 400]) - margin.left - margin.right,
      height = CHART_HEIGHT - margin.top - margin.bottom;

    const x = d3
      .scaleTime()
      .domain(date_boundary)
      .range([0, width]);

    const y = d3.scaleBand().range([0, height], 0.1);

    y.domain(
      data.map(function(d, i) {
        return i + 1;
      })
    );

    const xAxis = d3.axisBottom().tickFormat(d3.timeFormat('%d/%m/%Y'));

    const yAxis = d3
      .axisLeft()
      .tickSize(0)
      .tickPadding(6);

    const first_section = ELEMENT.append('div')
      .attr('class', 'first_section')
      .style('height', 40)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', 40)
      .append('g');

    const second_section = ELEMENT.append('div')
      .attr('class', 'second_section')
      .style('height', 40)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', 40)
      .append('g');

    switch (state) {
      case 'initial':
        first_section.attr('transform', 'translate( ' + margin.left + ', 30)');
        second_section.attr('transform', 'translate( ' + margin.left + ', 0)');
        break;
    }

    const DRAWAREA = ELEMENT.append('div')
      .attr('class', 'draw_area')
      .append('svg')
      .attr('class', 'DRAWAREA')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);

    const svg = DRAWAREA.append('g')
      .attr('transform', 'translate(' + margin.left + ',' + 0 + ')')
      .call(appendStartLine);

    const lines = svg.append('g').attr('transform', 'translate(0,0)');

    const currentDayArea = svg
      .append('line')
      .attr('width', getActualWidth(currentDay))
      .attr('class', 'CurrentDay-Area')
      .attr('x1', x(new Date(currentDay.start_date)))
      .attr('x2', x(new Date(currentDay.start_date)))
      .attr('y1', 0)
      .attr('y2', height);

    first_section
      .selectAll('.bar')
      .data(header_ranges)
      .enter()
      .append('text')
      .attr('class', 'first-title')
      .attr('y', -5)
      .attr('x', function(d) {
        return x(new Date(d.start_date)) + getWidth(d) / 2;
      })
      .attr('width', function(d) {
        return getWidth(d);
      })
      .attr('height', y.bandwidth())
      .text(function(d) {
        return d.name;
      });

    second_section
      .append('rect')
      .attr('x', x(new Date(date_boundary[0])))
      .attr(
        'width',
        Math.abs(x(new Date(date_boundary[0])) - x(new Date(date_boundary[1])))
      )
      .attr('height', 40)
      .attr('class', 'Date-Block-Outline');

    second_section
      .append('g')
      .selectAll('.bar')
      .data(subheader_ranges)
      .enter()
      .append('rect')
      .attr('x', function(d) {
        return x(new Date(d.start_date));
      })
      .attr('width', function(d) {
        return getWidth(d);
      })
      .attr('height', 40)
      .attr('class', function(d) {
        return 'Date-Block Date-' + moment(d.start_date).format('MMYYYY');
      });

    second_section
      .append('g')
      .selectAll('.bar')
      .data(subheader_ranges)
      .enter()
      .append('text')
      .attr('x', function(d) {
        return x(new Date(d.start_date)) + 10;
      })
      .attr('width', function(d) {
        return getWidth(d);
      })
      .attr('y', 25)
      .text(function(d) {
        return d.name;
      })
      .attr('class', function(d) {
        return 'second-title Date Date-' + moment(d).format('MMYYYY');
      });

    lines
      .selectAll('.lines')
      .data(subheader_ranges)
      .enter()
      .append('line')
      .attr('class', 'date-line')
      .attr('x1', function(d) {
        return x(new Date(d.start_date));
      })
      .attr('x2', function(d) {
        return x(new Date(d.start_date));
      })
      .attr('y1', 0)
      .attr('y2', height);

    if (config.data.length == 0) {
      const EmptyBlockX = CHART_WIDTH / 2 - EMPTYBLOCK_WIDTH / 2,
        EMPTYBLOCK = DRAWAREA.append('g')
          .attr('class', 'EmptyMessageBlock')
          .attr('transform', 'translate(' + EmptyBlockX + ', 20)');

      EMPTYBLOCK.append('rect')
        .attr('fill', '#fff')
        .attr('stroke', '#ccc')
        .attr('x', 0)
        .attr('width', EMPTYBLOCK_WIDTH)
        .attr('height', EMPTYBLOCK_HEIGHT);

      EMPTYBLOCK.append('text')
        .attr('class', 'EmptyMessage')
        .attr('font-size', 25)
        .attr('y', 25)
        .text('There is no objective yet, please click to add one');

      const EMPTRYBLOCK_BUTTON = EMPTYBLOCK.append('g')
        .attr('class', 'empty_button')
        .attr(
          'transform',
          'translate(' + Math.abs(EMPTYBLOCK_WIDTH / 2 - 50) + ', 100)'
        )
        .on('click', function(d) {
          config.onEmptyButtonClick();
        });

      EMPTRYBLOCK_BUTTON.append('rect')
        .attr('width', 100)
        .attr('height', 35)
        .attr('rx', 4)
        .attr('ry', 4)
        .attr('fill', BUTTON_COLOR);

      EMPTRYBLOCK_BUTTON.append('text')
        .attr('fill', '#fff')
        .attr('y', 25)
        .attr('x', 10)
        .text('Click Here');

      const textBlock = EMPTYBLOCK.select('.EmptyMessage');

      const EmptyMessageWidth = textBlock.node().getComputedTextLength();
      EmptyMessageX = Math.abs(EMPTYBLOCK_WIDTH / 2 - EmptyMessageWidth / 2);

      textBlock.attr('transform', 'translate(' + EmptyMessageX + ',20)');
    }

    const bars = svg.append('g').attr('transform', 'translate(0, 20)');

    function appendStartLine() {
      d3.selectAll('.start-lines')
        .data(data)
        .enter()
        .append('line')
        .attr('class', 'start-lines')
        .attr('stroke', function(d) {
          return d.color;
        })
        .attr('x1', function(d) {
          return x(new Date(d.start_date)) + 10;
        })
        .attr('x2', function(d) {
          return x(new Date(d.start_date)) + 10;
        })
        .attr('y1', 0)
        .attr('y2', function(d, i) {
          return y(i + 1) + 20;
        });

      d3.selectAll('.end-lines')
        .data(data)
        .enter()
        .append('line')
        .attr('stroke', function(d) {
          return d.color;
        })
        .attr('class', 'end-lines')
        .attr('x1', function(d) {
          return x(new Date(d.end_date)) + 5;
        })
        .attr('x2', function(d) {
          return x(new Date(d.end_date)) + 5;
        })
        .attr('y1', 0)
        .attr('y2', function(d, i) {
          return y(i + 1) + 20;
        });
    }

    function renderTerm(d, i) {
      d.append('text')
        .attr('class', 'TermType')
        .text(function(d) {
          return d.term;
        })
        .attr('opacity', function(d) {
          return Number(getWidth(d) > 80);
        });
    }

    function renderDuration(d, i) {
      d.append('text')
        .attr('class', 'Duration')
        .attr('x', 80)
        .text(function(d) {
          return getDuration(d);
        })
        .attr('opacity', function(d) {
          return Number(getWidth(d) > 200);
        });
    }

    function getDuration(d) {
      const start_date = moment(d.start_date, 'MM/DD/YYYY').format('DD MMM'),
        end_date = moment(d.end_date, 'MM/DD/YYYY').format('DD MMM');
      let duration = start_date + ' - ' + end_date;

      return duration;
    }

    function trimTitle(width, node, padding) {
      let textBlock = d3.select(node).select('.Title');

      let textLength = textBlock.node().getComputedTextLength();
      let text = textBlock.text();
      while (textLength > width - padding && text.length > 0) {
        text = text.slice(0, -1);
        textBlock.text(text + '...');
        textLength = textBlock.node().getComputedTextLength();
      }
    }

    function getWidth(node) {
      if (endsAfter(node)) {
        width = Math.abs(
          x(new Date(date_boundary[1])) - x(new Date(node.start_date))
        );
      } else if (startsBefore(node)) {
        width = Math.abs(
          x(new Date(date_boundary[0])) - x(new Date(node.end_date))
        );
      } else {
        width = getActualWidth(node);
      }
      return width;
    }

    function getActualWidth(node) {
      return Math.abs(
        x(new Date(node.end_date)) - x(new Date(node.start_date))
      );
    }

    function startsBefore(node) {
      return moment(node.start_date, 'MM/DD/YYYY').isBefore(date_boundary[0]);
    }

    function endsAfter(node) {
      return moment(node.end_date, 'MM/DD/YYYY').isAfter(date_boundary[1]);
    }

    function isVisible(node) {
      const start_date_visible = moment(
          node.start_date,
          'MM/DD/YYYY'
        ).isBetween(date_boundary[0], date_boundary[1], 'days'),
        end_date_visible = moment(node.end_date, 'MM/DD/YYYY').isBetween(
          date_boundary[0],
          date_boundary[1],
          'days'
        );

      return start_date_visible || end_date_visible;
    }

    function getDaysRange(months) {
      ranges = [];
      months.map(function(month) {
        const startOfMonth = moment(month, 'MMM YYYY').startOf('month');
        const endOfMonth = moment(month, 'MMM YYYY').endOf('month');
        const day = startOfMonth;

        while (day <= endOfMonth) {
          ranges.push({
            name: moment(day).format('DD'),
            start_date: day.toDate(),
            end_date: day
              .clone()
              .add(1, 'd')
              .toDate()
          });
          day = day.clone().add(1, 'd');
        }
      });
      return ranges;
    }

    function getMonthsRange(months) {
      let ranges = [];
      months.map(function(month) {
        const startOfMonth = moment(month, 'MMM YYYY').startOf('month');
        const endOfMonth = moment(month, 'MMM YYYY').endOf('month');

        ranges.push({
          name: moment(startOfMonth).format('MMMM'),
          start_date: startOfMonth.toDate(),
          end_date: endOfMonth
            .clone()
            .add(1, 'd')
            .toDate()
        });
      });

      return ranges;
    }

    function getYearBoundary(year) {
      const yearDate = moment(year, 'YYYY');
      let startOfYear = moment(yearDate).startOf('year');
      let endOfYear = moment(yearDate).endOf('year');

      return {
        name: year,
        start_date: startOfYear.toDate(),
        end_date: endOfYear.toDate()
      };
    }

    function getMonthsOftheYear(year) {
      let months = moment.months();
      months = months.map(function(month) {
        month = month + ' ' + year;
        return month;
      });
      return months;
    }
  }
};
