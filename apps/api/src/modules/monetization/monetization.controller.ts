import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { MonetizationService } from './monetization.service';
import {
  DepositDto,
  WithdrawDto,
  CreateSubscriptionTierDto,
  SendTipDto,
  TransactionFilterDto,
} from './dto/monetization.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Monetization')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller()
export class MonetizationController {
  constructor(private readonly monetizationService: MonetizationService) {}

  @Get('wallet')
  @ApiOperation({ summary: 'Get user wallet' })
  async getWallet(@CurrentUser('id') userId: string) {
    return this.monetizationService.getWallet(userId);
  }

  @Post('wallet/deposit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Add coins to wallet' })
  async deposit(@CurrentUser('id') userId: string, @Body() dto: DepositDto) {
    return this.monetizationService.deposit(userId, dto);
  }

  @Post('wallet/withdraw')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request a withdrawal' })
  async withdraw(@CurrentUser('id') userId: string, @Body() dto: WithdrawDto) {
    return this.monetizationService.withdraw(userId, dto);
  }

  @Get('wallet/transactions')
  @ApiOperation({ summary: 'Get transaction history' })
  async getTransactions(
    @CurrentUser('id') userId: string,
    @Query() filter: TransactionFilterDto,
  ) {
    return this.monetizationService.getTransactions(userId, filter);
  }

  @Post('subscription/create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a creator subscription tier' })
  async createSubscriptionTier(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateSubscriptionTierDto,
  ) {
    return this.monetizationService.createSubscriptionTier(userId, dto);
  }

  @Get('subscription/my')
  @ApiOperation({ summary: 'Get my subscription settings' })
  async getMySubscription(@CurrentUser('id') userId: string) {
    return this.monetizationService.getMySubscription(userId);
  }

  @Post('subscription/:creatorId/subscribe')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Subscribe to a creator' })
  async subscribe(
    @CurrentUser('id') userId: string,
    @Param('creatorId') creatorId: string,
  ) {
    return this.monetizationService.subscribe(userId, creatorId);
  }

  @Delete('subscription/:creatorId/unsubscribe')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unsubscribe from a creator' })
  async unsubscribe(
    @CurrentUser('id') userId: string,
    @Param('creatorId') creatorId: string,
  ) {
    return this.monetizationService.unsubscribe(userId, creatorId);
  }

  @Post('tips/:creatorId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send a tip to a creator' })
  async sendTip(
    @CurrentUser('id') userId: string,
    @Param('creatorId') creatorId: string,
    @Body() dto: SendTipDto,
  ) {
    return this.monetizationService.sendTip(userId, creatorId, dto);
  }

  @Get('revenue')
  @ApiOperation({ summary: 'Get revenue dashboard data' })
  async getRevenue(@CurrentUser('id') userId: string) {
    return this.monetizationService.getRevenue(userId);
  }
}
