const fs = require('fs');
const path = require('path');

/* GET travel view using the Module Three development JSON data source. */
const travel = (req, res, next) => {
  try {
    // Resolve from this module so startup is independent of the shell directory.
    // Per the course guide, reload on each request for rapid prototyping.
    const trips = JSON.parse(fs.readFileSync(
      path.join(__dirname, '../../data/trips.json'), 'utf8'
    ));
    res.render('travel', { title: 'Travlr Getaways', isTravel: true, trips });
  } catch (err) {
    next(err);
  }
};

module.exports = { travel };
