
export default class DynamicComponent extends HTMLElement {
  constructor () {
    super();
    
    const styles = this.constructor.styles();
    const attrs = Object.entries(this.constructor.attributes).reduce((acc, [key, val]) => ({ ...acc, [key]: this.getAttribute(val) }), {});
    const rendered = this.constructor.template(attrs);
    this.innerHTML = `${styles}${rendered}`; // innerHTML is a synchronous operation vs appendChild which is async
  }

  static makeTemplateElement (tmpl) {
    if (!tmpl) throw new Error('No template argument provided');
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