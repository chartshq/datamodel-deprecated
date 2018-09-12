import { FilteringMode } from './enums';
import { getUniqueId } from './utils';
import { persistDerivation, updateFields, cloneWithSelect, cloneWithProject, updateData } from './helper';
import { crossProduct, difference, naturalJoinFilter, union } from './operator';
import { DM_DERIVATIVES } from './constants';

/**
 * Relation provides the definitions of basic operators of relational algebra like *selection*, *projection*, *union*,
 * *difference* etc.
 *
 * It is extended by {@link DataModel} to inherit the functionalities of relational algebra concept. Its not recommended
 * to instantiate this class and use it.
 *
 * @class
 * @public
 * @module Relation
 * @segment DataModel
 */
class Relation {

    /**
     * Creates a new Relation instance by providing underlying data and schema.
     *
     * @private
     *
     * @param {Object | string | Relation} data - The input tabular data in dsv or json format or
     * an existing Relation instance object.
     * @param {Array} schema - An array of data schema.
     * @param {Object} [options] - The optional options.
     */
    constructor (...params) {
        let source;

        this._parent = null;
        this._derivation = [];
        this._children = [];

        if (params.length === 1 && ((source = params[0]) instanceof Relation)) {
            // parent datamodel was passed as part of source
            this._colIdentifier = source._colIdentifier;
            this._rowDiffset = source._rowDiffset;
            this._parent = source;
            this._partialFieldspace = this._parent._partialFieldspace;
            this._fieldStoreName = getUniqueId();
            this.__calculateFieldspace().calculateFieldsConfig();
        } else {
            updateData(this, ...params);
            this._fieldStoreName = this._partialFieldspace.name;
            this.__calculateFieldspace().calculateFieldsConfig();
            this._propagationNameSpace = {
                mutableActions: {},
                immutableActions: {}
            };
        }
    }

    /**
     * Retrieves the {@link Schema | schema} details for every {@link Field | field} in an array format.
     *
     * @public
     *
     * @return {Schema} Array of fields schema.
     *      ```
     *      [
     *          { name: 'Name', type: 'dimension' },
     *          { name: 'Miles_per_Gallon', type: 'measure', numberFormat: (val) => `${val} miles / gallon` },
     *          { name: 'Cylinder', type: 'dimension' },
     *          { name: 'Displacement', type: 'measure', defAggFn: 'max' },
     *          { name: 'HorsePower', type: 'measure', defAggFn: 'max' },
     *          { name: 'Weight_in_lbs', type: 'measure', defAggFn: 'avg',  },
     *          { name: 'Acceleration', type: 'measure', defAggFn: 'avg' },
     *          { name: 'Year', type: 'dimension', subtype: 'datetime', format: '%Y' },
     *          { name: 'Origin' }
     *      ]
     *      ```
     */
    getSchema () {
        return this.getFieldspace().fields.map(d => d.schema);
    }

    /**
     * Returns the name of the {@link DataModel} instance. If no name was specified during {@link DataModel}
     * initialization, then it returns a auto-generated name.
     *
     * @public
     *
     * @return {string} Name of the DataModel instance.
     */
    getName() {
        return this._fieldStoreName;
    }

    getFieldspace () {
        return this._fieldspace;
    }

    __calculateFieldspace () {
        this._fieldspace = updateFields([this._rowDiffset, this._colIdentifier],
             this.getPartialFieldspace(), this._fieldStoreName);
        return this;
    }

