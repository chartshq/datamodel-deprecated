/**
 * A simple predicate which decides if a row is selected based on some condition or not. If this predicate returns true
 * the current row is labeled as a member of selection set. Similarly if returns false, the current row is labeled as
 * a memeber of rejection set.
 *
 * Note: For some cases this funciton does not directly decides whether the row should be present in the final resultant
 * DataModel. Based on selection set and rejection set which predicate function helps to decide, MODE determine which
 * set should be present in the final DataModel.
 *
 * @public
 * @module SelecitonPredicate
 *
 * @param {...object} rowInf Particular row information presented as object.
 *      When rows are iterated by a operator, all the fields {@link Value | value} present in a row, are combined in a
 *      object. The key of the object is name of field and value is {@link Value | value} of field for that current row.
 *      A typical value of a row is represented by
 *
 *      ```
 *      {
 *          Origin: Value,
 *          Horsepower: Value
 *          ...
 *      }
 *      ```
 *      Number of arguments varies based on no if operands are involved for a operator. Like, for joining two instances
 *      of DataModels are involved, hence two rowInf are passed, one for each DataModel instance. On
 *      the other hand, operators like selection needs only one operands, hence only one rowInf is
 *      passed.
 *
 * @param {Number} rowIndex Index of current iteration of row
 */
