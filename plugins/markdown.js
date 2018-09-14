const fs = require('fs');
const marked = require('marked');
const converter = require('json2yaml');
const config = require('../jsdoc.conf.json');

const NAMESPACES = ['muze', 'utils', 'datamodel'];

/**
 * This method generates a nested hashmap for the parameters table
 * @param {Object} objArray the Array structure containing the parameters
 */
function generateNestedMap(objArray) {
    let mainMap = new Map();
    objArray.forEach((obj) => {
        let params = obj.name.split('.');
        let i = 0;
        let k = mainMap;

        while (k.has(params[i])) {
            k = k.get(params[i]);
            i++;
        }
        let kk = new Map();
        kk.set('value', obj.description.replace(/(\r\n|\n|\r)/gm, ' '));
        kk.set('type', obj.type.names.join('\n\n').replace(/\./gi, ''));
        k.set(params[i], kk);
    });
    return mainMap;
}

/**
 * This method replaces {@link Link} to markdown
 * @param {*} matched the matched string
 * @param {*} index index of matched string
 * @param {*} original the original string
 */
function replaceLink(matched, index, original) {
    if (matched.includes('|')) {
        matched = matched.split('|');
        // matched[0] = matched[0].replace(/[^\w\s]/gi, '').split(' ')[1].trim();
        matched[0] = matched[0].replace(/({@link )/g, '').trim();
        matched[1] = matched[1].replace(/[^\w\s]/gi, '').trim();
        return `[${matched[1]}](${matched[0]})`;
    }
    const matchedString = matched.match(/\s.+\b/, matched)[0].trim();
    return `[${matchedString}](${matchedString.split(' ').join('-')})`;
}

/**
 * 
 * @param {string} value
 * @param {*} blockquote boolean
 */
function createTableItem(value, typeofItem) {
    if (typeofItem === 'name') {
        return `<td class="param-name">${value.replace(/{@link\s+.*?}/gi, replaceLink).replace(/\s\s+/g, ' ').replace(/[^\w\s]/gi, '')}</td>`;
    }
    let matchedArr = value.match(/(```)([\s\S]*?)(```)/gm);
    let matched = null;
    if (matchedArr && matchedArr.length) {
        matched = matchedArr[0];
    }
    let backTickText = null;
    if (matched) {
        backTickText = marked(matched);
        value = value.replace(/(```)([\s\S]*?)(```)/gm, backTickText);
    }
    return `<td>${marked(value.replace(/{@link\s+.*?}/gi, replaceLink).replace(/(null)/gi, '')).replace(/(\r\n|\n|\r)/gm, ' ')}</td>`;
}

function createTableHeader() {
    return '<table><thead><tr><td>Name</td><td>Type</td><td>Description</td></tr></thead>';
}

function createTableRow(name, type, description) {
    return `<tr>
                ${name && name.length ? createTableItem(name, 'name') : ''}
                ${type ? createTableItem(type, 'type').replace(/(\s*Array\s*)<(\s*[^>]+\s*)>\s*/g, (m, g1, g2) => `${g1} of ${g2}`) : ''}
                ${description ? createTableItem(description) : ''}
            </tr>`.trim();
}

function createTable (oldkey, map) {
    let description = null;
    let type = null;
    let childTableRows = null;
    let table = '';
    let c = 0;

    if (map.has('value')) {
        description = map.get('value');
    }
    if (map.has('type')) {
        type = map.get('type');
    }
    for (let [key, data] of map) {
        if (key === 'value' || key === 'type') {
            c++;
            continue;
        } else {
            childTableRows = childTableRows || createTableHeader();
            childTableRows = `${childTableRows}\n${createTable(key, data)}`;
            c++;
        }
        if (c === map.size) {
            childTableRows = childTableRows ? `${childTableRows}</table>` : '';
        }
    }

    if (oldkey === '' && type == null) {
        table = childTableRows;
    } else {
        table = createTableRow(oldkey, type, `${description}${childTableRows}`);
    }
    return table;
}

/**
 * This function parses a JSDOC doclet and returns an object whose
 * YAML representation follows the schema expected by the React component
 * used to showcase samples.
 *
 * @param {Object} doclet JSDOC doclet.
 * @returns {Array} Array that follows the Proptypes of the Editor component.
 */
function parseDoclet(doclet, sameLevel = false) {
    let name = doclet.name;                         // name of current jsdoc item
    let classDescription = doclet.classdesc;        // descrption about the class (if any)
    const accessSpecifier = doclet.access;          // access specifier of the code block
    let itemDescription = doclet.description;       // jsdoc description
    let { kind } = doclet;                          // kind of item
    let { scope } = doclet;
    let examples = doclet.examples;                 // captures @examples from jsdoc snippet
    let params = doclet.params;                     // captures @param from jsdoc snippet
    let returnValue = doclet.returns;               // captures @return from jsdoc snippet
    let returnType = null;
    let sections = [];                              // master array to store all sections
    let textTags = [];
    let infoBoxes = [];
    let docletTags = doclet.tags;
    // let { memberof } = doclet;
    let extendsItem = doclet.extends;

    if (Array.isArray(extendsItem) && extendsItem.length > 0) {
        extendsItem = extendsItem[0];
    }

    // if (memberof && NAMESPACES.includes(memberof.toLowerCase())) {
    //     namespace.memberof = memberof.toLowerCase();
    // }

    // Append @text block
    if (docletTags) {
        textTags = docletTags.filter(textTag => textTag.title === 'text');
        infoBoxes = docletTags.filter(infoBox => ['info', 'warning', 'alert'].includes(infoBox.title));
    }
    // Only consider snippets with @public access specifier
    if (accessSpecifier === 'public') {
        // Check if snippet returns a value, if it does assign it to a variable
        if (returnValue) {
            returnType = returnValue.map(value => value.type.names.join(', '));
        }
        if (doclet.comment.includes('@constructor')) {
            name = '### <a name="constructor"></a> constructor';
        }
        if (classDescription) {
            name = `## <a name=${name}></a> Class: ${name}`;
        }
        /**
         * If snippet item is a function, append it to item's name with parameters and return type
         * The result will be -> functionName(param1, param2) -> {Return Type}
         */
        if (kind === 'function') {
            let { paramnames } = doclet.meta.code;
            paramnames = paramnames.join(', ').replace(/</gi, '&lt;').replace(/>/gi, '&gt;').replace(/\./gi, ' ');
            if (returnType) {
                returnType = returnType.join(' ').replace(/</gi, '&lt;').replace(/>/gi, '&gt;').replace(/\./gi, ' ');
                returnType = `[${returnType}](${returnType})`;
                if (sameLevel) {
                    // name = `<h2><span style="font-family: Source Code Pro;font-weight:500;font-size:24px"><a name=${name}></a> ${name}(${paramnames}) → {${returnType}} </span></h2>`;
                    name = `<h2><span style="font-family: Source Code Pro;font-weight:500;font-size:24px;color: #eb5757"><a name=${name}></a> ${name} </span></h2>`;
                } else {
                    // name = `### <a name=${name}></a> ${name}(${paramnames}) → {${returnType}}`;
                    name = `### <a name=${name}></a> ${name}`;
                }
            } else {
                if (sameLevel) {
                    // name = `## <a name=${name}></a> ${name}(${paramnames})`;
                    name = `## <a name=${name}></a> ${name}`;
                } else {
                    // name = `### <a name=${name}></a> ${name}(${paramnames})`;
                    name = `### <a name=${name}></a> ${name}`;
                }
            }
        }
        if (kind === 'member' && scope && scope === 'static') {
            if (sameLevel) {
                name = `## <a name=${name}></a> static ${name}`;
            } else {
                name = `### <a name=${name}></a> static ${name}`;
            }
        }

        const description = classDescription || itemDescription;
        const shortName = doclet.longname.split(':')[1];
        if (shortName && doclet.name.toLowerCase() === shortName.toLowerCase()) {
            name = '';
        } else {
            /* eslint no-lonely-if: 0 */
            if (!name.match(/</g)) {
                name = `## <a name=${name}></a> <span style="font-family: Source Code Pro; font-weight: 500;color: #eb5757;">${name}</span>`;
            }
            // name = `## <a name=${name}></a>`;
            // name = `<h2 style="margin-top: 0"><span style="font-size: 18px;font-weight:600;font-family: Source Code Pro;">${name}</span></h2>`;
        }
        if (description) {
            if (extendsItem) {
                sections.push({
                    type: 'markdown-section',
                    content: `${name}\n\n${description.replace(/{@link\s+.*?}/gi, replaceLink)}\n\nExtends: [${extendsItem}](${extendsItem})`,
                });
            } else {
                // Append description property
                sections.push({
                    type: 'markdown-section',
                    content: `${name}\n\n${description.replace(/{@link\s+.*?}/gi, replaceLink)}`,
                });
            }

            // Append code block
            if (examples && examples.length) {
                examples.map((example) => {
                    example = example.trim();
                    // field to store preamble
                    let preamble = [];
                    // get the lines
                    let lines = example.split('\n');
                    let preambleStart = 0;
                    let preambleEnd = 0;
                    let count = 0;

                    // get the index of the preamble tags
                    lines.forEach((line, lIdx) => {
                        line = line.trim();
                        if (line === '//@preamble_start') {
                            preambleStart = lIdx;
                        }
                        if (line === '//@preamble_end') {
                            preambleEnd = lIdx;

                            // get the preamble content if it exists
                            if (preambleEnd - preambleStart) {
                                for (let i = preambleStart + 1; i < preambleEnd; i += 1) {
                                    if (count === 0) {
                                        preamble.push({
                                            preTag: `${lines[i]}`
                                        });
                                    } else {
                                        preamble.push({
                                            endTag: `${lines[i]}`
                                        });
                                    }
                                }
                                ++count;
                            }
                        }
                    });

                    preamble.forEach((pre) => {
                        if (pre.preTag) {
                            let index = lines.indexOf(pre.preTag);
                            lines.splice(index, 1);
                        } else {
                            let index = lines.indexOf(pre.endTag);
                            lines.splice(index, 1);
                        }
                    });

                    /**
                     * function to filter the preamble tags in lines
                     * @param  {Array} array lines array
                     * @param  {string} what string to be removed
                     * @return {Array} the modified array
                     */
                    function without(array, what) {
                        return array.filter(element => element.trim() !== what);
                    }

                    let linesWithoutStart = without(lines, '//@preamble_start');
                    let linesWithoutEnd = without(linesWithoutStart, '//@preamble_end');

                    const content = linesWithoutEnd.join('\n');

                    sections.push({
                        type: 'code-section',
                        content,
                        preamble,
                        preambleWithContent: example,
                    });
                });
            }

            let paramString = '';

            // add parameters as a table
            if (!classDescription && params && params.length) {
                const paramsTree = generateNestedMap(params);
                const paramTable = createTable('', paramsTree);
                paramString = `<p class="sub-header">Parameters:</p>\n${paramTable}`;
            }
            if (paramString) {
                sections.push({
                    type: 'markdown-section',
                    content: paramString,
                });
            }

            if (textTags.length) {
                textTags.map((textTag) => {
                    const text = textTag.value;
                    if (text) {
                        sections.push({
                            type: 'markdown-section',
                            content: text.replace(/{@link\s(.)*}/gi, replaceLink),
                        });
                    }
                });
            }

            if (infoBoxes.length) {
                infoBoxes.map((infoBox) => {
                    let clonedInfoBox = infoBox.value.split('\n');
                    let infoBoxTitle = clonedInfoBox.splice(0, 1)[0];
                    let infoBoxDescription = clonedInfoBox.join('\n');
                    sections.push({
                        type: 'Info',
                        content: {
                            subType: infoBox.title,
                            title: infoBoxTitle,
                            description: infoBoxDescription
                        }
                    });
                });
            }

            // Append return value type and description
            if (returnValue && returnValue.length) {
                let desc = returnValue[0].description;
                if (desc) {
                    let matchedArr = desc.match(/(```)([\s\S]*?)(```)/gm);
                    let matched = null;
                    if (matchedArr && matchedArr.length) {
                        matched = matchedArr[0];
                    }
                    let backTickText = null;
                    if (matched) {
                        backTickText = marked(matched);
                        desc = desc.replace(/(```)([\s\S]*?)(```)/gm, backTickText);
                    }
                }
                let returnedValue = returnValue[0].type.names.join(' ').replace(/</gi, '&lt;').replace(/>/gi, '&gt;').replace(/\./gi, '');
                let noReturnLink = ['string', 'object', 'array', 'number'];
                let returnVal;
                if (!noReturnLink.includes(returnedValue.toLowerCase())) {
                    returnVal = `<a name=${returnValue[0].type.names[0]}></a><p class="sub-header">Returns:</p>\n\n <span style="font-family: 'Source Code Pro';margin-left: 2%;">[${returnedValue}](${returnedValue}):&nbsp;</span>`;
                } else {
                    returnVal = `<a name=${returnValue[0].type.names[0]}></a><p class="sub-header">Returns:</p>\n\n <span style="font-family: 'Source Code Pro';margin-left: 2%;">${returnedValue}:&nbsp;</span>`;
                }
                if (desc) {
                    returnVal = `${returnVal}${desc}`;
                }
                sections.push({
                    type: 'markdown-section',
                    content: returnVal.replace(/{@link\s+.*?}/gi, replaceLink),
                });
            }
            return sections;
        }
    }
    return null;
}

exports.defineTags = (dictionary) => {
    dictionary.defineTag('extends', {
        onTagged: (doclet, tag) => {
            doclet.extends = doclet.extends || [];
            doclet.extends.push(tag.value);
        }
    });
};

exports.defineTags = function(dictionary) {
    dictionary.defineTag('text', {
        onTagged(doclet, tag) {
            if (!doclet.text) {
                doclet.text = [];
            }
            if (tag.value) {
                doclet.text.push({
                    name: tag.title,
                    type: tag.originalTitle,
                    value: tag.text,
                });
            }
        }
    });
};

let segmentArray = [];

exports.handlers = {
    /**
     * This function executes after jsdoc has parsed all files and created doclets
     * for all documented functions.
     *
     * @param {Object} e JSDOC parsed configuration
     * @param {Array<Object>} e.doclets Array of JSDOC doclets
     */
    parseComplete(e) {
        const doclets = e.doclets;
        const fileMap = {};
        // create a map of file name vs doclet
        doclets.forEach((item) => {
            const fileName = item.meta.filename;
            if (!fileMap[fileName]) {
                fileMap[fileName] = [];
            }
            fileMap[fileName].push(item);
        });

        function getSegments(segmentTag) {
            return segmentTag
                            .some(obj => obj.originalTitle.toLowerCase().trim() === 'segment');
        }
        // create parsed yaml for each file
        Object.keys(fileMap).forEach((fileName) => {
            let perFileDoclets = fileMap[fileName];

            // Filter out the doclets with no description
            perFileDoclets = perFileDoclets.filter(doclet => (doclet.description ? doclet : null));
            const segmentDocs = perFileDoclets.filter(doclet =>
                doclet.tags && doclet.tags.length && getSegments(doclet.tags)
            );
            segmentArray = segmentArray.concat(segmentDocs);

            const docsWithoutSegments = perFileDoclets.filter(obj => segmentArray.indexOf(obj) === -1);
            // const filteredDoclets = docsWithoutSegments.filter(doclet => (doclet.description ? doclet : null));
            // Object to store object parameters which may have nested keys
            let namespace = {};
            let parsed = docsWithoutSegments.map(doclet => parseDoclet(doclet, namespace)).filter(item => item);
            parsed = parsed.reduce((accum, value) => [...accum, ...value], []);

            // let documentName = fileName.split('.')[0];
            // documentName = documentName[0].toUpperCase() + documentName.slice(1);

            // get the path directory path where files will be written
            let destination = config.opts.yaml;
            let temp = fileName.split('-').join('').split('.');
            temp[temp.length - 1] = 'yml';
            let moduleFile = perFileDoclets.filter(doclet => doclet.kind === 'module' ? doclet : null);
            moduleFile.map((file) => {
                if (file.kind === 'module') {
                    temp[0] = file.name;
                }
            });
            let ymlFileName = `api-${temp.join('.')}`;
            // If file is memberof a namespace, store it inside the appropriate namespace folder
            // if (namespace.memberof) {
            //     destination = `${destination}${namespace.memberof}`;
            // }
            // Create master section to be converted to a YAML file
            temp[0] = temp[0].charAt(0).toUpperCase() + temp[0].substr(1).toLowerCase();
            const fileDump = {
                title: temp[0],
                description: 'Documented Methods',
                sections: parsed,
            };
            // convert to YAML
            const yml = converter.stringify(fileDump);
            if (fileDump.sections.length) {
                // write the file
                fs.writeFile(`${destination}${ymlFileName}`, yml, (err) => {
                    if (err) {
                        console.log(err);
                    }
                });
            }
        });

        // Process the segment file
        const segmentObj = {};
        segmentArray.forEach((segment) => {
            segment.tags.forEach((tag) => {
                if (tag.originalTitle === 'segment') {
                    if (segmentObj.hasOwnProperty(tag.value)) {
                        segmentObj[tag.value].push(segment);
                    }
                    else {
                        segmentObj[tag.value] = [];
                        segmentObj[tag.value].push(segment);
                    }
                }
            });
        });

        for (let obj in segmentObj) {
            const sameLevel = true;
            let objParsed = segmentObj[obj].map(doclet => parseDoclet(doclet, sameLevel)).filter(item => item);
            objParsed = objParsed.reduce((accum, value) => [...accum, ...value], []);
            const fileDump = {
                title: obj,
                description: 'Documented Methods',
                sections: objParsed,
            };
            const yml = converter.stringify(fileDump);
            fs.writeFile(`./segments/api-${obj}.yml`, yml, (err) => {
                if (err) {
                    console.log(err);
                }
            });
        }
    }
};
