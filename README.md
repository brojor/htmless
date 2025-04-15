# htmless
![npm version](https://img.shields.io/npm/v/htmless) ![npm downloads](https://img.shields.io/npm/dm/htmless) ![license](https://img.shields.io/npm/l/htmless) ![types](https://img.shields.io/npm/types/htmless) [![code style](https://antfu.me/badge-code-style.svg)](https://github.com/antfu/eslint-config)

> *Lighten your HTML input. Keep the meaning, ditch the weight.*

## 🧠 What is it?

`htmless` is a minimalist CLI tool that strips HTML down to the bone — removing unnecessary scripts, styles, attributes, and utility classes.
The result is a **clean, minified HTML output**, ideal for feeding into LLMs where every token counts.

## 🤔 Why was it created?

I needed to extract semantically valuable content from HTML pages and send it to AI models. But raw HTML is full of bloat — especially utility classes from frameworks like Tailwind, inline styles, scripts, and other things that eat tokens without adding real value.

**The goals were simple:**
- Preserve document structure – headings, paragraphs, text emphasis
- Keep `href` attributes on `<a>` tags – they carry semantic meaning and useful context
- Eliminate noise
- Make it fast, simple, and automatable
- Follow the *Unix philosophy* — do one thing and do it well

## 🔧 Installation

```bash
pnpm add -g htmless
# or
npm install -g htmless
```

## 🚀 Usage

```bash
cat input.html | htmless
```

Use it in a bash pipeline, before LLM processing, or to clean up WYSIWYG HTML exports.

## 💡 Example

#### Input:
```html
<div class="bg-white p-4 text-sm text-gray-700">
  <h1 class="text-3xl font-bold">Welcome</h1>
  <p>This is a <strong>test</strong>.</p>
  <script>alert('Hi')</script>
  <style>body { background: red; }</style>
</div>
```

#### Output:
```html
<div><h1>Welcome</h1><p>This is a <strong>test</strong>.</p></div>
```

## 🛠️ What gets removed?

- all HTML attributes (class, id, style, data-*, etc.)
- `<script>` and `<style>` blocks
- comments and whitespace
- *(exception: `href` on `<a>` is preserved)*

## 🔎 Who is this for?

- developers working with LLMs and prompt engineering
- anyone who needs to get meaningful content from HTML without the fluff
- scripting, scraping, automation pipelines

## 🧪 Tech info

- built on top of `htmlparser2` — fast and robust
- outputs valid HTML (not plaintext)
- written in TypeScript, clean CLI with `commander`

## 🧘 Philosophy

> Less is more. Tokens are expensive. `htmless` helps LLMs process content, not the wrapper.
