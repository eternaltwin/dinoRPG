const weightedRandom = (items: number[]) => {
	const totalOdds = items.reduce((acc, item) => acc + item, 0);
  let i = 0;

  const weights: number[] = [];
  for (i = 0; i < items.length; i++) {
    weights[i] = (items[i] / totalOdds) + (weights[i - 1] || 0);
  }

  const random = Math.random() * weights[weights.length - 1];

  for (i = 0; i < weights.length; i++) {
    if (weights[i] > random) {
      break;
    }
  }

  return i;
};

export default weightedRandom;
