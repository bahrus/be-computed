import { tryParse } from 'be-enhanced/cpu.js';
import { lispToCamel } from 'trans-render/lib/lispToCamel.js';
const previousScriptElementExpression = String.raw `(?<!\\)previousScriptElementExpression`;
const attrContainingExpression = String.raw `(?<attrContainingExpression>[\w]+)`;
const passingInDependencies = String.raw `PassingIn(?<dependencies>.*)`;
const Expression = String.raw `(?<!\\)Expression`;
const reValueStatement = [
    {
        regExp: new RegExp(String.raw `^${previousScriptElementExpression},${passingInDependencies},AndAssignResult`),
        defaultVals: {
            previousElementScriptElement: true,
            assignResult: true,
            matchIdx: 0,
        }
    },
    {
        regExp: new RegExp(String.raw `^${attrContainingExpression}${Expression},${passingInDependencies},AndAssignResult`),
        defaultVals: {
            assignResult: true,
            matchIdx: 1,
        }
    },
    {
        regExp: new RegExp(String.raw `^${previousScriptElementExpression},${passingInDependencies}`),
        defaultVals: {
            previousElementScriptElement: true,
            matchIdx: 2,
        }
    },
    {
        regExp: new RegExp(String.raw `^${attrContainingExpression}(?<!\\)ExportOf(?<importName>[\w]+)(?<!\\),${passingInDependencies}`),
        defaultVals: {
            matchIdx: 3,
        }
    },
    {
        regExp: new RegExp(String.raw `^${attrContainingExpression}${Expression},${passingInDependencies}`),
        defaultVals: {
            matchIdx: 4,
        }
    },
    {
        regExp: new RegExp(String.raw `^(?<dependencies>.*),AndAssignResultTo\$0(?<localProp>[\w\+]+)`),
        defaultVals: {
            assignResult: true,
            onloadOrPreviousElementScriptElement: true,
            matchIdx: 5,
        }
    },
    {
        regExp: new RegExp(String.raw `^(?<dependencies>.*),AndAssignResult`),
        defaultVals: {
            assignResult: true,
            onloadOrPreviousElementScriptElement: true,
            matchIdx: 6,
        }
    },
    {
        regExp: new RegExp(String.raw `^(?<dependencies>.*)`),
        defaultVals: {
            onloadOrPreviousElementScriptElement: true,
            matchIdx: 7,
        }
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
            if ('/@|-#'.includes(remoteType)) {
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
