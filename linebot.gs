function doPost(e)
{
    var funArr       = ['daily', 'weekly', 'monthly'];  // 功能字串
    var channelToken = 'Your Channel access token';
    var msg          = JSON.parse(e.postData.contents);

    // 取出 replayToken 和發送的訊息文字
    var replyToken  = msg.events[0].replyToken;
    var userMessage = msg.events[0].message.text;

    // 若沒符合則結束
    if (typeof replyToken === 'undefined') { return; }

    var searchResult = linearSearch(funArr, userMessage);     // 搜尋結果
    var replyMessage = getReplyMessage(funArr, searchResult); // 取得回覆訊息
    replyMsg(replyToken, replyMessage, channelToken);         // 回復訊息
}

// 回覆訊息
function replyMsg(replyToken, replyMessage, channelToken)
{
    var url = 'https://api.line.me/v2/bot/message/reply';
    var opt = {
        'headers': {
        'Content-Type': 'application/json; charset=UTF-8',
        'Authorization': 'Bearer ' + channelToken,
    },
    'method': 'post',
    'payload': JSON.stringify({
        'replyToken': replyToken,
        'messages': [{
            'type': 'text',
            'text': replyMessage,
        }],
    }),
    };
    UrlFetchApp.fetch(url, opt);
}

// 取得回覆訊息
function getReplyMessage(funArr, searchResult)
{
    var replyMessage = '';

    if(searchResult.length == 0){
        replyMessage = "請輸入: daily or weekly or monthly";
    }else{
        // 取得 trending 資料
        var response = UrlFetchApp.fetch(Utilities.formatString('https://trendings.herokuapp.com/repo?since=%s', funArr[searchResult[0]]), {
          'method': 'get'
        });

        var trending = JSON.parse(response.getContentText());
        var replyMessage = "";

        // 組合訊息
        for(var idx=0,tlength=trending.items.length ; idx<tlength ; idx++){
            replyMessage += trending.items[idx].repo + "(" + trending.items[idx].lang + ")" + "\n" + trending.items[idx].repo_link + "\n\n";
        }
    }

    return replyMessage;
}

// Search array value using linearSearch
function linearSearch(array, searchText)
{
    var result = [];
    for (var i = 0; i < array.length; i++) {
        if (array[i] == searchText) {
            result.push(i);
        }
    }
    return result;
}