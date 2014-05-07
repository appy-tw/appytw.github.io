var appyApp = angular.module('appyApp', ['ngSanitize', 'mgo-angular-wizard']);

appyApp.config(function($sceDelegateProvider) {
  $sceDelegateProvider.resourceUrlWhitelist([
    'self',
    'http://www.uisltsc.com.tw/**',
    'https://backend.appy.tw/Appendectomy/**',
    //'http://localhost/**'
    ]);
});

appyApp.filter('district', function() {
  return function(legislators, districts) {
    if (!districts) {
      return legislators;
    }

    return legislators.filter(function(ly) {
      return districts.some(function(d) {
        return d === ly.constituency[0]+','+ly.constituency[1];
      })
    });
  };
})

appyApp.controller('FormCtrl', function($scope, $http, $q, $window, $location, WizardHandler) {
  var buttonTipSending = '資料傳送到 7-11 ibon 中...';
  var titleSending = '傳送到 7-11 ibon';
  var contentPreview = '請確認您的個人資料';
  var contentPreview2 = '小提示: 手機若持續無法顯示請嘗試使用 Chrome 瀏覽';
  var titlePreview = '確認資料';
  var ibonPreview = '前往 ibon 雲端列印';
  var downloadPreview = '確認完畢，下載提議書';
  var downloadDownloading = '下載中....';
  var mly = $http.get('data/mly-8.json');
  var constituency = $http.get('data/constituency.json');
  var districts = $http.get('data/districts.json');
  var district_info = $http.get('data/district-data.json');
  var options = {
    headers: { 'Content-Type': undefined },
    transformRequest: function(data) { return data; }
  };

  $q.all([mly, constituency, districts, district_info]).then(function(results) {
    $scope.mly = $scope.filterLegislator(results[0].data);
    $scope.constituency = results[1].data;
    $scope.districts = results[2].data;
    $scope.district_info = results[3].data;
    var legislator = $location.path().substr(1).split('@');

    $scope.selectedTarget = null;
    $scope.selectedTargetInfo = null;

    $scope.setLegislator(legislator[0]);

    if ($scope.selectedTarget == null) {
      $scope.setLegislator($scope.mly[0].name);
    }

    $scope.initLegislatorFilter();
    if ((legislator.length > 1) && legislator[1] === 'reason') {
      $scope.showReason();
    }
  });

  $scope.count = 1;
  //$scope.pdfGeneratorUrl = 'http://ec2-54-254-219-58.ap-southeast-1.compute.amazonaws.com/Appendectomy/appendectomy/proposal.php';
  $scope.pdfGeneratorUrl = 'https://backend.appy.tw/Appendectomy/index.php/GenPDF/proposal';
  //$scope.pdfGeneratorUrl = 'http://www.uisltsc.com.tw/appendectomy/proposal.php';
  //$scope.pdfGneratorUrl = 'http://localhost/Appendectomy/index.php/GenPDF/proposal';

  var defaultData = {
    birthdayYear: null,
    birthdayMonth: null,
    birthdayDay: null
  };

  $scope.filterLegislator = function(ALL_mly) {
  	var result = [];
  	var supported = ["蔡正元", "吳育昇", "林鴻池"];
    angular.forEach(ALL_mly, function(ly) {
      if (supported.indexOf(ly.name) > -1) {
        result.push(ly);
      }
    });
    return result;
    /*angular.forEach(ALL_mly, function(ly) {
    	if (ly.constituency.length > 1) {
			result.push(ly);
		}
	});
return result;*/
};

$scope.setLegislator = function(name) {
  angular.forEach($scope.mly, function(ly) {
    var constituency, cityname;
    if (ly.name === name) {

      $scope.selectedTarget = ly;
      constituency = ly.constituency.join(',');
      cityname = $scope.constituency[constituency][0].split(',')[0];
      angular.forEach($scope.proposers, function(person) {
        person.addrCity = $scope.districts[cityname];
        person.addrDistrict = null;
        person.addrVillage = null;
      });

      var cons = $scope.selectedTarget.constituency[0] + $scope.selectedTarget.constituency[1];

      var reasonPage = "doc/" + cons + "/reason.html";
      $http.get(reasonPage).then(function(response) {
        $scope.myHTML = response.data;
      });
      $scope.emptyForm = "doc/" + cons + "/proposal_" + cons + ".pdf";

      angular.forEach($scope.district_info, function(info) {
       if (info.district_legislator == name) {
        $scope.selectTargetInfo = info;
      }
    });
    }
  });
  $('#legislator-modal').modal('hide');
};

$scope.hasFormData = function() {
  return window.FormData !== undefined ? true : false;
};

if (!$scope.hasFormData()) {
  $('#browser-modal').modal('show');
}

$scope.sendToIbon = function(data) {
  var url = 'http://www.ibon.com.tw/0100/file_upload.aspx';
  var uploadData = new FormData();
  var fileBlob = new Blob([data], { type: 'application/pdf'});
  uploadData.append('__VIEWSTATE', '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');
  uploadData.append('ctl00$Group_header1$txtKeyboard', '');
  uploadData.append('textarea', '');
  uploadData.append('agree', '1');
  uploadData.append('ctl00$cphContent$txtUserName', 'Appendectomy team');
  uploadData.append('ctl00$cphContent$txtEmail', $scope.email);
  uploadData.append('ctl00$cphContent$fuFile', fileBlob, 'doc.pdf');
  uploadData.append('ctl00$cphContent$btnUpload', 'OK');

  var second = $http.post(url, uploadData, options);
  second.error(function(data, status, headers, config) {
    $scope.ibonButtonTip = '傳送完成！請到你的信箱獲得 ibon 下載編號';
    $scope.showLink = true;
  });
};

$scope.downloadFile = function() {
 $scope.downloadButtonTip = downloadDownloading;
 document.getElementById('proposalForm').submit();
}

$scope.sendTo711 = function() {
  $scope.modalTitle = titleSending;
  $scope.ibonButtonTip = buttonTipSending;

  var form = new FormData(document.getElementById('proposalForm'));
  $http.post($scope.pdfGeneratorUrl, form, options).success(function(data) {
    $scope.sendToIbon(data);
  })
  .error(function(data) {
    $scope.sendToIbon(data);
  });
};

$scope.downloadButtonTip = downloadPreview;
$scope.ibonButtonTip = ibonPreview;
$scope.modalTitle = titlePreview;
$scope.modalContent = contentPreview;
$scope.modalContent2 = contentPreview2;
$scope.showLink = false;
$scope.showPrivacy = false;
$scope.privacyPage = "doc/Privacy_Statement/privacy.html";
$scope.privacyButtonText = "關閉";

//
$scope.printEmptyForm = false;
//

$scope.initPreview = function() {
 $scope.showLink = false;
 $scope.ibonButtonTip = ibonPreview;
 $scope.modalTitle = titlePreview;
 $scope.modalContent = contentPreview;
 $scope.downloadButtonTip = downloadPreview;
}


$scope.preview = function() {
 $scope.initPreview();
  	//$scope.drawPDF();
  	if (!$scope.printEmptyForm) {
      $scope.drawPreview();
    }
  };

  $scope.proposers = [angular.copy(defaultData)];

  $scope.range = function(start, end) {
    var result = [];
    for (var i = start; i <= end; i++) {
      result.push({value: i, content: i});
    }
    return result;
  };

  $scope.checkPrivacy = function(forceShow) {
  	if (($scope.showPrivacy === true) && (forceShow != true))
  		return;

  	if (forceShow === true) {
  		$scope.privacyButtonText = "關閉";
   } else {
    $scope.privacyButtonText = "我已閱讀並同意上列事項";
  }

  $scope.showPrivacy = true;
  $('#privacy-modal').modal('show');
}

$scope.showProposal = function() {
 document.getElementById("proposalPage").style.display="block";
 document.getElementById("reasonPage").style.display="none";
 $scope.gotoTop();
}

$scope.showReason = function() {
 document.getElementById("proposalPage").style.display="none";
 document.getElementById("reasonPage").style.display="block";
 $scope.gotoTop();
}
$scope.showEmptyForm = function() {
 window.open($scope.emptyForm);
}

$scope.gotoTop = function (){
  $window.scrollTo(0, 0);
};

$scope.initLegislatorFilter = function() {
  $scope.$watch('selectedCity', function(newValue, oldValue) {
    if (!newValue) {
      $scope.filteredDistricts = Object.keys($scope.constituency);
      return;
    }

    $scope.filteredDistricts = Object.keys($scope.constituency).filter(function(c) {
      return $scope.constituency[c].some(function(dist) {
        return (dist.indexOf(newValue.name) !== -1);
      });
    });
  });
};

$scope.$watch('count', function(newValue, oldValue) {
  var i = 0;
  var offset = parseInt(newValue, 10) - parseInt(oldValue, 10);
  if (offset === NaN) {
    $scope.proposers = [];
    return;
  }
  if (offset < 0) {
    for (i = 0; i < offset*-1; i++) {
      $scope.proposers.pop();
    }
  } else if (offset > 0) {
    for (i = 0; i < offset; i++) {
      $scope.proposers.push(angular.copy(defaultData));
    }
  }
});

$scope.fillInData = function(column, data, idx) {
 var pData = $scope.proposers[idx];

 column.length = 0;
 data.length = 0;

 column.push("姓名");
 data.push(pData.name);

 column.push("身分證字號");
 data.push(pData.id);

 column.push("性別");
 var sex = getID(pData.id).substr(2,1);

 pData.sex = "M";
 if (sex == 2){
   pData.sex = "F";
 }
 document.getElementsByName('Sex_'+idx)[0].value = pData.sex;
 data.push((pData.sex=='M')?"男生":"女生");

 column.push("生日");
 data.push(pData.birthdayYear + '/' + pData.birthdayMonth + '/' + pData.birthdayDay);

 column.push("職業");
 data.push(pData.occupation);

 column.push("戶籍地址");
 data.push(pData.addrCity.name + " "
   + pData.addrDistrict.name + " "
   + pData.addrVillage.name + " "
   + pData.addrNeighborhood + "鄰 "
   + pData.addrDetail);
}

$scope.drawPreview = function() {
 var users = $scope.proposers.length;
 var column = [];
 var data = [];

 if (users == 0) {
   $scope.finalCheckHtml = '發生某些錯誤! 請返回上一頁填寫資料';
 } else {
   $scope.finalCheckHtml = '<div class="form-group">';
   $scope.finalCheckHtml += '<label class="col-sm-9 info-title">表單資料</label>';
   $scope.finalCheckHtml += '<p class="col-sm-3"> </p>';
   $scope.finalCheckHtml += '</div>';
   $scope.finalCheckHtml += '<br><div class="form-group">';
   $scope.finalCheckHtml += '<label class="col-sm-3 info-label">立委姓名:</label>';
   $scope.finalCheckHtml += '<p class="col-sm-9">' + $scope.selectedTarget.name + '</p>';
   $scope.finalCheckHtml += '</div>';
   $scope.finalCheckHtml += '<div class="form-group">';
   $scope.finalCheckHtml += '<label class="col-sm-3 info-label">立委選區:</label>';
   $scope.finalCheckHtml += '<p class="col-sm-9">' + $scope.selectTargetInfo.district_name + '</p>';
   $scope.finalCheckHtml += '</div>';
   $scope.finalCheckHtml += '<div class="form-group">';
   $scope.finalCheckHtml += '<label class="col-sm-3 info-label"> 數量:</label>';
   $scope.finalCheckHtml += '<p class="col-sm-9">[' + users + '] 張</p>';
   $scope.finalCheckHtml += '</div>';
   $scope.finalCheckHtml += '<div class="form-group">';
   $scope.finalCheckHtml += '<label class="col-sm-3 info-label"> 電子郵件:</label>';
   $scope.finalCheckHtml += '<p class="col-sm-9"> ' + document.getElementById("inputEmail").value + '</p>';
   $scope.finalCheckHtml += '</div>';
   $scope.finalCheckHtml += '<hr style="border:5px dashed" size="3" width="100%">';

   var j=0;

   for (i = 0; i < users; i++) {
     $scope.fillInData(column, data, i);

     $scope.finalCheckHtml += '<div class="form-group">';
     $scope.finalCheckHtml += '<label class="col-sm-9 info-title">使用者資料 - ' + (i+1) + '</label>';
     $scope.finalCheckHtml += '<p class="col-sm-3"> .</p>';
     $scope.finalCheckHtml += '</div>';

     for (j = 0; j < column.length; j++) {
       $scope.finalCheckHtml += '<div class="form-group">';
       $scope.finalCheckHtml += '<label class="col-sm-3 info-label">';
       $scope.finalCheckHtml += column[j];
       $scope.finalCheckHtml += '</label>';
       $scope.finalCheckHtml += '<p class="col-sm-9">';
       $scope.finalCheckHtml += data[j];
       $scope.finalCheckHtml += '</p>';
       $scope.finalCheckHtml += '</div>';
     }
     $scope.finalCheckHtml += '<hr style="border:5px dashed" size="3" width="100%">';
   }
 }
}

$scope.drawPDF = function() {
  var canvas = document.getElementById("cnvs");
            //set the height and width of canvas
            var cw = 10;
            var ch = 10;
            var context = canvas.getContext("2d");
            //change the font of the canvas
            context.font = "15px Verdana";
            //change the color to yellow
            context.fillStyle = "yellow";
            //draw the background using yellow color
            context.fillRect(0, 0, 50, 50);
            //change the brush color to black
            context.fillStyle = "black";
            //write text on the canvas
            alert(context.measureText("12345").width);
            alert(context.measureText("12345").height);
            context.fillText("12345", 50, 50);
            //Get the Data URI of the canvas image
            var dataURL = canvas.toDataURL("image/png");
            //assign the data URI to image element
            document.getElementById("testimg").src = dataURL;

          };

        });

