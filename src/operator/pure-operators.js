/**
 * Creates a new variable calculated from existing variable. This method expects definition of the newly created
 * variable and a function which resolves value of the new variable from existing variables.
 *
 * This operator is not compose supported.
 *
 * Creates a new measure based on existing variables
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
 *  // muze namespace and assigned to the DataModel variable.
 *
 *  const calculateVariable = DataModel.Operators.calculateVariable
 *  const creatorFn = calculateVariable({
 *      name: 'powerToWeight',
 *      type: 'measure' // Schema of variable
 *  }, ['Horsepower', 'Weight_in_lbs', (hp, weight) => hp / weight ]);
 *  const outputDM = creatorFn(dm);
 *  //@preamble_start
 *  printDM(outputDM);
 *  });
 *  //@preamble_end
 *
 * @text
 * Creates a new dimension based on existing variables
 * @example
 *  //@preamble_start
 *  Promise.all([loadData('/static/cars.json'), loadData('/static/cars-schema.json')]).then(function (params) {
 *  const data = params[0];
 *  const schema = params[1];
 *  const DataModel = muze.DataModel;
 *  const dm = new muze.DataModel(data, schema);
 *  //@preamble_end
 *  // DataModel instance is created from https://www.charts.com/static/cars.json data,
 *  // https://www.charts.com/static/cars-schema.json schema and assigned to variable dm. DataModel is extracted from
 *  // muze namespace and assigned to the DataModel variable.
 *
 *  const calculateVariable = DataModel.Operators.calculateVariable;
 *  const creatorFn = calculateVariable(
 *     {
 *       name: 'Efficiency',
 *       type: 'dimension'
 *     }, ['Horsepower', (hp) => {
 *      if (hp < 80) { return 'low'; }
 *      else if (hp < 120) { return 'moderate'; }
 *      else { return 'high' }
 *  }]);
 *   const outputDM = creatorFn(dm);
 *  //@preamble_start
 *  printDM(outputDM);
 *  });
 *  //@preamble_end
 *
 * @public
 * @segment Operators
 *
 * @param {Schema} schema: Schema of newly defined variable
 * @param {VariableResolver} resolver: Resolver format to resolve the current variable
 *
 * @return {PreparatorFunction} Function which expects an instance of DataModel on which the operator needs to be
 *      applied.
 */
export const calculateVariable = (...args) => dm => dm.calculateVariable(...args);

/**
 * Performs sorting according to the specified sorting details. Like every other operator it doesn't mutate the current
 * DataModel instance on which it was called, instead returns a new DataModel instance containing the sorted data.
 *
 * This operator support multi level sorting by listing the variables using which sorting needs to be performed and
 * the type of sorting `ASC` or `DESC`.
 *
 * In the following example, data is sorted by `Origin` field in `DESC` order in first level followed by another level
 * of sorting by `Acceleration` in `ASC` order.
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
 *  // muze namespace and assigned to the DataModel variable.
 *
 *  const sort = DataModel.Operators.sort;
 *  const preparatorFn = sort([
 *      ['Origin', 'DESC'],
 *      ['Acceleration'] // Default value is ASC
 *  ]);
 *  const outputDM = preparatorFn(dm);
 *  //@preamble_start
 *  printDM(outputDM);
 *  });
 *  //@preamble_end
 *
 * @text
 * This operator also provides another sorting mechanism out of the box where order is applied to a variable by
 * comparing values of another variable.
 * Assume an instance of DataModel created from {@link /static/cars.json | this} data. Now, the data in this
 * model can be sorted by *Origin* field according to the average value of all *Acceleration* for a
 * particular *Origin* value. We would expect an output where *Origin* with lowest average *Acceleration* would come
 * first, then the next lower average, all the way to Origin with the highest average *Acceleration* is the last
 * entry of the array.
 *
 * @example
 *  //@preamble_start
 *  Promise.all([loadData('/static/cars.json'), loadData('/static/cars-schema.json')]).then(function (params) {
 *  const data = params[0];
 *  const schema = params[1];
 *   const DataModel = muze.DataModel;
 *  const dm = new muze.DataModel(data, schema);
 *  //@preamble_end
 *  // DataModel instance is created from https://www.charts.com/static/cars.json data,
 *  // https://www.charts.com/static/cars-schema.json schema and assigned to variable dm. DataModel is extracted
 *  // from muze namespace and assigned to DataModel variable.
 *  const avg = DataModel.Stats.avg;
 *  const sort = DataModel.Operators.sort;
 *  const preparatorFn = sort([
 *      ['Origin', ['Acceleration', (a, b) => avg(a.Acceleration) - avg(b.Acceleration)]]
 *  ]);
 *  const outputDM = preparatorFn(dm);
 *  //@preamble_start
 *  printDM(outputDM);
 *  });
 *  //@preamble_end
 *
 * @text
 * If `groupBy` is applied post sorting, then sorting order is destroyed.
 *
 * @public
 * @segment Operators
 *
 * @param {Array.<Array>} sortingDetails - Sorting details based on which the sorting will be performed.
 *
 * @return {PreparatorFunction} Function which expects an instance of DataModel on which the operator needs to be
 *      applied.
 */
export const sort = (...args) => dm => dm.sort(...args);
