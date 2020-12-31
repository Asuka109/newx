<p align="center">
  <h1 align="center">Newx.js</h1>
  <p align="center">
    <!-- An awesome README template to jumpstart your projects! -->
  </p>
</p>

## About

Reuse code as modules or components in static web pages and building readable codes.

## Built with

* [PostHTML](https://www.npmjs.com/package/posthtml)
* [CAC](https://www.npmjs.com/package/cac)

Also refer to [Poi](https://github.com/egoist/poi).

## Getting Started

Before we get started, ensure that you have installed Yarn (or npm) on your machine.

```bash
$ yarn add -D newx
```

Then create the files:

`src/layout/base.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>
<body>
  <div id="app">
    <block name="body"></block>
  </div>
</body>
</html>
```

`src/components/info.html`

```html
<div class="info">
  <span>Newx.js</span>
</div>
```

`src/pages/index.html`

```html
<extends src="../layouts/base.html">
  <block name="body">
    <import from="info.html"></import>
    <p>Welcome~~</p>
  </block>
</extends>
```

And just run the command to start a development server:

```bash
$ newx dev
√ Wrote index.html
✨ The development server runs on http://localhost:8080.
```

## Usage

> Coming soon...

## License

Distributed under the MIT License. See `LICENSE` for more information.
