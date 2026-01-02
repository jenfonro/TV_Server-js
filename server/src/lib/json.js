function safeParseJsonObject(text) {
  try {
    const data = JSON.parse(typeof text === 'string' ? text : '');
    return data && typeof data === 'object' && !Array.isArray(data) ? data : {};
  } catch (_e) {
    return {};
  }
}

function safeParseJsonArray(text) {
  try {
    const data = JSON.parse(typeof text === 'string' ? text : '');
    return Array.isArray(data) ? data : [];
  } catch (_e) {
    return [];
  }
}

module.exports = {
  safeParseJsonObject,
  safeParseJsonArray,
};

