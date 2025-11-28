function distributeEqual(items, agentIds) {
  const buckets = agentIds.map(() => []);
  let i = 0;
  for (const it of items) {
    buckets[i % agentIds.length].push(it);
    i++;
  }
  return buckets;
}
module.exports = { distributeEqual };
