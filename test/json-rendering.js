const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { once } = require('node:events');

// Exercise an isolated copy so npm test never changes the student's trip data.
(async () => {
  const project = path.resolve(__dirname, '..');
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'travlr-json-'));
  let child;
  try {
    for (const name of ['app.js', 'app_server', 'public', 'data']) {
      fs.cpSync(path.join(project, name), path.join(temporary, name), { recursive: true });
    }
    const filename = path.join(temporary, 'data', 'trips.json');
    const original = JSON.parse(fs.readFileSync(filename, 'utf8'));
    assert.equal(original.length, 3);
    for (const trip of original) {
      assert(trip.description.includes(trip.name), 'guide requires trip name in description');
      assert(fs.existsSync(path.join(project, 'public', 'images', trip.image)));
    }
    const script = `const app = require(${JSON.stringify(path.join(temporary, 'app.js'))});
      const server = app.listen(0, '127.0.0.1', () => process.send(server.address().port));`;
    child = spawn(process.execPath, ['-e', script], {
      // Deliberately start outside the project to verify robust data-path resolution.
      cwd: os.tmpdir(),
      env: { ...process.env, NODE_PATH: path.join(project, 'node_modules'), NODE_ENV: 'production' },
      stdio: ['ignore', 'ignore', 'inherit', 'ipc']
    });
    const port = await Promise.race([
      once(child, 'message').then(([port]) => port),
      once(child, 'exit').then(([code]) => { throw new Error(`Fixture exited early: ${code}`); }),
      new Promise((_, reject) => { const timer = setTimeout(() => reject(new Error('Fixture startup timed out')), 10000); timer.unref(); })
    ]);
    const url = `http://127.0.0.1:${port}/travel`;
    let response = await fetch(url);
    assert.equal(response.status, 200);
    let html = await response.text();
    for (const trip of original) assert(html.includes(trip.description));
    assert(!html.includes('&lt;p&gt;'), 'paragraph HTML renders as HTML');

    // Change the JSON after startup: the real controller must render the new data.
    const newName = 'JSON Proof & Extra Trip';
    fs.writeFileSync(filename, JSON.stringify([
      { name: newName, image: 'reef2.jpg', description: '<p>Unique JSON-only description.</p>' }
    ]));
    response = await fetch(url);
    assert.equal(response.status, 200);
    html = await response.text();
    assert(html.includes('JSON Proof &amp; Extra Trip'), 'HBS escapes the trip title');
    assert(html.includes('<p>Unique JSON-only description.</p>'));
    assert(html.includes('src="/images/reef2.jpg"'));
    for (const trip of original) assert(!html.includes(trip.name), 'no hard-coded trip remains');

    fs.writeFileSync(filename, '[]');
    response = await fetch(url);
    assert.equal(response.status, 200);
    html = await response.text();
    assert(!html.includes('Unique JSON-only description.'));
    assert(html.includes('id="header"') && html.includes('id="footer"'));

    fs.writeFileSync(filename, '{invalid json');
    response = await fetch(url);
    assert.equal(response.status, 500, 'bad JSON reaches the Express error handler');
    fs.writeFileSync(filename, JSON.stringify(original));
    assert.equal((await fetch(url)).status, 200, 'rendering recovers after corrected JSON');
    console.log('PASS: JSON source content, live changes, escaping, image binding, empty list, malformed JSON, recovery, and startup outside project.');
  } finally {
    if (child && child.exitCode === null) {
      const exited = once(child, 'exit');
      child.kill();
      await exited;
    }
    fs.rmSync(temporary, { recursive: true, force: true });
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
