import moment from 'moment';

const intersections = dates => {
  // TODO: possible bug, what if there are overlapping dates
  // make a flat array with borders next to eachother
  let flat = [];
  dates.forEach(d => {
    flat.push({
      date: d.startDate,
      value: d.value,
      isStart: true
    });

    flat.push({
      date: d.endDate ? d.endDate : '2099-01-01',
      value: d.value,
      isStart: false
    });
  });

  // sort the array from min > max
  flat.sort((a, b) => {
    return new Date(a.date) - new Date(b.date);
  });

  // always compare 2 dates and just add/subtract the value
  let current = 0;
  let intersections = [];
  for (let i = 0; i < flat.length - 1; i++) {
    const first = flat[i];
    const second = flat[i + 1];

    if (first.isStart) {
      current = current + first.value;
    } else {
      current = current - first.value;
    }

    intersections.push({
      startDate: first.date,
      endDate: second.date,
      value: current
    });
  }

  return intersections;
};

export default {
  getMonthsOfTheYear: date => {
    const year = moment(date).format('YYYY');
    let months = moment.months();
    return months.map(m => m + ' ' + year);
  },

  getYearBoundary: date => {
    const year = moment(date).format('YYYY');
    const startOfYear = moment(year).startOf('year');
    const endOfYear = moment(year).endOf('year');

    return {
      name: year,
      startDate: startOfYear.toDate(),
      endDate: endOfYear.toDate()
    };
  },

  getMonthsRange: months => {
    let ranges = [];
    months.map(month => {
      const startOfMonth = moment(month, 'MMM YYYY').startOf('month');
      const endOfMonth = moment(month, 'MMM YYYY').endOf('month');

      ranges.push({
        name: moment(startOfMonth).format('MMMM'),
        startDate: startOfMonth.toDate(),
        endDate: endOfMonth
          .clone()
          .add(1, 'd')
          .toDate()
      });
    });

    return ranges;
  },

  getDaysRange: (startDate, endDate) => {
    let ranges = [];
    const diff = moment(endDate).diff(startDate, 'day');
    const s = moment(startDate);
    const e = moment(endDate);

    let day = s.clone();

    while (day <= e) {
      ranges.push({
        name: day.format('D MMM'),
        startDate: day.clone().format('MM/DD/YYYY'),
        endDate: day
          .clone()
          .add(1, 'd')
          .format('MM/DD/YYYY')
      });
      day = day.clone().add(1, 'd');
    }

    return ranges;
  },

  getWeeksRange: (startDate, endDate) => {
    const diff = moment(endDate).diff(startDate, 'week');
    let ranges = [];

    const start = moment(startDate);
    const end = moment(endDate);
    ranges.push({
      name: 'Week 1',
      startDate: start
        .clone()
        .startOf('week')
        .format('MM/DD/YYYY'),
      endDate: start
        .clone()
        .endOf('week')
        .format('MM/DD/YYYY')
    });

    let count = 1;
    let day = start.clone();
    while (day < end) {
      const startOfWeek = start
        .clone()
        .add(count, 'w')
        .startOf('week');
      const endOfWeek = start
        .clone()
        .add(count, 'w')
        .endOf('week');

      day = endOfWeek.clone();

      count++;
      ranges.push({
        name: `Week ${count}`,
        startDate: startOfWeek.format('MM/DD/YYYY'),
        endDate: endOfWeek.format('MM/DD/YYYY')
      });
    }

    return ranges;
  },

  getQuarterMonths: date => {
    const startQuarter = moment(date)
      .startOf('quarter')
      .format('MMM YYYY');

    const middleQuarter = moment(startQuarter)
      .add('month', 1)
      .format('MMM YYYY');

    const endQuarter = moment(date)
      .endOf('quarter')
      .format('MMM YYYY');

    return [startQuarter, middleQuarter, endQuarter];
  },

  getQuarterHeaderRanges: (months, quarter) => {
    return {
      startDate: moment(months[0], 'MMMM YYYY')
        .startOf('month')
        .toDate(),
      endDate: moment(months[months.length - 1], 'MMMM YYYY')
        .endOf('month')
        .toDate(),
      name: quarter
    };
  },

  getQuarter: date => {
    const m = moment(date).format('M');
    const year = moment(date).format('YYYY');
    if (m <= 3) {
      return `Q1 ${year}`;
    } else if (m >= 4 && m <= 6) {
      return `Q2 ${year}`;
    } else if (m >= 7 && m <= 9) {
      return `Q3 ${year}`;
    } else {
      return `Q4 ${year}`;
    }
  },

  getOverallYears: date => {
    const currentYear = moment(date);
    const previousYear = currentYear.clone().subtract(1, 'y');
    const nextYear = currentYear.clone().add(1, 'y');

    return [
      previousYear.format('YYYY'),
      currentYear.format('YYYY'),
      nextYear.format('YYYY')
    ];
  },

  getOverallYearBoundaries: years => {
    let ranges = [];

    years.map(y => {
      ranges.push({
        name: y,
        startDate: moment(y, 'MMMM YYYY')
          .startOf('year')
          .toDate(),
        endDate: moment(y, 'MMMM YYYY')
          .endOf('year')
          .toDate()
      });
    });
    return ranges;
  },

  getOverallBoundaries: years => {
    return {
      startDate: moment(years[0])
        .startOf('year')
        .toDate(),
      endDate: moment(years[years.length - 1])
        .endOf('year')
        .toDate(),
      name: 'Overall (prev, current, next)'
    };
  },

  getMontlyBoundaries: (startDate, endDate) => {
    return {
      startDate: moment(startDate).toDate(),
      endDate: moment(endDate).toDate()
    };
  },

  convertData: (data, type, filterId) => {
    const rawData = JSON.parse(JSON.stringify(data));
    let flatData = [];
    let position = 0;

    if (type === 'resource') {
      rawData.map(item => {
        const projects = item.projects;
        delete item.projects;
        item.parent = null;
        item.name = item.firstName + ' ' + item.lastName;
        item.isParent = true;
        item.dates = [];
        item.position = position;
        flatData.push(item);
        let dates = [];

        projects.map((p, index) => {
          position++;
          p.parent = item.id;
          p.isParent = false;
          p.position = position;
          p.dates = [];

          p.assignments.map(a => {
            a.color = p.color;
            a.position = p.position;
            a.parentId = p.id;
            a.type = 'project';
            p.dates.push(a);
            dates.push({
              startDate: a.startDate,
              endDate: a.endDate,
              value: a.assigned
            });
          });

          flatData.push(p);
        });
        item.dates = intersections(dates);
        position++;
      });
    } else if (type === 'project') {
      flatData.push({ id: filterId, position: 0 });
      rawData.map(resource => {
        resource.projects.map(project => {
          if (!flatData[0].name && project.id === filterId) {
            let projectItem = {
              id: project.id,
              name: project.name,
              parent: null,
              isParent: true,
              position: 0,
              dates: []
            };
            flatData[0] = projectItem;
          }

          if (project.id === filterId) {
            position++;
            let projectItem = {
              id: resource.id,
              name: resource.firstName + ' ' + resource.lastName,
              parent: resource.id,
              isParent: false,
              position: position
            };
            let dates = [];
            project.assignments.map(a => {
              dates.push({
                startDate: a.startDate,
                endDate: a.endDate,
                color: project.color,
                parentId: project.id,
                position: position,
                assigned: a.assigned,
                type: 'resource'
              });
            });
            projectItem.dates = dates;
            flatData.push(projectItem);
          }
        });
      });
    }

    return flatData;
  },

  splitNodes: flatData => {
    let parents = [];
    let childs = [];

    flatData.forEach(d => {
      if (d.isParent) {
        parents.push(d);
      } else {
        childs.push(d);
      }
    });

    return { parents, childs };
  },

  convertParentData: parents => {
    parents.forEach(parent => {
      const av = parent.availability ? parent.availability : 100;
      parent.dates.forEach(date => {
        date.position = parent.position;
        if (date.value === av) {
          date.color = '58D68D'; // green
        } else if (date.value === 0) {
          date.color = 'FAD7A0'; //yellow
        } else if (date.value < av && date.value >= 0) {
          date.color = '5DADE2'; // blue
        } else if (date.value < 0) {
          date.color = 'c4c4c4'; // grey
        } else {
          // > av
          date.color = 'EC7063'; // red
        }
        date.assigned = date.value;
      });
    });
    return parents;
  }
};
