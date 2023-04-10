

function setLastTime(userProperties){
  userProperties.setProperty("lastTime", new Date());
}

function getLastTime(userProperties){
  const lastTime = new Date(userProperties.getProperty("lastTime"));

  if(lastTime == null) lastTime = new Date(0);
  
  console.log(lastTime)
  return lastTime;
}

function deleteLastTime(userProperties){
  userProperties.deleteAllProperties();
}


function setTrigger(formObject){
  const userProjectTriggers = ScriptApp.getProjectTriggers();
  let minute = formObject.interval

  if(minute == 60 || minute == 1440 || minute == 10080)
    minute *= formObject.intervalNumber;

  if(userProjectTriggers.length == 0){
    if(!minute)
      console.log("interval time error")
    else if(minute < 60)
      ScriptApp.newTrigger('Interval').timeBased().everyMinutes(minute).create();
    else 
      ScriptApp.newTrigger('Interval').timeBased().everyHours(minute / 60).create();
  }
}

function Init(userProperties){
  setLastTime(userProperties);
}

function registerInfo(userProperties, formObject){
   userProperties.setProperties({
    "rara_gmail": formObject.email,
    "rara_url": formObject.url,
  });
}