    getPartialFieldspace () {
        return this._partialFieldspace;
    }

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
     *      const data = params[0];
     *      const schema = params[1];
     *      const dm = new muze.DataModel(data, schema);
     *  //@preamble_end
     *  // DataModel instance is created from https://www.charts.com/static/cars.json data,
     *  // https://www.charts.com/static/cars-schema.json schema and assigned to variable dm.
     *
     *  // Creates two small DataModel instance from the original DataModel instance, which will be joined.
     *  let makerDM = dm.groupBy(['Origin', 'Maker']).project(['Origin', 'Maker']);
     *  let nameDM = dm.project(['Name','Miles_per_Gallon'])
     *
     *  let outputDM = makerDM.join(nameDM,
     *      (makerDM, nameDM) => makerDM.Maker.value === nameDM.Name.value.split(/\s/)[0]);
     *  //@preamble_start
     *  printDM(outputDM);
     *  });
     *  //@preamble_end
     *
     * @text
     * This is the most genereic version of joining. There are few variations of join which are exposed as
     * {@link muze/api/datamodel#functional-operators | functional operator}.
     *
     * @public
     *
     * @param {DataModel} joinWith - The DataModel to be joined with the current instance DataModel.
     * @param {SelectionPredicate} filterFn - The predicate function that will filter the result of the crossProduct.
     *
     * @return {DataModel} New DataModel instance created after joining.
     */
    join (joinWith, filterFn) {
        return crossProduct(this, joinWith, filterFn);
    }

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
     *      const dm = new muze.DataModel(data, schema);
     *  //@preamble_end
     *  // DataModel instance is created from https://www.charts.com/static/cars.json data,
     *  // https://www.charts.com/static/cars-schema.json schema and assigned to variable dm.
     *
     *  // Creates two small DataModel instance from the original DataModel instance, which will be joined.
     *  let makerDM = dm.groupBy(['Origin', 'Maker']).project(['Origin', 'Maker']);
     *  let nameDM = dm.project(['Name','Miles_per_Gallon'])
     *
     *  let outputDM = makerDM.naturalJoin(nameDM);
     *  //@preamble_start
     *  printDM(outputDM);
     *  });
     *  //@preamble_end
     *
     * @text
     * This is chained version of `naturalJoin` operator. `naturalJoin` can also be used as
     * {@link /muze/api/datamodel/functional-operator | functional operator}.
     *
     * @public
     *
     * @param {DataModel} joinWith - The DataModel with which the current instance of DataModel on which the method is
     *      called will be joined.
     * @return {DataModel} New DataModel instance created after joining.
     */
    naturalJoin (joinWith) {
        return crossProduct(this, joinWith, naturalJoinFilter(this, joinWith), true);
    }

    /**
     * Union operation can be termed as vertical stacking of all rows from both the DataModel instances, provided that
     * both of the {@link DataModel} instances should have same column names.
     *
     * @example
     *  //@preamble_start
     *  Promise.all([loadData('/static/cars.json'), loadData('/static/cars-schema.json')]).then(function (params) {
     *      const data = params[0];
     *      const schema = params[1];
     *      const dm = new muze.DataModel(data, schema);
     *  //@preamble_end
     *  // DataModel instance is created from https://www.charts.com/static/cars.json data,
     *  // https://www.charts.com/static/cars-schema.json schema and assigned to variable dm.
     *
     *  // Creates two small DataModel instance from the original DataModel instance, one only for european cars,
     *  // another for cars from USA.
     *  usaMakerDM = dm.select(fields => fields.Origin.value === 'USA');
     *  euroMakerDM = dm.select(fields => fields.Origin.value === 'Europe');
     *
     *  outputDM = usaMakerDM.union(euroMakerDM);
     *  //@preamble_start
     *  printDM(outputDM);
     *  });
     *  //@preamble_end
     *
     * @text
     * This is chained version of `union` operator. `union` can also be used as
     * {@link /muze/api/datamodel/functional-operator | functional operator}.
     *
     * @public
     *
     * @param {DataModel} unionWith - DataModel instance for which union has to be applied with the instance on which
     *      the method is called
     *
     * @return {DataModel} New DataModel instance with the result of the operation
     */
    union (unionWith) {
        return union(this, unionWith);
    }

    /**
     * Difference operation only include rows which are present in the datamodel on which it was called but not on the
     * one passed as argument.
     *
     * @example
     *  //@preamble_start
     *  Promise.all([loadData('/static/cars.json'), loadData('/static/cars-schema.json')]).then(function (params) {
     *      const data = params[0];
     *      const schema = params[1];
     *      const dm = new muze.DataModel(data, schema);
     *  //@preamble_end
     *  // DataModel instance is created from https://www.charts.com/static/cars.json data,
     *  // https://www.charts.com/static/cars-schema.json schema and assigned to variable dm.
     *
     *  // Creates a DataModel instance only including USA
     *  usaMakerDM = dm.select(fields => fields.Origin.value === 'USA');
     *
     *  outputDM = dm.difference(usaMakerDM);
     *  //@preamble_start
     *  printDM(outputDM);
     *  });
     *  //@preamble_end
     *
     * @text
     * This is chained version of `difference` operator. `difference` can also be used as
     * {@link /muze/api/datamodel/functional-operator | functional operator}.
     *
     * @public
     *
     * @param {DataModel} differenceWith - DataModel instance for which difference has to be applied with the instance
     *      on which the method is called
     * @return {DataModel} New DataModel instance with the result of the operation
     */
    difference (differenceWith) {
        return difference(this, differenceWith);
    }

    /**
     * Selection is a row filtering operation. It expects an predicate and an optional mode which control which all rows
     * should be included in the resultant DataModel instance.
     *
     * {@link SelectionPredicate} is a function which returns a boolean value for each tuple present in the DataModel.
     * For selection opearation the predicate function is called for each row of DataModel instance with the current row
     * passed as argument.
     *
     * After executing {@link SelectionPredicate} the rows are labeled as either an member of selection set or an member
     * of rejection set.
     *
     * {@link FilteringMode} operates on the selection and rejection set to determine which one would reflect in the
     * resulatant datamodel.
     *
     * @warn
     * Note
     * Selection and rejection set is only a logical idea for concept explanation purpose.
     *
     * Selection with default mode `FilterningMode.NORMAL`
     * @example
     *  //@preamble_start
     *  Promise.all([loadData('/static/cars.json'), loadData('/static/cars-schema.json')]).then(function (params) {
     *  const data = params[0];
     *  const schema = params[1];
     *  const dm = new muze.DataModel(data, schema);
     *  //@preamble_end
     *  // DataModel instance is created from https://www.charts.com/static/cars.json data,
     *  // https://www.charts.com/static/cars-schema.json schema and assigned to variable dm.
     *
     *  let outputDM= dt.select(fields => fields.Origin.value === 'USA')
     *  //@preamble_start
     *  printDM(outputDM);
     *  });
     *  //@preamble_end
     *
     * @text
     * Selection with mode `FilterningMode.INVERSE`
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
     *  // https://www.charts.com/static/cars-schema.json schema and assigned to variable dm. DataModel is extracted
     *  // from muze namespace and assigned to the variable DataModel
     *
     * const outputDM= dt.select(fields => fields.Origin.value === "USA", { mode: DataModel.FilteringMode.INVERSE })
     *  //@preamble_start
     *  printDM(outputDM);
     *  });
     *  //@preamble_end
     *
     * @text
     * with `FilteringMode.ALL` both selection and rejection set is returned.
     * ```
     * const [selDM, rejDM] = dt.select(fields => fields.Origin.value === "USA", { mode: DataModel.FilteringMode.ALL })
     *```
     * This is chained version of `select` operator. `select` can also be used as
     * {@link /muze/api/datamodel/functional-operator | functional operator}.
     *
     * @public
     *
     * @param {SelectionPredicate} selectFn - Predicate funciton which is called for each row with the current row
     *      ```
     *          function (row, i)  { ... }
     *      ```
     * @param {Object} [config] - The configuration object to control the inclusion exclusion of a row in resultant
     *      DataModel instance
     * @param {FilteringMode} [config.mode=FilteringMode.NORMAL] - The mode of the selection
     *
     * @return {DataModel} Returns the new DataModel instance(s) after operation.
     */
    select (selectFn, config) {
        const defConfig = {
            mode: FilteringMode.NORMAL,
            saveChild: true
        };
        config = Object.assign({}, defConfig, config);

        const cloneConfig = { saveChild: config.saveChild };
        let oDm;

        if (config.mode === FilteringMode.ALL) {
            const selectDm = cloneWithSelect(
                this,
                selectFn,
                { mode: FilteringMode.NORMAL },
                cloneConfig
            );
            const rejectDm = cloneWithSelect(
                this,
                selectFn,
                { mode: FilteringMode.INVERSE },
                cloneConfig
            );
            oDm = [selectDm, rejectDm];
        } else {
            oDm = cloneWithSelect(
                this,
                selectFn,
                config,
                cloneConfig
            );
        }

        return oDm;
    }

    /**
     * Retrieves a boolean value if the current {@link DataModel} instance has data.
     *
     * @example
     * const schema = [
     *    { name: 'CarName', type: 'dimension' },
     *    { name: 'HorsePower', type: 'measure' },
     *    { name: "Origin", type: 'dimension' }
     * ];
     * const data = [];
     *
     * const dt = new DataModel(schema, data);
     * console.log(dt.isEmpty());
     *
     * @private
     *
     * @return {Boolean} True if the datamodel has no data, otherwise false.
     */
    isEmpty () {
        return !this._rowDiffset.length || !this._colIdentifier.length;
    }

    /**
     * Creates a clone from the current DataModel instance with child parent relationship.
     *
     * @private
     * @param {boolean} [saveChild=true] - Whether the cloned instance would be recorded in the parent instance.
     * @return {DataModel} - Returns the newly cloned DataModel instance.
     */
    clone (saveChild = true, linkParent = true) {
        let retDataModel;
        if (linkParent === false) {
            const dataObj = this.getData({
                getAllFields: true
            });
            const data = dataObj.data;
            const schema = dataObj.schema;
            const jsonData = data.map((row) => {
                const rowObj = {};
                schema.forEach((field, i) => {
                    rowObj[field.name] = row[i];
                });
                return rowObj;
            });
            retDataModel = new this.constructor(jsonData, schema);
        }
        else {
            retDataModel = new this.constructor(this);
        }

        if (saveChild) {
            this._children.push(retDataModel);
        }
        return retDataModel;
    }

    /**
     * Projection is column (field) filtering operation. It expects list of fields' name and either include those or
     * exclude those based on {@link FilteringMode} on the resultant DataModel instance.
     *
     * Projection expects array of fields name based on which it creates the selection and rejection set. All the field
     * whose name is present in array goes in selection set and rest of the fields goes in rejection set.
     *
     * {@link FilteringMode} operates on the selection and rejection set to determine which one would reflect in the
     * resulatant datamodel.
     *
     * @warning
     * Note
     * Selection and rejection set is only a logical idea for concept explanation purpose.
     *
     * Projection with default mode `FilterningMode.NORMAL`
     * @example
     *  //@preamble_start
     *  Promise.all([loadData('/static/cars.json'), loadData('/static/cars-schema.json')]).then(function (params) {
     *  const data = params[0];
     *  const schema = params[1];
     *  const dm = new muze.DataModel(data, schema);
     *  //@preamble_end
     *  // DataModel instance is created from https://www.charts.com/static/cars.json data,
     *  // https://www.charts.com/static/cars-schema.json schema and assigned to variable dm.
     *
     *  let outputDM= dt.project(["Name", "HorsePower"]);
     *  //@preamble_start
     *  printDM(outputDM);
     *  });
     *  //@preamble_end
     *
     * @text
     * Projection with mode `FilterningMode.INVERSE`
     * @example
     *  //@preamble_start
     *  Promise.all([loadData('/static/cars.json'), loadData('/static/cars-schema.json')]).then(function (params) {
     *  const data = params[0];
     *  const schema = params[1];
     *  const DataModel = muze.DataModel;
     *  const dm = new DataModel(data, schema);
     *  //@preamble_end
     *  // DataModel instance is created from https://www.charts.com/static/cars.json data,
     *  // https://www.charts.com/static/cars-schema.json schema and assigned to variable dm. DataModel is extracted
     *  // from muze namespace and assigned to the variable DataModel
     *
     *  const outputDM= dt.project(["Name", "HorsePower"], { mode: DataModel.FilteringMode.INVERSE });
     *  //@preamble_start
     *  printDM(outputDM);
     *  });
     *  //@preamble_end
     *
     * @text
     * With `FilteringMode.ALL` both selection and rejection set is returned.
     * ```
     * const [selDM, rejDM] = dt.project(["Name", "HorsePower"], { mode: DataModel.FilteringMode.ALL})
     *```
     * This is chained version of `select` operator. `select` can also be used as
     * {@link /muze/api/datamodel/functional-operator | functional operator}.
     *
     * @public
     *
     * @param {Array.<string | Regexp>} projField - An array of column names in string or regular expression.
     * @param {Object} [config] - An optional config to control the creation of new DataModel
     * @param {FilteringMode} [config.mode=FilteringMode.NORMAL] - Mode of the projection
     *
     * @return {DataModel} Returns the new DataModel instance after operation.
     */
    project (projField, config) {
        const defConfig = {
            mode: FilteringMode.NORMAL,
            saveChild: true
        };
        config = Object.assign({}, defConfig, config);
        const fieldConfig = this.getFieldsConfig();
        const allFields = Object.keys(fieldConfig);
        const { mode } = config;

        let normalizedProjField = projField.reduce((acc, field) => {
            if (field.constructor.name === 'RegExp') {
                acc.push(...allFields.filter(fieldName => fieldName.search(field) !== -1));
            } else if (field in fieldConfig) {
                acc.push(field);
            }
            return acc;
        }, []);

        normalizedProjField = Array.from(new Set(normalizedProjField)).map(field => field.trim());
        let dataModel;

        if (mode === FilteringMode.ALL) {
            let projectionClone = cloneWithProject(this, normalizedProjField, {
                mode: FilteringMode.NORMAL,
                saveChild: config.saveChild
            }, allFields);
            let rejectionClone = cloneWithProject(this, normalizedProjField, {
                mode: FilteringMode.INVERSE,
                saveChild: config.saveChild
            }, allFields);
            dataModel = [projectionClone, rejectionClone];
        } else {
            let projectionClone = cloneWithProject(this, normalizedProjField, config, allFields);
            dataModel = projectionClone;
        }

        return dataModel;
    }

    getFieldsConfig () {
        return this._fieldConfig;
    }

    calculateFieldsConfig () {
        this._fieldConfig = this._fieldspace.fields.reduce((acc, fieldDef, i) => {
            acc[fieldDef.name] = {
                index: i,
                def: { name: fieldDef._ref.name, type: fieldDef._ref.fieldType, subtype: fieldDef._ref.subType() }
            };
            return acc;
        }, {});
        return this;
    }


    /**
     * Frees up the resources associated with the current DataModel instance and breaks all the links instance has in
     * the DAG.
     *
     * @public
     */
    dispose () {
        this._parent.removeChild(this);
        this._parent = null;
    }

    /**
     * Removes the specified child {@link DataModel} from the child list of the current {@link DataModel} instance.
     *
     * @example
     * const schema = [
     *    { name: 'Name', type: 'dimension' },
     *    { name: 'HorsePower', type: 'measure' },
     *    { name: "Origin", type: 'dimension' }
     * ];
     *
     * const data = [
     *    { Name: "chevrolet chevelle malibu", Horsepower: 130, Origin: "USA" },
     *    { Name: "citroen ds-21 pallas", Horsepower: 115, Origin: "Europe" },
     *    { Name: "datsun pl510", Horsepower: 88, Origin: "Japan" },
     *    { Name: "amc rebel sst", Horsepower: 150, Origin: "USA"},
     * ]
     *
     * const dt = new DataModel(schema, data);
     *
     * const dt2 = dt.select(fields => fields.Origin.value === "USA")
     * dt.removeChild(dt2);
     *
     * @private
     *
     * @param {DataModel} child - Delegates the parent to remove this child.
     */
    removeChild (child) {
        let idx = this._children.findIndex(sibling => sibling === child);
        idx !== -1 ? this._children.splice(idx, 1) : true;
    }

    /**
     * Adds the specified {@link DataModel} as a parent for the current {@link DataModel} instance.
     *
     * The optional criteriaQueue is an array containing the history of transaction performed on parent
     *  {@link DataModel} to get the current one.
     *
     * @param {DataModel} parent - The datamodel instance which will act as parent.
     * @param {Array} criteriaQueue - Queue contains in-between operation meta-data.
     */
    addParent (parent, criteriaQueue = []) {
        persistDerivation(this, DM_DERIVATIVES.COMPOSE, null, criteriaQueue);
        this._parent = parent;
        parent._children.push(this);
    }
}

export default Relation;
