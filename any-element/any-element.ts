export class AnyElement extends HTMLElement{
    #prop1: boolean | undefined;
    get prop1(){
        return this.#prop1;
    }
    set prop1(nv){
        this.#prop1 = nv;
        const div = this.shadowRoot?.querySelector('#prop1');
        if(div !== null && div !== undefined) div.textContent = '' + nv;
    }

    #prop2: string | undefined;
    get prop2(){
        return this.#prop2;
    }
    set prop2(nv){
        this.#prop2 = nv;
        const div = this.shadowRoot?.querySelector('#prop2');
        if(div !== null && div !== undefined) div.textContent = '' + nv;
    }

    constructor(){
        super();
        this.attachShadow({mode: 'open'});
    }

    connectedCallback(){
        this.shadowRoot!.innerHTML = String.raw `
        <div id=prop1></div>
        <div id=prop2></div>
        `;
    }
}