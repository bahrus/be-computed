import {AP} from './types';

// export function rewrite({enhancedElement, nameOfExport: nameOfFormula, instructions}: AP, scriptEl: HTMLScriptElement){
//     const inner = scriptEl.innerHTML.trim();
//     const args = instructions![0].args;
//     if(inner.indexOf('=>') === -1){
//         // const strArgs: string[] = [];
//         // instance.getStringArgs(args, strArgs);
//         const str = `export const ${nameOfFormula} = async ({${args!.map(x => x.prop).join(',')}}) => ({
//             value: ${inner}
//         })`;
//         scriptEl.innerHTML = str
//     }else if(!inner.startsWith(`export const ${nameOfFormula} = async `)){
//         scriptEl.innerHTML = `export const ${nameOfFormula} = async ` + inner;
//     }
// }

export function rewrite(script: string, names: Array<string>): string{
    const trimmedScript = script.trim();
    if(trimmedScript[0] === '('){
        throw 'NI';
    }
    const newScript = `
        export const default = async ({${names.join(', ')}}) => {
            return ${script};
        }
    `;
    return newScript;
}