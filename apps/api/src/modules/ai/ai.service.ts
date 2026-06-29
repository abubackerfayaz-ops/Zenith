import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.module';
import { AiGateway } from './ai.gateway';
import { PredictViralDto } from './dto/predict-viral.dto';
import { AnalyzePersonalityDto } from './dto/analyze-personality.dto';
enum PersonalityType {
  ARTIST = 'ARTIST',
  EDUCATOR = 'EDUCATOR',
  COMEDIAN = 'COMEDIAN',
  ENTREPRENEUR = 'ENTREPRENEUR',
  CREATOR = 'CREATOR',
  INFLUENCER = 'INFLUENCER',
  INNOVATOR = 'INNOVATOR',
  STORYTELLER = 'STORYTELLER',
  ANALYST = 'ANALYST',
  EXPLORER = 'EXPLORER',
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiGateway: AiGateway,
  ) {}

  async getFameScore(userId: string) {
    let fameScore = await this.prisma.fameScore.findUnique({
      where: { userId },
    });

    if (!fameScore) {
      fameScore = await this.calculateFameScore(userId);
    }

    const breakdown = {
      engagement: { score: fameScore.engagementScore, weight: 0.3 },
      consistency: { score: fameScore.consistencyScore, weight: 0.15 },
      contentQuality: { score: fameScore.contentQualityScore, weight: 0.25 },
      audienceGrowth: { score: fameScore.audienceGrowthScore, weight: 0.15 },
      influence: { score: fameScore.influenceScore, weight: 0.15 },
    };

    return {
      data: {
        totalScore: fameScore.score,
        viralPotential: fameScore.viralPotential,
        breakdown,
        totalPosts: fameScore.totalPosts,
        totalLikes: fameScore.totalLikes,
        totalComments: fameScore.totalComments,
        totalShares: fameScore.totalShares,
        totalViews: fameScore.totalViews,
        avgEngagementRate: fameScore.avgEngagementRate,
        lastCalculatedAt: fameScore.lastCalculatedAt,
      },
      message: 'Fame score retrieved successfully',
    };
  }

  async calculateFameScore(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: { select: { followers: true, following: true } },
        analytics: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const [recentPosts, recentReels] = await Promise.all([
      this.prisma.post.findMany({
        where: { userId, isArchived: false },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      this.prisma.reel.findMany({
        where: { userId, isArchived: false },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
    ]);

    const allContent = [...recentPosts, ...recentReels];
    const totalContent = allContent.length;
    const totalLikes = allContent.reduce((sum, c) => sum + c.likesCount, 0);
    const totalComments = allContent.reduce((sum, c) => sum + c.commentsCount, 0);
    const totalShares = allContent.reduce((sum, c) => sum + (c as any).sharesCount, 0);
    const totalViews = allContent.reduce((sum, c) => sum + (c as any).viewsCount, 0);
    const followerCount = user._count.followers;

    const avgEngagementRate = followerCount > 0 && totalContent > 0
      ? ((totalLikes + totalComments + totalShares) / (followerCount * totalContent)) * 100
      : 0;
    const engagementScore = Math.min(Math.round(avgEngagementRate * 100), 3000);

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentCount = allContent.filter(c => new Date(c.createdAt) >= thirtyDaysAgo).length;
    const postsPerWeek = recentCount / 4.3;
    const consistencyScore = Math.min(Math.round(postsPerWeek * 200), 1500);

    const avgLikesPerPost = totalContent > 0 ? totalLikes / totalContent : 0;
    const avgCommentsPerPost = totalContent > 0 ? totalComments / totalContent : 0;
    const qualityRaw = avgLikesPerPost * 0.7 + avgCommentsPerPost * 0.3;
    const contentQualityScore = Math.min(Math.round(qualityRaw * 2), 2500);

    const analytics = user.analytics;
    const growthRate = analytics?.followerGrowthRate ?? 0;
    const audienceGrowthScore = Math.min(Math.round(growthRate * 50), 1500);

    const shareRatio = totalLikes > 0 ? (totalShares / totalLikes) * 100 : 0;
    const avgViews = totalContent > 0 ? totalViews / totalContent : 0;
    const influenceScore = Math.min(Math.round(avgViews * 0.1 + shareRatio * 5), 1500);

    const viralPotential = parseFloat(
      (
        (engagementScore * 0.3 +
        consistencyScore * 0.15 +
        contentQualityScore * 0.25 +
        audienceGrowthScore * 0.15 +
        influenceScore * 0.15) / 100
      ).toFixed(2),
    );

    const totalScore = engagementScore + consistencyScore + contentQualityScore + audienceGrowthScore + influenceScore;

    const fameScore = await this.prisma.fameScore.upsert({
      where: { userId },
      update: {
        score: totalScore,
        viralPotential,
        engagementScore,
        consistencyScore,
        contentQualityScore,
        audienceGrowthScore,
        influenceScore,
        totalPosts: totalContent,
        totalLikes,
        totalComments,
        totalShares,
        totalViews,
        avgEngagementRate: parseFloat(avgEngagementRate.toFixed(2)),
        lastCalculatedAt: new Date(),
      },
      create: {
        userId,
        score: totalScore,
        viralPotential,
        engagementScore,
        consistencyScore,
        contentQualityScore,
        audienceGrowthScore,
        influenceScore,
        totalPosts: totalContent,
        totalLikes,
        totalComments,
        totalShares,
        totalViews,
        avgEngagementRate: parseFloat(avgEngagementRate.toFixed(2)),
      },
    });

    this.aiGateway.emitScoreUpdate(userId, fameScore);

    return fameScore;
  }

  async predictViral(userId: string, dto: PredictViralDto) {
    const captionLength = dto.caption.length;
    const captionScore = captionLength >= 50 && captionLength <= 200
      ? 0.8
      : captionLength > 200
        ? 0.5
        : 0.3;

    const hashtagScore = Math.min(dto.hashtags.length / 5, 1) * 0.9;

    const mediaScores: Record<string, number> = {
      REEL: 0.9,
      VIDEO: 0.7,
      CAROUSEL: 0.6,
      PHOTO: 0.4,
    };
    const mediaScore = mediaScores[dto.mediaType] ?? 0.4;

    const [userPosts, userReels] = await Promise.all([
      this.prisma.post.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: { likesCount: true, commentsCount: true, sharesCount: true, viewsCount: true },
      }),
      this.prisma.reel.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: { likesCount: true, commentsCount: true, sharesCount: true, viewsCount: true },
      }),
    ]);

    const history = [...userPosts, ...userReels];
    const avgLikes = history.length > 0
      ? history.reduce((s, h) => s + h.likesCount, 0) / history.length
      : 50;
    const avgComments = history.length > 0
      ? history.reduce((s, h) => s + h.commentsCount, 0) / history.length
      : 5;
    const avgShares = history.length > 0
      ? history.reduce((s, h) => s + (h as any).sharesCount, 0) / history.length
      : 2;
    const avgViews = history.length > 0
      ? history.reduce((s, h) => s + (h as any).viewsCount, 0) / history.length
      : 200;
    const historyMultiplier = avgLikes > 100 ? 1.2 : avgLikes > 50 ? 1.0 : 0.8;

    const viralProbability = parseFloat(
      Math.min((captionScore * 0.25 + hashtagScore * 0.3 + mediaScore * 0.25) * historyMultiplier, 0.99).toFixed(3),
    );

    const predictedLikes = Math.round(avgLikes * (1 + viralProbability) * (1 + mediaScore));
    const predictedComments = Math.round(avgComments * (1 + viralProbability) * 0.8);
    const predictedShares = Math.round(avgShares * (1 + viralProbability) * mediaScore);
    const predictedSaves = Math.round(predictedLikes * 0.3);
    const predictedViews = Math.round(avgViews * (1 + viralProbability * 1.5));
    const predictedFollowerGrowth = Math.round(predictedLikes * 0.05);

    const suggestions: string[] = [];
    if (captionLength < 50) {
      suggestions.push('Consider a longer caption for better engagement');
    }
    if (captionLength > 200) {
      suggestions.push('Keep captions concise (under 200 characters)');
    }
    if (dto.hashtags.length < 3) {
      suggestions.push('Use 3-5 relevant hashtags for better reach');
    }
    if (dto.hashtags.length > 10) {
      suggestions.push('Too many hashtags may reduce engagement; try 3-5');
    }
    if (dto.mediaType === 'PHOTO') {
      suggestions.push('Video content typically has higher viral potential');
    }
    if (avgLikes > 100) {
      suggestions.push('Post during peak hours (6-9 PM) for maximum reach');
    }

    const prediction = await this.prisma.viralPrediction.create({
      data: {
        predictedLikes,
        predictedComments,
        predictedShares,
        predictedSaves,
        predictedViews,
        predictedFollowerGrowth,
        viralProbability,
        suggestions: suggestions.length > 0 ? suggestions.join(',') : undefined,
        confidence: parseFloat((0.7 + Math.random() * 0.2).toFixed(3)),
      },
    });

    return {
      data: prediction,
      suggestions,
      message: 'Virality prediction completed',
    };
  }

  async analyzePersonality(userId: string, dto: AnalyzePersonalityDto) {
    const content = dto.recentContent;
    if (!content.length) {
      throw new BadRequestException('At least one content sample is required');
    }

    const positiveWords = ['love', 'amazing', 'great', 'beautiful', 'happy', 'wonderful', 'best', 'awesome', 'fantastic', 'incredible'];
    const educationalWords = ['learn', 'tutorial', 'guide', 'tips', 'how to', 'explained', 'lesson', 'course'];
    const comedicPatterns = ['😂', '🤣', 'lol', 'funny', 'hilarious', 'joke', 'meme'];

    let sentimentScore = 0;
    let educationScore = 0;
    let comedyScore = 0;
    let entrepreneurScore = 0;

    for (const item of content) {
      const caption = (item.caption ?? '').toLowerCase();
      const hashtags = (item.hashtags ?? []).map(h => h.toLowerCase());

      sentimentScore += positiveWords.filter(w => caption.includes(w)).length;
      educationScore += educationalWords.filter(w => caption.includes(w)).length;
      comedyScore += comedicPatterns.filter(p => caption.includes(p)).length;

      if (hashtags.some(h => ['business', 'entrepreneur', 'startup', 'money', 'success', 'marketing'].includes(h))) {
        entrepreneurScore++;
      }
    }

    const scores: { type: PersonalityType; score: number }[] = [
      { type: PersonalityType.ARTIST, score: sentimentScore },
      { type: PersonalityType.EDUCATOR, score: educationScore },
      { type: PersonalityType.COMEDIAN, score: comedyScore },
      { type: PersonalityType.ENTREPRENEUR, score: entrepreneurScore },
      { type: PersonalityType.CREATOR, score: content.length > 10 ? 3 : 1 },
      { type: PersonalityType.INFLUENCER, score: content.filter(c => (c.likes ?? 0) > 50).length },
      { type: PersonalityType.INNOVATOR, score: content.filter(c => c.hashtags?.includes('innovation') || (c.caption ?? '').toLowerCase().includes('new')).length },
    ];

    scores.sort((a, b) => b.score - a.score);
    const primaryType = scores[0].type;
    const secondaryType = scores[1]?.type ?? null;
    const confidence = Math.min((scores[0].score / Math.max(content.length, 1)) * 0.8 + 0.2, 0.95);

    const traits = {
      captionLength: content.reduce((s, c) => s + (c.caption?.length ?? 0), 0) / content.length,
      hashtagUsage: content.reduce((s, c) => s + (c.hashtags?.length ?? 0), 0) / content.length,
      avgLikes: content.reduce((s, c) => s + (c.likes ?? 0), 0) / content.length,
      avgComments: content.reduce((s, c) => s + (c.comments ?? 0), 0) / content.length,
      primaryTrait: primaryType.toLowerCase(),
    };

    const personality = await this.prisma.personality.upsert({
      where: { userId },
      update: {
        primaryType,
        secondaryType,
        traits: JSON.stringify(traits),
        confidence: parseFloat(confidence.toFixed(3)),
        lastAnalyzed: new Date(),
      },
      create: {
        userId,
        primaryType,
        secondaryType,
        traits: JSON.stringify(traits),
        confidence: parseFloat(confidence.toFixed(3)),
      },
    });

    return {
      data: personality,
      message: 'Personality analysis completed',
    };
  }

  async getCompatibility(userId: string, targetUserId: string) {
    if (userId === targetUserId) {
      throw new BadRequestException('Cannot calculate compatibility with yourself');
    }

    const existing = await this.prisma.socialCompatibility.findUnique({
      where: { userId_targetUserId: { userId, targetUserId } },
    });

    if (existing) {
      return { data: existing, message: 'Compatibility retrieved from cache' };
    }

    const [userHashtags, targetHashtags, mutualFollowers, userEngagement, targetEngagement] = await Promise.all([
      this.prisma.postHashtag.findMany({
        where: { post: { userId } },
        include: { hashtag: true },
        take: 100,
      }),
      this.prisma.postHashtag.findMany({
        where: { post: { userId: targetUserId } },
        include: { hashtag: true },
        take: 100,
      }),
      this.prisma.follow.count({
        where: {
          followerId: userId,
          following: { followers: { some: { followerId: targetUserId } } },
        },
      }),
      this.prisma.like.count({ where: { userId } }),
      this.prisma.like.count({ where: { userId: targetUserId } }),
    ]);

    const userTagNames = new Set(userHashtags.map(ph => ph.hashtag.name.toLowerCase()));
    const targetTagNames = new Set(targetHashtags.map(ph => ph.hashtag.name.toLowerCase()));
    const commonTags = [...userTagNames].filter(t => targetTagNames.has(t));
    const denominator = Math.max(Math.min(userTagNames.size, targetTagNames.size), 1);
    const interestCompatibility = Math.min((commonTags.length / denominator) * 100, 100);

    const engagementOverlap = Math.min(
      (mutualFollowers / Math.max(userEngagement, targetEngagement, 1)) * 100,
      100,
    );
    const friendshipScore = interestCompatibility * 0.4 + engagementOverlap * 0.3 + 30;
    const collaborationPotential = interestCompatibility * 0.5 + friendshipScore * 0.3 + 20;

    const compatibility = await this.prisma.socialCompatibility.create({
      data: {
        userId,
        targetUserId,
        friendshipScore: parseFloat(friendshipScore.toFixed(2)),
        interestCompatibility: parseFloat(interestCompatibility.toFixed(2)),
        collaborationPotential: parseFloat(collaborationPotential.toFixed(2)),
        commonInterests: commonTags.slice(0, 20).join(','),
      },
    });

    return {
      data: compatibility,
      message: 'Compatibility calculated successfully',
    };
  }

  async getSuggestions(userId: string) {
    const [fameScore, personality, recentPosts, recentReels] = await Promise.all([
      this.prisma.fameScore.findUnique({ where: { userId } }),
      this.prisma.personality.findUnique({ where: { userId } }),
      this.prisma.post.findMany({
        where: { userId, isArchived: false },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: { likesCount: true, commentsCount: true, type: true },
      }),
      this.prisma.reel.findMany({
        where: { userId, isArchived: false },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: { likesCount: true, commentsCount: true },
      }),
    ]);

    const suggestions: string[] = [];

    if (fameScore) {
      if (fameScore.engagementScore < 1000) {
        suggestions.push('Post more interactive content like polls and Q&A to boost engagement');
      }
      if (fameScore.consistencyScore < 500) {
        suggestions.push('Increase posting frequency to at least 3-4 times per week');
      }
      if (fameScore.contentQualityScore < 1000) {
        suggestions.push('Focus on higher quality visuals and storytelling in your posts');
      }
      if (fameScore.audienceGrowthScore < 500) {
        suggestions.push('Collaborate with other creators to reach new audiences');
      }
    }

    if (personality) {
      const personalityTips: Record<string, string> = {
        ARTIST: 'Share your creative process through behind-the-scenes content',
        COMEDIAN: 'Capitalize on trending audio and formats for comedy skits',
        EDUCATOR: 'Create tutorial series to build authority in your niche',
        INFLUENCER: 'Engage more with your audience through stories and live streams',
        ENTREPRENEUR: 'Share your journey and business insights to build trust',
        CREATOR: 'Experiment with new content formats and collaborations',
        INNOVATOR: 'Showcase your unique perspective with original content series',
      };
      const tip = personalityTips[personality.primaryType];
      if (tip) suggestions.push(tip);
    }

    const topPostType = recentPosts.length > 0
      ? recentPosts.sort((a, b) => b.likesCount - a.likesCount)[0].type
      : 'PHOTO';
    suggestions.push(`Your ${topPostType.toLowerCase()} content performs best — create more of this type`);
    suggestions.push('Post during peak hours (7-9 PM) for maximum initial engagement');

    return {
      data: suggestions,
      message: 'Suggestions generated successfully',
    };
  }

  async refreshScore(userId: string) {
    const fameScore = await this.calculateFameScore(userId);
    return {
      data: fameScore,
      message: 'Fame score recalculated successfully',
    };
  }
}
