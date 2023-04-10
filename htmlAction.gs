function Delete(userProperties){
  deleteLastTime(userProperties);
  const userProjectTriggers = ScriptApp.getProjectTriggers();

  if(userProjectTriggers.length){
    userProjectTriggers.forEach(userProjectTrigger => {
      ScriptApp.deleteTrigger(userProjectTrigger);
    })
  }
}

function ProcessForm(userProperties, formObject) {
  registerInfo(userProperties, formObject)
  setTrigger(formObject);
  Init(userProperties);
}