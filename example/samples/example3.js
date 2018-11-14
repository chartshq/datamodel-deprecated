// const DataModel = window.DataModel;

// const schema = [
//     {
//         name: 'name',
//         type: 'dimension'
//     },
//     {
//         name: 'birthday',
//         type: 'dimension',
//         subtype: 'temporal',
//         format: '%Y-%m-%d'
//     },
//     {
//         name: 'roll',
//         type: 'measure',
//         defAggFn: "avg"
//     }
// ];

// const data = [
//     {
//         name: 'Rousan',
//         birthday: '1995-07-05',
//         roll: 2
//     },
//     {
//         name: 'Sumant',
//         birthday: '1996-08-04',
//         roll: 89
//     },
//     {
//         name: 'Ajay',
//         birthday: '1994-01-03',
//         roll: 31
//     },
//     {
//         name: 'Sushant',
//         birthday: '1994-01-03',
//         roll: 99
//     },
//     {
//         name: 'Samim',
//         birthday: '1994-01-03',
//         roll: 12
//     },
//     {
//         name: 'Akash',
//         birthday: '1994-01-03',
//         roll: 20
//     },
//     {
//         name: 'Rousan',
//         birthday: '1995-07-06',
//         roll: 10
//     },
// ];

// const dm = new DataModel(data, schema);
// const dm = new DataModel(data, schema);

// const joinedDm - 

// // const groupedDm = dm.groupBy(["name"], {
// //     roll: (vals, cloneProvider, store) => {
// //         if (!store.clonedDm) {
// //             store.clonedDm = cloneProvider();
// //         }
// //         if (!store.avgRoll) {
// //             store.avgRoll = store.clonedDm.groupBy([""], { roll: "avg" }).getData().data[0][0];
// //         }

// //         return DataModel.Stats.avg(vals) - store.avgRoll;
// //     }
// // });
// // const calDm = dm.calculateVariable({
// //     name: "abc",
// //     type: "measure"
// // }, ["roll", (roll, i, cloneProvider, store) => {
// //     if (!store.clonedDm) {
// //         store.clonedDm = cloneProvider();
// //     }
// //     if (!store.avgRoll) {
// //         store.avgRoll = store.clonedDm.groupBy([""], {roll: "avg"}).getData().data[0][0];
// //     }

// //     return store.avgRoll - roll;
// // }]);

// debugger;

const DataModel = window.DataModel;

const data1 = [
    { profit: 10, sales: 20, city: 'a' },
    { profit: 15, sales: 25, city: 'b' },
];
const schema1 = [
    { name: 'profit', type: 'measure' },
    { name: 'sales', type: 'measure' },
    { name: 'city', type: 'dimension' },
];
const data2 = [
    { population: 200, city: 'a' },
    { population: 250, city: 'b' },
];
const schema2 = [
    { name: 'population', type: 'measure' },
    { name: 'city', type: 'dimension' },
];
const dataModel1 = new DataModel(data1, schema1, { name: 'ModelA' });
const dataModel2 = new DataModel(data2, schema2, { name: 'ModelB' });

const joinedDm = dataModel1.join(dataModel2, (f1, f2, cloneProvider1, cloneProvider2, store) => {
    if (!store.clonedDm1) {
        store.clonedDm1 = cloneProvider1();
    }
    if (!store.clonedDm2) {
        store.clonedDm2 = cloneProvider2();
    }
    if (!store.avgPopulation) {
        store.avgPopulation = store.clonedDm2.groupBy([""], { population: "avg" }).getData().data[0][0];
    }

    return (f1.profit.value * f1.sales.value) > store.avgPopulation;
});
