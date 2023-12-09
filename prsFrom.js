import { tryParse } from 'be-enhanced/cpu.js';
import { lispToCamel } from 'trans-render/lib/lispToCamel.js';
const reValueStatement = [
    {
        regExp: new RegExp(String.raw `^(?<!\\)previousScriptElementExpression,PassingIn(?<dependencies>.*)`),
        defaultVals: { previousElementScriptElement: true }
    },
    {
        regExp: new RegExp(String.raw `^(?<attrContainingExpression>[\w]+)(?<!\\)Expression,PassingIn(?<dependencies>.*)`),
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
    for (const fromStatementString of from) {
        const computeStatement = tryParse(fromStatementString, reValueStatement);
        console.log({ computeStatement, fromStatementString });
        if (computeStatement === null)
            throw 'PE'; //Parse Error
        const { dependencies } = computeStatement;
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
                //attr,
            };
            args.push(arg);
        }
        computeStatement.args = args;
        fromStatements.push(computeStatement);
    }
    return {
        fromStatements
    };
}
