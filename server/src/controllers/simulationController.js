const Simulation = require('../models/Simulation');
const { runWhatIfSimulation, applySimulationScenario } = require('../services/simulationService');
const { sendSuccess, sendError } = require('../utils/response');

const createSimulation = async (req, res) => {
  try {
    const { name, description, absentFacultyIds, blockedRoomIds, newEvent } = req.body;
    const simulation = await runWhatIfSimulation({
      name: name || 'What-If Simulation',
      description,
      absentFacultyIds,
      blockedRoomIds,
      newEvent,
      userId: req.user._id,
    });
    return sendSuccess(res, simulation, 'Digital Twin Simulation created successfully', 201);
  } catch (error) {
    return sendError(res, error.message);
  }
};

const getSimulations = async (req, res) => {
  try {
    const simulations = await Simulation.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    return sendSuccess(res, simulations);
  } catch (error) {
    return sendError(res, error.message);
  }
};

const applyScenario = async (req, res) => {
  try {
    const { scenarioId } = req.body;
    const simulation = await applySimulationScenario(req.params.id, scenarioId, req);
    return sendSuccess(res, simulation, `Scenario '${scenarioId}' applied to production.`);
  } catch (error) {
    return sendError(res, error.message);
  }
};

module.exports = {
  createSimulation,
  getSimulations,
  applyScenario,
};
