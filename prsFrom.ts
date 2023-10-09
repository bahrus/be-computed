import {AP, ProPAP, PAP, ParsedValueStatement, Arg, Instruction} from './types';
import {ElTypes} from 'be-linked/types';
import {RegExpOrRegExpExt} from 'be-enhanced/types';
import {arr, tryParse} from 'be-enhanced/cpu.js';
import {lispToCamel} from 'trans-render/lib/lispToCamel.js';

const reValueStatement: RegExpOrRegExpExt<ParsedValueStatement>[] = [
    {
        regExp: new RegExp(String.raw `^(?<dependencies>.*)`),
        defaultVals: {}
    }
]
export function prsFrom(self: AP) : PAP {
    //be careful about making this asynchronous due to instructions getting out of sync
    let {from, instructions} = self;
    if(instructions === undefined) instructions = [];
    const args: Array<Arg> = [];
    const instruction: Instruction = {
        args
    };
    instructions.push(instruction);
    const val0 = from![0];
    const test = tryParse(val0, reValueStatement) as ParsedValueStatement;
    if(test === null) throw 'PE'; //Parse Error
    const {dependencies} = test;
    const splitDependencies = dependencies!.split(',').map(x => x.trim());
    for(const dependency of splitDependencies){
        let type = dependency[0] as ElTypes;
        let prop = dependency;
        if('/@$-'.includes(type)){
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
    //console.log({test, splitDependencies});
    return {
        instructions
    };
}