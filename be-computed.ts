import {BE, propDefaults, propInfo} from 'be-enhanced/BE.js';
import {BEConfig} from 'be-enhanced/types';
import {XE} from 'xtal-element/XE.js';
import {Actions, AllProps, AP, PAP, ProPAP, POA} from './types';
import {register} from 'be-hive/register.js';

import {rewrite} from './rewrite.js';
import {parse} from 'be-exporting/be-exporting.js';

import { ComputationObserver } from './ComputationObserver.js';

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

    
    #computationObservers: Array<ComputationObserver> = [];
    override detach(detachedElement: Element): void {
        for(const co of this.#computationObservers){
            co.disconnect();
        }
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

    async hydrate(self: this){
        const {fromStatements, enhancedElement} = self;
        for(const fromStatement of fromStatements!){
            const {attrContainingExpression, args, previousElementScriptElement} = fromStatement;
            if(attrContainingExpression === undefined && !previousElementScriptElement) throw 'NI';
            if(args === undefined) throw 'NI';
            let scriptText: string | null = null;
            if(previousElementScriptElement){
                const {upSearch} = await import('trans-render/lib/upSearch.js');
                const scriptElement = upSearch(enhancedElement, 'script');
                if(!(scriptElement instanceof HTMLScriptElement)) throw 404;
                scriptText = scriptElement.innerHTML;
            }else{
                scriptText = enhancedElement.getAttribute(attrContainingExpression!);
                if(scriptText === null) throw 404;
            }
            
            const rewritten = rewrite(scriptText!, args.map(x => x.remoteProp!));
            const parsedJavaScript = await parse(rewritten);
            const expr = parsedJavaScript['expr'];
            this.#computationObservers.push(
                new ComputationObserver(expr, fromStatement, args, enhancedElement, self
            ));
        }
        return {
            resolved: true
        }

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
            hydrate:{
                ifAllOf: ['fromStatements']
            }
        }
   },
   superclass: BeComputed
});

register(ifWantsToBe, upgrade, tagName);

