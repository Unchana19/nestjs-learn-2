import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/providers/users.service';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
  ) {}

  public login(email: string, password: string, id: number) {
    const user = this.usersService.findOneById(id);

    return 'SAMPLE_TOKEN';
  }

  public isAuth() {
    return true;
  }
}
