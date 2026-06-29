interface ViralPredictionInput {
  caption: string;
  hashtags: string[];
  mediaType: 'image' | 'video' | 'carousel';
  postingTime: string;
  followerCount: number;
  averageLikes: number;
  averageComments: number;
  averageShares: number;
}

interface ViralPredictionResult {
  predictedLikes: number;
  predictedComments: number;
  predictedShares: number;
  predictedFollowerGrowth: number;
  viralProbability: number;
  estimatedReach: number;
  suggestions: string[];
  confidence: number;
}

function analyzeCaptionQuality(caption: string): { score: number; suggestions: string[] } {
  const suggestions: string[] = [];
  let score = 0;

  if (!caption || caption.length === 0) {
    suggestions.push('Add a caption to increase engagement');
    return { score: 0, suggestions };
  }

  if (caption.length >= 10) score += 20;
  else suggestions.push('Make your caption longer (at least 10 characters)');

  if (caption.length >= 50) score += 10;

  if (caption.includes('?')) score += 10;
  else suggestions.push('Ask a question in your caption to boost comments');

  const emotionWords = ['love', 'amazing', 'incredible', 'best', 'worst', 'beautiful', 'shocking', 'never', 'always', 'hate'];
  const hasEmotion = emotionWords.some(w => caption.toLowerCase().includes(w));
  if (hasEmotion) score += 15;
  else suggestions.push('Use emotional trigger words to increase engagement');

  const callToAction = ['like', 'comment', 'share', 'follow', 'tag', 'check', 'click', 'swipe'];
  const hasCTA = callToAction.some(w => caption.toLowerCase().includes(w));
  if (hasCTA) score += 15;
  else suggestions.push('Add a call-to-action (like, comment, share)');

  if (caption.length > 150) score += 10;

  const numLines = caption.split('\n').length;
  if (numLines >= 3) score += 10;
  else suggestions.push('Use line breaks to make your caption more readable');

  const urlRegex = /https?:\/\/[^\s]+/g;
  if (urlRegex.test(caption)) score += 10;

  return { score, suggestions };
}

function analyzeHashtags(hashtags: string[]): { score: number; suggestions: string[] } {
  const suggestions: string[] = [];
  let score = 0;

  if (!hashtags || hashtags.length === 0) {
    suggestions.push('Add hashtags to increase discoverability');
    return { score: 0, suggestions };
  }

  if (hashtags.length >= 3 && hashtags.length <= 10) score += 25;
  else if (hashtags.length > 10) suggestions.push('Use fewer hashtags (3-10 is optimal)');
  else suggestions.push('Use at least 3 hashtags');

  if (hashtags.length >= 5) score += 10;

  const smallHashtags = hashtags.filter(h => h.length <= 15);
  if (smallHashtags.length > hashtags.length / 2) score += 10;

  const nicheHashtags = hashtags.filter(h => h.length > 15);
  if (nicheHashtags.length >= 2) score += 15;

  const broadHashtags = ['love', 'instagood', 'photooftheday', 'beautiful', 'fashion', 'happy', 'cute', 'tbt', 'followme', 'like4like'];
  const hasBroad = hashtags.some(h => broadHashtags.includes(h.toLowerCase()));
  if (hasBroad) score += 5;

  return { score, suggestions };
}

function analyzePostingTime(
  postingTime: string,
  _followerCount: number
): { score: number; suggestions: string[] } {
  const suggestions: string[] = [];
  const hour = new Date(postingTime).getHours();
  let score = 0;

  if (hour >= 7 && hour <= 9) { score += 20; }
  else if (hour >= 11 && hour <= 13) { score += 15; }
  else if (hour >= 17 && hour <= 19) { score += 10; }
  else if (hour >= 20 && hour <= 23) { score += 5; }
  else { suggestions.push('Post between 7-9 AM or 11 AM-1 PM for maximum engagement'); }

  const dayOfWeek = new Date(postingTime).getDay();
  if (dayOfWeek >= 1 && dayOfWeek <= 4) score += 5;
  else suggestions.push('Weekdays typically have higher engagement rates');

  return { score, suggestions };
}

function analyzeMediaType(mediaType: 'image' | 'video' | 'carousel'): { score: number; suggestions: string[] } {
  const suggestions: string[] = [];
  let score = 0;

  switch (mediaType) {
    case 'video':
      score += 25;
      break;
    case 'carousel':
      score += 20;
      suggestions.push('Carousel posts have higher engagement than single images');
      break;
    case 'image':
      score += 10;
      suggestions.push('Consider using video or carousel for higher engagement');
      break;
  }

  return { score, suggestions };
}

export function predictViralPotential(input: ViralPredictionInput): ViralPredictionResult {
  const captionAnalysis = analyzeCaptionQuality(input.caption);
  const hashtagAnalysis = analyzeHashtags(input.hashtags);
  const timeAnalysis = analyzePostingTime(input.postingTime, input.followerCount);
  const mediaAnalysis = analyzeMediaType(input.mediaType);

  const totalScore = captionAnalysis.score + hashtagAnalysis.score + timeAnalysis.score + mediaAnalysis.score;
  const maxScore = 200;
  const baseMultiplier = totalScore / maxScore;

  const followerFactor = Math.log10(input.followerCount + 1) / 7;
  const engagementRate = input.averageLikes > 0
    ? (input.averageLikes + input.averageComments + input.averageShares) / input.followerCount
    : 0.02;

  const predictedLikes = Math.round(input.averageLikes * (1 + baseMultiplier) * (1 + engagementRate));
  const predictedComments = Math.round(input.averageComments * (1 + baseMultiplier * 1.2));
  const predictedShares = Math.round(input.averageShares * (1 + baseMultiplier * 0.8));
  const predictedFollowerGrowth = Math.round(input.followerCount * baseMultiplier * 0.01);

  const viralProbability = Math.min(1, Math.max(0, (totalScore / maxScore) * 0.7 + followerFactor * 0.3));
  const estimatedReach = Math.round(predictedLikes * (3 + viralProbability * 5));

  const allSuggestions = [
    ...captionAnalysis.suggestions,
    ...hashtagAnalysis.suggestions,
    ...timeAnalysis.suggestions,
    ...mediaAnalysis.suggestions,
  ];

  return {
    predictedLikes,
    predictedComments,
    predictedShares,
    predictedFollowerGrowth,
    viralProbability: Math.round(viralProbability * 100) / 100,
    estimatedReach,
    suggestions: allSuggestions.slice(0, 5),
    confidence: Math.min(1, totalScore / maxScore),
  };
}
