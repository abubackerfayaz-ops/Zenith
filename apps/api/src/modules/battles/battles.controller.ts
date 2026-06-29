import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { BattlesService } from './battles.service';
import { CreateBattleDto, UpdateBattleDto, BattleFilterDto } from './dto/create-battle.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Battles')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('battles')
export class BattlesController {
  constructor(private readonly battlesService: BattlesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new battle' })
  async create(@CurrentUser('id') userId: string, @Body() dto: CreateBattleDto) {
    return this.battlesService.create(userId, dto);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'List battles with filters (active, upcoming, completed)' })
  async findAll(@Query() filter: BattleFilterDto) {
    return this.battlesService.findAll(filter);
  }

  @Public()
  @Get('active')
  @ApiOperation({ summary: 'Get currently active battles' })
  async getActive() {
    return this.battlesService.getActive();
  }

  @Public()
  @Get('leaderboard')
  @ApiOperation({ summary: 'Get battle leaderboard' })
  async getLeaderboard() {
    return this.battlesService.getLeaderboard();
  }

  @Public()
  @Get('weekly')
  @ApiOperation({ summary: 'Get weekly competition battles' })
  async getWeekly() {
    return this.battlesService.getWeekly();
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get battle details by ID' })
  async findOne(@Param('id') id: string) {
    return this.battlesService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a battle' })
  async update(@Param('id') id: string, @Body() dto: UpdateBattleDto) {
    return this.battlesService.update(id, dto);
  }

  @Post(':id/join')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Join a battle as participant' })
  async join(@CurrentUser('id') userId: string, @Param('id') battleId: string) {
    return this.battlesService.join(userId, battleId);
  }

  @Post(':id/vote/:participantId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Vote for a participant in a battle' })
  async vote(
    @CurrentUser('id') userId: string,
    @Param('id') battleId: string,
    @Param('participantId') participantId: string,
  ) {
    return this.battlesService.vote(userId, battleId, participantId);
  }
}
