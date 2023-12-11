export class MyCustomElement extends HTMLElement{
    #numValue = 23;
    get numValue(){
        return this.#numValue;
    }
    set numValue(nv: number){
        this.#numValue = nv;
        this.shadowRoot!.querySelector('#target2')!.innerHTML = nv.toString();
    }

    constructor(){
        super();
        this.attachShadow({mode: 'open'});
    }

    disconnectedCallback(){
        console.log('disconnected');
    }

    connectedCallback(){
        console.log('connected');
        this.shadowRoot!.innerHTML = String.raw `
        <div id=target2></div>
        <script nomodule>
            numValue ** 2
        </script>
        <h3>Exampe 1i</h3>
        <data itemprop=squared be-computed='from /numValue.'></data>
        <be-hive></be-hive>
    `;
    }
}
customElements.define('my-custom-element', MyCustomElement);