import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { Conversation } from './schema/conversation.schema';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';

@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationService: ConversationsService) {}
  @Get()
  async findAll(): Promise<Conversation[]> {
    return await this.conversationService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<Conversation> {
    return this.conversationService.findById(id);
  }

  @Post()
  async create(@Body() data: CreateConversationDto): Promise<Conversation> {
    return await this.conversationService.create(data);
  }

  @Put(':id')
  async update(@Body() data: UpdateConversationDto, @Param('id') id: string) {
    return await this.conversationService.update(id, data);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.conversationService.delete(id);
  }

  @Get('user/:userId')
  async getConversationByUser(@Param('userId') userId: string) {
    return await this.conversationService.getConversationByUser(userId);
  }
}
