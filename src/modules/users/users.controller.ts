import { User } from '.prisma/client';
import { GetUser } from '@modules/auth/decorators';
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RoleType } from '@prisma/client';
import RoleGuard from 'guards/roles.guard';
import { JwtGuard } from '../../guards';
import { UpdateUserDto } from './dto';
import { UsersService } from './users.service';



@Controller('users')
@ApiTags('users')
export class UsersController {

  constructor(
    private readonly userService: UsersService,
  ) {}

  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @Get('me')
  getMe(
    @GetUser() user: User,
  ) {
    return user;
  }

  @UseGuards(RoleGuard([RoleType.ADMIN]))
  @ApiBearerAuth()
  @Get()
  getAll() {
    return this.userService.getAllUsers();
  }

  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @Patch('')
  update(@GetUser() user: User, @Body() dto: UpdateUserDto) {
    return this.userService.updateUser(user.id, dto);
  }

  @UseGuards(RoleGuard([RoleType.ADMIN]))
  @ApiBearerAuth()
  @Delete('/:id')
  delete(@Param('id', ParseIntPipe) id: string) {
    return this.userService.deleteUser(id);
  }

}
