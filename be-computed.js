import { BE, propDefaults, propInfo } from 'be-enhanced/BE.js';
import { XE } from 'xtal-element/XE.js';
import { register } from 'be-hive/register.js';
import { rewrite } from './rewrite.js';
import { parse } from 'be-exporting/be-exporting.js';
import { ComputationObserver } from './ComputationObserver.js';
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
    #computationObservers = [];
    detach(detachedElement) {
        for (const co of this.#computationObservers) {
            co.disconnect();
        }
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
    async hydrate(self) {
        const { fromStatements, enhancedElement } = self;
        for (const fromStatement of fromStatements) {
            const { attrContainingExpression, args, previousElementScriptElement } = fromStatement;
            if (attrContainingExpression === undefined && !previousElementScriptElement)
                throw 'NI';
            if (args === undefined)
                throw 'NI';
            let scriptText = null;
            if (previousElementScriptElement) {
                const { upSearch } = await import('trans-render/lib/upSearch.js');
                const scriptElement = upSearch(enhancedElement, 'script');
                if (!(scriptElement instanceof HTMLScriptElement))
                    throw 404;
                scriptText = scriptElement.innerHTML;
            }
            else {
                scriptText = enhancedElement.getAttribute(attrContainingExpression);
                if (scriptText === null)
                    throw 404;
            }
            const rewritten = rewrite(scriptText, args.map(x => x.remoteProp));
            const parsedJavaScript = await parse(rewritten);
            const expr = parsedJavaScript['expr'];
            this.#computationObservers.push(new ComputationObserver(expr, fromStatement, args, enhancedElement, self));
        }
        return {
            resolved: true
        };
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
            hydrate: {
                ifAllOf: ['fromStatements']
            }
        }
    },
    superclass: BeComputed
});
register(ifWantsToBe, upgrade, tagName);
