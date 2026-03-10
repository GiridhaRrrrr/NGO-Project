const HelpRequest = require('../models/HelpRequest');
const User = require('../models/User');

// @desc    Get all pending requests
// @route   GET /api/admin/pending
exports.getPendingRequests = async (req, res) => {
  try {
    const requests = await HelpRequest.find({ status: 'Submitted' }).sort({ createdAt: 1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching pending requests' });
  }
};

// @desc    Approve or Reject a request
// @route   PATCH /api/admin/verify/:id
exports.verifyRequest = async (req, res) => {
  try {
    const { approved } = req.body;
    const newStatus = approved ? 'Verified' : 'Rejected';

    const request = await HelpRequest.findByIdAndUpdate(
      req.params.id,
      { status: newStatus },
      { new: true }
    );

    if (!request) return res.status(404).json({ message: 'Request not found' });

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: 'Server error verifying request' });
  }
};

// @desc    Get platform analytics for dashboard
// @route   GET /api/admin/analytics
exports.getAnalytics = async (req, res) => {
  try {
    // Run multiple database queries concurrently for performance
    const [
      totalRequests,
      activeNgos,
      categoryData,
      statusData
    ] = await Promise.all([
      HelpRequest.countDocuments(),
      User.countDocuments({ role: 'ngo' }),
      
      // Aggregate requests by category
      HelpRequest.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]),
      
      // Aggregate requests by status
      HelpRequest.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ])
    ]);

    // Format the aggregated data to match the frontend expectations
    const categoryBreakdown = categoryData.map(item => ({
      category: item._id,
      count: item.count
    }));

    const statusBreakdown = statusData.map(item => ({
      status: item._id,
      count: item.count
    }));

    // For a major project, you can dynamically calculate months. 
    // Here is a static mock structure that the frontend chart expects.
    const monthlyRequests = [
      { month: "Jan", count: 12 },
      { month: "Feb", count: 18 },
      { month: "Mar", count: 25 }
    ];

    res.json({
      categoryBreakdown,
      statusBreakdown,
      monthlyRequests,
      avgResponseTime: 4.5, // Placeholder for average response time
      totalRequests,
      activeNgos
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error generating analytics' });
  }
};