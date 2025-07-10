import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Reaction } from '../entities/reaction.entity';

@Injectable()
export class ReactionRepository extends Repository<Reaction> {
  constructor(private dataSource: DataSource) {
    super(Reaction, dataSource.createEntityManager());
  }
} 