import type { ChildNode, Element, Node } from 'domhandler'
import * as fs from 'node:fs'
import process from 'node:process'
import { Command } from 'commander'
import * as DomSerializer from 'dom-serializer'
import { parseDocument } from 'htmlparser2'
import { description, name, version } from '../package.json'

// Typy
interface HtmlProcessingOptions {
  keepWhitespace?: boolean
}

// Konstanty
const DISALLOWED_TAGS = {
  SECURITY: ['iframe', 'object', 'embed', 'applet'],
  META: ['meta', 'link', 'head', 'title', 'base'],
  FRAMES: ['frame', 'frameset', 'noframes'],
  MEDIA: ['img', 'picture', 'source', 'video', 'audio', 'track'],
  GRAPHICS: ['svg', 'canvas', 'map', 'area'],
} as const

// Pomocné funkce
function isNodeAllowed(node: Node): boolean {
  // Zakázané typy elementů
  if (node.type === 'script' || node.type === 'style' || node.type === 'comment') {
    return false
  }

  if (node.type === 'text') {
    return true
  }

  if (node.type === 'tag') {
    const tagName = (node as Element).tagName.toLowerCase()
    const allDisallowedTags = Object.values(DISALLOWED_TAGS).flat() as string[]
    return !allDisallowedTags.includes(tagName)
  }

  return true
}

function cleanNodeAttributes(node: Node): void {
  if (node.type === 'tag') {
    const element = node as Element
    if (element.tagName.toLowerCase() === 'a') {
      const href = element.attribs.href
      element.attribs = href ? { href } : {}
    }
    else {
      element.attribs = {}
    }
  }
}

function stripAndClean(nodes: Node[]): ChildNode[] {
  return nodes.filter((node): node is ChildNode => {
    if (!isNodeAllowed(node)) {
      return false
    }

    cleanNodeAttributes(node)

    if ('children' in node) {
      node.children = stripAndClean(node.children as Node[])
    }

    return true
  })
}

function processHtml(inputHtml: string, options: HtmlProcessingOptions = {}): string {
  const { keepWhitespace = false } = options
  const dom = parseDocument(inputHtml)
  dom.children = stripAndClean(dom.children)

  const result = DomSerializer.default(dom)

  return keepWhitespace
    ? result
    : result
        .replace(/\s{2,}/g, ' ')
        .replace(/>\s+</g, '><')
        .replace(/\n/g, '')
}

// I/O funkce
function readStdin(): Promise<string> {
  return new Promise((resolve) => {
    let data = ''
    process.stdin.setEncoding('utf8')
    process.stdin.on('data', chunk => data += chunk)
    process.stdin.on('end', () => resolve(data))
  })
}

function readFile(path: string): Promise<string> {
  return fs.promises.readFile(path, 'utf8')
}

function writeFile(path: string, content: string): Promise<void> {
  return fs.promises.writeFile(path, content)
}

// Hlavní funkce
async function main(): Promise<void> {
  const program = new Command()
    .name(name)
    .description(description)
    .version(version)
    .option('-k, --keep-whitespace', 'Keep whitespace and newlines in HTML')
    .option('-o, --output <file>', 'Output file (if not specified, stdout will be used)')
    .argument('[input file]', 'Input HTML file (if not specified, stdin will be used)')
    .parse(process.argv)

  const { keepWhitespace, output: outputFile } = program.opts()
  const [inputFile] = program.processedArgs || program.args

  try {
    const inputHtml = inputFile
      ? await readFile(inputFile)
      : process.stdin.isTTY
        ? (program.help(), process.exit(0))
        : await readStdin()

    const outputHtml = processHtml(inputHtml, { keepWhitespace })

    if (outputFile) {
      await writeFile(outputFile, outputHtml)
    }
    else {
      process.stdout.write(outputHtml)
    }
  }
  catch (error) {
    console.error('Error:', error instanceof Error ? error.message : 'Unknown error')
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}
