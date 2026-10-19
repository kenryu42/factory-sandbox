import assert from 'node:assert/strict'
import { test } from 'node:test'
import { slugify, wordCount } from '../src/text.js'

test('slugify joins words with dashes', () => {
  assert.equal(slugify('hello world'), 'hello-world')
})

test('wordCount counts space-separated words', () => {
  assert.equal(wordCount('one two three'), 3)
})

test('wordCount ignores extra spaces', () => {
  assert.equal(wordCount('one  two '), 2)
})
