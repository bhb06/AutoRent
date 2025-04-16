const Review = require('../models/Review');

exports.createReview = async (req, res) => {
  try {
    const { stars, comment } = req.body;

    const review = new Review({
      userId: req.user._id,
      stars,
      comment
    });

    await review.save();
    res.status(201).json({ message: 'Review submitted', data: review });

  } catch (error) {
    res.status(500).json({ message: 'Error submitting review', error: error.message });
  }
};

exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find().populate('userId', 'username email');
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reviews', error: error.message });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    const isOwner = review.userId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }

    await review.deleteOne();
    res.status(200).json({ message: 'Review deleted' });

  } catch (error) {
    res.status(500).json({ message: 'Error deleting review', error: error.message });
  }
};

exports.updateReview = async (req, res) => {
    try {
      const review = await Review.findById(req.params.id);
      if (!review) return res.status(404).json({ message: 'Review not found' });
  
      const isOwner = review.userId.toString() === req.user._id.toString();
      if (!isOwner) {
        return res.status(403).json({ message: 'Not authorized to edit this review' });
      }
  
      const { stars, comment } = req.body;
  
      if (stars) review.stars = stars;
      if (comment) review.comment = comment;
  
      await review.save();
  
      res.status(200).json({ message: 'Review updated successfully', data: review });
  
    } catch (error) {
      res.status(500).json({ message: 'Error updating review', error: error.message });
    }
  };
  