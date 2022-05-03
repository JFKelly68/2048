import DynamicComponent from './Dynamic';
import { STYLES as AppStyles } from './App';
export const STYLES = {
  TRANSITION_LENGTH: '300ms',
  TRANSLATE_DISTANCE: '200px',
}
export const EVENTS = {
  TOGGLE: 'toggle',
  OPEN: 'open',
  CLOSE: 'close',
};

// TODO: refactor to remove <style> from basic template (append it as a separate element?)
// TODO: add <p> styles or just generally improve the .modal-content styling

// https://developer.mozilla.org/en-US/docs/Web/Web_Components
export default class CustomModal extends DynamicComponent {
  constructor () {
    super();
  }

  static tagName = 'custom-modal';
  static className = 'modal'
  static selector = `js-${ this.className }`;
  static attributes = {
    heading: 'heading',
    description: 'description'
  }
  static htmlAttributes = {
    role: 'dialog',
    'aria-labelledby': 'dialog'
  }
  static classList = [
    CustomModal.className,
    `js-${CustomModal.className}`
  ];

  static styles () {
    return `
      <style>
        .${ CustomModal.className } {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 1;
          
          display: flex;
          align-items: center;
      
          transition: opacity ${ STYLES.TRANSITION_LENGTH };
        }
      
        .${ CustomModal.className }-bg {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          background-color: rgba(0,0,0,0.3);
        }
      
        .${ CustomModal.className }-content {
          margin: 0 auto;
          width: 60%;
          min-width: 300px;
          background-color: #FFFFFF;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
      
          transform: translate3d(0, 0, 0);
          transition: transform ${ STYLES.TRANSITION_LENGTH } ease-out;
        }
      </style>
    `;
  }

  static template ({ heading, description }) {
    return `
      <div class="${ CustomModal.className }-bg"></div>
      <article class="${ CustomModal.className }-content">
        <h4 class="js-${ CustomModal.className }-heading"><slot name="heading">${ heading }</slot></h4>
        <p class="js-${ CustomModal.className }-description"><slot name="description">${ description }</slot></p>
        <section class="${ CustomModal.className }-options">
          <slot>Default slot content</slot>
        </section>
      </article>
    `;
  }

  static observedAttributes = Object.values(CustomModal.attributes);

  attributeChangedCallback (name, old, fresh) {
    switch (name) {
      case CustomModal.attributes.heading:
      case CustomModal.attributes.description:
        this.render({ [name]: fresh });
        break;
      default:
        throw new Error(`Unknown attribute: ${name} updated`);
    }
  }

  connectedCallback () {
    this.addListeners();
  }

  addListeners () {
    this._onToggle = this._onToggle.bind(this);
    // this.open = this.open.bind(this);
    // this.close = this.close.bind(this);

    // NOTE: refactor to be able to remove eventListener in disconnectedCallback()
    this.addEventListener(EVENTS.TOGGLE, this._onToggle);
  }

  render ({ heading, description }) {
    if (heading) this.querySelector(`.${ CustomModal.selector }-heading`).innerText = heading;
    if (description) this.querySelector(`.${ CustomModal.selector }-description`).innerText = description;
  }

  _onToggle (evt) {
    evt.stopPropagation();
    const { message } = evt.detail;
    switch (message) {
      case EVENTS.OPEN:
        this.open();
        break;
      case EVENTS.CLOSE:
        this.close();
        break;
      default:
        console.error(`Invalid modal message: ${ message }`);
        break;
    }
  }

  open () {
    this.classList.remove(AppStyles.HIDE_CLASS);
  }
  close () {
    this.classList.add(AppStyles.HIDE_CLASS);
  }
}