function getID(id) {
  var idArray=new Array();
  idArray[10]="A";  idArray[11]="B";  idArray[12]="C";  idArray[13]="D";
  idArray[14]="E";  idArray[15]="F";  idArray[16]="G";  idArray[17]="H";
  idArray[34]="I";  idArray[18]="J";  idArray[19]="K";  idArray[20]="L";
  idArray[21]="M";  idArray[22]="N";  idArray[35]="O";  idArray[23]="P";
  idArray[24]="Q";  idArray[25]="R";  idArray[26]="S";  idArray[27]="T";
  idArray[28]="U";  idArray[29]="V";  idArray[30]="X";  idArray[31]="Y";
  idArray[32]="W";  idArray[33]="Z";
  return idArray.indexOf(id.toUpperCase().substr(0,1))+id.substr(1,9);
}

function idCheck(id) {
  var newIdArray= getID(id);

  var baseNumber=
  parseInt(newIdArray.substr(0,1))*1+
  parseInt(newIdArray.substr(1,1))*9+
  parseInt(newIdArray.substr(2,1))*8+
  parseInt(newIdArray.substr(3,1))*7+
  parseInt(newIdArray.substr(4,1))*6+
  parseInt(newIdArray.substr(5,1))*5+
  parseInt(newIdArray.substr(6,1))*4+
  parseInt(newIdArray.substr(7,1))*3+
  parseInt(newIdArray.substr(8,1))*2+
  parseInt(newIdArray.substr(9,1))*1;
  if((baseNumber%10)==0)
    residue=0;
  else
    residue=10-(baseNumber%10);

  if(parseInt(newIdArray.substr(10,1))==residue)
    return true;
  else
    return false;
}

