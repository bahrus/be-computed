import {BE, propDefaults, propInfo} from 'be-enhanced/BE.js';
import {BEConfig} from 'be-enhanced/types';
import {XE} from 'xtal-element/XE.js';
import {Actions, AllProps, AP, PAP, ProPAP, POA} from './types';
import {register} from 'be-hive/register.js';
import {AllProps as  BeExportableAllProps} from 'be-exportable/types';
import {findRealm} from 'trans-render/lib/findRealm.js';
import {BVAAllProps} from 'be-value-added/types';
import {setItemProp} from 'be-linked/setItemProp.js';
import {getSignalVal} from 'be-linked/getSignalVal.js';
import {getSignal} from 'be-linked/getSignal.js';
import {Actions as BPActions} from 'be-propagating/types';

const cache = new Map<string, {}>();
const prsOnValuesCache = new Map<string, {}>();
const prsOnActionsCache = new Map<string, {}>();
export class BeComputed extends BE<AP, Actions> implements Actions{
    static override get beConfig(){
        return {
            parse: true,
            cache,
            parseAndCamelize: true,
            isParsedProp: 'isParsed'
        } as BEConfig
    }

    async onFrom(self: this) {
        const {parsedFrom} = self;
        let parsed = prsOnValuesCache.get(parsedFrom);
        if(parsed === undefined){
            const {prsFrom} = await import('./prsFrom.js');
            parsed = prsFrom(self);
            prsOnValuesCache.set(parsedFrom, parsed);
        }
        
        return parsed as PAP;
    }

    async importSymbols(self: this): ProPAP {
        import('be-exportable/be-exportable.js');
        const {scriptRef, enhancedElement, nameOfExport} = self;
        const {findRealm} = await import('trans-render/lib/findRealm.js');
        const target = await findRealm(enhancedElement, scriptRef!) as HTMLScriptElement | null;
        if(target === null) throw 404;
        if(!target.src){
            const {rewrite} = await import('./rewrite.js');
            rewrite(self, target);
        }
        const exportable = await (<any>target).beEnhanced.whenResolved('be-exportable') as BeExportableAllProps;
        return {
            evaluate: exportable.exports[nameOfExport!]
        }
    }

    async observe(self: this){
        const {instructions, enhancedElement} = self;
        const args = instructions![0].args;
        for(const arg of args!){
            const {prop, type, attr} = arg;
            const signalRefs = await getSignal(enhancedElement, type!, prop!, attr);
            const {ref, eventType} = signalRefs;
            arg.signal = ref;
            signalRefs.signal.addEventListener(eventType, e => {
                evalFormula(self);
            });
        }
        evalFormula(self);
    }


}

async function evalFormula(self: AP){
    const {evaluate, instructions, enhancedElement} = self;
    const inputObj: {[key: string]:  any} = {};
    const [firstInstruction] = instructions!;
    const args = firstInstruction.args;
    for(const arg of args!){
        const {signal, prop} = arg;
        const ref = signal?.deref();
        if(ref === undefined){
            console.warn({arg, msg: "Out of scope"});
            continue;
        }
        const val = getSignalVal(ref);
        inputObj[prop!] = val;
    }
    const result = await evaluate!(inputObj);
    const value = result?.value === undefined ? result : result.value;
    // if(enhancedElement.localName === 'meta'){
    //     debugger;
    // }
    if(typeof value === 'object'){
        Object.assign(enhancedElement, value);
    }else{
        await setItemProp(enhancedElement, value, enhancedElement.getAttribute('itemprop')!);
    }
    
}


export interface BeComputed extends AllProps{}

const tagName = 'be-computed';
const ifWantsToBe = 'computed';
const upgrade = '*';

const xe = new XE<AP, Actions>({
   config: {
        tagName,
        isEnh: true,
        propDefaults:{
            ...propDefaults,
            scriptRef: 'previousElementSibling',
            nameOfExport: 'expr'
        },
        propInfo: {
            ...propInfo
        },
        actions:{
            onFrom: {
                ifAllOf: ['isParsed', 'from'],
            },
            // importSymbols: {
            //     ifAllOf: ['isParsed', 'nameOfExport', 'instructions', 'scriptRef']
            // },
            observe:{
                ifAllOf: ['fromStatements']
            }
        }
   },
   superclass: BeComputed
});

register(ifWantsToBe, upgrade, tagName);

