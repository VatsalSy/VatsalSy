const assert = require('node:assert/strict');
const test = require('node:test');
const { renderFeaturedRepo } = require('./update-featured-repo.js');

test('renders third-party metadata as one inert inline paragraph', () => {
  const rendered = renderFeaturedRepo({
    owner: 'Example', name: 'repo-name', description: 'Fast & easy\n[example] <note>',
    language: 'C++', stars: 12, url: 'https://example.invalid',
  });
  assert.equal(rendered, '### [repo&#45;name](https://github.com/Example/repo-name)\n\n' +
    'Fast &#38; easy &#91;example&#93; &#60;note&#62; · C&#43;&#43; · ⭐ 12');
});

test('declines a non-segment repository identifier', () => {
  assert.equal(renderFeaturedRepo({ owner: 'Example', name: '../other' }), null);
});
