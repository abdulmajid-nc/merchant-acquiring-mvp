/**
 * ModelSelector.js
 * This file provides a unified way to access models using jPTS (PostgreSQL).
 */

// Select the appropriate model based on name
function getModel(modelName) {
  // Return the jPTS model if initialized
  if (global.models && global.models[modelName]) {
    return global.models[modelName];
  }
  
  console.error(`Model ${modelName} not found in global.models`);
  return null;
}

module.exports = {
  getModel
};
