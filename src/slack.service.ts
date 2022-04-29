import { Injectable } from '@nestjs/common';
// import { orgBtn } from 'src/providers/blocks';
// import { orgBtn, subBtn, unSubBtn, subModal, otpModal, unsubModal } from 'src/providers/blocks';
// import { orgBtn, subBtn } from 'src/providers/blocks';

import { OriginalButtonService } from 'src/providers/orgBtn.service';

// const actionMap = {
//     'orignal_message_button': orgBtn
// };
// 'whatsapp_unsub_button' : unSubBtn,
// 'view_whatsapp_sub_modal' : subModal

// const viewMap = {
//     'view_whatsapp_sub_modal' : subModal,
//     'view_otp_modal' : otpModal,
//     'view_whatsapp_unsub_modal' : unsubModal
// };

@Injectable()
export class SlackService {
    constructor(
        private originalButtonService: OriginalButtonService,
    ) {}

    initSlackCommand(boltApp: any): void {
        console.info("slack command");
        boltApp.command('/echo', ({ ack }) => {
            console.info("who are u");
            ack({
                "blocks": [
                    {
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": "Hello, i am *Edhuku Indha Bot:gowtham*. "
                        }
                    }
                ]
            });
        });
    }

    initSlackInteractive(boltApp: any) {
        boltApp.action("orignal_message_button", async ({ body,client, ack, say }) => {
            var request = { body,client, ack, say };
            this.originalButtonService.initOriginalMessageModal(request);
        });
    }

    initAppHome(boltApp: any) {
        boltApp.event('app_home_opened', async ({ event, client, context }) => {
            
            try {
              const result = await client.views.publish({
                user_id: event.user,
                view: {
                  type: 'home',
                  callback_id: 'home_view',
                  blocks: [
                    {
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": "Add channels where you wish to receive notification"
                        },
                        "accessory": {
                            "type": "button",
                            "text": {
                                "type": "plain_text",
                                "text": "Add channels",
                                "emoji": true
                            },
                            "value": "add_channels",
                            "action_id": "button-action"
                        }
                    }
                ]
                }
              });
            }
            catch (error) {
              console.error(error);
            }
          });
    }

    
}