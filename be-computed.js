import { BE, propDefaults, propInfo } from 'be-enhanced/BE.js';
import { XE } from 'xtal-element/XE.js';
import { register } from 'be-hive/register.js';
import { rewrite } from './rewrite.js';
const cache = new Map();
const prsOnValuesCache = new Map();
const prsOnActionsCache = new Map();
export class BeComputed extends BE {
    static get beConfig() {
        return {
            parse: true,
            cache,
            parseAndCamelize: true,
            isParsedProp: 'isParsed'
        };
    }
    async onFrom(self) {
        const { parsedFrom } = self;
        let parsed = prsOnValuesCache.get(parsedFrom);
        if (parsed === undefined) {
            const { prsFrom } = await import('./prsFrom.js');
            parsed = prsFrom(self);
            prsOnValuesCache.set(parsedFrom, parsed);
        }
        return parsed;
    }
    // async importSymbols(self: this): ProPAP {
    //     import('be-exportable/be-exportable.js');
    //     const {scriptRef, enhancedElement, nameOfExport} = self;
    //     const {findRealm} = await import('trans-render/lib/findRealm.js');
    //     const target = await findRealm(enhancedElement, scriptRef!) as HTMLScriptElement | null;
    //     if(target === null) throw 404;
    //     if(!target.src){
    //         const {rewrite} = await import('./rewrite.js');
    //         rewrite(self, target);
    //     }
    //     const exportable = await (<any>target).beEnhanced.whenResolved('be-exportable') as BeExportableAllProps;
    //     return {
    //         evaluate: exportable.exports[nameOfExport!]
    //     }
    // }
    async observe(self) {
        const { fromStatements, enhancedElement } = self;
        for (const fromStatement of fromStatements) {
            const { attr, args } = fromStatement;
            if (attr === undefined)
                throw 'NI';
            if (args === undefined)
                throw 'NI';
            const attrVal = enhancedElement.getAttribute(attr);
            if (attrVal === null)
                throw 404;
            const rewritten = rewrite(attrVal, args.map(x => x.prop));
            console.log({ rewritten });
        }
        // for(const arg of args!){
        //     const {prop, type, attr} = arg;
        //     const signalRefs = await getSignal(enhancedElement, type!, prop!, attr);
        //     const {ref, eventType} = signalRefs;
        //     arg.signal = ref;
        //     signalRefs.signal.addEventListener(eventType, e => {
        //         evalFormula(self);
        //     });
        // }
        // evalFormula(self);
    }
}
const tagName = 'be-computed';
const ifWantsToBe = 'computed';
const upgrade = '*';
const xe = new XE({
    config: {
        tagName,
        isEnh: true,
        propDefaults: {
            ...propDefaults,
            scriptRef: 'previousElementSibling',
            nameOfExport: 'expr'
        },
        propInfo: {
            ...propInfo
        },
        actions: {
            onFrom: {
                ifAllOf: ['isParsed', 'from'],
            },
            // importSymbols: {
            //     ifAllOf: ['isParsed', 'nameOfExport', 'instructions', 'scriptRef']
            // },
            observe: {
                ifAllOf: ['fromStatements']
            }
        }
    },
    superclass: BeComputed
});
register(ifWantsToBe, upgrade, tagName);
