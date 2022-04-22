const CLASS_NAME = 'modal';
const CSS_TRANSITION_LENGTH = '300ms';
const CSS_TRANSLATE_DISTANCE = '200px';
const CSS_HIDE_CLASS = 'hidden';
export const EVENTS = {
  MAIN: CLASS_NAME,
  OPEN: 'open',
  CLOSE: 'close',
  TOGGLE: 'toggle'
};

const elementTmpl = document.createElement('template');
const styles = document.createElement('style');

styles.innerHTML = `
  .${ CLASS_NAME } {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 1;
    
    display: flex;
    align-items: center;

    transition: opacity ${ CSS_TRANSITION_LENGTH };
  }

  .${ CLASS_NAME }-bg {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    background-color: rgba(0,0,0,0.3);
  }

  .${ CLASS_NAME }-content {
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
    transition: transform ${ CSS_TRANSITION_LENGTH } ease-out;
  }

  .${ CSS_HIDE_CLASS }.${ CLASS_NAME } {
    opacity: 0;
    z-index: -1;
  }

  .${ CSS_HIDE_CLASS } .${ CLASS_NAME }-content {
    transform: translate3d(0, ${ CSS_TRANSLATE_DISTANCE }, 0);
  }
`;

elementTmpl.innerHTML = `
<aside class="${ CLASS_NAME } ${ CSS_HIDE_CLASS } js-${CLASS_NAME}" id="${CLASS_NAME}" role="dialog" aria-labelledby="dialog">
  <div class="${ CLASS_NAME }-bg"></div>
  <article class="${ CLASS_NAME }-content">
    <h4 class="js-${ CLASS_NAME }-heading"><slot name="heading"></slot></h4>
    <p class="js-${ CLASS_NAME }-description"><slot name="description"></slot></p>
    <section class="${ CLASS_NAME }-options">
      <slot></slot>
    </section>
  </article>
</aside>
`;

// TODO: refactor to remove <style> from basic template (append it as a separate element?)
// TODO: add <p> styles or just generally improve the .modal-content styling

// https://developer.mozilla.org/en-US/docs/Web/Web_Components
export default class CustomModal extends HTMLElement {
  constructor () {
    super();
    
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(styles);
    shadow.appendChild(elementTmpl.content.cloneNode(true));
  }

  static selector = `.js-${ CLASS_NAME }`;

  connectedCallback () {
    this.element = this.shadowRoot.querySelector(`${ CustomModal.selector }`);
    this.addListeners();
    this.render();
  }

  addListeners () {
    this.open = this.open.bind(this);
    this.close = this.close.bind(this);

    // NOTE: refactor to be able to remove eventListener in disconnectedCallback()
    this.addEventListener(EVENTS.MAIN, (evt) => {
      evt.preventDefault();
      const { message } = evt.detail;
      switch (message) {
        case 'OPEN':
          this.open();
          break;
        case 'CLOSE':
          this.close();
          break;
        default:
          console.error(`Invalid modal message: ${ message }`);
          break;
      }
    });
  }

  render () {
    this.shadowRoot.querySelector(`${ CustomModal.selector }-heading`).innerText = this.getAttribute('heading');
    this.shadowRoot.querySelector(`${ CustomModal.selector }-description`).innerText = this.getAttribute('desctiption');
  }

  open () {
    this.element.classList.remove(CSS_HIDE_CLASS);
  }
  close () {
    this.element.classList.add(CSS_HIDE_CLASS);
  }
}
