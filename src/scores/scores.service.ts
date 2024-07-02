import { Injectable } from '@nestjs/common';
import { CreateScoreDto } from './dto/create-score.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Score } from './entities/score.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ScoresService {
  constructor(
    @InjectRepository(Score)
    private readonly scoreRepository: Repository<Score>,
  ) {}

  create(createScoreDto: CreateScoreDto): Promise<Score> {
    return this.scoreRepository.save(createScoreDto);
  }

  findAll() {
    return this.scoreRepository.find();
  }

  findAllLeaderBoard() {
    return this.scoreRepository.find({ order: { score: 'DESC' }, take: 20 });
  }

  findOne(id: string) {
    return this.scoreRepository.findOneBy({ id });
  }
}
