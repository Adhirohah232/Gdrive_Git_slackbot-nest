import { Controller, Get, Param, Post } from '@nestjs/common';
import { json } from 'express';
import { stringify } from 'querystring';
import { AppService } from './app.service';
import { SlackService } from "./modules/slack/slack.service";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // @Get(':username')
  // getHello(@Param() params){
  //   return this.appService.getUser(params);
  // }


  @Get()
  getHello(){
    const result =this.appService.getHello();
    return result;
  }
  


  @Get('/exception')
  getException(): string{
    return this.appService.getException();
  }

}