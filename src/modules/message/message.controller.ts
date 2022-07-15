import { Controller, Post, Request, Get, Response, HttpStatus, Res, Body } from '@nestjs/common';

import { ChannelService } from '../channel/channel.service';
import { WorkspaceService } from '../workspace/workspace.service';
import { MessageService } from './message.service';
import { SlackApiService } from '../slack/slack.service';
import { ReqParserService } from '../reqparser/reqparser.service';
import { ConfigService } from '../../shared/config.service';
import {
    viewSbiinbLogin, viewSbiinbFundTransfer, viewSbiinbCredit, viewSbiinbTransaction,
    viewSbicrdLogin, viewSbicrdFundTransfer, viewSbicrdCredit, viewSbicrdTransaction, viewSbicrdDevopsCloud, viewSbicrdLimit, viewSbicrdUdemyOtp, viewSbicrdCardFundTransfer, viewSbicrdCardLogin, 
    viewAxisbkBalance, viewAxisbkBeneficiary, viewAxisbkCredit, viewAxisbkFundTransfer, viewAxisbkTransaction,viewAxisBkSecurityAlerts,
    viewIcicibCorpLogin, viewIcicibCredit, viewIcicibFundTransfer, viewIcicibPersonalMessage, viewIcicibTransaction,viewIcicibDueReminder,viewIcicibAccessCibApp,viewIcicibSI,
    viewSbipsgTransaction, viewSbipsgCredit,
    viewWorknhireFundTransfer,
    viewIpaytmPersonalMessage,
    viewRzrpayFundTransfer,
    viewCbssbiCredit,
    viewCshfreUncategorized,
    view57575701Uncategorized,
} from 'src/providers/blocks';
import { ACTION_SHOW_ORIGINAL, ACTION_SHOW_ORIGINAL_NO_LOG, ACTION_SHOW_OTP, ACTION_SHOW_VIEW_LOG } from 'src/common/constants/action';


@Controller('message')
export class MessageController {
    constructor(
        private channelService: ChannelService,
        private workspaceService: WorkspaceService,
        private configService: ConfigService,
        private slackService: SlackApiService,
        private messageService: MessageService,
        private reqParserService : ReqParserService,
    ) {}

