const assert = require('node:assert/strict');
const app = require('../app');
const server = app.listen(0, '127.0.0.1', async () => {
  const origin = `http://127.0.0.1:${server.address().port}`;
  let checks = 0;
  try {
    for (const path of ['/', '/travel', '/travel/', '/rooms.html', '/meals.html', '/news.html', '/about.html', '/contact.html']) {
      const response = await fetch(origin + path);
      assert.equal(response.status, 200, path);
      const html = await response.text();
      assert.equal((html.match(/<!DOCTYPE html>/gi) || []).length, 1, 'single document');
      assert(!html.includes('{{'), 'all HBS directives rendered');
      assert(html.includes('id="header"') && html.includes('id="footer"'), 'header/footer present');
      if (path === '/travel') {
        assert(html.includes('Gale Reef') && html.includes('Dawson’s Reef') && html.includes('Claire’s REEF'));
        assert(html.includes('<title>Travlr Getaways</title>'), 'controller title');
        assert(/class="selected">\s*<a href="\/travel">Travel/.test(html), 'active travel navigation');
      }
      if (path === '/') assert(/class="selected">\s*<a href="\/">Home/.test(html));
      for (const match of html.matchAll(/(?:href|src)="([^"#]+)"/g)) {
        const target = new URL(match[1], origin + path);
        if (target.origin !== origin) continue;
        const linked = await fetch(target);
        assert.equal(linked.status, 200, `${path} -> ${target.pathname}`);
        checks++;
      }
      checks++;
    }
    const missing = await fetch(origin + '/missing-page');
    assert.equal(missing.status, 404);
    assert((await missing.text()).includes('Not Found'));
    checks++;
    console.log(`PASS: ${checks} page, link, asset, and error checks.`);
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally { server.close(); }
});
