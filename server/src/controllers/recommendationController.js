const Recommendation = require('../models/Recommendation');
const { optimizeResourceAllocation } = require('../services/recommendationService');
const { sendSuccess, sendError } = require('../utils/response');

const getRecommendations = async (req, res) => {
  try {
    const recommendations = await Recommendation.find().sort({ createdAt: -1 });
    return sendSuccess(res, recommendations);
  } catch (error) {
    return sendError(res, error.message);
  }
};

const optimizeResource = async (req, res) => {
  try {
    const { sectionSize, preferredDay, preferredTimeSlot } = req.body;
    const result = await optimizeResourceAllocation({
      sectionSize: Number(sectionSize) || 60,
      preferredDay,
      preferredTimeSlot,
    });
    return sendSuccess(res, result);
  } catch (error) {
    return sendError(res, error.message);
  }
};

module.exports = {
  getRecommendations,
  optimizeResource,
};
