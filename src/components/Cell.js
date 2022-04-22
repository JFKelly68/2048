import DynamicComponent from "./Dynamic";

export default class Cell extends DynamicComponent {
  constructor () {
    super();
    
    this.contentEl = this.shadowRoot.querySelector('span');
  }

  static tagName = 'game-cell';

  static get className () {
    return 'cell';
  }
  
  static selector = `js-${ this.className }`;

  static classList = [
    `${ Cell.className }`,
    `${ Cell.selector }`
  ]


  static emptyValues = {
    display: '',
    attribute: 'empty',
    value: null // never make this a number
  }

  static attributes = {
    value: 'value'
  }

  static template ({ value }) {
    return `<span>${
      JSON.parse(value) === Cell.emptyValues.value 
        ? `${ Cell.emptyValues.display }` 
        : `${ value }`
    }</span>`;
  }

  static observedAttributes = Object.values(Cell.attributes);
  
  attributeChangedCallback (name, old, fresh) {
    if (name === Cell.attributes.value) this.render(JSON.parse(fresh));
  }

  connectedCallback () {}

  render (val) {
    // this.element.setAttribute(Cell.attributes.size, val || this.constructor.emptyValues.attribute);
    this.contentEl.innerText = val || this.constructor.emptyValues.display;
  }
}