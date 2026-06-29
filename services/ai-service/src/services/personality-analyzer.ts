interface PersonalityAnalysisInput {
  captions: string[];
  hashtags: string[];
  postingTimes: string[];
  mediaTypeDistribution: { image: number; video: number; carousel: number };
  engagementRate: number;
}

interface PersonalityType {
  type: string;
  description: string;
  confidence: number;
  traits: string[];
}

interface PersonalityAnalysisResult {
  primary: PersonalityType;
  secondary?: PersonalityType;
  sentiment: {
    overall: string;
    positive: number;
    negative: number;
    neutral: number;
  };
  contentStyle: string;
  audienceAppeal: string;
  recommendations: string[];
}

function analyzeSentiment(captions: string[]): { overall: string; positive: number; negative: number; neutral: number } {
  const positiveWords = ['love', 'amazing', 'great', 'beautiful', 'happy', 'excited', 'wonderful', 'best', 'incredible', 'fun', 'awesome', 'grateful', 'blessed', 'inspiring', 'perfect'];
  const negativeWords = ['hate', 'terrible', 'awful', 'worst', 'sad', 'angry', 'horrible', 'ugly', 'boring', 'disappointed', 'frustrating', 'annoying'];

  let positive = 0;
  let negative = 0;
  let neutral = 0;

  for (const caption of captions) {
    const words = caption.toLowerCase().split(/\s+/);
    const hasPositive = words.some(w => positiveWords.includes(w));
    const hasNegative = words.some(w => negativeWords.includes(w));

    if (hasPositive && !hasNegative) positive++;
    else if (hasNegative && !hasPositive) negative++;
    else neutral++;
  }

  const total = captions.length || 1;

  return {
    overall: positive > negative ? 'positive' : negative > positive ? 'negative' : 'neutral',
    positive: Math.round((positive / total) * 100),
    negative: Math.round((negative / total) * 100),
    neutral: Math.round((neutral / total) * 100),
  };
}

function determinePersonality(
  captions: string[],
  hashtags: string[],
  mediaTypeDistribution: { image: number; video: number; carousel: number },
  engagementRate: number
): { primary: PersonalityType; secondary?: PersonalityType } {
  const personalities: PersonalityType[] = [
    {
      type: 'The Storyteller',
      description: 'Creates narrative-driven content that connects emotionally',
      confidence: 0,
      traits: ['narrative', 'emotional', 'descriptive', 'authentic'],
    },
    {
      type: 'The Educator',
      description: 'Shares knowledge, tips, and valuable information',
      confidence: 0,
      traits: ['informative', 'educational', 'detailed', 'structured'],
    },
    {
      type: 'The Entertainer',
      description: 'Focuses on humor, trends, and viral content',
      confidence: 0,
      traits: ['humorous', 'trendy', 'energetic', 'creative'],
    },
    {
      type: 'The Inspirer',
      description: 'Motivates and inspires through aspirational content',
      confidence: 0,
      traits: ['motivational', 'aspirational', 'positive', 'uplifting'],
    },
    {
      type: 'The Connector',
      description: 'Builds community through conversations and engagement',
      confidence: 0,
      traits: ['conversational', 'community-focused', 'interactive', 'relatable'],
    },
  ];

  const captionText = captions.join(' ').toLowerCase();
  const avgCaptionLength = captions.reduce((sum, c) => sum + c.length, 0) / (captions.length || 1);
  const totalMedia = mediaTypeDistribution.image + mediaTypeDistribution.video + mediaTypeDistribution.carousel || 1;
  const videoRatio = mediaTypeDistribution.video / totalMedia;
  const hashtagCount = hashtags.length;

  if (avgCaptionLength > 100 || captionText.includes('how to') || captionText.includes('tips') || captionText.includes('guide')) {
    personalities[1].confidence = 0.8;
  }
  if (videoRatio > 0.5 || captionText.includes('funny') || captionText.includes('lol') || captionText.includes('trend')) {
    personalities[2].confidence = 0.85;
  }
  if (captionText.includes('inspire') || captionText.includes('motivate') || captionText.includes('dream') || captionText.includes('believe')) {
    personalities[3].confidence = 0.9;
  }
  if (engagementRate > 0.05 || captionText.includes('tag') || captionText.includes('comment') || captionText.includes('share')) {
    personalities[4].confidence = 0.75;
  }
  if (captionText.includes('story') || captionText.includes('remember') || captionText.includes('feeling') || captionText.includes('moment')) {
    personalities[0].confidence = 0.85;
  }

  const sorted = [...personalities].sort((a, b) => b.confidence - a.confidence);
  const primary = sorted[0];

  if (primary.confidence < 0.3) {
    primary.type = 'The Explorer';
    primary.description = 'Still finding their unique voice and style';
    primary.confidence = 0.5;
    primary.traits = ['evolving', 'versatile', 'experimental', 'growing'];
  }

  const secondary = sorted[1] && sorted[1].confidence > 0.3 ? sorted[1] : undefined;

  return { primary, secondary };
}

function analyzeContentStyle(
  captions: string[],
  mediaTypeDistribution: { image: number; video: number; carousel: number }
): string {
  const totalMedia = mediaTypeDistribution.image + mediaTypeDistribution.video + mediaTypeDistribution.carousel || 1;
  const avgLength = captions.reduce((sum, c) => sum + c.length, 0) / (captions.length || 1);

  if (mediaTypeDistribution.video / totalMedia > 0.5) return 'Video-first content creator';
  if (mediaTypeDistribution.carousel / totalMedia > 0.3) return 'Carousel-heavy educator';
  if (avgLength > 150) return 'Long-form narrative style';
  if (avgLength < 50) return 'Short & punchy micro-content';
  return 'Balanced mixed-media approach';
}

function analyzeAudienceAppeal(sentiment: { overall: string; positive: number }, engagementRate: number): string {
  if (engagementRate > 0.08 && sentiment.positive > 60) return 'High emotional resonance with audience';
  if (engagementRate > 0.05) return 'Strong community engagement';
  if (sentiment.positive > 50) return 'Positive brand perception';
  return 'Room for audience connection growth';
}

function generateRecommendations(personality: PersonalityType, engagementRate: number): string[] {
  const recommendations: string[] = [];

  recommendations.push(`Lean into your "${personality.type}" style — it resonates well`);
  if (engagementRate < 0.03) recommendations.push('Increase engagement by adding clear calls-to-action');
  recommendations.push('Post consistently at optimal times (7-9 AM, 11 AM-1 PM)');
  recommendations.push('Engage with your audience in comments within the first hour');

  return recommendations;
}

export function analyzePersonality(input: PersonalityAnalysisInput): PersonalityAnalysisResult {
  const sentiment = analyzeSentiment(input.captions);
  const { primary, secondary } = determinePersonality(
    input.captions,
    input.hashtags,
    input.mediaTypeDistribution,
    input.engagementRate
  );
  const contentStyle = analyzeContentStyle(input.captions, input.mediaTypeDistribution);
  const audienceAppeal = analyzeAudienceAppeal(sentiment, input.engagementRate);
  const recommendations = generateRecommendations(primary, input.engagementRate);

  return {
    primary,
    secondary,
    sentiment,
    contentStyle,
    audienceAppeal,
    recommendations,
  };
}
