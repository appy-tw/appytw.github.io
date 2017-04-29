angular.module('mgo-angular-wizard').factory('WizardHandler', () => {
   var service = {};
   
   var wizards = {};
   
   service.defaultName = "defaultWizard";
   
   service.addWizard = (name, wizard) => {
       wizards[name] = wizard;
   };
   
   service.removeWizard = name => {
       delete wizards[name];
   };
   
   service.wizard = name => {
       var nameToUse = name;
       if (!name) {
           nameToUse = service.defaultName;
       }
       
       return wizards[nameToUse];
   };
   
   return service;
});
