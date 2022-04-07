export function viewSbicrdLimit({limitConsumed,availableLimit}: any): any {
    const blocks = [
        {
            "type": "header",
            "text": {
                "type": "plain_text",
                "text": "Card Limit Alert"
            }
        },
        {
            "type": "section",
            "fields": [
                {
                    "type": "mrkdwn",
                    "text":  (limitConsumed === undefined) ? " " :"*SBI Card Limit Consumed :*\n " +limitConsumed
                    
                },
                {
                    "type": "mrkdwn",
                    "text":  (availableLimit === undefined) ? " " :"*Current available limit :*\n₹ " + availableLimit
                }
            ]
        }
    ];

    return blocks;
}