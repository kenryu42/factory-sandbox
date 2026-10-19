import assert from 'node:assert/strict'
import { test } from 'node:test'
import { slugify, wordCount } from '../src/text.js'

test('slugify joins words with dashes', () => {
  assert.equal(slugify('hello world'), 'hello-world')
})

test('wordCount counts space-separated words', () => {
  assert.equal(wordCount('one two three'), 3)
})

test('wordCount treats any run of whitespace as a separator', () => {
  assert.equal(wordCount('one  two'), 2)
  assert.equal(wordCount('one\ttwo\nthree'), 3)
})

test('wordCount ignores leading and trailing whitespace', () => {
  assert.equal(wordCount('  one two  '), 2)
})

test('wordCount returns 0 for empty or whitespace-only strings', () => {
  assert.equal(wordCount(''), 0)
  assert.equal(wordCount('   \t\n  '), 0)
})
