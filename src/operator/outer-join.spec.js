/* global describe, it */
/* eslint-disable no-unused-expressions */

import { expect } from 'chai';
import { fullOuterJoin, leftOuterJoin, rightOuterJoin } from './outer-join';
import DataModel from '../index'
;

describe('Testing Outer Join', () => {
    const data1 = [
        { id: 1, profit: 10, sales: 20, first: 'Hey', second: 'Jude' },
        { id: 2, profit: 20, sales: 25, first: 'Hey', second: 'Wood' },
        { id: 3, profit: 10, sales: 20, first: 'White', second: 'the sun' },
        { id: 4, profit: 15, sales: 25, first: 'White', second: 'walls' },
    ];
    const data2 = [
        { id: 1, netprofit: 10, netsales: 200, _first: 'Hello', _second: 'Jude' },
        { id: 4, netprofit: 200, netsales: 250, _first: 'Bollo', _second: 'Wood' },

    ];

    const schema1 = [
        {
            name: 'id',
            type: 'dimention'
        },
        {
            name: 'profit',
            type: 'measure',
            defAggFn: 'avg'
        },
        {
            name: 'sales',
            type: 'measure'
        },
        {
            name: 'first',
            type: 'dimension'
        },
        {
            name: 'second',
            type: 'dimension'
        },
    ];
    const schema2 = [
        {
            name: 'id',
            type: 'dimention'
        },
        {
            name: 'netprofit',
            type: 'measure',
            defAggFn: 'avg'
        },
        {
            name: 'netsales',
            type: 'measure'
        },
        {
            name: '_first',
            type: 'dimension'
        },
        {
            name: '_second',
            type: 'dimension'
        },
    ];
    const data23 = new DataModel(data1, schema1, { name: 'ModelA' });
    const data24 = new DataModel(data2, schema2, { name: 'ModelB' });


    const carsData = [
        {
            Maker: 'pontiac',
            Name: 'pontiac catalina',
            Miles_per_Gallon: 14,
            Cylinders: 8,
            Displacement: -455,
            Horsepower: 225,
            Weight_in_lbs: 4425,
            Acceleration: 10,
            Year: '1970-01-01',
            Origin: 'USA'
        },
        {
            Maker: 'amc',
            Name: 'amc ambassador dpl',
            Miles_per_Gallon: 15,
            Cylinders: 8,
            Displacement: -390,
            Horsepower: 190,
            Weight_in_lbs: 3850,
            Acceleration: 8.5,
            Year: '1970-01-01',
            Origin: 'USA'
        },
        {
            Maker: 'citroen',
            Name: 'citroen ds-21 pallas',
            Miles_per_Gallon: null,
            Cylinders: 4,
            Displacement: -133,
            Horsepower: 115,
            Weight_in_lbs: 3090,
            Acceleration: 17.5,
            Year: '1970-01-01',
            Origin: 'European Union'
        },
        {
            Maker: 'chevrole',
            Name: 'chevrolet chevelle concours (sw)',
            Miles_per_Gallon: null,
            Cylinders: 8,
            Displacement: -350,
            Horsepower: 165,
            Weight_in_lbs: 4142,
            Acceleration: 11.5,
            Year: '1970-01-01',
            Origin: 'USA'
        }
    ];
    const carsSchema = [{
        name: 'Name',
        type: 'dimension'
    },
    {
        name: 'Maker',
        type: 'dimension'
    },
    {
        name: 'Horsepower',
        type: 'measure',
        defAggFn: 'avg'
    },
    {
        name: 'Origin',
        type: 'dimension'
    },
    ];
    describe('#leftOuterJoin', () => {
        it('should return left join', () => {
            let expectedResult = {
                schema: [
                    {
                        name: 'ModelA.id',
                        type: 'dimention'
                    },
                    {
                        name: 'profit',
                        type: 'measure',
                        defAggFn: 'avg'
                    },
                    {
                        name: 'sales',
                        type: 'measure'
                    },
                    {
                        name: 'first',
                        type: 'dimension'
                    },
                    {
                        name: 'second',
                        type: 'dimension'
                    },
                    {
                        name: 'ModelB.id',
                        type: 'dimention'
                    },
                    {
                        name: 'netprofit',
                        type: 'measure',
                        defAggFn: 'avg'
                    },
                    {
                        name: 'netsales',
                        type: 'measure'
                    },
                    {
                        name: '_first',
                        type: 'dimension'
                    },
                    {
                        name: '_second',
                        type: 'dimension'
                    }
                ],
                data: [
                    [
                        '1',
                        10,
                        20,
                        'Hey',
                        'Jude',
                        '1',
                        10,
                        200,
                        'Hello',
                        'Jude'
                    ],
                    [
                        '2',
                        20,
                        25,
                        'Hey',
                        'Wood',
                        '',
                        null,
                        null,
                        '',
                        ''
                    ],
                    [
                        '3',
                        10,
                        20,
                        'White',
                        'the sun',
                        '',
                        null,
                        null,
                        '',
                        ''
                    ],
                    [
                        '4',
                        15,
                        25,
                        'White',
                        'walls',
                        '4',
                        200,
                        250,
                        'Bollo',
                        'Wood'
                    ]
                ],
                uids: [
                    0,
                    1,
                    2,
                    3
                ]
            };
            expect(leftOuterJoin(data23, data24,
                (dmFields1, dmFields2) => dmFields1.id.value === dmFields2.id.value).getData())
                            .to.deep.equal(expectedResult);
        });
        it('should return left outer join with different filter functions for different fields', () => {
            const data = carsData;
            const schema = carsSchema;
            const dm = new DataModel(data, schema);

            let makerDM = dm.groupBy(['Origin', 'Maker']).project(['Origin', 'Maker']);
            let nameDM = dm.project(['Name', 'Horsepower']);

            const expectedResult = {
                schema: [
                    {
                        name: 'Origin',
                        type: 'dimension'
                    }, {
                        name: 'Maker',
                        type: 'dimension'
                    }, {
                        name: 'Name',
                        type: 'dimension'
                    },
                    {
                        name: 'Horsepower',
                        type: 'measure',
                        defAggFn: 'avg'
                    }],
                data: [
                    ['USA', 'pontiac', 'pontiac catalina', 225],
                    ['USA', 'amc', 'amc ambassador dpl', 190],
                    ['European Union', 'citroen', 'citroen ds-21 pallas', 115],
                    ['USA', 'chevrole', '', null],
                ],
                uids: [0, 1, 2, 3]
            };
            expect(leftOuterJoin(makerDM, nameDM,
                    (makerDMField, nameDMField) => makerDMField.Maker.value === nameDMField.Name.value.split(/\s/)[0])
                            .getData()).to.deep.equal(expectedResult);
        });
    });
    describe('#rightOuterJoin', () => {
        it('should return right join', () => {
            let expectedResult = {
                schema: [
                    {
                        name: 'ModelB.id',
                        type: 'dimention'
                    },
                    {
                        name: 'netprofit',
                        type: 'measure',
                        defAggFn: 'avg'
                    },
                    {
                        name: 'netsales',
                        type: 'measure'
                    },
                    {
                        name: '_first',
                        type: 'dimension'
                    },
                    {
                        name: '_second',
                        type: 'dimension'
                    },
                    {
                        name: 'ModelA.id',
                        type: 'dimention'
                    },
                    {
                        name: 'profit',
                        type: 'measure',
                        defAggFn: 'avg'
                    },
                    {
                        name: 'sales',
                        type: 'measure'
                    },
                    {
                        name: 'first',
                        type: 'dimension'
                    },
                    {
                        name: 'second',
                        type: 'dimension'
                    }
                ],
                data: [
                    [
                        '1',
                        10,
                        200,
                        'Hello',
                        'Jude',
                        '1',
                        10,
                        20,
                        'Hey',
                        'Jude'
                    ],
                    [
                        '4',
                        200,
                        250,
                        'Bollo',
                        'Wood',
                        '4',
                        15,
                        25,
                        'White',
                        'walls'
                    ]
                ],
                uids: [
                    0,
                    1
                ]
            };
            expect(rightOuterJoin(data23, data24,
                (dmFields1, dmFields2) => dmFields1.id.value === dmFields2.id.value).getData())
                            .to.deep.equal(expectedResult);
        });
        it('should return right join with different filter functions for different fields', () => {
            const data = carsData;
            const schema = carsSchema;
            const dm = new DataModel(data, schema);

            let makerDM = dm.groupBy(['Origin', 'Maker']).project(['Origin', 'Maker']);
            let nameDM = dm.project(['Name', 'Horsepower']);

            const expectedResult = {
                schema: [{
                    name: 'Name',
                    type: 'dimension'
                },
                {
                    name: 'Horsepower',
                    type: 'measure',
                    defAggFn: 'avg'
                },
                {
                    name: 'Origin',
                    type: 'dimension'
                }, {
                    name: 'Maker',
                    type: 'dimension'
                }],
                data: [
                        ['pontiac catalina', 225, 'USA', 'pontiac'],
                        ['amc ambassador dpl', 190, 'USA', 'amc'],
                        ['citroen ds-21 pallas', 115, 'European Union', 'citroen'],
                        ['chevrolet chevelle concours (sw)', 165, '', '']
                ],
                uids: [0, 1, 2, 3]
            };
            expect(rightOuterJoin(makerDM, nameDM,
                    (makerDMField, nameDMField) => makerDMField.Maker.value === nameDMField.Name.value.split(/\s/)[0])
                            .getData()).to.deep.equal(expectedResult);
        });
    });

    describe('#fullOuterJoin', () => {
        it('should return full join', () => {
            let expectedResult = {
                schema: [
                    {
                        name: 'ModelA.id',
                        type: 'dimention'
                    },
                    {
                        name: 'profit',
                        type: 'measure',
                        defAggFn: 'avg'
                    },
                    {
                        name: 'sales',
                        type: 'measure'
                    },
                    {
                        name: 'first',
                        type: 'dimension'
                    },
                    {
                        name: 'second',
                        type: 'dimension'
                    },
                    {
                        name: 'ModelB.id',
                        type: 'dimention'
                    },
                    {
                        name: 'netprofit',
                        type: 'measure',
                        defAggFn: 'avg'
                    },
                    {
                        name: 'netsales',
                        type: 'measure'
                    },
                    {
                        name: '_first',
                        type: 'dimension'
                    },
                    {
                        name: '_second',
                        type: 'dimension'
                    }
                ],
                data: [
                    [
                        '1',
                        10,
                        20,
                        'Hey',
                        'Jude',
                        '1',
                        10,
                        200,
                        'Hello',
                        'Jude'
                    ],
                    [
                        '2',
                        20,
                        25,
                        'Hey',
                        'Wood',
                        '',
                        null,
                        null,
                        '',
                        ''
                    ],
                    [
                        '3',
                        10,
                        20,
                        'White',
                        'the sun',
                        '',
                        null,
                        null,
                        '',
                        ''
                    ],
                    [
                        '4',
                        15,
                        25,
                        'White',
                        'walls',
                        '4',
                        200,
                        250,
                        'Bollo',
                        'Wood'
                    ]
                ],
                uids: [
                    0,
                    1,
                    2,
                    3
                ]
            };

            expect(fullOuterJoin(data23, data24,
                (dmFields1, dmFields2) => dmFields1.id.value === dmFields2.id.value).getData())
                            .to.deep.equal(expectedResult);
        });
    });
    it('should return full outer join with different filter functions for different fields', () => {
        const data = carsData;
        const schema = carsSchema;
        const dm = new DataModel(data, schema);

        let makerDM = dm.groupBy(['Origin', 'Maker']).project(['Origin', 'Maker']);
        let nameDM = dm.project(['Name', 'Horsepower']);

        const expectedResult = {
            schema: [
                {
                    name: 'Origin',
                    type: 'dimension'
                }, {
                    name: 'Maker',
                    type: 'dimension'
                }, {
                    name: 'Name',
                    type: 'dimension'
                },
                {
                    name: 'Horsepower',
                    type: 'measure',
                    defAggFn: 'avg'
                }],
            data: [
                ['USA', 'pontiac', 'pontiac catalina', 225],
                ['USA', 'amc', 'amc ambassador dpl', 190],
                ['European Union', 'citroen', 'citroen ds-21 pallas', 115],
                ['USA', 'chevrole', '', null],
                ['', '', 'chevrolet chevelle concours (sw)', 165]
            ],
            uids: [0, 1, 2, 3, 4]
        };
        expect(fullOuterJoin(makerDM, nameDM,
                (makerDMField, nameDMField) => makerDMField.Maker.value === nameDMField.Name.value.split(/\s/)[0])
                        .getData()).to.deep.equal(expectedResult);
    });
});

