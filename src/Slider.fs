module Echelon.DesignSystem.Slider

open System
open System.Globalization
open Fable.Core.JsInterop
open Echelon.DesignSystem.Runtime.WebComponent

let private tagName = "ef-slider"

let private template = """
<style>
  :host {
    display: block;
    color: var(--ef-color-text-primary, #171a18);
    font-family: var(--ef-primitive-font-family-sans, system-ui, sans-serif);
  }

  *, *::before, *::after { box-sizing: border-box; }

  .field { display: grid; gap: var(--ef-primitive-spacing-2, 0.5rem); }
  .header { display: flex; align-items: baseline; justify-content: space-between; gap: 1rem; }
  .label { font-size: 0.9375rem; font-weight: 650; line-height: 1.25; }
  .readout {
    min-inline-size: 3ch;
    color: var(--ef-color-text-secondary, #686d68);
    font-family: var(--ef-primitive-font-family-mono, ui-monospace, monospace);
    font-size: 0.8125rem;
    font-variant-numeric: tabular-nums;
    text-align: end;
  }

  .control {
    position: relative;
    min-block-size: 2.75rem;
    display: grid;
    align-items: center;
  }

  .native {
    --percent: var(--ef-slider-percent, 0%);
    inline-size: 100%;
    block-size: 2.75rem;
    margin: 0;
    appearance: none;
    -webkit-appearance: none;
    background: transparent;
    cursor: pointer;
    touch-action: none;
    -webkit-tap-highlight-color: transparent;
  }

  .native::-webkit-slider-runnable-track {
    block-size: 0.375rem;
    border: 1px solid var(--ef-color-border-functional, #3a403c);
    border-radius: 999px;
    background:
      linear-gradient(
        to right,
        var(--ef-color-control-active, #905831) 0 var(--percent),
        var(--ef-color-control-track, #686d68) var(--percent) 100%
      );
  }

  .native::-moz-range-track {
    block-size: 0.375rem;
    border: 1px solid var(--ef-color-border-functional, #3a403c);
    border-radius: 999px;
    background:
      linear-gradient(
        to right,
        var(--ef-color-control-active, #905831) 0 var(--percent),
        var(--ef-color-control-track, #686d68) var(--percent) 100%
      );
  }

  .native::-webkit-slider-thumb {
    inline-size: 1.25rem;
    block-size: 1.25rem;
    margin-block-start: calc((0.375rem - 1.25rem) / 2);
    appearance: none;
    -webkit-appearance: none;
    border: 2px solid var(--ef-color-border-functional, #3a403c);
    border-radius: 50%;
    background: var(--ef-color-control-thumb, #f2efe7);
    box-shadow: 0 1px 3px rgb(0 0 0 / 0.2);
    transition:
      scale var(--ef-primitive-motion-duration-fast, 120ms) var(--ef-primitive-motion-easing-standard, ease),
      box-shadow var(--ef-primitive-motion-duration-fast, 120ms) var(--ef-primitive-motion-easing-standard, ease);
  }

  .native::-moz-range-thumb {
    inline-size: 1.25rem;
    block-size: 1.25rem;
    border: 2px solid var(--ef-color-border-functional, #3a403c);
    border-radius: 50%;
    background: var(--ef-color-control-thumb, #f2efe7);
    box-shadow: 0 1px 3px rgb(0 0 0 / 0.2);
    transition:
      scale var(--ef-primitive-motion-duration-fast, 120ms) var(--ef-primitive-motion-easing-standard, ease),
      box-shadow var(--ef-primitive-motion-duration-fast, 120ms) var(--ef-primitive-motion-easing-standard, ease);
  }

  .native:hover::-webkit-slider-thumb,
  .native:focus-visible::-webkit-slider-thumb { scale: 1.08; }
  .native:active::-webkit-slider-thumb { scale: 1.18; }
  .native:hover::-moz-range-thumb,
  .native:focus-visible::-moz-range-thumb { scale: 1.08; }
  .native:active::-moz-range-thumb { scale: 1.18; }

  .native:focus-visible { outline: none; }
  .native:focus-visible::-webkit-slider-thumb {
    outline: 3px solid var(--ef-color-focus-gap, #f2efe7);
    outline-offset: 2px;
    box-shadow: 0 0 0 5px var(--ef-color-focus-ring, #171a18);
  }
  .native:focus-visible::-moz-range-thumb {
    outline: 3px solid var(--ef-color-focus-gap, #f2efe7);
    outline-offset: 2px;
    box-shadow: 0 0 0 5px var(--ef-color-focus-ring, #171a18);
  }

  .bubble {
    position: absolute;
    inset-block-start: -0.15rem;
    inset-inline-start: var(--ef-slider-percent, 0%);
    z-index: 2;
    padding: 0.2rem 0.4rem;
    border: 1px solid var(--ef-color-border-functional, #3a403c);
    background: var(--ef-color-surface-inverse, #202421);
    color: var(--ef-color-text-inverse, #f2efe7);
    font-family: var(--ef-primitive-font-family-mono, ui-monospace, monospace);
    font-size: 0.6875rem;
    line-height: 1;
    opacity: 0;
    pointer-events: none;
    transform: translate(-50%, -65%) scale(0.96);
    transition:
      opacity var(--ef-primitive-motion-duration-fast, 120ms) var(--ef-primitive-motion-easing-enter, ease),
      transform var(--ef-primitive-motion-duration-fast, 120ms) var(--ef-primitive-motion-easing-enter, ease);
  }

  .native:is(:hover, :focus-visible, :active) + .bubble {
    opacity: 1;
    transform: translate(-50%, -80%) scale(1);
  }

  .description {
    color: var(--ef-color-text-secondary, #686d68);
    font-size: 0.8125rem;
    line-height: 1.35;
  }
  .description:empty { display: none; }

  :host([disabled]) .native,
  :host([data-form-disabled]) .native { cursor: not-allowed; opacity: 0.62; }

  @media (prefers-reduced-motion: reduce) {
    .native::-webkit-slider-thumb,
    .native::-moz-range-thumb,
    .bubble { transition-duration: 0.01ms; }
  }

  @media (forced-colors: active) {
    .native::-webkit-slider-runnable-track,
    .native::-moz-range-track { background: Canvas; border-color: CanvasText; }
    .native::-webkit-slider-thumb,
    .native::-moz-range-thumb { background: Canvas; border-color: CanvasText; box-shadow: none; }
    .bubble { background: Canvas; color: CanvasText; border-color: CanvasText; }
  }
</style>
<div class="field">
  <div class="header">
    <span class="label"></span>
    <output class="readout"></output>
  </div>
  <div class="control">
    <input class="native" type="range" />
    <span class="bubble" aria-hidden="true"></span>
  </div>
  <span class="description" id="description"></span>
</div>
"""

