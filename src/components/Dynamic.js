
export default class DynamicComponent extends HTMLElement {
  constructor () {
    super();
    // this.attachShadow({ mode: 'open' });
    
    const styles = this.constructor.styles();
    // const stylesTemplate = this.constructor.makeTemplateElement(styles);
    // const cloneStyles = stylesTemplate.content.cloneNode(true);
    const attrs = Object.entries(this.constructor.attributes).reduce((acc, [key, val]) => ({ ...acc, [key]: this.getAttribute(val) }), {});
    const rendered = this.constructor.template(attrs);
    // const template = this.constructor.makeTemplateElement(rendered);
    // const cloneChild = template.content.cloneNode(true);
    // shadow.append(cloneStyles, cloneChild);
    this.innerHTML = `${styles}${rendered}`;
  }

  static makeTemplateElement (tmpl) {
    const template = document.createElement('template');
    template.innerHTML = tmpl;
    return template;
  }

  static makeEvent (name, data) {
    return new CustomEvent(name, { bubbles: true, ...data});
  }

  static get tagName () { throw new Error(`${this.constructor.name} class must overwrite the static get method "tagName"`); }
  static styles () { return `<style></style>`; }
  static template () { throw new Error(`${this.constructor.name} class must override static method "template"`); }
  static get attributes () { throw new Error(`${ this.constructor.name } class must override static get method "attributes"`); }
}