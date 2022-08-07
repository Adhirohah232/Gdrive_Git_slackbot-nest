// import { Injectable } from '@nestjs/common';
import {Inject, Controller, HttpService, Injectable} from "@nestjs/common";
import { ConfigService } from 'src/shared/config.service';
import { WebClient, WebAPICallResult, ErrorCode} from '@slack/web-api';
import { RollbarHandler } from 'nestjs-rollbar';
import { map } from "rxjs";
import { AppController } from "src/app.controller";
import { stringify } from "querystring";
import { json } from "express";
import axios, { Axios } from "axios";
import {google} from 'googleapis';
import { GoogleAuth } from "google-auth-library";
import { file } from "googleapis/build/src/apis/file";
import { TsGoogleDrive } from "ts-google-drive";
import { datacatalog } from "googleapis/build/src/apis/datacatalog";


@Injectable()
export class SlackService {
    
    private _clientId: string;
    private _clientSecret: string;
    private _webClient: WebClient;


    constructor(private _configService: ConfigService) {
        this._webClient = new WebClient();
        this._clientId = this._configService.get('SLACK_CLIENT_ID');
        this._clientSecret = this._configService.get('SLACK_CLIENT_SECRET');
    }
    

    @RollbarHandler()
    async oauthAccess(
        code: string,
        redirectUri: string,
    ): Promise<WebAPICallResult> {
        const data = {
            code: code,
            client_id: this._clientId,
            client_secret: this._clientSecret,
            redirect_uri: redirectUri,
        };
        let response;
        try {
            response = await this._webClient.oauth.v2.access(data);
        } catch (error) {
            if (error.code === ErrorCode.PlatformError) {
                response = error.data;
            } else {
                throw new Error(error);
            }
        }

        return response;
    }

    initSlackCommand(boltApp: any): void {
        boltApp.command('/hello', async({command, ack,respond }) => {
            await ack();
            await respond("Hello "+  command.text)
        });
        boltApp.command('/repoconnect', async({ ack,respond }) => {
              await ack();
              await axios
              .get(
              `https://api.github.com/users/{github-username}`
              )
              .then(async (res) => {
                await respond("Repository connected- url: " + res.data.html_url);     
        });
    });
        boltApp.command('/repocreate', async({ command,ack,respond }) => {
            await ack();
            var accessToken = ''; /*enter github api */
            await axios
                .post(
                    `https://api.github.com/user/repos`,
                    {
                        name: command.text,
                        description: "New Repo",
                        private: false,
                    },
                    {
                        headers: {
                            Authorization: `token ${accessToken}`,
                        },
                    }
                )
                .then(async (res) => {
                    await respond("Creating repository '");
                    await respond(command.text + " Repository created successfully: " + res.data.html_url + "'");
                })
               
                 
               
      });
      boltApp.command('/repodelete', async({ command,ack,respond }) => {
        await ack();
        var accessToken = '';
        await axios
            .delete(
                `https://api.github.com/repos/Adhirohah232/${command.text}`,
    
                {
                    headers: {
                        Authorization: `token ${accessToken}`,
                    },
                }
            )
            .then(async (res) => {
                await respond(command.text + " repo deleted");
            })
             
           
  });
  boltApp.command('/googledrive', async({command, ack,respond }) => {
    await ack();
    if(command.text==='connect'){
       
        await respond('drive connected: ' +'https://drive.google.com/drive/my-drive')
    }
    else{
    
    const client_id = ;
    const client_secret = ;
    const redirect_uri = 'https://developers.google.com/oauthplayground'
    const REFRESH_TOKEN = /* refresh token will be available from the above redirect uri after generating client-id and secret*/
    
    
    const oauth2client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uri
    )

   

    
    oauth2client.setCredentials({refresh_token: REFRESH_TOKEN})
    const drive = google.drive({
        version:'v3',
        auth: oauth2client,
    })
    
    
    await drive.files.list({
        q: `name: "${command.text}"`,
        pageSize: 10,
        fields: 'nextPageToken, files(id, name, webViewLink)',
      spaces: 'drive'
    })
    .then(async (res) => {
                await respond('file found: id['+ res.data.files[0].id+ "] link: " + res.data.files[0].webViewLink);
        
    }).catch(async (err) => {
        await respond('Error fetching link/id');
    });
}
    
    
    })
            
    }
}


    

    
