import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Cık cık cık sanırım yanlış yere geldin dostum ><';
  }
}
