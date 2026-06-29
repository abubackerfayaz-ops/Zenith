import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')
  const pwd = await bcrypt.hash('password123', 12)

  // Clean existing seed data (keep users)
  await prisma.postHashtag.deleteMany()
  await prisma.mention.deleteMany()
  await prisma.like.deleteMany()
  await prisma.comment.deleteMany()
  await prisma.bookmark.deleteMany()
  await prisma.media.deleteMany()
  await prisma.post.deleteMany()
  await prisma.storyReaction.deleteMany()
  await prisma.story.deleteMany()
  await prisma.battleVote.deleteMany()
  await prisma.battleParticipant.deleteMany()
  await prisma.battle.deleteMany()
  await prisma.follow.deleteMany()
  await prisma.fameScore.deleteMany()
  await prisma.creatorLevel.deleteMany()
  await prisma.personality.deleteMany()
  await prisma.wallet.deleteMany()
  await prisma.hashtag.deleteMany()

  const admin = await prisma.user.upsert({
    where: { email: 'admin@zenith.com' },
    update: {},
    create: { email: 'admin@zenith.com', username: 'admin', displayName: 'Admin', password: pwd, role: 'SUPER_ADMIN', isVerified: true, isOnboarded: true, bio: 'Platform administrator', profilePicture: 'https://api.dicebear.com/8.x/avataaars/svg?seed=admin' },
  })

  const creator = await prisma.user.upsert({
    where: { email: 'creator@zenith.com' },
    update: {},
    create: { email: 'creator@zenith.com', username: 'creativestar', displayName: 'Creative Star', password: pwd, role: 'CREATOR', isVerified: true, isOnboarded: true, bio: 'Digital artist & content creator', profilePicture: 'https://api.dicebear.com/8.x/avataaars/svg?seed=creator' },
  })

  const user1 = await prisma.user.upsert({
    where: { email: 'user@zenith.com' },
    update: {},
    create: { email: 'user@zenith.com', username: 'johndoe', displayName: 'John Doe', password: pwd, role: 'USER', isOnboarded: true, bio: 'Just exploring!', profilePicture: 'https://api.dicebear.com/8.x/avataaars/svg?seed=john' },
  })

  const demo = await prisma.user.upsert({
    where: { email: 'demo@zenith.com' },
    update: {},
    create: { email: 'demo@zenith.com', username: 'demo', displayName: 'Demo User', password: pwd, role: 'USER', isOnboarded: true, bio: 'Demo account', profilePicture: 'https://api.dicebear.com/8.x/avataaars/svg?seed=demo' },
  })

  await prisma.follow.createMany({ data: [
    { followerId: user1.id, followingId: creator.id },
    { followerId: demo.id, followingId: creator.id },
    { followerId: creator.id, followingId: user1.id },
  ]})

  await prisma.fameScore.createMany({ data: [
    { userId: creator.id, score: 85, viralPotential: 78, engagementScore: 92, consistencyScore: 80, contentQualityScore: 88, audienceGrowthScore: 75, influenceScore: 82, totalPosts: 45, totalLikes: 12300, totalComments: 890, totalShares: 3400, totalViews: 89000, avgEngagementRate: 4.2 },
    { userId: user1.id, score: 32, viralPotential: 28, engagementScore: 35, consistencyScore: 40, contentQualityScore: 30, audienceGrowthScore: 25, influenceScore: 22, totalPosts: 12, totalLikes: 450, totalComments: 67, totalShares: 120, totalViews: 5600, avgEngagementRate: 2.1 },
    { userId: demo.id, score: 15, viralPotential: 10, engagementScore: 18, consistencyScore: 12, contentQualityScore: 20, audienceGrowthScore: 8, influenceScore: 10, totalPosts: 3, totalLikes: 45, totalComments: 8, totalShares: 15, totalViews: 1200, avgEngagementRate: 1.5 },
  ]})

  await prisma.creatorLevel.createMany({ data: [
    { userId: creator.id, level: 7, title: 'Platinum', xp: 7500, xpToNextLevel: 10000, totalXpEarned: 7500, perks: '["custom_emoji","priority_support","analytics_advanced"]' },
    { userId: user1.id, level: 2, title: 'Bronze', xp: 450, xpToNextLevel: 1000, totalXpEarned: 450 },
    { userId: demo.id, level: 1, title: 'Bronze', xp: 100, xpToNextLevel: 1000, totalXpEarned: 100 },
  ]})

  await prisma.personality.createMany({ data: [
    { userId: creator.id, primaryType: 'ARTIST', secondaryType: 'INNOVATOR', traits: '["creative","expressive","innovative"]', confidence: 0.92 },
    { userId: user1.id, primaryType: 'EXPLORER', traits: '["curious","social"]', confidence: 0.65 },
  ]})

  await prisma.wallet.createMany({ data: [
    { userId: creator.id, coins: 2500, totalCoinsEarned: 5000, revenue: 150.00, pendingRevenue: 25.00 },
    { userId: user1.id, coins: 500, totalCoinsEarned: 1000, revenue: 10.00 },
    { userId: demo.id, coins: 100, totalCoinsEarned: 200 },
  ]})

  await prisma.hashtag.createMany({ data: [
    { name: 'zenith', postsCount: 15 }, { name: 'viral', postsCount: 42 }, { name: 'creator', postsCount: 28 },
    { name: 'trending', postsCount: 56 }, { name: 'photography', postsCount: 33 }, { name: 'music', postsCount: 21 },
    { name: 'dance', postsCount: 19 }, { name: 'ai', postsCount: 12 }, { name: 'fitness', postsCount: 25 },
    { name: 'food', postsCount: 30 },
  ]})

  // ─── Posts ──────────────────────────────────────────────────
  const hashtags = await prisma.hashtag.findMany()
  const tagMap = Object.fromEntries(hashtags.map((h: { name: string; id: string }) => [h.name, h.id]))

  const post1 = await prisma.post.create({
    data: {
      userId: creator.id, caption: 'Just dropped a new track! 🎵 #music #creator',
      type: 'VIDEO', media: { create: { url: 'https://picsum.photos/seed/post1/800/800', type: 'IMAGE', orderIndex: 0 } },
      hashtags: { create: [{ hashtagId: tagMap['music'] }, { hashtagId: tagMap['creator'] }, { hashtagId: tagMap['viral'] }] },
    },
  })
  const post2 = await prisma.post.create({
    data: {
      userId: creator.id, caption: 'Morning vibes ☀️ #photography #zenith',
      type: 'CAROUSEL',
      media: {
        create: [
          { url: 'https://picsum.photos/seed/post2a/800/800', type: 'IMAGE', orderIndex: 0 },
          { url: 'https://picsum.photos/seed/post2b/800/800', type: 'IMAGE', orderIndex: 1 },
        ],
      },
      hashtags: { create: [{ hashtagId: tagMap['photography'] }, { hashtagId: tagMap['zenith'] }] },
    },
  })
  const post3 = await prisma.post.create({
    data: {
      userId: user1.id, caption: 'Check out this amazing sunset 🌅',
      type: 'PHOTO', media: { create: { url: 'https://picsum.photos/seed/post3/800/800', type: 'IMAGE', orderIndex: 0 } },
      hashtags: { create: [{ hashtagId: tagMap['photography'] }, { hashtagId: tagMap['trending'] }] },
    },
  })
  const post4 = await prisma.post.create({
    data: {
      userId: user1.id, caption: 'Working out 💪 #fitness #viral',
      type: 'PHOTO', media: { create: { url: 'https://picsum.photos/seed/post4/800/800', type: 'IMAGE', orderIndex: 0 } },
      hashtags: { create: [{ hashtagId: tagMap['fitness'] }, { hashtagId: tagMap['viral'] }] },
    },
  })
  const post5 = await prisma.post.create({
    data: {
      userId: demo.id, caption: 'Exploring AI tools 🤖 #ai #zenith',
      type: 'PHOTO', media: { create: { url: 'https://picsum.photos/seed/post5/800/800', type: 'IMAGE', orderIndex: 0 } },
      hashtags: { create: [{ hashtagId: tagMap['ai'] }, { hashtagId: tagMap['zenith'] }] },
    },
  })
  await prisma.like.createMany({ data: [
    { postId: post1.id, userId: user1.id }, { postId: post1.id, userId: demo.id },
    { postId: post2.id, userId: user1.id }, { postId: post3.id, userId: creator.id },
    { postId: post4.id, userId: creator.id }, { postId: post5.id, userId: creator.id },
    { postId: post5.id, userId: user1.id },
  ]})

  // ─── Stories ─────────────────────────────────────────────────
  const now = new Date()
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000)
  await prisma.story.createMany({ data: [
    { userId: creator.id, expiresAt, viewsCount: 42 },
    { userId: user1.id, expiresAt, viewsCount: 15 },
    { userId: demo.id, expiresAt, viewsCount: 8 },
  ]})

  // ─── Battles ─────────────────────────────────────────────────
  const battle1 = await prisma.battle.create({
    data: {
      title: 'Rap Battle Championship',
      description: 'Who has the best flow?',
      status: 'ACTIVE', category: 'MUSIC',
      startDate: now, endDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      prize: '500 ZenithCoins',
    },
  })
  const battle2 = await prisma.battle.create({
    data: {
      title: 'Dance-off Challenge',
      description: 'Show us your best moves',
      status: 'ACTIVE', category: 'DANCE',
      startDate: now, endDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
      prize: '300 ZenithCoins',
    },
  })
  const battle3 = await prisma.battle.create({
    data: {
      title: 'Photo Editing Battle',
      description: 'Best photo edit wins',
      status: 'UPCOMING', category: 'ART',
      startDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
      prize: '200 ZenithCoins',
    },
  })
  await prisma.battleParticipant.createMany({ data: [
    { battleId: battle1.id, userId: creator.id, score: 85, votesCount: 12 },
    { battleId: battle1.id, userId: user1.id, score: 72, votesCount: 8 },
    { battleId: battle2.id, userId: creator.id, score: 90, votesCount: 15 },
    { battleId: battle2.id, userId: demo.id, score: 60, votesCount: 5 },
  ]})

  console.log('Database seeded successfully!')
  console.log('Demo accounts:')
  console.log('  Admin:   admin@zenith.com / password123')
  console.log('  Creator: creator@zenith.com / password123')
  console.log('  User:    user@zenith.com / password123')
  console.log('  Demo:    demo@zenith.com / password123')
}

main().catch((e) => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
