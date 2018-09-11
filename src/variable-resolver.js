/**
 * A format of specifying resolve criteria of a new variable from existing variables. Newly created variables could be a
 * measure or dimension.
 * The format for resolver is intuitive. It needs name of all existing variables, using which the value of new variable
 * is calculated, listed adjacently followed by the resolving function in a single array.
 *
 * The resolver function gets called for each row of data passing the {@link Value} of dependent variables as
 * parameter
 * ```
 *  ['horsepower', 'acceleration', (horsepower, acceleration) => {
 *      return acceleration / horsepower;
 *  }]
 * ```
 *
 * @public
 * @module VariableResolver
 */
