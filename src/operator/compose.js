export const compose = (...operations) =>
    (dm) => {
        let currentDM = dm;
        let frstChild;
        const derivations = [];
        operations.forEach((operation) => {
            currentDM = operation(currentDM);
            derivations.push(...currentDM._derivation);
            if (!frstChild) {
                frstChild = currentDM;
            }
        });

        currentDM.addParent(dm, derivations);
        if (derivations.length > 1) {
            frstChild.dispose();
        }

        return currentDM;
    };

/**
 *
 * Operator Wrappers for :
 * select,project,bin,groupby
 */
export const bin = (...args) => dm => dm.bin(...args);

export const select = (...args) => dm => dm.select(...args);

export const project = (...args) => dm => dm.project(...args);

export const groupBy = (...args) => dm => dm.groupBy(...args);