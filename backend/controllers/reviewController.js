const Review = require('../models/Review');

exports.createReview = async (req, res) => {
    try {
      console.log("Review payload:", req.body);
      console.log("User from token:", req.user);
  
      const { title, comment, stars } = req.body;
  
      const review = new Review({
        title,
        comment,
        stars,
        userId: req.user._id
      });
  
      await review.save();
  
      res.status(201).json({ message: 'Review submitted', review });
    } catch (error) {
      console.error("❌ Error creating review:", error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };
  

exports.getAllReviews = async (req, res) => {
    try {
        const reviews = await Review.find().populate('userId', 'username email profileImage') .sort({ createdAt: -1 }); // Newest reviews first;
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

        const { title, stars, comment } = req.body;

        if (title) review.title = title;
        if (stars) review.stars = stars;
        if (comment) review.comment = comment;

        await review.save();

        res.status(200).json({ message: 'Review updated successfully', data: review });

    } catch (error) {
        res.status(500).json({ message: 'Error updating review', error: error.message });
    }
};