module Echelon.DesignSystem.Runtime.WebComponent

open Fable.Core
open Fable.Core.JsInterop

[<Emit("""
(() => {
  if (globalThis.customElements.get($0)) return;
  const observed = $2;
  const formAssociated = $1;
  const initialize = $3;
  const connected = $4;
  const attributeChanged = $5;
  const formDisabled = $6;
  const formReset = $7;

  class EchelonElement extends HTMLElement {
    constructor() {
      super();
      initialize(this);
    }
    connectedCallback() {
      connected(this);
    }
    attributeChangedCallback(name, oldValue, newValue) {
      attributeChanged({ host: this, name, oldValue, newValue });
    }
    formDisabledCallback(disabled) {
      formDisabled({ host: this, disabled });
    }
    formResetCallback() {
      formReset(this);
    }
  }

  Object.defineProperty(EchelonElement, "formAssociated", { value: formAssociated });
  Object.defineProperty(EchelonElement, "observedAttributes", { get: () => observed });
  globalThis.customElements.define($0, EchelonElement);
})()
""")>]
let private defineRaw
    (tagName: string)
    (formAssociated: bool)
    (observedAttributes: string array)
    (initialize: obj -> unit)
    (connected: obj -> unit)
    (attributeChanged: obj -> unit)
    (formDisabled: obj -> unit)
    (formReset: obj -> unit)
    : unit = jsNative

let defineAutonomousElement
    tagName
    formAssociated
    observedAttributes
    initialize
    connected
    attributeChanged
    formDisabled
    formReset =
    defineRaw tagName formAssociated observedAttributes initialize connected attributeChanged formDisabled formReset

[<Emit("$0.attachShadow({ mode: 'open' })")>]
let attachOpenShadow (host: obj) : obj = jsNative

[<Emit("$0.attachInternals()")>]
let attachInternals (host: obj) : obj = jsNative

[<Emit("$0.shadowRoot")>]
let shadowRoot (host: obj) : obj = jsNative

[<Emit("$0.innerHTML = $1")>]
let setInnerHtml (target: obj) (html: string) : unit = jsNative

[<Emit("$0.querySelector($1)")>]
let query (target: obj) (selector: string) : obj = jsNative

[<Emit("$0.addEventListener($1, $2)")>]
let on (target: obj) (eventName: string) (handler: obj -> unit) : unit = jsNative

[<Emit("$0.stopPropagation()")>]
let stopPropagation (eventValue: obj) : unit = jsNative

[<Emit("$0.preventDefault()")>]
let preventDefault (eventValue: obj) : unit = jsNative

[<Emit("$0.hasAttribute($1)")>]
let hasAttribute (host: obj) (name: string) : bool = jsNative

[<Emit("$0.getAttribute($1)")>]
let private getAttributeRaw (host: obj) (name: string) : obj = jsNative

let getAttribute (host: obj) name : string option =
    let value = getAttributeRaw host name
    if isNull value then None else Some(unbox value)

[<Emit("$0.setAttribute($1, $2)")>]
let setAttribute (host: obj) (name: string) (value: string) : unit = jsNative

[<Emit("$0.removeAttribute($1)")>]
let removeAttribute (host: obj) (name: string) : unit = jsNative

let setBooleanAttribute host name value =
    if value then setAttribute host name "" else removeAttribute host name

[<Emit("$0[$1]")>]
let getProperty<'T> (target: obj) (name: string) : 'T = jsNative

[<Emit("$0[$1] = $2")>]
let setProperty (target: obj) (name: string) (value: obj) : unit = jsNative

[<Emit("Object.defineProperty($0, $1, { configurable: true, enumerable: true, get: $2, set: $3 })")>]
let defineProperty (host: obj) (name: string) (getter: unit -> obj) (setter: obj -> unit) : unit = jsNative

[<Emit("$0.setFormValue($1)")>]
let setFormValue (internals: obj) (value: obj) : unit = jsNative

[<Emit("$0.setValidity($1, $2, $3)")>]
let setValidity (internals: obj) (flags: obj) (message: string) (anchor: obj) : unit = jsNative

[<Emit("$0.setValidity({})")>]
let clearValidity (internals: obj) : unit = jsNative

[<Emit("new CustomEvent($0, { detail: $1, bubbles: true, composed: true, cancelable: $2 })")>]
let private customEvent (eventName: string) (detail: obj) (cancelable: bool) : obj = jsNative

[<Emit("new Event($0, { bubbles: true, composed: true })")>]
let private standardEvent (eventName: string) : obj = jsNative

[<Emit("$0.dispatchEvent($1)")>]
let dispatch (host: obj) (eventValue: obj) : bool = jsNative

let dispatchCustom host eventName detail cancelable =
    dispatch host (customEvent eventName detail cancelable)

let dispatchStandard host eventName =
    dispatch host (standardEvent eventName) |> ignore

[<Emit("$0.style.setProperty($1, $2)")>]
let setStyleProperty (target: obj) (name: string) (value: string) : unit = jsNative

[<Emit("$0.textContent = $1")>]
let setText (target: obj) (value: string) : unit = jsNative

[<Emit("$0.toggleAttribute($1, $2)")>]
let toggleAttribute (target: obj) (name: string) (value: bool) : unit = jsNative

[<Emit("$0.__efInitialChecked ??= $1")>]
let captureInitialChecked (host: obj) (value: bool) : unit = jsNative

[<Emit("$0.__efInitialChecked")>]
let initialChecked (host: obj) : bool = jsNative

[<Emit("$0.__efInitialValue ??= $1")>]
let captureInitialValue (host: obj) (value: string) : unit = jsNative

[<Emit("$0.__efInitialValue")>]
let initialValue (host: obj) : string = jsNative

[<Emit("$0.__efFormDisabled = $1")>]
let setFormDisabledState (host: obj) (value: bool) : unit = jsNative

[<Emit("Boolean($0.__efFormDisabled)")>]
let formDisabledState (host: obj) : bool = jsNative

[<Emit("$0.__efInternals")>]
let internals (host: obj) : obj = jsNative

[<Emit("$0.__efInternals = $1")>]
let setInternals (host: obj) (value: obj) : unit = jsNative

[<Emit("$0.__efShadow = $1")>]
let setShadow (host: obj) (value: obj) : unit = jsNative

[<Emit("$0.__efShadow")>]
let storedShadow (host: obj) : obj = jsNative
