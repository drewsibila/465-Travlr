# Travlr Getaways — CS 465 Module Two
Drew Sibila

## Run and verify
Requires Node.js and npm. In this folder:

```powershell
npm ci
npm test
npm start
```

Open http://localhost:3000/ and http://localhost:3000/travel.
Stop the server with Ctrl+C. Port 3000 must be available.

## Module Two implementation
- Moved routes and views into app_server.
- Added controllers/main.js and controllers/travel.js, exported index/travel handlers, and corresponding route modules.
- Updated app.js to mount /travel, locate app_server/views, and register Handlebars partials. Requests wait for partial registration before rendering.
- Converted the home and travel pages to HBS with controller-supplied titles and shared header/footer partials. Preserved the supplied page content, images, CSS, and template attribution.
- Moved the Express layout to views/layouts/layout.hbs; full-page views render without an extra layout, and errors use the relocated layout.
- Prevented public/index.html from bypassing the MVC home route. Kept the guide's static HTML files for reference and remaining pages. Updated Travel links to /travel and repaired malformed quote delimiters and broken sidebar links.
- Module Three JSON trip rendering is intentionally deferred to Module Three, following the supplied guide.

Flow: app.js -> app_server/routes -> app_server/controllers -> HBS views/partials -> rendered HTML.
The rubric's traveler wording corresponds to the guide's controllers/travel.js and views/travel.hbs; these guide filenames are used here.

## Validation performed
`npm ci` installed the existing locked dependencies successfully.
`npm test` passed 202 page, local-link, asset, and error checks on Node.js 24.22.1.
Checks include /, /travel, /travel/, five remaining static pages, controller title output, expanded header/footer partials, active navigation, local images/CSS/links, and a rendered 404 page.
No manual visual browser review has been performed. Run the app locally to review its appearance before submitting.

## Apply to your existing repository and push
This ZIP does not contain .git or node_modules. It does not create or push a GitHub branch automatically.
1. In your existing C:\Users\sibil\465-Travlr repository, run `git status`. Commit or preserve any current work before switching branches.
2. From your completed Module One branch, run `git checkout -b module2`. If module2 already exists, use `git checkout module2`.
3. Copy the contents of this ZIP's 465-Travlr folder into your repository, replacing matching project files. Preserve your existing .git folder.
4. Remove the old top-level routes and views folders from the repository; their replacements now live under app_server. Do not remove app_server/routes or app_server/views.
5. Run `npm ci`, `npm test`, and `npm start`. Review / and /travel and click the navigation links.
6. Stop the server, then run:

```powershell
git add .
git commit -m "Complete Module Two MVC routes and Handlebars views"
git push --set-upstream origin module2
```

Submit the project ZIP to Brightspace and verify that your GitHub module2 branch contains the same changes.

## AI-use acknowledgment
OpenAI ChatGPT assisted in refactoring the supplied Module One project into MVC routes, controllers, and Handlebars views, repairing links, and writing and running rendering checks. The student should review, understand, and verify the work and follow SNHU's required disclosure and citation format before submission.

## Source
Implementation follows Module 2 (printed pages 76–88) of the supplied CS 465 Full Stack Guide, revised December 31, 2024, and the assignment rubric supplied in the conversation.
