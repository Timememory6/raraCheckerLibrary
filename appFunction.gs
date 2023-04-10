function checkAll(fullUrl, lastTime, emailAddress){
  const [threadTitle, threadUpdateTimes, threadNames, threadUrls] = GetAllThreadsInfo(fullUrl);

  const checkThreadUrls = []; 
  const checkThreadNames = [];

  threadUrls.forEach(function(threadUrl, threadIndex)  {
    const threadTime = new Date(getDateConstructor(threadUpdateTimes[threadIndex]));
    if(lastTime < threadTime){
      checkThreadUrls.push(threadUrl);
      checkThreadNames.push(threadNames[threadIndex]);
    };
  })

  if(checkThreadUrls.length) {
    const emailThreadContent = [];
    const emailThreadUrls = [];
    const emailThreadNames = [];

    for(let i = 0; i < checkThreadUrls.length; i++){
      const [resTimes, resNames, resBodies, noResFlague] = GetEachThreadInfo(fullUrl, checkThreadUrls[i]);

      if(noResFlague) {
        continue;
      }

      const newResTimes = []; 
      const newResNames = [];
      const newResBodies = [];
        
      for(let j = 0; j < resTimes.length; j++){
        const resTime = new Date(getDateConstructor(resTimes[j]))
        
        if(lastTime < resTime){
           newResTimes.push(resTimes[j]);
           newResNames.push(resNames[j]);
           newResBodies.push(resBodies[j]);
        }
      }

      if(newResTimes.length){
        emailThreadContent.push([newResTimes, newResNames, newResBodies]);
        emailThreadUrls.push(checkThreadUrls[i])
        emailThreadNames.push(checkThreadNames[i])
      }
    }
    
    sendEmail(fullUrl, emailAddress, threadTitle, emailThreadUrls, emailThreadNames, emailThreadContent); 
  }else{
    console.log("no thread to check");
  }
}

function getDateConstructor(time) {
  time = time.replace("年", "/").replace("月", "/").replace("日", "/"); 
  time = new Date(time);
  return time;
}

function GetAllThreadsInfo(fullUrl){
  const html = UrlFetchApp.fetch(fullUrl).getContentText('UTF-8');

  const content =  Parser.data(html).from('<tr class="fbk">').to('</tr>').iterate();   
  const content_str = String(content);

  const threadTitle = Parser.data(html).from('<title>').to('</title>').build();

  const timeRegExp = /(\d+)年(\d+)月(\d+)日.([01][0-9]|2[0-3]):[0-5][0-9]/g; 
  const threadUpdateTimes = content_str.match(timeRegExp);

  const threadNames = Parser.data(content_str).from('class="postTitleText">').to('<span').iterate();

  const threadUrls = Parser.data(content_str).from('<a href="./').to('" class="postTitleText">').iterate();
  
  return [threadTitle, threadUpdateTimes, threadNames, threadUrls];
}

function GetEachThreadInfo(fullUrl, threadUrl){
  const threadFullUrl = fullUrl + threadUrl;
  var noResFlague = false;
  
  const html = UrlFetchApp.fetch(threadFullUrl).getContentText('UTF-8');

  const content =  Parser.data(html).from('<body').to('<form action="https://rara.jp/p_st/"').build();   
  const content_str = String(content);
  
  const timeRegExp = /(\d+)年(\d+)月(\d+)日.([01][0-9]|2[0-3]):[0-5][0-9]/g; 
  const resTimes = content_str.match(timeRegExp);

  const resNames = Parser.data(content_str).from('<br />名前： <b>').to('</b>').iterate();

  const resContentsRegExp = /(<span style="color:#)([0-9A-F]{6})(;">)(.*?)(<\/span>)/gs;
  const resContents = content_str.match(resContentsRegExp);

  const resBodies = []

  if(resContents === null){
    noResFlague = true;
  } else {
    resContents.forEach(function(content) {
    
      content = content.replace(/&gt;/g, ">").replace(/<br \/>/g, "").replace(/<a(?: .+?)?>/g, "").replace(/<\/a>/g, "").replace(/amp;/g, "");
      content = content.replace(/<\/span>/g, "").replace(/(<span style="color:#)([0-9A-F]{6})(;">)/g, "")
      
      resBodies.push(content);
    });
  }
  
  return [resTimes, resNames, resBodies, noResFlague];
}


function sendEmail(fullUrl, emailAddress, threadTitle, emailThreadUrls, emailThreadNames, emailThreadContent){
  const options = {noreplay: true, name: 'raraメール通知' };
  
  const subject = `${threadTitle} ${emailThreadNames.length} スレッドに新着コメント`; 
  let body = `${fullUrl} の掲示板の ${emailThreadNames.length} スレッドに新着コメント\n`;

  body += "\n"

  emailThreadNames.forEach((threadName, index) => {
    [newResTimes, newResNames, newResBodies] = emailThreadContent[index];

    body += `スレッド ${threadName} に ${newResTimes.length} 件のレスポンド\n`;
    body += `url: ${fullUrl + emailThreadUrls[index]}\n`;

    body += "\n";

    for(i = 0; i < newResTimes.length; i++){
      body += `${newResTimes[i]}: ${newResNames[i]}\n`
      body += `${newResBodies[i]}\n`
      body += '\n';
    }
  })
 

  body += `${fullUrl} を押してチェックする\n`;

  console.log(subject);
  console.log(body)

  //develop
  //GmailApp.sendEmail(emailAddress, subject, body, options);
}