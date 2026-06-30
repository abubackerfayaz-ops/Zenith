import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CurrentUserPayload } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Get('search')
  @ApiOperation({ summary: 'Search users by username or display name' })
  @ApiQuery({ name: 'q', required: true })
  async searchUsers(
    @Query('q') query: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.usersService.searchUsers(query, pagination.page, pagination.limit);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('me/analytics')
  @ApiOperation({ summary: 'Get analytics dashboard for current user' })
  async getMyAnalytics(@CurrentUser() user: CurrentUserPayload) {
    return this.usersService.getAnalytics(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch('me')
  @ApiOperation({ summary: 'Update own profile' })
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(userId, dto);
  }

  @Public()
  @UseGuards(OptionalJwtAuthGuard)
  @Get(':username')
  @ApiOperation({ summary: 'Get public user profile' })
  async getProfile(
    @Param('username') username: string,
    @CurrentUser('id') currentUserId?: string,
  ) {
    return this.usersService.getPublicProfile(username, currentUserId);
  }

  @Public()
  @Get(':username/followers')
  @ApiOperation({ summary: 'Get paginated followers of a user' })
  async getFollowers(
    @Param('username') username: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.usersService.getFollowers(username, pagination.page, pagination.limit);
  }

  @Public()
  @Get(':username/following')
  @ApiOperation({ summary: 'Get paginated following of a user' })
  async getFollowing(
    @Param('username') username: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.usersService.getFollowing(username, pagination.page, pagination.limit);
  }

  @UseGuards(JwtAuthGuard)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':id/follow')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Follow a user' })
  async follow(
    @CurrentUser('id') userId: string,
    @Param('id') targetId: string,
  ) {
    return this.usersService.follow(userId, targetId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id/follow')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unfollow a user' })
  async unfollow(
    @CurrentUser('id') userId: string,
    @Param('id') targetId: string,
  ) {
    return this.usersService.unfollow(userId, targetId);
  }
}
