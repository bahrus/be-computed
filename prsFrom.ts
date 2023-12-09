import {AP, ProPAP, PAP, FromStatement, Arg} from './types';
import {ElTypes} from 'be-linked/types';
import {RegExpOrRegExpExt} from 'be-enhanced/types';
import {arr, tryParse} from 'be-enhanced/cpu.js';
import {lispToCamel} from 'trans-render/lib/lispToCamel.js';

const reValueStatement: RegExpOrRegExpExt<FromStatement>[] = [
    {
        regExp: new RegExp(String.raw  `^(?<attr>[\w]+)(?<!\\)Expression,PassingIn(?<dependencies>.*)`),
        defaultVals: {}
    },
    {
        regExp: new RegExp(String.raw `^(?<dependencies>.*)`),
        defaultVals: {}
    }
]
export function prsFrom(self: AP) : PAP {
    //be careful about making this asynchronous due to instructions getting out of sync
    let {from, fromStatements} = self;
    if(fromStatements === undefined) fromStatements = [];
    for(const fromStatementString of from!){
        const fromStatement = tryParse(fromStatementString, reValueStatement) as FromStatement;
        if(fromStatement === null) throw 'PE'; //Parse Error
        const {dependencies} = fromStatement;
        const splitDependencies = dependencies!.split(',').map(x => x.trim());
        const args: Array<Arg> = [];
        for(const dependency of splitDependencies){
            let remoteType = dependency[0] as ElTypes;
            let remoteProp = dependency;
            if('/@$-#'.includes(remoteType)){
                remoteProp = dependency.substring(1);
                
            }else{
                remoteType = '/';
            }
            
            let attr: string | undefined = undefined;
            if(remoteType === '-'){
                attr = '-' + remoteProp;
                remoteProp = lispToCamel(remoteProp);
            }
            const arg: Arg = {
                remoteType,
                remoteProp,
                //attr,
            };
            args.push(arg);
        }
        fromStatement.args = args;
        fromStatements.push(fromStatement);
        
    }
    return {
        fromStatements
    };
}