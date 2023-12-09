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
    for(const fromStatement of from!){
        const test = tryParse(fromStatement, reValueStatement) as FromStatement;
        if(test === null) throw 'PE'; //Parse Error
        const {dependencies} = test;
        const splitDependencies = dependencies!.split(',').map(x => x.trim());
        const args: Array<Arg> = [];
        for(const dependency of splitDependencies){
            let type = dependency[0] as ElTypes;
            let prop = dependency;
            if('/@$-#'.includes(type)){
                prop = dependency.substring(1);
                
            }else{
                type = '/';
            }
            
            let attr: string | undefined = undefined;
            if(type === '-'){
                attr = '-' + prop;
                prop = lispToCamel(prop);
            }
            const arg: Arg = {
                type,
                prop,
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