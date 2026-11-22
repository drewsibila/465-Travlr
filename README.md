# Travlr Getaways — CS 465 Module Three
Drew Sibila

## Run the website
In the project folder, run:

```powershell
npm ci
npm test
npm start
```

Visit http://localhost:3000/travel. Each reef name now appears in its description, as required by the guide. Check that all three reef images appear and that the Home, Travel, and other navigation links work. Press Ctrl+C in PowerShell to stop the server.

## Module Three changes
The trip content is stored in data/trips.json. The travel controller reads and parses that file with fs.readFileSync and passes the trips array to the travel view. The HBS template uses {{#each trips}} to render each trip's name, image, and description. The header and footer remain shared partials.

Request flow: app.js -> app_server/routes/travel.js -> app_server/controllers/travel.js -> data/trips.json -> app_server/views/travel.hbs.

The data path is resolved relative to the controller, so the website can start from a different working directory. JSON is read for each request as the guide's development approach. The description field contains trusted local paragraph HTML, rendered with triple braces to preserve the template's paragraphs. Do not place untrusted user input in this field.

The original static public/travel.html remains as a reference. Use /travel to view the JSON-rendered page. Navigation links point to /travel.

## Testing
Tests passed on Node.js 24.22.3:
- 202 existing checks for pages, navigation, local links, images, CSS, and the error page.
- JSON tests verify that the original descriptions render, changes to the JSON appear after startup, removed trips disappear, titles are escaped, images come from JSON, and an empty list keeps the shared page elements.
- Invalid JSON returns an error page, and rendering recovers after the JSON is corrected.
- Startup from outside the project directory still finds the data file.

The JSON tests use a temporary copy; they do not modify the submitted trips.json. Review the page locally before submitting.

## Update your existing GitHub repository
1. Open PowerShell in C:\Users\sibil\465-Travlr.
2. Run git status. Save any unfinished changes before switching branches.
3. Run git checkout module2, then git checkout -b module3. If module3 already exists, switch to it instead of creating it again.
4. Extract travlr.zip somewhere separate. Copy the contents of its travlr folder into your existing 465-Travlr repository and replace matching files. Keep your existing .git folder.
5. Run npm ci, npm test, and npm start. Review http://localhost:3000/travel. Stop with Ctrl+C.
6. Run:

```powershell
git add .
git commit -m "Complete Module Three JSON-driven travel views"
git push --set-upstream origin module3
```

This ZIP does not create or push a GitHub branch. It excludes node_modules and .git. Submit travlr.zip to Brightspace and push the module3 branch separately.

## AI acknowledgment
I used ChatGPT to help move the trip information into JSON, update the Handlebars template and controller, and test the website.

## Reference
CS 465 Full Stack Guide, revised December 31, 2024, Module 3, printed pages 89–93, and the supplied Module Three assignment rubric.
