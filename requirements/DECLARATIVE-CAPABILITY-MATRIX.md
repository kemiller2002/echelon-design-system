# Declarative Capability Matrix

The design-system package is HTML and CSS only. This matrix determines whether a pattern belongs fully in the package or requires a Limen/application behavior layer.

| Pattern | HTML/CSS-only status | Design-system responsibility | Limen/application responsibility |
|---|---|---|---|
| Button/link | complete | visual treatment, states, focus | domain command handling |
| Checkbox/radio | complete | visual treatment | domain handling |
| Switch | complete | checkbox-based markup + motion | persist/authorize domain change |
| Slider | complete with native presentation tradeoffs | native range markup + accent/focus polish | live computed display, domain validation if needed |
| Segmented control | complete | radio-based markup + selection polish | domain handling |
| Question shell | complete | prompt/help/validation layout | applicability, scoring, branching |
| Ordinal / Likert scale | complete | native radios, responsive 3/4/5/6/7/10/11 scales | labels, scoring, applicability |
| Binary choice | complete | radio-backed 2/3-way selection preserving Unanswered | domain meaning/scoring |
| Semantic differential | complete | labelled endpoint ordinal radio scale | endpoint semantics/scoring |
| Symbol/star/icon rating | complete | native radios + decorative symbols + text alternatives | semantic labels/scoring |
| Numeric stepper | complete | native number input | value interpretation/validation |
| Range entry / range slider | baseline complete; graphical enhancement requires behavior | paired direct numeric endpoints | coordinated dual-thumb behavior and cross-endpoint validation |
| Image choice | complete presentation variant | choice card + image + visible text | option identity/meaning |
| Multi-choice cardinality/exclusive option | presentation complete; constraint behavior required | guidance/status/exclusive styling | count validation and deterministic clear/reject policy |
| Matrix/repeated scale | repeated controls complete; advanced variants require behavior | responsive per-row semantic composition | global constraints, side-by-side coordination |
| Pairwise | complete | two-option native radio presentation | scoring/aggregation |
| Best-Worst | behavior required for cross-column constraint | labelled Best/Worst columns and status | enforce distinct selections |
| Hierarchical choice | baseline native tree/disclosure presentation; cascading semantics require behavior | nested labels/disclosures | parent/descendant and cascade policy |
| Choice group | complete | native radio/checkbox card presentation | option meaning and scoring |
| Special answer states | complete | visually separate native choices | Unknown/N/A domain semantics |
| Validation message/summary | complete as presentation | semantic message/summary regions | validation evaluation and focus routing |
| Survey/task progress | complete as presentation | native progress + context | current value and completion semantics |
| Ranking | behavior required | ordered-list/move-control contract | ordering, announcements, validation |
| Allocation | partially declarative | direct numeric-entry/total-state contract | aggregate total calculation and validation |
| Rule builder | behavior required | clause/group visual contract | typed expression editing/validation |
| Obligation panel | complete as presentation | obligation/severity/recovery presentation | authoritative obligation state and actions |
| Disclosure/accordion | complete | details/summary styling | persistence if needed |
| Popover | complete on declared browser baseline | popovertarget markup + top-layer styling | populate/act on dynamic content |
| Modal dialog | complete on declared browser baseline | dialog + commandfor/command markup/styling | business action logic |
| Tooltip/toggletip | declarative where interest/popover baseline permits | markup + CSS | fallback/dynamic content if required |
| Tabs | incomplete declaratively | visual contract | selected-state/focus coordination through Limen |
| Combobox/autocomplete | behavior required | CSS/markup contract | filtering, selection, async results |
| Multi-range slider | behavior required | visual contract only | coordinated values and constraints |
| Date-range picker | behavior required | visual contract only | calendar/range logic |
| Command palette | behavior required | visual contract only | search, commands, capabilities |
| Data grid | static table complete; interactive grid requires behavior | table/grid styling | sort/filter/edit/keyboard model |
| Tree/treegrid | behavior required | visual contract | expansion/focus/selection |
| Drag/reorder | behavior required | drag states/drop indicators | pointer/keyboard reorder logic |
| Resizable split pane | behavior required | handle/pane styling | pointer/keyboard sizing |
| Filter/query builder | behavior required | visual contract | expression state and editing |
| Wizard | behavior required beyond static steps | step/progress styling | branching, legality, persistence |
| File upload | native input complete; queue/progress requires behavior | native input/drop presentation | upload lifecycle |
| Toast/notification center | behavior required for lifecycle | visual contract | creation, timing, dismissal, persistence |

## Rule

If the browser can own the interaction correctly with semantic HTML, the design system may own it.

If the interaction requires state coordination, asynchronous data, domain legality, focus orchestration not supplied by HTML, drag geometry, virtualization, or computed synchronization, the design system provides markup/CSS contracts only and Limen/application code owns behavior.

The design-system package must not add JavaScript to erase this boundary.


### Aegis fault presentation

| Pattern | Declarative baseline | Behavior required from application/Limen |
| --- | --- | --- |
| fault | semantic section, severity/reference/action layout | map Aegis Presentation.T |
| fault-inline | local semantic message and native buttons | associate with affected operation and execute recovery |
| fault-notification | status surface and dismiss/recovery buttons | insertion, throttling, dismissal, durable history |
| fault-banner | persistent in-flow alert/status surface | lifecycle and recovery execution |
| fault-blocking | native dialog structure | showModal, close/cancel policy, focus, recovery |
| fault-summary | focusable grouped list and links | fingerprint/deduplicate/group/navigate |
| recovery-actions | native buttons with capability annotations | capability revalidation and effect execution |
| fault-reference | readable reference and optional copy button | clipboard action |
| diagnostic-status | text-first status | map Aegis persistence state |
| fault-details | native details/summary disclosure | supply explicitly sanitized safe view model |

No row authorizes Forma runtime JavaScript or direct binding of a raw Aegis Fault.
