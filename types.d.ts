import { ActionOnEventConfigs } from "trans-render/froop/types";
import {IBE} from 'be-enhanced/types';
import {Target, Scope, ProxyPropChangeInfo} from 'trans-render/lib/types';
//import {BVAAllProps} from 'be-value-added/types';
//import {AP as BPAP, ISignal, Actions as BPActions} from 'be-propagating/types';
import {ElTypes, SignalRefType} from 'be-linked/types';
import {ObserveRule} from 'be-observant/types';

export interface EndUserProps extends IBE{
    from?: Array<ValueStatement>;
    //Props?: Array<PropsStatement>;
    scriptRef?: Target,
    nameOfExport?: string,
}

export interface Arg extends ObserveRule{
    //attr?: string,
    signal?: WeakRef<SignalRefType>,
    transformAttr?: string,
}




export interface AllProps extends EndUserProps{
    isParsed?: boolean;
    evaluate?: (vals: any) => any;
    fromStatements?: Array<ComputeStatement>;
}

export type ValueStatement = string;


export type AP = AllProps;

export type PAP = Partial<AP>;

export type ProPAP = Promise<PAP>;

export type POA = [PAP | undefined, ActionOnEventConfigs<PAP, Actions>];

export interface Actions{
    onFrom(self: this): ProPAP;
    //importSymbols(self: this): ProPAP;
    hydrate(self: this): ProPAP;
}

export interface ComputeStatement{
    attrContainingExpression?: string,
    importName?: string,
    previousElementScriptElement?: boolean,
    onloadOrPreviousElementScriptElement?: boolean,
    dependencies?: string,
    args?: Array<Arg>,
    assignResult?: boolean,
    localProp?: string,
    matchIdx?: number,
}

