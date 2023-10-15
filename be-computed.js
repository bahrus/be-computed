import { BE, propDefaults, propInfo } from 'be-enhanced/BE.js';
import { XE } from 'xtal-element/XE.js';
import { register } from 'be-hive/register.js';
import { setItemProp } from 'be-linked/setItemProp.js';
import { getSignalVal } from 'be-linked/getSignalVal.js';
import { getSignal } from 'be-linked/getSignal.js';
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
    async importSymbols(self) {
        import('be-exportable/be-exportable.js');
        const { scriptRef, enhancedElement, nameOfExport } = self;
        const { findRealm } = await import('trans-render/lib/findRealm.js');
        const target = await findRealm(enhancedElement, scriptRef);
        if (target === null)
            throw 404;
        if (!target.src) {
            const { rewrite } = await import('./rewrite.js');
            rewrite(self, target);
        }
        const exportable = await target.beEnhanced.whenResolved('be-exportable');
        return {
            evaluate: exportable.exports[nameOfExport]
        };
    }
    async observe(self) {
        const { instructions, enhancedElement } = self;
        const args = instructions[0].args;
        for (const arg of args) {
            const { prop, type, attr } = arg;
            const signalRefs = await getSignal(enhancedElement, type, prop, attr);
            const { ref, eventType } = signalRefs;
            arg.signal = ref;
            signalRefs.signal.addEventListener(eventType, e => {
                evalFormula(self);
            });
        }
        evalFormula(self);
    }
}
async function evalFormula(self) {
    const { evaluate, instructions, enhancedElement } = self;
    const inputObj = {};
    const [firstInstruction] = instructions;
    const args = firstInstruction.args;
    for (const arg of args) {
        const { signal, prop } = arg;
        const ref = signal?.deref();
        if (ref === undefined) {
            console.warn({ arg, msg: "Out of scope" });
            continue;
        }
        const val = getSignalVal(ref);
        inputObj[prop] = val;
    }
    const result = await evaluate(inputObj);
    const value = result?.value === undefined ? result : result.value;
    // if(enhancedElement.localName === 'meta'){
    //     debugger;
    // }
    if (typeof value === 'object') {
        Object.assign(enhancedElement, value);
    }
    else {
        await setItemProp(enhancedElement, value, enhancedElement.getAttribute('itemprop'));
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
            importSymbols: {
                ifAllOf: ['isParsed', 'nameOfExport', 'instructions', 'scriptRef']
            },
            observe: {
                ifAllOf: ['evaluate', 'instructions']
            }
        }
    },
    superclass: BeComputed
});
register(ifWantsToBe, upgrade, tagName);
