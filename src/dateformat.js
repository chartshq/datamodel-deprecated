/**
 * `format` property in {@link /muze/docs/api-schema | schema} facilitates defining any date-time format by using a rich
 * set of tokens using which almost any dateformat can be parsed in {@link /muze/docs/api-datamodel | DataModel}.
 *
 * A variable of type date-time can be specified in schema as
 * ```
 *  { name: 'name_of_variable', 'type': 'dimension', subtype: 'temporal' };
 * ```
 * Representation of date and time varies based on geo location and personal preference.
 * {@link /muze/docs/api-datamodel | DataModel} is able to handle all kind of DateFormat possible. By default
 * {@link /muze/docs/api-datamodel | DataModel} recognizes two date format automatically without specifying the
 * `format` property in {@link /muze/docs/api-schema | schema}.
 * - Date in miliseconds from epoch date i.e. the result of `new Date(2012, 10, 20).getDate()`
 * - JavaScript {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date | Date}
 *      object.
 *
 * For any other date format, the `format` needs to be specified in {@link /muze/docs/api-schema | schema}.
 * ```
 *  [
 *      { type: 'dimension', subtype: 'temporal', format: '%Y' }
 *  ]
 * ```
 * Following are the tokens available to specify formats.
 * <table>
 *      <tr>
 *          <th>Token</th>
 *          <th>Description</th>
 *          <th>Example</th>
 *      </tr>
 *      <tr>
 *          <td>%H</td>
 *          <td>24-hour format of an hour with leading zeros</td>
 *          <td>00 through 23</td>
 *      </tr>
 *      <tr>
 *          <td>%l</td>
 *          <td>12-hour format of an hour with leading zeros</td>
 *          <td>01 through 12</td>
 *      </tr>
 *      <tr>
 *          <td>%p</td>
 *          <td>Uppercase Ante meridiem and Post meridiem</td>
 *          <td>am or pm</td>
 *      </tr>
 *      <tr>
 *          <td>%p</td>
 *          <td>Lowercase Ante meridiem and Post meridiem</td>
 *          <td>AM or PM</td>
 *      </tr>
 *      <tr>
 *          <td>%M</td>
 *          <td>Minutes with leading zeros</td>
 *          <td>00 to 59</td>
 *      </tr>
 *      <tr>
 *          <td>%S</td>
 *          <td>Seconds, with leading zeros</td>
 *          <td>00 to 59</td>
 *      </tr>
 *      <tr>
 *          <td>%a</td>
 *          <td>A textual representation of a day, three letters</td>
 *          <td>Mon through Sun</td>
 *      </tr>
 *      <tr>
 *          <td>%A</td>
 *          <td>A full textual representation of the day of the week</td>
 *          <td>Sunday through Saturday</td>
 *      </tr>
 *      <tr>
 *          <td>%e</td>
 *          <td>Day of the month without leading zeros</td>
 *          <td>1 to 31</td>
 *      </tr>
 *      <tr>
 *          <td>%d</td>
 *          <td>Day of the month, 2 digits with leading zeros</td>
 *          <td>01 to 31</td>
 *      </tr>
 *      <tr>
 *          <td>%b</td>
 *          <td>A short textual representation of a month, three letters</td>
 *          <td>Jan through Dec</td>
 *      </tr>
 *      <tr>
 *          <td>%B</td>
 *          <td>A full textual representation of a month, such as January or March</td>
 *          <td>January to December</td>
 *      </tr>
 *      <tr>
 *          <td>%m</td>
 *          <td>Numeric representation of a month, with leading zeros</td>
 *          <td>01 through 12</td>
 *      </tr>
 *      <tr>
 *          <td>%y</td>
 *          <td>A two digit representation of a year</td>
 *          <td>90 for 1990</td>
 *      </tr>
 *      <tr>
 *          <td>%Y</td>
 *          <td>A full numeric representation of a year, 4 digits</td>
 *          <td>1990</td>
 *      </tr>
 * </table>
 *
 * In order to make {@link /muze/docs/api-datamodel | DataModel} recognize `1990-Sep/25` the format specification will
 * be `%Y-%b/%e`. Here `%` is a token identifier.
 *
 * @public
 * @module DateFormat
 */
