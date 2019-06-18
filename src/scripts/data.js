// add availability to resource
// add FT required to projects
export default [
  {
    id: 1,
    firstName: 'Martin',
    lastName: 'Simonovski',
    projects: [
      {
        id: 1,
        name: 'Paynova',
        color: 'c6cfff',
        assignments: [
          {
            startDate: '2018-10-09',
            endDate: '2019-06-03',
            assigned: 100
          }
        ]
      },
      {
        id: 2,
        name: 'Kodiak',
        color: 'b0deff',
        assignments: [
          {
            startDate: '2019-06-04',
            endDate: null,
            assigned: 100
          }
        ]
      },
      {
        id: 3,
        name: 'Aifloo',
        color: 'd2f3e0',
        assignments: [
          {
            startDate: '2017-05-01',
            endDate: '2017-12-01',
            assigned: 100
          },
          {
            startDate: '2018-05-01',
            endDate: '2018-12-01',
            assigned: 100
          }
        ]
      },
      {
        id: 4,
        name: 'Pedab',
        color: 'ffbea3',
        assignments: [
          {
            startDate: '2018-01-01',
            endDate: '2018-12-31',
            assigned: 100
          }
        ]
      },
      {
        id: 5,
        name: 'Telinet',
        color: 'e0f9b5',
        assignments: [
          {
            startDate: '2017-02-01',
            endDate: '2017-06-15',
            assigned: 50
          }
        ]
      }
    ]
  },
  {
    id: 2,
    firstName: 'Petar',
    lastName: 'Blazevski',
    projects: [
      {
        id: 6,
        name: 'Alma Talentum',
        color: 'deecff',
        assignments: [
          {
            startDate: '2016-03-01',
            endDate: '2017-04-13',
            assigned: 100
          }
        ]
      },
      {
        id: 7,
        name: 'Srs',
        color: 'ffcfdf',
        assignments: [
          {
            startDate: '2017-04-13',
            endDate: '2018-08-08',
            assigned: 100
          }
        ]
      },
      {
        id: 8,
        name: 'Med Universe',
        color: 'a5dee5',
        dates: [
          {
            startDate: '2017-08-09',
            endDate: '2018-10-01',
            required: 200
          },
          {
            startDate: '2018-10-02',
            endDate: '2019-06-06',
            required: 300
          },
          {
            startDate: '2019-06-07',
            endDate: null,
            required: 260
          }
        ],
        assignments: [
          {
            startDate: '2017-08-09',
            endDate: '2018-10-01',
            assigned: 80
          },
          {
            startDate: '2019-01-01',
            endDate: null,
            assigned: 80
          }
        ]
      },
      {
        id: 9,
        name: 'Tr3',
        color: 'c6cfff',
        assignments: [
          {
            startDate: '2018-10-01',
            endDate: '2018-12-31',
            assigned: 20
          }
        ]
      }
    ]
  },
  {
    id: 3,
    firstName: 'Aleko',
    lastName: 'Markovski',
    projects: [
      {
        id: 12,
        name: 'AgiliIt',
        color: 'feb9c8',
        assignments: [
          {
            startDate: '2017-04-01',
            endDate: '2018-06-09',
            assigned: 100
          },
          {
            startDate: '2018-06-10',
            endDate: '2018-10-10',
            assigned: 100
          }
        ]
      },
      {
        id: 8,
        name: 'Med Universe',
        color: 'a5dee5',
        dates: [
          {
            startDate: '2017-08-09',
            endDate: '2018-10-01',
            required: 200
          },
          {
            startDate: '2018-10-02',
            endDate: '2019-06-06',
            required: 300
          },
          {
            startDate: '2019-06-07',
            endDate: null,
            required: 260
          }
        ],
        assignments: [
          {
            startDate: '2018-06-11',
            endDate: '2018-10-01',
            assigned: 60
          },
          {
            startDate: '2018-10-15',
            endDate: null,
            assigned: 100
          }
        ]
      }
    ]
  },
  {
    id: 4,
    firstName: 'Borche',
    lastName: '',
    projects: [
      {
        id: 8,
        name: 'Med Universe',
        color: 'a5dee5',
        dates: [
          {
            startDate: '2017-08-09',
            endDate: '2018-10-01',
            required: 200
          },
          {
            startDate: '2018-10-02',
            endDate: '2019-06-06',
            required: 300
          },
          {
            startDate: '2019-06-07',
            endDate: null,
            required: 260
          }
        ],
        assignments: [
          {
            startDate: '2018-06-10',
            endDate: '2019-04-01',
            assigned: 100
          },
          {
            startDate: '2019-04-02',
            endDate: null,
            assigned: 80
          }
        ]
      }
    ]
  }
];
