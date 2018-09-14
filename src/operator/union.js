import DataModel from '../export';
import { extend2 } from '../utils';
import { rowDiffsetIterator } from './row-diffset-iterator';
import { isArrEqual } from '../utils/helper';

/**
 * Union operation can be termed as vertical stacking of all rows from both the DataModel instances, provided that both
 * of the {@link /muze/docs/api-datamodel | DataModel} instances should have same column names.
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
 *  // Creates two small DataModel instance from the original DataModel instance, one only for european cars,
 *  // another for cars from USA. Used the chain operation here for conciseness.
 *  const usaMakerDM = dm.select(fields => fields.Origin.value === 'USA');
 *  const euroMakerDM = dm.select(fields => fields.Origin.value === 'Europe');
 *
 *  const union = DataModel.Operators.union;
 *  const outputDM = union(usaMakerDM, euroMakerDM);
 *  //@preamble_start
 *  printDM(outputDM);
 *  });
 *  //@preamble_end
 *
 * @text
 * This is the functional version of `union` operator. `union` can also be used as
 * {@link /muze/api/datamodel/union | chained operator}.
 *
 * @public
 * @segment Operators
 *
 * @param {DataModel} topDM One of the two operands of union. Instance of DataModel.
 * @param {DataModel} bottomDM Another operands of union. Instance of DataModel.
 *
 * @return {DataModel} New DataModel instance with the result of the operation.
 */
export function union (dm1, dm2) {
    const hashTable = {};
    const schema = [];
    const schemaNameArr = [];
    const data = [];
    const dm1FieldStore = dm1.getFieldspace();
    const dm2FieldStore = dm2.getFieldspace();
    const dm1FieldStoreFieldObj = dm1FieldStore.fieldsObj();
    const dm2FieldStoreFieldObj = dm2FieldStore.fieldsObj();
    const name = `${dm1FieldStore.name} union ${dm2FieldStore.name}`;

    // For union the columns should match otherwise return a clone of the dm1
    if (!isArrEqual(dm1._colIdentifier.split(',').sort(), dm2._colIdentifier.split(',').sort())) {
        return null;
    }

    // Prepare the schema
    (dm1._colIdentifier.split(',')).forEach((fieldName) => {
        const field = dm1FieldStoreFieldObj[fieldName];
        schema.push(extend2({}, field.schema));
        schemaNameArr.push(field.schema.name);
    });

    /**
     * The helper function to create the data.
     *
     * @param {dm} dm - The dm instance for which the data is inserted.
     * @param {Object} fieldsObj - The fieldStore object format.
     */
    function prepareDataHelper (dm, fieldsObj) {
        rowDiffsetIterator(dm._rowDiffset, (i) => {
            const tuple = {};
            let hashData = '';
            schemaNameArr.forEach((schemaName) => {
                const value = fieldsObj[schemaName].data[i];
                hashData += `-${value}`;
                tuple[schemaName] = value;
            });
            if (!hashTable[hashData]) {
                data.push(tuple);
                hashTable[hashData] = true;
            }
        });
    }

    // Prepare the data
    prepareDataHelper(dm1, dm1FieldStoreFieldObj);
    prepareDataHelper(dm2, dm2FieldStoreFieldObj);

    return new DataModel(data, schema, { name });
}
