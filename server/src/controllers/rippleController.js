const { analyzeRippleEffect, applyRippleScenario } = require('../services/rippleAnalyzer');
const { sendSuccess, sendError } = require('../utils/response');

const handleAnalyzeRipple = async (req, res) => {
  try {
    const analysisResult = await analyzeRippleEffect(req.body);
    return sendSuccess(res, analysisResult, 'Smart Ripple-Effect Analysis completed without altering production data.');
  } catch (error) {
    return sendError(res, error.message);
  }
};

const handleApplyRipple = async (req, res) => {
  try {
    const { analysisId, scenarioId } = req.body;
    const result = await applyRippleScenario({
      analysisId,
      scenarioId,
      appliedByUserId: req.user?._id,
      req,
    });
    return sendSuccess(res, result, 'Scenario committed to production cleanly.');
  } catch (error) {
    return sendError(res, error.message);
  }
};

module.exports = {
  handleAnalyzeRipple,
  handleApplyRipple,
};
