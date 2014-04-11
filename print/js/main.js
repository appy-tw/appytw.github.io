var appyApp = angular.module('appyApp', []);

appyApp.controller('FormCtrl', function($scope, $http, $q, $window) {
  var mly = $http.get('data/mly-8.json')
  var constituency = $http.get('data/constituency.json');
  var districtData = $http.get('data/district-data.json');
  $q.all([mly, constituency, districtData]).then(function(results) {
    $scope.mly = results[0].data;
    $scope.constituency = results[1].data;
    $scope.districtData = results[2].data;
    $scope.setLegislator('蔡正元');
  });

  $scope.count = 1;

  var defaultData = {
    birthdayYear: 1992,
    birthdayMonth: 1,
    birthdayDay: 1
  };

  $scope.setLegislator = function(name) {
    $scope.districtData.forEach(function(ly) {
      if (ly.district_legislator === name) {
        $scope.selectedTarget = ly;
      }
    })
  };

  $scope.isIE = function() {
    var ua = navigator.userAgent.toLowerCase();
    return /msie/.test(ua) || /Trident/.test(ua);
  };

  $scope.print = function() {
    var iframe = window.frames['pdfframe'];
    iframe.focus();
    iframe.print();
  }

  $scope.sendTo711 = function() {
    $('#preview-modal').modal('show');
    var options = {
      headers: { 'Content-Type': undefined },
      transformRequest: function(data) { return data; }
    };
    var form = new FormData(document.getElementById('proposalForm'));
    $http.post('proposal.php', form, options).success(function(result) {
      var url = 'http://www.ibon.com.tw/0100/file_upload.aspx';
      var uploadData = new FormData();
      var fileBlob = new Blob([result], { type: 'application/pdf'});
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
        $scope.modalContent = '傳送完成！請到你的信箱獲得 ibon 下載編號';
      })
    });
  };

  var contentSending = '資料傳送到 7-11 ibon 中...';
  var titleSending = '傳送到 7-11 ibon';
  var contentPreview = '產生提議書需要數秒鐘，請稍候...';
  var titlePreview = '預覽提議書';
  $scope.modalTitle = titlePreview;
  $scope.modalContent = contentPreview;
  $scope.modalHide = function() {
    $('#preview-modal').modal('hide');
    $scope.modalContent = titleSending;
  };

  $scope.proposers = [angular.copy(defaultData)];

  $scope.range = function(start, end) {
    var result = [];
    for (var i = start; i <= end; i++) {
      result.push({value: i, content: i});
    }
    return result;
  };

  $scope.preview = function(form) {
    $('#preview-modal').modal('show');
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
});

function idCheck(id) {
  var idArray=new Array();
  idArray[10]="A";  idArray[11]="B";  idArray[12]="C";  idArray[13]="D";
  idArray[14]="E";  idArray[15]="F";  idArray[16]="G";  idArray[17]="H";
  idArray[34]="I";  idArray[18]="J";  idArray[19]="K";  idArray[20]="L";
  idArray[21]="M";  idArray[22]="N";  idArray[35]="O";  idArray[23]="P";
  idArray[24]="Q";  idArray[25]="R";  idArray[26]="S";  idArray[27]="T";
  idArray[28]="U";  idArray[29]="V";  idArray[30]="X";  idArray[31]="Y";
  var newIdArray=idArray.indexOf(id.toUpperCase().substr(0,1))+id.substr(1,9);
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
