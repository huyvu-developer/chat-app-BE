import { BadRequestException, Injectable } from '@nestjs/common';
import { User, UserDocument } from './schemas/user.schema';
import { BaseService } from '../base/base.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class UsersService extends BaseService<
  User,
  CreateUserDto,
  UpdateUserDto
> {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {
    super(userModel);
  }

  override async create(data: CreateUserDto): Promise<User> {
    const emailIsExits = await this.checkEmailExits(data.email);
    if (emailIsExits) {
      throw new BadRequestException('Email đã tồn tại');
    }
    const created = new this.userModel(data);
    return await created.save();
  }

  private async updateUser(userId: string, update: object) {
    await this.userModel.updateOne({ _id: userId }, update);
  }

  private async hasSentRequest(
    senderId: string,
    receiverId: string,
  ): Promise<boolean> {
    const sender = await this.userModel
      .findById(senderId)
      .select('sentRequests');
    return (
      sender?.sentRequests?.some((id) => id.toString() === receiverId) ?? false
    );
  }

  private async hasPendingRequest(
    senderId: string,
    receiverId: string,
  ): Promise<boolean> {
    const receiver = await this.userModel
      .findById(senderId)
      .select('pendingRequest');
    return (
      receiver?.pendingRequest?.some((id) => id.toString() === receiverId) ??
      false
    );
  }

  private async isFriend(
    senderId: string,
    receiverId: string,
  ): Promise<boolean> {
    const sender = await this.userModel.findById(senderId).select('friends');
    return sender?.friends?.some((id) => id.toString() === receiverId) ?? false;
  }

  async requestFriend(senderId: string, receiverId: string) {
    try {
      if (senderId === receiverId) {
        throw new BadRequestException('Cannot send friend request to yourself');
      }

      const hasSent = await this.hasSentRequest(senderId, receiverId);
      if (hasSent) {
        // Cancel friend request
        await Promise.all([
          this.updateUser(senderId, { $pull: { sentRequests: receiverId } }),
          this.updateUser(receiverId, { $pull: { pendingRequest: senderId } }),
        ]);
        return { senderId, receiverId, action: 'Cancel friend request' };
      }

      // Send friend request
      await Promise.all([
        this.updateUser(senderId, { $addToSet: { sentRequests: receiverId } }),
        this.updateUser(receiverId, {
          $addToSet: { pendingRequest: senderId },
        }),
      ]);
      return { senderId, receiverId, action: 'Send friend request' };
    } catch (error) {
      throw new BadRequestException(
        error.message || 'Failed to process friend request',
      );
    }
  }

  async acceptFriend(senderId: string, receiverId: string) {
    try {
      if (senderId === receiverId) {
        throw new BadRequestException(
          'Cannot accept friend request from yourself',
        );
      }

      const hasRequest = await this.hasPendingRequest(senderId, receiverId);
      if (!hasRequest) {
        return { status: 'Failed', message: 'No pending request found' };
      }

      // Accept friend request
      await Promise.all([
        this.updateUser(receiverId, {
          $addToSet: { friends: senderId },
          $pull: { sentRequests: senderId },
        }),
        this.updateUser(senderId, {
          $addToSet: { friends: receiverId },
          $pull: { pendingRequest: receiverId },
        }),
      ]);

      return { senderId, receiverId, action: 'Accept friend request' };
    } catch (error) {
      throw new BadRequestException(
        error.message || 'Failed to accept friend request',
      );
    }
  }

  async unfriend(senderId: string, receiverId: string) {
    try {
      if (senderId === receiverId) {
        throw new BadRequestException('Cannot unfriend yourself');
      }

      const areFriends = await this.isFriend(senderId, receiverId);
      if (!areFriends) {
        return { status: 'Failed', message: 'Not friends yet' };
      }

      // Remove friend
      await Promise.all([
        this.updateUser(senderId, { $pull: { friends: receiverId } }),
        this.updateUser(receiverId, { $pull: { friends: senderId } }),
      ]);

      return { senderId, receiverId, action: 'Unfriend' };
    } catch (error) {
      throw new BadRequestException(error.message || 'Failed to unfriend');
    }
  }

  async checkEmailExits(email: string): Promise<boolean> {
    const response = await this.userModel.exists({ email });
    return response ? true : false;
  }

  async getByEmail(email: string): Promise<User> {
    return await this.userModel.findOne({ email: email });
  }

  async getInfomation(userId: string) {
    return await this.userModel
      .findById(userId)
      .populate(['pendingRequest', 'friends', 'sentRequests']);
  }
}
