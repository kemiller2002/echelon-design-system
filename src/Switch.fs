module Echelon.DesignSystem.Switch

open Fable.Core.JsInterop
open Echelon.DesignSystem.Runtime.WebComponent

let private tagName = "ef-switch"

let private template = """
<style>
  :host {
    display: inline-block;
    color: var(--ef-color-text-primary, #171a18);
    font-family: var(--ef-primitive-font-family-sans, system-ui, sans-serif);
    --track-width: 2.75rem;
    --track-height: 1.5rem;
    --thumb-size: 1.125rem;
    --thumb-gap: 0.1875rem;
  }

  *, *::before, *::after { box-sizing: border-box; }

  .switch {
    position: relative;
    display: inline-grid;
    grid-template-columns: var(--track-width) minmax(0, 1fr);
    align-items: center;
    gap: var(--ef-primitive-spacing-3, 0.75rem);
    min-block-size: 2.75rem;
    cursor: pointer;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
  }

  .native {
    position: absolute;
    inset: 0;
    z-index: 2;
    margin: 0;
    opacity: 0;
    cursor: inherit;
  }

  .track {
    position: relative;
    inline-size: var(--track-width);
    block-size: var(--track-height);
    border: 1px solid var(--ef-color-border-functional, #3a403c);
    border-radius: 999px;
    background: var(--ef-color-control-track, #686d68);
    transition:
      background var(--ef-primitive-motion-duration-standard, 180ms) var(--ef-primitive-motion-easing-standard, ease),
      border-color var(--ef-primitive-motion-duration-standard, 180ms) var(--ef-primitive-motion-easing-standard, ease);
  }

  .track::after {
    content: "";
    position: absolute;
    inset-block-start: var(--thumb-gap);
    inset-inline-start: var(--thumb-gap);
    inline-size: var(--thumb-size);
    block-size: var(--thumb-size);
    border: 1px solid var(--ef-color-border-functional, #3a403c);
    border-radius: 50%;
    background: var(--ef-color-control-thumb, #f2efe7);
    box-shadow: 0 1px 2px rgb(0 0 0 / 0.18);
    transform: translateX(0);
    transition:
      transform var(--ef-primitive-motion-duration-standard, 180ms) var(--ef-primitive-motion-easing-standard, ease),
      scale var(--ef-primitive-motion-duration-fast, 120ms) var(--ef-primitive-motion-easing-standard, ease);
  }

  .native:checked + .track {
    background: var(--ef-color-control-active, #905831);
  }

  .native:checked + .track::after {
    transform: translateX(calc(var(--track-width) - var(--thumb-size) - (2 * var(--thumb-gap))));
  }

  .native:active + .track::after { scale: 1.12; }

  .native:focus-visible + .track {
    outline: 3px solid var(--ef-color-focus-gap, #f2efe7);
    outline-offset: 2px;
    box-shadow: 0 0 0 5px var(--ef-color-focus-ring, #171a18);
  }

  .text { min-inline-size: 0; }
  .label { display: block; font-size: 0.9375rem; font-weight: 650; line-height: 1.25; }
  .description {
    display: block;
    margin-block-start: 0.2rem;
    color: var(--ef-color-text-secondary, #686d68);
    font-size: 0.8125rem;
    line-height: 1.35;
  }
  .description:empty { display: none; }

  :host([disabled]) .switch,
  :host([data-form-disabled]) .switch {
    cursor: not-allowed;
    opacity: 0.62;
  }

  @media (prefers-reduced-motion: reduce) {
    .track, .track::after { transition-duration: 0.01ms; }
  }

  @media (forced-colors: active) {
    .track { background: Canvas; border-color: CanvasText; }
    .track::after { background: Canvas; border-color: CanvasText; box-shadow: none; }
    .native:checked + .track { background: Highlight; }
    .native:checked + .track::after { background: HighlightText; }
    .native:focus-visible + .track { outline: 2px solid Highlight; box-shadow: none; }
  }
</style>
<label class="switch">
  <input class="native" type="checkbox" role="switch" />
  <span class="track" aria-hidden="true"></span>
  <span class="text">
    <span class="label"></span>
    <span class="description" id="description"></span>
  </span>
</label>
"""

let private attrOr fallback host name =
    getAttribute host name |> Option.defaultValue fallback

let private sync host =
    let root = storedShadow host
    let input = query root ".native"
    let label = query root ".label"
    let description = query root ".description"
    let checkedState = hasAttribute host "checked"
    let hostDisabled = hasAttribute host "disabled"
    let disabledState = hostDisabled || formDisabledState host
    let requiredState = hasAttribute host "required"
    let value = attrOr "on" host "value"
    let labelText = attrOr "Toggle" host "label"
    let descriptionText = attrOr "" host "description"

    setProperty input "checked" (box checkedState)
    setProperty input "disabled" (box disabledState)
    setProperty input "required" (box requiredState)
    setAttribute input "aria-label" labelText
    setText label labelText
    setText description descriptionText

    if System.String.IsNullOrWhiteSpace descriptionText then
        removeAttribute input "aria-describedby"
    else
        setAttribute input "aria-describedby" "description"

    if formDisabledState host then
        setAttribute host "data-form-disabled" ""
    else
        removeAttribute host "data-form-disabled"

    let internalState = internals host
    if checkedState && not disabledState then
        setFormValue internalState (box value)
    elif checkedState then
        // Disabled controls are excluded by the browser from successful controls;
        // keeping the value here lets the UA own that exclusion.
        setFormValue internalState (box value)
    else
        setFormValue internalState null

    if requiredState && not checkedState then
        setValidity internalState (createObj [ "valueMissing" ==> true ]) "This switch is required." input
    else
        clearValidity internalState

let private installProperties host =
    defineProperty host "checked"
        (fun () -> box (hasAttribute host "checked"))
        (fun value -> setBooleanAttribute host "checked" (unbox<bool> value))

    defineProperty host "disabled"
        (fun () -> box (hasAttribute host "disabled"))
        (fun value -> setBooleanAttribute host "disabled" (unbox<bool> value))

    defineProperty host "required"
        (fun () -> box (hasAttribute host "required"))
        (fun value -> setBooleanAttribute host "required" (unbox<bool> value))

    defineProperty host "value"
        (fun () -> box (attrOr "on" host "value"))
        (fun value -> setAttribute host "value" (string value))

let private initialize host =
    let root = attachOpenShadow host
    setShadow host root
    setInternals host (attachInternals host)
    setInnerHtml root template
    installProperties host

    let input = query root ".native"

    on input "input" stopPropagation

    on input "change" (fun eventValue ->
        stopPropagation eventValue
        let requested = getProperty<bool> input "checked"
        let detail = createObj [ "checked" ==> requested ]
        let accepted = dispatchCustom host "ef-change-requested" detail true

        if accepted then
            setBooleanAttribute host "checked" requested
            sync host
            dispatchStandard host "input"
            dispatchStandard host "change"
        else
            setProperty input "checked" (box (hasAttribute host "checked"))
    )

let private connected host =
    captureInitialChecked host (hasAttribute host "checked")
    sync host

let private attributeChanged context =
    let host: obj = context?host
    sync host

let private formDisabled context =
    let host: obj = context?host
    let disabled: bool = context?disabled
    setFormDisabledState host disabled
    sync host

let private formReset host =
    setBooleanAttribute host "checked" (initialChecked host)
    sync host

let register () =
    defineAutonomousElement
        tagName
        true
        [| "checked"; "disabled"; "required"; "value"; "label"; "description" |]
        initialize
        connected
        attributeChanged
        formDisabled
        formReset
