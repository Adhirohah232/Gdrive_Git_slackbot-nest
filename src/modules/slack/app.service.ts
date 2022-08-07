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
    // getUser(params){
    //   return this.httpService
    //   .get(`https://api.github.com/users/${params.username}`)
    //    .pipe(
    //     map((response)=> response.data),
    //     map((data)=>({
    //       ...this.data[params.username],
    //       name: data.name,
    //       location: data.location,
    //       publicRepos: data.public_repos,
    //       repos: data.repos
    //     })),
    //    );
    // }
    getHello(): string {
      return 'Hello World!';
    }
  
    getRepos(){
      let username = 'Adhirohah232';
      return this.httpService
      .get(`https://api.github.com/users/${username}`)
       .pipe(
        map((response)=> response.data),
        map((data)=>({
          ...this.data[username],
          url: data.html_url
        })),
       );
    }

  


  @RollbarHandler()
  getException():string {
    throw new Error("Intentional Exception to verify Rollbar functionality");  
}
}
  
