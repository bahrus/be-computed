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
export function rewrite(script, names) {
    const trimmedScript = script.trim();
    if (trimmedScript.includes('export const')) {
        return trimmedScript;
    }
    if (trimmedScript[0] === '(') {
        if (trimmedScript.startsWith('({') && trimmedScript.endsWith('})') && !trimmedScript.includes('=>')) {
            const newScript1 = `export const expr = async ({${names.join(', ')}}) =>${trimmedScript}`;
            return newScript1;
        }
        else {
            const newScript2 = `export const expr = async ${trimmedScript}`;
            return newScript2;
        }
    }
    const newScript3 = `
        export const expr = async ({${names.join(', ')}}) => {
            return ${trimmedScript};
        }
    `;
    return newScript3;
}
