import { defReducer, fnList } from '../operator';

/**
 * A page level storage which stores, registers, unregisters reducers for all the datamodel instances. There is only one
 * reducer store available in a page. All the datamodel instances receive same instance of reducer store. DataModel
 * out of the box provides handful of {@link /muze/docs/api-reducer | reducers} which can be used as reducer function.
 *
 * @public
 * @namespace DataModel
 */
class ReducerStore {
    constructor () {
        this.store = new Map();
        this.store.set('defReducer', defReducer);

        Object.entries(fnList).forEach((key) => {
            this.store.set(key[0], key[1]);
        });
    }

    /**
     * Changes the `defaultReducer` globally. For all the fields which does not have `defAggFn` mentioned in schema, the
     * value of `defaultReducer` is used for aggregation.
     *
     * @public
     *
     * @param {string} [reducer='sum'] name of the default reducer. It picks up the definition from store by doing name
     *      lookup. If no name is found then it takes `sum` as the default reducer.
     *
     * @return {ReducerStore} instance of the singleton store in page.
     */
    defaultReducer (...params) {
        if (params.length) {
            let reducer = params[0];
            if (typeof reducer === 'function') {
                this.store.set('defReducer', reducer);
            } else if (typeof reducer === 'string') {
                if (Object.keys(fnList).indexOf(reducer) !== -1) {
                    this.store.set('defReducer', fnList[reducer]);
                }
            }
            return this;
        }

        return this.store.get('defReducer');
    }

    /**
     *
     * Registers a {@link reducer | reducer}.
     * A {@link reducer | reducer} has to be registered before it is used.
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
     *  // https://www.charts.com/static/cars-schema.json schema and assigned to variable dm. DataModel is retrieved
     *  // from muze namespace and assigned to DataModel variable.
     *  const reducerStore = DataModel.Reducers();
     *
     *  reducerStore.register('meanSquared', (arr) => {
     *      const squaredVal = arr.map(item => item * item);
     *      let sum = 0;
     *      for (let i = 0, l = squaredVal.length; i < l; i++) {
     *          sum += squaredVal[i];
     *      }
     *      return sum;
     *  });
     *
     *  const outputDM= dm.groupBy(['origin'], {
     *      accleration: 'meanSquared'
     *  });
     *  //@preamble_start
     *  printDM(outputDM);
     *  });
     *  //@preamble_end
     *
     * @public
     *
     * @param {string} name formal name for a reducer. If the given name already exists in store it is overridden by new
     *      definition.
     * @param {Function} reducer definition of {@link reducer} function.
     *
     * @return {Function} function for unregistering the reducer.
     */
    register (name, reducer) {
        if (typeof name === 'string' && typeof reducer === 'function') {
            this.store.set(name, reducer);
        }

        return () => { this.__unregister(name); };
    }

    __unregister (name) {
        if (this.store.has(name)) {
            this.store.delete(name);
        }
    }

    resolve (name) {
        if (name instanceof Function) {
            return name;
        }
        return this.store.get(name);
    }
}

const reducerStore = (function () {
    let store = null;

    function getStore () {
        if (store === null) {
            store = new ReducerStore();
        }
        return store;
    }
    return getStore();
}());

export default reducerStore;
