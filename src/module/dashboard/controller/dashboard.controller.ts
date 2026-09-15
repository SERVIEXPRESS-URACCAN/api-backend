import { Controller, Get } from '@nestjs/common';
import { DashboardService } from '../service/dashboard.service';
import { Auth } from 'src/module/auth/decorator/auth.decorator';
import { AuthUser } from 'src/module/auth/interfaces/auth-user.interface';
import { GetUser } from 'src/module/auth/decorator/getUser.decorator';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('admin')
  @Auth('admin')
  getAdminStats() {
    return this.dashboardService.getAdminStats();
  }

  @Get('owner')
  @Auth('owner')
  getOwnerStats(@GetUser() user: AuthUser) {
    return this.dashboardService.getOwnerStats(user.id);
  }
}
