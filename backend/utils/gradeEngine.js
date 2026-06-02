function mean(arr) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function std(arr) {
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  return Math.sqrt(
    arr.reduce((s, x) => s + (x - mean) ** 2, 0) / arr.length
  );
}



  
function grade(score, m, s, threshold) {
  const f = Math.ceil(m - 2 * s);
  const e = Math.ceil(m - 1.5 * s);
  const d = Math.ceil(m - s);
  const c = Math.ceil(m - 0.55 * s);
  const b = Math.ceil(m + 0.45 * s);
  const scores=Math.ceil(score);

  if (scores < f) return "F";
  if (scores < e) return "E";
  if (scores < d) return "D";
  if (scores < c) return "C";
  if (scores < b) return "B";
  if (scores < threshold) return "A";
  return "S";
}


module.exports = { mean, std, grade };
