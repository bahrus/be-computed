import { tryParse } from 'be-enhanced/cpu.js';
import { lispToCamel } from 'trans-render/lib/lispToCamel.js';
const reValueStatement = [
    {
        regExp: new RegExp(String.raw `^(?<attr>[\w]+)(?<!\\)Expression,PassingIn(?<dependencies>.*)`),
        defaultVals: {}
    },
    {
        regExp: new RegExp(String.raw `^(?<dependencies>.*)`),
        defaultVals: {}
    }
];
export function prsFrom(self) {
    //be careful about making this asynchronous due to instructions getting out of sync
    let { from, fromStatements } = self;
    if (fromStatements === undefined)
        fromStatements = [];
    for (const fromStatement of from) {
        const test = tryParse(fromStatement, reValueStatement);
        if (test === null)
            throw 'PE'; //Parse Error
        const { dependencies } = test;
        const splitDependencies = dependencies.split(',').map(x => x.trim());
        const args = [];
        for (const dependency of splitDependencies) {
            let remoteType = dependency[0];
            let remoteProp = dependency;
            if ('/@$-#'.includes(remoteType)) {
                remoteProp = dependency.substring(1);
            }
            else {
                remoteType = '/';
            }
            let attr = undefined;
            if (remoteType === '-') {
                attr = '-' + remoteProp;
                remoteProp = lispToCamel(remoteProp);
            }
            const arg = {
                remoteType,
                remoteProp,
                attr,
            };
            args.push(arg);
        }
        test.args = args;
        fromStatements.push(test);
    }
    return {
        fromStatements
    };
}
