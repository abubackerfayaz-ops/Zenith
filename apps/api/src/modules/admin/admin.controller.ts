import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { UpdateUserDto, CreateAdDto, UpdateAdDto, UserFilterDto, ResolveReportDto } from './dto/admin.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@Roles('ADMIN', 'SUPER_ADMIN')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  @ApiOperation({ summary: 'List users with filters' })
  async getUsers(@Query() filter: UserFilterDto) {
    return this.adminService.getUsers(filter);
  }

  @Patch('users/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update user (ban, verify, role change)' })
  async updateUser(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.adminService.updateUser(id, dto);
  }

  @Delete('users/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete user' })
  async deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }

  @Get('reports')
  @ApiOperation({ summary: 'List reports' })
  async getReports(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.adminService.getReports(page, limit);
  }

  @Patch('reports/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resolve a report' })
  async resolveReport(@Param('id') id: string, @Body() dto: ResolveReportDto) {
    return this.adminService.resolveReport(id, dto);
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Get platform-wide analytics' })
  async getAnalytics() {
    return this.adminService.getAnalytics();
  }

  @Post('ads')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create an advertisement' })
  async createAd(@CurrentUser('id') userId: string, @Body() dto: CreateAdDto) {
    return this.adminService.createAd(userId, dto);
  }

  @Get('ads')
  @ApiOperation({ summary: 'List all advertisements' })
  async getAds(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.adminService.getAds(page, limit);
  }

  @Patch('ads/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update an advertisement' })
  async updateAd(@Param('id') id: string, @Body() dto: UpdateAdDto) {
    return this.adminService.updateAd(id, dto);
  }

  @Delete('ads/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete an advertisement' })
  async deleteAd(@Param('id') id: string) {
    return this.adminService.deleteAd(id);
  }

  @Get('revenue')
  @ApiOperation({ summary: 'Get platform revenue analytics' })
  async getRevenue(@Query('period') period?: string) {
    return this.adminService.getRevenue(period);
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Get admin dashboard data' })
  async getDashboard() {
    return this.adminService.getDashboard();
  }
}
