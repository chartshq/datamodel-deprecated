import { crossProduct } from './cross-product';
import { JOINS } from '../constants';
import { union } from './union';

/**
 * {@link https://www.geeksforgeeks.org/extended-operators-in-relational-algebra/ | Left outer join} between two
 * {@link DataModel} instances is a kind of join that ensures that all the tuples from the left {@link DataModel}
 * are present in the resulatant {@link DataModel}. This operator takes a predicate which gets called for every
 * combination of tuples (created by cartesian product). Based on the value of predicate the equality is established
 * between two DataModel.
 *
 * @example
 *  //@preamble_start
 *  Promise.all([loadData('/static/cars.json'), loadData('/static/cars-schema.json')]).then(function (params) {
 *  const data = params[0];
 *  const schema = params[1];
 *  const DataModel = muze.DataModel;
 *  const dm = new DataModel(data, schema);
 *  //@preamble_end
 *  // DataModel instance is created from https://www.charts.com/static/cars.json data,
 *  // https://www.charts.com/static/cars-schema.json schema and assigned to variable dm. DataModel is extracted from
 *  // muze namespace and assigned to the variable DataModel.
 *
 *  // Creates two small DataModel instance from the original DataModel instance, which will be joined using left outer
 *  // join.
 *  let makerDM = dm.groupBy(['Origin', 'Maker']).project(['Origin', 'Maker']);
 *  let nameDM = dm.project(['Name','Miles_per_Gallon']);
 *
 *  const leftOuterJoin = DataModel.Operators.leftOuterJoin;
 *  let outputDM = leftOuterJoin(makerDM, nameDM,
 *      (makerDM, nameDM) => makerDM.Maker.value === nameDM.Name.value.split(/\s/)[0]);
 *  //@preamble_start
 *  printDM(outputDM);
 *  });
 *  //@preamble_end
 *
 * @public
 * @namespace DataModel
 * @segment Operators
 *
 * @param {DataModel} leftDm Instance of DataModel
 * @param {DataModel} rightDm Instance of DataModel
 * @param {SelectionPredicate} filterFn - The predicate function that will filter the result of the crossProduct.
 *
 * @return {DataModel} New DataModel instance created after the left outer join operation.
 */
export function leftOuterJoin (leftDm, rightDm, filterFn) {
    return crossProduct(leftDm, rightDm, filterFn, false, JOINS.LEFTOUTER);
}

/**
 * {@link https://www.geeksforgeeks.org/extended-operators-in-relational-algebra/ | Right outer join} between two
 * {@link DataModel} instances is a kind of join that ensures that all the tuples from the right {@link DataModel}
 * are present in the resulatant {@link DataModel}. This operator takes a predicate which gets called for every
 * combination of tuples (created by cartesian product). Based on the value of predicate the equality is established
 * between two DataModel.
 *
 * @example
 *  //@preamble_start
 *  Promise.all([loadData('/static/cars.json'), loadData('/static/cars-schema.json')]).then(function (params) {
 *  const data = params[0];
 *  const schema = params[1];
 *  const DataModel = muze.DataModel;
 *  const dm = new DataModel(data, schema);
 *  //@preamble_end
 *  // DataModel instance is created from https://www.charts.com/static/cars.json data,
 *  // https://www.charts.com/static/cars-schema.json schema and assigned to variable dm. DataModel is extracted from
 *  // muze namespace and assigned to the variable DataModel.
 *
 *  // Creates two small DataModel instance from the original DataModel instance, which will be joined using left outer
 *  // join.
 *  let makerDM = dm.groupBy(['Origin', 'Maker']).project(['Origin', 'Maker']);
 *  let nameDM = dm.project(['Name','Miles_per_Gallon']);
 *
 *  const rightOuterJoin = DataModel.Operators.rightOuterJoin;
 *  let outputDM = rightOuterJoin(makerDM, nameDM,
 *      (makerDM, nameDM) => makerDM.Maker.value === nameDM.Name.value.split(/\s/)[0]);
 *  //@preamble_start
 *  printDM(outputDM);
 *  });
 *  //@preamble_end
 *
 * @public
 * @namespace DataModel
 * @segment Operators
 *
 * @param {DataModel} leftDm Instance of DataModel
 * @param {DataModel} rightDm Instance of DataModel
 * @param {SelectionPredicate} filterFn - The predicate function that will filter the result of the crossProduct.
 *
 * @return {DataModel} New DataModel instance created after the left outer join operation.
 */
export function rightOuterJoin (dataModel1, dataModel2, filterFn) {
    return crossProduct(dataModel2, dataModel1, filterFn, false, JOINS.RIGHTOUTER);
}

/**
 * {@link https://www.geeksforgeeks.org/extended-operators-in-relational-algebra/ | Full outer join} between two
 * {@link DataModel} instances is a kind of join that ensures that all the tuples from the left {@link DataModel} and
 * right {@link DataModel} are present in the resulatant {@link DataModel}. This operator takes a predicate which gets
 * called for every combination of tuples (created by cartesian product). Based on the value of predicate the equality
 * is established between two DataModel.
 *
 * @example
 *  //@preamble_start
 *  Promise.all([loadData('/static/cars.json'), loadData('/static/cars-schema.json')]).then(function (params) {
 *  const data = params[0];
 *  const schema = params[1];
 *  const DataModel = muze.DataModel;
 *  const dm = new DataModel(data, schema);
 *  //@preamble_end
 *  // DataModel instance is created from https://www.charts.com/static/cars.json data,
 *  // https://www.charts.com/static/cars-schema.json schema and assigned to variable dm. DataModel is extracted from
 *  // muze namespace and assigned to the variable DataModel.
 *
 *  // Creates two small DataModel instance from the original DataModel instance, which will be joined using left outer
 *  // join.
 *  let makerDM = dm.groupBy(['Origin', 'Maker']).project(['Origin', 'Maker']);
 *  let nameDM = dm.project(['Name','Miles_per_Gallon']);
 *
 *  const fullOuterJoin = DataModel.Operators.fullOuterJoin;
 *  let outputDM = fullOuterJoin(makerDM, nameDM,
 *      (makerDM, nameDM) => makerDM.Maker.value === nameDM.Name.value.split(/\s/)[0]);
 *  //@preamble_start
 *  printDM(outputDM);
 *  });
 *  //@preamble_end
 *
 * @public
 * @namespace DataModel
 * @segment Operators
 *
 * @param {DataModel} leftDm Instance of DataModel
 * @param {DataModel} rightDm Instance of DataModel
 * @param {SelectionPredicate} filterFn - The predicate function that will filter the result of the crossProduct.
 *
 * @return {DataModel} New DataModel instance created after the left outer join operation.
 */
export function fullOuterJoin (dataModel1, dataModel2, filterFn) {
    return union(leftOuterJoin(dataModel1, dataModel2, filterFn), rightOuterJoin(dataModel1, dataModel2, filterFn));
}