appyApp.directive('rocid', function($http) {
  return {
    require: 'ngModel',
    link: function(scope, elm, attrs, ctrl) {
      ctrl.$parsers.unshift(function(viewValue) {
        if (idCheck(viewValue)) {
            // it is valid
            ctrl.$setValidity('rocid', true);
            return viewValue;
          } else {
            // it is invalid, return undefined (no model update)
            ctrl.$setValidity('rocid', false);
            return undefined;
          }
        });
    }
  };
});

function AddressCtrl($scope) {
  this.models = [];
}

AddressCtrl.prototype.registerModel = function(model) {
  this.models.push(model);
};

AddressCtrl.prototype.checkValidity = function(scope) {
	var ly = scope.selectedTarget;
  var constituency = ly.constituency.join(',');
  var cityList = scope.constituency[constituency];
  var size, cityname;
  var models = this.models;
  var ret = false;

  return cityList.some(function(city) {
    cityname = city.split(',');
    size = cityname.length;

    if (size === 1){
     if (models[0].$viewValue.name === cityname[0])
      return true;
  } else if (size === 2){
   if ((models[0].$viewValue.name === cityname[0])
    && (models[1].$viewValue.name === cityname[1])) {
    return true;
}
} else if (size >= 3){
 if ((models[0].$viewValue.name === cityname[0])
  && (models[1].$viewValue.name === cityname[1])
  && (models[2].$viewValue.name === cityname[2]))
  return true;
}
});
};

appyApp.directive("addrSet", function() {
  return {
   controller: 'AddressCtrl',
   link: function(scope, elem, attr, ctrl) {
   }
 }
});

appyApp.directive('addrArray', function() {
  return {
    require: ['^addrSet', 'ngModel'],
    link: function(scope, elem, attr, ctrl) {
     var addrCtrl = ctrl[0];
     var addrSelect = ctrl[1];
     addrCtrl.registerModel(addrSelect);
   }
 }
});

appyApp.directive('addrValidate', function() {
  return {
    require: ['^addrSet', 'ngModel'],
    scope:true,
    link: function(scope, elem, attr, ctrl) {
     var addrCtrl = ctrl[0];
     var addrSelect = ctrl[1];

     addrSelect.$parsers.push(function(viewValue) {
      addrSelect.$setValidity("addrValidate", addrCtrl.checkValidity(scope));
      return viewValue;
    });
   }
 }
});
