var app = angular.module("MyApp", ['ui.bootstrap', 'ui.grid', 'ui.grid.pagination', 'ui.grid.selection', 'ui.grid.exporter', 'ui.grid.moveColumns', 'ui.grid.edit']).run(function ($http) {
    var userDetail = JSON.parse(window.localStorage.getItem('UserDe'));
    var accesstoken = sessionStorage.getItem('accessToken');
    if (accesstoken) {
        var decrypted = CryptoJS.AES.decrypt(accesstoken, "superman");
        // $http.defaults.headers.common.Authorization = "bearer " + decrypted.toString(CryptoJS.enc.Utf8);
        $http.defaults.headers.common["Content-Type"] = "application/json";
    }
});
app.controller("DropdownCtrl", function ($scope, $http, $modal, $rootScope, $window, $log, $timeout) {
    Role();
    GetCountries();
    $rootScope.UserDetail = {
        UserName: '',
        Password: '',
        LastName: '',
        Phone: '',
        Email: '',
        keyword: '',
        Role: '',
        RoleID: '',
        RoleName: '',
        countries: '',
        CountryId: '',
        IsActive: '',
        ID: '',
        WorkerID: '',
        Name: ''
    };
    $scope.Worker = false;
    $scope.payGroup = {};
    $scope.SaveUser = function () {

        $http.post(VirtualDirectoryPath + 'api/User/SaveUserDetails', $rootScope.UserDetail).success(function (response) {
            alert("New User Submitted  Successfully.");
            window.location = VirtualDirectoryPath + '/SaveData/DashBoard';

        }).error(function (response) {
        });
    }
    $scope.SearchDetails = function (keyword) {
        return $http.get(VirtualDirectoryPath + 'api/User/GetListByID?keyword=' + $rootScope.UserDetail.keyword).success(function (data) {
            if (data.Status === false) {
                $scope.gridOptions1 = data.Results.Data[0];
                //return data.Results;
            }
        }).error(function (err) {
        });
    }



    $scope.SignIn = function (UserName, Password) {
        $scope.UserID = 0;
        $http({
            url: VirtualDirectoryPath + 'api/User/CheckLogin',
            method: 'POST',
            params: { UserName: UserName, Password: Password }
        }).success(function (res) {
            if (res.Status === true) {

                var User = {
                    UserId: res.Results.UserID,
                    UserName: res.Results.UserName,
                    UserRole: res.Results.Role,
                    TokenID: CryptoJS.AES.encrypt(res.Results.TokenID, "superman").toString()
                };
                $scope.UserID = res.Results.UserID;
                $scope.UserData = res.Results;
              
                
                sessionStorage.setItem('accessToken', res.Results.TokenID);
                $scope.message = res.Results.UserID;
                window.location = VirtualDirectoryPath + '/SaveData/DashBoard';
                //url: VirtualDirectoryPath + '/SaveData/CheckLogin';
                //Allow headers only for first login 
                 $http.defaults.headers.common.Authorization = "bearer " + res.Results.TokenID;
            }

        }).error(function (e) {

            alert(JSON.stringify(e));
        });
    };
   
    function Role() {
        $http({
            method: "Get",
            url: VirtualDirectoryPath + 'api/User/GetRole',

        }).success(function (data) {
            $scope.DataNewRole = data;

        });
    }
    $http.get(VirtualDirectoryPath + 'api/User/GetRole').success(function (data) {
        $scope.payGroup = data;
    });


    function init() {
        Role();
    };
    function GetCountries() {
        $http({
            method: 'Get',
            url: VirtualDirectoryPath + 'api/User/GetCountryList',
        }).success(function (data, status, headers, config) {
            $scope.Getcountries = data;

        }).error(function (data, status, headers, config) {
            $scope.message = 'Unexpected Error';
        });
    }


    var arrCountry = new Array();
    $http.get(VirtualDirectoryPath + 'api/User/GetCountryList').success(function (data) {
        $.map(data.Results, function (item) {
            arrCountry.push(item);
        });
        $scope.list = arrCountry;
    }).error(function (status) {
        alert(status);
    });


    var arrRole = new Array();
    $http.get(VirtualDirectoryPath + 'api/User/GetRole').success(function (data) {
        $.map(data.Results, function (item) {
            arrRole.push(item);
        });
        $scope.RoleList = arrRole;
    }).error(function (status) {
        alert(status);
    });


    var arrState = new Array();
    $http.get(VirtualDirectoryPath + 'api/User/GetStateList').success(function (data) {
        $.map(data.Results, function (item) {
            arrState.push(item);
        });
        $scope.StateList = arrState;
    }).error(function (status) {
        alert(status);
    });

    //var arrItem = new Array();
    //$http.get(VirtualDirectoryPath + 'api/User/GetItemDetails').success(function (data) {
    //    $.map(data.Results, function (item) {
    //        arrItem.push(item);
    //    });
    //    $scope.ItemList = arrItem;
    //}).error(function (status) {
    //    alert(status);
    //});


    $scope.fillProductList = function () {
        $http({
            method: 'Get',
            url: VirtualDirectoryPath + 'api/User/GetCountryList',
            data: {}
        }).success(function (result) {
            $scope.ProductList = result.d;
        });
    };

    $scope.fillProductList();




    $scope.gridOptions1 = {
        enableRowHeaderSelection: false,
        enableCellEditOnFocus: true,
        enableFullRowSelection: true,
        enableRowHeaderSelection: true,
        enableRowSelection: true,
        enableSelectAll: true,
        enableCellEdit: true,
        enableFiltering: true,

        columnDefs: [
          {
              name: 'ID', displayName: ' ID',
              cellTemplate: '<a ng-click="grid.appScope.RedirectToIDPage(row)" style="cursor:pointer" title="Click to Approve/Reject single request">{{row.entity.ID}}</a>'
          },

        { name: 'ID', displayName: 'ID' },
         { name: 'WorkerID', displayName: 'WorkerID' },
                    { name: 'UserName', field: 'UserName' },
                      { name: 'LastName', field: 'LastName' },
                      { name: 'Phone', displayName: 'Phone' },
                       { name: 'Email', displayName: 'Email' },
                        // { name: 'RoleName', displayName: 'RoleName' },
        ]

    };
    $scope.RedirectToIDPage = function (val) {
        window.location = 'Registration?vl=' + val.entity.ID + '';
    };




    if (location.search.replace("?", '').split('=')[1] != undefined) {
        $scope.UserDetail.ID = location.search.replace("?", '').replace("&v1", '').split('=')[1];
        if ($scope.UserDetail.ID != undefined && $scope.UserDetail.ID != null) {
            $http.get(VirtualDirectoryPath + 'api/User/GetUserDetailsByID?ID=' + $scope.UserDetail.ID + '').success(function (data) {
                $scope.Worker = true
                $scope.UserDetail.LastName = data.Results.LastName;
                $scope.UserDetail.UserName = data.Results.UserName;
                $scope.UserDetail.Password = data.Results.Password;
                $scope.UserDetail.Phone = data.Results.Phone;
                $scope.UserDetail.Email = data.Results.Email;
                $scope.UserDetail.RoleId = data.Results.role.RoleID;
                $scope.UserDetail.RoleName = data.Results.role.RoleName;
                $scope.UserDetail.WorkerID = data.Results.WorkerID;
                $scope.UserDetail.CountryName = data.Results.country.CountryName;
                $scope.UserDetail.CountryId = data.Results.country.CountryID;

            });

        }

    }

    else {

    }

    $scope.searchData = function () {

        // $scope.searchModel.PageID = $('#hdnPageID').val();
        // console.log($scope.searchModel);
        //$http.post(VirtualDirectoryPath + 'Home/GetData', $scope.searchModel)
        $http.get(VirtualDirectoryPath + 'api/User/GetUserList')
        .success(function (data) {
            $scope.gridOptions1.data = data.Results;
        });
    }
    //$scope.searchData();





    // $http.get(VirtualDirectoryPath+'/api/User/GetItemDetails/',
    //{
    //    params:
    //    {
    //        ItemName: ItemName
    //    }
    //}).success(function (data) {
    //    $scope.itemData = data;
    //    $scope.itemCount = $scope.itemData.length;
    //    $scope.selectedItem = $scope.itemData[0].SaleCount;
    //}).error(function () {
    //    $scope.error = "An Error has occured while loading posts!";
    //});

    $scope.EmployeeLookup = function () {

        var TypeHeadKeyword = '';
        TypeHeadKeyword = $('#txtName').val();
        return $scope.myPromise = $http.get(VirtualDirectoryPath + 'api/User/UserLookup', {
            params: {
                TypeHeadKeyword: TypeHeadKeyword
            }
        }).then(function (response) {
            return response.data.Results.Data;
           // alert(response.data.Results.Data);
            // console.log(response.data.Results.Data);
            //.slice(0, 15);
        });
    };



    $scope.onSelect = function ($item, $model, $label) {
        $scope.UserDetail.Name = $item.UserName;
        $scope.UserDetail.Email = $item.Email;
        $scope.UserDetail.Phone = $item.Phone;
        $scope.UserDetail.WorkerID = $item.WorkerID;

        //  var Arr = $item.EmpNotesName.split('/');
        //  $scope.Save.EmpNotesName = $item.EmpNotesName
        //$scope.Save.EmpNotesName = $item.EmpNotesName
        //$scope.Save.EmpNotesName = Arr[0].toString();

    }

   // select MenuDetails($scope.sMenuID, $scope.sMenuName);  
  
    function selectMenuDetails(menuID, menuName) {  
       
        $http.get(VirtualDirectoryPath + '/api/User/getMenuCRUDSelect/', { params: { menuID: menuID, menuName: menuName } }).success(function (data) {
            $scope.MenuData = data;  
            $scope.showMenuAdd = true;  
            $scope.addEditMenu = false;  
            $scope.MenuList = true;  
            $scope.showItem = true;  
  
            if ($scope.MenuData.length > 0) {  
            }  
        })  
   .error(function () {  
       $scope.error = "An Error has occured while loading posts!";  
   });  
  
        //Here we call all the created menu details to bind in select list for creating sub menu  
        $http.get(VirtualDirectoryPath + '/api/User/getMenuCRUDSelect/', { params: { menuID: "", menuName: "" } }).success(function (data) {
            $scope.MenuDataSelect = data;          
            
        })  
  .error(function () {  
      $scope.error = "An Error has occured while loading posts!";  
  });  
                 
    }  
  
    //Search  
    $scope.searchMenuDetails = function () {  
  
        selectMenuDetails($scope.sMenuID, $scope.sMenuName);  
    }  













});