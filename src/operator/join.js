/**
 * Performs {@link https://en.wikipedia.org/wiki/Cartesian_product | cross-product} between two {@link DataModel}
 * instances with an optional predicate which determines which tuples should be included and returns a new
 * {@link DataModel} instance containing the results. This operation is also called theta join.
 *
 * Cross product takes two set and create one set where each value of one set is paired with each value of another
 * set.
 *
 * This method takes an optional predicate which filters the generated result rows. The predicate is called for
 * every tuple. If the predicate returns true the combined row is included in the resulatant table.
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
 *  // Creates two small DataModel instance from the original DataModel instance, which will be joined.
 *  let makerDM = dm.groupBy(['Origin', 'Maker']).project(['Origin', 'Maker']);
 *  let nameDM = dm.project(['Name','Miles_per_Gallon']);
 *
 *  const join = DataModel.Operators.join;
 *  let outputDM = join(makerDM, nameDM,
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
 * @param {DataModel} leftDM Instance of DataModel
 * @param {DataModel} rightDM Instance of DataModel
 * @param {SelectionPredicate} filterFn - The predicate function that will filter the result of the crossProduct.
 *
 * @return {DataModel} New DataModel instance created after joining.
 */
export function join () { /* @warn pseudo function to mock documentation */ }
