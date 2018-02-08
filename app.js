
const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const Client = require("@line/bot-sdk").Client;
const {add, list} = require('./wishlist.js');

const CHANNEL_ACCESS_TOKEN = 'tk8lgslkCtY+IcIxxor87nedW89tgh6jG38ib5qWxpGy5GJ25/OFM4SsGKBWYAJMmteTt/htuCLYSYdWiqRcXIhsbDHv/TSl6q35EHxR7U/JNJNx6rWEtrCOS+tTSM4joiDBA46GJB+OfbfBWc9SXgdB04t89/1O/w1cDnyilFU='
const PORT = process.env.PORT || 3000

const app = express()
const client = new Client({
    channelAccessToken: CHANNEL_ACCESS_TOKEN,
    channelSecret: 'f265064ebc5080b131ecd79cef77afc9'
  });

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.listen(PORT, function () {
    console.log(`App listening on port ${PORT}!`)
})

// handler receiving messages
app.post("/", function(req, res) {
    console.log(JSON.stringify(req.body, null, 2));
    let events = req.body.events || [];
    events.forEach(async event => {
      let { replyToken, type, message, source: { userId } } = event;
      if (type === "message" && message.type === "text") {
        let text = message.text;
        if (text.indexOf("課程") !== -1) {
          client.replyMessage(replyToken, {
            type: "text",
            text: `你的願望清單內的課程有${await list(userId)}`
          });
        } else if (text == "你叫什麼名字"){
          client.replyMessage(replyToken, [
            {
              type: "text",
              text: "陸潤華"
            },
            // await createTemplateMessage(userId)
          ]);
        } else if (text == "你的信箱") {
            client.replyMessage(replyToken, [
                {
                  type: "text",
                  text: "jackluh.tw@yahoo.com.tw"
                },
                // await createTemplateMessage(userId)
              ]); 
        } else {
            client.replyMessage(replyToken, [
                {
                  type: "text",
                  text: text
                },
                // await createTemplateMessage(userId)
              ]);
        }
      } else if (type === "follow") {
        client.replyMessage(replyToken, {
          type: "text",
          text: "你好，歡迎使用資訊系統訓練班小幫手"
        });
      } else if (type === "postback" && event.postback) {
        let data = JSON.parse(event.postback.data);
        switch (data.action) {
          case "wishlist":
            add(userId, data.item);
            client.replyMessage(replyToken, {
              type: "text",
              text: `感謝你的使用，你已成功把${data.item}加入願望清單`
            });
            break;
            case "remove_wishlist":
            del(userId, data.item);
            client.replyMessage(replyToken, {
              type: "text",
              text: `感謝你的使用，你已成功把${data.item}移除願望清單`
            });
            break;
        }
      }
    });
    res.send();
  });

// generic function sending messages
function sendMessage(replyToken, text) {
    let body = {
        replyToken,
        messages: [{
            type: 'text',
            text,
        }],
    };

    let options = {
        url: 'https://api.line.me/v2/bot/message/reply',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${CHANNEL_ACCESS_TOKEN}`,
        },
        body,
        json: true,
    };

    request(options, function (error, response, body) {
        if (error) {
            console.log('Error sending message: ', error);
        }
        else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
    })
}

async function createTemplateMessage(userId) {
    let table = {};
    let wishList = await list(userId);
    wishList.forEach(function(item) {
        table[item] = true;
    });

    let template = {
      "type": "template",
      "altText": "this is a carousel template",
      "template": {
          "type": "carousel",
          "columns": [
              {
                "thumbnailImageUrl": "https://train.csie.ntu.edu.tw/images/courses/PC.jpg",
                "imageBackgroundColor": "#FFFFFF",
                "title": "台大電腦組裝教學課程(PC DIY)",
                "text": "本班務求讓每位學員都能獨立完成電腦組裝及拆解，甚至自行安裝軟體，不用假手他人花大錢。",
                "actions": [
                    {
                        "type": "postback",
                        "label": table["diy"] ? "取消願望清單" : "加入願望清單",
                        "data": table["diy"] 
                        ? JSON.stringify({action: 'remove_wishlist', item:'diy'})
                        : JSON.stringify({action: 'wishlist', item:'diy'})
                    },
                    {
                        "type": "uri",
                        "label": "立即報名",
                        "uri": "https://train.csie.ntu.edu.tw/train/signup.php"
                    }
                ]
              },
              {
                "thumbnailImageUrl": "https://train.csie.ntu.edu.tw/images/courses/ADI.jpg",
                "imageBackgroundColor": "#FFFFFF",
                "title": "Arduino互動設計班",
                "text": "常見的Arduino 應用就是和一些感測器進行互動。這些感測器相當於人類的眼睛和鼻子，用來感知物理世界中各式各樣的事物。",
                "actions": [
                    {
                        "type": "postback",
                        "label": table["arduino'"] ? "取消願望清單" : "加入願望清單",
                        "data": table["arduino'"] 
                        ? JSON.stringify({action: 'remove_wishlist', item:'arduino'})
                        : JSON.stringify({action: 'wishlist', item:'arduino'})
                    },
                    {
                        "type": "uri",
                        "label": "立即報名",
                        "uri": "https://train.csie.ntu.edu.tw/train/signup.php"
                    }
                ]
              },
          ],
          "imageAspectRatio": "rectangle",
          "imageSize": "cover"
      }
    }
    return template;
  }