import { getLocalSignal } from "be-linked/defaults.js";
import { getRemoteEl } from "be-linked/getRemoteEl.js";
import { Observer } from "be-observant/Observer.js";
import { setSignalVal } from 'be-linked/setSignalVal.js';
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
    #localProp;
    #localSignal;
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
        if (observe.lastVal === val)
            return;
        observe.lastVal = val;
        const vm = {};
        for (const observer of this.#args) {
            const { lastVal, remoteProp } = observer;
            vm[remoteProp] = lastVal;
        }
        const result = await this.expr(vm);
        console.log({ observe, result });
        if (this.#localSignal === undefined) {
            const signal = await getLocalSignal(this.enhancedElement);
            this.#localProp = signal.prop;
            this.#localSignal = signal.signal;
        }
        setSignalVal(this.#localSignal, result);
    };
    #args = [];
}
