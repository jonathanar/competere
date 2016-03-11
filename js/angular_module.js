programas = [ {"value": "P1", "text": "Preparatoria"}, {"value": "P2", "text": "Profesional"}, {"value": "P3", "text": "PGIT"}, {"value": "P4", "text": "PGADE"}, {"value": "P5", "text": "GMBA"}, {"value": "P6", "text": "EGEHCS"} ];
periodos = [ {"value": "E11", "text": "Enero semestral"}, {"value": "E13", "text": "Agosto semestral"}, {"value": "E12", "text": "Verano semestral"}, {"value": "E21", "text": "Enero trimestral"}, {"value": "E22", "text": "Abril trimestral"}, {"value": "E23", "text": "Verano trimestral"}, {"value": "E24", "text":"Septiembre trimestral" } ];
anios = []
d = new Date();
y = d.getFullYear();
for(i=2015;i<=y+4;i++){
  anios.push(i);
}

var today = new Date();
var dd = today.getDate();
var mm = today.getMonth()+1; //January is 0!
var yyyy = today.getFullYear();
if(dd<10){
    dd='0'+dd
} 
if(mm<10){
    mm='0'+mm
} 
fecha = dd+'/'+mm+'/'+yyyy;

chart_options = {
  scaleShowLine : true,
  angleShowLineOut : true,
  scaleShowLabels : false,
  scaleBeginAtZero : true,
  angleLineColor : "rgba(0,0,0,0.5)",
  scaleLineColor: "rgba(0,0,0,0.5)",
  angleLineWidth : 1,
  pointLabelFontFamily : "'Arial'",
  pointLabelFontStyle : "normal",
  pointLabelFontSize : 14,
  pointLabelFontColor : "#666",
  pointDot : true,
  pointDotRadius : 3,
  pointDotStrokeWidth : 1,
  pointHitDetectionRadius : 20,
  datasetStroke : true,
  datasetStrokeWidth : 2,
  datasetFill : true,
  legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].strokeColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>"
}

$(document).on('click', '#toLoad', function(){
  $('#file').click();
});

$(document).on('change', '#file', function(){
  $('.nombre_archivo > span').html($(this).val());
});

$(document).on('click', '.txtaedit', function(){
  $('textarea', this).focus();
});

$(document).on('focus', '.txtaedit > textarea', function(event){
  $(event.target.previousSibling).addClass('hide');
});

$(document).on('focusout', '.txtaedit > textarea', function(event){
  $(event.target.previousSibling).removeClass('hide');
});

function textAreaAdjust(o) {
    o.style.height = "1px";
    o.style.height = (1+o.scrollHeight)+"px";
}

function addspcs(str) {
  if(str){
    str1 = str.toString();
    rest = 11 - str1.length;
    for(i=0;i<rest;i++){
      str1 = str1 + String.fromCharCode(8194);
    }
    return str1;
  }
}

