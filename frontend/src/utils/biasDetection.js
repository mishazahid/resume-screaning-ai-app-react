/**
 * Bias detection algorithms for the Resume Screening AI.
 *
 * Returns an array of warning objects: { type, title, message, severity }
 */

/** Check if removing education weight would meaningfully re-order the ranking. */
function detectEducationBias(results) {
  if (results.length < 2) return false

  // Re-rank without education (redistribute its 5% to semantic)
  const rescored = results.map((r) => ({
    filename: r.filename,
    adjusted:
      r.scores.semantic_score * 0.55 +
      r.scores.skill_score * 0.30 +
      r.scores.experience_score * 0.15,
  }))
  const newOrder = [...rescored]
    .sort((a, b) => b.adjusted - a.adjusted)
    .map((r) => r.filename)
  const origOrder = results.map((r) => r.filename)

  // Count candidates whose rank shifts by 2 or more positions
  const bigShifts = origOrder.filter((name, i) => {
    const newRank = newOrder.indexOf(name)
    return Math.abs(i - newRank) >= 2
  }).length

  return bigShifts >= 1
}

/** Check if all final scores are clustered within a narrow range. */
function detectClustering(results) {
  if (results.length < 3) return false
  const scores = results.map((r) => r.scores.final_score_pct)
  const range = Math.max(...scores) - Math.min(...scores)
  return range < 8   // all candidates within 8 percentage points
}

/** Check if education is the dominant differentiator (high edu variance, low overall variance). */
function detectEduDominance(results) {
  if (results.length < 3) return false
  const eduScores = results.map((r) => r.scores.education_score)
  const finalScores = results.map((r) => r.scores.final_score)

  const variance = (arr) => {
    const mean = arr.reduce((a, b) => a + b, 0) / arr.length
    return arr.reduce((s, v) => s + (v - mean) ** 2, 0) / arr.length
  }

  // Education variance is high but final score range is very tight
  return variance(eduScores) > 0.08 && variance(finalScores) < 0.005
}

/**
 * Run all bias checks and return an array of warning objects.
 * @param {Array} results - sorted screening results from the API
 * @returns {Array<{type:string, title:string, message:string, severity:'warn'|'info'}>}
 */
export function detectBias(results) {
  if (!results || results.length < 2) return []

  const warnings = []

  if (detectEduDominance(results) || detectEducationBias(results)) {
    warnings.push({
      type: 'education_bias',
      title: 'Education Bias Detected',
      message:
        'Candidate rankings may shift significantly if the education requirement is removed. ' +
        'Consider whether a formal degree is truly required, or if equivalent experience should be weighted more.',
      severity: 'warn',
    })
  }

  if (detectClustering(results)) {
    warnings.push({
      type: 'clustering',
      title: 'Scores Clustered — JD May Be Too Generic',
      message:
        `All ${results.length} candidates score within an 8-point range. ` +
        'This often means the job description lacks specific technical requirements. ' +
        'Consider adding concrete skills, tools, or experience thresholds.',
      severity: 'info',
    })
  }

  return warnings
}
