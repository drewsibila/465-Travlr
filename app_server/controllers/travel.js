const Trip = require('../models/travlr');

/* GET customer travel page from the live MongoDB trips collection. */
const travel = async (req, res, next) => {
  try {
    // lean() returns plain JavaScript objects suitable for HBS and JSON output.
    const trips = await Trip.find({}).sort({ _id: 1 }).lean().exec();
    res.render('travel', { title: 'Travlr Getaways', isTravel: true, trips });
  } catch (err) {
    err.status = 503;
    next(err);
  }
};
module.exports = { travel };
