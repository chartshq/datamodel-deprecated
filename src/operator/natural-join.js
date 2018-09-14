import { crossProduct } from './cross-product';
import { naturalJoinFilter } from './natural-join-filter-function';


/**
 * {@link https://www.geeksforgeeks.org/extended-operators-in-relational-algebra | Natural join} is a special kind
 * of joining where filtering of rows are performed internally by resolving common fields are from both table and
 * the rows with common value are included.
 *
 * @example
 *  //@preamble_start
 *  Promise.all([loadData('/static/cars.json'), loadData('/static/cars-schema.json')]).then(function (params) {
 *      const data = params[0];
 *      const schema = params[1];
 *      const DataModel = muze.DataModel;
 *      const dm = new DataModel(data, schema);
 *  //@preamble_end
 *  // DataModel instance is created from https://www.charts.com/static/cars.json data,
 *  // https://www.charts.com/static/cars-schema.json schema and assigned to variable dm. DataModel is extracted from
 *  // muze namespace and assigned to the variable DataModel.
 *
 *  // Creates two small DataModel instance from the original DataModel instance, which will be joined. Used chained
 *  // operator for conciseness.
 *  const makerDM = dm.groupBy(['Origin', 'Maker']).project(['Origin', 'Maker']);
 *  const nameDM = dm.project(['Name','Miles_per_Gallon'])
 *
 *  const naturalJoin = DataModel.Operators.naturalJoin;
 *  const outputDM = naturalJoin(makerDM, nameDM);
 *  //@preamble_start
 *  printDM(outputDM);
 *  });
 *  //@preamble_end
 *
 * @public
 * @namespace DataModel
 * @segment Operators
 *
 * @param {DataModel} leftDM Instance of DataModel
 * @param {DataModel} rightDM Instance of DataModel
 *
 * @return {DataModel} New DataModel instance with joined data
 */
export function naturalJoin (dataModel1, dataModel2) {
    return crossProduct(dataModel1, dataModel2, naturalJoinFilter(dataModel1, dataModel2), true);
}
