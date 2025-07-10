import { Injectable } from '@nestjs/common';
import { CreateShareDto } from './dto/create-share.dto';
import { UpdateShareDto } from './dto/update-share.dto';

@Injectable()
export class ShareService {
  create(createShareDto: CreateShareDto) {
    return 'This action adds a new share';
  }

  findAll() {
    return `This action returns all share`;
  }

  findOne(id: string) {
    return `This action returns a #${id} share`;
  }

  update(id: string, updateShareDto: UpdateShareDto) {
    return `This action updates a #${id} share`;
  }

  remove(id: string) {
    return `This action removes a #${id} share`;
  }
}
