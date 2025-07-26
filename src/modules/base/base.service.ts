import { Injectable } from '@nestjs/common';

@Injectable()
export class BaseService<TModel, TCreateDto, TUpdateDto> {
  constructor(private readonly model: any) {}

  async findAll(): Promise<TModel[]> {
    return await this.model.find().exec();
  }

  async findById(id: string): Promise<TModel | null> {
    return await this.model.findById(id).exec();
  }

  async create(data: TCreateDto): Promise<TModel> {
    const created = new this.model(data);
    return created.save();
  }

  async update(id: string, data: TUpdateDto): Promise<TModel | null> {
    return this.model.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async delete(id: string): Promise<TModel | null> {
    return this.model.findByIdAndDelete(id).exec();
  }
}
