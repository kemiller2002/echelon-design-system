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
| Ordinal / Likert scale | complete | native radios, responsive scale, selected/focus states | labels, scoring, applicability |
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
