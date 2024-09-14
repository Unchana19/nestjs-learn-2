import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/providers/users.service';

@Injectable()
export class PostsService {
  constructor(private readonly usersService: UsersService) {}

  public findAll(userId: string) {
    const user = this.usersService.findOneById(userId);
    return [
      {
        user: user,
        title: 'Test title',
        content: 'Test Content',
      },
      {
        user: user,
        title: 'Test title 2',
        content: 'Test Content 2',
      },
    ];
  }
}