$(document).on('click', '#logupload', function(e) {
  e.preventDefault();
  text = $('#hiddeninfo').html();
  filename = "file_Upload_"+fecha.replace(/\//g, '_');
  blob = new Blob([text], {type: "text/plain;charset=utf-8"});
  saveAs(blob, filename+".txt");
});






myApp = angular.module('myApp',[]);


myApp.factory('authInterceptor', ['$rootScope', '$q', '$window', '$injector', function ($rootScope, $q, $window, $injector) {
  return {
    request: function (config) {
      config.headers = config.headers || {};
      if (typeof($window.localStorage.token) != "undefined") {
        config.headers.authorization = $window.localStorage.token;
      }
      return config;
    },
    response: function (response) {
      if(response.headers('nameuser') != '' && response.headers('nameuser') != null){
        $rootScope.usernombre = response.headers('nameuser');
      }else{
        delete $rootScope.usernombre;
      }
      if(response.headers('newtoken') != ''){
        $window.localStorage.token = response.headers('newtoken')
      }
      if (response.status === 401) {
        // handle the case where the user is not authenticated
      }
      return response || $q.when(response);
    }
  };
}])
.config(function ($httpProvider) {
  $httpProvider.interceptors.push('authInterceptor');
});

myApp.factory('httpInterceptor', ['$q', '$rootScope', '$log', function ($q, $rootScope, $log) {
  var numLoadings = 0;
  return {
    request: function (config) {
      numLoadings++;
      $rootScope.$broadcast('loader_show');
      return config || $q.when(config);
    },
    response: function (response) {
      if ((--numLoadings) === 0) {
          $rootScope.$broadcast('loader_hide');
      }
      return response || $q.when(response);
    },
    responseError: function (response) {
      if (!(--numLoadings)) {
          $rootScope.$broadcast('loader_hide');
      }
      return $q.reject(response);
    }
  };
}])
.config(function ($httpProvider) {
    $httpProvider.interceptors.push('httpInterceptor');
});


myApp.directive('search', function () {
    return function ($scope, element, attrs) {
        element.bind("keyup", function (event) {
          var val = element.val();
          if(val.length > 2) {
            $scope.search(val, attrs.list);
          }
        });
    };
});


myApp.directive('loader', ['$rootScope', function ($rootScope) {
  return function ($scope, element, attrs) {
    $scope.$on('loader_show', function () {
      return element.show();
    });
    return $scope.$on('loader_hide', function () {
      return element.hide();
    });
  };
}]);


myApp.directive('fileReader', function ($rootScope, modalConfirm){
   return {
    link: function (scope, ele){
      $(ele).on('change', function (event){
        input = ele;
        fileName = event.target.value;
        if(fileName.lastIndexOf('csv')===fileName.length-3){
          $('.nombre_archivo').css('color', '#0F0');
          scope.$apply(function(){
            scope.fileOn = true;
          });
        }else{
          $('.nombre_archivo').css('color', '#F00');
          data = ['El tipo de archivo que quiere subir es incorrecto. Asegurese que el archivo sea extensión .csv'];
          modalConfirm.conf(scope.giveScope(), data, false).then(function(){
            input.replaceWith(input.val('').clone(true));
          });
          scope.$apply(function(){
            scope.fileOn = false;
            scope.giveScope().modalText = data;
          });
        }
      });
    }
  }
});


myApp.directive('fileReaderBtn', function ($http, $compile, modalConfirm, getUrl) {
  return {
    link: function(scope, element) {
      $(element).on('click', function(event) {
        path = document.getElementById('file').getAttribute('path');
        file = document.getElementById('file').files[0];
        r = new FileReader();
        r.onload = function(e){
          contents = e.target.result;
          allTextLines = contents.split(/\r\n|\n/);
          allTextLines = allTextLines.filter(Boolean);
          for(i=0;i<allTextLines.length;i++){
            allTextLines[i] = allTextLines[i].split(",");
          }
          $http({
            method: 'GET',
            url: path,
            params: {datos: JSON.stringify(allTextLines)}
          }).success(function(data){
            $('.strtohtml').html(data.ans);
            $('#hiddeninfo').html(data.reg);
            modalConfirm.conf(scope.giveScope(), [], false).then(function(){
              $('.strtohtml').html('');
              $('#hiddeninfo').html('');
              scope.refreshView();
            });
          });
        }
        r.readAsText(file, 'ISO-8859-1');
      });
    }
  };
});

myApp.directive('dynamic', function ($compile){
  return {
    replace: true,
    link: function (scope, ele, attrs){
      scope.$watch(attrs.dynamic, function(html){
        if(!html){
          return;
        }
        ele.html((typeof(html) === 'string') ? html : html.data);
        $compile(ele.contents())(scope);
      }, true);
    }
  }
});


myApp.service('getUrl', function ($http){
  return {
    getHTML: function(path){
      return $http({
        method: 'GET',
        url: path
      }).success(function(data, status, headers){
        return data;
      })
    }
  }
});

myApp.service('modalConfirm', function ($q){
  return {
    conf: function($scope, text, typeMessage){
      $scope.modalText = text;
      $scope.typMe = typeMessage;
      deferred = $q.defer();
      time = setInterval(function(){
        if($scope.answer == true || $scope.answer == false){
          deferred.resolve($scope.answer);
          delete $scope.answer;
          $scope.modalText = "";
          clearInterval(time);
        }
      }, 250);     
      return deferred.promise;
    }
  }
});

myApp.controller('mainPage', ['$rootScope', '$scope', '$window', 'getUrl', 'modalConfirm', function ($rootScope, $scope, $window, getUrl, modalConfirm){
  $scope.head = false;
  $scope.home = false;
  getUrl.getHTML('/logview').then(function(response){
    $scope.view = response.data;
    $scope.menuAndHome();
  });
  /* href="/about" ng-click="goUrl($event);" */
  $scope.goUrl = function(event){
    if(typeof(event) === 'string'){
      path = event;
    }else{
      event.preventDefault();
      path = event.target.pathname;
    }
    getUrl.getHTML(path).then(function(response){
      $scope.view = response.data;
      $scope.menuAndHome();
    });
  }
  $scope.menuAndHome = function(){
      setTimeout(function(){
        $scope.$apply(function(){
          if($('#login_view').length){
            $scope.head = false;
          }else{
            $scope.head = true;
          }
          if($('.menu').length){
            $scope.home = false;
          }else{
            $scope.home = true;
          }
        });
        
      }, 100);      
  }
  $scope.logOut = function(event){
    event.preventDefault();
    $scope.head = false;
    $scope.home = false;
    delete $window.localStorage.token;
    delete $rootScope.usernombre;
    getUrl.getHTML('/logview').then(function(response){
      $scope.view = response.data;
    });
  }
  $scope.showAbout = function(e){
    e.preventDefault();
    /*string = ['<p><b>Acerca de</b></p><br><p>El objetivo del sistema COMPETERE es entregar al estudiante los resultados de la evaluación formativa de una forma gráfica, que le permita conocer sus avances y comparaciones entre las metas de aprendizaje y los niveles alcanzados en el marco de las competencias disciplinares y transversales de sus respectivos programas de estudio.</p><br><p>Agradecemos el apoyo por parte de Institutito Tecnológico de Estudios Superiores de Monterrey y Novus, para la elaboración de este proyecto que tiene como finalidad de entregar a cada uno de los estudiantes los resultados de los proceso de evaluación del aprendizaje, de una forma gráfica que les permita conocer sus avances y hacer comparaciones paulatinas en relación con su desempeño académico, en el marco de las competencias disciplinares y trasversales declaradas en sus materias.</p><br><p>Responsables</p><br><p>Katherina Edith Gallado Córdova</p><p>María Eugenia Gil Rendón</p>'];*/
    string = ['<p>El sistema COMPETERE es una herramienta que permite realizar procesos de evaluación de desempeño en el marco del Modelo educativo basado en competencias. Este sistema ha sido creado para facilitar el proceso de integración de criterios y estándares para estimar de una forma más sencilla los alcances del desempeño de los estudiantes. Además, permite realizar un proceso de retroalimentación que les brindará información sobre sus fortalezas y áreas de oportunidad en el marco de una determinada tarea o proyecto.</p><br><p align="center">¡Bienvenido a COMPETERE!</p>']
    data = [];
    $('.strtohtml').html(string);
    modalConfirm.conf($scope, data, false).then(function(){
      $('.strtohtml').html('');
    });
  }
  $scope.showStart = function(e){
    e.preventDefault();
    string = ['<p>El sistema COMPETERE es fruto de un proyecto integral de evaluación de desempeño en el marco del Modelo educativo basado en competencias. Este proyecto es liderado por la Dra. Katherina Edith Gallardo Córdova, profesora investigadora de la Escuela Nacional de Educación, Humanidades y Ciencias Sociales del Tecnológico de Monterrey, quien ha dedicado varios años de su carrera profesional al estudio del tema de evaluación del aprendizaje. También participa de manera activa la Mtra. María Eugenia Gil Rendón de la Vicerrectoría de Programas en Línea, responsable de los procesos de evaluación en el nivel de posgrado. Recientemente se han integrado más profesores interesados en el tema de áreas como ingeniería, medicina y matemáticas a nivel profesional. Queremos ser muchos más profesores e investigadores de todos los niveles educativos trabajando en este tema, por lo que es fundamental que más docentes interesados y preocupados por la evaluación de desempeño se unan a este proyecto.</p><br><p>COMPETERE se creó en el año 2014 gracias al apoyo Novus.  El proyecto espera seguir consolidándose en el 2015 y en los siguientes años, con más apoyo de Novus y otras instancias que se sumen a este gran esfuerzo.</p><br><p>Para conocer más sobre el proyecto puede descargar este <a href="files/que_es_competere.pdf" target="_blank" alt="Que es Competere" title="Que es Competere">documento</a></p>'];
    data = [];
    $('.strtohtml').html(string);
    modalConfirm.conf($scope, data, false).then(function(){
      $('.strtohtml').html('');
    });
  }
  $scope.giveScope = function(){
    return $scope;
  }
}]);





/*   INICIA CONTROLADOR DE LOGEO DE USUARIO   */
myApp.controller('userLogin', ['$scope', '$http', '$window', 'getUrl', 'modalConfirm', function ($scope, $http, $window, getUrl, modalConfirm){
  $scope.loginSubmit = function(){
    $http({
      url: '/login',
      method: 'GET',
      params: {user: $scope.user}
    })
      .success(function (data){
        if(data.status == "error"){
          //Revisar este codigo!!!!!!!!!!!!!!!!!!!!!!!!!!!
          modalConfirm.conf($scope.giveScope(), [data.text], false).then(function(){});
        }else{
          $window.localStorage.token = data.token;
          $scope.goToUrlParent('/menu');          
        }
      })
  }
  $scope.goToUrlParent = function(event){
    $scope.goUrl(event);
  }
}]);
/*   TERMINA CONTROLADOR DE LOGEO DE USUARIO   */

/*   INICIA CONTROLADOR DE COMPETENCIAS   */
myApp.controller('competencias', ['$scope', '$http', 'getUrl', 'modalConfirm', function ($scope, $http, getUrl, modalConfirm){
  $scope.categoria = [{index: "Transversal", value: "Transversal"}, {index: "Disciplinaria", value: "Disciplinaria"}];
  $scope.taxonomia = [{index: "Marzano y Kendall", value: "Marzano y Kendall"}, {index: "Simpson", value: "Simpson"}, {index: "Krathwohl", value: "Krathwohl"}];
  $scope.refreshView = function(){
    getUrl.getHTML('/allcompetence').then(function(response){
      $scope.lista1 = response.data;
    });
  }
  $scope.addelem1 = function(){
    $scope.modeloLista1 = {};
    $scope.modeloLista1.com_fijo = 0;
  }
  $scope.form1 = function(){
    add = false;
    if($scope.add1 && $scope.edit1){
      add = true;
    }else{
      add = false;
    }
    $http({
      url: '/updatecompetence',
      method: 'GET',
      params: {competencia: $scope.modeloLista1, type_trans: add}
    })
    .success(function(data){
      modalConfirm.conf($scope.giveScope(), data, false).then(function(){
        $scope.edit1 = !$scope.edit1;
        $scope.add1 = false;
        $scope.modeloLista1 = null;
        $scope.refreshView();
        $scope.update1();
        $scope.update2();
      });
    });
  }
  $scope.delelem1 = function(){
    if($scope.lista2.length){
      data = ['La competencia no puede ser borrada mientras tenga subcompetencias asignadas!'];
      modalConfirm.conf($scope.giveScope(), data, false).then(function(response){});
    }else{
      data = ['Segur@ que desea borrar el registro'];
      modalConfirm.conf($scope.giveScope(), data, true).then(function(response){
        if(response){
          $http({
            url: '/delcompetence',
            method: 'GET',
            params: {competencia: $scope.modeloLista1.com_clave_competencia}
          })
          .success(function(data){
            modalConfirm.conf($scope.giveScope(), data, false).then(function(){
              $scope.refreshView();
            });
          });
        }
      });
    }
  }
  $scope.update1 = function(){
    $scope.lista2 = {};
    if($scope.modeloLista1 != null){
      $http({
        url: '/allsubcompetence',
        method: 'GET',
        params: {competencia: $scope.modeloLista1.com_clave_competencia}
      })
      .success(function(data){
        if(!data.text){
          $scope.lista2 = data;
        }else{
          $scope.lista2 = {};
        }
      });
    }    
  }
  $scope.cancel1 = function(){
    data = ['Segur@ que no desea guardar cambios?'];
    modalConfirm.conf($scope.giveScope(), data, true).then(function(response){
      if(response){
        $scope.edit1 = !$scope.edit1;
        $scope.add1 = false;
        $scope.modeloLista1 = null;
      }
    });
  }
  $scope.addelem2 = function(){
    $scope.modeloLista2 = {};
    $scope.modeloLista2.sco_fijo = 0;
  }
  $scope.form2 = function(){
    add = false;
    $scope.modeloLista2.sco_clave_subcompetencia = $scope.modeloLista1.com_clave_competencia.concat($scope.modeloLista2.sco_clave_subcompetencia);
    if($scope.add2 && $scope.edit2){
      add = true;
    }else{
      add = false;
    }
    $http({
      url: '/updatesubcompetence',
      method: 'GET',
      params: {competencia: $scope.modeloLista1.com_clave_competencia, subcompetencia: $scope.modeloLista2, type_trans: add}
    })
    .success(function(data){
      modalConfirm.conf($scope.giveScope(), data, false).then(function(){
        $scope.edit2 = !$scope.edit2;
        $scope.add2 = false;
        $scope.modeloLista2 = null;
        $scope.update1();
        $scope.update2();
      });
    });
  }
  $scope.delelem2 = function(event){
    if($scope.lista3.length){
      data = ['La subcompetencia no puede ser borrada mientras tenga niveles asignadas!'];
      modalConfirm.conf($scope.giveScope(), data, false).then(function(response){});
    }else{
      if(event.ctrlKey){
        claves = [];
        angular.forEach($scope.lista2, function(item){
          claves.push(item.sco_clave_subcompetencia);
        });
        $http({
          url: '/checklevels',
          method: 'GET',
          params: {competencia: claves}
        })
        .success(function(ans){
          flag = ans.indexOf(true);
          if(flag != -1){
            data = ['No se pueden borrar las subcompetencias, ya que una o varias todavia tienen niveles dependientes.'];
            modalConfirm.conf($scope.giveScope(), data, false).then(function(){});
          }else{
            data = ['Esta seguro@ que desea borrar todas las subcompetencias para esta competencia? Una vez confirmado no podra volver a recuperarlas!'];
            modalConfirm.conf($scope.giveScope(), data, true).then(function(response){
              if(response){
                $http({
                  url: '/masivedelsubcompetence',
                  method: 'GET',
                  params: {competencia: $scope.modeloLista1}
                })
                .success(function(data){
                  modalConfirm.conf($scope.giveScope(), data, false).then(function(){
                    $scope.update1();
                  });
                });
              }
            });
          }
        });
      }else{
        data = ['Segur@ que desea borrar el registro'];
        modalConfirm.conf($scope.giveScope(), data, true).then(function(response){
          if(response){
            $http({
              url: '/delsubcompetence',
              method: 'GET',
              params: {subcompetencia: $scope.modeloLista2.sco_clave_subcompetencia}
            })
            .success(function(data){
              modalConfirm.conf($scope.giveScope(), data, false).then(function(){
                $scope.update1();
              });
            });
          }
        });
      }
    }
  }
  $scope.cancel2 = function(){
    data = ['Segur@ que no desea guardar cambios?'];
    modalConfirm.conf($scope.giveScope(), data, true).then(function(response){
      if(response){
        $scope.edit2 = !$scope.edit2;
        $scope.add2 = false;
        $scope.modeloLista2 = null;
      }
    });
  }
  $scope.update2 = function(){
    $scope.lista3 = {};
    if($scope.modeloLista2 != null){
      $http({
        url: '/alllevels',
        method: 'GET',
        params: {subcompetencia: $scope.modeloLista2.sco_clave_subcompetencia}
      })
      .success(function(data){
        if(!data.text){
          $scope.lista3 = data;
        }else{
          $scope.lista3 = {};
        }
      });
    }    
  }
  $scope.addelem3 = function(){
    $scope.modeloLista3 = {};
  }
  $scope.form3 = function(){
    add = false;
    if($scope.add3 && $scope.edit3){
      add = true;
    }else{
      add = false;
    }
    $http({
      url: '/updatelevel',
      method: 'GET',
      params: {nivel: $scope.modeloLista3, subcompetencia: $scope.modeloLista2.sco_clave_subcompetencia, type_trans: add}
    })
    .success(function(data){
      modalConfirm.conf($scope.giveScope(), data, false).then(function(){
        $scope.edit3 = !$scope.edit3;
        $scope.add3 = false;
        $scope.modeloLista3 = null;
        $scope.update2();
      });
    });
  }
  $scope.delelem3 = function(event){
    if(event.ctrlKey){
      data = ['Esta seguro@ que desea borrar todos los niveles para esta subcompetencia? Una vez confirmado no podra volver a recuperarlos!'];
      modalConfirm.conf($scope.giveScope(), data, true).then(function(response){
        if(response){
          $http({
            url: '/masivedellevel',
            method: 'GET',
            params: {subcompetencia: $scope.modeloLista2}
          })
          .success(function(data){
            modalConfirm.conf($scope.giveScope(), data, false).then(function(){
              $scope.update2();
            });
          });
        }
      });
    }else{
      data = ['Segur@ que desea borrar el registro'];
      modalConfirm.conf($scope.giveScope(), data, true).then(function(response){
        if(response){
          $http({
            url: '/dellevel',
            method: 'GET',
            params: {subcompetencia: $scope.modeloLista2.sco_clave_subcompetencia, nivel: $scope.modeloLista3.niv_nivel}
          })
          .success(function(data){
            modalConfirm.conf($scope.giveScope(), data, false).then(function(){
              $scope.update2();
            });
          });
        }
      });
    }
  }
  $scope.cancel3 = function(){
    data = ['Segur@ que no desea guardar cambios?'];
    modalConfirm.conf($scope.giveScope(), data, true).then(function(response){
      if(response){
        $scope.edit3 = !$scope.edit3;
        $scope.add3 = false;
        $scope.modeloLista3 = null;
      }
    });
  }
  $scope.addSpaces = function(str){
    return addspcs(str);
  }
  $scope.refreshView();
}]);
/*   TERMINA CONTROLADOR DE COMPETENCIAS   */

/*   INICIA CONTROLADOR DE MATERIAS   */
myApp.controller('materias', ['$scope', '$http', 'getUrl', 'modalConfirm', function ($scope, $http, getUrl, modalConfirm){
  $scope.lista2 = [];
  $scope.program = programas;
  $scope.period = periodos;
  $scope.year = anios;
  $scope.refreshView = function(){
    getUrl.getHTML('/allsubjects').then(function(response){
      $scope.lista1 = response.data;
    });
  }
  $scope.addelem1 = function(){
    $scope.modeloLista1 = {};
  }
  $scope.form1 = function(){
    add = false;
    if($scope.add1 && $scope.edit1){
      add = true;
    }else{
      add = false;
    }
    $http({
      url: '/updatesubject',
      method: 'GET',
      params: {materia: $scope.modeloLista1, type_trans: add}
    })
    .success(function(data){
      modalConfirm.conf($scope.giveScope(), data, false).then(function(){
        $scope.edit1 = !$scope.edit1;
        $scope.add1 = false;
        $scope.modeloLista1 = null;
        $scope.lista1 = null;
        $scope.refreshView();
        $scope.update1();
      });
    });
  }
  $scope.delelem1 = function(){
    data = ['Segur@ que desea borrar la materia'];
    modalConfirm.conf($scope.giveScope(), data, true).then(function(response){
      if(response){
        $http({
          url: '/delsubject',
          method: 'GET',
          params: {materia: $scope.modeloLista1.mat_clave_materia}
        })
        .success(function(data){
          modalConfirm.conf($scope.giveScope(), data, false).then(function(){
            $scope.refreshView();
          });
        });
      }
    });
  }
  $scope.cancel1 = function(){
    data = ['Segur@ que no desea guardar cambios?'];
    modalConfirm.conf($scope.giveScope(), data, true).then(function(response){
      if(response){
        $scope.edit1 = !$scope.edit1;
        $scope.add1 = false;
        $scope.modeloLista1 = null;
      }
    });
  }
  $scope.update1 = function(){
    clave_materia = null;
    if($scope.modeloLista1){
      clave_materia = $scope.modeloLista1.mat_clave_materia;
    }
    $http({
      url: '/allsubjectperiod',
      method: 'GET',
      params: {program: $scope.program_selected, period: $scope.period_selected, year: $scope.year_selected, subject: clave_materia}
    })
    .success(function(data){
      $scope.lista2 = [];
      for(i=0;i<data.length;i++){
        $scope.lista2.push(data[i]);
      }
    });
  }
  $scope.addSubject1 = function(){
    flag = false;
    for(i=0;i<$scope.lista2.length;i++){
      if(angular.equals($scope.lista2[i], $scope.modeloLista1)){
        flag = true;
      }
    }
    if(flag == false){
      $scope.lista2.push($scope.modeloLista1);
      $scope.add2 = true;
    }
  }
  $scope.delSubject1 = function(){
    index = $('#lista2')[0].selectedIndex;
    $scope.lista2.splice(index-1, 1);
    $scope.add2 = true;
  }
  $scope.form2 = function(){
    period = $scope.program_selected+"."+$scope.period_selected+"."+$scope.year_selected;
    $http({
      url: '/updatesubjectperiod',
      method: 'GET',
      params: {materiaperiodo: JSON.stringify($scope.lista2), periodo: period}
    })
    .success(function(data){
      $scope.add1 = false;
      modalConfirm.conf($scope.giveScope(), data, false).then(function(){
        $scope.add2 = false;
        $scope.modeloLista1 = null;
        $scope.lista1 = null;
        $scope.refreshView();
      });
    });
  }
  $scope.cancel2 = function(){
    data = ["Seguro que no desea guardar cambios?"]
    modalConfirm.conf($scope.giveScope(), data, true).then(function(response){
      if(response){
        $scope.add2 = false;
        $scope.refreshView();
        $scope.update1();
      }
    });
  }
  $scope.addSpaces = function(str){
    return addspcs(str);
  }
  $scope.refreshView();
}]);
/*   TERMINA CONTROLADOR DE MATERIAS   */

/*   INICIA CONTROLADOR DE PERIODOS Y MATERIAS   */
myApp.controller('matprofalu', ['$scope', '$http', 'getUrl', 'modalConfirm', function ($scope, $http, getUrl, modalConfirm){
  lista6 = {items:[]};
  $scope.update = true;
  $scope.program = programas;
  $scope.period = periodos;
  $scope.year = anios;
  $scope.lista3 = [];
  $scope.refreshView = function(){
    getUrl.getHTML('/allteachandstud').then(function(response){
      $scope.lista2 = response.data.teachers;
      $scope.lista4 = response.data.students;
    });
  }
  $scope.update1 = function(){
    if(!$scope.program_selected || !$scope.period_selected || !$scope.year_selected){
      delete $scope.lista1;
    }
    if($scope.program_selected && $scope.period_selected && $scope.year_selected){
      $http({
        url: '/allsubjectperiod',
        method: 'GET',
        params: {program: $scope.program_selected, period: $scope.period_selected, year: $scope.year_selected}
      })
      .success(function(data){
        if(data.length){
          $scope.lista1 = [];
          for(i=0;i<data.length;i++){
            $scope.lista1.push(data[i]);
          }
        }else{
          delete $scope.lista1;
        }
      });
    }
  }
  $scope.update2 = function(){
    if($scope.modeloLista1 == null){
      delete $scope.lista3;
      delete $scope.lista5;
      $scope.refreshView();
    }else{
      periodo = $scope.program_selected + "." + $scope.period_selected + "." + $scope.year_selected;
      $http({
        url: '/teacherandstudentsfromcourse',
        method: 'GET',
        params: {period: periodo, course: $scope.modeloLista1.mat_clave_materia}
      })
      .success(function(data){
        if(data.status == "error"){
          modalConfirm.conf($scope.giveScope(), [data.text], false).then(function(){});
        }else{
          lista6 = data;
          $scope.lista3 = [];
          for(i=0;i<data.items.length;i++){
            for(j=0;j<$scope.lista2.length;j++){
              if($scope.lista2[j].pro_nomina == data.items[i].profesor){
                $scope.lista3.push($scope.lista2[j]);
                $scope.lista2.splice(j, 1);
              }
            }
            if(data.items[i].alumnos){
              for(j=0;j<data.items[i].alumnos.length;j++){
                if(data.items[i].alumnos[j] != null){
                  for(k=0;k<$scope.lista4.length;k++){
                    if($scope.lista4[k].alu_matricula == data.items[i].alumnos[j].alu_matricula){
                      $scope.lista4.splice(k, 1);
                    }
                  }
                }
              }
            }
          }
        }
      });
    }
  }
  $scope.update3 = function(){
    if(typeof($scope.lista3) != "undefined"){
      for(i=0;i<$scope.lista3.length;i++){
        if(angular.equals($scope.lista3[i], $scope.modeloLista3) && typeof(lista6.items[i].alumnos) != "undefined"){
          $scope.lista5 = lista6.items[i].alumnos;
          break;
        }else{
          delete $scope.lista5;
        }
      }
    }
  }
  $scope.addSubject1 = function(){
    if($scope.modeloLista2){
      $scope.update = false;
      flag = false;
      if($scope.lista3){
        for(i=0;i<$scope.lista3.length;i++){
          if(angular.equals($scope.lista3[i], $scope.modeloLista2)){
            flag = true;
          }
        }
      }      
      if(flag == false){
        $scope.lista3.push($scope.modeloLista2)
        nomina = $scope.modeloLista2.pro_nomina;
        lista6.items.push({profesor: nomina});
        index = $('#lista2')[0].selectedIndex;
        $scope.lista2.splice(index-1, 1);
      }
    }
  }
  $scope.delSubject1 = function(){
    if($scope.modeloLista3){
      $scope.update = false;
      for(i=0;i<lista6.items.length;i++){
        if(lista6.items[i].profesor === $scope.modeloLista3.pro_nomina){
          $scope.lista2.push($scope.modeloLista3);
          lista6.items.splice(i,1);
          index = $('#lista3')[0].selectedIndex;
          $scope.lista3.splice(index-1, 1);
        }
      }
      if($scope.lista5){
        while($scope.lista5.length){
          $scope.lista4.push($scope.lista5[0]);
          $scope.lista5.splice(0, 1);
        }
      }
    }
  }
  $scope.addSubject2 = function(){
    if($scope.modeloLista3 && $scope.modeloLista4){
      students = [];
      $scope.update = false;
      for(i=0;i<lista6.items.length;i++){
        if(lista6.items[i].profesor === $scope.modeloLista3.pro_nomina){
          if(typeof(lista6.items[i].alumnos) != "undefined"){
            students = lista6.items[i].alumnos;
          }
          students.push($scope.modeloLista4);
          nomina = $scope.modeloLista3.pro_nomina;
          lista6.items[i] = {profesor: nomina, alumnos: students};
          $scope.lista5 = students;
          index = $('#lista4')[0].selectedIndex;
          $scope.lista4.splice(index-1, 1);
        }
      }
    }
  }
  $scope.delSubject2 = function(){
    if($scope.modeloLista3 && $scope.modeloLista5){
      $scope.update = false;
      for(i=0;i<lista6.items.length;i++){
        if(lista6.items[i].profesor === $scope.modeloLista3.pro_nomina){
          for(j=0;j<lista6.items[i].alumnos.length;j++){
            if(lista6.items[i].alumnos[j].alu_matricula === $scope.modeloLista5.alu_matricula){
              $scope.lista4.push($scope.modeloLista5);
              lista6.items[i].alumnos.splice(j,1);
            }
          }
        }
      }
    }
  }
  $scope.cancel1 = function(){
    myDDL = $('#lista1');
    myDDL[0].selectedIndex = 0;
    delete $scope.modeloLista1;
    $scope.lista3 = [];
    $scope.lista5 = [];
    lista6 = {items:[]};
    $scope.update = true;
    $scope.refreshView();
  }
  $scope.form1 = function(){
    periodo = $scope.program_selected + "." + $scope.period_selected + "." + $scope.year_selected;
    $http({
      url: '/updatepeoplecourse',
      method: 'GET',
      params: {period: periodo, course: $scope.modeloLista1.mat_clave_materia, people: lista6}
    })
    .success(function(data){
      delete $scope.lista3;
      delete $scope.lista5;
      $scope.refreshView();
      setTimeout(function(){
        $scope.update2();
      },2000);
      $scope.update = true;
      modalConfirm.conf($scope.giveScope(), data, false).then(function(){});
    });
  }
  $scope.callRestService= function() {
    $http({
      method: 'GET',
      url: '/someUrl'
    })
    .success(function(data, status, headers, config) {
      $scope.results.push(data);  //retrieve results and add to existing results
    });
  }
  $scope.search = function(val, lis) {
    if(lis === "lista2"){
      for(i=0;i<$scope.lista2.length;i++){
        nam = String($scope.lista2[i].pro_nombre + " " + $scope.lista2[i].pro_apellido_paterno + " " + $scope.lista2[i].pro_apellido_materno);
        nom = String($scope.lista2[i].pro_nomina);
        sea1 = nam.toLowerCase().indexOf(String(val));
        sea2 = nom.toLowerCase().indexOf(String(val));
        if(sea1 > -1 || sea2 > -1){
          $('#lista2')[0].selectedIndex = i+1;
          $('#srrslt1').html("&nbsp;");
          break;
        }else{
          $('#lista2')[0].selectedIndex = 0;
          $('#srrslt1').html("No se encontraron resultados");
        }
      }
    }else if(lis === "lista4"){
      for(i=0;i<$scope.lista4.length;i++){
        nam = String($scope.lista4[i].alu_nombre + " " + $scope.lista4[i].alu_apellido_paterno + " " + $scope.lista4[i].alu_apellido_materno);
        nom = String($scope.lista4[i].alu_matricula);
        sea1 = nam.toLowerCase().indexOf(String(val));
        sea2 = nom.toLowerCase().indexOf(String(val));
        if(sea1 > -1 || sea2 > -1){
          $('#lista4')[0].selectedIndex = i+1;
          $('#srrslt2').html("&nbsp;");
          break;
        }else{
          $('#lista4')[0].selectedIndex = 0;
          $('#srrslt2').html("No se encontraron resultados");
        }
      }
    }
  }
  $scope.addSpaces = function(str){
    return addspcs(str);
  }
  $scope.refreshView();
}]);
/*   TERMINA CONTROLADOR DE PERIODOS Y MATERIAS   */

/*   INICIA CONTROLADOR DE ACTIVIDADES   */
myApp.controller('actividades', ['$scope', '$http', 'getUrl', 'modalConfirm', function ($scope, $http, getUrl, modalConfirm){
  $scope.update = true;
  $scope.program = programas;
  $scope.period = periodos;
  $scope.year = anios;
  $scope.rubricas = [];
  $scope.lista5 = [];
  period = "";
  cla_per = "";
  getUrl.getHTML('/allcompetence').then(function(response){
    $scope.lista3 = response.data;
  });
  $scope.addelem1 = function(){
    $scope.modeloLista2 = {};
  }
  $scope.addelem2 = function(){
    if($scope.modeloLista4){
      $http({
        url: '/getactivitylevels',
        method: 'GET',
        params: {clave: $scope.modeloLista2.act_clave_actividad, subcom: $scope.modeloLista4.sco_clave_subcompetencia}
      })
      .success(function(data){
        if(data){
          $scope.lista5 = data;
          $('.rubricas textarea').each(function(){
            textAreaAdjust(this);
          });
          $http({
            url: '/updateactivityrubric',
            method: 'GET',
            params: {activityrubric: JSON.stringify($scope.lista5), clave: $scope.modeloLista2.act_clave_actividad}
          })
          .success(function(data){
            setTimeout(function(){
              $scope.update3();
            }, 1000);
          });
          $scope.add2 = false;
        }
      });
    }
  }
  $scope.delelem1 = function(){
    data = ['Advertencia: Si borra una actividad se borraran tambien todos las evaluaciones de los alumnos asignados a esta actividad! Segur@ que desea proceder a borrar el registro?'];
    modalConfirm.conf($scope.giveScope(), data, true).then(function(response){
      if(response){
        $http({
          url: '/delactivity',
          method: 'GET',
          params: {actividad: $scope.modeloLista2}
        })
        .success(function(data){
          modalConfirm.conf($scope.giveScope(), data, false).then(function(){
            $scope.update2();
          });
        });
      }
    });
  }
  $scope.delelem2 = function(subcom){
    $http({
      url: '/deleterubric',
      method: 'GET',
      params: {clave: $scope.modeloLista2.act_clave_actividad, subcom: subcom.subcompetence}
    })
    .success(function(data){
      $scope.update3();
    });
  }
  $scope.update1 = function(){
    if(!$scope.program_selected || !$scope.period_selected || !$scope.year_selected){
      delete $scope.lista1;
    }
    if($scope.program_selected && $scope.period_selected && $scope.year_selected){
      $http({
        url: '/allsubjectperiod',
        method: 'GET',
        params: {program: $scope.program_selected, period: $scope.period_selected, year: $scope.year_selected}
      })
      .success(function(data){
        if(data.length){
          $scope.lista1 = [];
          for(i=0;i<data.length;i++){
            $scope.lista1.push(data[i]);
          }
        }else{
          delete $scope.lista1;
        }
      });
    }
  }
  $scope.update2 = function(){
    if($scope.modeloLista1 != null){
      period = $scope.program_selected + "." + $scope.period_selected + "." + $scope.year_selected;
      $http({
        url: '/getclaperiod',
        method: 'GET',
        params: {periodo: period, cla_mat: $scope.modeloLista1.mat_clave_materia}
      })
      .success(function(data){
        cla_per = data;
        $http({
          url: '/getactivities',
          method: 'GET',
          params: {clave: cla_per}
        })
        .success(function(data){
          if(data.length){
            $scope.lista2 = data;
          }else{
            $scope.lista2 = {};
          }
        });
      });
    }
  }
  $scope.update3 = function(){
    $scope.lista5 = [];
    if($scope.modeloLista2 && $scope.modeloLista2.act_nombre){
      $http({
        url: '/getactivitylevels',
        method: 'GET',
        params: {clave: $scope.modeloLista2.act_clave_actividad}
      })
      .success(function(data){
        if(data.length){
          $scope.lista5 = data;
          setTimeout(function(){
            $('.rubricas textarea').each(function(){
              textAreaAdjust(this);
            });
          },500);
          
        }
      });
    }
  }
  $scope.update4 = function(){
    $scope.lista4 = [];
    if($scope.modeloLista3 != null){
      $http({
        url: '/allsubcompetence',
        method: 'GET',
        params: {competencia: $scope.modeloLista3.com_clave_competencia}
      })
      .success(function(data){
        if(data.length){
          $scope.lista4 = data;
        }
      });
    }
  }
  $scope.update5 = function(){
    if($scope.modeloLista4 != null){
      if($scope.lista5.length){
        for(i=0;i<$scope.lista5.length;i++){
          if($scope.lista5[i].subcompetence == $scope.modeloLista4.sco_clave_subcompetencia){
            $scope.add2 = false;
            break;
          }else{
            $scope.add2 = true;
          }
        }
      }else{
        $scope.add2 = true;
      }
    }    
  }
  $scope.update6 = function(data, subcom){
    for(i=0;i<$scope.lista5.length;i++){
      if(subcom === $scope.lista5[i]){
        subcom.level_required = data;
      }
    }
  }
  $scope.cancel1 = function(){
    data = ['Segur@ que no desea guardar cambios?'];
    modalConfirm.conf($scope.giveScope(), data, true).then(function(response){
      if(response){
        $scope.edit1 = !$scope.edit1;
        $scope.add1 = false;
        $scope.modeloLista2 = null;
      }
    });
  }
  $scope.cancel2 = function(){
    $scope.update3();
  }
  $scope.form1 = function(){
    add = false;
    if($scope.add1 && $scope.edit1){
      add = true;
    }else{
      add = false;
    }
    $http({
      url: '/updateactivity',
      method: 'GET',
      params: {clave: cla_per, nombre: $scope.modeloLista2.act_nombre, type_trans: add}
    })
    .success(function(data){
      modalConfirm.conf($scope.giveScope(), data, false).then(function(){
        $scope.modeloLista2 = {};
        $scope.edit1 = !$scope.edit1;
        $scope.add1 = false;
        $scope.update2();
        $scope.update3();
      });
    });
  }
  $scope.form2 = function(){
    if($scope.lista5){
      $http({
        url: '/updateactivityrubric',
        method: 'GET',
        params: {activityrubric: JSON.stringify($scope.lista5), clave: $scope.modeloLista2.act_clave_actividad}
      })
      .success(function(data){
        setTimeout(function(){
          $scope.update3();
        }, 1000);        
      });
    }
  }
  $scope.addSpaces = function(str){
    return addspcs(str);
  }
}]);
/*   TERMINA CONTROLADOR DE ACTIVIDADES   */

/*   INICIA CONTROLADOR DE ACTIVIDADES VISTA TITULAR   */
myApp.controller('actividades_titular', ['$scope', '$http', 'getUrl', 'modalConfirm', function ($scope, $http, getUrl, modalConfirm){
  $scope.update = true;
  $scope.program = programas;
  $scope.period = periodos;
  $scope.year = anios;
  $scope.rubricas = [];
  $scope.lista5 = [];
  period = "";
  cla_per = "";
  getUrl.getHTML('/allcompetence').then(function(response){
    $scope.lista3 = response.data;
  });
  $scope.addelem1 = function(){
    $scope.modeloLista2 = {};
  }
  $scope.addelem2 = function(){
    if($scope.modeloLista4){
      $http({
        url: '/getactivitylevels',
        method: 'GET',
        params: {clave: $scope.modeloLista2.act_clave_actividad, subcom: $scope.modeloLista4.sco_clave_subcompetencia}
      })
      .success(function(data){
        if(data){
          $scope.lista5 = data;
          $('.rubricas textarea').each(function(){
            textAreaAdjust(this);
          });
          $http({
            url: '/updateactivityrubric',
            method: 'GET',
            params: {activityrubric: JSON.stringify($scope.lista5), clave: $scope.modeloLista2.act_clave_actividad}
          })
          .success(function(data){
            setTimeout(function(){
              $scope.update3();
            }, 1000);
          });
          $scope.add2 = false;
        }
      });
    }
  }
  $scope.delelem1 = function(){
    data = ['Advertencia: Si borra una actividad se borraran tambien todos las evaluaciones de los alumnos asignados a esta actividad! Segur@ que desea proceder a borrar el registro?'];
    modalConfirm.conf($scope.giveScope(), data, true).then(function(response){
      if(response){
        $http({
          url: '/delactivity',
          method: 'GET',
          params: {actividad: $scope.modeloLista2}
        })
        .success(function(data){
          modalConfirm.conf($scope.giveScope(), data, false).then(function(){
            $scope.update2();
          });
        });
      }
    });
  }
  $scope.delelem2 = function(subcom){
    $http({
      url: '/deleterubric',
      method: 'GET',
      params: {clave: $scope.modeloLista2.act_clave_actividad, subcom: subcom.subcompetence}
    })
    .success(function(data){
      $scope.update3();
    });
  }
  $scope.update1 = function(){
    if(!$scope.program_selected || !$scope.period_selected || !$scope.year_selected){
      delete $scope.lista1;
    }
    if($scope.program_selected && $scope.period_selected && $scope.year_selected){
      $http({
        url: '/allsubjectinscribed',
        method: 'GET',
        params: {program: $scope.program_selected, period: $scope.period_selected, year: $scope.year_selected}
      })
      .success(function(data){
        if(data.status == "error"){
          modalConfirm.conf($scope.giveScope(), [data.text], false).then(function(){});
        }else{
          if(data.length){
            $scope.lista1 = [];
            for(i=0;i<data.length;i++){
              $scope.lista1.push(data[i]);
            }
          }else{
            delete $scope.lista1;
          }
        }
      });
    }
  }
  $scope.update2 = function(){
    if($scope.modeloLista1 != null){
      period = $scope.program_selected + "." + $scope.period_selected + "." + $scope.year_selected;
      $http({
        url: '/getclaperiod',
        method: 'GET',
        params: {periodo: period, cla_mat: $scope.modeloLista1.mat_clave_materia}
      })
      .success(function(data){
        cla_per = data;
        $http({
          url: '/getactivities',
          method: 'GET',
          params: {clave: cla_per}
        })
        .success(function(data){
          if(data.length){
            $scope.lista2 = data;
          }else{
            $scope.lista2 = {};
          }
        });
      });
    }
  }
  $scope.update3 = function(){
    $scope.lista5 = [];
    if($scope.modeloLista2 && $scope.modeloLista2.act_nombre){
      $http({
        url: '/getactivitylevels',
        method: 'GET',
        params: {clave: $scope.modeloLista2.act_clave_actividad}
      })
      .success(function(data){
        if(data){
          $scope.lista5 = data;
          setTimeout(function(){
            $('.rubricas textarea').each(function(){
              textAreaAdjust(this);
            });
          },500);
          
        }
      });
    }
  }
  $scope.update4 = function(){
    $scope.lista4 = [];
    if($scope.modeloLista3 != null){
      $http({
        url: '/allsubcompetence',
        method: 'GET',
        params: {competencia: $scope.modeloLista3.com_clave_competencia}
      })
      .success(function(data){
        if(data.length){
          $scope.lista4 = data;
        }
      });
    }
  }
  $scope.update5 = function(){
    if($scope.modeloLista4 != null){
      if($scope.lista5.length){
        console.log("si");
        for(i=0;i<$scope.lista5.length;i++){
          if($scope.lista5[i].subcompetence == $scope.modeloLista4.sco_clave_subcompetencia){
            $scope.add2 = false;
            break;
          }else{
            $scope.add2 = true;
          }
        }
      }else{
        console.log("no");
        $scope.add2 = true;
      }
    }    
  }
  $scope.update6 = function(data, subcom){
    for(i=0;i<$scope.lista5.length;i++){
      if(subcom === $scope.lista5[i]){
        subcom.level_required = data;
      }
    }
  }
  $scope.cancel1 = function(){
    data = ['Segur@ que no desea guardar cambios?'];
    modalConfirm.conf($scope.giveScope(), data, true).then(function(response){
      if(response){
        $scope.edit1 = !$scope.edit1;
        $scope.add1 = false;
        $scope.modeloLista2 = null;
      }
    });
  }
  $scope.cancel2 = function(){
    $scope.update3();
  }
  $scope.form1 = function(){
    add = false;
    if($scope.add1 && $scope.edit1){
      add = true;
    }else{
      add = false;
    }
    $http({
      url: '/updateactivity',
      method: 'GET',
      params: {clave: cla_per, nombre: $scope.modeloLista2.act_nombre, type_trans: add}
    })
    .success(function(data){
      modalConfirm.conf($scope.giveScope(), data, false).then(function(){
        $scope.modeloLista2 = {};
        $scope.edit1 = !$scope.edit1;
        $scope.add1 = false;
        $scope.update2();
        $scope.update3();
      });
    });
  }
  $scope.form2 = function(){
    if($scope.lista5){
      $http({
        url: '/updateactivityrubric',
        method: 'GET',
        params: {activityrubric: JSON.stringify($scope.lista5), clave: $scope.modeloLista2.act_clave_actividad}
      })
      .success(function(data){
        setTimeout(function(){
          $scope.update3();
        }, 1000);
      });
    }
  }
  $scope.addSpaces = function(str){
    return addspcs(str);
  }
}]);
/*   TERMINA CONTROLADOR DE ACTIVIDADES VISTA TITULAR   */

/*   INICIA CONTROLADOR DE EVALUACIONES   */
myApp.controller('evaluaciones', ['$scope', '$http', 'getUrl', 'modalConfirm', function ($scope, $http, getUrl, modalConfirm){
  $scope.update = true;
  $scope.program = programas;
  $scope.period = periodos;
  $scope.year = anios;
  $scope.rubricas = [];
  $scope.nombreact = "";
  period = "";
  cla_per = "";
  anterior = "";
  $scope.update1 = function(){
    if(!$scope.program_selected || !$scope.period_selected || !$scope.year_selected){
      delete $scope.lista1;
    }
    if($scope.program_selected && $scope.period_selected && $scope.year_selected){
      $http({
        url: '/allsubjectperiod',
        method: 'GET',
        params: {program: $scope.program_selected, period: $scope.period_selected, year: $scope.year_selected}
      })
      .success(function(data){
        if(data.length){
          $scope.lista1 = [];
          for(i=0;i<data.length;i++){
            $scope.lista1.push(data[i]);
          }
        }else{
          delete $scope.lista1;
        }
      });
    }
  }
  $scope.update2 = function(){
    delete $scope.lista2;
    delete $scope.lista3;
    delete $scope.lista4;
    delete $scope.lista5;
    delete $scope.lista6;
    delete $scope.lista7;
    if($scope.modeloLista1 != null){
      period = $scope.program_selected + "." + $scope.period_selected + "." + $scope.year_selected;
      $http({
        url: '/getclaperiod',
        method: 'GET',
        params: {periodo: period, cla_mat: $scope.modeloLista1.mat_clave_materia}
      })
      .success(function(data){
        cla_per = data;
        $http({
          url: '/courseprofandstud',
          method: 'GET',
          params: {clave: cla_per}
        })
        .success(function(data){
          if(data.prof.length || data.stud.length){
            $scope.lista2 = data.prof[0];
            $scope.lista3 = data.stud[0];
            $scope.lista4 = data.stud[0];
            $scope.lista5 = data.rel[0];
            $http({
              url: '/getactivities',
              method: 'GET',
              params: {clave: cla_per}
            })
            .success(function(data){
              if(data.length){
                $scope.lista6 = data;
              }
            });
          }
        });
      });
    }
  }
  $scope.update3 = function(){
    $scope.lista3 = [];
    if($scope.modeloLista2 == null){
      $scope.lista3 = $scope.lista4;
    }else{
      for(i=0;i<$scope.lista5.length;i++){
        if($scope.modeloLista2.pro_nomina == $scope.lista5[i].apm_nomina_profesor){
          for(j=0;j<$scope.lista4.length;j++){
            if($scope.lista4[j].alu_matricula == $scope.lista5[i].apm_matricula_alumno){
              $scope.lista3.push($scope.lista4[j]);
            }
          }
        }
      }
    }
  }
  $scope.update4 = function(){
    $scope.clavact = {};
  }
  $scope.update5 = function(nom){
    if($scope.clavact && $scope.modeloLista3.alu_matricula){
      $scope.nombreact = nom;
      $http({
        url: '/getevaluations',
        method: 'GET',
        params: {clavact: $scope.clavact, student: $scope.modeloLista3.alu_matricula}
      })
      .success(function(data){
        if(data.length){
          $scope.comentary = data[0].eva_comentario;
          $scope.feedup = data[0].eva_feedup;
          $scope.feedback = data[0].eva_feedback;
          $scope.feedforward = data[0].eva_feedforward;
          $scope.evaluation = data[0].eva_clave;
          $http({
            url: '/getevaldetails',
            method: 'GET',
            params: {clavact: $scope.clavact, eval: $scope.evaluation}
          })
          .success(function(data){
            if(data.length){
              $scope.lista7 = data;
              $scope.refreshChart();
            }
          });
        }
      });
    }
  }
  $scope.update6 = function(subcom){
    if(anterior == subcom.level_assigned){
      subcom.level_assigned = "";
    }
    anterior = subcom.level_assigned;
    $scope.refreshChart();
  }
  $scope.refreshChart = function(){
    if($scope.lista7.length){
      labs = [];
      perx = [];
      levi = [];
      for(i=0;i<$scope.lista7.length;i++){
        labs.push($scope.lista7[i].subcompetence);
        perx.push($scope.lista7[i].level_required);
        levi.push($scope.lista7[i].level_assigned);
      }
      var ctx = document.getElementById("myChart").getContext("2d");
      var data = {
        labels: labs,
          datasets: [
              {
                  label: "Perfil Experto",
                  fillColor: "rgba(188,188,188,0.7)",
                  strokeColor: "rgba(188,188,188,1)",
                  pointColor: "rgba(188,188,188,1)",
                  pointStrokeColor: "#fff",
                  pointHighlightFill: "#fff",
                  pointHighlightStroke: "rgba(188,188,188,1)",
                  data: perx
              },
              {
                  label: "Evaluación obtenida",
                  fillColor: "rgba(123,185,229,0.7)",
                  strokeColor: "rgba(123,185,229,1)",
                  pointColor: "rgba(123,185,229,1)",
                  pointStrokeColor: "#fff",
                  pointHighlightFill: "#fff",
                  pointHighlightStroke: "rgba(123,185,229,1)",
                  data: levi
              }
          ]
      };
      if(perx.length > 2 || levi.length > 2){
        var myChart = new Chart(ctx).Radar(data, chart_options);
      }else{
        var myChart = new Chart(ctx).Line(data, chart_options);
      }             
      document.getElementById('js-legend').innerHTML = myChart.generateLegend();
    }
  }
  $scope.cancel1 = function(){
    $scope.update5();
  }
  $scope.form1 = function(){
    if($scope.comentary.length && $scope.feedup.length && $scope.feedback.length && $scope.feedforward.length){
      $http({
        url: '/updatevaluations',
        method: 'GET',
        params: {claeval: $scope.evaluation, clavact: $scope.clavact, student: $scope.modeloLista3.alu_matricula, comentary: $scope.comentary, feedup: $scope.feedup, feedback: $scope.feedback, feedforward: $scope.feedforward, evaluations: JSON.stringify($scope.lista7)}
      })
      .success(function(data){
        if(data.length){
          modalConfirm.conf($scope.giveScope(), data, false).then(function(){});
        }
      });
    }
  }
  $scope.addSpaces = function(str){
    return addspcs(str);
  }
}]);
/*   TERMINA CONTROLADOR DE EVALUACIONES   */

/*   INICIA CONTROLADOR DE EVALUACIONES DE PROFESOR   */
myApp.controller('evaluaciones_profesor', ['$scope', '$http', 'getUrl', 'modalConfirm', function ($scope, $http, getUrl, modalConfirm){
  $scope.update = true;
  $scope.program = programas;
  $scope.period = periodos;
  $scope.year = anios;
  $scope.rubricas = [];
  $scope.nombreact = "";
  period = "";
  cla_per = "";
  anterior = "";
  $scope.update1 = function(){
    if(!$scope.program_selected || !$scope.period_selected || !$scope.year_selected){
      delete $scope.lista1;
    }
    if($scope.program_selected && $scope.period_selected && $scope.year_selected){
      $http({
        url: '/allsubjectinscribed',
        method: 'GET',
        params: {program: $scope.program_selected.value, period: $scope.period_selected.value, year: 'Y'+$scope.year_selected}
      })
      .success(function(data){
        if(data.status == "error"){
          modalConfirm.conf($scope.giveScope(), [data.text], false).then(function(){});
          delete $scope.lista1;
          delete $scope.lista2;
          delete $scope.clavact;
        }else{
          if(data.length){
            $scope.lista1 = [];
            for(i=0;i<data.length;i++){
              $scope.lista1.push(data[i]);
            }
          }
        }
      });
    }
  }
  $scope.update2 = function(){
    delete $scope.lista2;
    delete $scope.lista3;
    delete $scope.lista4;
    if($scope.modeloLista1 != null){
      period = $scope.program_selected.value + "." + $scope.period_selected.value + ".Y" + $scope.year_selected;
      $http({
        url: '/getclaperiod',
        method: 'GET',
        params: {periodo: period, cla_mat: $scope.modeloLista1.mat_clave_materia}
      })
      .success(function(data){
        if(data.length){
          cla_per = data;
          $http({
            url: '/getmystudents',
            method: 'GET',
            params: {clave: cla_per}
          })
          .success(function(data){
            if(data.status == "error"){
              modalConfirm.conf($scope.giveScope(), [data.text], false).then(function(){});
            }else{
              $scope.lista2 = data;
              $http({
                url: '/getactivities',
                method: 'GET',
                params: {clave: cla_per}
              })
              .success(function(data){
                if(data.length){
                  $scope.lista3 = data;
                }
              });
            }
          });
        }
      });
    }
  }
  $scope.update3 = function(){
    $scope.clavact = {};
  }
  $scope.update4 = function(nom){
    if($scope.clavact && $scope.modeloLista2.alu_matricula){
      $scope.nombreact = nom;
      $http({
        url: '/getevaluations',
        method: 'GET',
        params: {clavact: $scope.clavact, student: $scope.modeloLista2.alu_matricula}
      })
      .success(function(data){
        if(data.length){
          $scope.comentary = data[0].eva_comentario;
          $scope.feedup = data[0].eva_feedup;
          $scope.feedback = data[0].eva_feedback;
          $scope.feedforward = data[0].eva_feedforward;
          $scope.evaluation = data[0].eva_clave;
          $http({
            url: '/getevaldetails',
            method: 'GET',
            params: {clavact: $scope.clavact, eval: $scope.evaluation}
          })
          .success(function(data){
            if(data.length){
              $scope.lista4 = data;
              $scope.refreshChart();
            }
          });
        }
      });
    }
  }
  $scope.update6 = function(subcom){
    if(anterior == subcom.level_assigned){
      subcom.level_assigned = "";
    }
    anterior = subcom.level_assigned;
    $scope.refreshChart();
  }
  $scope.refreshChart = function(){
    if($scope.lista4.length){
      labs = [];
      perx = [];
      levi = [];
      for(i=0;i<$scope.lista4.length;i++){
        labs.push($scope.lista4[i].subcompetence);
        perx.push($scope.lista4[i].level_required);
        levi.push($scope.lista4[i].level_assigned);
      }
      var ctx = document.getElementById("myChart").getContext("2d");
      var data = {
        labels: labs,
          datasets: [
              {
                  label: "Perfil Experto",
                  fillColor: "rgba(188,188,188,0.7)",
                  strokeColor: "rgba(188,188,188,1)",
                  pointColor: "rgba(188,188,188,1)",
                  pointStrokeColor: "#fff",
                  pointHighlightFill: "#fff",
                  pointHighlightStroke: "rgba(188,188,188,1)",
                  data: perx
              },
              {
                  label: "Evaluación obtenida",
                  fillColor: "rgba(123,185,229,0.7)",
                  strokeColor: "rgba(123,185,229,1)",
                  pointColor: "rgba(123,185,229,1)",
                  pointStrokeColor: "#fff",
                  pointHighlightFill: "#fff",
                  pointHighlightStroke: "rgba(123,185,229,1)",
                  data: levi
              }
          ]
      };
      if(perx.length > 2 || levi.length > 2){
        var myChart = new Chart(ctx).Radar(data, chart_options);
      }else{
        var myChart = new Chart(ctx).Line(data, chart_options);
      }             
      document.getElementById('js-legend').innerHTML = myChart.generateLegend();
    }
  }
  $scope.cancel1 = function(){
    $scope.update4();
  }
  $scope.form1 = function(){
    if($scope.comentary.length && $scope.feedup.length && $scope.feedback.length && $scope.feedforward.length){
      $http({
        url: '/updatevaluations',
        method: 'GET',
        params: {claeval: $scope.evaluation, clavact: $scope.clavact, student: $scope.modeloLista2.alu_matricula, comentary: $scope.comentary, feedup: $scope.feedup, feedback: $scope.feedback, feedforward: $scope.feedforward, evaluations: JSON.stringify($scope.lista4)}
      })
      .success(function(data){
        if(data.length){
          modalConfirm.conf($scope.giveScope(), data, false).then(function(){});
        }
      });
    }
  }
  $scope.addSpaces = function(str){
    return addspcs(str);
  }
}]);
/*   TERMINA CONTROLADOR DE EVALUACIONES DE PROFESOR   */

/*   INICIA CONTROLADOR DE EVALUACIONES DEL PROFESOR TITULAR   */
myApp.controller('evaluaciones_titular', ['$scope', '$http', 'getUrl', 'modalConfirm', function ($scope, $http, getUrl, modalConfirm){
  $scope.update = true;
  $scope.program = programas;
  $scope.period = periodos;
  $scope.year = anios;
  $scope.rubricas = [];
  $scope.nombreact = "";
  period = "";
  cla_per = "";
  anterior = "";
  $scope.update1 = function(){
    if(!$scope.program_selected || !$scope.period_selected || !$scope.year_selected){
      delete $scope.lista1;
    }
    if($scope.program_selected && $scope.period_selected && $scope.year_selected){
      $http({
        url: '/allsubjectinscribed',
        method: 'GET',
        params: {program: $scope.program_selected, period: $scope.period_selected, year: $scope.year_selected}
      })
      .success(function(data){
        if(data.length){
          $scope.lista1 = [];
          for(i=0;i<data.length;i++){
            $scope.lista1.push(data[i]);
          }
        }else{
          delete $scope.lista1;
        }
      });
    }
  }
  $scope.update2 = function(){
    delete $scope.lista2;
    delete $scope.lista3;
    delete $scope.lista4;
    delete $scope.lista5;
    delete $scope.lista6;
    delete $scope.lista7;
    if($scope.modeloLista1 != null){
      period = $scope.program_selected + "." + $scope.period_selected + "." + $scope.year_selected;
      $http({
        url: '/getclaperiod',
        method: 'GET',
        params: {periodo: period, cla_mat: $scope.modeloLista1.mat_clave_materia}
      })
      .success(function(data){
        cla_per = data;
        $http({
          url: '/courseprofandstud',
          method: 'GET',
          params: {clave: cla_per}
        })
        .success(function(data){
          if(data.prof.length || data.stud.length){
            $scope.lista2 = data.prof[0];
            $scope.lista3 = data.stud[0];
            $scope.lista4 = data.stud[0];
            $scope.lista5 = data.rel[0];
            $http({
              url: '/getactivities',
              method: 'GET',
              params: {clave: cla_per}
            })
            .success(function(data){
              if(data.length){
                $scope.lista6 = data;
              }
            });
          }
        });
      });
    }
  }
  $scope.update3 = function(){
    $scope.lista3 = [];
    if($scope.modeloLista2 == null){
      $scope.lista3 = $scope.lista4;
    }else{
      for(i=0;i<$scope.lista5.length;i++){
        if($scope.modeloLista2.pro_nomina == $scope.lista5[i].apm_nomina_profesor){
          for(j=0;j<$scope.lista4.length;j++){
            if($scope.lista4[j].alu_matricula == $scope.lista5[i].apm_matricula_alumno){
              $scope.lista3.push($scope.lista4[j]);
            }
          }
        }
      }
    }
  }
  $scope.update4 = function(){
    $scope.clavact = {};
  }
  $scope.update5 = function(nom){
    if($scope.clavact && $scope.modeloLista3.alu_matricula){
      $scope.nombreact = nom;
      $http({
        url: '/getevaluations',
        method: 'GET',
        params: {clavact: $scope.clavact, student: $scope.modeloLista3.alu_matricula}
      })
      .success(function(data){
        if(data.length){
          $scope.comentary = data[0].eva_comentario;
          $scope.feedup = data[0].eva_feedup;
          $scope.feedback = data[0].eva_feedback;
          $scope.feedforward = data[0].eva_feedforward;
          $scope.evaluation = data[0].eva_clave;
          $http({
            url: '/getevaldetails',
            method: 'GET',
            params: {clavact: $scope.clavact, eval: $scope.evaluation}
          })
          .success(function(data){
            if(data.length){
              $scope.lista7 = data;
              $scope.refreshChart();
            }
          });
        }
      });
    }
  }
  $scope.update6 = function(subcom){
    if(anterior == subcom.level_assigned){
      subcom.level_assigned = "";
    }
    anterior = subcom.level_assigned;
    $scope.refreshChart();
  }
  $scope.refreshChart = function(){
    if($scope.lista7.length){
      labs = [];
      perx = [];
      levi = [];
      for(i=0;i<$scope.lista7.length;i++){
        labs.push($scope.lista7[i].subcompetence);
        perx.push($scope.lista7[i].level_required);
        levi.push($scope.lista7[i].level_assigned);
      }
      var ctx = document.getElementById("myChart").getContext("2d");
      var data = {
        labels: labs,
          datasets: [
              {
                  label: "Perfil Experto",
                  fillColor: "rgba(188,188,188,0.7)",
                  strokeColor: "rgba(188,188,188,1)",
                  pointColor: "rgba(188,188,188,1)",
                  pointStrokeColor: "#fff",
                  pointHighlightFill: "#fff",
                  pointHighlightStroke: "rgba(188,188,188,1)",
                  data: perx
              },
              {
                  label: "Evaluación obtenida",
                  fillColor: "rgba(123,185,229,0.7)",
                  strokeColor: "rgba(123,185,229,1)",
                  pointColor: "rgba(123,185,229,1)",
                  pointStrokeColor: "#fff",
                  pointHighlightFill: "#fff",
                  pointHighlightStroke: "rgba(123,185,229,1)",
                  data: levi
              }
          ]
      };
      if(perx.length > 2 || levi.length > 2){
        var myChart = new Chart(ctx).Radar(data, chart_options);
      }else{
        var myChart = new Chart(ctx).Line(data, chart_options);
      }             
      document.getElementById('js-legend').innerHTML = myChart.generateLegend();
    }
  }
  $scope.cancel1 = function(){
    $scope.update5();
  }
  $scope.form1 = function(){
    if($scope.comentary.length && $scope.feedup.length && $scope.feedback.length && $scope.feedforward.length){
      $http({
        url: '/updatevaluations',
        method: 'GET',
        params: {claeval: $scope.evaluation, clavact: $scope.clavact, student: $scope.modeloLista3.alu_matricula, comentary: $scope.comentary, feedup: $scope.feedup, feedback: $scope.feedback, feedforward: $scope.feedforward, evaluations: JSON.stringify($scope.lista7)}
      })
      .success(function(data){
        if(data.length){
          modalConfirm.conf($scope.giveScope(), data, false).then(function(){});
        }
      });
    }
  }
  $scope.addSpaces = function(str){
    return addspcs(str);
  }
}]);
/*   TERMINA CONTROLADOR DE EVALUACIONES DEL PROFESOR TITULAR   */

/*   INICIA CONTROLADOR DE REPORTES   */
myApp.controller('reportes', ['$scope', '$http', 'getUrl', 'modalConfirm', function ($scope, $http, getUrl, modalConfirm){
  $scope.update = true;
  $scope.program = programas;
  $scope.period = periodos;
  $scope.year = anios;
  $scope.fecha = fecha;
  $scope.rubricas = [];
  $scope.nombreact = "";
  $scope.profesor = "";
  $scope.evaluacion = "";
  period = "";
  cla_per = "";
  anterior = "";
  $scope.update1 = function(){
    if(!$scope.program_selected || !$scope.period_selected || !$scope.year_selected){
      delete $scope.lista1;
    }
    if($scope.program_selected && $scope.period_selected && $scope.year_selected){
      $http({
        url: '/allsubjectperiod',
        method: 'GET',
        params: {program: $scope.program_selected.value, period: $scope.period_selected.value, year: 'Y'+$scope.year_selected}
      })
      .success(function(data){
        if(data.length){
          $scope.lista1 = [];
          for(i=0;i<data.length;i++){
            $scope.lista1.push(data[i]);
          }
        }else{
          delete $scope.lista1;
          delete $scope.lista6;
          delete $scope.clavact;
        }
      });
    }
  }
  $scope.update2 = function(){
    if($scope.modeloLista1 != null){
      period = $scope.program_selected.value + "." + $scope.period_selected.value + ".Y" + $scope.year_selected;
      $http({
        url: '/getclaperiod',
        method: 'GET',
        params: {periodo: period, cla_mat: $scope.modeloLista1.mat_clave_materia}
      })
      .success(function(data){
        cla_per = data;
        $http({
          url: '/courseprofandstud',
          method: 'GET',
          params: {clave: cla_per}
        })
        .success(function(data){
          if(data.prof.length || data.stud.length){
            $scope.lista2 = data.prof[0];
            $scope.lista3 = data.stud[0];
            $scope.lista4 = data.stud[0];
            $scope.lista5 = data.rel[0];
            $http({
              url: '/getactivities',
              method: 'GET',
              params: {clave: cla_per}
            })
            .success(function(data){
              if(data.length){
                $scope.lista6 = data;
              }
            });
          }
        });
      });
    }else{
      $scope.lista2 = {};
      $scope.lista3 = {};
      $scope.lista4 = {};
      $scope.lista5 = {};
      $scope.lista6 = {};
    }
  }
  $scope.update3 = function(){
    $scope.lista3 = [];
    if($scope.modeloLista2 == null){
      $scope.lista3 = $scope.lista4;
    }else{
      for(i=0;i<$scope.lista5.length;i++){
        if($scope.modeloLista2.pro_nomina == $scope.lista5[i].apm_nomina_profesor){
          for(j=0;j<$scope.lista4.length;j++){
            if($scope.lista4[j].alu_matricula == $scope.lista5[i].apm_matricula_alumno){
              $scope.lista3.push($scope.lista4[j]);
            }
          }
        }
      }
    }
  }
  $scope.update4 = function(){
    $scope.clavact = {};
    nomin = "";
    if($scope.modeloLista3){
      for(i=0;i<$scope.lista5.length;i++){
        if($scope.modeloLista3.alu_matricula == $scope.lista5[i].apm_matricula_alumno){
          nomin = $scope.lista5[i].apm_nomina_profesor;
        }
      }
      for(i=0;i<$scope.lista2.length;i++){
        if($scope.lista2[i].pro_nomina == nomin){
          $scope.profesor = $scope.lista2[i].pro_nombre + " " + $scope.lista2[i].pro_apellido_paterno + " " + $scope.lista2[i].pro_apellido_materno;
        }
      }
    }
    
  }
  $scope.update5 = function(nom, ind){
    $scope.evaluacion = ind + 1;
    if($scope.clavact && $scope.modeloLista3.alu_matricula){
      $scope.nombreact = nom;
      $http({
        url: '/getevaluations',
        method: 'GET',
        params: {clavact: $scope.clavact, student: $scope.modeloLista3.alu_matricula}
      })
      .success(function(data){
        if(data.length){
          $scope.comentary = data[0].eva_comentario;
          $scope.feedup = data[0].eva_feedup;
          $scope.feedback = data[0].eva_feedback;
          $scope.feedforward = data[0].eva_feedforward;
          $scope.evaluation = data[0].eva_clave;
          $http({
            url: '/getevaldetails',
            method: 'GET',
            params: {clavact: $scope.clavact, eval: $scope.evaluation}
          })
          .success(function(data){
            if(data.length){
              $scope.lista7 = data;
              labs = [];
              perx = [];
              levi = [];
              for(i=0;i<$scope.lista7.length;i++){
                labs.push($scope.lista7[i].subcompetence);
                perx.push($scope.lista7[i].level_required);
                levi.push($scope.lista7[i].level_assigned);
              }
              var ctx = document.getElementById("myChart").getContext("2d");
              var data = {
                labels: labs,
                  datasets: [
                      {
                          label: "Perfil Experto",
                          fillColor: "rgba(188,188,188,0.7)",
                          strokeColor: "rgba(188,188,188,1)",
                          pointColor: "rgba(188,188,188,1)",
                          pointStrokeColor: "#fff",
                          pointHighlightFill: "#fff",
                          pointHighlightStroke: "rgba(188,188,188,1)",
                          data: perx
                      },
                      {
                          label: "Evaluación obtenida",
                          fillColor: "rgba(123,185,229,0.7)",
                          strokeColor: "rgba(123,185,229,1)",
                          pointColor: "rgba(123,185,229,1)",
                          pointStrokeColor: "#fff",
                          pointHighlightFill: "#fff",
                          pointHighlightStroke: "rgba(123,185,229,1)",
                          data: levi
                      }
                  ]
              };
              if(perx.length > 2 || levi.length > 2){
                var myChart = new Chart(ctx).Radar(data, chart_options);
              }else{
                var myChart = new Chart(ctx).Line(data, chart_options);
              }             
              document.getElementById('js-legend').innerHTML = myChart.generateLegend();
            }
          });

          $('#cmd').click(function () {
            var pdf = new jsPDF('p', 'pt', 'a2');
            var options = {
                     pagesplit: true,
                     format : 'PNG'
                };

            pdf.addHTML($("#reporte"), options, function()
            {
                pdf.save("test.pdf");
            });          
          });
        }
      });
    }
  }
  $scope.addSpaces = function(str){
    return addspcs(str);
  }
}]);
/*   TERMINA CONTROLADOR DE REPORTES   */

/*   INICIA CONTROLADOR DE REPORTES DE LA VISTA DE ALUMNO   */
myApp.controller('reportes_alumno', ['$scope', '$http', 'getUrl', 'modalConfirm', function ($scope, $http, getUrl, modalConfirm){
  $scope.update = true;
  $scope.program = programas;
  $scope.period = periodos;
  $scope.year = anios;
  $scope.fecha = fecha;
  $scope.rubricas = [];
  $scope.nombreact = "";
  $scope.profesor = "";
  $scope.evaluacion = "";
  period = "";
  cla_per = "";
  anterior = "";
  $scope.update1 = function(){
    if(!$scope.program_selected || !$scope.period_selected || !$scope.year_selected){
      delete $scope.lista1;
    }
    if($scope.program_selected && $scope.period_selected && $scope.year_selected){
      $http({
        url: '/allsubjectinscribed',
        method: 'GET',
        params: {program: $scope.program_selected.value, period: $scope.period_selected.value, year: 'Y'+$scope.year_selected}
      })
      .success(function(data){
        if(data.status == "error"){
          modalConfirm.conf($scope.giveScope(), [data.text], false).then(function(){});
          delete $scope.lista1;
          delete $scope.lista2;
          delete $scope.clavact;
        }else{
          if(data.length){
            $scope.lista1 = [];
            for(i=0;i<data.length;i++){
              $scope.lista1.push(data[i]);
            }
          }
        }
      });
    }
  }
  $scope.update2 = function(){
    if($scope.modeloLista1 != null){
      period = $scope.program_selected.value + "." + $scope.period_selected.value + ".Y" + $scope.year_selected;
      $http({
        url: '/getclaperiod',
        method: 'GET',
        params: {periodo: period, cla_mat: $scope.modeloLista1.mat_clave_materia}
      })
      .success(function(data){
        cla_per = data;
        $http({
          url: '/getactivities',
          method: 'GET',
          params: {clave: cla_per}
        })
        .success(function(data){
          if(data.length){
            $scope.lista2 = data;
          }
        });
      });
    }else{
      $scope.lista2 = {};
      $scope.lista3 = {};
    }
  }
  $scope.update3 = function(nom, ind){
    $http({
      url: '/getme',
      method: 'GET',
    })
    .success(function(data){
      if(data.length){
        $scope.modeloLista2 = data[0];
        $scope.evaluacion = ind + 1;
        if(cla_per && $scope.modeloLista2.alu_matricula){
          $http({
            url: '/getprofesor',
            method: 'GET',
            params: {clave: cla_per, student: $scope.modeloLista2.alu_matricula}
          })
          .success(function(data){
          if(data.length){
              $scope.profesor = data[0].pro_nombre + " " + data[0].pro_apellido_paterno + " " + data[0].pro_apellido_materno;
              if($scope.clavact && $scope.modeloLista2.alu_matricula){
              $scope.nombreact = nom;
              $http({
                url: '/getevaluations',
                method: 'GET',
                params: {clavact: $scope.clavact, student: $scope.modeloLista2.alu_matricula}
              })
              .success(function(data){
                if(data.length){
                  $scope.comentary = data[0].eva_comentario;
                  $scope.feedup = data[0].eva_feedup;
                  $scope.feedback = data[0].eva_feedback;
                  $scope.feedforward = data[0].eva_feedforward;
                  $scope.evaluation = data[0].eva_clave;
                  $http({
                    url: '/getevaldetails',
                    method: 'GET',
                    params: {clavact: $scope.clavact, eval: $scope.evaluation}
                  })
                  .success(function(data){
                    if(data.status == "error"){
                      modalConfirm.conf($scope.giveScope(), [data.text], false).then(function(){});
                      delete $scope.lista3;
                    }else{
                      $scope.lista3 = data;
                      labs = [];
                      perx = [];
                      levi = [];
                      for(i=0;i<$scope.lista3.length;i++){
                        labs.push($scope.lista3[i].subcompetence);
                        perx.push($scope.lista3[i].level_required);
                        levi.push($scope.lista3[i].level_assigned);
                      }
                      var ctx = document.getElementById("myChart").getContext("2d");
                      var data = {
                        labels: labs,
                          datasets: [
                              {
                                  label: "Perfil Experto",
                                  fillColor: "rgba(188,188,188,0.7)",
                                  strokeColor: "rgba(188,188,188,1)",
                                  pointColor: "rgba(188,188,188,1)",
                                  pointStrokeColor: "#fff",
                                  pointHighlightFill: "#fff",
                                  pointHighlightStroke: "rgba(188,188,188,1)",
                                  data: perx
                              },
                              {
                                  label: "Evaluación obtenida",
                                  fillColor: "rgba(123,185,229,0.7)",
                                  strokeColor: "rgba(123,185,229,1)",
                                  pointColor: "rgba(123,185,229,1)",
                                  pointStrokeColor: "#fff",
                                  pointHighlightFill: "#fff",
                                  pointHighlightStroke: "rgba(123,185,229,1)",
                                  data: levi
                              }
                          ]
                      };
                      if(perx.length > 2 || levi.length > 2){
                        var myChart = new Chart(ctx).Radar(data, chart_options);
                      }else{
                        var myChart = new Chart(ctx).Line(data, chart_options);
                      }             
                      document.getElementById('js-legend').innerHTML = myChart.generateLegend();
                    }
                  });
                  $('#cmd').click(function () {

                    var imgData = new Image();
                    var pdf = new jsPDF('p', 'pt', 'letter');
                    var element = document.getElementById('reporte');
                    html2canvas(element, {
                      onrendered: function(canvas) {

                        imgData.src = canvas.toDataURL("image/png");
                        imgData.width = 550;
                        imgData.height = 600;
                        $('#imgcanplc').append(imgData);
                        $('#imgcanplc').show();
                        source = $('#imgcanplc')[0];
                        $('#imgcanplc').hide();
                        specialElementHandlers = {
                            '#bypassme': function (element, renderer) {
                                return true
                            }
                        };
                        margins = {
                          top: 40,
                          bottom: 60,
                          left: 40,
                          width: 700
                        };
                        pdf.fromHTML(
                        source, // HTML string or DOM elem ref.
                        margins.left, // x coord
                        margins.top, { // y coord
                            'width': margins.width, // max width of content on PDF
                            'elementHandlers': specialElementHandlers
                        },

                        function (dispose) {
                            /*pdf.addImage(imgData, 'JPEG', 0, 0);*/
                            // dispose: object with X, Y of the last line add to the PDF 
                            //          this allow the insertion of new lines after html
                            pdf.save($scope.modeloLista1.mat_clave_materia+'_'+$scope.year_selected+'_'+$scope.modeloLista2.alu_matricula+'.pdf');
                        }, margins);
                      }
                    });
                  });
                }
              });
            }
            }
          });
        }
      }
    });    
  }
  $scope.addSpaces = function(str){
    return addspcs(str);
  }
}]);
/*   TERMINA CONTROLADOR DE REPORTES DE LA VISTA DE ALUMNO   */

/*   INICIA CONTROLADOR DE PROFESORES   */
myApp.controller('profesores', ['$scope', '$http', 'getUrl', 'modalConfirm', function ($scope, $http, getUrl, modalConfirm){
  $scope.refreshView = function(){
    getUrl.getHTML('/allprofesor').then(function(response){
      $scope.lista1 = response.data;
    });
  }  
  $scope.cancel1 = function(){
    data = ['Segur@ que no desea guardar cambios?'];
    modalConfirm.conf($scope.giveScope(), data, true).then(function(response){
      if(response){
        $scope.edit1 = !$scope.edit1;
        $scope.add1 = false;
        $scope.modeloLista1 = null;
      }
    });
  }
  $scope.addelem1 = function(){
    text = "";
    $scope.modeloLista1 = 0;
    possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for(i=0;i<15;i++){
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    setTimeout(function(){
      $scope.modeloLista1 = {pro_password: text};
    },500);
  }
  $scope.delelem1 = function(){
    data = ['Segur@ que desea borrar el registro'];
    modalConfirm.conf($scope.giveScope(), data, true).then(function(response){
      if(response){
        $http({
          url: '/delprofesor',
          method: 'GET',
          params: {profesor: $scope.modeloLista1.pro_nomina}
        })
        .success(function(data){
          modalConfirm.conf($scope.giveScope(), data, false).then(function(){
            $scope.refreshView();
          });
        });
      }
    });
  }
  $scope.form1 = function(){
    $http({
      url: '/updateprofesor',
      method: 'GET',
      params: {profesor: $scope.modeloLista1}
    })
    .success(function(data){
      modalConfirm.conf($scope.giveScope(), data, false).then(function(){
        $scope.edit1 = !$scope.edit1;
        $scope.add1 = false;
        $scope.modeloLista1 = null;
        $scope.refreshView();
      });
    });
  }
  $scope.refreshView();
}]);
/*   TERMINA CONTROLADOR DE PROFESORES   */

/*   INICIA CONTROLADOR DE ALUMNOS   */
myApp.controller('alumnos', ['$scope', '$http', 'getUrl', 'modalConfirm', function ($scope, $http, getUrl, modalConfirm){
  $scope.refreshView = function(){
    getUrl.getHTML('/allstudent').then(function(response){
      $scope.lista1 = response.data;
    });
  }  
  $scope.cancel1 = function(){
    data = ['Segur@ que no desea guardar cambios?'];
    modalConfirm.conf($scope.giveScope(), data, true).then(function(response){
      if(response){
        $scope.edit1 = !$scope.edit1;
        $scope.add1 = false;
        $scope.modeloLista1 = null;
      }
    });
  }
  $scope.addelem1 = function(){
    text = "";
    $scope.modeloLista1 = 0;
    possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for(i=0;i<15;i++){
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    setTimeout(function(){
      $scope.modeloLista1 = {alu_password: text};
    },500);
  }
  $scope.delelem1 = function(){
    data = ['Segur@ que desea borrar el registro'];
    modalConfirm.conf($scope.giveScope(), data, true).then(function(response){
      if(response){
        $http({
          url: '/delstudent',
          method: 'GET',
          params: {alumno: $scope.modeloLista1.alu_matricula}
        })
        .success(function(data){
          modalConfirm.conf($scope.giveScope(), data, false).then(function(){
            $scope.refreshView();
          });
        });
      }
    });
  }
  $scope.form1 = function(){
    add = false;
    if($scope.add1 && $scope.edit1){
      add = true;
    }else{
      add = false;
    }
    $http({
      url: '/updatestudent',
      method: 'GET',
      params: {alumno: $scope.modeloLista1, type_trans: add}
    })
    .success(function(data){
      modalConfirm.conf($scope.giveScope(), data, false).then(function(){
        $scope.edit1 = !$scope.edit1;
        $scope.add1 = false;
        $scope.modeloLista1 = null;
        $scope.refreshView();
      });
    });
  }
  $scope.refreshView();
}]);
/*   TERMINA CONTROLADOR DE ALUMNOS   */