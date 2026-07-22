import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';
import { ChangePasswordDto } from './dto/change-password.dto';

@ApiTags('Users') 
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @ApiResponse({ status: 200, description: 'Profil başarıyla getirildi.' })
  getProfile(@GetUser('userId') userId: number) {
    return this.usersService.getProfile(userId);
  }

  @Patch('profile')
  @ApiResponse({ status: 200, description: 'Profil başarıyla güncellendi.' })
  updateProfile(@GetUser('userId') userId: number, @Body() updateData: { name: string }) {
    return this.usersService.updateProfile(userId, updateData);
  }

  @Patch('change-password')
  @ApiResponse({ status: 200, description: 'Şifre başarıyla değiştirildi.' })
  @ApiResponse({ status: 401, description: 'Mevcut şifre hatalı.' })
  changePassword(
    @GetUser('userId') userId: number, 
    @Body() changePasswordDto: ChangePasswordDto
  ) {
    return this.usersService.changePassword(userId, changePasswordDto);
  }

  @Post('addresses')
  @ApiResponse({ status: 201, description: 'Yeni adres eklendi.' })
  addAddress(@GetUser('userId') userId: number, @Body() addressData: any) {
    return this.usersService.addAddress(userId, addressData);
  }

  @Delete('addresses/:id')
  @ApiResponse({ status: 200, description: 'Adres başarıyla silindi.' })
  deleteAddress(
    @GetUser('userId') userId: number, 
    @Param('id', ParseIntPipe) id: number
  ) {
    return this.usersService.deleteAddress(userId, id);
  }
}