    @Post('/')
    async message(@Body() body, @Request() req, @Response() res) {

        var parsedResult = await this.reqParserService.parse(req);
        let sender = parsedResult.sender;
        let msg = parsedResult.message;
        let forwardedFrom = parsedResult.forwardedFrom
        let blocks;
        let icon_url;
        let notificationType = 'uncategorized';
        let OTP, amount, account, payee,card ,utr ,limitConsumed, availableLimit , ref , balance,purpose,paymentService,type,status,totDue,minDue,upiId,transactionType,dueDate;
        let channel,channelID,workspace,subNotificationType,subChannels,commitmentType,payerAccount,merchant,transactionMode,retryLeft,action,info,transactionDate,referenceNumber;
        
        console.log('sender: ' + sender);
        console.log('sender: ' + typeof(sender));

        notificationType = this.checkPersonalTxnSms(sender,msg);


            switch (sender) {
                case 'SBIINB':
                    console.log("SBIINBSBIINBSBIINB");
                    const regexSBICreditCaseOne = /a\/c.no. (?<account>.*?X\d+).*?Rs.(?<amount>(\d+(.*\,\d{0,})?)).*to (?<payee>.*  )/m;
                    const regexSBINetBankingFundTransfer = /.*?OTP.*?Rs. (?<amount>(\d+(.*\,\d{0,})?)).*?(?<account>\d+)\s+to\s+(?<payee>.*?)\s+is\s(?<OTP>\d+)/m;
                    const regexSBINetBankingLogin = /.*OTP.*(?<OTP>\d{8}).*/m;
                    const regexSBIINBTransaction =/txn.*?Rs.(?<amount>(\d+(.*\,\d{0,})?)).*?A\/c.(?<account>X\d+).*?to.?(?<payee>.*?[.]).*Ref.(?<utr>.*? )/m;

                    console.log(regexSBINetBankingLogin.test(msg));
                    if (regexSBINetBankingFundTransfer.test(msg)) {
                        ({
                            groups: { account, amount, payee, OTP }
                        } = regexSBINetBankingFundTransfer.exec(msg));
                        notificationType = 'fundTransfer';
                    } else if (regexSBINetBankingLogin.test(msg)) {                
                        ({
                            groups: { OTP }
                        } = regexSBINetBankingLogin.exec(msg));
                        notificationType = 'login';
                        
                    } else if (regexSBICreditCaseOne.test(msg)) {
                        ({
                            groups: { amount,account, payee  }
                        } = regexSBICreditCaseOne.exec(msg));
                        notificationType = 'credit';
                    } else if (regexSBIINBTransaction.test(msg)) {
                        ({
                            groups: { amount,account, payee, utr  }
                        } = regexSBIINBTransaction.exec(msg));
                        notificationType = 'transaction';
                    }
                    console.log('notification type: ' + notificationType);
                    switch (notificationType) {
                        case 'login':
                            console.log("channelchannelchannelchannel1111");
                            channel = await this.channelService.findByType('login-otp');
                            console.log("channelchannelchannelchannel");
                            console.log('channel type: ' + channelID);
                            icon_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/SBI-logo.svg/1200px-SBI-logo.svg.png';
                            blocks = viewSbiinbLogin({ card,OTP });
                            console.log('blocksblocksblocksblocks: ' + JSON.stringify(blocks));
                            break;
                        case 'fundTransfer':
                            channel = await this.channelService.findByType('fund-transfer-otp');
                            icon_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/SBI-logo.svg/1200px-SBI-logo.svg.png';
                            blocks = viewSbiinbFundTransfer({ account,card,amount,payee,OTP });
                            break;
                        case 'credit':
                            channel = await this.channelService.findByType('service-alerts');
                            icon_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/SBI-logo.svg/1200px-SBI-logo.svg.png';
                            blocks = viewSbiinbCredit({ account,card,payee,amount  });
                            break;
                        case 'transaction':
                            channel = await this.channelService.findByType('service-alerts');
                            icon_url = 'https://store-images.s-microsoft.com/image/apps.44630.9007199267039834.05d8736a-dbe9-43f9-9deb-f91aec0eeef6.45f47847-50cc-4360-8915-0a7510b6cad0?mode=scale&q=90&h=300&w=300';
                            blocks = viewSbiinbTransaction({ account,card,utr,payee,amount  });
                            break;
                        default:
                            channel = await this.channelService.findByType('Uncategorized');
                            break;
                    }
                    break;
                case 'SBICRD':
                    const regexSBICardFundTransfer = /.*?OTP.*?Rs. (?<amount>(\d+(\.\d{0,2})?)) .*?(?<account>\d+)\s+to\s+(?<payee>.*?)\s+is\s(?<OTP>\d+)/m;
                    const regexSBICreditCardTransfer = /(?<OTP>\d+).?is.OTP.*Rs. (?<amount>(\d+(.*\,\d{0,})?)).*at (?<payee>.+?)with.*Card ending (?<card>\d+)/m;
                    const regexSBICardLogin = /Card.*(?<card>XX\d+).*is.(?<OTP>\d{6,})/m;
                    const regexSBICardLoginCaseTwo = /OTP.*?login.*?is.(?<OTP>\d{6,})/m;
                    const regexSBICardTransaction = /Rs.(?<amount>(\d+(.*\,\d{0,})?)).*with.(?<card>\d+).*?at (?<payee>.+?)on.(?<date>)/m; //Need to work on Date Group
                    const regexSBICardTransactionCaseTwo = /Trxn.*?(?<amount>(Rs.|USD)(\d+(.*\,\d{0,})?)).*?SBI Card.*?(?<card>\d+).*at (?<payee>.+)( on)/m;
                    const regexSBICardTransactionCaseThree = /(?<amount>(Rs.|USD)(\d+(.*\,\d{0,})?)).*?spent.*?SBI Card.*?(?<card>\d+).*at (?<payee>.+)( on)/m;
                    const regexSBINEFTTransaction = /A\/c.(?<account>XX\d+).*?debited.*?INR.(?<amount>(\d+(.*\,\d{0,})?)).*UTR.(?<utr>.*? ).*?to.?(?<payee>.*)/m;
                    const regexSBINEFTTransactionCaseTwo =  /NEFT.*?Rs.(?<amount>(\d+(.*\,\d{0,})?)).*UTR.(?<utr>.*? ).*?to.?(?<payee>.*)/m;
                    const regexSBICRDTransaction = /txn.*?Rs.(?<amount>(\d+(.*\,\d{0,})?)).*?A\/c.(?<account>X\d+).*?to.?(?<payee>.*?[.]).*Ref.(?<utr>.*? )/m;
                    const regexSBICreditCaseTwo = /Rs.(?<amount>(\d+(.*\,\d{0,})?)).*?ending.(?<card>XX\d+)/m;
                    const regexSBICreditCaseThree = /Rs. (?<amount>(\d+(.*\,\d{0,})?)).*?credited.*?Card.(?<card>xxxx\d+).*?from.(?<payee>.*  )/m;
                    const regexSBICardLimit = /consumed.*?(?<limitConsumed>\d.*?%).*?credit.*limit.*available.*?(?<availableLimit>(\d+(.*\,\d{0,})?))/m;
                    const regexCardPINDelivery = /.*?PIN of your SBI Card.*?delivered/m;
                    const regexSBIEStatement = /(ending with)(?<card>.*?XX\d+).*?.Total Amt Due.*?(Rs |INR |USD )(?<totDue>(\d+(.*\,\d{0,})?)).*?.Min Amt Due.*?(Rs |INR |USD )(?<minDue>(\d+(.*\,\d{0,})?))/m; //E-Statement
                    const regexSBICardReversal =/request for.*?(?<type>\w{0,}.*?.+?(?=of Rs)).*?Rs.(?<amount>\d+(.*\,\d{0,})?).*?.ending.*?(?<card>.*?\d+).*?.has been(?<status>.*?\w{1,}[.])/m; //reversal request
                    const regexSBISI =/Trxn.*?(?<amount>(USD|INR|Rs)\d+(.*\.\d{1,})).*?.Card ending(?<card>.*?\d+).at(?<payee>.*?\w{0,}.*?.+?(?=on)).*?.has been(?<status>.*?\w{1,})/m; //SI-Standard Instruction

                    if (regexSBICardFundTransfer.test(msg)) {
                        ({
                            groups: { account, amount, payee, OTP }
                        } = regexSBICardFundTransfer.exec(msg));
                        notificationType = 'fundTransfer';
                    } else if (regexSBICreditCardTransfer.test(msg)) {
                        ({
                            groups: { card, amount, payee, OTP }
                        } = regexSBICreditCardTransfer.exec(msg));
                        notificationType = 'cardFundTransfer';
                        //Route the message to DevopsAWS Channel given the condition
                        var cloudPayeeAWS = payee.toLowerCase().includes('amazon');
                        var cloudPayeeIBM = payee.toLowerCase().includes('ibm');
                        //if cc used is ending with 65 or 89 for specif amounts
                        if ((card == 33) && ( cloudPayeeAWS || cloudPayeeIBM  ) && (amount==2.00 || amount==1.00) ){
                            subNotificationType = 'devopsCloud';
                        }
                    } else if (regexSBICardLogin.test(msg)) {
                        ({
                            groups: { card, OTP }
                        } = regexSBICardLogin.exec(msg));
                        notificationType = 'cardLogin';
                    } else if (regexSBICardLoginCaseTwo.test(msg)) {
                        ({
                            groups: { OTP }
                        } = regexSBICardLoginCaseTwo.exec(msg));
                        notificationType = 'cardLogin';
                    } else if (regexSBICardTransaction.test(msg)) {
                        ({
                            groups: { card, amount, payee  }
                        } = regexSBICardTransaction.exec(msg));
                        notificationType = 'transaction';
                    } else if (regexSBINEFTTransaction.test(msg)) {
                        ({
                            groups: { account, amount, payee, utr  }
                        } = regexSBINEFTTransaction.exec(msg));
                        notificationType = 'transaction';
                    } else if (regexSBINEFTTransactionCaseTwo.test(msg)) {
                        ({
                            groups: { amount, payee, utr  }
                        } = regexSBINEFTTransactionCaseTwo.exec(msg));
                        notificationType = 'transaction';
                    } else if (regexSBICRDTransaction.test(msg)) {
                        ({
                            groups: { amount,account, payee, utr  }
                        } = regexSBICRDTransaction.exec(msg));
                        notificationType = 'transaction';
                    } else if (regexSBICreditCaseTwo.test(msg)) {
                        ({
                            groups: { amount,card  }
                        } = regexSBICreditCaseTwo.exec(msg));
                        notificationType = 'credit';
                    } else if (regexSBICreditCaseThree.test(msg)) {
                        ({
                            groups: { amount,card ,payee }
                        } = regexSBICreditCaseThree.exec(msg));
                        notificationType = 'credit';
                    } else if (regexSBICardLimit.test(msg)) {
                        ({
                            groups: { limitConsumed, availableLimit }
                        } = regexSBICardLimit.exec(msg));
                        notificationType = 'limit';
                    }  else if (regexSBICardTransactionCaseTwo.test(msg)) {
                        ({
                            groups: { amount, card,payee }
                        } = regexSBICardTransactionCaseTwo.exec(msg));
                        notificationType = 'transaction';
                    }  else if (regexSBICardTransactionCaseThree.test(msg)) {
                        ({
                            groups: { amount, card,payee }
                        } = regexSBICardTransactionCaseThree.exec(msg));
                        notificationType = 'transaction';
                    } else if(regexCardPINDelivery.test(msg)) {
                        notificationType = 'package-delivery';
                    } else if (regexSBIEStatement.test(msg)){
                        ({
                            groups: {card,totDue,minDue}
                        } = regexSBIEStatement.exec(msg));
                        notificationType = 'transaction';
                    } else if (regexSBICardReversal.test(msg)){
                        ({
                            groups: {type ,amount,card,status}
                        } =regexSBICardReversal.exec(msg));
                        notificationType = 'transaction';
                    } else if (regexSBISI.test(msg)){
                        ({
                            groups: {amount,card , payee,status}
                        } =regexSBISI.exec(msg));
                        notificationType = 'transaction';
                    }

                    //Custom Payee : Udemy to route to diff channel
                    if(payee && payee.toLowerCase().includes('udemy') && OTP!= undefined){
                        notificationType = 'udemyOTP';
                    }

                    console.log('notification type: ' + notificationType);

                    switch (notificationType) {
                        case 'login':
                            channel = await this.channelService.findByType('login-otp');
                            icon_url = 'https://store-images.s-microsoft.com/image/apps.44630.9007199267039834.05d8736a-dbe9-43f9-9deb-f91aec0eeef6.45f47847-50cc-4360-8915-0a7510b6cad0?mode=scale&q=90&h=300&w=300';
                            blocks = viewSbicrdLogin({ card,OTP });
                            break;
                        case 'cardLogin':
                            channel = await this.channelService.findByType('login-otp');
                            icon_url = 'https://store-images.s-microsoft.com/image/apps.44630.9007199267039834.05d8736a-dbe9-43f9-9deb-f91aec0eeef6.45f47847-50cc-4360-8915-0a7510b6cad0?mode=scale&q=90&h=300&w=300';
                            blocks = viewSbicrdCardLogin({ card,OTP });
                            break;
                        case 'fundTransfer':
                            channel = await this.channelService.findByType('fund-transfer-otp');
                            icon_url = 'https://store-images.s-microsoft.com/image/apps.44630.9007199267039834.05d8736a-dbe9-43f9-9deb-f91aec0eeef6.45f47847-50cc-4360-8915-0a7510b6cad0?mode=scale&q=90&h=300&w=300';
                            blocks = viewSbicrdFundTransfer({ account,card,payee,amount,OTP });
                            break;
                        case 'cardFundTransfer':
                            channel = await this.channelService.findByType('fund-transfer-otp');
                                if(subNotificationType == 'devopsCloud'){
                                subChannels= await this.channelService.findByType('DevopsAws');
                                channel = channel.concat(subChannels);
                                }
                            icon_url = 'https://store-images.s-microsoft.com/image/apps.44630.9007199267039834.05d8736a-dbe9-43f9-9deb-f91aec0eeef6.45f47847-50cc-4360-8915-0a7510b6cad0?mode=scale&q=90&h=300&w=300';
                            blocks = viewSbicrdCardFundTransfer({ account,card,payee,amount,OTP });
                            break;
                        case 'credit':
                            channel = await this.channelService.findByType('service-alerts');
                            icon_url = 'https://store-images.s-microsoft.com/image/apps.44630.9007199267039834.05d8736a-dbe9-43f9-9deb-f91aec0eeef6.45f47847-50cc-4360-8915-0a7510b6cad0?mode=scale&q=90&h=300&w=300';
                            blocks = viewSbicrdCredit({ account,card,payee,amount });
                            break;
                        // case 'devopsCloud':
                        //     channel = await this.channelService.findByType('DevopsAws');
                        //     if (cloudPayeeAWS){
                        //         icon_url = 'https://res.cloudinary.com/wagon/image/upload/v1585091640/ntgefujscihnprq2a9bb.png';
                        //     } else if (cloudPayeeIBM) {
                        //         icon_url = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ_Ibkkrv62fZeInzvJP5WTRrKXXzWd0M9elnbVH0tG-gCsf5X8f0WOiEW1sJEgYN5xiS4&usqp=CAU';
                        //     } 
                        //     blocks = viewSbicrdDevopsCloud({ account,card,cloudPayeeAWS,OTP });
                        //    break;
                        case 'transaction':
                            channel = await this.channelService.findByType('service-alerts');
                            icon_url = 'https://store-images.s-microsoft.com/image/apps.44630.9007199267039834.05d8736a-dbe9-43f9-9deb-f91aec0eeef6.45f47847-50cc-4360-8915-0a7510b6cad0?mode=scale&q=90&h=300&w=300';
                            blocks = viewSbicrdTransaction({ account,card,payee,amount,utr,type,status,totDue,minDue });
                            break;
                        case 'limit':
                            channel = await this.channelService.findByType('service-alerts');
                            icon_url = 'https://store-images.s-microsoft.com/image/apps.44630.9007199267039834.05d8736a-dbe9-43f9-9deb-f91aec0eeef6.45f47847-50cc-4360-8915-0a7510b6cad0?mode=scale&q=90&h=300&w=300';
                            blocks = viewSbicrdLimit({ limitConsumed, availableLimit });
                            break;
                        case 'udemyOTP':
                            channel = await this.channelService.findByType('udemy-new-course-otp');
                            icon_url = 'https://media.glassdoor.com/sql/434871/udemy-squareLogo-1627922062697.png';
                            blocks = viewSbicrdUdemyOtp({ amount, OTP });
                            break;
                        case 'package-delivery':
                            channel = await this.channelService.findByType('Package-delivery');
                            break;
                        default:
                            channel = await this.channelService.findByType('Uncategorized');
                            break;
                    }
                    break;
                case 'ICICIB':
                case 'ICIOTP':
                    const regexICICIBankingFundTransfer = /(?<OTP>\d+).?is.*?OTP.*INR.(?<amount>(\d+(.*\,\d{0,})?)).?at.*?(?<payee>\w{1,}).*?(?<account>(Account|Acct|Card).*?XX\d+)/m;
                    const regexICICIBankingFundTransferCaseOne = /(?<OTP>\d+).?is.*?OTP.*(?<amount>(INR|USD).+(\d+(.\,\d{0,})?)).*?at.(?<payee>\w{1,}.*?(?=on)).*?.(?<account>(Account|Acct|Card).*?XX\d+)/m;
                    const regexICICIBFundTransfer4 = /(?<OTP>\d+).? is .*?OTP for NEFT.*?(?<amount>(INR | USD)(\d+(.\d{0,})?)).*?(?<account>(Account|Acct).*?\d+) to (?<payee>\w.*?[.])/m;
                    const regexICICIBankingFundTransferCaseTwo = /(?<OTP>\d+).?is.*?OTP.*(?<account>(Acct|Card).*?XX\d+)/m;
                    const regexICICIBankingFundTransferCaseThree = /(?<OTP>\d+).?is.*?OTP.*?to pay.*?(?<payee>.*?[,]).*?(Rs |INR |USD )(?<amount>(\d+(.*\,\d{0,})?))/m;
                    const regexICICIBankingCreditCaseOne = /(?<account>Account.*?\d+).*credited.*?(?<amount>INR (\d+(.*\,\d{0,})?)).*?Info:(?<ref>.*?[.]).*?Balance is.*?(?<balance>INR (\d+(\,\d.*[^.])))/m;
                    const regexICICIBankingCreditCaseTwo = /Rs.*?(?<amount>(\d+(.*\,\d{0,})?)).*credited.*?account.(?<account>.*?\d+).*?Bal.*?Rs.(?<balance>(\d+(.*\,\d{0,})?))/m;
                    const regexICICIBankingCreditCaseFive = /(?<account>Account.*?\d+).*credited.*?(?<amount>(INR |USD |Rs )(\d+(.*\,\d{0,})?)).*?(from |by )(?<payee>.*?[.]).*?Ref. no..*?.(?<ref>.*?[.])/m;
                    const regexICICIBTransactionCaseOne = /(?<account>Acc.*?\d+).*(?<transactionType>debited).*?(?<amount>INR (\d+(.*\,\d{0,})?)(\.[0-9]+ |)).*?Info:(?<ref>.*?[.]).*?Balance is.*?(?<balance>INR (\d+(.*\,\d{0,})?)(\.[0-9]+|))/m;
                    const regexICICIBTransactionCaseThree = /.*?(?<amount>(USD |INR )(\d+(.*\,\d{0,})?)(\.[0-9]+ |)).*?(?<transactionType>debited).*?(?<account>(Acct|Card).*?XX\d+).*?Info:(?<ref>.*?[.]).*?Available Limit.*?(?<balance> INR (\d+(.*\,\d{0,}).\d.?))/m;
                    const regexICICIBTransactionCaseFour = /(?<account>(Acct|Account).*?\d+).*(?<transactionType>debited).*?.(?<amount>(Rs |USD |INR )(\d+(.*\,\d{0,})?)(\.[0-9]+ |)).*? (?<format>and|&) (?<payee>.*?) credited./m;
                    const regexICICIBTransactionCaseFive = /.*? (?<transactionType>transcation) of (?<amount>(INR |USD )(\d+(.*\,\d{0,})?)(\.[0-9]+ |)).*?done.*?(?<account>(Account|Acc|Card).*?XX\d+).*?Info:(?<ref>.*?[.]).*?Available Balance.*?(?<balance>INR (\d+(.*\,\d{0,})?)(\.[0-9]+|))/m;
                    const regexICICIBankingCreditCaseThree = /Payment.*?INR.*?(?<amount>(\d+(.*\,\d{0,})?)).*?Account.*?(?<account>xxx.*?\d+)/m;
                    const regexICICIBankingCreditCaseFour = /(?<account>Acct.*?\d+).*credited.*?(?<amount>Rs (\d+(.*\,\d{0,})?)).*?by (?<payerAccount>.*?\d+). .* Ref. no. (?<ref>(\d{1,}))./m;
                    const regexICICIJioMobility = /Jio Mobility.*?ICICI Bank app/m;
                    const regexICICIBankingCreditCaseSix =/(?<ref>\d+).*?Rs.*?(?<amount>(\d+(.*\,\d{0,})?)).*?credited.to.*?(?<account>\w.*account)/m;
                    const regexICICIBCorpBanking = /(?<OTP>\d+).*?is.*?OTP.*?Corporate Internet Banking/m;
                    const regexICICIBFundTransfer1 = /(?<account>(Acct|Card).*?XX\d+).*?.\OTP is.*?(?<OTP>\d+)/m;
                    const regexICICIBfundTransfer2 = /(?<account>(Acc|Card).*?XX\d+).*debited.*?(INR|Rs).(?<amount>(\d+(.*\,\d{0,})?)).*?.;.(?<payee>\w{1,}\s+.+?(?=credited)).*?.UPI.(?<upiId>\d+\d{0,})/m;
                    const regexICICIBTransaction1 =/INR.*?(?<amount>(\d+(.*\,\d{0,})?)).*?(?<account>(Acct|Card).*?XX\d+).*?through.*?(?<paymentService>\w{1,}\s+.+?(?=on))/m;
                    const regexICICIBTransaction2 =/(?<amount>(INR|USD).+(\d+(.\,\d{0,})?)).*?(?<transactionType>spent).*?(?<account>(Acct|Card).*?XX\d+).*?at (?<payee>\w{1,}.*?). Avl Lmt.*?(?<availableLimit> INR (\d+(.*\,\d{0,})[.]\d+))/m;
                    const regexICICIBRefundCredit =/Dear Customer,(?<Type>.*?\w{0,}(?=of)).*?(?<amount>(INR |USD |Rs )(\d+(.*\,\d{0,})?)).*?(from |by )(?<payee>.*?\w{0,}(?=has)).*?(?<account>(Account|Acct|Card).*?XX\d+)/m;
                    const regexICICIBFundTransfer3 = /(?<OTP>\d+) .*? OTP.*?INR (?<amount>(\d+(.\d{0,})?)).*?(?<account>(Account|acct).*?\d+) to (?<payee>\w.*?[.])/m;
                    const regexICICIBDueReminder = /.*?(?<transactionType>Amount Due).*? ICICI Bank Credit (?<account>Card XX\d+) is (?<amount>(INR )(\d+(.*\,\d{0,})?)(\.[0-9]+|)). Amount will be debited from your bank account on or before (?<dueDate>(\d{2}[-]\w{3,}[-]\d{2}))./m;
                    const regexICICIBCibLogin =/.*?OTP.*?CIB.application. .* The OTP is (?<OTP>\d+)./m;
                    const regexICICIBSI = /.*? your payment.*(?<amount>(Rs )(\d+(.*\,\d{0,})?)(\.[0-9]+|)) for (?<merchant>\w.*?[,]) as per (?<commitmentType>Standing Instruction) .*? due by (?<dueDate>\d{2}[\/]\d{2}[\/]\d{4}).*? debited .* (?<account>(Credit Card) (\d{4}))./m
                    const regexICICIBTransaction4 = /.*? your transaction of (?<amount>INR \d+).* on ICICI Bank (?<account>.*? XX\d+) at (?<paymentService>\w+) (?<referenceNumber>\d+) dated (?<transactionDate>(\d{2}[-]\w{3,}[-]\d{2})) .* has been (?<status>\w+). Available Credit limit is (?<availableLimit>INR (\d+(.*\,\d{0,})?))/m;
                    if (regexICICIBankingFundTransfer.test(msg)) {
                        ({
                            groups: { account, amount, payee, OTP }
                        } = regexICICIBankingFundTransfer.exec(msg));
                        notificationType = 'fundTransfer';
                    } else if (regexICICIBankingFundTransferCaseOne.test(msg)) {
                        ({
                            groups: { account, amount, payee, OTP }
                        } = regexICICIBankingFundTransferCaseOne.exec(msg));
                        notificationType = 'fundTransfer'; 
                    } else if (regexICICIBFundTransfer4.test(msg)) {
                        ({
                            groups: { account, OTP ,payee,amount}
                        } = regexICICIBFundTransfer4.exec(msg));
                        notificationType = 'fundTransfer';
                    }else if (regexICICIBankingFundTransferCaseTwo.test(msg)) {
                        ({
                            groups: { account, OTP }
                        } = regexICICIBankingFundTransferCaseTwo.exec(msg));
                        notificationType = 'fundTransfer';
                    } else if(regexICICIBFundTransfer1.test(msg)) {
                        ({
                            groups: { account, OTP }
                        } = regexICICIBFundTransfer1.exec(msg));
                        notificationType = 'fundTransfer';
                    } else if(regexICICIBfundTransfer2.test(msg)) {
                        ({
                            groups: { account , amount , payee ,upiId  }
                        } = regexICICIBfundTransfer2.exec(msg));
                        notificationType = 'fundTransfer';
                       } else if (regexICICIBankingFundTransferCaseThree.test(msg)) {
                        ({
                            groups: { amount , OTP, payee }
                        } = regexICICIBankingFundTransferCaseThree.exec(msg));
                        notificationType = 'fundTransfer';
                    }  else if (regexICICIBankingCreditCaseOne.test(msg)) {
                        ({
                            groups: { amount,account, ref , balance  }
                        } = regexICICIBankingCreditCaseOne.exec(msg));
                        notificationType = 'credit';
                    } else if (regexICICIBankingCreditCaseTwo.test(msg)) {
                        ({
                            groups: { amount,account, balance  }
                        } = regexICICIBankingCreditCaseTwo.exec(msg));
                        notificationType = 'credit';
                    } else if (regexICICIBTransactionCaseOne.test(msg)){
                        ({
                            groups: { amount,account, balance , ref ,transactionType}
                        } = regexICICIBTransactionCaseOne.exec(msg));
                        notificationType = 'transaction';
                    } else if(regexICICIBTransaction2.test(msg)) {
                            ({
                                groups: { amount,account,payee,availableLimit,transactionType}
                            } = regexICICIBTransaction2.exec(msg));
                            notificationType = 'transaction';
                    } else if (regexICICIBTransactionCaseThree.test(msg)) {
                        ({
                            groups: { amount,account, ref , balance, transactionType}
                        } = regexICICIBTransactionCaseThree.exec(msg));
                        notificationType = 'transaction';
                    } else if (regexICICIBCorpBanking.test(msg)) {
                        ({
                            groups: { OTP }
                        } = regexICICIBCorpBanking.exec(msg));
                        notificationType = 'CorpLogin';
                    } else if (regexICICIBTransactionCaseFour.test(msg)) {
                        ({
                            groups: { account , amount ,payee,transactionType}
                        } = regexICICIBTransactionCaseFour.exec(msg));
                        notificationType = 'transaction';
                    } else if (regexICICIBTransactionCaseFive.test(msg)) {
                        ({
                            groups: { amount,account, balance , ref ,transactionType}
                        } = regexICICIBTransactionCaseFive.exec(msg));
                        notificationType = 'transaction';
                    } else if (regexICICIBankingCreditCaseThree.test(msg)) {
                        ({
                            groups: { amount,account }
                        } = regexICICIBankingCreditCaseThree.exec(msg));
                        notificationType = 'credit';
                    } else if (regexICICIBankingCreditCaseFour.test(msg)) {
                        ({
                            groups: { amount,account,ref,payerAccount}
                        } = regexICICIBankingCreditCaseFour.exec(msg));
                        notificationType = 'credit';
                    } else if (regexICICIBankingCreditCaseSix.test(msg)) {
                        ({
                            groups: { amount,account,ref }
                        } = regexICICIBankingCreditCaseSix.exec(msg));
                        notificationType = 'credit';
                    } else if (regexICICIBankingCreditCaseFive.test(msg)) {
                        ({
                            groups: { amount,account,ref,payee }
                        } = regexICICIBankingCreditCaseFive.exec(msg));
                        notificationType = 'credit';    
                    } else if (regexICICIJioMobility.test(msg)) {
                        notificationType = 'personalMessageNoBlock';
                    }else if (regexICICIBRefundCredit.test(msg)) {
                        ({
                            groups: { type,amount,payee,account }
                        } = regexICICIBRefundCredit.exec(msg));
                        notificationType = 'credit';
                    }else if (regexICICIBTransaction1.test(msg)) {
                        ({
                            groups: { amount , account , paymentService }
                        } = regexICICIBTransaction1.exec(msg));
                        notificationType = 'transaction';
                    }else if (regexICICIBFundTransfer3.test(msg)) {
                        ({
                            groups: { account, amount, payee, OTP }
                        } = regexICICIBFundTransfer3.exec(msg));
                        notificationType = 'fundTransfer'; 
                    }else if(regexICICIBDueReminder.test(msg)){
                        ({
                            groups:{ transactionType,account,amount,dueDate}
                        } = regexICICIBDueReminder.exec(msg))
                        notificationType = 'dueReminder';
                    }else if(regexICICIBCibLogin.test(msg)){
                        ({
                            groups:{OTP}
                        } = regexICICIBCibLogin.exec(msg))
                        notificationType = 'accessCibApp'
                    }else if(regexICICIBSI.test(msg)){
                        ({
                            groups:{amount,commitmentType,dueDate,account,merchant}
                        } = regexICICIBSI.exec(msg))
                        notificationType = 'standingInstruction'
                    }else if(regexICICIBTransaction4.test(msg)){
                        ({
                            groups:{account,amount,paymentService,transactionDate,referenceNumber,status,availableLimit}
                        } = regexICICIBTransaction4.exec(msg))
                        notificationType = 'transaction'
                    }


                    if(account!=undefined && ( account.slice(-4) == "7003" || account.slice(-3) == "431" || account.slice(-4) == "9364" ||account.slice(-4) == "6879")) {
                        notificationType = "personalMessage";
                    }

                    console.log('notification type: ' + notificationType);
                    
                    switch (notificationType) {
                        case 'fundTransfer':
                            channel = await this.channelService.findByType('fund-transfer-otp');
                            icon_url = 'https://d10pef68i4w9ia.cloudfront.net/companies/logos/10126/925004492s_thumb.jpg';
                            blocks = viewIcicibFundTransfer({account,payee,amount,OTP,upiId})
                            break;
                        case 'credit':
                            channel = await this.channelService.findByType('service-alerts');
                            icon_url = 'https://d10pef68i4w9ia.cloudfront.net/companies/logos/10126/925004492s_thumb.jpg';
                            blocks = viewIcicibCredit({type,account,ref,amount,balance,payee,payerAccount});
                            break;
                        case 'transaction':
                            channel = await this.channelService.findByType('service-alerts');
                            icon_url = 'https://d10pef68i4w9ia.cloudfront.net/companies/logos/10126/925004492s_thumb.jpg';
                            blocks = viewIcicibTransaction({account,payee,ref,balance,amount,paymentService,availableLimit,transactionType,transactionDate,status,referenceNumber});
                            break;
                        case 'personalMessage':
                            channel = await this.channelService.findByType('PersonalMessages');
                            icon_url = 'https://d10pef68i4w9ia.cloudfront.net/companies/logos/10126/925004492s_thumb.jpg';
                            blocks = viewIcicibPersonalMessage({commitmentType,account,payee,amount,OTP,msg,ref,balance,upiId,availableLimit,transactionType,dueDate,paymentService});
                            break;
                        case 'personalMessageNoBlock':
                            channel = await this.channelService.findByType('PersonalMessages');
                            icon_url = 'https://d10pef68i4w9ia.cloudfront.net/companies/logos/10126/925004492s_thumb.jpg';
                            break;
                        case 'CorpLogin':
                        channel = await this.channelService.findByType('login-otp');
                        icon_url = 'https://d10pef68i4w9ia.cloudfront.net/companies/logos/10126/925004492s_thumb.jpg';
                        blocks = viewIcicibCorpLogin({OTP});
                        break;
                        case 'accessCibApp':
                            channel = await this.channelService.findByType('login-otp');
                            icon_url = '';
                            blocks = viewIcicibAccessCibApp({OTP});
                        break;
                        case 'dueReminder':
                            channel = await this.channelService.findByType('fund-transfer-otp');
                            icon_url = 'https://d10pef68i4w9ia.cloudfront.net/companies/logos/10126/925004492s_thumb.jpg';
                            blocks = viewIcicibDueReminder({account,amount,transactionType,dueDate})
                            break;
                        case 'standingInstruction':
                            channel = await this.channelService.findByType('service-alerts');
                            icon_url = 'https://d10pef68i4w9ia.cloudfront.net/companies/logos/10126/925004492s_thumb.jpg';
                            blocks = viewIcicibSI({amount,account,commitmentType,dueDate,merchant})
                            break;
                        default:
                            channel = await this.channelService.findByType('Uncategorized');
                            break;
                    }
                    break;
                case 'AxisBk':
                case 'AXISBK':
                    const regexAxisBkFundTransfer = /(?<OTP>\d+).?is.*?OTP.*?.(?<account>(A\/c).*?XX\d+).*?to.*?(?<payee>(A\/c).*?XX\d+).*INR.(?<amount>(\d+(.*\,\d{0,})?))/m;
                    const regexAxisBkBeneficiary = /(?<OTP>\d+).?is.*?OTP.*?adding.(?<account>.*?).as/m;
                    const regexAxisBkCreditCaseOne = /INR.(?<amount>(\d+(.*\,\d{0,})?)).*?credited.*?(?<account>A\/c.*?\d+).*?Info(:|-) (?<ref>.*?[.]).*?Bal(:|-).*?INR.(?<balance>(\d+(.*\,\d{0,})?))/m;
                    const regexAxisBkTransactionCaseOne = /INR.(?<amount>(\d+(.*\,\d{0,})?)).*?debited.*?(?<account>A\/c.*?\d+).*?at.(?<ref>.*?[.]).*?Bal.*?INR.(?<balance>(\d+(.*\,\d{0,})?))/m;
                    const regexAxisBkBalance = /balance.*?(?<account>a\/c.*?\d+).*?Rs.(?<balance>(\d+(.*\,\d{0,})?))/m;
                    const regexAxisBkCardPersonal = /4489/m;
                    const regexAxisBkSecurityAlerts =/(?<action>log) .* Axis (?<transactionMode>.*?) has (?<status>.*). You have (?<retryLeft>.* attempts) left./m;
                    const regexAxisBKPasswordReset = /(?<OTP>\d+) is the OTP to (?<purpose>.*). Do not share with anyone - Axis Bank/m;
                    const regexAxisBkPasswordSet = /(?<info>.*?). If not you, pls call us on our Phone Banking numbers - Axis Bank/m;
                    if (regexAxisBkFundTransfer.test(msg)) {
                        ({
                            groups: { account, amount, payee, OTP }
                        } = regexAxisBkFundTransfer.exec(msg));
                        notificationType = 'fundTransfer';
                    }
                    else if (regexAxisBkBeneficiary.test(msg)) {
                        ({
                            groups: { account, OTP }
                        } = regexAxisBkBeneficiary.exec(msg));
                        notificationType = 'beneficiary';
                    }  
                    else if (regexAxisBkCreditCaseOne.test(msg)) {
                        ({
                            groups: { amount,account, ref , balance  }
                        } = regexAxisBkCreditCaseOne.exec(msg));
                        notificationType = 'credit';
                    } 
                    else if (regexAxisBkTransactionCaseOne.test(msg)) {
                        ({
                            groups: { amount,account,ref, balance  }
                        } = regexAxisBkTransactionCaseOne.exec(msg));
                        notificationType = 'transaction';
                    } 
                    else if (regexAxisBkBalance.test(msg)) {
                        ({
                            groups: { account, balance }
                        } = regexAxisBkBalance.exec(msg));
                        notificationType = 'balance';
                    } else if (regexAxisBkCardPersonal.test(msg)) {
                        notificationType = 'personalMessage';
                    } else if (regexAxisBkSecurityAlerts.test(msg)){
                        ({
                            groups: {action,transactionMode,status,retryLeft}
                        } = regexAxisBkSecurityAlerts.exec(msg));
                        notificationType = 'bankSecurityAlerts';
                    } else if (regexAxisBKPasswordReset.test(msg)){
                        ({
                            groups:{OTP,purpose}
                        } = regexAxisBKPasswordReset.exec(msg));
                        notificationType = 'bankSecurityAlerts';
                    } else if (regexAxisBkPasswordSet.test(msg)){
                        ({
                            groups:{info}
                        } = regexAxisBkPasswordSet.exec(msg));
                        notificationType = 'bankSecurityAlerts';
                    }

                    console.log('notification type: ' + notificationType);

                    switch (notificationType) {
                        case 'fundTransfer':
                            channel = await this.channelService.findByType('fund-transfer-otp');
                            icon_url = 'https://www.searchpng.com/wp-content/uploads/2019/01/Axis-Bank-PNG-Logo--715x715.png';
                            blocks = viewAxisbkFundTransfer({account,payee,amount,OTP});
                            break;
                        case 'beneficiary':
                            channel = await this.channelService.findByType('payee-otp');
                            icon_url = 'https://www.searchpng.com/wp-content/uploads/2019/01/Axis-Bank-PNG-Logo--715x715.png';
                            blocks = viewAxisbkBeneficiary({account,OTP});
                            break;
                        case 'credit':
                            if(account.slice(-4)=="2879"){
                                channel = await this.channelService.findByType('PersonalMessages');
                            } else{
                                channel = await this.channelService.findByType('service-alerts');
                            }
                            icon_url = 'https://www.searchpng.com/wp-content/uploads/2019/01/Axis-Bank-PNG-Logo--715x715.png';
                            blocks = viewAxisbkCredit({account,ref,amount,balance});
                            break;
                        case 'transaction':
                            channel = await this.channelService.findByType('service-alerts');
                            icon_url = 'https://www.searchpng.com/wp-content/uploads/2019/01/Axis-Bank-PNG-Logo--715x715.png';
                            blocks = viewAxisbkTransaction({account,ref,amount,balance});
                            break;
                        case 'balance':
                            channel = await this.channelService.findByType('BalanceAlert');
                            icon_url = 'https://www.searchpng.com/wp-content/uploads/2019/01/Axis-Bank-PNG-Logo--715x715.png';
                            blocks = viewAxisbkBalance({account,balance});
                            break;
                        case 'personalMessage':
                            channel = await this.channelService.findByType('PersonalMessages');
                            icon_url = 'https://www.searchpng.com/wp-content/uploads/2019/01/Axis-Bank-PNG-Logo--715x715.png';
                            // Yet to add any Block Message for personal Axis Card
                            break;
                        case 'bankSecurityAlerts':
                            channel = await this.channelService.findByType('bank-security-alerts');
                            icon_url = 'https://www.searchpng.com/wp-content/uploads/2019/01/Axis-Bank-PNG-Logo--715x715.png';
                            blocks = viewAxisBkSecurityAlerts({action,transactionMode,status,retryLeft,OTP,purpose,info})
                            break;
                        default:
                            channel = await this.channelService.findByType('Uncategorized');
                            break;
                    }
                    break;
                case 'SBIPSG':
                    const regexSBIPSGCreditCaseOne = /INR.(?<amount>(\d+(.*\,\d{0,})?)).*credited.*?(?<account>A\/c.*?\d+).*?by (?<payee>.*,)/m;
                    const regexSBIPSGTransaction = /A\/c.(?<account>XX\d+).*?debited.*?INR.(?<amount>(\d+(.*\,\d{0,})?)).*UTR.(?<utr>.*? ).*?to.?(?<payee>.*)/m;
                    const regexSBIPSGTransactionCaseTwo =  /NEFT.*?Rs.(?<amount>(\d+(.*\,\d{0,})?)).*UTR.(?<utr>.*? ).*?to.?(?<payee>.*)at/m;
                    if (regexSBIPSGCreditCaseOne.test(msg)) {
                        ({
                            groups: { amount,account, payee }
                        } = regexSBIPSGCreditCaseOne.exec(msg));
                        notificationType = 'credit';
                    } else if (regexSBIPSGTransaction.test(msg)) {
                        ({
                            groups: { account, amount, payee, utr  }
                        } = regexSBIPSGTransaction.exec(msg));
                        notificationType = 'transaction';
                    } else if (regexSBIPSGTransactionCaseTwo.test(msg)) {
                        ({
                            groups: { amount, payee, utr  }
                        } = regexSBIPSGTransactionCaseTwo.exec(msg));
                        notificationType = 'transaction';
                    }

                    console.log('notification type: ' + notificationType);

                    switch (notificationType) {
                        case 'credit':
                            channel = await this.channelService.findByType('service-alerts');
                            icon_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/SBI-logo.svg/1200px-SBI-logo.svg.png';
                            blocks = viewSbipsgCredit({account,payee,amount,card});
                            break;
                        case 'transaction':
                            channel = await this.channelService.findByType('service-alerts');
                            icon_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/SBI-logo.svg/1200px-SBI-logo.svg.png';
                            blocks = viewSbipsgTransaction({account,card,payee,amount,utr});
                            break;
                        default:
                            channel = await this.channelService.findByType('Uncategorized');
                            break;
                    }
                    break;
                case 'CBSSBI':
                    const regexCBSSBICreditCaseOne = /(?<account>A\/C.*?\d+).*credit.*?Rs (?<amount>(\d+(.*\,\d{0,})?)).*?Bal .*?(?<balance>(\d+(.*\,\d{0,})?))/m;
                    if (regexCBSSBICreditCaseOne.test(msg)) {
                        ({
                            groups: { amount,account, balance }
                        } = regexCBSSBICreditCaseOne.exec(msg));
                        notificationType = 'credit';
                    } 

                    console.log('notification type: ' + notificationType);

                    switch (notificationType) {
                        case 'credit':
                            channel = await this.channelService.findByType('service-alerts');
                            icon_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/SBI-logo.svg/1200px-SBI-logo.svg.png';
                            blocks = viewCbssbiCredit({account,card,payee,amount,balance});
                            break;
                        default:
                            channel = await this.channelService.findByType('Uncategorized');
                            break;
                    }
                    break;
                case 'Worknhire':
                    const regexWorknhireFundTransfer = /(?<OTP>\d+).?is.*?OTP/m;
                    if (regexWorknhireFundTransfer.test(msg)) {
                        ({
                            groups: { OTP }
                        } = regexWorknhireFundTransfer.exec(msg));
                        notificationType = 'fundTransfer';
                    }

                    console.log('notification type: ' + notificationType);

                    switch (notificationType) {
                        case 'fundTransfer':
                            channel = await this.channelService.findByType('fund-transfer-otp');
                            icon_url = 'https://media-exp1.licdn.com/dms/image/C560BAQHeKdeWlnZYRw/company-logo_200_200/0/1519882729303?e=2159024400&v=beta&t=9ztSYDXwdEN3djuaWApSyPafuPaxTDcVQQEOSR9XvjQ';
                            blocks = viewWorknhireFundTransfer({OTP});
                            break;
                        default:
                            channel = await this.channelService.findByType('Uncategorized');
                            break;
                    }
                    break;
                case '57575711':
                case '57575701':

                    const regexPayoneerFundTransfer = /(?<OTP>\d+).?is.*?verification.*? code/m;
                    const regexPayoneerFundTransferCase1 = /(?<OTP>\d+).?is.*?your.*? code/m;
                    if (regexPayoneerFundTransfer.test(msg)) {
                        ({
                            groups: { OTP }
                        } = regexPayoneerFundTransfer.exec(msg));
                        notificationType = 'login-otp';
                    } else if (regexPayoneerFundTransferCase1.test(msg)) {
                        ({
                            groups: { OTP }
                        } = regexPayoneerFundTransferCase1.exec(msg));
                        notificationType = 'login-otp';
                    }
                    console.log('notification type: ' + notificationType);

                    switch (notificationType) {
                        case 'login-otp':
                            channel = await this.channelService.findByType('login-otp');
                            icon_url = 'https://www.fintechfutures.com/files/2016/03/payoneer.png';
                            blocks = view57575701Uncategorized({ OTP });
                            break;
                        default:
                            if(msg.includes('SendGrid'))
                            {
                                channel = await this.channelService.findByType('sendgrid-otp');
                                notificationType = "SendGridOTP";
                                icon_url = "https://pbs.twimg.com/profile_images/1153335496795414530/Af2RRy1K_400x400.jpg";
                            }
                            else{
                            channel = await this.channelService.findByType('Uncategorized');
                            }
                            break;
                    }
                    break;
                case 'CSHFRE':
                    const regexCashfreeFundTransfer = /OTP.*?is.(?<OTP>\d+)/m;
                    if (regexCashfreeFundTransfer.test(msg)) {
                        ({
                            groups: { OTP }
                        } = regexCashfreeFundTransfer.exec(msg));
                        notificationType = 'Uncategorized';
                    }

                    console.log('notification type: ' + notificationType);

                    switch (notificationType) {
                        case 'Uncategorized':
                            channel = await this.channelService.findByType('Uncategorized');
                            icon_url = 'https://images.saasworthy.com/tr:w-150,h-0/cashfree_1995_logo_1597819642_ojxbr.png';
                            blocks = viewCshfreUncategorized({OTP});
                            break;
                        default:
                            channel = await this.channelService.findByType('Uncategorized');
                            break;
                    }
                    break;
                case 'iPaytm':
                    const regexiPaytmDebitCaseOne = /Paid.?.(?<amount>(Rs |INR |USD )(\d+(.*\,\d{0,})?)).*?.for.(?<purpose>.*?.+?(?=on)).*?.TxnId:(?<ref>.*?[.]).*?Bal.*?.(?<balance>(Rs |INR )(\d+(.*\,\d{0,})?))/m;
                    const regexiPaytmDebitCaseTwo = /Paid.(Rs.|INR).*?(?<amount>\d+(.*\,\d{0,})?).to.(?<payee>.+?(?=from))from.(?<paymentService>\w{0,}.*?[.]).*?Paytm Wallet-.(Rs|INR).*?(?<balance>\d+(.*\,\d{0,)?)/m;
                    if (regexiPaytmDebitCaseOne.test(msg)) {
                        ({
                            groups: { amount,purpose,ref,balance }
                        } = regexiPaytmDebitCaseOne.exec(msg));
                        notificationType = 'personalMessage';
                    } else   if (regexiPaytmDebitCaseTwo.test(msg)) {
                        ({
                            groups: { amount,payee,paymentService,balance }
                        } = regexiPaytmDebitCaseTwo.exec(msg));
                        notificationType = 'personalMessage';
                    }

                    console.log('notification type: ' + notificationType);

                    switch (notificationType) {
                        case 'personalMessage':
                            channel = await this.channelService.findByType('PersonalMessages');
                            icon_url = 'https://scontent.famd4-1.fna.fbcdn.net/v/t1.6435-9/54433583_2270713066327585_4370000988841443328_n.png?_nc_cat=1&ccb=1-5&_nc_sid=09cbfe&_nc_ohc=W0Ieb692IT4AX8CUYbE&_nc_ht=scontent.famd4-1.fna&oh=a0a5238fee7f8df4e8a50a37d3b659e4&oe=6193612B';
                            blocks = viewIpaytmPersonalMessage({amount,purpose,payee,paymentService,ref,balance,message: msg});
                            break;
                        default:
                            channel = await this.channelService.findByType('Uncategorized');
                            break;
                    }
                    break;
                case 'RZRPAY':
                    const regexRZRPAYFundTransfer = /(?<OTP>\d+).?is.*OTP.*INR.(?<amount>(\d+(.*\,\d{0,})?)).*from.*?account.*?(?<account>X*\d+)/m;
                    if (regexRZRPAYFundTransfer.test(msg)) {
                        ({
                            groups: { amount,OTP,account }
                        } = regexRZRPAYFundTransfer.exec(msg));
                        notificationType = 'fundTransfer';
                    }

                    console.log('notification type: ' + notificationType);

                    switch (notificationType) {
                        case 'fundTransfer':
                            channel = await this.channelService.findByType('fund-transfer-otp');
                            icon_url = 'https://imgr.search.brave.com/446wUCKeQiktuGH_F_Tb9oJaLyssn3S6TuSWLJKgsBY/fit/175/175/ce/1/aHR0cHM6Ly9pbnZv/aWNlLm5nL2Fzc2V0/cy9pbWFnZXMvbG9n/by9wYXJ0bmVycy9y/YXpvcnBheS5wbmc';
                            blocks = viewRzrpayFundTransfer({account,card,payee,amount,OTP});
                            break;
                        default:
                            channel = await this.channelService.findByType('Uncategorized');
                            break;
                    }
                    break;
                    case 'ARAVND':  
                    channel = await this.channelService.findByType('PersonalMessages');          
                    break;
                    case 'SCHEDL':
                        channel = await this.channelService.findByType('PersonalMessages');          
                        break;
                    case 'TEST':
                    channel = await this.channelService.findByType('Test');
                    console.log('notification type: ' + notificationType);
                    break;
                default:
                    if(sender.length > 9){
                        channel = await this.channelService.findByType('PersonalMessages');
                    }
                    else if(msg.includes("SendGrid"))
                    {
                        channel = await this.channelService.findByType('sendgrid-otp');
                        notificationType = "SendGridOTP";
                        icon_url = "https://pbs.twimg.com/profile_images/1153335496795414530/Af2RRy1K_400x400.jpg";
                    }
                    else if((msg.includes("Instagram account") || msg.includes("Facebook") ||  msg.includes("Google verification code") || msg.includes("CoWIN") || msg.includes("cowin"))){
                        notificationType = "personalMessageNoBlock";
                        channel = await this.channelService.findByType('PersonalMessages');
                        
                    }
                    else{
                        console.log('notification type: ' + notificationType);
                        channel = await this.channelService.findByType('Uncategorized');
                    }
                    break;
            }
            var a = {sender,message: msg}  
              if(OTP)
              {
                 var otpBtn = {
                    type: 'actions',
                    elements: [
                        {
                            type: 'button',
                            text: {
                                type: 'plain_text',
                                text: 'Show OTP 📩',
                                emoji: true,
                            },
                            "style": "primary",
                            "action_id": ACTION_SHOW_OTP,
                            "value":OTP
                        },
                        {
                            "type": "button",
                            "text": {
                                "type": "plain_text",
                                "text": "Show Original Message ✉"
                            },
                            "style": "danger",
                            "value": JSON.stringify(a),
                            "action_id": ACTION_SHOW_ORIGINAL,
                        },
                        {
                            "type": "button",
                            "text": {
                                "type": "plain_text",
                                "text": "Show View Log 📃"
                            },
                            "style": "primary",
                            "value": JSON.stringify(a),
                            "action_id": ACTION_SHOW_VIEW_LOG,
                        },
                    ]
                 } 
              }
           
                //add a action block in blocks which will show a button to see the actual message modal
             
                var btn =   {
                    "type": "actions",
                    "block_id": "actionblock789",
                    "elements": [
                        {
                            "type": "button",
                            "text": {
                                "type": "plain_text",
                                "text": "Show Original Message ✉"
                            },
                            "style": "danger",
                            "value": JSON.stringify(a),
                            "action_id": ACTION_SHOW_ORIGINAL_NO_LOG,
                        },
                    ]
                }


                if(OTP && blocks){
                    blocks.push(otpBtn)
                }else if(!OTP && blocks){
                    blocks.push(btn)
                }else if(blocks == undefined){
                    blocks = [
                                {
                                    "type": "section",
                                    "text": {
                                                "type": "plain_text",
                                                "text": msg,
                                                "emoji": true
                                            }
                                 }
                            ]
                    blocks.push(btn);
                }
                    
                      
                //POST A/C to SENDER ID TO PREVIOUS CHANNELS CONFIGURED

            if(channel && channel.length > 0){
                for(let oneChannel of channel){
                    if(oneChannel.workspaceId) {
                        workspace = await this.workspaceService.findById(oneChannel.workspaceId);     
                    } else {
                         await this.workspaceService.findByTeamId(process.env.DEFAULT_WORKSPACE_ID);
                    }
                    let postMsgResponse=await this.slackService.postBlockMessage(
                        workspace.accessToken,
                        oneChannel.channelID,
                        msg,
                        blocks,
                        icon_url,
                    );

                    let {channel,ts,message}=JSON.parse(JSON.stringify(postMsgResponse));
                    let data = {
                        sender,
                        message:message.text,
                        forwardedFrom,
                        notificationType,
                        channelID:channel,
                        blocks:JSON.stringify(blocks),
                        messageTs:ts,
                    }
                     await this.messageService.log(data);
                }
            }else{
                console.log("Channel Array is empty");
            }
            res.send('yay!');

        }

        private checkPersonalTxnSms(sender:string,message:string):string {
            let notificationType
                if(((sender == "ICICIB") || (sender == "ICIOTP")) && ((message.includes("Card XX7003")) || (message.includes("Card XXX431")) || (message.includes("Card XX9364")) || (message.includes("Account XX6879")))){
                    notificationType = "personalMessageNoBlock";
                }
                return notificationType;
        }
}



