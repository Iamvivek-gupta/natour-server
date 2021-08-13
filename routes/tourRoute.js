const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
const router = express.Router();


// router
// .route('/')
// .get(tourController.getAllTour)
// .post(tourController.createTour);

// router.route('/:_id').get(tourController.getTour);


router.route('/getalltour').get(authController.protect,tourController.getAllTour)
router.route('/getonetour/:id').get(tourController.getTour)
router.route('/createnewtour').post(tourController.createTour)
router.route('/updatetour/:id').patch(tourController.updateTour)
router.route('/deletetour/:id').delete(authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.deleteTour)
router.route('/topfive').get(tourController.top_5_cheapest_tour)

module.exports = router;