import { getLocalSignal } from "be-linked/defaults.js";
import { getRemoteEl } from "be-linked/getRemoteEl.js";
import { Observer } from "be-observant/Observer.js";
export class ComputationObserver {
    expr;
    fromStatement;
    enhancedElement;
    constructor(expr, fromStatement, args, enhancedElement, enhancementInstance) {
        this.expr = expr;
        this.fromStatement = fromStatement;
        this.enhancedElement = enhancedElement;
        this.#noOfArgs = args.length;
        this.#hydrate(args, enhancedElement, enhancementInstance);
    }
    #noOfArgs;
    #abortControllers = [];
    disconnect() {
        for (const ac of this.#abortControllers) {
            ac.abort();
        }
        this.#abortControllers = [];
    }
    async #hydrate(args, enhancedElement, enhancementInstance) {
        const callback = this.handleObserveCallback;
        for (const arg of args) {
            const observeRule = {
                ...arg,
                callback
            };
            this.#args.push(observeRule);
            let { localProp, transformAttr, remoteProp, remoteType } = arg;
            if (localProp === undefined && transformAttr === undefined) {
                const signal = await getLocalSignal(enhancedElement);
                observeRule.localProp = signal.prop;
                observeRule.localSignal = signal.signal;
            }
            const remoteEl = await getRemoteEl(enhancedElement, remoteType, remoteProp);
            const observerOptions = {
                abortControllers: this.#abortControllers,
                remoteEl,
            };
            new Observer(enhancementInstance, observeRule, observerOptions);
        }
    }
    handleObserveCallback = async (observe, val) => {
        if (this.#abortControllers.length !== this.#noOfArgs)
            return;
        console.log({ observe });
    };
    #args = [];
}
