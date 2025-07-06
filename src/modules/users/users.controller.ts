import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseFilters,
  UseGuards,
  Headers,
  Res,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { HttpExceptionFilter } from 'src/common/filters/http-exception.filter';
import { AuthGuard } from '../auth/auth.guard';
import { AuthService } from '../auth/auth.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {
    // Constructor logic if needed
  }

  @Get()
  @UseGuards(AuthGuard)
  async getAll() {
    const users = await this.usersService.findAll();
    return users;
  }

  @Post()
  @UseFilters(HttpExceptionFilter)
  async create(@Body() userData: CreateUserDto) {
    return await this.usersService.create(userData);
  }

  @Put(':id')
  async update(@Body() userData: UpdateUserDto, @Param('id') id: string) {
    return await this.usersService.update(id, userData);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.usersService.delete(id);
  }

  @Get('information')
  async getInformation(@Headers('Authorization') authorization: string) {
    const user = await this.authService.getInformationLogged(authorization);
    return await this.usersService.getInfomation(String(user._id));
  }

  @Put('send-friend-request/:userId')
  async sendFriendRequest(
    @Param('userId') userId: string,
    @Headers('Authorization') authorization: string,
  ) {
    const user = await this.authService.getInformationLogged(authorization);
    return this.usersService.requestFriend(user._id, userId);
  }

  @Put('accept-friend-request/:userId')
  async acceptFriendRequest(
    @Param('userId') userId: string,
    @Headers('Authorization') authorization: string,
  ) {
    const user = await this.authService.getInformationLogged(authorization);
    return this.usersService.acceptFriend(user._id, userId);
  }

  @Put('unfriend-friend-request/:userId')
  async unfriend(
    @Param('userId') userId: string,
    @Headers('Authorization') authorization: string,
  ) {
    const user = await this.authService.getInformationLogged(authorization);
    return this.usersService.unfriend(user._id, userId);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return await this.usersService.findById(id);
  }
}
