const Tour = require('../models/tourModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.createTour = catchAsync(async (req, res, next) => {
    const newTour = await Tour.create(req.body);
    res.status(201).json({
        status: 'success',
        data: {
            tour: newTour
        }
    })
})


// exports.createTour = async (req, res) => {
//     try{
//         const newTour = await Tour.create(req.body);
//         res.status(201).json({
//             status: 'success',
//             data: {
//                 tour: newTour
//             }
//         })
//     } catch(err){
//         res.status(400).json({
//             status: 'fail',
//             message: err
//         })
//     }
// }


exports.top_5_cheapest_tour = catchAsync(async (req, res, next) => {
    const tours = await Tour.find().sort('-ratingsAverage, price').limit(5);
    res.status(200).json({
        status: 'success',
        result: tours.length,
        data: {
            tours
        }
    })
})

// exports.top_5_cheapest_tour = async (req, res) => {
//     try{
//         const tours = await Tour.find().sort('-ratingsAverage, price').limit(5);
//         res.status(200).json({
//             status: 'success',
//             result: tours.length,
//             data: {
//                 tours
//             }
//         })
//     } catch(err){
//         res.status(400).json({
//             status: 'fail',
//             message: err
//         })
//     }
// }

exports.getAllTour = catchAsync(async(req, res, next) => {
    const tours = await Tour.find();
    res.status(200).json({
        status: 'success',
        result: tours.length,
        data: {
            tours
        }
    })
})

// exports.getAllTour = async (req, res) => {
//     try{
//         console.log(req.query.ratingsAverage);
//         const tours = await Tour.find();
//         res.status(200).json({
//             status: 'success',
//             result: tours.length,
//             data: {
//                 tours
//             }
//         })
//     } catch(err){
//         res.status(400).json({
//             status: 'fail',
//             message: err
//         })
//     }
// }


exports.getTour = catchAsync(async(req, res, next) => {
    const tour = await Tour.findById(req.params.id);
    // const tour = await Tour.findOne({_id: req.params.id});
    if( !tour ){
        return next(new AppError('No tour found with that ID', 404))
    }
    res.status(200).json({
        status: 'success',
        data: {
            tour
        }
    })
})



// exports.getTour = async (req, res) => {
//     try{
//         // const tour = await Tour.findOne({_id: req.params.id});
//         const tour = await Tour.findById(req.params.id);
//         if(!tour) {
//             res.status(404).json({
//                 status: 'fail',
//                 message: 'tour is not found with this ID'
//             })
//         }
//         res.status(200).json({
//             status: 'success',
//             data: {
//                 tour
//             }
//         })
//     } catch(err){
//         res.status(400).json({
//             status: 'fail',
//             message: err
//         })
//     }
// }


exports.updateTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true});

    if( !tour ){
        return next(new AppError('No tour found with that ID', 404))
    }

    res.status(200).json({
        status: 'success',
        data: {
            tour
        }
    })
})




// exports.updateTour = async (req, res) => {
//     try{
//         const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true});
//         res.status(200).json({
//             status: 'success',
//             data: {
//                 tour
//             }
//         })
//     } catch (err){
//         res.status(404).json({
//             status: 'fail',
//             message: err
//         })
//     }
// }


exports.deleteTour = catchAsync(async(req, res, next) => {
    const tour = await Tour.findByIdAndDelete(req.params.id);
    if( !tour ){
        return next(new AppError('No tour found with that ID', 404))
    }
    res.status(200).json({
        status: 'success',
        message: 'tour Deleted Succefully'
    })
})




// exports.deleteTour = async (req, res) => {
//     try{
//         const tour = await Tour.findById(req.params.id);
//         if(!tour){
//             res.status(404).json({
//                 status: 'fail',
//                 message: 'tour not found'
//             })
//         }
//         await Tour.findByIdAndDelete(req.params.id);
//         res.status(200).json({
//             status: 'success',
//             message: 'tour Deleted Succefully'
//         })
//     } catch (err){
//         res.status(404).json({
//             status: 'fail',
//             message: err
//         })
//     }
// }