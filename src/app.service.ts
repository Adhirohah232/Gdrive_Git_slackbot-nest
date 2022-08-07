import { HttpService, Injectable, Param } from "@nestjs/common";
import { respondToSslCheck } from "@slack/bolt/dist/receivers/ExpressReceiver";
import { response } from 'express';
import { url } from "inspector";
import { RollbarHandler } from 'nestjs-rollbar';
import { map } from 'rxjs';


@Injectable()
export class AppService {
private data = {
  amlan:{
      twitterfollower: 700,
      youtuberfollower: 500
  }
}
  
  constructor(private httpService: HttpService){}

    getHello(): string {
      return 'Hello World!';
    }



  @RollbarHandler()
  getException():string {
    throw new Error("Intentional Exception to verify Rollbar functionality");  
}
}
  
