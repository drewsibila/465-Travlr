# Travlr Getaways — CS 465 Module Four
Drew Sibila

## Requirements
- Node.js 20.19 or later (tested here with Node.js 24.22.3).
- A running MongoDB Community Server or an accessible MongoDB deployment.
- MongoDB Compass to perform the guide's visual collection inspection.

Compass is a database client. Installing or opening Compass alone does not start a MongoDB server.

## Run locally on Windows
Open PowerShell in C:\Users\sibil\465-Travlr. Check that your local MongoDB Server is running, then run these commands one at a time:

```powershell
npm ci
npm test
npm run seed
npm run verify
npm run test:db
npm start
```

Open http://localhost:3000/travel. The three trip descriptions and reef images should appear. The controller now queries the live database rather than reading trips.json. Stop the website with Ctrl+C.

The default connection is mongodb://127.0.0.1:27017/travlr. The connection module also supports DB_HOST or a complete MONGODB_URI environment variable. For an alternate deployment, set it in the same PowerShell window before running the commands:

```powershell
$env:MONGODB_URI = "mongodb://127.0.0.1:27017/travlr"
```

Do not commit a connection string containing credentials. The application does not load a .env file automatically.

## Inspect in MongoDB Compass
1. Open Compass and connect to mongodb://127.0.0.1:27017 (or the same deployment used for MONGODB_URI).
2. Refresh the database list after seeding, open travlr, and select trips.
3. Confirm that three documents exist. Expand one document and check code, name, length, start, resort, perPerson, image, and description.
4. Confirm that start has the Date type, perPerson is a string, and _id is an ObjectId. The source trips.json uses ISO date strings, which Mongoose casts to BSON dates.
5. Open the Indexes tab and confirm code_1 and name_1 alongside MongoDB's _id_ index.
6. Keep a screenshot for your records or if your instructor requests evidence. The assignment's stated submission is the project ZIP.

Use the actual deployment connection string in Compass if you override the default. The sample dates, resorts, and prices are fictional course data.

## Module Four implementation
- app_server/models/travlr.js defines and exports the trips model. All eight guide fields are required, code and name are indexed, start is a Date, and perPerson remains a string with decimal validation.
- app_server/models/db.js provides the connection and disconnection functions, a five-second server-selection timeout, and connected/error/disconnected event handling.
- bin/www connects before accepting HTTP traffic, reports initial connection failures, and awaits database disconnection on Ctrl+C, termination, or a nodemon restart.
- app_server/models/seed.js validates every record before replacing the existing course sample trips, inserts them with Mongoose, and closes the connection.
- app_server/models/verify.js retrieves documents with Mongoose, checks every seeded field and BSON date, serializes the results to JSON, and prints the records.
- app_server/controllers/travel.js retrieves live trip documents using find().lean() and supplies plain objects to the existing Handlebars view. Query failures reach the Express error page with HTTP status 503.
- data/trips.json is included as the seed source. It retains the reef descriptions and adds code, length, start, resort, and perPerson.

As in the course guide, npm run seed replaces all records in the selected database's trips collection. Use it for the course sample database. No database files, installed MongoDB binaries, or node_modules are included in the submission.

REST API endpoints and app_api are introduced in Module Five. This module prepares the model and demonstrates JSON retrieval with npm run verify; it does not add the later module's API routes.

## Tests
npm test runs offline schema checks. It validates the three sample records, required fields, invalid date/price handling, the collection name, and declared indexes. It does not require MongoDB.

npm run test:db requires MongoDB. It creates a uniquely named travlr_module4_test database on the selected server and removes only that test database afterward. It does not seed or delete the normal travlr database.

The database tests check seeding and repeated seeding, JSON serialization, BSON dates, indexes created in MongoDB, rejection of incomplete records, all 202 page/link/asset/error checks, a database-only trip appearing on the customer page, unavailable-database handling, and successful rendering after reconnection.

Both test suites passed here using real MongoDB 7.0.26, Mongoose 9.12.3, and Node.js 24.22.3. Local Compass inspection and testing on the student's computer remain to be completed. The obsolete Module Three test/json-rendering.js is no longer used because the website's data source is now MongoDB.

## Update GitHub and submit
1. In the existing repository, run git status and save any unfinished work.
2. From the completed module3 branch, run git checkout -b module4. If module4 already exists, switch to it instead of creating it again.
3. Extract this ZIP outside the repository. Copy everything inside its travlr folder into C:\Users\sibil\465-Travlr and replace matching files. Preserve .git.
4. Remove the old tracked test/json-rendering.js with git rm test/json-rendering.js; its JSON-file mutation checks have been replaced by database tests.
5. Complete the run commands and Compass inspection above. Stop the server, then run:

```powershell
git add .
git commit -m "Complete Module Four MongoDB models and seed data"
git push --set-upstream origin module4
```

Submit this Module Four travlr.zip to Brightspace. The ZIP does not automatically create or push your GitHub branch.

## AI acknowledgment
I used ChatGPT to help create the database connection, trip schema, seed data, and tests for this assignment.

## References
CS 465 Full Stack Guide, revised December 31, 2024, Module Four, printed pages 95–102; and the provided Module Four assignment rubric.

Mongoose connection and error-handling documentation: https://mongoosejs.com/docs/connections.html

Modern Mongoose uses promise-based connect/disconnect calls. The guide's older callback-based connection.close code has been updated accordingly.
