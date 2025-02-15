# CSS Style Guide

BEM is preferred as a naming convention: [http://getbem.com/](http://getbem.com/naming/)

## Structure of a class

write BEM standard format as follow:

```css
 .{block}[__{element}][--{modifier}]
```

where:

- `block`: Encapsulates a standalone entity that is meaningful on its own
- `element`: Parts of a block and have no standalone meaning. Any element is semantically tied to its block.
- `modifier`: Flags on blocks or elements. Use them to change appearance, behavior or state.

Example:

```css
/* button.css */
.button {
  /* */
}
.button--primary {
  background: red;
  color: white;
}

.button--secondary {
  background: grey;
  color: black;
}

.button--small {
  padding: 2px;
}

.button--big {
  padding: 8px;
}

.button .button__icon {
  width: 1em;
  height: auto;
}

.button .button__icon--left {
  margin-right: 0.2em;
}
.button .button__icon--right {
  margin-left: 0.2em;
}
```

```tsx
<a className="button button--primary">
  <i className="button__icon button__icon--left" />
  this is a button
</a>
```

## Namespaced components

Components exposed as a library you should add an extra class as namespace to avoid collision with other styles:

- namespace class: `ui`

  - repo: `semantic-ui`
  - example: `.ui.button`, `.ui.button.button--primary`

- namespace class: `dcl`

  - repo: `decentraland-ui`
  - example: `.dcl.navbar` `.dcl.field`

- namespace class: `dg`
  - repo: `decentraland-gatsby`
  - example: `.dg.paragraph` `.dg.paragraph.paragraph--small`

## Properties

- 👍 no dependencies required
- 👍 already implemented in our dependencies preventing mixin css convention
- 👍 extensible/overwritable with css
- 🫳 prevent name collisions (by hard coding a namespace)
- 👎 no type guaranties

## Other options considered

- StyledComponents: <https://styled-components.com/>

  - 👍 type guaranties
  - 👍 automatic name collision prevention
  - 👍 integrated pre-build
  - 👍 less files
  - 👎 _non extensible with css_
  - 👎 _technologically locked_
  - 👎 _extra dependency and setup_

- CSS Modules: <https://css-tricks.com/css-modules-part-1-need/>

  - 👍 type guaranties
  - 👍 automatic name collision prevention
  - 👍 integrated pre-build
  - 👎 _non extensible with css_
  - 👎 _technologically locked_
  - 👎 _extra dependency and setup_

- AMCSS: <https://amcss.github.io/>
  - 👍 extensible/overwritable with css
  - 👍 no dependencies required
  - 🫳 type guaranties (but requires to extend react)
  - 👎 _technologically locked_

## Contemplations

For component that are not expected to be published you may consider other standards (like the previous ones)
