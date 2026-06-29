import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './common/prisma.module';
import { RedisModule } from './common/redis/redis.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PostsModule } from './modules/posts/posts.module';
import { StoriesModule } from './modules/stories/stories.module';
import { ReelsModule } from './modules/reels/reels.module';
import { MessagingModule } from './modules/messaging/messaging.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { CommentsModule } from './modules/comments/comments.module';
import { HashtagsModule } from './modules/hashtags/hashtags.module';
import { AiModule } from './modules/ai/ai.module';
import { BattlesModule } from './modules/battles/battles.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { AdminModule } from './modules/admin/admin.module';
import { MonetizationModule } from './modules/monetization/monetization.module';
import { RankingModule } from './modules/ranking/ranking.module';
import { SearchModule } from './modules/search/search.module';
import { UploadModule } from './modules/upload/upload.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
    CacheModule.register({
      isGlobal: true,
      ttl: 60,
      max: 1000,
    }),
    PrismaModule,
    RedisModule,
    AuthModule,
    UsersModule,
    PostsModule,
    StoriesModule,
    ReelsModule,
    MessagingModule,
    NotificationsModule,
    CommentsModule,
    HashtagsModule,
    AiModule,
    BattlesModule,
    AnalyticsModule,
    AdminModule,
    MonetizationModule,
    RankingModule,
    SearchModule,
    UploadModule,
    HealthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