let private attrOr fallback host name =
    getAttribute host name |> Option.defaultValue fallback

let private tryFloat fallback (value: string) =
    match Double.TryParse(value, NumberStyles.Float, CultureInfo.InvariantCulture) with
    | true, parsed -> parsed
    | _ -> fallback

let private midpoint minValue maxValue =
    minValue + ((maxValue - minValue) / 2.0)

let private invariant value =
    value.ToString("0.########", CultureInfo.InvariantCulture)

let private sync host =
    let root = storedShadow host
    let input = query root ".native"
    let label = query root ".label"
    let readout = query root ".readout"
    let bubble = query root ".bubble"
    let description = query root ".description"

    let minText = attrOr "0" host "min"
    let maxText = attrOr "100" host "max"
    let stepText = attrOr "1" host "step"
    let minValue = tryFloat 0.0 minText
    let proposedMax = tryFloat 100.0 maxText
    let maxValue = if proposedMax < minValue then minValue else proposedMax
    let defaultValue = midpoint minValue maxValue |> invariant
    let requestedValue = attrOr defaultValue host "value"
    let disabledState = hasAttribute host "disabled" || formDisabledState host
    let labelText = attrOr "Value" host "label"
    let descriptionText = attrOr "" host "description"

    setProperty input "min" (box (invariant minValue))
    setProperty input "max" (box (invariant maxValue))
    setProperty input "step" (box stepText)
    setProperty input "value" (box requestedValue)
    setProperty input "disabled" (box disabledState)
    setAttribute input "aria-label" labelText

    let normalizedValue = getProperty<string> input "value"
    if getAttribute host "value" <> Some normalizedValue then
        setAttribute host "value" normalizedValue

    let numericValue = tryFloat minValue normalizedValue
    let denominator = maxValue - minValue
    let rawPercent = if denominator <= 0.0 then 0.0 else ((numericValue - minValue) / denominator) * 100.0
    let percent = Math.Clamp(rawPercent, 0.0, 100.0)
    setStyleProperty input "--ef-slider-percent" (invariant percent + "%")
    setStyleProperty bubble "--ef-slider-percent" (invariant percent + "%")

    setText label labelText
    setText readout normalizedValue
    setText bubble normalizedValue
    setText description descriptionText

    if String.IsNullOrWhiteSpace descriptionText then
        removeAttribute input "aria-describedby"
    else
        setAttribute input "aria-describedby" "description"

    if formDisabledState host then
        setAttribute host "data-form-disabled" ""
    else
        removeAttribute host "data-form-disabled"

    setFormValue (internals host) (box normalizedValue)

let private installProperties host =
    let textProperty name fallback =
        defineProperty host name
            (fun () -> box (attrOr fallback host name))
            (fun value -> setAttribute host name (string value))

    textProperty "value" "50"
    textProperty "min" "0"
    textProperty "max" "100"
    textProperty "step" "1"

    defineProperty host "disabled"
        (fun () -> box (hasAttribute host "disabled"))
        (fun value -> setBooleanAttribute host "disabled" (unbox<bool> value))

let private initialize host =
    let root = attachOpenShadow host
    setShadow host root
    setInternals host (attachInternals host)
    setInnerHtml root template
    installProperties host

    let input = query root ".native"

    on input "input" (fun eventValue ->
        stopPropagation eventValue
        let value = getProperty<string> input "value"
        setAttribute host "value" value
        sync host
        dispatchCustom host "ef-input" (createObj [ "value" ==> value ]) false |> ignore
        dispatchStandard host "input"
    )

    on input "change" (fun eventValue ->
        stopPropagation eventValue
        let value = getProperty<string> input "value"
        setAttribute host "value" value
        sync host
        dispatchCustom host "ef-change" (createObj [ "value" ==> value ]) false |> ignore
        dispatchStandard host "change"
    )

let private connected host =
    let minValue = tryFloat 0.0 (attrOr "0" host "min")
    let maxValue = tryFloat 100.0 (attrOr "100" host "max")
    let initial = attrOr (midpoint minValue maxValue |> invariant) host "value"
    captureInitialValue host initial
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
    setAttribute host "value" (initialValue host)
    sync host

let register () =
    defineAutonomousElement
        tagName
        true
        [| "value"; "min"; "max"; "step"; "disabled"; "label"; "description" |]
        initialize
        connected
        attributeChanged
        formDisabled
        formReset
