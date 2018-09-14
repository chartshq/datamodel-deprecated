/**
 * The wrapper class on top of the
 * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Data_types | primitive} value of a
 * field.
 *
 * @todo Need to have support for StringValue, NumberValue, DateTimeValue and GeoValue.
 *
 * @class Value
 * @module Value
 * @public
 */
class Value {

  /**
   * Creates new Value instance.
   *
   * @param {*} val - the primitive value from the field cell.
   * @param {string | Field} field - The field from which the value belongs.
   */
    constructor (val, field) {
        Object.defineProperty(this, '_value', {
            enumerable: false,
            configurable: false,
            writable: false,
            value: val
        });

        this.field = field;
    }

  /**
   * Returns the underlaying wrapped value.
   *
   * @public
   * @getter
   *
   * @return {*} Returns the current value.
   */
    get value () {
        return this._value;
    }

  /**
   * String representation of the underlying value. If there is a hint of string operations, this function gets called.
   *
   * @override
   *
   * @return {string} Returns a human readable string of the field value.
   */
    toString () {
        return String(this.value);
    }

  /**
   * Returns the value of the field. If there is a hint of converting the value to integer, this gets called.
   *
   * @override
   *
   * @return {*} Returns the field value.
   */
    valueOf () {
        return this.value;
    }
}

export default Value;
