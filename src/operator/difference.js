import DataModel from '../datamodel';
import { extend2 } from '../utils';
import { rowDiffsetIterator } from './row-diffset-iterator';
import { isArrEqual } from '../utils/helper';

/**
 * Difference operator is written as `(A - B)` where **A** and **B** are instances of
 * {@link /muze/docs/api-datamodel | DataModel}. The result of `difference` is an instance of
 * {@link /muze/docs/api-datamodel | DataModel} which includes tuples which are present in **A** and not in **B**.
 * For `difference` to work schema of both {@link /muze/docs/api-datamodel | DataModel} has to be same.
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
 *  // Creates a DataModel instance only including USA. Using chained version for conciseness.
 *  const usaMakerDM = dm.select(fields => fields.Origin.value === 'USA');
 *
 *  const difference = DataModel.Operators.difference;
 *  outputDM = difference(dm, usaMakerDM);
 *  //@preamble_start
 *  printDM(outputDM);
 *  });
 *  //@preamble_end
 *
 * @text
 * This is functional version of `difference` operator. `difference` can also be used as
 * {@link /muze/api/datamodel/functional-operator | chained operator}.
 *
 * @public
 * @segment Operators
 *
 * @param {DataModel} leftDM Instance of {@link DataModel} from which the difference will be calculated. For the
 *      notation `(A - B)`, **A** is the leftDM
 * @param {DataModel} rightDM Instance of {@link DataModel} which will be used to calculate the difference from the
 *      leftDM. For the notation `(A - B)`, **B** is the rightDM.
 * @return {DataModel} New {@link DataModel} instance with the result of the operation.
 */
export function difference (dm1, dm2) {
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
     * @param {boolean} addData - If true only tuple will be added to the data.
     */
    function prepareDataHelper(dm, fieldsObj, addData) {
        rowDiffsetIterator(dm._rowDiffset, (i) => {
            const tuple = {};
            let hashData = '';
            schemaNameArr.forEach((schemaName) => {
                const value = fieldsObj[schemaName].data[i];
                hashData += `-${value}`;
                tuple[schemaName] = value;
            });
            if (!hashTable[hashData]) {
                if (addData) { data.push(tuple); }
                hashTable[hashData] = true;
            }
        });
    }

    // Prepare the data
    prepareDataHelper(dm2, dm2FieldStoreFieldObj, false);
    prepareDataHelper(dm1, dm1FieldStoreFieldObj, true);

    return new DataModel(data, schema, { name });
}

