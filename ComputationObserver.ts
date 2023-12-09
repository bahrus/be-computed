import { ObserveRule, ObserverOptions } from "be-observant/types";
import { Arg, FromStatement } from './types';
import { getLocalSignal } from "be-linked/defaults.js";
import { getRemoteEl } from "be-linked/getRemoteEl.js";
import { Observer } from "be-observant/Observer.js";
import { BeComputed } from "./be-computed.js";
import {setSignalVal} from 'be-linked/setSignalVal.js';
import { SignalRefType } from "be-linked/types";

export class ComputationObserver{
    constructor(
        public expr: (vm: any) => any,
        public fromStatement: FromStatement,
        args: Array<Arg>,
        public enhancedElement: Element,
        enhancementInstance: BeComputed
    ){
        this.#noOfArgs = args.length;
        this.#hydrate(args, enhancedElement, enhancementInstance);
    }
    #noOfArgs: number;
    #abortControllers: Array<AbortController>  = [];
    #localProp: string | undefined;
    #localSignal: SignalRefType | undefined;
    disconnect(){
        for(const ac of this.#abortControllers){
            ac.abort();
        }
        this.#abortControllers = [];
    }
    async #hydrate(
        args: Array<Arg>, 
        enhancedElement: Element,
        enhancementInstance: BeComputed
        ){
            
        const callback = this.handleObserveCallback;
        for(const arg of args){
            const observeRule: Arg = {
                ...arg,
                callback
            };
            this.#args.push(observeRule);
            let {localProp, transformAttr, remoteProp, remoteType} = arg;
            if(localProp === undefined && transformAttr === undefined){
                
            }
            const remoteEl = await getRemoteEl(enhancedElement, remoteType, remoteProp);
            const observerOptions: ObserverOptions = {
                abortControllers: this.#abortControllers,
                remoteEl,
            }
            new Observer(enhancementInstance, observeRule, observerOptions);
            
        }
    }

    handleObserveCallback = async (observe: ObserveRule, val: any)  => {
        if(this.#abortControllers.length !== this.#noOfArgs) return;
        if(observe.lastVal === val) return;
        observe.lastVal = val;
        const vm: any = {};
        for(const observer of this.#args){
            const {lastVal, remoteProp} = observer;
            vm[remoteProp] = lastVal;
        }
        const result = await this.expr(vm);
        console.log({observe, result});
        if(this.#localSignal === undefined){
            const signal = await getLocalSignal(this.enhancedElement);
            this.#localProp = signal.prop;
            this.#localSignal = signal.signal;
        }
        
        setSignalVal(this.#localSignal, result);
    }

    #args: Array<Arg> = [];

    

}