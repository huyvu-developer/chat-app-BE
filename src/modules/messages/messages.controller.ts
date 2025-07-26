import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { AuthService } from '../auth/auth.service';

@Controller('messages')
export class MessagesController {
  constructor(
    private readonly messageService: MessagesService,
    private readonly authService: AuthService,
  ) {}

  @Post('create')
  async create(
    @Body() data: CreateMessageDto,
    @Headers('Authorization') bearerToken: string,
  ) {
    const token = this.authService.extractTokenFromHeader(bearerToken);
    const user = await this.authService.validateToken(token);
    return this.messageService.create({
      ...data,
      sender: user._id,
    });
  }

  @Put(':id')
  async update(@Body() data: any, @Param('id') id: string) {
    return await this.messageService.update(id, data);
  }

  @Get('conversation/:conversationId')
  async getConversationMessages(
    @Param('conversationId') conversationId: string,
  ) {
    return await this.messageService.getConversationMessages(conversationId);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.messageService.update(id, {
      deletedAt: new Date(),
    });
  }
}
