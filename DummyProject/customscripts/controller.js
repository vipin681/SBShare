var app = angular.module('SeaOttersCtrl', ['ui.router', 'ui.grid', 'ui.grid.pagination', 'ui.grid.selection', 'ui.grid.exporter', 'ui.grid.autoResize', 'ui.grid.grouping', 'ui.bootstrap', 'ui.grid.grouping'])
angular.module('SeaOttersCtrl').directive('ckEditor', [function () {
    return {
        require: '?ngModel',
        link: function ($scope, elm, attr, ngModel) {

            var ck = CKEDITOR.replace(elm[0]);

            ck.on('pasteState', function () {
                $scope.$apply(function () {
                    ngModel.$setViewValue(ck.getData());
                });
            });

            ngModel.$render = function (value) {
                ck.setData(ngModel.$modelValue);
            };
        }
    };
}])
.run(function ($http) {
    var userDetail = JSON.parse(window.localStorage.getItem('UserDetail'));
    if (userDetail) {
        var decrypted = CryptoJS.AES.decrypt(userDetail.TokenID, "superman");
        $http.defaults.headers.common.Authorization = "bearer " + decrypted.toString(CryptoJS.enc.Utf8);
        $http.defaults.headers.common["Content-Type"] = "application/json";
    }
})
.controller('loginCtrl', function ($state, $http, $scope, SeaOttersSvc, $rootScope) {

    $scope.SignIn = function (userName, userPassword) {
        SeaOttersSvc.ShowLoadingWheel(true);
        $scope.UserName = userName;
        $scope.UserID = 0;
        $http({
            url: baseUrl + 'api/SeaOtters/UserLogin',
            method: 'POST',
            params: { userName: userName, userPassword: userPassword }
        }).success(function (res) {
            if (res.Status === true) {
                var User = {
                    UserId: res.Results.UserID,
                    UserName: res.Results.UserName,
                    UserRole: res.Results.Role,
                    Language: res.Results.Language,
                    TokenID: CryptoJS.AES.encrypt(res.Results.TokenID, "superman").toString()
                };
                $scope.UserID = res.Results.UserID;
                //window.localStorage.setItem('UserDetail', JSON.stringify(User));

                $rootScope.UserDetail = User;

                //Allow headers only for first login 
                $http.defaults.headers.common.Authorization = "bearer " + res.Results.TokenID;
                SeaOttersSvc.ShowLoadingWheel(false);

                SeaOttersSvc.GetMenuListByUserID().then(function (data) {

                    $rootScope.UserMenuList = data.data.Results;

                    SeaOttersSvc.GetSystemConfigByUserID().then(function (data) {
                        $rootScope.SystemConfig = data.data.Results[0];
                        $state.go('home.reports');
                    });
                    //$state.go('home.reports');
                });
            }
            else {
                SeaOttersSvc.ShowLoadingWheel(false);
                SeaOttersSvc.ShowAlert(res.MessageId, 0, {});
            }
        }).error(function (e) {
            SeaOttersSvc.ShowLoadingWheel(false);
            alert(JSON.stringify(e));
        });
    };
    function init() {
        if (SeaOttersSvc.IsValidUser()) {
            $state.go('home.reports');
        }
    };
    init();
})
.controller('homeCtrl', function ($state, $scope, SeaOttersSvc, $rootScope) {
    $scope.userDetail = $rootScope.UserDetail;
    $scope.UserMenuList = $rootScope.UserMenuList;

    if (!SeaOttersSvc.IsValidUser()) {
        $state.go('login');
        return;
    }
    $scope.SignOut = function () {
        $rootScope.UserDetail = null;
        $rootScope.UserMenuList = null;
        $state.go('login');
    };
})
.controller('reportsCtrl', function ($state, $scope, SeaOttersSvc) {
    if (!SeaOttersSvc.IsValidUser()) {
        $state.go('login');
        return;
    }
    Morris.Area({
        element: 'graph_area',
        data: [
            { period: '01 Mar', cash: 2666, card: 223, loyalty: 2647, wallet: 2647 },
            { period: '02 Mar', cash: 2778, card: 2294, loyalty: 2441, wallet: 2647 },
            { period: '03 Mar', cash: 4912, card: 1969, loyalty: 2501, wallet: 2647 },
            { period: '04 Mar', cash: 3767, card: 3597, loyalty: 5689, wallet: 2647 },
            { period: '05 Mar', cash: 6810, card: 1914, loyalty: 2293, wallet: 2647 },
            { period: '06 Mar', cash: 5670, card: 4293, loyalty: 1881, wallet: 2647 },
            { period: '07 Mar', cash: 4820, card: 3795, loyalty: 1588, wallet: 2647 },
            { period: '08 Mar', cash: 15073, card: 5967, loyalty: 5175, wallet: 2647 },
            { period: '09 Mar', cash: 10687, card: 4460, loyalty: 2028, wallet: 2647 },
            { period: '10 Mar', cash: 8432, card: 5713, loyalty: 1791, wallet: 2647 }
        ],
        xkey: 'period',
        ykeys: ['cash', 'card', 'loyalty', 'wallet'],
        lineColors: ['#CC1100', '#F25549', '#FF6A6A', '#FFC1C1'],
        labels: ['Cash', 'Card', 'Loyalty', 'Wallet'],
        pointSize: 2,
        hideHover: 'auto'
    });
})
.controller('accountCtrl', function ($state, $scope, SeaOttersSvc) {

    if (!SeaOttersSvc.IsValidUser()) {
        $state.go('login');
        return;
    }
    $scope.divForm = false;

    $scope.ugAccounts = {
        enableFiltering: true,
        multiSelect: false,
        enableRowHeaderSelection: true,
        paginationPageSizes: [25, 50, 75],
        paginationPageSize: 25,
        columnDefs: [
            { name: 'AccountID', displayName: 'ID', visible: false },
            { name: 'AccountCode', displayName: 'Code' },
            { name: 'FirstName', displayName: 'First Name', width: "20%" },
            { name: 'LastName', displayName: 'Last Name', width: "20%" },
             { name: 'MobilePhone', displayName: 'Mobile', width: "15%" },
             { name: 'OfficePhone', displayName: 'Office', width: "15%" },
             { name: 'Email', displayName: 'Email', width: "15%" },
        ],
        enableGridMenu: true,
        exporterCsvFilename: 'Account.csv',
        exporterPdfDefaultStyle: { fontSize: 9 },
        exporterPdfTableStyle: { margin: [30, 30, 30, 30] },
        exporterPdfTableHeaderStyle: { fontSize: 10, bold: true, italics: true, color: '#2A3F54' },
        exporterPdfHeader: { text: "Account Details", style: 'headerStyle' },
        exporterPdfFooter: function (currentPage, pageCount) {
            return { text: currentPage.toString() + ' of ' + pageCount.toString(), style: 'footerStyle' };
        },
        exporterPdfCustomFormatter: function (docDefinition) {
            docDefinition.styles.headerStyle = { fontSize: 22, bold: true };
            docDefinition.styles.footerStyle = { fontSize: 10, bold: true };
            return docDefinition;
        },
        exporterPdfOrientation: 'landscape',
        exporterPdfPageSize: 'A4',
        exporterPdfMaxGridWidth: 500,
        exporterCsvLinkElement: angular.element(document.querySelectorAll(".custom-csv-link-location")),
    };

    SeaOttersSvc.GetAccountList().then(function (data) {
        $scope.ugAccounts.data = data.data.Results;
    });
    $scope.ugAccounts.onRegisterApi = function (gridApi) {
        $scope.accountGridApi = gridApi;
    };

    $scope.AddAccount = function () {
        $scope.account = {
            AccountID: 0, AccountCode: null, FirstName: null, LastName: null, MobilePhone: null, OfficePhone: null, Email: null
        };
        $scope.divView = false;
        $scope.divForm = true;
    };

    $scope.EditAccount = function () {
        //debugger;
        var selectedAccount = $scope.accountGridApi.selection.getSelectedRows();
        var recordCount = selectedAccount.length;
        if (recordCount > 0) {
            var accID = selectedAccount[0].AccountID;
            //alert(accID);
            SeaOttersSvc.GetAccountDetailsByAID(accID).then(function (data) {
                //debugger;
                $scope.account = data.data.Results;
            });
            $scope.divForm = true;
        }
        else {
            alert("Please select a record to edit");
        }
        $scope.accountGridApi.selection.clearSelectedRows();
    };

    $scope.SaveAccount = function () {
        SeaOttersSvc.SaveAccount($scope.account).then(function (data) {
            alert('Data Saved Successfully!!!');

            SeaOttersSvc.GetAccountList().then(function (data) {
                $scope.ugAccounts.data = data.data.Results;
                $scope.divView = true;
                $scope.divForm = false;
            });
        });
    };
})
.controller('vendorTypesCtrl', function ($state, $scope, SeaOttersSvc, $rootScope) {
    if (!SeaOttersSvc.IsValidUser()) {
        $state.go('login');
        return;
    }

    SeaOttersSvc.UserRolePermission('Vendor Type').then(function (data) {
        $scope.userRolePermission = data.data.Results;
        if ($scope.userRolePermission == null || $scope.userRolePermission[0].Access == 0) {
            SeaOttersSvc.ShowAlert(-1, 0, {});
        }
    });

    $scope.divForm = false;

    SeaOttersSvc.GetVendorTypeList().then(function (data) {
        $scope.ugVendorTypes.data = data.data.Results;
    });

    $scope.ugVendorTypes = {
        enableFullRowSelection: true,
        enableFiltering: true,
        multiSelect: false,
        enableRowHeaderSelection: true,
        paginationPageSizes: [10, 20, 30, 40, 50, 100, 500],
        paginationPageSize: 20,
        enableGridMenu: true,
        exporterCsvFilename: 'VendorType.csv',
        exporterPdfDefaultStyle: { fontSize: 9 },
        exporterPdfTableStyle: { margin: [30, 30, 30, 30] },
        exporterPdfTableHeaderStyle: { fontSize: 10, bold: true, italics: true, color: '#2A3F54' },
        exporterPdfHeader: { text: "Vendor Type Details", style: 'headerStyle' },
        exporterPdfFooter: function (currentPage, pageCount) {
            return { text: currentPage.toString() + ' of ' + pageCount.toString(), style: 'footerStyle' };
        },
        exporterPdfCustomFormatter: function (docDefinition) {
            docDefinition.styles.headerStyle = { fontSize: 22, bold: true };
            docDefinition.styles.footerStyle = { fontSize: 10, bold: true };
            return docDefinition;
        },
        exporterPdfOrientation: 'landscape',
        exporterPdfPageSize: 'A4',
        exporterPdfMaxGridWidth: 500,
        exporterCsvLinkElement: angular.element(document.querySelectorAll(".custom-csv-link-location")),
    };

    SeaOttersSvc.GetPageDetailsByPageName('Vendor Type').then(function (data) {
        $scope.pageConfig = data.data.Results;
        $scope.ugVendorTypes = {
            columnDefs: [
              { name: 'VendorTypeID', displayName: 'ID', visible: false, enableHiding: false },
              { name: 'VendorTypeName', displayName: $scope.LabelName('VendorTypeName', 'VendorType'), width: 200 },
              { name: 'InsertedByName', displayName: $scope.LabelName('InsertedBy', 'VendorType'), width: 200 },
              { name: 'InsertedAt', width: 200, displayName: $scope.LabelName('InsertedAt', 'VendorType'), cellFilter: 'date:\'yyyy-MM-dd\'' },
              { name: 'UpdatedByName', displayName: $scope.LabelName('UpdatedBy', 'VendorType'), width: 200 },
              { name: 'UpdatedAt', width: 200, displayName: $scope.LabelName('UpdatedAt', 'VendorType'), cellFilter: 'date:\'yyyy-MM-dd\'' },
            ],
        }
        SeaOttersSvc.GetVendorTypeList().then(function (data) {
            $scope.ugVendorTypes.data = data.data.Results;
        });
    });


    $scope.LabelName = function (fieldName, tableName) {
        if ($scope.pageConfig) {
            var language = $scope.pageConfig.filter(function (obj) {
                if (obj.TableFieldName === fieldName && obj.TableName === tableName)
                    return obj;
            })[0];

            if ($rootScope.UserDetail && $rootScope.UserDetail.Language.toLowerCase() == 'Chinese'.toLowerCase()) {
                return language.CustomFieldNameForChinese;
            }
            return language.CustomFieldNameForEnglish;
        }
    };

    $scope.FilterVendorType = function () {
        $scope.venderTypeGridApi.grid.refresh();
    };

    $scope.ugVendorTypes.onRegisterApi = function (gridApi) {
        $scope.venderTypeGridApi = gridApi;
        $scope.venderTypeGridApi.grid.registerRowsProcessor($scope.singleFilter, 200);
    };

    $scope.singleFilter = function (renderableRows) {
        var matcher = new RegExp($scope.filterVendorTypeValue, 'i');
        renderableRows.forEach(function (row) {
            var match = false;
            ['VendorTypeName'].forEach(function (field) {
                if (row.entity[field].match(matcher)) {
                    match = true;
                }
            });
            if (!match) {
                row.visible = false;
            }
        });
        return renderableRows;
    }

    $scope.AddNew = function () {
        $scope.vendorType = {
            VendorTypeID: 0, VendorTypeName: null
        };
        $scope.divView = false;
        $scope.divForm = true;
    };

    $scope.EditVT = function () {
        //debugger;
        var selectedVT = $scope.venderTypeGridApi.selection.getSelectedRows();
        var recordCount = selectedVT.length;
        if (recordCount > 0) {
            var vendorTypeID = selectedVT[0].VendorTypeID;
            SeaOttersSvc.GetVendorTypeDetailsByVTID(vendorTypeID).then(function (data) {
                //debugger;
                $scope.vendorType = data.data.Results;
            });
            $scope.divForm = true;
        }
        else {
            SeaOttersSvc.ShowAlert(17, 1, [{ key: '[action]', value: 'edit' }]);
        }
        $scope.venderTypeGridApi.selection.clearSelectedRows();
    };

    $scope.DeleteVendorType = function () {
        var selectedVT = $scope.venderTypeGridApi.selection.getSelectedRows();
        var recordCount = selectedVT.length;
        SeaOttersSvc.ShowLoadingWheel(true);
        if (recordCount > 0) {
            var vendorTypeID = selectedVT[0].VendorTypeID;
            //alert("WIP");
            SeaOttersSvc.DeleteVendorType(vendorTypeID).then(function (data) {
                SeaOttersSvc.ShowLoadingWheel(false);
                if (data.data.Status == true) {
                    SeaOttersSvc.ShowAlert(data.data.MessageId, 3, [{ key: '[Data]', value: 'Vendor Type' }]);
                    SeaOttersSvc.GetVendorTypeList().then(function (data) {
                        $scope.ugVendorTypes.data = data.data.Results;
                    });
                }
                else {
                    SeaOttersSvc.ShowAlert(data.data.MessageId, 0, {});
                }
            });
        }
        else {
            SeaOttersSvc.ShowLoadingWheel(false);
            SeaOttersSvc.ShowAlert(17, 1, [{ key: '[action]', value: 'delete' }]);
        }
        $scope.venderTypeGridApi.selection.clearSelectedRows();
    };

    $scope.SaveVendorType = function () {
        SeaOttersSvc.ShowLoadingWheel(true);
        SeaOttersSvc.SaveVendorType($scope.vendorType).then(function (data) {
            SeaOttersSvc.ShowLoadingWheel(false);
            if (data.data.Status == true) {
                SeaOttersSvc.ShowAlert(4, 3, [{ key: '[Data]', value: 'Vendor Type' }]);
                SeaOttersSvc.GetVendorTypeList().then(function (data) {
                    $scope.ugVendorTypes.data = data.data.Results;
                    $scope.divView = true;
                    $scope.divForm = false;
                });
            } else {
                SeaOttersSvc.ShowAlert(data.data.MessageId, 0, {});
            }
        });
    };
})
.controller('customersCtrl', function ($state, $scope, $http, $modal, SeaOttersSvc, $rootScope) {

    if (!SeaOttersSvc.IsValidUser()) {
        $state.go('login');
        return;
    }

    SeaOttersSvc.UserRolePermission('customers').then(function (data) {
        $scope.userRolePermission = data.data.Results;
        if ($scope.userRolePermission[0].Access == 0) {
            SeaOttersSvc.ShowAlert(-1, 0, {});
        }
    });

    var paginationOptions = {
        pageNumber: 1,
        pageSize: 20,
        sort: null
    };

    $scope.ugCustomers = {
        enableFullRowSelection: true,
        enableFiltering: true,
        useExternalPagination: true,
        multiSelect: false,
        enableRowHeaderSelection: true,
        paginationPageSizes: [10, 20, 30, 40, 50, 100, 500],
        paginationPageSize: 20,
        enableGridMenu: true,
        columnDefs: [
            { name: 'CustomerID', displayName: 'ID', visible: false, enableHiding: false },
            { name: 'CustomerCode', displayName: 'Code', width: 200 },
            { name: 'CustomerName', displayName: 'Name', width: 430 },
            { name: 'MainPhone', width: 200 },
            { name: 'Fax', width: 200 },
            { name: 'WebSite', width: 200 },
            { name: 'InsertedByName', displayName: 'Inserted By', width: 200 },
            { name: 'InsertedAt', cellFilter: 'date:\'yyyy-MM-dd\'', width: 200 },
            { name: 'UpdatedByName', displayName: 'Updated By', width: 200 },
            { name: 'UpdatedAt', cellFilter: 'date:\'yyyy-MM-dd\'', width: 200 },
        ],
        exporterCsvFilename: 'customers.csv',
        exporterPdfDefaultStyle: { fontSize: 9 },
        exporterPdfTableStyle: { margin: [30, 30, 30, 30] },
        exporterPdfTableHeaderStyle: { fontSize: 10, bold: true, italics: true, color: '#2A3F54' },
        exporterPdfHeader: { text: "Customer Details", style: 'headerStyle' },
        exporterPdfFooter: function (currentPage, pageCount) {
            return { text: currentPage.toString() + ' of ' + pageCount.toString(), style: 'footerStyle' };
        },
        exporterPdfCustomFormatter: function (docDefinition) {
            docDefinition.styles.headerStyle = { fontSize: 22, bold: true };
            docDefinition.styles.footerStyle = { fontSize: 10, bold: true };
            return docDefinition;
        },
        exporterPdfOrientation: 'landscape',
        exporterPdfPageSize: 'A4',
        exporterPdfMaxGridWidth: 500,
        exporterCsvLinkElement: angular.element(document.querySelectorAll(".custom-csv-link-location")),
    };

    $scope.ugAddressDetails = {
        enableFullRowSelection: true,
        enableRowHeaderSelection: true,
        multiSelect: false,
        paginationPageSize: 5,
    };

    $scope.ugContactDetails = {
        enableFullRowSelection: true,
        enableRowHeaderSelection: true,
        multiSelect: false,
        paginationPageSize: 5,
    };

    SeaOttersSvc.GetPageDetailsByPageName('customers').then(function (data) {

        $scope.pageConfig = data.data.Results;

        $scope.ugCustomers.columnDefs = [
                { name: 'CustomerID', displayName: 'ID', visible: false, enableHiding: false },
                { name: 'CustomerCode', enableFiltering: true, displayName: $scope.LabelName('CustomerCode', 'Customer'), width: 200 },
                { name: 'CustomerName', enableFiltering: true, displayName: $scope.LabelName('CustomerName', 'Customer'), width: 430 },
                { name: 'MainPhone', displayName: $scope.LabelName('MainPhone', 'Customer'), width: 200 },
                { name: 'Fax', displayName: $scope.LabelName('Fax', 'Customer'), width: 200 },
                { name: 'WebSite', displayName: $scope.LabelName('WebSite', 'Customer'), width: 200 },
                { name: 'InsertedByName', displayName: $scope.LabelName('InsertedBy', 'Customer'), width: 200 },
                { name: 'InsertedAt', displayName: $scope.LabelName('InsertedAt', 'Customer'), cellFilter: 'date:\'yyyy-MM-dd\'', width: 200 },
                { name: 'UpdatedByName', displayName: $scope.LabelName('UpdatedBy', 'Customer'), width: 200 },
                { name: 'UpdatedAt', displayName: $scope.LabelName('UpdatedAt', 'Customer'), cellFilter: 'date:\'yyyy-MM-dd\'', width: 200 },
        ];

        $scope.ugAddressDetails.columnDefs = [
                { name: 'CustomerAdressID', visible: false },
                { name: 'Address1', displayName: $scope.LabelName('Address1', 'CustomerAddress'), width: 200 },
                { name: 'Address2', displayName: $scope.LabelName('Address2', 'CustomerAddress'), width: 200 },
                { name: 'Address3', displayName: $scope.LabelName('Address3', 'CustomerAddress'), width: 200 },
                { name: 'City', displayName: $scope.LabelName('City', 'CustomerAddress'), width: 200 },
                { name: 'State', displayName: $scope.LabelName('State', 'CustomerAddress'), width: 200 },
                { name: 'ZipCode', displayName: $scope.LabelName('ZipCode', 'CustomerAddress'), width: 200 },
                { name: 'Country.Name', displayName: $scope.LabelName('Country', 'CustomerAddress'), width: 200 },
                { name: 'IsDefault', displayName: $scope.LabelName('IsDefault', 'CustomerAddress'), width: 100 },
                { name: 'IsActive', displayName: $scope.LabelName('IsActive', 'CustomerAddress'), width: 100 },
                { name: 'InsertedByName', displayName: $scope.LabelName('InsertedBy', 'CustomerAddress'), width: 200 },
                { name: 'InsertedAt', displayName: $scope.LabelName('InsertedAt', 'CustomerAddress'), width: 200, cellFilter: 'date:\'yyyy-MM-dd\'' },
                { name: 'UpdatedByName', displayName: $scope.LabelName('UpdatedBy', 'CustomerAddress'), width: 200 },
                { name: 'UpdatedAt', width: 200, displayName: $scope.LabelName('UpdatedAt', 'CustomerAddress'), cellFilter: 'date:\'yyyy-MM-dd\'' },
        ];

        $scope.ugContactDetails.columnDefs = [
                { name: 'CustomerContactID', visible: false },
                { name: 'FirstName', displayName: $scope.LabelName('FirstName', 'CustomerContact'), width: 200 },
                { name: 'LastName', displayName: $scope.LabelName('LastName', 'CustomerContact'), width: 200 },
                { name: 'Address1', displayName: $scope.LabelName('Address1', 'CustomerContact'), width: 200 },
                { name: 'Address2', displayName: $scope.LabelName('Address2', 'CustomerContact'), width: 200 },
                { name: 'City', displayName: $scope.LabelName('City', 'CustomerContact'), width: 200 },
                { name: 'State', displayName: $scope.LabelName('State', 'CustomerContact'), width: 200 },
                { name: 'ZipCode', displayName: $scope.LabelName('ZipCode', 'CustomerContact'), width: 200 },
                { name: 'OfficePhone', displayName: $scope.LabelName('OfficePhone', 'CustomerContact'), width: 200 },
                { name: 'CellPhone', displayName: $scope.LabelName('CellPhone', 'CustomerContact'), width: 200 },
                { name: 'WeChatID', displayName: $scope.LabelName('WeChatID', 'CustomerContact'), width: 200 },
                { name: 'QQID', displayName: $scope.LabelName('QQID', 'CustomerContact'), width: 200 },
                { name: 'InsertedByName', displayName: $scope.LabelName('InsertedBy', 'CustomerContact'), width: 200 },
                { name: 'InsertedAt', displayName: $scope.LabelName('InsertedAt', 'CustomerContact'), width: 200, cellFilter: 'date:\'yyyy-MM-dd\'' },
                { name: 'UpdatedByName', displayName: $scope.LabelName('UpdatedBy', 'CustomerContact'), width: 200 },
                { name: 'UpdatedAt', displayName: $scope.LabelName('UpdatedAt', 'CustomerContact'), width: 200, cellFilter: 'date:\'yyyy-MM-dd\'' },
        ];

        LoadData();

    });

    $scope.LabelName = function (fieldName, tableName) {
        if ($scope.pageConfig) {
            var language = $scope.pageConfig.filter(function (obj) {
                if (obj.TableFieldName === fieldName && obj.TableName === tableName)
                    return obj;
            })[0];

            if ($rootScope.UserDetail && $rootScope.UserDetail.Language.toLowerCase() == 'Chinese'.toLowerCase()) {
                return language.CustomFieldNameForChinese;
            }
            return language.CustomFieldNameForEnglish;
        }
    };

    $scope.filterCustomerValue = '';

    $scope.divForm = false;

    function LoadData() {
        SeaOttersSvc.GetCustomerListByUserID(paginationOptions.pageNumber, paginationOptions.pageSize, $scope.filterCustomerValue).then(function (data) {
            $scope.ugCustomers.totalItems = data.data.Results.TotalRecords;
            $scope.ugCustomers.data = data.data.Results.Data;
        });
    };

    $scope.FilterCustomer = function () {
        paginationOptions.pageNumber = 1;
        paginationOptions.pageSize = 20;
        SeaOttersSvc.GetCustomerListByUserID(paginationOptions.pageNumber, paginationOptions.pageSize, $scope.filterCustomerValue).then(function (data) {
            $scope.ugCustomers.totalItems = data.data.Results.TotalRecords;
            $scope.ugCustomers.data = data.data.Results.Data;
        });
    };

    $scope.ugCustomers.onRegisterApi = function (gridApi) {
        $scope.customerGridAPI = gridApi;
        gridApi.pagination.on.paginationChanged($scope, function (pageNumber, pageSize) {
            paginationOptions.pageNumber = pageNumber;
            paginationOptions.pageSize = pageSize;
            LoadData();
        });
    };

    $scope.AddCustomer = function () {
        $scope.customer = {
            CustomerID: 0, CustomerCode: null, AccountID: null, CustomerName: null, MainPhone: null, Fax: null, WebSite: null,
            CustomerAddressList: [], CustomerContactList: []
        };
        LoadMasters();
        $scope.ugContactDetails.data = [];
        $scope.ugAddressDetails.data = [];

        $scope.divForm = true;
    };

    function LoadMasters() {
        SeaOttersSvc.GetCountryList().then(function (data) {
            $scope.countries = data.data.Results;
        });
        SeaOttersSvc.GetAddressTypeDataList().then(function (data) {
            $scope.addressTypes = data.data.Results;
        });
    }

    $scope.EditCustomer = function () {
        var selectedCustomer = $scope.customerGridAPI.selection.getSelectedRows();
        if (selectedCustomer.length > 0) {
            var customerID = selectedCustomer[0].CustomerID;
            SeaOttersSvc.GetCustomerDetailsByCustomerID(customerID).then(function (data) {
                $scope.customer = data.data.Results;
                $scope.ugAddressDetails.data = $scope.customer.CustomerAddressList;
                $scope.ugContactDetails.data = $scope.customer.CustomerContactList;
            });
            LoadMasters();
            $scope.divForm = true;
        }
        else {
            //alert("Please select a record to edit");
            SeaOttersSvc.ShowAlert(17, 1, [{ key: '[action]', value: 'edit' }]);
        }
        $scope.customerGridAPI.selection.clearSelectedRows();
    };

    $scope.DeleteCustomer = function () {
        var selectedCustomer = $scope.customerGridAPI.selection.getSelectedRows();
        if (selectedCustomer.length > 0) {
            var customerID = selectedCustomer[0].CustomerID;
            SeaOttersSvc.DeleteCustomer(customerID).then(function (data) {
                if (data.data.Status == true) {
                    SeaOttersSvc.ShowAlert(data.data.MessageId, 3, [{ key: '[Data]', value: 'Customer' }]);
                    LoadData();
                }
                else {
                    SeaOttersSvc.ShowAlert(data.data.MessageId, 0, {});
                }
            });
        }
        else {
            //alert("Please select a record to delete");
            SeaOttersSvc.ShowAlert(17, 1, [{ key: '[action]', value: 'delete' }]);
        }
        $scope.customerGridAPI.selection.clearSelectedRows();
    };

    $scope.SaveCustomer = function () {
        SeaOttersSvc.SaveCustomer($scope.customer).then(function (data) {
            if (data.data.Status == true) {
                SeaOttersSvc.ShowAlert(data.data.MessageId, 3, [{ key: '[Data]', value: 'Customer' }]);
                LoadData();
                $scope.divForm = false;
            }
            else {
                SeaOttersSvc.ShowAlert(data.data.MessageId, 0, {});
            }
        });
    };

    $scope.ugAddressDetails.onRegisterApi = function (gridApi) {
        $scope.addressGridAPI = gridApi;
    };

    var AddressDetailsCtrl = function ($scope, $modalInstance, countries, addressTypes, customerAddress, pageConfig, userLanguage) {
        $scope.countries = countries;
        $scope.addressTypes = addressTypes;
        $scope.pageConfig = pageConfig;
        $scope.userLanguage = userLanguage;

        $scope.LabelName = function (fieldName, tableName) {
            if ($scope.pageConfig) {
                var language = $scope.pageConfig.filter(function (obj) {
                    if (obj.TableFieldName === fieldName && obj.TableName === tableName)
                        return obj;
                })[0];

                if ($scope.userLanguage.toLowerCase() == 'Chinese'.toLowerCase()) {
                    return language.CustomFieldNameForChinese;
                }
                return language.CustomFieldNameForEnglish;
            }
        };

        if (customerAddress != null) {
            $scope.customerAddress = {
                $$hashKey: customerAddress.$$hashKey,
                CustomerID: customerAddress.CustomerID, CustomerAddressID: customerAddress.CustomerAddressID,
                Address1: customerAddress.Address1, Address2: customerAddress.Address2, Address3: customerAddress.Address3,
                City: customerAddress.City, State: customerAddress.State, ZipCode: customerAddress.ZipCode,
                Country: customerAddress.Country,
                IsDefault: customerAddress.IsDefault, IsActive: customerAddress.IsActive,
                AddressType: customerAddress.AddressType

            };
        }
        else {
            $scope.customerAddress = {
                CustomerID: 0, CustomerAddressID: null, Address1: null, Address2: null, Address3: null,
                City: null, State: null, ZipCode: null, Country: { CountryID: null, Name: null },
                IsDefault: null, IsActive: null, AddressType: { AddressTypeID: null, AddressType: null }
            };
        }

        $scope.ok = function () {
            $modalInstance.close($scope.customerAddress);
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    };

    $scope.AddAddress = function () {
        var modalInstance = SeaOttersSvc.ShowCustomerAddressModal($scope.addressTypes, $scope.countries, null, $scope.pageConfig, $rootScope.UserDetail.Language, AddressDetailsCtrl);
        modalInstance.result.then(function (customerAddress) {
            if ($scope.customer.CustomerAddressList == null) {
                $scope.customer.CustomerAddressList = [];
            }
            $scope.customer.CustomerAddressList.push(customerAddress);
            $scope.ugAddressDetails.data = $scope.customer.CustomerAddressList;
        });
    };

    $scope.EditAddress = function () {
        var selectedAddress = $scope.addressGridAPI.selection.getSelectedRows();
        if (selectedAddress.length > 0) {
            var modalInstance = SeaOttersSvc.ShowCustomerAddressModal($scope.addressTypes, $scope.countries, selectedAddress[0], $scope.pageConfig, $rootScope.UserDetail.Language, AddressDetailsCtrl);
            modalInstance.result.then(function (customerAddress) {
                if (customerAddress.CustomerAddressID != null && customerAddress.CustomerAddressID != undefined && customerAddress.CustomerAddressID != 0) {
                    $scope.customer.CustomerAddressList.filter(function (obj) {
                        if (obj.CustomerAddressID === customerAddress.CustomerAddressID) {
                            $scope.customer.CustomerAddressList.splice($scope.customer.CustomerAddressList.indexOf(obj), 1);
                            customerAddress.$$hashKey = customerAddress.$$hashKey + '1';
                            customerAddress.IsUpdated = true;
                            $scope.customer.CustomerAddressList.push(customerAddress);
                        }
                    });
                }
                else {
                    $scope.customer.CustomerAddressList.filter(function (obj) {
                        if (obj.$$hashKey === customerAddress.$$hashKey) {
                            $scope.customer.CustomerAddressList.splice($scope.customer.CustomerAddressList.indexOf(obj), 1);
                            customerAddress.$$hashKey = customerAddress.$$hashKey + '1';
                            $scope.customer.CustomerAddressList.push(customerAddress);
                        }
                    });
                }
            });
        }
        else {
            //alert("Please select a record to edit");
            SeaOttersSvc.ShowAlert(17, 1, [{ key: '[action]', value: 'edit' }]);
        }
        $scope.addressGridAPI.selection.clearSelectedRows();
    };

    $scope.DeleteAddress = function () {
        var selectedAddress = $scope.addressGridAPI.selection.getSelectedRows();
        if (selectedAddress.length > 0) {
            var customerAddress = selectedAddress[0];
            if (customerAddress.CustomerAddressID != null && customerAddress.CustomerAddressID != undefined && customerAddress.CustomerAddressID != 0) {
                $scope.customer.CustomerAddressList.filter(function (obj) {
                    if (obj.CustomerAddressID === customerAddress.CustomerAddressID) {
                        $scope.customer.CustomerAddressList.splice($scope.customer.CustomerAddressList.indexOf(obj), 1);
                        customerAddress.IsDeleted = true;
                        $scope.customer.CustomerAddressList.push(customerAddress);
                    }
                });
            }
            else {
                $scope.customer.CustomerAddressList.filter(function (obj) {
                    if (obj.$$hashKey === customerAddress.$$hashKey) {
                        $scope.customer.CustomerAddressList.splice($scope.customer.CustomerAddressList.indexOf(obj), 1);
                    }
                });
            }
        }
        else {
            //alert("Please select a record to delete");
            SeaOttersSvc.ShowAlert(17, 1, [{ key: '[action]', value: 'delete' }]);
        }
        $scope.addressGridAPI.selection.clearSelectedRows();
    };

    $scope.ugContactDetails.onRegisterApi = function (gridApi) {
        $scope.contactGridAPI = gridApi;
    };

    var ContactDetailsCtrl = function ($scope, $modalInstance, countries, customerContact, pageConfig, userLanguage) {
        $scope.countries = countries;
        $scope.pageConfig = pageConfig;
        $scope.userLanguage = userLanguage;

        $scope.LabelName = function (fieldName, tableName) {
            if ($scope.pageConfig) {
                var language = $scope.pageConfig.filter(function (obj) {
                    if (obj.TableFieldName === fieldName && obj.TableName === tableName)
                        return obj;
                })[0];

                if ($scope.userLanguage.toLowerCase() == 'Chinese'.toLowerCase()) {
                    return language.CustomFieldNameForChinese;
                }
                return language.CustomFieldNameForEnglish;
            }
        };

        if (customerContact != null) {
            $scope.customerContact = {
                CustomerID: customerContact.CustomerID, CustomerContactID: customerContact.CustomerContactID,
                FirstName: customerContact.FirstName, LastName: customerContact.LastName,
                Address1: customerContact.Address1, Address2: customerContact.Address2, City: customerContact.City,
                State: customerContact.State, ZipCode: customerContact.ZipCode,
                Country: customerContact.Country,
                OfficePhone: customerContact.OfficePhone, CellPhone: customerContact.CellPhone,
                WeChatID: customerContact.WeChatID, QQID: customerContact.QQID
            };
        }
        else {
            $scope.customerContact = {
                CustomerID: 0, CustomerContactID: null, FirstName: null, LastName: null,
                Address1: null, Address2: null, City: null, State: null, ZipCode: null,
                Country: { CountryID: null, Name: null }, OfficePhone: null, CellPhone: null,
                WeChatID: null, QQID: null
            };
        }
        $scope.ok = function () {
            $modalInstance.close($scope.customerContact);
        };
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    };

    $scope.AddContact = function () {
        var modalInstance = SeaOttersSvc.ShowCustomerContactModal($scope.countries, null, $scope.pageConfig, $rootScope.UserDetail.Language, ContactDetailsCtrl);
        modalInstance.result.then(function (customerContact) {
            if ($scope.customer.CustomerContactList == null) {
                $scope.customer.CustomerContactList = [];
            }
            $scope.customer.CustomerContactList.push(customerContact);
            $scope.ugContactDetails.data = $scope.customer.CustomerContactList;
        });
    };

    $scope.EditContact = function () {
        var selectedContact = $scope.contactGridAPI.selection.getSelectedRows();
        if (selectedContact.length > 0) {
            var modalInstance = SeaOttersSvc.ShowCustomerContactModal($scope.countries, selectedContact[0], $scope.pageConfig, $rootScope.UserDetail.Language, ContactDetailsCtrl);
            modalInstance.result.then(function (customerContact) {
                if (customerContact.CustomerContactID != null && customerContact.CustomerContactID != undefined && customerContact.CustomerContactID != 0) {
                    $scope.customer.CustomerContactList.filter(function (obj) {
                        if (obj.CustomerContactID === customerContact.CustomerContactID) {
                            $scope.customer.CustomerContactList.splice($scope.customer.CustomerContactList.indexOf(obj), 1);
                            customerContact.$$hashKey = customerContact.$$hashKey + '1';
                            customerContact.IsUpdated = true;
                            $scope.customer.CustomerContactList.push(customerContact);
                        }
                    });
                }
                else {
                    $scope.customer.CustomerContactList.filter(function (obj) {
                        if (obj.$$hashKey === customerContact.$$hashKey) {
                            $scope.customer.CustomerContactList.splice($scope.customer.CustomerContactList.indexOf(obj), 1);
                            customerContact.$$hashKey = customerContact.$$hashKey + '1';
                            $scope.customer.CustomerContactList.push(customerContact);
                        }
                    });
                }
            });
        }
        else {
            SeaOttersSvc.ShowAlert(17, 1, [{ key: '[action]', value: 'edit' }]);
        }
        $scope.addressGridAPI.selection.clearSelectedRows();
    };

    $scope.DeleteContact = function () {
        var selectedContact = $scope.contactGridAPI.selection.getSelectedRows();
        if (selectedContact.length > 0) {
            var customerContact = selectedContact[0];
            if (customerContact.CustomerContactID != null && customerContact.CustomerContactID != undefined && customerContact.CustomerContactID != 0) {
                $scope.customer.CustomerContactList.filter(function (obj) {
                    if (obj.CustomerContactID === customerContact.CustomerContactID) {
                        $scope.customer.CustomerContactList.splice($scope.customer.CustomerContactList.indexOf(obj), 1);
                        customerContact.IsDeleted = true;
                        $scope.customer.CustomerContactList.push(customerContact);
                    }
                });
            }
            else {
                $scope.customer.CustomerContactList.filter(function (obj) {
                    if (obj.$$hashKey === customerContact.$$hashKey) {
                        $scope.customer.CustomerContactList.splice($scope.customer.CustomerContactList.indexOf(obj), 1);
                    }
                });
            }
        }
        else {
            //alert("Please select a record to edit");
            SeaOttersSvc.ShowAlert(17, 1, [{ key: '[action]', value: 'delete' }]);
        }
        $scope.addressGridAPI.selection.clearSelectedRows();
    };
})
.controller('salesCtrl', function ($state, $scope, SeaOttersSvc, $rootScope) {
    if (!SeaOttersSvc.IsValidUser()) {
        $state.go('login');
        return;
    }
})
.controller('factoryOwnerCtrl', function ($state, $scope, SeaOttersSvc, $rootScope) {
    if (!SeaOttersSvc.IsValidUser()) {
        $state.go('login');
        return;
    }

    SeaOttersSvc.UserRolePermission('Factory Owner').then(function (data) {
        $scope.userRolePermission = data.data.Results;
        if ($scope.userRolePermission == null || $scope.userRolePermission[0].Access == 0) {
            SeaOttersSvc.ShowAlert(-1, 0, {});
        }
    });

    var paginationOptions = {
        pageNumber: 1,
        pageSize: 20,
        sort: null
    };

    $scope.divForm = false;
    $scope.filterFactoryOwnerValue = '';

    function LoadData() {
        SeaOttersSvc.GetFactoryOwnerList(paginationOptions.pageNumber, paginationOptions.pageSize, $scope.filterFactoryOwnerValue).then(function (data) {
            $scope.ugFactoryOwners.totalItems = data.data.Results.TotalRecords;
            $scope.ugFactoryOwners.data = data.data.Results.Data;
        });
    }

    LoadData();

    $scope.ugFactoryOwners = {
        enableFullRowSelection: true,
        enableFiltering: true,
        multiSelect: false,
        enableRowHeaderSelection: true,
        useExternalPagination: true,
        paginationPageSizes: [10, 20, 30, 40, 50, 100, 500],
        paginationPageSize: 20,

        enableGridMenu: true,
        exporterCsvFilename: 'FactoryOwner.csv',
        exporterPdfDefaultStyle: { fontSize: 9 },
        exporterPdfTableStyle: { margin: [30, 30, 30, 30] },
        exporterPdfTableHeaderStyle: { fontSize: 10, bold: true, italics: true, color: '#2A3F54' },
        exporterPdfHeader: { text: "Factory Owner Details", style: 'headerStyle' },
        exporterPdfFooter: function (currentPage, pageCount) {
            return { text: currentPage.toString() + ' of ' + pageCount.toString(), style: 'footerStyle' };
        },
        exporterPdfCustomFormatter: function (docDefinition) {
            docDefinition.styles.headerStyle = { fontSize: 22, bold: true };
            docDefinition.styles.footerStyle = { fontSize: 10, bold: true };
            return docDefinition;
        },
        exporterPdfOrientation: 'landscape',
        exporterPdfPageSize: 'A4',
        exporterPdfMaxGridWidth: 500,
        exporterCsvLinkElement: angular.element(document.querySelectorAll(".custom-csv-link-location")),
    };

    SeaOttersSvc.GetPageDetailsByPageName('Factory Owner').then(function (data) {
        $scope.pageConfig = data.data.Results;
        $scope.ugFactoryOwners = {
            columnDefs: [
           { name: 'FactoryOwnerID', displayName: 'ID', visible: false, enableHiding: false },
           { name: 'FirstName', displayName: $scope.LabelName('FirstName', 'FactoryOwner'), width: 200 },
           { name: 'LastName', displayName: $scope.LabelName('LastName', 'FactoryOwner'), width: 200 },
           { name: 'CompanyName', displayName: $scope.LabelName('CompanyName', 'FactoryOwner'), width: 200, headerCellClass: 'hidden-xs', cellClass: 'hidden-xs' },
           { name: 'InsertedByName', displayName: $scope.LabelName('InsertedBy', 'FactoryOwner'), width: 200 },
           { name: 'InsertedAt', width: 200, displayName: $scope.LabelName('InsertedAt', 'FactoryOwner'), cellFilter: 'date:\'yyyy-MM-dd\'' },
           { name: 'UpdatedByName', displayName: $scope.LabelName('UpdatedBy', 'FactoryOwner'), width: 200 },
           { name: 'UpdatedAt', width: 200, displayName: $scope.LabelName('UpdatedAt', 'FactoryOwner'), cellFilter: 'date:\'yyyy-MM-dd\'' },
            ],
        }
        LoadData();
    });

    $scope.LabelName = function (fieldName, tableName) {
        if ($scope.pageConfig) {
            var language = $scope.pageConfig.filter(function (obj) {
                if (obj.TableFieldName === fieldName && obj.TableName === tableName)
                    return obj;
            })[0];

            if ($rootScope.UserDetail && $rootScope.UserDetail.Language.toLowerCase() == 'Chinese'.toLowerCase()) {
                return language.CustomFieldNameForChinese;
            }
            return language.CustomFieldNameForEnglish;
        }
    };

    $scope.FilterFactoryOwner = function () {
        paginationOptions.pageNumber = 1;
        paginationOptions.pageSize = 20;
        LoadData();
    };

    $scope.ugFactoryOwners.onRegisterApi = function (gridApi) {
        $scope.factoryOwnerGridApi = gridApi;
        gridApi.pagination.on.paginationChanged($scope, function (pageNumber, pageSize) {
            paginationOptions.pageNumber = pageNumber;
            paginationOptions.pageSize = pageSize;
            LoadData();
        });
    };

    $scope.AddFO = function () {
        $scope.factoryOwner = {
            FactoryOwnerID: 0, FirstName: null, LastName: null, CompanyName: null
        };
        $scope.divView = false;
        $scope.divForm = true;
    };

    $scope.EditFO = function () {
        //debugger;
        var selectedFO = $scope.factoryOwnerGridApi.selection.getSelectedRows();
        var recordCount = selectedFO.length;
        if (recordCount > 0) {
            var factoryOwnerID = selectedFO[0].FactoryOwnerID;
            SeaOttersSvc.GetFactoryOwnerDetailsByFOID(factoryOwnerID).then(function (data) {
                $scope.factoryOwner = data.data.Results;
            });
            $scope.divForm = true;
        }
        else {
            SeaOttersSvc.ShowAlert(17, 1, [{ key: '[action]', value: 'edit' }]);
        }
        $scope.factoryOwnerGridApi.selection.clearSelectedRows();
    };

    $scope.DeleteFO = function () {
        var selectedFO = $scope.factoryOwnerGridApi.selection.getSelectedRows();
        var recordCount = selectedFO.length;
        SeaOttersSvc.ShowLoadingWheel(true);
        if (recordCount > 0) {
            var factoryOwnerID = selectedFO[0].FactoryOwnerID;
            SeaOttersSvc.DeleteFactoryOwner(factoryOwnerID).then(function (data) {
                SeaOttersSvc.ShowLoadingWheel(false);
                if (data.data.Status == true) {
                    SeaOttersSvc.ShowAlert(data.data.MessageId, 3, [{ key: '[Data]', value: 'Factory Owner' }]);
                    LoadData();
                }
                else {
                    SeaOttersSvc.ShowAlert(data.data.MessageId, 0, {});
                }
            });
        }
        else {
            SeaOttersSvc.ShowAlert(17, 1, [{ key: '[action]', value: 'delete' }]);
        }
        $scope.factoryOwnerGridApi.selection.clearSelectedRows();
    };

    $scope.SaveFactoryOwner = function () {
        SeaOttersSvc.ShowLoadingWheel(true);
        SeaOttersSvc.SaveFactoryOwner($scope.factoryOwner).then(function (data) {
            SeaOttersSvc.ShowAlert(4, 3, [{ key: '[Data]', value: 'Factory Owner' }]);
            SeaOttersSvc.ShowLoadingWheel(false);
            LoadData();
            $scope.divView = true;
            $scope.divForm = false;
        });
    };
})
.controller('partfamilyCtrl', function ($state, $scope, SeaOttersSvc, $rootScope) {
    if (!SeaOttersSvc.IsValidUser()) {
        $state.go('login');
        return;
    }

    SeaOttersSvc.UserRolePermission('Part Family').then(function (data) {
        $scope.userRolePermission = data.data.Results;
        if ($scope.userRolePermission == null || $scope.userRolePermission[0].Access == 0) {
            SeaOttersSvc.ShowAlert(-1, 0, {});
        }
    });

    $scope.divForm = false;

    SeaOttersSvc.GetPartFamilyList().then(function (data) {
        $scope.ugPartfamilys.data = data.data.Results;
    });

    $scope.ugPartfamilys = {
        enableFullRowSelection: true,
        enableFiltering: true,
        multiSelect: false,
        enableRowHeaderSelection: true,
        paginationPageSizes: [10, 20, 30, 40, 50, 100, 500],
        paginationPageSize: 20,

        enableGridMenu: true,
        exporterCsvFilename: 'PartFamily.csv',
        exporterPdfDefaultStyle: { fontSize: 9 },
        exporterPdfTableStyle: { margin: [30, 30, 30, 30] },
        exporterPdfTableHeaderStyle: { fontSize: 10, bold: true, italics: true, color: '#2A3F54' },
        exporterPdfHeader: { text: "Part Family Details", style: 'headerStyle' },
        exporterPdfFooter: function (currentPage, pageCount) {
            return { text: currentPage.toString() + ' of ' + pageCount.toString(), style: 'footerStyle' };
        },
        exporterPdfCustomFormatter: function (docDefinition) {
            docDefinition.styles.headerStyle = { fontSize: 22, bold: true };
            docDefinition.styles.footerStyle = { fontSize: 10, bold: true };
            return docDefinition;
        },
        exporterPdfOrientation: 'landscape',
        exporterPdfPageSize: 'A4',
        exporterPdfMaxGridWidth: 500,
        exporterCsvLinkElement: angular.element(document.querySelectorAll(".custom-csv-link-location")),
    };

    SeaOttersSvc.GetPageDetailsByPageName('Part Family').then(function (data) {
        $scope.pageConfig = data.data.Results;
        $scope.ugPartfamilys = {
            columnDefs: [
             { name: 'PartFamilyID', displayName: 'ID', visible: false, enableHiding: false },
             { name: 'PartFamilyName', displayName: $scope.LabelName('PartFamilyName', 'PartFamily'), width: 200 },
             { name: 'InsertedByName', displayName: $scope.LabelName('InsertedBy', 'PartFamily'), width: 200 },
             { name: 'InsertedAt', width: 200, displayName: $scope.LabelName('InsertedAt', 'PartFamily'), cellFilter: 'date:\'yyyy-MM-dd\'' },
             { name: 'UpdatedByName', displayName: $scope.LabelName('UpdatedBy', 'PartFamily'), width: 200 },
             { name: 'UpdatedAt', width: 200, displayName: $scope.LabelName('UpdatedAt', 'PartFamily'), cellFilter: 'date:\'yyyy-MM-dd\'' },
            ],
        }
        SeaOttersSvc.GetPartFamilyList().then(function (data) {
            $scope.ugPartfamilys.data = data.data.Results;
        });
    });

    $scope.LabelName = function (fieldName, tableName) {
        if ($scope.pageConfig) {
            var language = $scope.pageConfig.filter(function (obj) {
                if (obj.TableFieldName === fieldName && obj.TableName === tableName)
                    return obj;
            })[0];

            if ($rootScope.UserDetail && $rootScope.UserDetail.Language.toLowerCase() == 'Chinese'.toLowerCase()) {
                return language.CustomFieldNameForChinese;
            }
            return language.CustomFieldNameForEnglish;
        }
    };

    $scope.FilterPartFamily = function () {
        $scope.partFamilyGridApi.grid.refresh();
    };

    $scope.ugPartfamilys.onRegisterApi = function (gridApi) {
        $scope.partFamilyGridApi = gridApi;
        $scope.partFamilyGridApi.grid.registerRowsProcessor($scope.singleFilter, 200);
    };

    $scope.singleFilter = function (renderableRows) {
        var matcher = new RegExp($scope.filterPartFamilyValue, 'i');
        renderableRows.forEach(function (row) {
            var match = false;
            ['PartFamilyName'].forEach(function (field) {
                if (row.entity[field].match(matcher)) {
                    match = true;
                }
            });
            if (!match) {
                row.visible = false;
            }
        });
        return renderableRows;
    }

    $scope.AddPF = function () {
        $scope.partfamily = {
            PartFamilyID: 0, PartFamilyName: null
        };
        $scope.divView = false;
        $scope.divForm = true;
    };

    $scope.EditPF = function () {
        //debugger;
        var selectedPF = $scope.partFamilyGridApi.selection.getSelectedRows();
        var recordCount = selectedPF.length;
        if (recordCount > 0) {
            var partfamilyID = selectedPF[0].PartFamilyID;
            SeaOttersSvc.GetPartFamilyDetailsByPFID(partfamilyID).then(function (data) {
                $scope.partfamily = data.data.Results;
            });
            $scope.divForm = true;
        }
        else {
            SeaOttersSvc.ShowAlert(17, 1, [{ key: '[action]', value: 'edit' }]);
        }
        $scope.partFamilyGridApi.selection.clearSelectedRows();
    };

    $scope.DeletePartFamily = function () {
        var selectedPF = $scope.partFamilyGridApi.selection.getSelectedRows();
        var recordCount = selectedPF.length;
        SeaOttersSvc.ShowLoadingWheel(true);
        if (recordCount > 0) {
            var partfamilyID = selectedPF[0].PartFamilyID;
            //debugger;
            SeaOttersSvc.DeletePartFamily(partfamilyID).then(function (data) {
                SeaOttersSvc.ShowLoadingWheel(false);
                // debugger;
                if (data.data.Status == true) {
                    SeaOttersSvc.ShowAlert(data.data.MessageId, 3, [{ key: '[Data]', value: 'Part Family' }]);
                    SeaOttersSvc.GetPartFamilyList().then(function (data) {
                        $scope.ugPartfamilys.data = data.data.Results;
                    });
                }
                else {
                    SeaOttersSvc.ShowAlert(data.data.MessageId, 0, {});
                }
            });
            //$scope.divForm = true;
        }
        else {
            SeaOttersSvc.ShowAlert(17, 1, [{ key: '[action]', value: 'delete' }]);
        }
        $scope.partFamilyGridApi.selection.clearSelectedRows();
    };

    $scope.SavePartFamily = function () {
        SeaOttersSvc.ShowLoadingWheel(true);
        SeaOttersSvc.SavePartFamily($scope.partfamily).then(function (data) {
            //alert('Data Saved Successfully!!!');
            SeaOttersSvc.ShowAlert(4, 3, [{ key: '[Data]', value: 'Part Family' }]);
            SeaOttersSvc.ShowLoadingWheel(false);
            SeaOttersSvc.GetPartFamilyList().then(function (data) {
                $scope.ugPartfamilys.data = data.data.Results;
                $scope.divView = true;
                $scope.divForm = false;
            });
        });
    };
})
.controller('factoryCtrl', function ($state, $scope, SeaOttersSvc, $rootScope) {
    if (!SeaOttersSvc.IsValidUser()) {
        $state.go('login');
        return;
    }

    SeaOttersSvc.UserRolePermission('Factory').then(function (data) {
        $scope.userRolePermission = data.data.Results;
        if ($scope.userRolePermission == null || $scope.userRolePermission[0].Access == 0) {
            SeaOttersSvc.ShowAlert(-1, 0, {});
        }
    });

    var paginationOptions = {
        pageNumber: 1,
        pageSize: 20,
        sort: null
    };

    $scope.divForm = false;

    $scope.filterFactoryValue = '';

    function LoadData() {
        SeaOttersSvc.GetFactoryList(paginationOptions.pageNumber, paginationOptions.pageSize, $scope.filterFactoryValue).then(function (data) {
            $scope.ugFactorys.totalItems = data.data.Results.TotalRecords;
            $scope.ugFactorys.data = data.data.Results.Data;
        });
    }

    // LoadData();

    $scope.ugFactorys = {
        enableFullRowSelection: true,
        enableFiltering: true,
        useExternalPagination: true,
        multiSelect: false,
        enableRowHeaderSelection: true,
        paginationPageSizes: [10, 20, 30, 40, 50, 100, 500],
        paginationPageSize: 20,

        enableGridMenu: true,
        //gridMenuShowHideColumns: false,
        exporterCsvFilename: 'factory.csv',
        exporterPdfDefaultStyle: { fontSize: 9 },
        exporterPdfTableStyle: { margin: [30, 30, 30, 30] },
        exporterPdfTableHeaderStyle: { fontSize: 10, bold: true, italics: true, color: '#2A3F54' },
        exporterPdfHeader: { text: "Factory Details", style: 'headerStyle' },
        exporterPdfFooter: function (currentPage, pageCount) {
            return { text: currentPage.toString() + ' of ' + pageCount.toString(), style: 'footerStyle' };
        },
        exporterPdfCustomFormatter: function (docDefinition) {
            docDefinition.styles.headerStyle = { fontSize: 22, bold: true };
            docDefinition.styles.footerStyle = { fontSize: 10, bold: true };
            return docDefinition;
        },
        exporterPdfOrientation: 'landscape',
        exporterPdfPageSize: 'A4',
        exporterPdfMaxGridWidth: 500,
        exporterCsvLinkElement: angular.element(document.querySelectorAll(".custom-csv-link-location")),
    };

    SeaOttersSvc.GetPageDetailsByPageName('Factory').then(function (data) {
        $scope.pageConfig = data.data.Results;
        $scope.ugFactorys = {
            columnDefs: [
             { name: 'FactoryID', displayName: 'ID', visible: false, enableHiding: false },
             { name: 'FactoryCode', displayName: $scope.LabelName('FactoryCode', 'Factory'), width: 200 },
             { name: 'FactoryName', displayName: $scope.LabelName('FactoryName', 'Factory'), width: 200 },
             { name: 'Address1', displayName: $scope.LabelName('Address1', 'Factory'), width: 200 },
             { name: 'City', displayName: $scope.LabelName('City', 'Factory'), width: 200 },
             { name: 'FactoryOwnerName', displayName: $scope.LabelName('FactoryOwnerID', 'Factory'), width: 200 },
             { name: 'InsertedByName', displayName: $scope.LabelName('InsertedBy', 'Factory'), width: 200 },
             { name: 'InsertedAt', displayName: $scope.LabelName('InsertedAt', 'Factory'), width: 200, cellFilter: 'date:\'yyyy-MM-dd\'' },
             { name: 'UpdatedByName', displayName: $scope.LabelName('UpdatedBy', 'Factory'), width: 200 },
             { name: 'UpdatedAt', displayName: $scope.LabelName('UpdatedAt', 'Factory'), width: 200, cellFilter: 'date:\'yyyy-MM-dd\'' },
            ],
        }
        LoadData();
    });

    $scope.LabelName = function (fieldName, tableName) {
        if ($scope.pageConfig) {
            var language = $scope.pageConfig.filter(function (obj) {
                if (obj.TableFieldName === fieldName && obj.TableName === tableName)
                    return obj;
            })[0];

            if ($rootScope.UserDetail && $rootScope.UserDetail.Language.toLowerCase() == 'Chinese'.toLowerCase()) {
                return language.CustomFieldNameForChinese;
            }
            return language.CustomFieldNameForEnglish;
        }
    };

    $scope.FilterFactory = function () {
        paginationOptions.pageNumber = 1;
        paginationOptions.pageSize = 20;
        LoadData();
    };

    $scope.ugFactorys.onRegisterApi = function (gridApi) {
        $scope.factoryGridAPI = gridApi;
        gridApi.pagination.on.paginationChanged($scope, function (pageNumber, pageSize) {
            paginationOptions.pageNumber = pageNumber;
            paginationOptions.pageSize = pageSize;
            LoadData();
        });
    };

    function LoadMasters() {
        SeaOttersSvc.GetCountryList().then(function (data) {
            $scope.countries = data.data.Results;
        });
        SeaOttersSvc.GetAllFactoryOwnerList().then(function (data) {
            $scope.factoryOwners = data.data.Results;
        });
    }
    $scope.AddFactory = function () {
        $scope.factory = {
            FactoryID: 0, FactoryCode: null, FactoryName: null, Address1: null, Address2: null, City: null, State: null,
            ZipCode: null, Country: { CountryID: 0, Name: null }, MainPhone: null, Fax: null, WebSite: null,
            FactoryOwner: { FactoryOwnerID: 0, FirstName: null },
        };
        LoadMasters();

        $scope.divForm = true;
    };

    $scope.EditFactory = function () {
        var selectedFactory = $scope.factoryGridAPI.selection.getSelectedRows();
        var recordCount = selectedFactory.length;
        if (recordCount > 0) {
            var factoryID = selectedFactory[0].FactoryID;

            SeaOttersSvc.GetFactoryDetailsByID(factoryID).then(function (data) {

                $scope.factory = data.data.Results;
            });

            LoadMasters();

            $scope.divForm = true;
        }
        else {
            SeaOttersSvc.ShowAlert(17, 1, [{ key: '[action]', value: 'edit' }]);
        }
        $scope.factoryGridAPI.selection.clearSelectedRows();
    };

    $scope.DeleteFactory = function () {
        var selectedFactory = $scope.factoryGridAPI.selection.getSelectedRows();
        var recordCount = selectedFactory.length;
        SeaOttersSvc.ShowLoadingWheel(true);
        if (recordCount > 0) {
            var factoryID = selectedFactory[0].FactoryID;
            SeaOttersSvc.DeleteFactory(factoryID).then(function (data) {
                SeaOttersSvc.ShowLoadingWheel(false);
                if (data.data.Status == true) {
                    SeaOttersSvc.ShowAlert(data.data.MessageId, 3, [{ key: '[Data]', value: 'Factory' }]);
                    LoadData();
                }
                else {
                    SeaOttersSvc.ShowAlert(data.data.MessageId, 0, {});
                }
            });
        }
        else {
            SeaOttersSvc.ShowLoadingWheel(false);
            SeaOttersSvc.ShowAlert(17, 1, [{ key: '[action]', value: 'delete' }]);
        }
        $scope.factoryGridAPI.selection.clearSelectedRows();
    };

    $scope.SaveFactory = function () {
        //debugger;
        if ($scope.factory.Country.CountryID == 0 || $scope.factory.FactoryOwner.FactoryOwnerID == 0) {
            SeaOttersSvc.ShowAlert(16, 0, {});
            return;
        }
        SeaOttersSvc.ShowLoadingWheel(true);
        SeaOttersSvc.SaveFactory($scope.factory).then(function (data) {
            //debugger;
            SeaOttersSvc.ShowAlert(4, 3, [{ key: '[Data]', value: 'Factory' }]);
            SeaOttersSvc.ShowLoadingWheel(false);
            LoadData();
            $scope.divView = true;
            $scope.divForm = false;

        });
    };
})
.controller('roletypeCtrl', function ($state, $scope, SeaOttersSvc, $rootScope) {
    if (!SeaOttersSvc.IsValidUser()) {
        $state.go('login');
        return;
    }
    SeaOttersSvc.UserRolePermission('Roles').then(function (data) {
        $scope.userRolePermission = data.data.Results;
        if ($scope.userRolePermission == null || $scope.userRolePermission[0].Access == 0) {
            SeaOttersSvc.ShowAlert(-1, 0, {});
        }
    });

    $scope.divForm = false;
    SeaOttersSvc.GetRoleTypeList().then(function (data) {
        $scope.ugRoleTypes.data = data.data.Results;
    });
    $scope.ugRoleTypes = {
        enableFullRowSelection: true,
        enableFiltering: true,
        multiSelect: false,
        enableRowHeaderSelection: true,
        paginationPageSizes: [10, 20, 30, 40, 50, 100, 500],
        paginationPageSize: 20,

        enableGridMenu: true,
        exporterCsvFilename: 'RoleType.csv',
        exporterPdfDefaultStyle: { fontSize: 9 },
        exporterPdfTableStyle: { margin: [30, 30, 30, 30] },
        exporterPdfTableHeaderStyle: { fontSize: 10, bold: true, italics: true, color: '#2A3F54' },
        exporterPdfHeader: { text: "Role type Details", style: 'headerStyle' },
        exporterPdfFooter: function (currentPage, pageCount) {
            return { text: currentPage.toString() + ' of ' + pageCount.toString(), style: 'footerStyle' };
        },
        exporterPdfCustomFormatter: function (docDefinition) {
            docDefinition.styles.headerStyle = { fontSize: 22, bold: true };
            docDefinition.styles.footerStyle = { fontSize: 10, bold: true };
            return docDefinition;
        },
        exporterPdfOrientation: 'landscape',
        exporterPdfPageSize: 'A4',
        exporterPdfMaxGridWidth: 500,
        exporterCsvLinkElement: angular.element(document.querySelectorAll(".custom-csv-link-location")),
    };

    SeaOttersSvc.GetPageDetailsByPageName('Roles').then(function (data) {
        $scope.pageConfig = data.data.Results;
        $scope.ugRoleTypes = {
            columnDefs: [
            { name: 'RoleTypeID', displayName: 'ID', visible: false, enableHiding: false },
            { name: 'RoleName', displayName: $scope.LabelName('RoleName', 'RoleType'), width: 200 },
            { name: 'Descriptions', displayName: $scope.LabelName('Descriptions', 'RoleType'), width: 200 },
            { name: 'InsertedByName', displayName: $scope.LabelName('InsertedBy', 'RoleType'), width: 200 },
            { name: 'InsertedAt', width: 200, displayName: $scope.LabelName('InsertedAt', 'RoleType'), cellFilter: 'date:\'yyyy-MM-dd\'' },
            { name: 'UpdatedByName', displayName: $scope.LabelName('UpdatedBy', 'RoleType'), width: 200 },
            { name: 'UpdatedAt', width: 200, displayName: $scope.LabelName('UpdatedAt', 'RoleType'), cellFilter: 'date:\'yyyy-MM-dd\'' },
            ],
        }
        SeaOttersSvc.GetRoleTypeList().then(function (data) {
            $scope.ugRoleTypes.data = data.data.Results;
        });
    });

    $scope.LabelName = function (fieldName, tableName) {
        if ($scope.pageConfig) {
            var language = $scope.pageConfig.filter(function (obj) {
                if (obj.TableFieldName === fieldName && obj.TableName === tableName)
                    return obj;
            })[0];

            if ($rootScope.UserDetail && $rootScope.UserDetail.Language.toLowerCase() == 'Chinese'.toLowerCase()) {
                return language.CustomFieldNameForChinese;
            }
            return language.CustomFieldNameForEnglish;
        }
    };

    $scope.FilterRoleType = function () {
        $scope.roleTypeGridApi.grid.refresh();
    };

    $scope.ugRoleTypes.onRegisterApi = function (gridApi) {
        $scope.roleTypeGridApi = gridApi;
        $scope.roleTypeGridApi.grid.registerRowsProcessor($scope.singleFilter, 200);
    };

    $scope.singleFilter = function (renderableRows) {
        var matcher = new RegExp($scope.filterRoleTypeValue, 'i');
        renderableRows.forEach(function (row) {
            var match = false;
            ['RoleName', 'Descriptions'].forEach(function (field) {
                if (row.entity[field].match(matcher)) {
                    match = true;
                }
            });
            if (!match) {
                row.visible = false;
            }
        });
        return renderableRows;
    }

    $scope.AddRole = function () {
        $scope.roleType = {
            RoleTypeID: 0, RoleName: null, Description: null
        };
        $scope.divView = false;
        $scope.divForm = true;
    };

    $scope.EditRole = function () {
        //debugger;
        var selectedRT = $scope.roleTypeGridApi.selection.getSelectedRows();
        var recordCount = selectedRT.length;
        if (recordCount > 0) {
            var roleTypeID = selectedRT[0].RoleTypeID;
            SeaOttersSvc.GetRoleTypeDetailsByRTID(roleTypeID).then(function (data) {
                $scope.roleType = data.data.Results;
            });
            $scope.divForm = true;
        }
        else {
            SeaOttersSvc.ShowAlert(17, 1, [{ key: '[action]', value: 'edit' }]);
        }
        $scope.roleTypeGridApi.selection.clearSelectedRows();
    };

    $scope.DeleteRole = function () {
        SeaOttersSvc.ShowLoadingWheel(true);
        var selectedRT = $scope.roleTypeGridApi.selection.getSelectedRows();
        var recordCount = selectedRT.length;
        if (recordCount > 0) {
            var roleTypeID = selectedRT[0].RoleTypeID;
            SeaOttersSvc.DeleteRoleType(roleTypeID).then(function (data) {
                SeaOttersSvc.ShowLoadingWheel(false);
                if (data.data.Status == true) {
                    SeaOttersSvc.ShowAlert(data.data.MessageId, 3, [{ key: '[Data]', value: 'Role' }]);
                    SeaOttersSvc.GetRoleTypeList().then(function (data) {
                        $scope.ugRoleTypes.data = data.data.Results;
                    });
                }
                else {
                    SeaOttersSvc.ShowAlert(data.data.MessageId, 0, {});
                }
            });
        }
        else {
            SeaOttersSvc.ShowLoadingWheel(false);
            SeaOttersSvc.ShowAlert(17, 1, [{ key: '[action]', value: 'delete' }]);
        }
        $scope.roleTypeGridApi.selection.clearSelectedRows();
    };

    $scope.SaveRoleType = function () {
        SeaOttersSvc.ShowLoadingWheel(true);
        SeaOttersSvc.SaveRoleType($scope.roleType).then(function (data) {
            SeaOttersSvc.ShowAlert(4, 3, [{ key: '[Data]', value: 'Role' }]);
            SeaOttersSvc.ShowLoadingWheel(false);
            SeaOttersSvc.GetRoleTypeList().then(function (data) {
                $scope.ugRoleTypes.data = data.data.Results;
                $scope.divView = true;
                $scope.divForm = false;
            });

        });
    };
})
.controller('countryCtrl', function ($state, $scope, SeaOttersSvc, $rootScope) {
    if (!SeaOttersSvc.IsValidUser()) {
        $state.go('login');
        return;
    }
    $scope.divForm = false;
    SeaOttersSvc.GetAllCountry().then(function (data) {
        $scope.ugCountrys.data = data.data.Results;
    });
    $scope.ugCountrys = {
        enableFullRowSelection: true,
        enableFiltering: true,
        multiSelect: false,
        enableRowHeaderSelection: true,
        paginationPageSizes: [10, 20, 30, 40, 50, 100, 500],
        paginationPageSize: 20,

        enableGridMenu: true,
        exporterCsvFilename: 'Country.csv',
        exporterPdfDefaultStyle: { fontSize: 9 },
        exporterPdfTableStyle: { margin: [30, 30, 30, 30] },
        exporterPdfTableHeaderStyle: { fontSize: 10, bold: true, italics: true, color: '#2A3F54' },
        exporterPdfHeader: { text: "Country Details", style: 'headerStyle' },
        exporterPdfFooter: function (currentPage, pageCount) {
            return { text: currentPage.toString() + ' of ' + pageCount.toString(), style: 'footerStyle' };
        },
        exporterPdfCustomFormatter: function (docDefinition) {
            docDefinition.styles.headerStyle = { fontSize: 22, bold: true };
            docDefinition.styles.footerStyle = { fontSize: 10, bold: true };
            return docDefinition;
        },
        exporterPdfOrientation: 'landscape',
        exporterPdfPageSize: 'A4',
        exporterPdfMaxGridWidth: 500,
        exporterCsvLinkElement: angular.element(document.querySelectorAll(".custom-csv-link-location")),
    };

    SeaOttersSvc.GetPageDetailsByPageName('Country').then(function (data) {
        $scope.pageConfig = data.data.Results;
        $scope.ugCountrys = {
            columnDefs: [
            { name: 'CountryID', displayName: 'ID', visible: false, enableHiding: false },
            { name: 'Code', displayName: $scope.LabelName('Code', 'Country'), width: 200 },
            { name: 'Name', displayName: $scope.LabelName('Name', 'Country'), width: 200 },
            { name: 'CurrencyCode', displayName: $scope.LabelName('CurrencyCode', 'Country'), width: 200 },
            { name: 'CurrencySymbol', displayName: $scope.LabelName('CurrencySymbol', 'Country'), width: 200 },
            { name: 'DollerExchangeRate', displayName: $scope.LabelName('DollerExchangeRate', 'Country'), width: 200 },
            { name: 'DateFormat', displayName: $scope.LabelName('DateFormat', 'Country'), width: 200 },
            { name: 'InsertedByName', displayName: $scope.LabelName('InsertedBy', 'Country'), width: 200 },
            { name: 'InsertedAt', width: 200, displayName: $scope.LabelName('InsertedAt', 'Country'), cellFilter: 'date:\'yyyy-MM-dd\'' },
            { name: 'UpdatedByName', displayName: $scope.LabelName('UpdatedBy', 'Country'), width: 200 },
            { name: 'UpdatedAt', width: 200, displayName: $scope.LabelName('UpdatedAt', 'Country'), cellFilter: 'date:\'yyyy-MM-dd\'' },
            ],
        }
        SeaOttersSvc.GetAllCountry().then(function (data) {
            $scope.ugCountrys.data = data.data.Results;
        });
    });

    $scope.LabelName = function (fieldName, tableName) {
        if ($scope.pageConfig) {
            var language = $scope.pageConfig.filter(function (obj) {
                if (obj.TableFieldName === fieldName && obj.TableName === tableName)
                    return obj;
            })[0];

            if ($rootScope.UserDetail && $rootScope.UserDetail.Language.toLowerCase() == 'Chinese'.toLowerCase()) {
                return language.CustomFieldNameForChinese;
            }
            return language.CustomFieldNameForEnglish;
        }
    };

    $scope.FilterCountry = function () {
        $scope.countryGridApi.grid.refresh();
    };

    $scope.ugCountrys.onRegisterApi = function (gridApi) {
        $scope.countryGridApi = gridApi;
        $scope.countryGridApi.grid.registerRowsProcessor($scope.singleFilter, 200);
    };

    $scope.singleFilter = function (renderableRows) {
        var matcher = new RegExp($scope.filterCountryValue, 'i');
        renderableRows.forEach(function (row) {
            var match = false;
            ['Code', 'Name'].forEach(function (field) {
                if (row.entity[field].match(matcher)) {
                    match = true;
                }
            });
            if (!match) {
                row.visible = false;
            }
        });
        return renderableRows;
    }
})
.controller('timezoneCtrl', function ($state, $scope, SeaOttersSvc, $rootScope) {
    if (!SeaOttersSvc.IsValidUser()) {
        $state.go('login');
        return;
    }
    $scope.divForm = false;
    SeaOttersSvc.GetTimeZoneList().then(function (data) {
        $scope.ugTimeZones.data = data.data.Results;
    });
    $scope.ugTimeZones = {
        enableFullRowSelection: true,
        enableFiltering: true,
        multiSelect: false,
        enableRowHeaderSelection: true,
        paginationPageSizes: [10, 20, 30, 40, 50, 100, 500],
        paginationPageSize: 20,

        enableGridMenu: true,
        exporterCsvFilename: 'Timezone.csv',
        exporterPdfDefaultStyle: { fontSize: 9 },
        exporterPdfTableStyle: { margin: [30, 30, 30, 30] },
        exporterPdfTableHeaderStyle: { fontSize: 10, bold: true, italics: true, color: '#2A3F54' },
        exporterPdfHeader: { text: "Timezone Details", style: 'headerStyle' },
        exporterPdfFooter: function (currentPage, pageCount) {
            return { text: currentPage.toString() + ' of ' + pageCount.toString(), style: 'footerStyle' };
        },
        exporterPdfCustomFormatter: function (docDefinition) {
            docDefinition.styles.headerStyle = { fontSize: 22, bold: true };
            docDefinition.styles.footerStyle = { fontSize: 10, bold: true };
            return docDefinition;
        },
        exporterPdfOrientation: 'landscape',
        exporterPdfPageSize: 'A4',
        exporterPdfMaxGridWidth: 500,
        exporterCsvLinkElement: angular.element(document.querySelectorAll(".custom-csv-link-location")),
    };

    SeaOttersSvc.GetPageDetailsByPageName('Time Zone').then(function (data) {
        $scope.pageConfig = data.data.Results;

        $scope.ugTimeZones = {
            columnDefs: [
            { name: 'TimeZoneID', displayName: 'ID', visible: false, enableHiding: false },
            { name: 'TimeZoneName', displayName: $scope.LabelName('TimeZoneName', 'TimeZone'), width: 300 },
            { name: 'Description', displayName: $scope.LabelName('Description', 'TimeZone'), width: 300 },
            { name: 'Difference', displayName: $scope.LabelName('Difference', 'TimeZone'), width: 100 },
            { name: 'DaytimeSaving', displayName: $scope.LabelName('DaytimeSaving', 'TimeZone'), width: 150 },
            { name: 'InsertedByName', displayName: $scope.LabelName('InsertedBy', 'TimeZone'), width: 175 },
            { name: 'InsertedAt', width: 200, displayName: $scope.LabelName('InsertedAt', 'TimeZone'), cellFilter: 'date:\'yyyy-MM-dd\'' },
            { name: 'UpdatedByName', displayName: $scope.LabelName('UpdatedBy', 'TimeZone'), width: 175 },
            { name: 'UpdatedAt', width: 200, displayName: $scope.LabelName('UpdatedAt', 'TimeZone'), cellFilter: 'date:\'yyyy-MM-dd\'' },
            ],
        }

        SeaOttersSvc.GetTimeZoneList().then(function (data) {
            $scope.ugTimeZones.data = data.data.Results;
        });
    });

    $scope.LabelName = function (fieldName, tableName) {
        if ($scope.pageConfig) {
            var language = $scope.pageConfig.filter(function (obj) {
                if (obj.TableFieldName === fieldName && obj.TableName === tableName)
                    return obj;
            })[0];

            if ($rootScope.UserDetail && $rootScope.UserDetail.Language.toLowerCase() == 'Chinese'.toLowerCase()) {
                return language.CustomFieldNameForChinese;
            }
            return language.CustomFieldNameForEnglish;
        }
    };

    $scope.FilterTimeZone = function () {
        $scope.timezoneGridApi.grid.refresh();
    };

    $scope.ugTimeZones.onRegisterApi = function (gridApi) {
        $scope.timezoneGridApi = gridApi;
        $scope.timezoneGridApi.grid.registerRowsProcessor($scope.singleFilter, 200);
    };

    $scope.singleFilter = function (renderableRows) {
        var matcher = new RegExp($scope.filterTimeZoneValue, 'i');
        renderableRows.forEach(function (row) {
            var match = false;
            ['TimeZoneName', 'Description'].forEach(function (field) {
                if (row.entity[field].match(matcher)) {
                    match = true;
                }
            });
            if (!match) {
                row.visible = false;
            }
        });
        return renderableRows;
    }
})
.controller('languageCtrl', function ($state, $scope, SeaOttersSvc, $rootScope) {
    if (!SeaOttersSvc.IsValidUser()) {
        $state.go('login');
        return;
    }
    $scope.divForm = false;
    SeaOttersSvc.GetLanguageList().then(function (data) {
        $scope.ugLanguages.data = data.data.Results;
    });
    $scope.ugLanguages = {
        enableFullRowSelection: true,
        enableFiltering: true,
        multiSelect: false,
        enableRowHeaderSelection: true,
        paginationPageSizes: [10, 20, 30, 40, 50, 100, 500],
        paginationPageSize: 20,

        enableGridMenu: true,
        exporterCsvFilename: 'Language.csv',
        exporterPdfDefaultStyle: { fontSize: 9 },
        exporterPdfTableStyle: { margin: [30, 30, 30, 30] },
        exporterPdfTableHeaderStyle: { fontSize: 10, bold: true, italics: true, color: '#2A3F54' },
        exporterPdfHeader: { text: "Language Details", style: 'headerStyle' },
        exporterPdfFooter: function (currentPage, pageCount) {
            return { text: currentPage.toString() + ' of ' + pageCount.toString(), style: 'footerStyle' };
        },
        exporterPdfCustomFormatter: function (docDefinition) {
            docDefinition.styles.headerStyle = { fontSize: 22, bold: true };
            docDefinition.styles.footerStyle = { fontSize: 10, bold: true };
            return docDefinition;
        },
        exporterPdfOrientation: 'landscape',
        exporterPdfPageSize: 'A4',
        exporterPdfMaxGridWidth: 500,
        exporterCsvLinkElement: angular.element(document.querySelectorAll(".custom-csv-link-location")),
    };

    SeaOttersSvc.GetPageDetailsByPageName('Language').then(function (data) {
        $scope.pageConfig = data.data.Results;
        $scope.ugLanguages = {
            columnDefs: [
              { name: 'LanguageID', displayName: 'ID', visible: false, enableHiding: false },
              { name: 'LanguageCode', displayName: $scope.LabelName('LanguageCode', 'Language'), width: 300 },
              { name: 'LanguageName', displayName: $scope.LabelName('LanguageName', 'Language'), width: 300 },
              { name: 'InsertedByName', displayName: $scope.LabelName('InsertedBy', 'Language'), width: 175 },
              { name: 'InsertedAt', width: 200, displayName: $scope.LabelName('InsertedAt', 'Language'), cellFilter: 'date:\'yyyy-MM-dd\'' },
              { name: 'UpdatedByName', displayName: $scope.LabelName('UpdatedBy', 'Language'), width: 175 },
              { name: 'UpdatedAt', width: 200, displayName: $scope.LabelName('UpdatedAt', 'Language'), cellFilter: 'date:\'yyyy-MM-dd\'' },
            ],
        }
        SeaOttersSvc.GetLanguageList().then(function (data) {
            $scope.ugLanguages.data = data.data.Results;
        });
    });

    $scope.LabelName = function (fieldName, tableName) {
        if ($scope.pageConfig) {
            var language = $scope.pageConfig.filter(function (obj) {
                if (obj.TableFieldName === fieldName && obj.TableName === tableName)
                    return obj;
            })[0];

            if ($rootScope.UserDetail && $rootScope.UserDetail.Language.toLowerCase() == 'Chinese'.toLowerCase()) {
                return language.CustomFieldNameForChinese;
            }
            return language.CustomFieldNameForEnglish;
        }
    };

    $scope.FilterLanguages = function () {
        $scope.languagesGridApi.grid.refresh();
    };

    $scope.ugLanguages.onRegisterApi = function (gridApi) {
        $scope.languagesGridApi = gridApi;
        $scope.languagesGridApi.grid.registerRowsProcessor($scope.singleFilter, 200);
    };

    $scope.singleFilter = function (renderableRows) {
        var matcher = new RegExp($scope.filterLanguagesValue, 'i');
        renderableRows.forEach(function (row) {
            var match = false;
            ['LanguageCode', 'LanguageName'].forEach(function (field) {
                if (row.entity[field].match(matcher)) {
                    match = true;
                }
            });
            if (!match) {
                row.visible = false;
            }
        });
        return renderableRows;
    }
})
.controller('permissionCtrl', function ($state, $scope, SeaOttersSvc, $rootScope) {
    if (!SeaOttersSvc.IsValidUser()) {
        $state.go('login');
        return;

    }

    SeaOttersSvc.UserRolePermission('Permissions').then(function (data) {
        $scope.userRolePermission = data.data.Results;
        if ($scope.userRolePermission == null || $scope.userRolePermission[0].Access == 0) {
            SeaOttersSvc.ShowAlert(-1, 0, {});
        }
    });

    $scope.divForm = false;

    $scope.parentButton = '+';

    SeaOttersSvc.GetRoleTypeList().then(function (data) {
        $scope.ugPermissionRoleTypes.data = data.data.Results;
    });

    $scope.ugPermissionRoleTypes = {
        enableFullRowSelection: true,
        enableFiltering: true,
        multiSelect: false,
        enableRowHeaderSelection: true,
        paginationPageSizes: [10, 20, 30, 40, 50, 100, 500],
        paginationPageSize: 20,
        columnDefs: [
            { name: 'RoleTypeID', displayName: 'ID', visible: false, enableHiding: false },
            { name: 'RoleName', displayName: 'Role Name', width: 200 },
            { name: 'Descriptions', displayName: 'Description', width: 200 },
            { name: 'InsertedByName', displayName: 'Inserted By', width: 200 },
            { name: 'InsertedAt', width: 200, cellFilter: 'date:\'yyyy-MM-dd\'' },
            { name: 'UpdatedByName', displayName: 'Updated By', width: 200 },
            { name: 'UpdatedAt', width: 200, cellFilter: 'date:\'yyyy-MM-dd\'' },
        ],
        enableGridMenu: true,
        exporterCsvFilename: 'PermissionRoleType.csv',
        exporterPdfDefaultStyle: { fontSize: 9 },
        exporterPdfTableStyle: { margin: [30, 30, 30, 30] },
        exporterPdfTableHeaderStyle: { fontSize: 10, bold: true, italics: true, color: '#2A3F54' },
        exporterPdfHeader: { text: "Permission Role type Details", style: 'headerStyle' },
        exporterPdfFooter: function (currentPage, pageCount) {
            return { text: currentPage.toString() + ' of ' + pageCount.toString(), style: 'footerStyle' };
        },
        exporterPdfCustomFormatter: function (docDefinition) {
            docDefinition.styles.headerStyle = { fontSize: 22, bold: true };
            docDefinition.styles.footerStyle = { fontSize: 10, bold: true };
            return docDefinition;
        },
        exporterPdfOrientation: 'landscape',
        exporterPdfPageSize: 'A4',
        exporterPdfMaxGridWidth: 500,
        exporterCsvLinkElement: angular.element(document.querySelectorAll(".custom-csv-link-location")),
    };

    $scope.FilterPermissionRoleType = function () {
        $scope.PermissionroleTypeGridApi.grid.refresh();
    };

    $scope.ugPermissionRoleTypes.onRegisterApi = function (gridApi) {
        $scope.PermissionroleTypeGridApi = gridApi;
        $scope.PermissionroleTypeGridApi.grid.registerRowsProcessor($scope.singleFilter, 200);
    };

    $scope.singleFilter = function (renderableRows) {
        var matcher = new RegExp($scope.filterPermissionRoleTypeValue, 'i');
        renderableRows.forEach(function (row) {
            var match = false;
            ['RoleName', 'Descriptions'].forEach(function (field) {
                if (row.entity[field].match(matcher)) {
                    match = true;
                }
            });
            if (!match) {
                row.visible = false;
            }
        });
        return renderableRows;
    }

    $scope.EditPermissionRole = function () {
        //debugger;
        var selectedRT = $scope.PermissionroleTypeGridApi.selection.getSelectedRows();
        var recordCount = selectedRT.length;
        if (recordCount > 0) {
            var roleTypeID = selectedRT[0].RoleTypeID;
            var roleTypeName = selectedRT[0].RoleName;
            $scope.RoleName = roleTypeName;
            SeaOttersSvc.GetAllPageFunctionsByRoleID(roleTypeID).then(function (data) {
                $scope.rolePermissions = data.data.Results;
            });
            $scope.divForm = true;
        }
        else {
            SeaOttersSvc.ShowAlert(17, 1, [{ key: '[action]', value: 'edit' }]);
        }
        $scope.PermissionroleTypeGridApi.selection.clearSelectedRows();
    };

    $scope.GetPermissionListByRoleID = function () {
        $http({
            method: 'GET',
            url: baseUrl + '/api/Permission/GetPermissionByRoleID?RoleID=' + $scope.ID,
        })
        .success(function (result) {
            $scope.Permissions = result;
            $.each($rootScope.PermissionModules, function (i, v) {
                v.All = true;
                $.each(v.childs, function (i1, v1) {
                    var Items = jQuery.grep($scope.Permissions, function (value) {
                        return (value.ModuleId == v1.id && !value.IsApplicable);
                    });
                    if (Items.length > 0) { v1.All = false; v.All = false; }
                    else { v1.All = true; }
                })
            })
        })
        .error(function (data) {
            loadingwheel(false);
            $rootScope.PopupMessage = "Invalid Credentials";
            $rootScope.openModelPopUp('modal-message modal-danger', 'DangerModal.html');
        });
    };

    $scope.SavePermission = function () {
        //debugger;
        SeaOttersSvc.ShowLoadingWheel(true);
        var changedItems = document.body.querySelectorAll("input.ng-dirty:not(.checkbox-slider)");
        $scope.PermissionChanged = [];

        $.each(changedItems, function (i, v) {
            $scope.PermissionChanged.push({ Key: parseInt(v.id.match(/\d+/)[0]), Value: v.checked });
        })
        var param = {
            Changed: $scope.PermissionChanged,
        };
        SeaOttersSvc.SaveRolePermission(param).then(function (data) {
            SeaOttersSvc.ShowLoadingWheel(false);
            if (data.data.Status == true) {
                SeaOttersSvc.ShowAlert(4, 3, [{ key: '[Data]', value: 'Role Permission' }]);
                SeaOttersSvc.GetRoleTypeList().then(function (data) {
                    $scope.ugPermissionRoleTypes.data = data.data.Results;
                    $scope.divView = true;
                    $scope.divForm = false;
                });
            } else {
                SeaOttersSvc.ShowAlert(data.MessageId, 0, {});
            }
        });
    };

    $scope.CloseParentAccordian = function (PageCategoryID) {
        $("#collapse_" + PageCategoryID + "_PC").removeClass(" in");
    };

    $scope.CloseChildAccordian = function (systemPageID) {
        $("#collapse_" + systemPageID + "_SP").removeClass(" in");
    };

    $scope.focusCallback = function ($event) {
        if ($event.target === null) {
            return;
        }
        $scope.targetField = $event.target;
    };

    $scope.AssignFullPermission = function (ParentID, catgID) {
        var Istrue = $scope.targetField.checked;
        $scope.RoleFunctionPermissionID = [];
        var _ModulePermissions = jQuery.grep($scope.rolePermissions, function (value) {
            if (catgID == value.PageCategoryID) {
                $.each(value.listMenuPage, function (i, v) {
                    if (v.SystemPageID == ParentID) {
                        $.each(v.listMenufunction, function (i1, v1) {
                            $scope.RoleFunctionPermissionID.push(v1.RoleFunctionID);
                            v1.Isaccessible = Istrue;
                        });
                    }
                });
            }
        });

        $.each($scope.RoleFunctionPermissionID, function (i, v) {
            //debugger;
            $("#checkbox" + v).addClass("ng-dirty");
            if (Istrue) {
                $("#checkbox" + v).removeClass("ng-empty").addClass("ng-not-empty");
            }
            else {
                $("#checkbox" + v).addClass("ng-empty").removeClass("ng-not-empty");
            }
        });

    }
})
.controller('vendorsCtrl', function ($state, $http, $scope, SeaOttersSvc, $rootScope) {

    if (!SeaOttersSvc.IsValidUser()) {
        $state.go('login');
        return;
    }

    SeaOttersSvc.UserRolePermission('vendors').then(function (data) {
        $scope.userRolePermission = data.data.Results;
        if ($scope.userRolePermission == null || $scope.userRolePermission[0].Access == 0) {
            SeaOttersSvc.ShowAlert(-1, 0, {});
        }
    });

    var paginationOptions = {
        pageNumber: 1,
        pageSize: 20,
        sort: null
    };

    $scope.ugVendors = {
        enableFullRowSelection: true,
        enableFiltering: true,
        useExternalPagination: true,
        multiSelect: false,
        enableRowHeaderSelection: true,
        paginationPageSizes: [10, 20, 30, 40, 50, 100, 500],
        paginationPageSize: 20,
        columnDefs: [
            { name: 'VendorID', displayName: 'ID', visible: false, enableHiding: false },
            { name: 'VendorCode', displayName: 'Code', width: 200 },
            { name: 'VendorName', displayName: 'Name', width: 200 },
            { name: 'VendorTypeName', displayName: 'Vendor Type', width: 330 },
            { name: 'MainPhone', width: 200 },
            { name: 'Fax', width: 200 },
            { name: 'WebSite', width: 200 },
            { name: 'InsertedByName', displayName: 'Inserted By', width: 200 },
            { name: 'InsertedAt', cellFilter: 'date:\'yyyy-MM-dd\'', width: 200 },
            { name: 'UpdatedByName', displayName: 'Updated By', width: 200 },
            { name: 'UpdatedAt', cellFilter: 'date:\'yyyy-MM-dd\'', width: 200 },
        ],
        enableGridMenu: true,
        exporterCsvFilename: 'vendors.csv',
        exporterPdfDefaultStyle: { fontSize: 9 },
        exporterPdfTableStyle: { margin: [30, 30, 30, 30] },
        exporterPdfTableHeaderStyle: { fontSize: 10, bold: true, italics: true, color: '#2A3F54' },
        exporterPdfHeader: { text: "Vendor Details", style: 'headerStyle' },
        exporterPdfFooter: function (currentPage, pageCount) {
            return { text: currentPage.toString() + ' of ' + pageCount.toString(), style: 'footerStyle' };
        },
        exporterPdfCustomFormatter: function (docDefinition) {
            docDefinition.styles.headerStyle = { fontSize: 22, bold: true };
            docDefinition.styles.footerStyle = { fontSize: 10, bold: true };
            return docDefinition;
        },
        exporterPdfOrientation: 'landscape',
        exporterPdfPageSize: 'A4',
        exporterPdfMaxGridWidth: 500,
        exporterCsvLinkElement: angular.element(document.querySelectorAll(".custom-csv-link-location")),
    };

    $scope.ugAddressDetails = {
        enableFullRowSelection: true,
        enableRowHeaderSelection: true,
        multiSelect: false,
        paginationPageSize: 5,
    };

    $scope.ugContactDetails = {
        enableFullRowSelection: true,
        enableRowHeaderSelection: true,
        multiSelect: false,
        paginationPageSize: 5,
    };

    SeaOttersSvc.GetPageDetailsByPageName('vendors').then(function (data) {

        $scope.pageConfig = data.data.Results;

        $scope.ugVendors.columnDefs = [
                { name: 'VendorID', displayName: 'ID', visible: false, enableHiding: false },
                { name: 'VendorCode', enableFiltering: true, displayName: $scope.LabelName('VendorCode', 'Vendor'), width: 200 },
                { name: 'VendorName', displayName: $scope.LabelName('VendorName', 'Vendor'), width: 200 },
                { name: 'VendorTypeName', displayName: $scope.LabelName('VendorType', 'Vendor'), width: 330 },
                { name: 'MainPhone', displayName: $scope.LabelName('MainPhone', 'Vendor'), width: 200 },
                { name: 'Fax', displayName: $scope.LabelName('Fax', 'Vendor'), width: 200 },
                { name: 'WebSite', displayName: $scope.LabelName('WebSite', 'Vendor'), width: 200 },
                { name: 'InsertedByName', displayName: $scope.LabelName('InsertedBy', 'Vendor'), width: 200 },
                { name: 'InsertedAt', displayName: $scope.LabelName('InsertedAt', 'Vendor'), cellFilter: 'date:\'yyyy-MM-dd\'', width: 200 },
                { name: 'UpdatedByName', displayName: $scope.LabelName('UpdatedBy', 'Vendor'), width: 200 },
                { name: 'UpdatedAt', displayName: $scope.LabelName('UpdatedAt', 'Vendor'), cellFilter: 'date:\'yyyy-MM-dd\'', width: 200 },
        ];

        $scope.ugAddressDetails.columnDefs = [
                { name: 'VendorAddressID', visible: false },
                { name: 'Address1', displayName: $scope.LabelName('Address1', 'VendorAddress'), width: 200 },
                { name: 'Address2', displayName: $scope.LabelName('Address2', 'VendorAddress'), width: 200 },
                { name: 'Address3', displayName: $scope.LabelName('Address3', 'VendorAddress'), width: 200 },
                { name: 'City', displayName: $scope.LabelName('City', 'VendorAddress'), width: 200 },
                { name: 'State', displayName: $scope.LabelName('State', 'VendorAddress'), width: 200 },
                { name: 'ZipCode', displayName: $scope.LabelName('ZipCode', 'VendorAddress'), width: 200 },
                { name: 'Country.Name', displayName: $scope.LabelName('Country', 'VendorAddress'), width: 200 },
                { name: 'AddressType.Type', displayName: $scope.LabelName('AddressType', 'VendorAddress'), width: 200 },
                { name: 'IsDefault', displayName: $scope.LabelName('IsDefault', 'VendorAddress'), width: 100 },
                { name: 'IsActive', displayName: $scope.LabelName('IsActive', 'VendorAddress'), width: 100 },
                { name: 'InsertedByName', displayName: $scope.LabelName('InsertedBy', 'VendorAddress'), width: 200 },
                { name: 'InsertedAt', displayName: $scope.LabelName('InsertedAt', 'VendorAddress'), width: 200, cellFilter: 'date:\'yyyy-MM-dd\'' },
                { name: 'UpdatedByName', displayName: $scope.LabelName('UpdatedBy', 'VendorAddress'), width: 200 },
                { name: 'UpdatedAt', displayName: $scope.LabelName('UpdatedAt', 'VendorAddress'), width: 200, cellFilter: 'date:\'yyyy-MM-dd\'' },
        ];


        $scope.ugContactDetails.
            columnDefs = [
                { name: 'VendorContactID', visible: false },
                { name: 'FirstName', displayName: $scope.LabelName('FirstName', 'VendorContact'), width: 200 },
                { name: 'LastName', displayName: $scope.LabelName('LastName', 'VendorContact'), width: 200 },
                { name: 'Address1', displayName: $scope.LabelName('Address1', 'VendorContact'), width: 200 },
                { name: 'Address2', displayName: $scope.LabelName('Address2', 'VendorContact'), width: 200 },
                { name: 'City', displayName: $scope.LabelName('City', 'VendorContact'), width: 200 },
                { name: 'State', displayName: $scope.LabelName('State', 'VendorContact'), width: 200 },
                { name: 'ZipCode', displayName: $scope.LabelName('ZipCode', 'VendorContact'), width: 200 },
                { name: 'Country.Name', displayName: $scope.LabelName('Country', 'VendorContact'), width: 200 },
                { name: 'OfficePhone', displayName: $scope.LabelName('OfficePhone', 'VendorContact'), width: 200 },
                { name: 'CellPhone', displayName: $scope.LabelName('CellPhone', 'VendorContact'), width: 200 },
                { name: 'WeChatID', displayName: $scope.LabelName('WeChatID', 'VendorContact'), width: 200 },
                { name: 'QQID', displayName: $scope.LabelName('QQID', 'VendorContact'), width: 200 },
                { name: 'InsertedByName', displayName: $scope.LabelName('InsertedBy', 'VendorContact'), width: 200 },
                { name: 'InsertedAt', displayName: $scope.LabelName('InsertedAt', 'VendorContact'), width: 200, cellFilter: 'date:\'yyyy-MM-dd\'' },
                { name: 'UpdatedByName', displayName: $scope.LabelName('UpdatedBy', 'VendorContact'), width: 200 },
                { name: 'UpdatedAt', displayName: $scope.LabelName('UpdatedAt', 'VendorContact'), width: 200, cellFilter: 'date:\'yyyy-MM-dd\'' },
            ];


        LoadData();

    });

    $scope.LabelName = function (fieldName, tableName) {
        if ($scope.pageConfig) {
            var language = $scope.pageConfig.filter(function (obj) {
                if (obj.TableFieldName === fieldName && obj.TableName === tableName)
                    return obj;
            })[0];

            if ($rootScope.UserDetail && $rootScope.UserDetail.Language.toLowerCase() == 'Chinese'.toLowerCase()) {
                return language.CustomFieldNameForChinese;
            }
            return language.CustomFieldNameForEnglish;
        }
    };

    $scope.divForm = false;

    $scope.filterVendorValue = '';

    function LoadData() {
        SeaOttersSvc.GetVendorListByUserID(paginationOptions.pageNumber, paginationOptions.pageSize, $scope.filterVendorValue).then(function (data) {
            $scope.ugVendors.totalItems = data.data.Results.TotalRecords;
            $scope.ugVendors.data = data.data.Results.Data;
        });
    };

    $scope.FilterVendor = function () {
        paginationOptions.pageNumber = 1;
        paginationOptions.pageSize = 20;
        SeaOttersSvc.GetVendorListByUserID(paginationOptions.pageNumber, paginationOptions.pageSize, $scope.filterVendorValue).then(function (data) {
            $scope.ugVendors.totalItems = data.data.Results.TotalRecords;
            $scope.ugVendors.data = data.data.Results.Data;
        });
    };

    $scope.ugVendors.onRegisterApi = function (gridApi) {
        $scope.vendorGridAPI = gridApi;
        gridApi.pagination.on.paginationChanged($scope, function (pageNumber, pageSize) {
            paginationOptions.pageNumber = pageNumber;
            paginationOptions.pageSize = pageSize;
            LoadData();
        });
    };

    $scope.AddVendor = function () {
        $scope.vendor = {
            VendorID: 0, VendorName: null, AccountID: null, MainPhone: null, Fax: null, WebSite: null,
            VendorType: { VendorTypeID: null, VendorTypeName: null }, VendorAddressList: [], VendorContactList: []
        };
        LoadMasters();
        $scope.ugContactDetails.data = [];
        $scope.ugAddressDetails.data = [];

        $scope.divForm = true;
    };

    function LoadMasters() {
        SeaOttersSvc.GetCountryList().then(function (data) {
            $scope.countries = data.data.Results;
        });
        SeaOttersSvc.GetAddressTypeDataList().then(function (data) {
            $scope.addressTypes = data.data.Results;
        });
        SeaOttersSvc.GetVendorTypeList().then(function (data) {
            $scope.vendorTypes = data.data.Results;
        });
    }

    $scope.EditVendor = function () {
        var selectedVendor = $scope.vendorGridAPI.selection.getSelectedRows();
        if (selectedVendor.length > 0) {
            var vendorID = selectedVendor[0].VendorID;
            SeaOttersSvc.GetVendorDetailsByVendorID(vendorID).then(function (data) {
                $scope.vendor = data.data.Results;
                $scope.ugAddressDetails.data = $scope.vendor.VendorAddressList;
                $scope.ugContactDetails.data = $scope.vendor.VendorContactList;
            });
            LoadMasters();
            $scope.divForm = true;
        }
        else {
            //alert("Please select a record to edit");
            SeaOttersSvc.ShowAlert(17, 1, [{ key: '[action]', value: 'edit' }]);
        }
        $scope.vendorGridAPI.selection.clearSelectedRows();
    };

    $scope.DeleteVendor = function () {
        var selectedVendor = $scope.vendorGridAPI.selection.getSelectedRows();
        if (selectedVendor.length > 0) {
            var vendorID = selectedVendor[0].VendorID;
            SeaOttersSvc.DeleteVendor(vendorID).then(function (data) {
                if (data.data.Status == true) {
                    SeaOttersSvc.ShowAlert(data.data.MessageId, 3, [{ key: '[Data]', value: 'Vendor' }]);
                    LoadData();
                }
                else {
                    SeaOttersSvc.ShowAlert(data.data.MessageId, 0, {});
                }
            });
        }
        else {
            //alert("Please select a record to delete");
            SeaOttersSvc.ShowAlert(17, 1, [{ key: '[action]', value: 'delete' }]);
        }
        $scope.vendorGridAPI.selection.clearSelectedRows();
    };

    $scope.SaveVendor = function () {
        SeaOttersSvc.SaveVendor($scope.vendor).then(function (data) {
            if (data.data.Status == true) {
                SeaOttersSvc.ShowAlert(data.data.MessageId, 3, [{ key: '[Data]', value: 'Vendor' }]);
                LoadData();
                $scope.divForm = false;
            }
            else {
                SeaOttersSvc.ShowAlert(data.MessageId, 0, {});
            }
        });
    };

    $scope.ugAddressDetails.onRegisterApi = function (gridApi) {
        $scope.addressGridAPI = gridApi;
    };

    var AddressDetailsCtrl = function ($scope, $modalInstance, countries, addressTypes, pageConfig, userLanguage, vendorAddress) {
        $scope.countries = countries;
        $scope.addressTypes = addressTypes;
        $scope.pageConfig = pageConfig;
        $scope.userLanguage = userLanguage;

        $scope.LabelName = function (fieldName, tableName) {
            if ($scope.pageConfig) {
                var language = $scope.pageConfig.filter(function (obj) {
                    if (obj.TableFieldName === fieldName && obj.TableName === tableName)
                        return obj;
                })[0];

                if ($scope.userLanguage.toLowerCase() == 'Chinese'.toLowerCase()) {
                    return language.CustomFieldNameForChinese;
                }
                return language.CustomFieldNameForEnglish;
            }
        };

        if (vendorAddress != null) {
            $scope.vendorAddress = {
                $$hashKey: vendorAddress.$$hashKey,
                VendorID: vendorAddress.VendorID, VendorAddressID: vendorAddress.VendorAddressID,
                Address1: vendorAddress.Address1, Address2: vendorAddress.Address2, Address3: vendorAddress.Address3,
                City: vendorAddress.City, State: vendorAddress.State, ZipCode: vendorAddress.ZipCode,
                Country: vendorAddress.Country,
                IsDefault: vendorAddress.IsDefault, IsActive: vendorAddress.IsActive,
                AddressType: vendorAddress.AddressType
            };
        }
        else {
            $scope.vendorAddress = {
                VendorID: 0, VendorAddressID: null, Address1: null, Address2: null, Address3: null,
                City: null, State: null, ZipCode: null, Country: { CountryID: null, Name: null },
                IsDefault: null, IsActive: null, AddressType: { AddressTypeID: null, AddressType: null }
            };
        }

        $scope.ok = function () {
            $modalInstance.close($scope.vendorAddress);
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    };

    $scope.AddAddress = function () {
        var modalInstance = SeaOttersSvc.ShowVendorAddressModal($scope.addressTypes, $scope.countries, null, $scope.pageConfig, $rootScope.UserDetail.Language, AddressDetailsCtrl);
        modalInstance.result.then(function (vendorAddress) {
            if ($scope.vendor.VendorAddressList == null) {
                $scope.vendor.VendorAddressList = [];
            }
            $scope.vendor.VendorAddressList.push(vendorAddress);
            $scope.ugAddressDetails.data = $scope.vendor.VendorAddressList;
        });
    };

    $scope.EditAddress = function () {
        var selectedAddress = $scope.addressGridAPI.selection.getSelectedRows();
        if (selectedAddress.length > 0) {
            var modalInstance = SeaOttersSvc.ShowVendorAddressModal($scope.addressTypes, $scope.countries, selectedAddress[0], $scope.pageConfig, $rootScope.UserDetail.Language, AddressDetailsCtrl);
            modalInstance.result.then(function (vendorAddress) {

                if (vendorAddress.VendorAddressID != null && vendorAddress.VendorAddressID != undefined && vendorAddress.VendorAddressID != 0) {

                    $scope.vendor.VendorAddressList.filter(function (obj) {
                        if (obj.VendorAddressID === vendorAddress.VendorAddressID) {
                            $scope.vendor.VendorAddressList.splice($scope.vendor.VendorAddressList.indexOf(obj), 1);
                            vendorAddress.$$hashKey = vendorAddress.$$hashKey + '1';
                            vendorAddress.IsUpdated = true;
                            $scope.vendor.VendorAddressList.push(vendorAddress);
                        }
                    });
                }
                else {
                    $scope.vendor.VendorAddressList.filter(function (obj) {
                        if (obj.$$hashKey === vendorAddress.$$hashKey) {
                            $scope.vendor.VendorAddressList.splice($scope.vendor.VendorAddressList.indexOf(obj), 1);
                            vendorAddress.$$hashKey = vendorAddress.$$hashKey + '1';
                            $scope.vendor.VendorAddressList.push(vendorAddress);
                        }
                    });
                }
            });
        }
        else {
            SeaOttersSvc.ShowAlert(17, 1, [{ key: '[action]', value: 'edit' }]);
        }
        $scope.addressGridAPI.selection.clearSelectedRows();
    };

    $scope.DeleteAddress = function () {
        var selectedAddress = $scope.addressGridAPI.selection.getSelectedRows();
        if (selectedAddress.length > 0) {
            var vendorAddress = selectedAddress[0];
            if (vendorAddress.VendorAddressID != null && vendorAddress.VendorAddressID != undefined && vendorAddress.VendorAddressID != 0) {
                $scope.vendor.VendorAddressList.filter(function (obj) {
                    if (obj.VendorAddressID === vendorAddress.VendorAddressID) {
                        $scope.vendor.VendorAddressList.splice($scope.vendor.VendorAddressList.indexOf(obj), 1);
                        vendorAddress.IsDeleted = true;
                        $scope.vendor.VendorAddressList.push(vendorAddress);
                    }
                });
            }
            else {
                $scope.vendor.VendorAddressList.filter(function (obj) {
                    if (obj.$$hashKey === vendorAddress.$$hashKey) {
                        $scope.vendor.VendorAddressList.splice($scope.vendor.VendorAddressList.indexOf(obj), 1);
                    }
                });
            }
        }
        else {
            //alert("Please select a record to delete");
            SeaOttersSvc.ShowAlert(17, 1, [{ key: '[action]', value: 'delete' }]);
        }
        $scope.addressGridAPI.selection.clearSelectedRows();
    };

    $scope.ugContactDetails.onRegisterApi = function (gridApi) {
        $scope.contactGridAPI = gridApi;
    };

    var ContactDetailsCtrl = function ($scope, $modalInstance, countries, pageConfig, userLanguage, vendorContact) {
        $scope.countries = countries;
        $scope.pageConfig = pageConfig;
        $scope.userLanguage = userLanguage;

        $scope.LabelName = function (fieldName, tableName) {
            if ($scope.pageConfig) {
                var language = $scope.pageConfig.filter(function (obj) {
                    if (obj.TableFieldName === fieldName && obj.TableName === tableName)
                        return obj;
                })[0];

                if ($scope.userLanguage.toLowerCase() == 'Chinese'.toLowerCase()) {
                    return language.CustomFieldNameForChinese;
                }
                return language.CustomFieldNameForEnglish;
            }
        };


        if (vendorContact != null) {
            $scope.vendorContact = {
                VendorID: vendorContact.VendorID, VendorContactID: vendorContact.VendorContactID,
                FirstName: vendorContact.FirstName, LastName: vendorContact.LastName,
                Address1: vendorContact.Address1, Address2: vendorContact.Address2, City: vendorContact.City,
                State: vendorContact.State, ZipCode: vendorContact.ZipCode,
                Country: vendorContact.Country,
                OfficePhone: vendorContact.OfficePhone, CellPhone: vendorContact.CellPhone,
                WeChatID: vendorContact.WeChatID, QQID: vendorContact.QQID
            };
        }
        else {
            $scope.vendorContact = {
                VendorID: 0, VendorContactID: null, FirstName: null, LastName: null,
                Address1: null, Address2: null, City: null, State: null, ZipCode: null,
                Country: { CountryID: null, Name: null }, OfficePhone: null, CellPhone: null,
                WeChatID: null, QQID: null
            };
        }
        $scope.ok = function () {
            $modalInstance.close($scope.vendorContact);
        };
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    };

    $scope.AddContact = function () {
        var modalInstance = SeaOttersSvc.ShowVendorContactModal($scope.countries, null, $scope.pageConfig, $rootScope.UserDetail.Language, ContactDetailsCtrl);
        modalInstance.result.then(function (vendorContact) {
            if ($scope.vendor.VendorContactList == null) {
                $scope.vendor.VendorContactList = [];
            }
            $scope.vendor.VendorContactList.push(vendorContact);
            $scope.ugContactDetails.data = $scope.vendor.VendorContactList;
        });
    };

    $scope.EditContact = function () {
        var selectedContact = $scope.contactGridAPI.selection.getSelectedRows();
        if (selectedContact.length > 0) {
            var modalInstance = SeaOttersSvc.ShowVendorContactModal($scope.countries, selectedContact[0], $scope.pageConfig, $rootScope.UserDetail.Language, ContactDetailsCtrl);
            modalInstance.result.then(function (vendorContact) {
                if (vendorContact.VendorContactID != null && vendorContact.VendorContactID != undefined && vendorContact.VendorContactID != 0) {
                    $scope.vendor.VendorContactList.filter(function (obj) {
                        if (obj.VendorContactID === vendorContact.VendorContactID) {
                            $scope.vendor.VendorContactList.splice($scope.vendor.VendorContactList.indexOf(obj), 1);
                            vendorContact.$$hashKey = vendorContact.$$hashKey + '1';
                            vendorContact.IsUpdated = true;
                            $scope.vendor.VendorContactList.push(vendorContact);
                        }
                    });
                }
                else {
                    $scope.vendor.VendorContactList.filter(function (obj) {
                        if (obj.$$hashKey === vendorContact.$$hashKey) {
                            $scope.vendor.VendorContactList.splice($scope.vendor.VendorContactList.indexOf(obj), 1);
                            vendorContact.$$hashKey = vendorContact.$$hashKey + '1';
                            $scope.vendor.VendorContactList.push(vendorContact);
                        }
                    });
                }
            });
        }
        else {
            SeaOttersSvc.ShowAlert(17, 1, [{ key: '[action]', value: 'edit' }]);
        }
        $scope.contactGridAPI.selection.clearSelectedRows();
    };

    $scope.DeleteContact = function () {
        var selectedContact = $scope.contactGridAPI.selection.getSelectedRows();
        if (selectedContact.length > 0) {
            var vendorContact = selectedContact[0];
            if (vendorContact.VendorContactID != null && vendorContact.VendorContactID != undefined && vendorContact.VendorContactID != 0) {
                $scope.vendor.VendorContactList.filter(function (obj) {
                    if (obj.VendorContactID === vendorContact.VendorContactID) {
                        $scope.vendor.VendorContactList.splice($scope.vendor.VendorContactList.indexOf(obj), 1);
                        vendorContact.IsDeleted = true;
                        $scope.vendor.VendorContactList.push(vendorContact);
                    }
                });
            }
            else {
                $scope.vendor.VendorContactList.filter(function (obj) {
                    if (obj.$$hashKey === vendorContact.$$hashKey) {
                        $scope.vendor.VendorContactList.splice($scope.vendor.VendorContactList.indexOf(obj), 1);
                    }
                });
            }
        }
        else {
            //alert("Please select a record to edit");
            SeaOttersSvc.ShowAlert(17, 1, [{ key: '[action]', value: 'delete' }]);
        }
        $scope.contactGridAPI.selection.clearSelectedRows();
    };
})
.controller('equipmentCtrl', function ($state, $scope, SeaOttersSvc, $rootScope) {
    if (!SeaOttersSvc.IsValidUser()) {
        $state.go('login');
        return;
    }

    SeaOttersSvc.UserRolePermission('Equipment').then(function (data) {
        $scope.userRolePermission = data.data.Results;
        if ($scope.userRolePermission == null || $scope.userRolePermission[0].Access == 0) {
            SeaOttersSvc.ShowAlert(-1, 0, {});
        }
    });

    $('#divExpirationDate').datetimepicker({ format: "YYYY-MM-DD" });
    $('#divAvailableDate').datetimepicker({ format: "YYYY-MM-DD" });
    $('#divManufacturedAt').datetimepicker({ format: "YYYY-MM-DD" });
    $('#divValidDate').datetimepicker({ format: "YYYY-MM-DD" });

    var paginationOptions = {
        pageNumber: 1,
        pageSize: 20,
        sort: null
    };

    $scope.divForm = false;

    $scope.filterEquipmentValue = '';

    function LoadData() {
        SeaOttersSvc.GetEquipmentList(paginationOptions.pageNumber, paginationOptions.pageSize, $scope.filterEquipmentValue).then(function (data) {
            $scope.ugEquipments.totalItems = data.data.Results.TotalRecords;
            $scope.ugEquipments.data = data.data.Results.Data;
        });
    }

    //LoadData();

    $scope.ugEquipments = {
        enableFullRowSelection: true,
        enableFiltering: true,
        multiSelect: false,
        useExternalPagination: true,
        enableRowHeaderSelection: true,
        paginationPageSizes: [10, 20, 30, 40, 50, 100, 500],
        paginationPageSize: 20,

        enableGridMenu: true,
        exporterCsvFilename: 'Equipment.csv',
        exporterPdfDefaultStyle: { fontSize: 9 },
        exporterPdfTableStyle: { margin: [30, 30, 30, 30] },
        exporterPdfTableHeaderStyle: { fontSize: 10, bold: true, italics: true, color: '#2A3F54' },
        exporterPdfHeader: { text: "Equipment Details", style: 'headerStyle' },
        exporterPdfFooter: function (currentPage, pageCount) {
            return { text: currentPage.toString() + ' of ' + pageCount.toString(), style: 'footerStyle' };
        },
        exporterPdfCustomFormatter: function (docDefinition) {
            docDefinition.styles.headerStyle = { fontSize: 22, bold: true };
            docDefinition.styles.footerStyle = { fontSize: 10, bold: true };
            return docDefinition;
        },
        exporterPdfOrientation: 'landscape',
        exporterPdfPageSize: 'A4',
        exporterPdfMaxGridWidth: 500,
        exporterCsvLinkElement: angular.element(document.querySelectorAll(".custom-csv-link-location")),
    };

    SeaOttersSvc.GetPageDetailsByPageName('Equipment').then(function (data) {
        $scope.pageConfig = data.data.Results;
        $scope.ugEquipments = {
            columnDefs: [
               { name: 'EquipmentID', displayName: 'ID', visible: false, enableHiding: false },
               { name: 'EquipmentCategoryname', displayName: $scope.LabelName('EquipmentCategoryID', 'Equipment'), width: 200 },
               { name: 'FactoryName', displayName: $scope.LabelName('FactoryID', 'Equipment'), width: 200 },
               { name: 'SerialNumber', displayName: $scope.LabelName('SerialNumber', 'Equipment'), width: 200 },
               { name: 'BrandName', displayName: $scope.LabelName('BrandName', 'Equipment'), width: 200 },
               { name: 'InsertedByName', displayName: $scope.LabelName('InsertedBy', 'Equipment'), width: 200 },
               { name: 'InsertedAt', width: 200, displayName: $scope.LabelName('InsertedAt', 'Equipment'), cellFilter: 'date:\'yyyy-MM-dd\'' },
               { name: 'UpdatedByName', displayName: $scope.LabelName('UpdatedBy', 'Equipment'), width: 200 },
               { name: 'UpdatedAt', width: 200, displayName: $scope.LabelName('UpdatedAt', 'Equipment'), cellFilter: 'date:\'yyyy-MM-dd\'' },
            ],
        }
        LoadData();
    });


    $scope.LabelName = function (fieldName, tableName) {
        if ($scope.pageConfig) {
            var language = $scope.pageConfig.filter(function (obj) {
                if (obj.TableFieldName === fieldName && obj.TableName === tableName)
                    return obj;
            })[0];

            if ($rootScope.UserDetail && $rootScope.UserDetail.Language.toLowerCase() == 'Chinese'.toLowerCase()) {
                return language.CustomFieldNameForChinese;
            }
            return language.CustomFieldNameForEnglish;
        }
    };

    $scope.FilterEquipment = function () {
        paginationOptions.pageNumber = 1;
        paginationOptions.pageSize = 20;
        LoadData();
    };

    $scope.ugEquipments.onRegisterApi = function (gridApi) {
        $scope.EquipmentGridApi = gridApi;
        gridApi.pagination.on.paginationChanged($scope, function (pageNumber, pageSize) {
            paginationOptions.pageNumber = pageNumber;
            paginationOptions.pageSize = pageSize;
            LoadData();
        });
    };

    function LoadMasters() {
        SeaOttersSvc.GetEquipmentCategoryList().then(function (data) {
            $scope.equimentCategories = data.data.Results;
        });
        SeaOttersSvc.GetAllFactoryList().then(function (data) {
            $scope.factories = data.data.Results;
        });
    }

    $scope.AddEquipment = function () {
        $scope.equipment = {
            EquipmentID: 0, Rate: null,
            RateMeasurement: null, AvailableDate: null, ExpirationDate: null, EquipmentDescription: null, Remarks: null,
            SerialNumber: null, ManufacturedBy: null, ManufacturedAt: null, BrandName: null,
            Factory: { FactoryID: 0, FactoryName: null }, Equipmentcategory: { ID: 0, EquipmentName: null },
        };
        LoadMasters();
        $scope.divView = false;
        $scope.divForm = true;
    };

    $scope.EditEquipment = function () {
        var selectedEquipment = $scope.EquipmentGridApi.selection.getSelectedRows();
        var recordCount = selectedEquipment.length;
        if (recordCount > 0) {
            var equipmentID = selectedEquipment[0].EquipmentID;
            SeaOttersSvc.GetEquipmentDetailByID(equipmentID).then(function (data) {
                $scope.equipment = data.data.Results;

                $scope.equipment.AvailableDate = getFormattedDate(data.data.Results.AvailableDate);
                $scope.equipment.ExpirationDate = getFormattedDate(data.data.Results.ExpirationDate);
                $scope.equipment.ManufacturedAt = getFormattedDate(data.data.Results.ManufacturedAt);
            });

            LoadMasters();

            $scope.divForm = true;
        }
        else {
            SeaOttersSvc.ShowAlert(17, 1, [{ key: '[action]', value: 'edit' }]);
        }
        $scope.EquipmentGridApi.selection.clearSelectedRows();
    };

    $scope.DeleteEquipment = function () {
        var selectedEquipment = $scope.EquipmentGridApi.selection.getSelectedRows();
        var recordCount = selectedEquipment.length;
        SeaOttersSvc.ShowLoadingWheel(true);
        if (recordCount > 0) {
            var equipmentID = selectedEquipment[0].EquipmentID;
            SeaOttersSvc.DeleteEquipment(equipmentID).then(function (data) {
                SeaOttersSvc.ShowLoadingWheel(false);
                if (data.data.Status == true) {
                    SeaOttersSvc.ShowAlert(data.data.MessageId, 3, [{ key: '[Data]', value: 'Factory' }]);
                    LoadData();
                }
                else {
                    SeaOttersSvc.ShowAlert(data.data.MessageId, 0, {});
                }
            });
        }
        else {
            SeaOttersSvc.ShowLoadingWheel(false);
            SeaOttersSvc.ShowAlert(17, 1, [{ key: '[action]', value: 'delete' }]);
        }
        $scope.EquipmentGridApi.selection.clearSelectedRows();
    };

    $scope.SaveEquipment = function () {

        //debugger;
        if ($scope.equipment.Factory.FactoryID == 0 || $scope.equipment.Equipmentcategory.ID == 0) {
            SeaOttersSvc.ShowAlert(16, 0, {});
            return;
        }

        SeaOttersSvc.ShowLoadingWheel(true);
        SeaOttersSvc.SaveEquipment($scope.equipment).then(function (data) {
            SeaOttersSvc.ShowLoadingWheel(false);
            if (data.data.Status == true) {
                SeaOttersSvc.ShowAlert(4, 3, [{ key: '[Data]', value: 'Equipment' }]);
                LoadData();
                $scope.divView = true;
                $scope.divForm = false;
            } else {
                SeaOttersSvc.ShowAlert(data.MessageId, 0, {});
            }
        });
    };
})
.controller('equipmentCategoryCtrl', function ($state, $scope, SeaOttersSvc, $rootScope) {

    $('#divExpirationDate').datetimepicker({
        format: "YYYY-MM-DD"
    });
    $('#divEffectiveDate').datetimepicker({
        format: "YYYY-MM-DD"
    });

    if (!SeaOttersSvc.IsValidUser()) {
        $state.go('login');
        return;
    }

    SeaOttersSvc.UserRolePermission('Equipment Category').then(function (data) {
        $scope.userRolePermission = data.data.Results;
        if ($scope.userRolePermission == null || $scope.userRolePermission[0].Access == 0) {
            SeaOttersSvc.ShowAlert(-1, 0, {});
        }
    });

    $scope.divForm = false;

    SeaOttersSvc.GetEquipmentCategoryList().then(function (data) {
        $scope.ugEquipmentCategorys.data = data.data.Results;
    });

    $scope.ugEquipmentCategorys = {
        enableFullRowSelection: true,
        enableFiltering: true,
        multiSelect: false,
        enableRowHeaderSelection: true,
        paginationPageSizes: [10, 20, 30, 40, 50, 100, 500],
        paginationPageSize: 20,

        enableGridMenu: true,
        exporterCsvFilename: 'EquipmentCategory.csv',
        exporterPdfDefaultStyle: { fontSize: 9 },
        exporterPdfTableStyle: { margin: [30, 30, 30, 30] },
        exporterPdfTableHeaderStyle: { fontSize: 10, bold: true, italics: true, color: '#2A3F54' },
        exporterPdfHeader: { text: "EquipmentCategory Details", style: 'headerStyle' },
        exporterPdfFooter: function (currentPage, pageCount) {
            return { text: currentPage.toString() + ' of ' + pageCount.toString(), style: 'footerStyle' };
        },
        exporterPdfCustomFormatter: function (docDefinition) {
            docDefinition.styles.headerStyle = { fontSize: 22, bold: true };
            docDefinition.styles.footerStyle = { fontSize: 10, bold: true };
            return docDefinition;
        },
        exporterPdfOrientation: 'landscape',
        exporterPdfPageSize: 'A4',
        exporterPdfMaxGridWidth: 500,
        exporterCsvLinkElement: angular.element(document.querySelectorAll(".custom-csv-link-location")),
    };

    SeaOttersSvc.GetPageDetailsByPageName('Equipment Category').then(function (data) {
        $scope.pageConfig = data.data.Results;
        $scope.ugEquipmentCategorys = {
            columnDefs: [
             { name: 'EquipmentcategoryID', displayName: 'ID', visible: false, enableHiding: false },
             { name: 'EquipmentName', displayName: $scope.LabelName('EquipmentName', 'Equipmentcategory'), width: 200 },
             { name: 'Descriptions', displayName: $scope.LabelName('Descriptions', 'Equipmentcategory'), width: 200 },
             { name: 'InsertedByName', displayName: $scope.LabelName('InsertedBy', 'Equipmentcategory'), width: 200 },
             { name: 'InsertedAt', width: 200, displayName: $scope.LabelName('InsertedAt', 'Equipmentcategory'), cellFilter: 'date:\'yyyy-MM-dd\'' },
             { name: 'UpdatedByName', displayName: $scope.LabelName('UpdatedBy', 'Equipmentcategory'), width: 200 },
             { name: 'UpdatedAt', width: 200, displayName: $scope.LabelName('UpdatedAt', 'Equipmentcategory'), cellFilter: 'date:\'yyyy-MM-dd\'' },
            ],
        }
        SeaOttersSvc.GetEquipmentCategoryList().then(function (data) {
            $scope.ugEquipmentCategorys.data = data.data.Results;
        });
    });

    $scope.LabelName = function (fieldName, tableName) {
        if ($scope.pageConfig) {
            var language = $scope.pageConfig.filter(function (obj) {
                if (obj.TableFieldName === fieldName && obj.TableName === tableName)
                    return obj;
            })[0];

            if ($rootScope.UserDetail && $rootScope.UserDetail.Language.toLowerCase() == 'Chinese'.toLowerCase()) {
                return language.CustomFieldNameForChinese;
            }
            return language.CustomFieldNameForEnglish;
        }
    };

    $scope.FilterEquipmentCategory = function () {
        $scope.EquipmentCategoryGridApi.grid.refresh();
    };

    $scope.ugEquipmentCategorys.onRegisterApi = function (gridApi) {
        $scope.EquipmentCategoryGridApi = gridApi;
        $scope.EquipmentCategoryGridApi.grid.registerRowsProcessor($scope.singleFilter, 200);
    };

    $scope.singleFilter = function (renderableRows) {
        var matcher = new RegExp($scope.filterEquipmentCategoryValue, 'i');
        renderableRows.forEach(function (row) {
            var match = false;
            ['EquipmentName'].forEach(function (field) {
                if (row.entity[field].match(matcher)) {
                    match = true;
                }
            });
            if (!match) {
                row.visible = false;
            }
        });
        return renderableRows;
    }

    $scope.AddNew = function () {
        $scope.equipmentCategory = {
            EquipmentcategoryID: 0, EquipmentName: null, Descriptions: null, AccountID: 0, EffectiveDate: null, ExpirationDate: null

        };
        $scope.divView = false;
        $scope.divForm = true;
    };

    $scope.EditEC = function () {
        //debugger;
        var selectedEC = $scope.EquipmentCategoryGridApi.selection.getSelectedRows();
        var recordCount = selectedEC.length;
        if (recordCount > 0) {
            var EquipmentCategoryID = selectedEC[0].EquipmentcategoryID;
            SeaOttersSvc.GetEquipmentCategoryDetailsByID(EquipmentCategoryID).then(function (data) {
                //debugger;
                $scope.equipmentCategory = data.data.Results;
                $scope.equipmentCategory.EffectiveDate = data.data.Results.EffectiveDate;
                $scope.equipmentCategory.ExpirationDate = data.data.Results.ExpirationDate;
                //alert($scope.equipmentCategory.EffectiveDate);
            });
            $scope.divForm = true;
        }
        else {
            SeaOttersSvc.ShowAlert(17, 1, [{ key: '[action]', value: 'edit' }]);
        }
        $scope.EquipmentCategoryGridApi.selection.clearSelectedRows();
    };

    $scope.DeleteEquipmentCategory = function () {
        var selectedEC = $scope.EquipmentCategoryGridApi.selection.getSelectedRows();
        var recordCount = selectedEC.length;
        SeaOttersSvc.ShowLoadingWheel(true);
        if (recordCount > 0) {
            var EquipmentCategoryID = selectedEC[0].EquipmentcategoryID;
            //alert("WIP");
            SeaOttersSvc.DeleteEquipmentCategory(EquipmentCategoryID).then(function (data) {
                SeaOttersSvc.ShowLoadingWheel(false);
                if (data.data.Status == true) {
                    SeaOttersSvc.ShowAlert(data.data.MessageId, 3, [{ key: '[Data]', value: 'Equipment Category' }]);
                    SeaOttersSvc.GetEquipmentCategoryList().then(function (data) {
                        $scope.ugEquipmentCategorys.data = data.data.Results;
                    });
                }
                else {
                    SeaOttersSvc.ShowAlert(data.data.MessageId, 0, {});
                }
            });
        }
        else {
            SeaOttersSvc.ShowLoadingWheel(false);
            SeaOttersSvc.ShowAlert(17, 1, [{ key: '[action]', value: 'delete' }]);
        }
        $scope.EquipmentCategoryGridApi.selection.clearSelectedRows();
    };

    $scope.SaveEquipmentCatg = function () {
        //SeaOttersSvc.ShowLoadingWheel(true);
        //debugger;
        SeaOttersSvc.ShowLoadingWheel(true);
        SeaOttersSvc.SaveEquipmentCategory($scope.equipmentCategory).then(function (data) {
            SeaOttersSvc.ShowLoadingWheel(false);
            if (data.data.Status == true) {
                SeaOttersSvc.ShowAlert(4, 3, [{ key: '[Data]', value: 'Equipment Category' }]);
                SeaOttersSvc.GetEquipmentCategoryList().then(function (data) {
                    $scope.ugEquipmentCategorys.data = data.data.Results;
                    $scope.divView = true;
                    $scope.divForm = false;
                });
            } else {
                SeaOttersSvc.ShowAlert(data.MessageId, 0, {});
            }
        });
    };
})
.controller('usersCtrl', function ($state, $scope, $http, SeaOttersSvc, $modal, $rootScope) {

    if (!SeaOttersSvc.IsValidUser()) {
        $state.go('login');
        return;
    }

    SeaOttersSvc.UserRolePermission('users').then(function (data) {
        $scope.userRolePermission = data.data.Results;
        if ($scope.userRolePermission[0].Access == 0) {
            SeaOttersSvc.ShowAlert(-1, 0, {});
        }
    });

    var paginationOptions = {
        pageNumber: 1,
        pageSize: 20,
        sort: null
    };

    $scope.ugUsers = {
        enableFullRowSelection: true,
        enableFiltering: true,
        useExternalPagination: true,
        multiSelect: false,
        enableRowHeaderSelection: true,
        paginationPageSizes: [10, 20, 30, 40, 50, 100, 500],
        paginationPageSize: 20,
        columnDefs: [
        { name: 'UserID', displayName: 'ID', visible: false, enableHiding: false },
        { name: 'UserName', displayName: 'Name', width: 430 },
        { name: 'EmailAddress', displayName: 'Email', width: 430 },
        { name: 'Address1', displayName: 'Address 1', width: 200 },
        { name: 'Address2', displayName: 'Address 2', width: 200 },
        { name: 'Address3', displayName: 'Address 3', width: 200 },
        { name: 'City', width: 200 },
        { name: 'State', width: 200 },
        { name: 'ZipCode', width: 200 },
        { name: 'Name', displayName: 'Country', width: 200 },
        { name: 'AccountCode', displayName: 'Account', width: 200 },
        { name: 'TimeZoneName', displayName: 'TimeZone', width: 200 },
        { name: 'LanguageName', displayName: 'Language', width: 200 },
        { name: 'InsertedByName', displayName: 'Inserted By', width: 200 },
        { name: 'InsertedAt', cellFilter: 'date:\'yyyy-MM-dd\'', width: 200 },
        { name: 'UpdatedByName', displayName: 'Updated By', width: 200 },
        { name: 'UpdatedAt', cellFilter: 'date:\'yyyy-MM-dd\'', width: 200 },
        ],
        enableGridMenu: true,
        exporterCsvFilename: 'users.csv',
        exporterPdfDefaultStyle: { fontSize: 9 },
        exporterPdfTableStyle: { margin: [30, 30, 30, 30] },
        exporterPdfTableHeaderStyle: { fontSize: 10, bold: true, italics: true, color: '#2A3F54' },
        exporterPdfHeader: { text: "User Details", style: 'headerStyle' },
        exporterPdfFooter: function (currentPage, pageCount) {
            return { text: currentPage.toString() + ' of ' + pageCount.toString(), style: 'footerStyle' };
        },
        exporterPdfCustomFormatter: function (docDefinition) {
            docDefinition.styles.headerStyle = { fontSize: 22, bold: true };
            docDefinition.styles.footerStyle = { fontSize: 10, bold: true };
            return docDefinition;
        },
        exporterPdfOrientation: 'landscape',
        exporterPdfPageSize: 'A4',
        exporterPdfMaxGridWidth: 500,
        exporterCsvLinkElement: angular.element(document.querySelectorAll(".custom-csv-link-location")),
    };

    $scope.ugRoleDetails = {
        enableFullRowSelection: true,
        enableRowHeaderSelection: true,
        multiSelect: false,
        paginationPageSize: 5,
    };

    SeaOttersSvc.GetPageDetailsByPageName('users').then(function (data) {
        $scope.pageConfig = data.data.Results;

        $scope.ugUsers.columnDefs = [
                { name: 'UserID', displayName: 'ID', visible: false, enableHiding: false },
                { name: 'UserName', displayName: $scope.LabelName('UserName', 'user'), width: 430 },
                { name: 'EmailAddress', displayName: $scope.LabelName('EmailAddress', 'user'), width: 430 },
                { name: 'Address1', displayName: $scope.LabelName('Address1', 'user'), width: 200 },
                { name: 'Address2', displayName: $scope.LabelName('Address2', 'user'), width: 200 },
                { name: 'Address3', displayName: $scope.LabelName('Address3', 'user'), width: 200 },
                { name: 'City', displayName: $scope.LabelName('City', 'user'), width: 200 },
                { name: 'State', displayName: $scope.LabelName('State', 'user'), width: 200 },
                { name: 'ZipCode', displayName: $scope.LabelName('ZipCode', 'user'), width: 200 },
                { name: 'Name', displayName: $scope.LabelName('Country', 'user'), width: 200 },
                { name: 'AccountCode', displayName: $scope.LabelName('Account', 'user'), width: 200 },
                { name: 'TimeZoneName', displayName: $scope.LabelName('TimeZone', 'user'), width: 200 },
                { name: 'LanguageName', displayName: $scope.LabelName('Language', 'user'), width: 200 },
                { name: 'InsertedByName', displayName: $scope.LabelName('InsertedBy', 'user'), width: 200 },
                { name: 'InsertedAt', displayName: $scope.LabelName('InsertedAt', 'user'), cellFilter: 'date:\'yyyy-MM-dd\'', width: 200 },
                { name: 'UpdatedByName', displayName: $scope.LabelName('UpdatedBy', 'user'), width: 200 },
                { name: 'UpdatedAt', displayName: $scope.LabelName('UpdatedAt', 'user'), cellFilter: 'date:\'yyyy-MM-dd\'', width: 200 },
        ];

        $scope.ugRoleDetails.columnDefs = [
                { name: 'UserRoleAccessMapID', displayName: $scope.LabelName('RoleID', 'UserRoleAccessMap'), visible: false },
                { name: 'RoleType.RoleType', displayName: $scope.LabelName('RoleType', 'UserRoleAccessMap'), visible: false },
                { name: 'RoleType.RoleName', displayName: $scope.LabelName('RoleName', 'UserRoleAccessMap'), width: 200 },
                { name: 'InsertedByName', displayName: $scope.LabelName('InsertedBy', 'UserRoleAccessMap'), width: 200 },
                { name: 'InsertedAt', displayName: $scope.LabelName('InsertedAt', 'UserRoleAccessMap'), width: 200, cellFilter: 'date:\'yyyy-MM-dd\'' },
                { name: 'UpdatedByName', displayName: $scope.LabelName('UpdatedBy', 'UserRoleAccessMap'), width: 200 },
                { name: 'UpdatedAt', displayName: $scope.LabelName('UpdatedAt', 'UserRoleAccessMap'), width: 200, cellFilter: 'date:\'yyyy-MM-dd\'' },
        ];


        LoadData();

    });

    $scope.LabelName = function (fieldName, tableName) {
        if ($scope.pageConfig) {
            var language = $scope.pageConfig.filter(function (obj) {
                if (obj.TableFieldName === fieldName && obj.TableName === tableName)
                    return obj;
            })[0];

            if ($rootScope.UserDetail && $rootScope.UserDetail.Language.toLowerCase() == 'Chinese'.toLowerCase()) {
                return language.CustomFieldNameForChinese;
            }
            return language.CustomFieldNameForEnglish;
        }
    };

    $scope.divForm = false;

    $scope.filterUserValue = '';

    function LoadData() {
        paginationOptions.pageNumber = 1;
        paginationOptions.pageSize = 20;
        SeaOttersSvc.GetUserListByUserID(paginationOptions.pageNumber, paginationOptions.pageSize, $scope.filterUserValue).then(function (data) {
            $scope.ugUsers.totalItems = data.data.Results.TotalRecords;
            $scope.ugUsers.data = data.data.Results.Data;
        });
    };

    $scope.FilterUser = function () {
        paginationOptions.pageNumber = 1;
        paginationOptions.pageSize = 20;
        SeaOttersSvc.GetUserListByUserID(paginationOptions.pageNumber, paginationOptions.pageSize, $scope.filterUserValue).then(function (data) {
            $scope.ugUsers.totalItems = data.data.Results.TotalRecords;
            $scope.ugUsers.data = data.data.Results.Data;
        });
    };

    $scope.ugUsers.onRegisterApi = function (gridApi) {
        $scope.userGridAPI = gridApi;
        gridApi.pagination.on.paginationChanged($scope, function (pageNumber, pageSize) {
            paginationOptions.pageNumber = pageNumber;
            paginationOptions.pageSize = pageSize;
            LoadData();
        });
    };

    function LoadMasters() {
        SeaOttersSvc.GetCountryList().then(function (data) {
            $scope.countries = data.data.Results;
        });

        SeaOttersSvc.GetTimeZoneList().then(function (data) {
            $scope.timezones = data.data.Results;
        });

        SeaOttersSvc.GetLanguageList().then(function (data) {
            $scope.languages = data.data.Results;
        });

        SeaOttersSvc.GetRoleTypeList().then(function (data) {
            $scope.roleTypes = data.data.Results;
        });
    };

    $scope.AddUser = function () {
        $scope.user = {
            UserID: 0, UserName: null, EmailAddress: null, Password: null, Account: { AccountID: null, AccountCode: null }, IsActive: true,
            TimeZone: { TimeZoneID: null, TimeZoneName: null }, Language: { LanguageID: null, LanguageName: null },
            Address1: null, Address2: null, Address3: null, City: null, State: null,
            ZipCode: null, Country: { CountryID: null, Name: null }, UserRoleAccessMapList: []
        };
        LoadMasters();
        $scope.ugRoleDetails.data = [];

        $scope.divForm = true;
    };

    $scope.EditUser = function () {
        var selectedUser = $scope.userGridAPI.selection.getSelectedRows();
        if (selectedUser.length > 0) {
            var userID = selectedUser[0].UserID;
            SeaOttersSvc.GetUserDetailsByUserID(userID).then(function (data) {
                $scope.user = data.data.Results;
                $scope.ugRoleDetails.data = $scope.user.UserRoleAccessMapList;
            });
            LoadMasters();
            $scope.divForm = true;
        }
        else {
            //alert("Please select a record to edit");
            SeaOttersSvc.ShowAlert(17, 1, [{ key: '[action]', value: 'edit' }]);
        }
        $scope.userGridAPI.selection.clearSelectedRows();
    };

    $scope.DeleteUser = function () {
        var selectedUser = $scope.userGridAPI.selection.getSelectedRows();
        if (selectedUser.length > 0) {
            var userID = selectedUser[0].UserID;
            SeaOttersSvc.DeleteUser(userID).then(function (data) {
                if (data.data.Status == true) {
                    SeaOttersSvc.ShowAlert(data.data.MessageId, 3, [{ key: '[Data]', value: 'User' }]);
                    LoadData();
                }
                else {
                    SeaOttersSvc.ShowAlert(data.data.MessageId, 0, {});
                }
            });
        }
        else {
            //alert("Please select a record to delete");
            SeaOttersSvc.ShowAlert(17, 1, [{ key: '[action]', value: 'delete' }]);
        }
        $scope.userGridAPI.selection.clearSelectedRows();
    };

    $scope.SaveUser = function () {

        if ($scope.user.UserRoleAccessMapList != null && $scope.user.UserRoleAccessMapList.length > 0) {
            var count = 0;
            for (var i = 0; i < $scope.user.UserRoleAccessMapList.length; i++) {
                if ($scope.user.UserRoleAccessMapList[i].IsDeleted == false) {
                    count++;
                    break;
                }
            }
            if (count >= 0) {
                SeaOttersSvc.SaveUser($scope.user).then(function (data) {
                    if (data.data.Status == true) {
                        SeaOttersSvc.ShowAlert(data.data.MessageId, 3, [{ key: '[Data]', value: 'User' }]);
                        LoadData();
                        $scope.divForm = false;
                    }
                    else {
                        SeaOttersSvc.ShowAlert(data.data.MessageId, 0, {});
                    }
                });
            }
            else {
                SeaOttersSvc.ShowAlert(14, 0, {});
            }
        }
        else {
            SeaOttersSvc.ShowAlert(14, 0, {});
        }
    };

    $scope.ugRoleDetails.onRegisterApi = function (gridApi) {
        $scope.roleGridAPI = gridApi;
    };

    var RoleDetailsCtrl = function ($scope, $modalInstance, roleTypes, pageConfig, userLanguage, userRoleAccessMap) {

        $scope.pageConfig = pageConfig;
        $scope.userLanguage = userLanguage;

        $scope.LabelName = function (fieldName, tableName) {
            if ($scope.pageConfig) {
                var language = $scope.pageConfig.filter(function (obj) {
                    if (obj.TableFieldName === fieldName && obj.TableName === tableName)
                        return obj;
                })[0];

                if ($scope.userLanguage.toLowerCase() == 'Chinese'.toLowerCase()) {
                    return language.CustomFieldNameForChinese;
                }
                return language.CustomFieldNameForEnglish;
            }
        };

        $scope.ugRole = {
            enableFullRowSelection: false,
            enableRowHeaderSelection: true,
            multiSelect: true,
            paginationPageSize: 5,
            columnDefs: [
                { name: 'RoleTypeID', visible: false },
                { name: 'RoleName', displayName: $scope.LabelName('RoleName', 'UserRoleAccessMap'), width: 200 },
            ],
        };

        $scope.ugRole.data = roleTypes;

        $scope.ugRole.onRegisterApi = function (gridApi) {
            $scope.roleGridAPI = gridApi;
        };

        $scope.UserRoleAccessMapList = [];

        $scope.ok = function () {
            var selectedRole = $scope.roleGridAPI.selection.getSelectedRows();
            if (selectedRole.length > 0) {
                for (var i = 0; i < selectedRole.length; i++) {
                    var userRoleAccessMap = {
                        UserRoleAccessMapID: 0, RoleType: { RoleTypeID: selectedRole[i].RoleTypeID, RoleName: selectedRole[i].RoleName }
                    };
                    $scope.UserRoleAccessMapList.push(userRoleAccessMap);
                }
            }
            $modalInstance.close($scope.UserRoleAccessMapList);
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    };

    $scope.AddRole = function () {
        var modalInstance = SeaOttersSvc.ShowRoleModal(null, $scope.roleTypes, $scope.pageConfig, $rootScope.UserDetail.Language, RoleDetailsCtrl);
        modalInstance.result.then(function (userRoleAccessMapList) {
            for (var j = 0; j < userRoleAccessMapList.length; j++) {
                var isFound = false;
                for (i = 0; i < $scope.user.UserRoleAccessMapList.length; i++) {
                    if ($scope.user.UserRoleAccessMapList[i].RoleType.RoleName === userRoleAccessMapList[j].RoleType.RoleName) {
                        isFound = true;
                        break;
                    }
                }
                if (!isFound)
                    $scope.user.UserRoleAccessMapList.push(userRoleAccessMapList[j]);
            }

            $scope.ugRoleDetails.data = $scope.user.UserRoleAccessMapList;
        });
    };

    $scope.DeleteRole = function () {
        var selectedRole = $scope.roleGridAPI.selection.getSelectedRows();
        if (selectedRole.length > 0) {
            var userRoleAccessMap = selectedRole[0];
            if (userRoleAccessMap.UserRoleAccessMapID != null && userRoleAccessMap.UserRoleAccessMapID != undefined && userRoleAccessMap.UserRoleAccessMapID != 0) {
                $scope.user.UserRoleAccessMapList.filter(function (obj) {
                    if (obj.UserRoleAccessMapID === userRoleAccessMap.UserRoleAccessMapID) {
                        $scope.user.UserRoleAccessMapList.splice($scope.user.UserRoleAccessMapList.indexOf(obj), 1);
                        userRoleAccessMap.IsDeleted = true;
                        $scope.user.UserRoleAccessMapList.push(userRoleAccessMap);
                    }
                });
            }
            else {
                $scope.user.UserRoleAccessMapList.filter(function (obj) {
                    if (obj.$$hashKey === userRoleAccessMap.$$hashKey) {
                        $scope.user.UserRoleAccessMapList.splice($scope.user.UserRoleAccessMapList.indexOf(obj), 1);
                    }
                });
            }
        }
        else {
            //alert("Please select a record to delete");
            SeaOttersSvc.ShowAlert(17, 1, [{ key: '[action]', value: 'delete' }]);
        }
        $scope.roleGridAPI.selection.clearSelectedRows();
    };

    var PasswordDetailsCtrl = function ($scope, $modalInstance) {

        $scope.ok = function (password) {
            $modalInstance.close(password);
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    };

    $scope.OpenPasswordModal = function () {
        var modalInstance = SeaOttersSvc.ShowPasswordModal(PasswordDetailsCtrl);
        modalInstance.result.then(function (password) {
            $scope.user.Password = password;
        });
    };

})
.controller('addressTypesCtrl', function ($state, $scope, SeaOttersSvc, $rootScope) {
    if (!SeaOttersSvc.IsValidUser()) {
        $state.go('login');
        return;
    }

    SeaOttersSvc.UserRolePermission('Address Type').then(function (data) {
        $scope.userRolePermission = data.data.Results;
        if ($scope.userRolePermission == null || $scope.userRolePermission[0].Access == 0) {
            SeaOttersSvc.ShowAlert(-1, 0, {});
        }
    });

    $scope.divForm = false;

    SeaOttersSvc.GetAddressTypeList().then(function (data) {
        $scope.ugAddressTypes.data = data.data.Results;
    });

    $scope.ugAddressTypes = {
        enableFullRowSelection: true,
        enableFiltering: true,
        multiSelect: false,
        enableRowHeaderSelection: true,
        paginationPageSizes: [10, 20, 30, 40, 50, 100, 500],
        paginationPageSize: 20,
        enableGridMenu: true,
        exporterCsvFilename: 'AddressType.csv',
        exporterPdfDefaultStyle: { fontSize: 9 },
        exporterPdfTableStyle: { margin: [30, 30, 30, 30] },
        exporterPdfTableHeaderStyle: { fontSize: 10, bold: true, italics: true, color: '#2A3F54' },
        exporterPdfHeader: { text: "Address Type Details", style: 'headerStyle' },
        exporterPdfFooter: function (currentPage, pageCount) {
            return { text: currentPage.toString() + ' of ' + pageCount.toString(), style: 'footerStyle' };
        },
        exporterPdfCustomFormatter: function (docDefinition) {
            docDefinition.styles.headerStyle = { fontSize: 22, bold: true };
            docDefinition.styles.footerStyle = { fontSize: 10, bold: true };
            return docDefinition;
        },
        exporterPdfOrientation: 'landscape',
        exporterPdfPageSize: 'A4',
        exporterPdfMaxGridWidth: 500,
        exporterCsvLinkElement: angular.element(document.querySelectorAll(".custom-csv-link-location")),
    };

    SeaOttersSvc.GetPageDetailsByPageName('Address Type').then(function (data) {
        $scope.pageConfig = data.data.Results;
        $scope.ugAddressTypes = {
            columnDefs: [
           { name: 'AddressTypeID', displayName: 'ID', visible: false, enableHiding: false },
           { name: 'AddressTypeName', displayName: $scope.LabelName('AddressTypeName', 'AddressType'), width: 200 },
           { name: 'InsertedByName', displayName: $scope.LabelName('InsertedBy', 'AddressType'), width: 200 },
           { name: 'InsertedAt', width: 200, displayName: $scope.LabelName('InsertedAt', 'AddressType'), cellFilter: 'date:\'yyyy-MM-dd\'' },
           { name: 'UpdatedByName', displayName: $scope.LabelName('UpdatedBy', 'AddressType'), width: 200 },
           { name: 'UpdatedAt', width: 200, displayName: $scope.LabelName('UpdatedAt', 'AddressType'), cellFilter: 'date:\'yyyy-MM-dd\'' },
            ],
        }
        SeaOttersSvc.GetAddressTypeList().then(function (data) {
            $scope.ugAddressTypes.data = data.data.Results;
        });
    });

    $scope.LabelName = function (fieldName, tableName) {
        if ($scope.pageConfig) {
            var language = $scope.pageConfig.filter(function (obj) {
                if (obj.TableFieldName === fieldName && obj.TableName === tableName)
                    return obj;
            })[0];

            if ($rootScope.UserDetail && $rootScope.UserDetail.Language.toLowerCase() == 'Chinese'.toLowerCase()) {
                return language.CustomFieldNameForChinese;
            }
            return language.CustomFieldNameForEnglish;
        }
    };

    $scope.FilterAddressype = function () {
        $scope.addressTypeGridApi.grid.refresh();
    };

    $scope.ugAddressTypes.onRegisterApi = function (gridApi) {
        $scope.addressTypeGridApi = gridApi;
        $scope.addressTypeGridApi.grid.registerRowsProcessor($scope.singleFilter, 200);
    };

    $scope.singleFilter = function (renderableRows) {
        var matcher = new RegExp($scope.filterAddressTypeValue, 'i');
        renderableRows.forEach(function (row) {
            var match = false;
            ['AddressTypeName'].forEach(function (field) {
                if (row.entity[field].match(matcher)) {
                    match = true;
                }
            });
            if (!match) {
                row.visible = false;
            }
        });
        return renderableRows;
    }

    $scope.AddNew = function () {
        $scope.addressType = {
            AddressTypeID: 0, AddressTypeName: null
        };
        $scope.divView = false;
        $scope.divForm = true;
    };

    $scope.EditAT = function () {
        //debugger;
        var selectedAT = $scope.addressTypeGridApi.selection.getSelectedRows();
        var recordCount = selectedAT.length;
        if (recordCount > 0) {
            var addressTypeID = selectedAT[0].AddressTypeID;
            SeaOttersSvc.GetAddressTypeDetailsByVTID(addressTypeID).then(function (data) {
                //debugger;
                $scope.vendorType = data.data.Results;
            });
            $scope.divForm = true;
        }
        else {
            SeaOttersSvc.ShowAlert(17, 1, [{ key: '[action]', value: 'edit' }]);
        }
        $scope.addressTypeGridApi.selection.clearSelectedRows();
    };

    $scope.DeleteAddressType = function () {
        var selectedAT = $scope.addressTypeGridApi.selection.getSelectedRows();
        var recordCount = selectedAT.length;
        SeaOttersSvc.ShowLoadingWheel(true);
        if (recordCount > 0) {
            var addressTypeID = selectedAT[0].AddressTypeID;
            //alert("WIP");
            SeaOttersSvc.DeleteAddressType(addressTypeID).then(function (data) {
                SeaOttersSvc.ShowLoadingWheel(false);
                if (data.data.Status == true) {
                    SeaOttersSvc.ShowAlert(data.data.MessageId, 3, [{ key: '[Data]', value: 'Address Type' }]);
                    SeaOttersSvc.GetAddressTypeList().then(function (data) {
                        $scope.ugAddressTypes.data = data.data.Results;
                    });
                }
                else {
                    SeaOttersSvc.ShowAlert(data.data.MessageId, 0, {});
                }
            });
        }
        else {
            SeaOttersSvc.ShowLoadingWheel(false);
            SeaOttersSvc.ShowAlert(17, 1, [{ key: '[action]', value: 'delete' }]);
        }
        $scope.addressTypeGridApi.selection.clearSelectedRows();
    };

    $scope.SaveAddressType = function () {
        //SeaOttersSvc.ShowLoadingWheel(true);
        SeaOttersSvc.ShowLoadingWheel(true);
        SeaOttersSvc.SaveAddressType($scope.addressType).then(function (data) {
            SeaOttersSvc.ShowLoadingWheel(false);
            if (data.data.Status == true) {
                SeaOttersSvc.ShowAlert(4, 3, [{ key: '[Data]', value: 'Address Type' }]);
                SeaOttersSvc.GetAddressTypeList().then(function (data) {
                    $scope.ugAddressTypes.data = data.data.Results;
                    $scope.divView = true;
                    $scope.divForm = false;
                });
            } else {
                SeaOttersSvc.ShowAlert(data.MessageId, 0, {});
            }
        });
    };
})
.controller('searchCtrl', ['$state', '$scope', 'SeaOttersSvc', '$rootScope', 'uiGridGroupingConstants', function ($state, $scope, SeaOttersSvc, $rootScope, uiGridGroupingConstants) {
    if (!SeaOttersSvc.IsValidUser()) {
        $state.go('login');
        return;
    }

    $scope.divForm = false;

    SeaOttersSvc.SearchList().then(function (data) {
        $scope.ugSearchLists.data = data.data.Results;
    });

    $scope.ugSearchLists = {
        enableFullRowSelection: true,
        enableFiltering: true,
        multiSelect: false,
        enableRowHeaderSelection: true,
        paginationPageSizes: [10, 20, 30, 40, 50, 100, 500],
        paginationPageSize: 20,
        treeRowHeaderAlwaysVisible: false,
        columnDefs: [
            {
                name: 'factoryName', width: 200, displayName: "Factory", grouping: { groupPriority: 1 }, sort: { priority: 1, direction: 'asc' },
                cellTemplate: '<div><div ng-if="!col.grouping || col.grouping.groupPriority === undefined || col.grouping.groupPriority === null || ( row.groupHeader && col.grouping.groupPriority === row.treeLevel )" class="ui-grid-cell-contents" title="TOOLTIP"> {{COL_FIELD CUSTOM_FILTERS}}</div></div>'
            },
              {
                  name: 'OwnerName', displayName: 'Factory Owner', width: 175, grouping: { groupPriority: 0 }, sort: { priority: 0, direction: 'asc' },
                  cellTemplate: '<div><div ng-if="!col.grouping || col.grouping.groupPriority === undefined || col.grouping.groupPriority === null || ( row.groupHeader && col.grouping.groupPriority === row.treeLevel )" class="ui-grid-cell-contents" title="TOOLTIP"> {{COL_FIELD CUSTOM_FILTERS}}</div></div>'
              }, { name: 'EquipmentName', displayName: 'Equipment Category', width: 175 },
            { name: 'SerialNUmber', width: 175, displayName: 'Serial#' },
            { name: 'BrandName', width: 175, display: 'Brand' },
        ],
        enableGridMenu: true,
        exporterCsvFilename: 'SearchList.csv',
        exporterPdfDefaultStyle: { fontSize: 9 },
        exporterPdfTableStyle: { margin: [30, 30, 30, 30] },
        exporterPdfTableHeaderStyle: { fontSize: 10, bold: true, italics: true, color: '#2A3F54' },
        exporterPdfHeader: { text: "Search List", style: 'headerStyle' },
        exporterPdfFooter: function (currentPage, pageCount) {
            return { text: currentPage.toString() + ' of ' + pageCount.toString(), style: 'footerStyle' };
        },
        exporterPdfCustomFormatter: function (docDefinition) {
            docDefinition.styles.headerStyle = { fontSize: 22, bold: true };
            docDefinition.styles.footerStyle = { fontSize: 10, bold: true };
            return docDefinition;
        },
        exporterPdfOrientation: 'landscape',
        exporterPdfPageSize: 'A4',
        exporterPdfMaxGridWidth: 500,
        exporterCsvLinkElement: angular.element(document.querySelectorAll(".custom-csv-link-location")),
    };

    $scope.FilterSearchList = function () {
        $scope.SearchListGridApi.grid.refresh();
    };

    $scope.ugSearchLists.onRegisterApi = function (gridApi) {
        $scope.SearchListGridApi = gridApi;
        $scope.SearchListGridApi.grid.registerRowsProcessor($scope.singleFilter, 200);
    };

    $scope.singleFilter = function (renderableRows) {
        var matcher = new RegExp($scope.filterSearchListValue, 'i');
        renderableRows.forEach(function (row) {
            var match = false;
            ['OwnerName', 'factoryName', 'EquipmentName', 'SerialNUmber'].forEach(function (field) {
                if (row.entity[field].match(matcher)) {
                    match = true;
                }
            });
            if (!match) {
                row.visible = false;
            }
        });
        return renderableRows;
    }
}])
.controller('pageConfigCtrl', function ($state, $scope, SeaOttersSvc, $rootScope) {

    if (!SeaOttersSvc.IsValidUser()) {
        $state.go('login');
        return;
    }

    SeaOttersSvc.UserRolePermission('Page Configuration').then(function (data) {
        $scope.userRolePermission = data.data.Results;
        if ($scope.userRolePermission == null || $scope.userRolePermission[0].Access == 0) {
            SeaOttersSvc.ShowAlert(-1, 0, {});
        }
    });

    var paginationOptions = {
        pageNumber: 1,
        pageSize: 20,
        sort: null
    };

    $scope.divForm = false;
    $scope.filterPageConfigValue = '';

    function LoadData() {
        SeaOttersSvc.GetSystemPageList(paginationOptions.pageNumber, paginationOptions.pageSize, $scope.filterPageConfigValue).then(function (data) {
            $scope.ugPageConfigs.totalItems = data.data.Results.TotalRecords;
            $scope.ugPageConfigs.data = data.data.Results.Data;
        });
    }

    LoadData();

    $scope.ugPageConfigs = {
        enableFullRowSelection: true,
        enableFiltering: true,
        multiSelect: false,
        enableRowHeaderSelection: true,
        useExternalPagination: true,
        paginationPageSizes: [10, 20, 30, 40, 50, 100, 500],
        paginationPageSize: 20,
        columnDefs: [
            { name: 'SystemPageID', displayName: 'ID', visible: false, enableHiding: false, enableFiltering: false },
            { name: 'PageName', displayName: 'Module Name', width: 200, enableFiltering: false },
            { name: 'InsertedByName', displayName: 'Inserted By', width: 200, enableFiltering: false },
            { name: 'InsertedAt', width: 200, cellFilter: 'date:\'yyyy-MM-dd\'', enableFiltering: false },
            { name: 'UpdatedByName', displayName: 'Updated By', width: 200, enableFiltering: false },
            { name: 'UpdatedAt', width: 200, cellFilter: 'date:\'yyyy-MM-dd\'', enableFiltering: false },
        ],
        enableGridMenu: true,
        exporterCsvFilename: 'SystemPage.csv',
        exporterPdfDefaultStyle: { fontSize: 9 },
        exporterPdfTableStyle: { margin: [30, 30, 30, 30] },
        exporterPdfTableHeaderStyle: { fontSize: 10, bold: true, italics: true, color: '#2A3F54' },
        exporterPdfHeader: { text: "SystemPage Details", style: 'headerStyle' },
        exporterPdfFooter: function (currentPage, pageCount) {
            return { text: currentPage.toString() + ' of ' + pageCount.toString(), style: 'footerStyle' };
        },
        exporterPdfCustomFormatter: function (docDefinition) {
            docDefinition.styles.headerStyle = { fontSize: 22, bold: true };
            docDefinition.styles.footerStyle = { fontSize: 10, bold: true };
            return docDefinition;
        },
        exporterPdfOrientation: 'landscape',
        exporterPdfPageSize: 'A4',
        exporterPdfMaxGridWidth: 500,
        exporterCsvLinkElement: angular.element(document.querySelectorAll(".custom-csv-link-location")),
    };

    $scope.FilterPageConfig = function () {
        paginationOptions.pageNumber = 1;
        paginationOptions.pageSize = 20;
        LoadData();
    };

    $scope.ugPageConfigs.onRegisterApi = function (gridApi) {
        $scope.systemPageGridApi = gridApi;
        gridApi.pagination.on.paginationChanged($scope, function (pageNumber, pageSize) {
            paginationOptions.pageNumber = pageNumber;
            paginationOptions.pageSize = pageSize;
            LoadData();
        });
    };

    $scope.EditSystemPage = function () {
        //debugger;
        var selectedSP = $scope.systemPageGridApi.selection.getSelectedRows();
        var recordCount = selectedSP.length;
        if (recordCount > 0) {
            var SPID = selectedSP[0].SystemPageID;
            var SPPageName = selectedSP[0].PageName;
            SeaOttersSvc.GetPageDetailsByPageName(SPPageName).then(function (data) {
                $scope.pageConfig = data.data.Results;
            });
            $scope.divForm = true;
        }
        else {
            SeaOttersSvc.ShowAlert(17, 1, [{ key: '[action]', value: 'edit' }]);
        }
        $scope.systemPageGridApi.selection.clearSelectedRows();
    };

    $scope.SavePageConfig = function () {
        SeaOttersSvc.ShowLoadingWheel(true);
        //debugger;
        SeaOttersSvc.SavePageConfig($scope.pageConfig).then(function (data) {
            //debugger;
            SeaOttersSvc.ShowAlert(4, 3, [{ key: '[Data]', value: 'Page Configuration' }]);
            SeaOttersSvc.ShowLoadingWheel(false);
            LoadData();
            $scope.divView = true;
            $scope.divForm = false;
        });
    };

})
.controller('uomCtrl', function ($state, $scope, $http, SeaOttersSvc, $modal, $rootScope) {

    if (!SeaOttersSvc.IsValidUser()) {
        $state.go('login');
        return;
    }

    SeaOttersSvc.UserRolePermission('uom').then(function (data) {
        $scope.userRolePermission = data.data.Results;
        if ($scope.userRolePermission[0].Access == 0) {
            SeaOttersSvc.ShowAlert(-1, 0, {});
        }
    });

    var paginationOptions = {
        pageNumber: 1,
        pageSize: 20,
        sort: null
    };

    $scope.ugUOM = {
        enableFullRowSelection: true,
        enableFiltering: true,
        useExternalPagination: true,
        multiSelect: false,
        enableRowHeaderSelection: true,
        paginationPageSizes: [10, 20, 30, 40, 50, 100, 500],
        paginationPageSize: 20,
        columnDefs: [
        { name: 'ID', displayName: 'ID', visible: false, enableHiding: false },
        { name: 'Name', displayName: 'Name', width: 430 },
        { name: 'InsertedByName', displayName: 'Inserted By', width: 200 },
        { name: 'InsertedAt', cellFilter: 'date:\'yyyy-MM-dd\'', width: 200 },
        { name: 'UpdatedByName', displayName: 'Updated By', width: 200 },
        { name: 'UpdatedAt', cellFilter: 'date:\'yyyy-MM-dd\'', width: 200 },
        { name: 'IsActive', width: 100 },
        ],
        enableGridMenu: true,
        exporterCsvFilename: 'uom.csv',
        exporterPdfDefaultStyle: { fontSize: 9 },
        exporterPdfTableStyle: { margin: [30, 30, 30, 30] },
        exporterPdfTableHeaderStyle: { fontSize: 10, bold: true, italics: true, color: '#2A3F54' },
        exporterPdfHeader: { text: "UOM Details", style: 'headerStyle' },
        exporterPdfFooter: function (currentPage, pageCount) {
            return { text: currentPage.toString() + ' of ' + pageCount.toString(), style: 'footerStyle' };
        },
        exporterPdfCustomFormatter: function (docDefinition) {
            docDefinition.styles.headerStyle = { fontSize: 22, bold: true };
            docDefinition.styles.footerStyle = { fontSize: 10, bold: true };
            return docDefinition;
        },
        exporterPdfOrientation: 'landscape',
        exporterPdfPageSize: 'A4',
        exporterPdfMaxGridWidth: 500,
        exporterCsvLinkElement: angular.element(document.querySelectorAll(".custom-csv-link-location")),
    };

    SeaOttersSvc.GetPageDetailsByPageName('UOM').then(function (data) {
        $scope.pageConfig = data.data.Results;

        //$scope.ugUOM.columnDefs = [
        //        { name: 'ID', displayName: 'ID', visible: false, enableHiding: false },
        //        { name: 'Name', displayName: $scope.LabelName('Name', 'UOM'), width: 430 },
        //        { name: 'InsertedByName', displayName: $scope.LabelName('InsertedBy', 'UOM'), width: 200 },
        //        { name: 'InsertedAt', displayName: $scope.LabelName('InsertedAt', 'UOM'), cellFilter: 'date:\'yyyy-MM-dd\'', width: 200 },
        //        { name: 'UpdatedByName', displayName: $scope.LabelName('UpdatedBy', 'UOM'), width: 200 },
        //        { name: 'UpdatedAt', displayName: $scope.LabelName('UpdatedAt', 'UOM'), cellFilter: 'date:\'yyyy-MM-dd\'', width: 200 },
        //        { name: 'IsActive', displayName: $scope.LabelName('IsActive', 'UOM'), width: 100 },
        //];

        LoadData();

    });

    $scope.LabelName = function (fieldName, tableName) {
        if ($scope.pageConfig) {
            var language = $scope.pageConfig.filter(function (obj) {
                if (obj.TableFieldName === fieldName && obj.TableName === tableName)
                    return obj;
            })[0];

            if ($rootScope.UserDetail && $rootScope.UserDetail.Language.toLowerCase() == 'Chinese'.toLowerCase()) {
                return language.CustomFieldNameForChinese;
            }
            return language.CustomFieldNameForEnglish;
        }
    };

    $scope.divForm = false;

    $scope.filterUOMValue = '';

    function LoadData() {
        SeaOttersSvc.GetUOMListByID(paginationOptions.pageNumber, paginationOptions.pageSize, $scope.filterUOMValue).then(function (data) {
            $scope.ugUOM.totalItems = data.data.Results.TotalRecords;
            $scope.ugUOM.data = data.data.Results.Data;
        });
    };

    $scope.FilterUOM = function () {
        paginationOptions.pageNumber = 1;
        paginationOptions.pageSize = 20;
        LoadData();
    };

    $scope.ugUOM.onRegisterApi = function (gridApi) {
        $scope.uomGridAPI = gridApi;
        gridApi.pagination.on.paginationChanged($scope, function (pageNumber, pageSize) {
            paginationOptions.pageNumber = pageNumber;
            paginationOptions.pageSize = pageSize;
            LoadData();
        });
    };

    $scope.AddUOM = function () {
        $scope.uom = {
            ID: 0, Name: null, IsActive: true,
        };
        $scope.divForm = true;
    };

    $scope.EditUOM = function () {
        var selectedUOM = $scope.uomGridAPI.selection.getSelectedRows();
        if (selectedUOM.length > 0) {
            var ID = selectedUOM[0].ID;
            SeaOttersSvc.GetUOMDetailsByID(ID).then(function (data) {
                $scope.uom = data.data.Results;
            });
            $scope.divForm = true;
        }
        else {
            SeaOttersSvc.ShowAlert(17, 1, [{ key: '[action]', value: 'edit' }]);
        }
        $scope.uomGridAPI.selection.clearSelectedRows();
    };

    $scope.DeleteUOM = function () {
        var selectedUOM = $scope.uomGridAPI.selection.getSelectedRows();
        if (selectedUOM.length > 0) {
            var ID = selectedUOM[0].ID;
            SeaOttersSvc.DeleteUOM(ID).then(function (data) {
                if (data.data.Status == true) {
                    SeaOttersSvc.ShowAlert(data.data.MessageId, 3, [{ key: '[Data]', value: 'UOM' }]);
                    LoadData();
                }
                else {
                    SeaOttersSvc.ShowAlert(data.data.MessageId, 0, {});
                }
            });
        }
        else {
            SeaOttersSvc.ShowAlert(17, 1, [{ key: '[action]', value: 'delete' }]);
        }
        $scope.uomGridAPI.selection.clearSelectedRows();
    };

    $scope.SaveUOM = function () {
        SeaOttersSvc.SaveUOM($scope.uom).then(function (data) {
            if (data.data.Status == true) {
                SeaOttersSvc.ShowAlert(data.data.MessageId, 3, [{ key: '[Data]', value: 'UOM' }]);
                LoadData();
                $scope.divForm = false;
            }
            else {
                SeaOttersSvc.ShowAlert(data.data.MessageId, 0, {});
            }
        });
    };
})
.controller('partTypeCtrl', function ($state, $scope, $http, SeaOttersSvc, $modal, $rootScope) {

    if (!SeaOttersSvc.IsValidUser()) {
        $state.go('login');
        return;
    }

    SeaOttersSvc.UserRolePermission('partType').then(function (data) {
        $scope.userRolePermission = data.data.Results;
        if ($scope.userRolePermission[0].Access == 0) {
            SeaOttersSvc.ShowAlert(-1, 0, {});
        }
    });

    var paginationOptions = {
        pageNumber: 1,
        pageSize: 20,
        sort: null
    };

    $scope.ugPartType = {
        enableFullRowSelection: true,
        enableFiltering: true,
        useExternalPagination: true,
        multiSelect: false,
        enableRowHeaderSelection: true,
        paginationPageSizes: [10, 20, 30, 40, 50, 100, 500],
        paginationPageSize: 20,
        columnDefs: [
        { name: 'ID', displayName: 'ID', visible: false, enableHiding: false },
        { name: 'Type', displayName: 'Type', width: 150 },
        { name: 'PType', displayName: 'Parent Type', width: 150 },
        { name: 'InsertedByName', displayName: 'Inserted By', width: 200 },
        { name: 'InsertedAt', cellFilter: 'date:\'yyyy-MM-dd\'', width: 200 },
        { name: 'UpdatedByName', displayName: 'Updated By', width: 200 },
        { name: 'UpdatedAt', cellFilter: 'date:\'yyyy-MM-dd\'', width: 200 },
        ],
        enableGridMenu: true,
        exporterCsvFilename: 'PartType.csv',
        exporterPdfDefaultStyle: { fontSize: 9 },
        exporterPdfTableStyle: { margin: [30, 30, 30, 30] },
        exporterPdfTableHeaderStyle: { fontSize: 10, bold: true, italics: true, color: '#2A3F54' },
        exporterPdfHeader: { text: "PartType Details", style: 'headerStyle' },
        exporterPdfFooter: function (currentPage, pageCount) {
            return { text: currentPage.toString() + ' of ' + pageCount.toString(), style: 'footerStyle' };
        },
        exporterPdfCustomFormatter: function (docDefinition) {
            docDefinition.styles.headerStyle = { fontSize: 22, bold: true };
            docDefinition.styles.footerStyle = { fontSize: 10, bold: true };
            return docDefinition;
        },
        exporterPdfOrientation: 'landscape',
        exporterPdfPageSize: 'A4',
        exporterPdfMaxGridWidth: 500,
        exporterCsvLinkElement: angular.element(document.querySelectorAll(".custom-csv-link-location")),
    };

    SeaOttersSvc.GetPageDetailsByPageName('PartType').then(function (data) {
        $scope.pageConfig = data.data.Results;
        $scope.ugPartType.columnDefs = [
                { name: 'ID', displayName: 'ID', visible: false, enableHiding: false },
                { name: 'Type', displayName: $scope.LabelName('Type', 'PartType'), width: 175 },
                { name: 'PType', displayName: $scope.LabelName('ParentID', 'PartType'), width: 175 },
                { name: 'InsertedByName', displayName: $scope.LabelName('InsertedBy', 'PartType'), width: 175 },
                { name: 'InsertedAt', displayName: $scope.LabelName('InsertedAt', 'PartType'), cellFilter: 'date:\'yyyy-MM-dd\'', width: 175 },
                { name: 'UpdatedByName', displayName: $scope.LabelName('UpdatedBy', 'PartType'), width: 175 },
                { name: 'UpdatedAt', displayName: $scope.LabelName('UpdatedAt', 'PartType'), cellFilter: 'date:\'yyyy-MM-dd\'', width: 175 },
        ];
        LoadData();
    });

    $scope.LabelName = function (fieldName, tableName) {
        if ($scope.pageConfig) {
            var language = $scope.pageConfig.filter(function (obj) {
                if (obj.TableFieldName === fieldName && obj.TableName === tableName)
                    return obj;
            })[0];

            if ($rootScope.UserDetail && $rootScope.UserDetail.Language.toLowerCase() == 'Chinese'.toLowerCase()) {
                return language.CustomFieldNameForChinese;
            }
            return language.CustomFieldNameForEnglish;
        }
    };

    $scope.divForm = false;

    $scope.filterPartTypeValue = '';

    function LoadData() {
        SeaOttersSvc.GetPartTypeListByID(paginationOptions.pageNumber, paginationOptions.pageSize, $scope.filterPartTypeValue).then(function (data) {
            $scope.ugPartType.totalItems = data.data.Results.TotalRecords;
            $scope.ugPartType.data = data.data.Results.Data;
        });
    };

    function LoadMasters() {
        SeaOttersSvc.GetParentPartTypeList().then(function (data) {
            $scope.pPartTypes = data.data.Results;
        });
    };

    $scope.filterPartType = function () {
        paginationOptions.pageNumber = 1;
        paginationOptions.pageSize = 20;
        LoadData();
    };

    $scope.ugPartType.onRegisterApi = function (gridApi) {
        $scope.partTypeGridAPI = gridApi;
        gridApi.pagination.on.paginationChanged($scope, function (pageNumber, pageSize) {
            paginationOptions.pageNumber = pageNumber;
            paginationOptions.pageSize = pageSize;
            LoadData();
        });
    };

    $scope.AddPartType = function () {

        $scope.partType = {
            ID: 0, Type: null, IsActive: true, ParentPartType: { ID: null, PartType: null }
        };
        LoadMasters();
        $scope.divForm = true;
    };

    $scope.EditPartType = function () {
        var selectedPartType = $scope.partTypeGridAPI.selection.getSelectedRows();
        if (selectedPartType.length > 0) {
            var ID = selectedPartType[0].ID;
            SeaOttersSvc.GetPartTypeDetailsByID(ID).then(function (data) {
                $scope.partType = data.data.Results;
            });
            $scope.divForm = true;
        }
        else {
            SeaOttersSvc.ShowAlert(17, 1, [{ key: '[action]', value: 'edit' }]);
        }
        LoadMasters();
        $scope.partTypeGridAPI.selection.clearSelectedRows();
    };

    $scope.DeletePartType = function () {
        var selectedPartType = $scope.partTypeGridAPI.selection.getSelectedRows();
        if (selectedPartType.length > 0) {
            var ID = selectedPartType[0].ID;
            SeaOttersSvc.DeletePartType(ID).then(function (data) {
                if (data.data.Status == true) {
                    SeaOttersSvc.ShowAlert(data.data.MessageId, 3, [{ key: '[Data]', value: 'Part Type' }]);
                    LoadData();
                }
                else {
                    SeaOttersSvc.ShowAlert(data.data.MessageId, 0, {});
                }
            });
        }
        else {
            SeaOttersSvc.ShowAlert(17, 1, [{ key: '[action]', value: 'delete' }]);
        }
        $scope.partTypeGridAPI.selection.clearSelectedRows();
    };

    $scope.SavePartType = function () {
        SeaOttersSvc.SavePartType($scope.partType).then(function (data) {
            if (data.data.Status == true) {
                SeaOttersSvc.ShowAlert(data.data.MessageId, 3, [{ key: '[Data]', value: 'Part Type' }]);
                LoadData();
                $scope.divForm = false;
            }
            else {
                SeaOttersSvc.ShowAlert(data.data.MessageId, 0, {});
            }
        });
    };
})
.controller('partMasterCtrl', function ($state, $scope, $http, SeaOttersSvc, $modal, $rootScope) {

    if (!SeaOttersSvc.IsValidUser()) {
        $state.go('login');
        return;
    }

    SeaOttersSvc.UserRolePermission('PartMaster').then(function (data) {
        //debugger;
        $scope.userRolePermission = data.data.Results;
        if ($scope.userRolePermission[0].Access == 0) {
            SeaOttersSvc.ShowAlert(-1, 0, {});
        }
    });

    $('#divExpirationDate').datetimepicker({ format: "YYYY-MM-DD" });
    $('#divEffectiveDate').datetimepicker({ format: "YYYY-MM-DD" });

    var paginationOptions = {
        pageNumber: 1,
        pageSize: 20,
        sort: null
    };

    $scope.ugPartMaster = {
        enableFullRowSelection: true,
        enableFiltering: true,
        useExternalPagination: true,
        multiSelect: false,
        enableRowHeaderSelection: true,
        paginationPageSizes: [10, 20, 30, 40, 50, 100, 500],
        paginationPageSize: 20,
        columnDefs: [
        { name: 'ID', displayName: 'ID', visible: false, enableHiding: false },
        { name: 'PartFamily', displayName: 'FamilyName', width: 230 },
        { name: 'PartNumber', displayName: 'PartNumber', width: 230 },
        { name: 'PartDescription', displayName: 'PartDescription', width: 230 },
        { name: 'StandardPrice', displayName: 'StandardPrice', width: 430 },
        { name: 'SellingPrice', displayName: 'SellingPrice', width: 430 },
        { name: 'Effectivedate', displayName: 'Effectivedate', width: 430 },
        { name: 'ExpirationDate', displayName: 'ExpirationDate', width: 430 },
        { name: 'PartType', displayName: 'PartType', width: 430 },
        { name: 'UOM', displayName: 'UOM', width: 430 },
        { name: 'InsertedByName', displayName: 'Inserted By', width: 200 },
        { name: 'InsertedAt', cellFilter: 'date:\'yyyy-MM-dd\'', width: 200 },
        { name: 'UpdatedByName', displayName: 'Updated By', width: 200 },
        { name: 'UpdatedAt', cellFilter: 'date:\'yyyy-MM-dd\'', width: 200 },
        ],
        enableGridMenu: true,
        exporterCsvFilename: 'Part.csv',
        exporterPdfDefaultStyle: { fontSize: 9 },
        exporterPdfTableStyle: { margin: [30, 30, 30, 30] },
        exporterPdfTableHeaderStyle: { fontSize: 10, bold: true, italics: true, color: '#2A3F54' },
        exporterPdfHeader: { text: "Part Details", style: 'headerStyle' },
        exporterPdfFooter: function (currentPage, pageCount) {
            return { text: currentPage.toString() + ' of ' + pageCount.toString(), style: 'footerStyle' };
        },
        exporterPdfCustomFormatter: function (docDefinition) {
            docDefinition.styles.headerStyle = { fontSize: 22, bold: true };
            docDefinition.styles.footerStyle = { fontSize: 10, bold: true };
            return docDefinition;
        },
        exporterPdfOrientation: 'landscape',
        exporterPdfPageSize: 'A4',
        exporterPdfMaxGridWidth: 500,
        exporterCsvLinkElement: angular.element(document.querySelectorAll(".custom-csv-link-location")),
    };

    SeaOttersSvc.GetPageDetailsByPageName('PartMaster,BOM Part').then(function (data) {
        $scope.pageConfig = data.data.Results;
        $scope.ugPartMaster.columnDefs = [
                { name: 'ID', displayName: 'ID', visible: false, enableHiding: false },
                { name: 'PartNumber', displayName: $scope.LabelName('PartNumber', 'PartMaster'), width: 150 },
                { name: 'IsBomedValue', displayName: $scope.LabelName('IsBOMed', 'PartMaster'), width: 100 },
                { name: 'PartDescription', displayName: $scope.LabelName('PartDescription', 'PartMaster'), width: 150 },
                { name: 'DrawingNumber', displayName: $scope.LabelName('DrawingNumber', 'PartMaster'), width: 150 },
                { name: 'PartFamily', displayName: $scope.LabelName('PartFamily', 'PartMaster'), width: 150 },
                { name: 'StandardPrice', displayName: $scope.LabelName('StandardPrice', 'PartMaster'), width: 150 },
                { name: 'SellingPrice', displayName: $scope.LabelName('SellingPrice', 'PartMaster'), width: 150 },
                { name: 'EffectiveDate', displayName: $scope.LabelName('EffectiveDate', 'PartMaster'), cellFilter: 'date:\'yyyy-MM-dd\'', width: 150 },
                { name: 'ExpirationDate', displayName: $scope.LabelName('ExpirationDate', 'PartMaster'), cellFilter: 'date:\'yyyy-MM-dd\'', width: 150 },
                { name: 'PartType', displayName: $scope.LabelName('PartType', 'PartMaster'), width: 150 },
                { name: 'UOM', displayName: $scope.LabelName('UOM', 'PartMaster'), width: 150 },
                { name: 'InsertedByName', displayName: $scope.LabelName('InsertedBy', 'PartMaster'), width: 150 },
                { name: 'InsertedAt', displayName: $scope.LabelName('InsertedAt', 'PartMaster'), cellFilter: 'date:\'yyyy-MM-dd\'', width: 150 },
                { name: 'UpdatedByName', displayName: $scope.LabelName('UpdatedBy', 'PartMaster'), width: 150 },
                { name: 'UpdatedAt', displayName: $scope.LabelName('UpdatedAt', 'PartMaster'), cellFilter: 'date:\'yyyy-MM-dd\'', width: 150 },
        ];

        //$scope.ugPartDocument.columnDefs = [
        //{ name: 'PartDocumentID', displayName: $scope.LabelName('ID', 'PartMaster'), visible: false, enableHiding: false, enableFiltering: false },
        //{ name: 'PatDocURL', displayName: $scope.LabelName('PatDocURL', 'PartMaster'), width: 230, enableFiltering: false },
        //{ name: 'PartFileName', displayName: $scope.LabelName('PartFileName', 'PartMaster'), width: 230, enableFiltering: false },
        //{ name: 'Description', displayName: $scope.LabelName('Description', 'PartMaster'), width: 230, enableFiltering: false },
        //{ name: 'InsertedByName', displayName: $scope.LabelName('InsertedBy', 'PartMaster'), width: 200, enableFiltering: false },
        //{ name: 'InsertedAt', displayName: $scope.LabelName('InsertedAt', 'PartMaster'), cellFilter: 'date:\'yyyy-MM-dd\'', width: 200, enableFiltering: false },
        //],
        LoadData();

    });

    $scope.LabelName = function (fieldName, tableName) {
        if ($scope.pageConfig) {
            var language = $scope.pageConfig.filter(function (obj) {
                if (obj.TableFieldName === fieldName && obj.TableName === tableName)
                    return obj;
            })[0];

            if ($rootScope.UserDetail && $rootScope.UserDetail.Language.toLowerCase() == 'Chinese'.toLowerCase()) {
                return language.CustomFieldNameForChinese;
            }
            return language.CustomFieldNameForEnglish;
        }
    };

    $scope.divForm = false;

    $scope.filterPartMasterValue = '';

    function LoadData() {
        SeaOttersSvc.GetPartMasterListByID(paginationOptions.pageNumber, paginationOptions.pageSize, $scope.filterPartMasterValue).then(function (data) {
            $scope.ugPartMaster.totalItems = data.data.Results.TotalRecords;
            $scope.ugPartMaster.data = data.data.Results.Data;
        });
        //LoadPartDoc();
    };

    function LoadMasters() {
        SeaOttersSvc.GetPartFamilyList().then(function (data) {
            $scope.PartFamily = data.data.Results;
        });
        SeaOttersSvc.GetPartTypeList().then(function (data) {
            $scope.PartTypeList = data.data.Results;
        });
        SeaOttersSvc.GetUOMListByUserID().then(function (data) {
            $scope.UOMList = data.data.Results;
        });
    };

    $scope.filterPartMaster = function () {
        paginationOptions.pageNumber = 1;
        paginationOptions.pageSize = 20;
        LoadData();
    };

    $scope.ugPartMaster.onRegisterApi = function (gridApi) {
        $scope.partMasterGridAPI = gridApi;
        gridApi.pagination.on.paginationChanged($scope, function (pageNumber, pageSize) {
            paginationOptions.pageNumber = pageNumber;
            paginationOptions.pageSize = pageSize;
            LoadData();
        });
    };

    //$scope.AlternatePartIds = [];
    $scope.AddPartMaster = function () {
        $scope.partmaster = {
            PartID: 0, PartNumber: null, PartDescription: null, StandardPrice: 1, SellingPrice: 1,
            EffectiveDate: null, ExpirationDate: null, UOM: { ID: null, Name: null },
            PartType: { ID: null, Type: null }, PartFamily: { PartFamilyID: null, PartFamilyName: null },
            IsActive: true, IsBOMed: false, DrawingNumber: null, DrawingDocLocation: null, Measurements: 1,
            UnitCostPrice: 1, PartCostPrice: null, selectedBOMParts: [], PartNumberBarCode: null, PartNumberBarCodeURL: null,
            partAddUOMIDs: [], partAddUOMValues: []
        };
        $scope.IsAddDocument = false;
        $scope.partID = 0;
        $scope.savedbomParts = [];
        $('#txtMeasurements').removeAttr('readOnly');
        $('#txtUnitCostPrice').removeAttr('readOnly');
        LoadMasters();
        $scope.divForm = true;
        $("#dvPartDoc").slideUp("slow");
        $scope.partDocList = [];
        //$scope.availableParts = [];
        //$scope.selectedParts = [];
        $scope.savedAdditionalPartMap = [];
        //$scope.AlternatePartIds = [];
    };

    $scope.BOMedChecked = function () {
        $scope.IsBOMedPart = $('#chkBOMed').is(':checked');
        if ($('#chkBOMed').is(':checked')) {
            $scope.partmaster.Measurements = 1;
            $('#txtMeasurements').attr('readOnly', 'readOnly');
            $scope.partmaster.UnitCostPrice = 1;
            $('#txtUnitCostPrice').attr('readOnly', 'readOnly');
            $scope.partmaster.StandardPrice = 1;
        }
        else {
            $('#txtMeasurements').removeAttr('readOnly');
            $('#txtUnitCostPrice').removeAttr('readOnly');
            $scope.partmaster.selectedBOMParts = [];
        }
    }

    $scope.GenerateBarCode = function () {
        $scope.partmaster.PartNumberBarCodeURL = '';
        SeaOttersSvc.GeneratePartNumberBarCode($scope.partmaster.PartNumberBarCode).then(function (data) {
            $scope.partmaster.PartNumberBarCodeURL = data.data.Results;
        });
    }
    $scope.filterSavedAlternatePart = null;
    $scope.EditPartMaster = function () {
        $scope.IsAddDocument = false;
        var selectedPartType = $scope.partMasterGridAPI.selection.getSelectedRows();
        $("#dvPartDoc").slideUp("slow");
        if (selectedPartType.length > 0) {
            $scope.savedbomParts = [];
            var ID = selectedPartType[0].PartID;
            $scope.partID = ID;
            SeaOttersSvc.GetPartMasterDetailsByID(ID).then(function (data) {
                $scope.partmaster = data.data.Results;
                if ($scope.partmaster.IsBOMed) {
                    $('#txtMeasurements').attr('readOnly', 'readOnly');
                    $('#txtUnitCostPrice').attr('readOnly', 'readOnly');
                }
                else {
                    if ($scope.partmaster.UOM.ID != 0 && $scope.partmaster.UOM.ID == 2) {
                        $('#txtMeasurements').attr('readOnly', 'readOnly');
                        $('#txtUnitCostPrice').removeAttr('readOnly');
                    }
                    else {
                        $('#txtMeasurements').removeAttr('readOnly');
                        $('#txtUnitCostPrice').removeAttr('readOnly');
                    }
                }
                //debugger;
                SeaOttersSvc.GetAllAlternatePart(ID, true, $scope.filterSavedAlternatePart).then(function (data) {
                    $scope.savedAlternateParts = data.data.Results;
                });

                SeaOttersSvc.GetPartMasterDocumentListByPartID($scope.partID).then(function (data) {
                    $scope.partDocList = data.data.Results;
                });

                SeaOttersSvc.GetAdditionalUOMListByPartID($scope.partID, true).then(function (data) {
                    $scope.savedAdditionalPartMap = data.data.Results;
                });
            });
            LoadMasters();
            $scope.divForm = true;
        }
        else {
            SeaOttersSvc.ShowAlert(17, 1, [{ key: '[action]', value: 'edit' }]);
        }
        $scope.partMasterGridAPI.selection.clearSelectedRows();
    };

    $scope.FilterSavedAlternatePart = function () {
        SeaOttersSvc.GetAllAlternatePart($scope.partID, true, $scope.filterSavedAlternatePart).then(function (data) {
            $scope.savedAlternateParts = data.data.Results;
        });
    }

    $scope.DeletePartMaster = function () {
        var selectedPartMaster = $scope.partMasterGridAPI.selection.getSelectedRows();
        if (selectedPartMaster.length > 0) {
            var ID = selectedPartMaster[0].PartID;
            SeaOttersSvc.DeletePartMaster(ID).then(function (data) {
                if (data.data.Status == true) {
                    SeaOttersSvc.ShowAlert(data.data.MessageId, 3, [{ key: '[Data]', value: 'Part' }]);
                    LoadData();
                }
                else {
                    SeaOttersSvc.ShowAlert(data.data.MessageId, 0, {});
                }
            });
        }
        else {
            SeaOttersSvc.ShowAlert(17, 1, [{ key: '[action]', value: 'delete' }]);
        }
        $scope.partMasterGridAPI.selection.clearSelectedRows();
    };

    $scope.SavePartMaster = function () {
        $scope.partmaster.EffectiveDate = $('#txtEffectiveDate').val();
        $scope.partmaster.ExpirationDate = $('#txtExpirationDate').val();
        $scope.selectedBOMParts = [];
        //debugger;
        if ($('#txtMeasurements').val() == '' || $('#txtUnitCostPrice').val() == '' || $scope.partmaster.UOM.ID == null || $scope.partmaster.PartType.ID == null) {
            SeaOttersSvc.ShowAlert(16, 0, {});
            return;
        }
        $scope.selectedPartDocumentID = 0;
        $('input:radio[name=chkSavedisDefault]').each(function () {
            if ($(this).is(':checked')) {
                var chkID = $(this).val();
                $scope.partmaster.DefaultPartDocID = chkID;
            }
        });

        $scope.partAddUOMIDs = [];
        $scope.partAddUOMValues = [];
        $('input:checkbox[name=chkDeletePartUOM]').each(function () {
            if ($(this).is(':checked')) {
                var chkID = $(this).val();
                $scope.partAddUOMIDs.push(chkID);
                $scope.partAddUOMValues.push($('#txtSAVEUOMValue' + chkID).val());
            }
        });
        if ($scope.partAddUOMIDs.length != 0 && $scope.partAddUOMValues.length != 0) {
            $scope.partmaster.partAddUOMIDs = $scope.partAddUOMIDs;
            $scope.partmaster.partAddUOMValues = $scope.partAddUOMValues;
        }
        SeaOttersSvc.SavePartMaster($scope.partmaster).then(function (data) {
            if (data.data.Status == true) {
                SeaOttersSvc.ShowAlert(data.data.MessageId, 3, [{ key: '[Data]', value: 'Part' }]);
                LoadData();
                $scope.divForm = false;
            }
            else {
                SeaOttersSvc.ShowAlert(data.data.MessageId, 0, {});
            }
        });
    };

    $scope.isCalculate = function (blurFunction) {
        $scope.partmaster.StandardPrice = parseFloat($scope.partmaster.Measurements).toFixed(2) * parseFloat($scope.partmaster.UnitCostPrice).toFixed(2);
    };

    $scope.UOMChange = function () {
        if ($scope.partmaster.UOM.ID != 0 && $scope.partmaster.UOM.ID == 2) {
            $scope.partmaster.Measurements = 1;
            $('#txtMeasurements').attr('readOnly', 'readOnly');
        }
        else {
            $('#txtMeasurements').removeAttr('readOnly');
        }
    }

    $scope.SavePartDocument = function () {
        var partDoc = "";
        var partDocActualName = "";
        var partDocLegacyName = "";
        //debugger;
        SeaOttersSvc.ShowLoadingWheel(true);
        if ($('#filethumbnail').attr("src") != undefined) {
            partDoc = $('#filethumbnail').attr("src").split(',')[1];
            partDocActualName = $('#file')[0].value;
            partDocDescription = $('#txtPartDocDescription').val();
            IsDefault = $('input:checkbox[name=chkisDefault]').is(':checked');
        }
        //debugger;
        if (partDoc != '') {
            var param =
                {
                    PartID: $scope.partID,
                    PartDocValue: partDoc,
                    PartDocActualName: partDocActualName,
                    PartDocDescription: partDocDescription,
                    IsDefault: IsDefault
                };
            SeaOttersSvc.SavePartMasterDocument(param).then(function (data) {
                if (data.data.Status == true) {
                    SeaOttersSvc.ShowAlert(data.data.MessageId, 3, [{ key: '[Data]', value: 'Part Document' }]);
                    SeaOttersSvc.GetPartMasterDocumentListByPartID($scope.partID).then(function (data) {
                        $scope.partDocList = data.data.Results;
                        $scope.partDocList.forEach(function (item) {
                            if (item.IsDefault)
                                $scope.partmaster.DefaultPartImage = item.PatDocURL;
                        });
                    });
                    $('#txtPartDocDescription').val('');
                    $('#filethumbnail').attr('src', '');
                    $("#file").val('');
                    $scope.IsAddDocument = false;
                    $("#dvPartDoc").slideUp("slow");
                    $scope.selectedPartDocID = [];
                }
                else {
                    $scope.IsAddDocument = true;
                    SeaOttersSvc.ShowLoadingWheel(false);
                    SeaOttersSvc.ShowAlert(data.data.MessageId, 0, {});
                    $scope.selectedPartDocID = [];
                }
            });
        }
        else {
            SeaOttersSvc.ShowLoadingWheel(false);
            $('#txtPartDocDescription').val('');
            $('#filethumbnail').attr('src', '');
            $("#file").val('');
            SeaOttersSvc.ShowAlert(17, 1, [{ key: '[action]', value: 'Document' }]);
        }
        //debugger;
    };
    $scope.IsAddDocument = false;
    $scope.AddPartDocument = function () {
        $('#txtPartDocDescription').val('');
        $('#filethumbnail').attr('src', '');
        $("#file").val('');
        $('#chkisDefault').prop('checked', false);
        $scope.IsAddDocument = true;
        $("#dvPartDoc").slideDown("slow");
        $scope.selectedPartDocID = [];
    };

    $scope.selectedPartDocID = [];
    $scope.DeletePartDocument = function () {
        $scope.IsAddDocument = false;
        $('input:checkbox[name=chkDeletePartDoc]').each(function () {
            if ($(this).is(':checked')) {
                var chkID = $(this).val();
                $scope.selectedPartDocID.push(chkID);
            }
        });

        if ($scope.selectedPartDocID.length != 0) {

            SeaOttersSvc.DeletePartDocument($scope.selectedPartDocID).then(function (data) {
                SeaOttersSvc.ShowLoadingWheel(false);
                if (data.data.Status == true) {
                    $scope.selectedPartDocID = [];
                    SeaOttersSvc.ShowAlert(4, 3, [{ key: '[Data]', value: 'Part Documents' }]);
                    SeaOttersSvc.GetPartMasterDocumentListByPartID($scope.partID).then(function (data) {
                        $scope.partDocList = data.data.Results;
                    });
                } else {
                    SeaOttersSvc.ShowLoadingWheel(false);
                    SeaOttersSvc.ShowAlert(data.MessageId, 0, {});
                }
            });
        }
        else {
            SeaOttersSvc.ShowAlert(17, 1, [{ key: '[action]', value: 'delete' }]);
        }
    };

    $scope.CancelPartDocument = function () {
        $('#txtPartDocDescription').val('');
        $('#filethumbnail').attr('src', '');
        $("#file").val('');
        $('#chkisDefault').prop('checked', false);
        $scope.IsAddDocument = false;
        $scope.selectedPartDocID = [];
        $("#dvPartDoc").slideUp("slow");
        $scope.IsAddDocument = false;
    };

    $scope.selectedDeletedUOMID = [];
    $scope.DeleteAdditionalUOM = function () {
        $scope.selectedDeletedUOMID = [];
        SeaOttersSvc.ShowLoadingWheel(true);
        $('input:checkbox[name=chkDeletePartUOM]').each(function () {
            if ($(this).is(':checked')) {
                var chkID = $(this).val();
                $scope.selectedDeletedUOMID.push(chkID);
            }
        });
        //debugger;
        if ($scope.selectedDeletedUOMID.length != 0) {
            var param = {
                PartID: $scope.partID,
                selectedUnUOMID: $scope.selectedDeletedUOMID,
                selectedUnUOMValue: null,
            };
            SeaOttersSvc.DeleteAddUOMPart(param).then(function (data) {
                SeaOttersSvc.ShowLoadingWheel(false);
                if (data.data.Status == true) {
                    SeaOttersSvc.ShowAlert(4, 3, [{ key: '[Data]', value: 'Additional UOM' }]);
                    SeaOttersSvc.GetAdditionalUOMListByPartID($scope.partID, true).then(function (data) {
                        $scope.savedAdditionalPartMap = data.data.Results;
                    });
                } else {
                    SeaOttersSvc.ShowAlert(data.MessageId, 0, {});
                }
            });
        }
        else {
            SeaOttersSvc.ShowLoadingWheel(false);
            SeaOttersSvc.ShowAlert(17, 1, [{ key: '[action]', value: 'delete' }]);
        }
    }

    var UnSavedAddUOM = function ($scope, $modalInstance, pageConfig, unsavedAdditionalPartMap, partID) {
        $scope.pageConfig = pageConfig;
        $scope.unsavedAdditionalPartMap = unsavedAdditionalPartMap;
        $scope.PartID = partID;

        $scope.LabelName = function (fieldName, tableName) {
            if ($scope.pageConfig) {
                var language = $scope.pageConfig.filter(function (obj) {
                    if (obj.TableFieldName === fieldName && obj.TableName === tableName)
                        return obj;
                })[0];

                if ($rootScope.UserDetail && $rootScope.UserDetail.Language.toLowerCase() == 'Chinese'.toLowerCase()) {
                    return language.CustomFieldNameForChinese;
                }
                return language.CustomFieldNameForEnglish;
            }
        };

        $scope.selectedUnUOMID = [];
        $scope.selectedUnUOMValue = [];
        $scope.SaveUnAddUOM = function () {
            //debugger;
            $('input:checkbox[name=chkUnAddUOMPartID]').each(function () {
                if ($(this).is(':checked')) {
                    var chkID = $(this).val();
                    $scope.selectedUnUOMID.push(chkID);
                    $scope.selectedUnUOMValue.push($('#txtUNUOMValue' + chkID).val());
                }
            });
            //debugger;
            if ($scope.selectedUnUOMID.length != 0 && $scope.selectedUnUOMValue.length != 0) {
                var param = {
                    PartID: $scope.PartID,
                    selectedUnUOMID: $scope.selectedUnUOMID,
                    selectedUnUOMValue: $scope.selectedUnUOMValue,
                };
                SeaOttersSvc.InsertPartAddUOM(param).then(function (data) {
                    SeaOttersSvc.ShowLoadingWheel(false);
                    if (data.data.Status == true) {
                        SeaOttersSvc.ShowAlert(4, 3, [{ key: '[Data]', value: 'Additional UOM' }]);

                        SeaOttersSvc.GetAdditionalUOMListByPartID($scope.PartID, true).then(function (data) {
                            $scope.savedAdditionalPartMap = data.data.Results;
                            $modalInstance.close($scope.savedAdditionalPartMap);
                        });
                    } else {
                        SeaOttersSvc.ShowLoadingWheel(false);
                        SeaOttersSvc.ShowAlert(data.MessageId, 0, {});
                    }
                });
            }
            else {
                SeaOttersSvc.ShowAlert(17, 1, [{ key: '[action]', value: 'add' }]);
            }
        };
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    };

    $scope.AddAdditionalUOM = function () {
        //debugger;
        SeaOttersSvc.GetAdditionalUOMListByPartID($scope.partID, false).then(function (data) {
            if (data.data.Results != null) {
                $scope.unsavedAdditionalPartMap = data.data.Results;
                //debugger;
                var modalInstance = SeaOttersSvc.ShowPartAddUOM($scope.pageConfig, UnSavedAddUOM, $scope.unsavedAdditionalPartMap, $scope.partID);
                modalInstance.result.then(function (savedAdditionalPartMap) {
                    $scope.savedAdditionalPartMap = savedAdditionalPartMap;
                });
            }
        });
    };

    var UnAlternatePart = function ($scope, $modalInstance, pageConfig, unalternatePart, partID) {
        $scope.pageConfig = pageConfig;
        $scope.unalternatePart = unalternatePart;
        $scope.PartID = partID;

        $scope.LabelName = function (fieldName, tableName) {
            if ($scope.pageConfig) {
                var language = $scope.pageConfig.filter(function (obj) {
                    if (obj.TableFieldName === fieldName && obj.TableName === tableName)
                        return obj;
                })[0];

                if ($rootScope.UserDetail && $rootScope.UserDetail.Language.toLowerCase() == 'Chinese'.toLowerCase()) {
                    return language.CustomFieldNameForChinese;
                }
                return language.CustomFieldNameForEnglish;
            }
        };

        $scope.FilterUnAlternatePart = function () {
            var txtfilterUnAlternatePart = $('#txtfilterUnAlternatePart').val();
            SeaOttersSvc.GetAllAlternatePart($scope.PartID, false, txtfilterUnAlternatePart).then(function (data) {
                if (data.data.Results != null) {
                    $scope.unalternatePart = data.data.Results;
                }
                else {
                    $scope.unalternatePart = [];
                }
            });
        }

        $scope.selectedUnALtPartID = [];
        $scope.SaveUnAlternatePart = function () {
            //debugger;
            $scope.selectedUnALtPartID = [];
            $('input:checkbox[name=chkAltPartAdd]').each(function () {
                if ($(this).is(':checked')) {
                    var chkID = $(this).val();
                    $scope.selectedUnALtPartID.push(chkID);
                }
            });
            //debugger;
            if ($scope.selectedUnALtPartID.length != 0) {
                var param = {
                    PartID: $scope.PartID,
                    selectedUnAltPartID: $scope.selectedUnALtPartID
                }
                SeaOttersSvc.InsertPartAddAlternatePart(param).then(function (data) {
                    SeaOttersSvc.ShowLoadingWheel(false);
                    if (data.data.Status == true) {
                        SeaOttersSvc.ShowAlert(4, 3, [{ key: '[Data]', value: 'Alternate Part' }]);

                        SeaOttersSvc.GetAllAlternatePart($scope.PartID, true, null).then(function (data) {
                            $scope.savedAlternateParts = data.data.Results;
                            $modalInstance.close($scope.savedAlternateParts);
                        });
                    } else {
                        SeaOttersSvc.ShowLoadingWheel(false);
                        SeaOttersSvc.ShowAlert(data.MessageId, 0, {});
                    }
                });
            }
            else {
                SeaOttersSvc.ShowAlert(17, 1, [{ key: '[action]', value: 'add' }]);
            }
        };
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    };
    $scope.AddAlternatePart = function () {
        //debugger;
        SeaOttersSvc.GetAllAlternatePart($scope.partID, false, null).then(function (data) {
            if (data.data.Results != null) {
                $scope.unalternatePart = data.data.Results;
                //debugger;
                var modalInstance = SeaOttersSvc.ShowPartAddAlternatePart($scope.pageConfig, UnAlternatePart, $scope.unalternatePart, $scope.partID);
                modalInstance.result.then(function (savedAlternateParts) {
                    $scope.savedAlternateParts = savedAlternateParts;
                });
            }
        });
    };

    $scope.selectedDeletedAlternateID = [];
    $scope.DeleteAlternatePart = function () {
        $scope.selectedDeletedAlternateID = [];
        SeaOttersSvc.ShowLoadingWheel(true);
        $('input:checkbox[name=chkDeleteAlternarePart]').each(function () {
            if ($(this).is(':checked')) {
                var chkID = $(this).val();
                $scope.selectedDeletedAlternateID.push(chkID);
            }
        });
        //debugger;
        if ($scope.selectedDeletedAlternateID.length != 0) {
            SeaOttersSvc.DeleteAlternatePart($scope.selectedDeletedAlternateID).then(function (data) {
                SeaOttersSvc.ShowLoadingWheel(false);
                if (data.data.Status == true) {
                    SeaOttersSvc.ShowAlert(4, 3, [{ key: '[Data]', value: 'Alternate Part' }]);
                    SeaOttersSvc.GetAllAlternatePart($scope.partID, true, $scope.filterSavedAlternatePart).then(function (data) {
                        $scope.savedAlternateParts = data.data.Results;
                    });
                } else {
                    SeaOttersSvc.ShowAlert(data.MessageId, 0, {});
                }
            });
        }
        else {
            SeaOttersSvc.ShowLoadingWheel(false);
            SeaOttersSvc.ShowAlert(17, 1, [{ key: '[action]', value: 'delete' }]);
        }
    }
})
.controller('statusGroupCtrl', function ($state, $scope, $http, SeaOttersSvc, $modal, $rootScope) {

    if (!SeaOttersSvc.IsValidUser()) {
        $state.go('login');
        return;
    }

    SeaOttersSvc.UserRolePermission('statusGroup').then(function (data) {
        $scope.userRolePermission = data.data.Results;
        if ($scope.userRolePermission[0].Access == 0) {
            SeaOttersSvc.ShowAlert(-1, 0, {});
        }
    });

    var paginationOptions = {
        pageNumber: 1,
        pageSize: 20,
        sort: null
    };

    $scope.ugStatusGroup = {
        enableFullRowSelection: true,
        enableFiltering: true,
        useExternalPagination: true,
        multiSelect: false,
        enableRowHeaderSelection: true,
        paginationPageSizes: [10, 20, 30, 40, 50, 100, 500],
        paginationPageSize: 20,
        columnDefs: [
        { name: 'ID', displayName: 'ID', visible: false, enableHiding: false },
        { name: 'GroupName', displayName: 'GroupName', width: 430 },
        { name: 'StatusName', displayName: 'StatusNameName', width: 430 },
        { name: 'InsertedByName', displayName: 'Inserted By', width: 200 },
        { name: 'InsertedAt', cellFilter: 'date:\'yyyy-MM-dd\'', width: 200 },
        { name: 'UpdatedByName', displayName: 'Updated By', width: 200 },
        { name: 'UpdatedAt', cellFilter: 'date:\'yyyy-MM-dd\'', width: 200 },
        ],
        enableGridMenu: true,
        exporterCsvFilename: 'StatusGroup.csv',
        exporterPdfDefaultStyle: { fontSize: 9 },
        exporterPdfTableStyle: { margin: [30, 30, 30, 30] },
        exporterPdfTableHeaderStyle: { fontSize: 10, bold: true, italics: true, color: '#2A3F54' },
        exporterPdfHeader: { text: "StatusGroup Details", style: 'headerStyle' },
        exporterPdfFooter: function (currentPage, pageCount) {
            return { text: currentPage.toString() + ' of ' + pageCount.toString(), style: 'footerStyle' };
        },
        exporterPdfCustomFormatter: function (docDefinition) {
            docDefinition.styles.headerStyle = { fontSize: 22, bold: true };
            docDefinition.styles.footerStyle = { fontSize: 10, bold: true };
            return docDefinition;
        },
        exporterPdfOrientation: 'landscape',
        exporterPdfPageSize: 'A4',
        exporterPdfMaxGridWidth: 500,
        exporterCsvLinkElement: angular.element(document.querySelectorAll(".custom-csv-link-location")),
    };

    SeaOttersSvc.GetPageDetailsByPageName('StatusGroup').then(function (data) {
        $scope.pageConfig = data.data.Results;
        $scope.ugStatusGroup.columnDefs = [
                { name: 'ID', displayName: 'ID', visible: false, enableHiding: false },
                { name: 'GroupName', displayName: $scope.LabelName('GroupName', 'StatusGroup'), width: 430 },
                { name: 'StatusName', displayName: $scope.LabelName('StatusName', 'StatusGroup'), width: 430 },
                { name: 'InsertedByName', displayName: $scope.LabelName('InsertedBy', 'StatusGroup'), width: 200 },
                { name: 'InsertedAt', displayName: $scope.LabelName('InsertedAt', 'StatusGroup'), cellFilter: 'date:\'yyyy-MM-dd\'', width: 200 },
                { name: 'UpdatedByName', displayName: $scope.LabelName('UpdatedBy', 'StatusGroup'), width: 200 },
                { name: 'UpdatedAt', displayName: $scope.LabelName('UpdatedAt', 'StatusGroup'), cellFilter: 'date:\'yyyy-MM-dd\'', width: 200 },
        ];
        LoadData();
    });

    $scope.LabelName = function (fieldName, tableName) {
        if ($scope.pageConfig) {
            var language = $scope.pageConfig.filter(function (obj) {
                if (obj.TableFieldName === fieldName && obj.TableName === tableName)
                    return obj;
            })[0];

            if ($rootScope.UserDetail && $rootScope.UserDetail.Language.toLowerCase() == 'Chinese'.toLowerCase()) {
                return language.CustomFieldNameForChinese;
            }
            return language.CustomFieldNameForEnglish;
        }
    };

    $scope.divForm = false;

    $scope.filterStatusGroupValue = '';

    function LoadData() {
        SeaOttersSvc.GetStatusGroupListByUserID(paginationOptions.pageNumber, paginationOptions.pageSize, $scope.filterStatusGroupValue).then(function (data) {
            $scope.ugStatusGroup.totalItems = data.data.Results.TotalRecords;
            $scope.ugStatusGroup.data = data.data.Results.Data;
        });
    };

    $scope.filterStatusGroup = function () {
        paginationOptions.pageNumber = 1;
        paginationOptions.pageSize = 20;
        LoadData();
    };

    $scope.ugStatusGroup.onRegisterApi = function (gridApi) {
        $scope.StatusGroupGridAPI = gridApi;
        gridApi.pagination.on.paginationChanged($scope, function (pageNumber, pageSize) {
            paginationOptions.pageNumber = pageNumber;
            paginationOptions.pageSize = pageSize;
            LoadData();
        });
    };

    $scope.AddStatusGroup = function () {
        $scope.statusGroup = {
            ID: 0, StatusName: null, GroupName: null, IsActive: true,
        };
        $scope.divForm = true;
    };

    $scope.EditStatusGroup = function () {
        var selectedStatusGroup = $scope.StatusGroupGridAPI.selection.getSelectedRows();
        if (selectedStatusGroup.length > 0) {
            var ID = selectedStatusGroup[0].ID;
            SeaOttersSvc.GetStatusGroupDetailsByID(ID).then(function (data) {
                $scope.statusGroup = data.data.Results;
            });
            $scope.divForm = true;
        }
        else {
            SeaOttersSvc.ShowAlert(17, 1, [{ key: '[action]', value: 'edit' }]);
        }
        $scope.StatusGroupGridAPI.selection.clearSelectedRows();
    };

    $scope.DeleteStatusGroup = function () {
        var selectedStatusGroup = $scope.StatusGroupGridAPI.selection.getSelectedRows();
        if (selectedStatusGroup.length > 0) {
            var ID = selectedStatusGroup[0].ID;
            SeaOttersSvc.DeleteStatusGroup(ID).then(function (data) {
                if (data.data.Status == true) {
                    SeaOttersSvc.ShowAlert(data.data.MessageId, 3, [{ key: '[Data]', value: 'Status Group' }]);
                    LoadData();
                }
                else {
                    SeaOttersSvc.ShowAlert(data.data.MessageId, 0, {});
                }
            });
        }
        else {
            SeaOttersSvc.ShowAlert(17, 1, [{ key: '[action]', value: 'delete' }]);
        }
        $scope.StatusGroupGridAPI.selection.clearSelectedRows();
    };

    $scope.SaveStatusGroup = function () {
        SeaOttersSvc.SaveStatusGroup($scope.statusGroup).then(function (data) {
            if (data.data.Status == true) {
                SeaOttersSvc.ShowAlert(data.data.MessageId, 3, [{ key: '[Data]', value: 'Status Group' }]);
                LoadData();
                $scope.divForm = false;
            }
            else {
                SeaOttersSvc.ShowAlert(data.data.MessageId, 0, {});
            }
        });
    };
})
.controller('bompartCtrl', function ($state, $scope, SeaOttersSvc, $rootScope) {

    if (!SeaOttersSvc.IsValidUser()) {
        $state.go('login');
        return;
    }

    SeaOttersSvc.UserRolePermission('BOM Part').then(function (data) {
        $scope.userRolePermission = data.data.Results;
        if ($scope.userRolePermission[0].Access == 0) {
            SeaOttersSvc.ShowAlert(-1, 0, {});
        }
    });

    $scope.divForm = false;
    $scope.CurrentTabTitle = '';

    var paginationOptions = {
        pageNumber: 1,
        pageSize: 20,
        sort: null
    };

    $scope.ugBOMParts = {
        enableFullRowSelection: true,
        enableFiltering: true,
        useExternalPagination: true,
        multiSelect: false,
        enableRowHeaderSelection: true,
        paginationPageSizes: [10, 20, 30, 40, 50, 100, 500],
        paginationPageSize: 20,
        columnDefs: [
         { name: 'PartID', displayName: 'ID', visible: false, enableHiding: false },
         { name: 'PartNumber', displayName: 'PartNumber', width: 200 },
         { name: 'PartDescription', displayName: 'PartDescription', width: 200 },
         { name: 'PartFamilyName', displayName: 'PartFamily', width: 150 },
         { name: 'PartTypeName', width: 150, displayName: 'PartType' },
         { name: 'UOMName', displayName: 'UOM', width: 150 },
         { name: 'StandardPrice', width: 150, displayName: 'StandardPrice' },
         { name: 'SellingPrice', width: 150, displayName: 'SellingPrice' },
         { name: 'TotalBOMParts', width: 150, displayName: 'TotalBOMParts' },
        ],
        enableGridMenu: true,
        exporterCsvFilename: 'BOMPart.csv',
        exporterPdfDefaultStyle: { fontSize: 9 },
        exporterPdfTableStyle: { margin: [30, 30, 30, 30] },
        exporterPdfTableHeaderStyle: { fontSize: 10, bold: true, italics: true, color: '#2A3F54' },
        exporterPdfHeader: { text: "Part Details", style: 'headerStyle' },
        exporterPdfFooter: function (currentPage, pageCount) {
            return { text: currentPage.toString() + ' of ' + pageCount.toString(), style: 'footerStyle' };
        },
        exporterPdfCustomFormatter: function (docDefinition) {
            docDefinition.styles.headerStyle = { fontSize: 22, bold: true };
            docDefinition.styles.footerStyle = { fontSize: 10, bold: true };
            return docDefinition;
        },
        exporterPdfOrientation: 'landscape',
        exporterPdfPageSize: 'A4',
        exporterPdfMaxGridWidth: 500,
        exporterCsvLinkElement: angular.element(document.querySelectorAll(".custom-csv-link-location")),
    };

    SeaOttersSvc.GetPageDetailsByPageName('BOM Part,PartMaster').then(function (data) {
        $scope.pageConfig = data.data.Results;
        $scope.ugBOMParts.columnDefs = [
           { name: 'PartID', displayName: 'ID', visible: false, enableHiding: false },
           { name: 'PartNumber', displayName: $scope.LabelName('PartNumber', 'PartMaster'), width: 200 },
           { name: 'PartDescription', displayName: $scope.LabelName('PartDescription', 'PartMaster'), width: 200 },
           { name: 'PartFamilyName', displayName: $scope.LabelName('PartFamily', 'PartMaster'), width: 200 },
           { name: 'PartTypeName', width: 200, displayName: $scope.LabelName('PartType', 'PartMaster') },
           { name: 'UOMName', displayName: $scope.LabelName('UOM', 'PartMaster'), width: 200 },
           { name: 'StandardPrice', width: 200, displayName: $scope.LabelName('StandardPrice', 'PartMaster') },
           { name: 'SellingPrice', width: 200, displayName: $scope.LabelName('SellingPrice', 'PartMaster') },
           { name: 'TotalBOMParts', width: 200, displayName: $scope.LabelName('TotalBOMParts', 'BOM Part') },
        ];
        LoadData();
    });

    $scope.LabelName = function (fieldName, tableName) {
        if ($scope.pageConfig) {
            var language = $scope.pageConfig.filter(function (obj) {
                if (obj.TableFieldName === fieldName && obj.TableName === tableName)
                    return obj;
            })[0];

            if ($rootScope.UserDetail && $rootScope.UserDetail.Language.toLowerCase() == 'Chinese'.toLowerCase()) {
                return language.CustomFieldNameForChinese;
            }
            return language.CustomFieldNameForEnglish;
        }
    };

    $scope.divForm = false;

    $scope.filterPartMasterValue = '';

    function LoadData() {
        SeaOttersSvc.GetAllSavedBOMedParts().then(function (data) {
            //$scope.ugPartMaster.totalItems = data.data.Results.TotalRecords;
            $scope.ugBOMParts.data = data.data.Results.Data;
        });
    };
    $scope.filterSavedBOMPart = '';
    $scope.filterUnSavedBOMPart = '';
    function LoadPartDataByID(partID) {
        SeaOttersSvc.GetPartMasterDetailsByID(partID).then(function (data) {
            //debugger;
            $scope.PartNumber = data.data.Results.PartNumber;
            $scope.PartFamilyName = data.data.Results.PartFamily.PartFamilyName;
            $scope.PartTypeName = data.data.Results.PartType.Type;
            $scope.UOMName = data.data.Results.UOM.Name;
            $scope.StandardPrice = data.data.Results.StandardPrice;
            $scope.CurrentTab('Part');
            SeaOttersSvc.GetAllSavedBOMedPartsByPartID(partID, $scope.filterSavedBOMPart).then(function (data) {
                if (data.data.Results != null) {
                    $scope.savedbomParts = data.data.Results.Data;
                }
                else {
                    $scope.savedbomParts = [];
                }
            });
            SeaOttersSvc.GetAllSavedBOMedProcessByPartID(partID).then(function (data) {
                //debugger;
                $scope.savedbomProcesses = [];
                if (data.data.Results != null) {
                    var processParam = data.data.Results.Data;
                    processParam.forEach(function (item) {
                        var param =
                            {
                                BPID: item.BPID,
                                ProcessName: item.ProcessName,
                                Quantity: item.Quantity,
                                Price: item.Price,
                                selectedUOM: { ID: item.UOMID, Name: item.UOMName },
                            };
                        $scope.savedbomProcesses.push(param);
                    });
                }
            });
        });
    };
    $scope.FilterSavedBOMPart = function () {
        SeaOttersSvc.GetAllSavedBOMedPartsByPartID($scope.partID, $scope.filterSavedBOMPart).then(function (data) {
            if (data.data.Results != null) {
                $scope.savedbomParts = data.data.Results.Data;
            }
            else {
                $scope.savedbomParts = [];
            }
        });
    }
    $scope.FilterBOMPart = function () {
        paginationOptions.pageNumber = 1;
        paginationOptions.pageSize = 20;
        LoadData();
    };

    $scope.ugBOMParts.onRegisterApi = function (gridApi) {
        $scope.bomPartGridAPI = gridApi;
        gridApi.pagination.on.paginationChanged($scope, function (pageNumber, pageSize) {
            paginationOptions.pageNumber = pageNumber;
            paginationOptions.pageSize = pageSize;
            LoadData();
        });
    };

    $scope.AddBOMPart = function () {
        $scope.childRecord = true;
        SeaOttersSvc.GetAllBOMedParts(0).then(function (data) {
            if (data.data.Results != null) {
                $scope.bompartsCombo = data.data.Results.Data;
                $scope.SelectedPart = { PartID: null, PartNumber: null };
                SeaOttersSvc.GetAllUnBOMedParts(0, null).then(function (data) {
                    $scope.unsavedbomParts = data.data.Results.Data;
                    var modalInstance = SeaOttersSvc.ShowPartBOMPart($scope.pageConfig, UnSavedBOMPartsCtrl, $scope.unsavedbomParts, 0, $scope.bompartsCombo,
                        $scope.SelectedPart, $scope.childRecord);
                    modalInstance.result.then(function (SavedMainBOMParts) {
                        $scope.ugBOMParts.data = SavedMainBOMParts;
                    });
                });
            }
            else {
                SeaOttersSvc.ShowLoadingWheel(false);
                //alert("No BOM Part is pending to Add. Please edit one of the saved part");
                SeaOttersSvc.ShowAlert(20, 0, {});
            }
        });
    };

    $scope.EditBOMPart = function () {
        $scope.filterSavedBOMPart = '';
        var selectedBP = $scope.bomPartGridAPI.selection.getSelectedRows();
        if (selectedBP.length > 0) {
            var ID = selectedBP[0].PartID;
            $scope.partID = ID;
            LoadUOMMaster();
            LoadPartDataByID($scope.partID);
            $scope.divForm = true;
        }
        else {
            SeaOttersSvc.ShowLoadingWheel(false);
            SeaOttersSvc.ShowAlert(17, 1, [{ key: '[action]', value: 'edit' }]);
        }
        $scope.bomPartGridAPI.selection.clearSelectedRows();
    };

    $scope.selectedDeletedPartID = [];
    $scope.DeletePartBOMPart = function () {
        $scope.selectedDeletedPartID = [];
        SeaOttersSvc.ShowLoadingWheel(true);
        $('input:checkbox[name=chkDeleteBOMPartAdd]').each(function () {
            if ($(this).is(':checked')) {
                var chkID = $(this).val();
                $scope.selectedDeletedPartID.push(chkID);
            }
        });

        if ($scope.selectedDeletedPartID.length != 0) {
            var param = {
                CurrentPartID: $scope.partID,
                selectedUnPartID: $scope.selectedDeletedPartID,
                selectedUnPartQty: null,
            };
            SeaOttersSvc.DeleteBOMPart(param).then(function (data) {
                SeaOttersSvc.ShowLoadingWheel(false);
                if (data.data.Status == true) {
                    SeaOttersSvc.ShowAlert(4, 3, [{ key: '[Data]', value: 'BOM Part' }]);
                    //LoadData();
                    //$scope.divForm = false;
                    LoadPartDataByID($scope.partID);
                } else {
                    SeaOttersSvc.ShowAlert(data.MessageId, 0, {});
                }
            });
        }
        else {
            SeaOttersSvc.ShowLoadingWheel(false);
            SeaOttersSvc.ShowAlert(17, 1, [{ key: '[action]', value: 'delete' }]);
        }
    }

    $scope.SaveBOMPart = function () {
        SeaOttersSvc.ShowLoadingWheel(true);
        if ($scope.CurrentTabTitle == 'Part') {
            $scope.AverageQtyChanged = [];
            $scope.savedbomParts.forEach(function (item) {
                $scope.AverageQtyChanged.push(item);
            });
            var param = {
                Changed: $scope.AverageQtyChanged,
            };
            SeaOttersSvc.UpdateBOMPart(param).then(function (data) {
                SeaOttersSvc.ShowLoadingWheel(false);
                if (data.data.Status == true) {
                    SeaOttersSvc.ShowAlert(4, 3, [{ key: '[Data]', value: 'BOM Part' }]);
                    LoadPartDataByID($scope.partID);
                } else {
                    SeaOttersSvc.ShowLoadingWheel(false);
                    SeaOttersSvc.ShowAlert(data.MessageId, 0, {});
                }
            });
        }
        else {
            $scope.selectedProcessParts = [];
            //debugger;
            $('input:checkbox[name=chkDeleteBOMProcessAdd]').each(function () {
                if ($(this).is(':checked')) {
                    //debugger;
                    var chkID = $(this).val();
                    var param = {
                        BPKID: chkID,
                        UOMID: $('#cmbUOM' + chkID).val(),
                        Price: $('#txtPrice' + chkID).val(),
                        Quantity: $('#txtQty' + chkID).val(),
                    }
                    $scope.selectedProcessParts.push(param);
                }
            });
            //debugger;
            if ($scope.selectedProcessParts.length != 0) {
                SeaOttersSvc.UpdateBOMProcess($scope.selectedProcessParts).then(function (data) {
                    SeaOttersSvc.ShowLoadingWheel(false);
                    if (data.data.Status == true) {
                        SeaOttersSvc.ShowAlert(4, 3, [{ key: '[Data]', value: 'BOM Process' }]);
                        LoadPartDataByID($scope.partID);
                    } else {
                        SeaOttersSvc.ShowLoadingWheel(false);
                        SeaOttersSvc.ShowAlert(data.MessageId, 0, {});
                    }
                });
            }
            else {
                SeaOttersSvc.ShowLoadingWheel(false);
                SeaOttersSvc.ShowAlert(17, 1, [{ key: '[action]', value: 'delete' }]);
            }
        }
    };

    $scope.CurrentTab = function (cuTab) {
        //alert(cuTab);
        $scope.CurrentTabTitle = cuTab;
    };

    var UnSavedBOMPartsCtrl = function ($scope, $modalInstance, pageConfig, unsavedbomParts, partID, bompartsCombo, SelectedPart, childRecord) {
        $scope.pageConfig = pageConfig;
        $scope.unsavedbomParts = unsavedbomParts;
        $scope.partID = partID;
        $scope.bompartsCombo = bompartsCombo;
        $scope.SelectedPart = SelectedPart;
        $scope.childRecord = childRecord;

        $scope.LabelName = function (fieldName, tableName) {
            if ($scope.pageConfig) {
                var language = $scope.pageConfig.filter(function (obj) {
                    if (obj.TableFieldName === fieldName && obj.TableName === tableName)
                        return obj;
                })[0];

                if ($rootScope.UserDetail && $rootScope.UserDetail.Language.toLowerCase() == 'Chinese'.toLowerCase()) {
                    return language.CustomFieldNameForChinese;
                }
                return language.CustomFieldNameForEnglish;
            }
        };

        $scope.FilterUnSavedBOMPart = function () {
            var txtfilterUnSavedBOMPart = $('#txtfilterUnSavedBOMPart').val();
            SeaOttersSvc.GetAllUnBOMedParts($scope.partID, txtfilterUnSavedBOMPart).then(function (data) {
                if (data.data.Results != null) {
                    $scope.unsavedbomParts = data.data.Results.Data;
                }
                else {
                    $scope.unsavedbomParts = [];
                }
            });
        }

        $scope.selectedUnPartID = [];
        $scope.selectedUnPartQty = [];
        $scope.SaveUnBOMPart = function () {
            $('input:checkbox[name=chkBOMPartAdd]').each(function () {
                if ($(this).is(':checked')) {
                    var chkID = $(this).val();
                    $scope.selectedUnPartID.push(chkID);
                    $scope.selectedUnPartQty.push($('#txtUNBOMPrice' + chkID).val());
                }
            });
            if ($scope.selectedUnPartID.length != 0 && $scope.selectedUnPartQty.length != 0 && $('#cmbBOMPart').val() != 0) {
                var param = {
                    CurrentPartID: $('#cmbBOMPart').val(),
                    selectedUnPartID: $scope.selectedUnPartID,
                    selectedUnPartQty: $scope.selectedUnPartQty,
                };
                SeaOttersSvc.InsertBOMPart(param).then(function (data) {
                    SeaOttersSvc.ShowLoadingWheel(false);
                    if (data.data.Status == true) {
                        SeaOttersSvc.ShowAlert(4, 3, [{ key: '[Data]', value: 'BOM Part' }]);
                        if (!$scope.childRecord) {
                            SeaOttersSvc.GetAllSavedBOMedPartsByPartID($('#cmbBOMPart').val()).then(function (data) {
                                $scope.savedbomParts = data.data.Results.Data;
                                $modalInstance.close($scope.savedbomParts);
                            });
                        }
                        else {
                            SeaOttersSvc.ShowLoadingWheel(false);
                            SeaOttersSvc.GetAllSavedBOMedParts().then(function (data) {
                                //$scope.ugPartMaster.totalItems = data.data.Results.TotalRecords;
                                $scope.SavedMainBOMParts = data.data.Results.Data;
                                $modalInstance.close($scope.SavedMainBOMParts);
                            });
                        }
                    } else {
                        SeaOttersSvc.ShowLoadingWheel(false);
                        SeaOttersSvc.ShowAlert(data.MessageId, 0, {});
                    }
                });
            }
            else {
                SeaOttersSvc.ShowAlert(17, 1, [{ key: '[action]', value: 'add' }]);
            }
        };
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    };

    $scope.AddPartBOMPart = function () {
        //debugger;
        $scope.childRecord = false;
        SeaOttersSvc.GetAllBOMedParts(1).then(function (data) {
            $scope.bompartsCombo = data.data.Results.Data;
            $scope.SelectedPart = { PartID: $scope.partID, PartNumber: $scope.PartNumber };
            SeaOttersSvc.GetAllUnBOMedParts($scope.partID, null).then(function (data) {
                if (data.data.Results != null) {
                    $scope.unsavedbomParts = data.data.Results.Data;
                    var modalInstance = SeaOttersSvc.ShowPartBOMPart($scope.pageConfig, UnSavedBOMPartsCtrl, $scope.unsavedbomParts, $scope.partID, $scope.bompartsCombo,
                        $scope.SelectedPart, $scope.childRecord);
                    modalInstance.result.then(function (savedbomParts) {
                        LoadPartDataByID($scope.partID);
                    });
                }
                else {
                    SeaOttersSvc.ShowLoadingWheel(false);
                    //alert("No BOM Part is pending to Add. Please edit one of the saved part");
                    SeaOttersSvc.ShowAlert(20, 0, {});
                }
            });

        });
    };

    function LoadUOMMaster() {
        SeaOttersSvc.GetUOMListByUserID().then(function (data) {
            $scope.UOMList = data.data.Results;
        });
    }

    $scope.AddProcessBOMPart = function () {
        SeaOttersSvc.GetAllUnBOMedProcess($scope.partID).then(function (data) {
            $scope.unsavedbomProcesses = data.data.Results.Data;
            var modalInstance = SeaOttersSvc.ShowPartBOMProcess($scope.pageConfig, UnSavedBOMProcessCtrl, $scope.unsavedbomProcesses, $scope.partID, $scope.PartNumber, $scope.UOMList);
            modalInstance.result.then(function (savedbomProcess) {
                //$scope.savedbomProcesses = savedbomProcess;
                LoadPartDataByID($scope.partID);
            });
        });
    };

    var UnSavedBOMProcessCtrl = function ($scope, $modalInstance, pageConfig, unsavedbomProcesses, partID, PartNumber, UOMList) {
        $scope.pageConfig = pageConfig;
        $scope.unsavedbomProcesses = unsavedbomProcesses;
        $scope.partID = partID;
        $scope.PartNumber = PartNumber;
        $scope.UOMList = UOMList;

        $scope.LabelName = function (fieldName, tableName) {
            if ($scope.pageConfig) {
                var language = $scope.pageConfig.filter(function (obj) {
                    if (obj.TableFieldName === fieldName && obj.TableName === tableName)
                        return obj;
                })[0];

                if ($rootScope.UserDetail && $rootScope.UserDetail.Language.toLowerCase() == 'Chinese'.toLowerCase()) {
                    return language.CustomFieldNameForChinese;
                }
                return language.CustomFieldNameForEnglish;
            }
        };

        $scope.selectedUnPartProcess = []
        $scope.SaveUnBOMProcess = function () {
            $('input:checkbox[name=chkDeleteBOMProcessAdd]').each(function () {
                if ($(this).is(':checked')) {
                    var chkID = $(this).val();
                    var param =
                        {
                            PartID: $scope.partID,
                            ProcessID: chkID,
                            UOMID: $('#cmbUPUOM' + chkID).val(),
                            Price: $('#txtUPPrice' + chkID).val(),
                            Quantity: $('#txtUPQty' + chkID).val(),
                        };
                    $scope.selectedUnPartProcess.push(param);
                }
            });
            if ($scope.selectedUnPartProcess.length != 0) {
                SeaOttersSvc.InsertBOMProcess($scope.selectedUnPartProcess).then(function (data) {
                    SeaOttersSvc.ShowLoadingWheel(false);
                    if (data.data.Status == true) {
                        SeaOttersSvc.ShowAlert(4, 3, [{ key: '[Data]', value: 'BOM Process' }]);
                        SeaOttersSvc.GetAllSavedBOMedProcessByPartID($scope.partID).then(function (data) {
                            $scope.savedbomProcess = data.data.Results.Data;
                            $modalInstance.close($scope.savedbomProcess);
                        });
                    } else {
                        SeaOttersSvc.ShowAlert(data.MessageId, 0, {});
                    }
                });
            }
            else {
                SeaOttersSvc.ShowLoadingWheel(false);
                alert("No Process selected");
            }
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    };

    $scope.deleteSelectedPartProcessID = [];
    $scope.DeletePartBOMProcess = function () {
        //debugger;
        $scope.deleteSelectedPartProcessID = [];
        $('input:checkbox[name=chkDeleteBOMProcessAdd]').each(function () {
            if ($(this).is(':checked')) {
                //debugger;
                var chkID = $(this).val();
                $scope.deleteSelectedPartProcessID.push(chkID);
            }
        });
        //debugger;
        if ($scope.deleteSelectedPartProcessID.length != 0) {
            SeaOttersSvc.DeleteBOMProcess($scope.deleteSelectedPartProcessID).then(function (data) {
                //debugger;
                SeaOttersSvc.ShowLoadingWheel(false);
                if (data.data.Status == true) {
                    SeaOttersSvc.ShowAlert(4, 3, [{ key: '[Data]', value: 'BOM Process' }]);
                    LoadPartDataByID($scope.partID);
                } else {
                    SeaOttersSvc.ShowLoadingWheel(false);
                    SeaOttersSvc.ShowAlert(data.MessageId, 0, {});
                }
            });
        }
        else {
            SeaOttersSvc.ShowLoadingWheel(false);
            SeaOttersSvc.ShowAlert(17, 1, [{ key: '[action]', value: 'delete' }]);
        }
    }

    $scope.checkValidation = function () {
        $('.numbersOnly').keyup(function () {
            if (this.value != this.value.replace(/[^0-9\.]/g, '')) {
                this.value = this.value.replace(/[^0-9\.]/g, '');
            }
        });
    };

})
.controller('quoteCtrl', function ($state, $scope, $http, $modal, SeaOttersSvc, $rootScope) {

    if (!SeaOttersSvc.IsValidUser()) {
        $state.go('login');
        return;
    }

    SeaOttersSvc.UserRolePermission('Quote').then(function (data) {
        $scope.userRolePermission = data.data.Results;
        if ($scope.userRolePermission[0].Access == 0) {
            SeaOttersSvc.ShowAlert(-1, 0, {});
        }
    });

    $('#divQuoteDate').datetimepicker({ format: "YYYY-MM-DD" });
    $('#divInquiryDate').datetimepicker({ format: "YYYY-MM-DD" });
    $('#divRequestedDelvDate').datetimepicker({ format: "YYYY-MM-DD" });

    $scope.approvalQuoteLineIDs = '';
    $scope.MainQuoteID = 0;
    $scope.MainQuoteStatusID = 0;
    $scope.quoteApprovalAction = false;
    $scope.quoteApprovalButton = false;
    $scope.gridMultiSelection = false;

    var paginationOptions = {
        pageNumber: 1,
        pageSize: 20,
        sort: null
    };

    $scope.ugQuote = {
        enableFullRowSelection: true,
        enableFiltering: true,
        useExternalPagination: true,
        multiSelect: false,
        enableRowHeaderSelection: true,
        paginationPageSizes: [10, 20, 30, 40, 50, 100, 500],
        paginationPageSize: 20,
        enableGridMenu: true,
        columnDefs: [
            { name: 'QuoteID', displayName: 'ID', visible: false, enableHiding: false },
            { name: 'QuoteNumber', displayName: 'QuoteNumber', width: 200 },
            { name: 'QuoteDate', displayName: 'QuoteDate', cellFilter: 'date:\'yyyy-MM-dd\'', width: 430 },
            { name: 'InquiryDate', displayName: 'InquiryDate', cellFilter: 'date:\'yyyy-MM-dd\'', width: 430 },
            { name: 'Customer', displayName: 'Customer', width: 430 },
            { name: 'QuoteStatus', width: 200 },
            { name: 'LeadTime', displayName: 'LeadTime', width: 430 },
            { name: 'RequestedComments', displayName: 'RequestedComments', width: 430 },
            { name: 'InsertedByName', displayName: 'Inserted By', width: 200 },
            { name: 'TotalQuoteAmount', displayName: 'Total Quote Amount', width: 200 },
            { name: 'TotalGrossAmount', displayName: 'Total Gross Amount', width: 200 },
            { name: 'InsertedAt', cellFilter: 'date:\'yyyy-MM-dd\'', width: 200 },
            { name: 'UpdatedByName', displayName: 'Updated By', width: 200 },
            { name: 'UpdatedAt', cellFilter: 'date:\'yyyy-MM-dd\'', width: 200 },
            { name: 'CurrencyCode', displayName: 'Currency', width: 200 },
            { name: 'CurrencyExchangeRate', displayName: 'Currency Exchange Rate', width: 200 },

        ],
        exporterCsvFilename: 'quote.csv',
        exporterPdfDefaultStyle: { fontSize: 9 },
        exporterPdfTableStyle: { margin: [30, 30, 30, 30] },
        exporterPdfTableHeaderStyle: { fontSize: 10, bold: true, italics: true, color: '#2A3F54' },
        exporterPdfHeader: { text: "quote Details", style: 'headerStyle' },
        exporterPdfFooter: function (currentPage, pageCount) {
            return { text: currentPage.toString() + ' of ' + pageCount.toString(), style: 'footerStyle' };
        },
        exporterPdfCustomFormatter: function (docDefinition) {
            docDefinition.styles.headerStyle = { fontSize: 22, bold: true };
            docDefinition.styles.footerStyle = { fontSize: 10, bold: true };
            return docDefinition;
        },
        exporterPdfOrientation: 'landscape',
        exporterPdfPageSize: 'A4',
        exporterPdfMaxGridWidth: 500,
        exporterCsvLinkElement: angular.element(document.querySelectorAll(".custom-csv-link-location")),
    };

    $scope.ugQuoteLine = {
        enableFullRowSelection: !$scope.gridMultiSelection,
        enableRowHeaderSelection: true,
        multiSelect: $scope.gridMultiSelection,
        paginationPageSize: 5,
    };

    SeaOttersSvc.GetPageDetailsByPageName('Quote,BOM Part,PartMaster').then(function (data) {
        $scope.pageConfig = data.data.Results;

        $scope.ugQuote.columnDefs = [
                { name: 'QuoteID', displayName: 'ID', visible: false, enableHiding: false },
                { name: 'QuoteStatusID', displayName: $scope.LabelName('QuoteStatus', 'Quote'), width: 0, visible: false, enableHiding: false },
                { name: 'QuoteNumber', displayName: $scope.LabelName('QuoteNumber', 'Quote'), width: 200 },
                { name: 'QuoteDate', displayName: $scope.LabelName('QuoteDate', 'Quote'), cellFilter: 'date:\'yyyy-MM-dd\'', width: 200 },
                { name: 'InquiryDate', displayName: $scope.LabelName('InquiryDate', 'Quote'), cellFilter: 'date:\'yyyy-MM-dd\'', width: 200 },
                { name: 'Customer', displayName: $scope.LabelName('Customer', 'Quote'), width: 200 },
                { name: 'QuoteStatus', displayName: $scope.LabelName('QuoteStatus', 'Quote'), width: 200 },
                { name: 'LeadTime', displayName: $scope.LabelName('LeadTime', 'Quote'), width: 200 },
                { name: 'RequestedComments', displayName: $scope.LabelName('RequestedComments', 'Quote'), width: 200 },
                { name: 'InsertedByName', displayName: $scope.LabelName('InsertedBy', 'Quote'), width: 200 },
                { name: 'TotalQuoteAmount', displayName: $scope.LabelName('TotalQuoteAmount', 'Quote'), width: 200 },
                { name: 'TotalGrossAmount', displayName: $scope.LabelName('TotalGrossAmount', 'Quote'), width: 200 },
                { name: 'InsertedAt', displayName: $scope.LabelName('InsertedAt', 'Quote'), cellFilter: 'date:\'yyyy-MM-dd\'', width: 200 },
                { name: 'UpdatedByName', displayName: $scope.LabelName('UpdatedBy', 'Quote'), width: 200 },
                { name: 'UpdatedAt', displayName: $scope.LabelName('UpdatedAt', 'Quote'), cellFilter: 'date:\'yyyy-MM-dd\'', width: 200 },
                { name: 'Currency.CurrencyCode', displayName: $scope.LabelName('CurrencyCode', 'Quote'), width: 200 },
                { name: 'Currency.CurrencyExchangeRate', displayName: $scope.LabelName('CurrencyExchangeRate', 'Quote'), width: 200 },
        ];

        $scope.ugQuoteLine.columnDefs = [
                //{ name: 'QuoteLineID', visible: false },
                //{ name: 'Part.PartFamily.PartFamilyName', displayName: $scope.LabelName('PartFamily', 'QuoteLine'), width: 200 },
                //{ name: 'Part.PartNumber', displayName: $scope.LabelName('PartNumber', 'QuoteLine'), width: 200 },
                //{ name: 'Part.PartDescription', displayName: $scope.LabelName('PartDescription', 'QuoteLine'), width: 200 },
                //{ name: 'CustomerPart.CustomerPartNumber', displayName: $scope.LabelName('CustomerPartName', 'QuoteLine'), width: 200 },
                //{ name: 'Quantity', displayName: $scope.LabelName('DemandQty', 'QuoteLine'), width: 200 },
                //{ name: 'Part.UOM.Name', displayName: $scope.LabelName('UOM', 'QuoteLine'), width: 200 },
                //{ name: 'ExtendedPrice', displayName: $scope.LabelName('ActualPrice', 'QuoteLine'), width: 200 },
                //{ name: 'PartCost', displayName: $scope.LabelName('PartCost', 'QuoteLine'), width: 200 },
                //{ name: 'ProcessCost', displayName: $scope.LabelName('ProcessCost', 'QuoteLine'), width: 200 },
                //{ name: 'TaxAmount', displayName: $scope.LabelName('TaxAmount', 'QuoteLine'), width: 200 },
                //{ name: 'QuoteLineTotalCost', displayName: $scope.LabelName('QuoteLineTotalCost', 'QuoteLine'), width: 200 },
                //{ name: 'PackingInstruction', displayName: $scope.LabelName('PackingInstruction', 'QuoteLine'), width: 200 },
                //{ name: 'PriceTerm.PriceTermName', displayName: $scope.LabelName('PriceTerm', 'QuoteLine'), width: 200 },
                //{ name: 'SalesCostPC', displayName: $scope.LabelName('SalesCostPC', 'QuoteLine'), width: 200 },
                //{ name: 'FreightPC', displayName: $scope.LabelName('FreightPC', 'QuoteLine'), width: 200 },
                //{ name: 'WarehousePC', displayName: $scope.LabelName('WarehousePC', 'QuoteLine'), width: 200 },
                //{ name: 'PackingPC', displayName: $scope.LabelName('PackingPC', 'QuoteLine'), width: 200 },
                //{ name: 'InsurancePC', displayName: $scope.LabelName('InsurancePC', 'QuoteLine'), width: 200 },
                //{ name: 'OfferPrice', displayName: $scope.LabelName('OfferPrice', 'QuoteLine'), width: 200 },
                //{ name: 'MarkupPercentage', displayName: $scope.LabelName('MarkupPercentage', 'QuoteLine'), width: 200 },
                //{ name: 'InsertedByName', displayName: $scope.LabelName('InsertedBy', 'QuoteLine'), width: 200 },
                //{ name: 'InsertedAt', displayName: $scope.LabelName('InsertedAt', 'QuoteLine'), width: 200, cellFilter: 'date:\'yyyy-MM-dd\'' },
                //{ name: 'UpdatedByName', displayName: $scope.LabelName('UpdatedBy', 'QuoteLine'), width: 200 },
                //{ name: 'UpdatedAt', width: 200, displayName: $scope.LabelName('UpdatedAt', 'QuoteLine'), cellFilter: 'date:\'yyyy-MM-dd\'' },

                { name: 'QuoteLineID', visible: false },
                { name: 'Part.PartNumber', displayName: $scope.LabelName('PartNumber', 'QuoteLine'), width: 200 },
                { name: 'Quantity', displayName: $scope.LabelName('DemandQty', 'QuoteLine'), width: 200 },
                { name: 'Part.UOM.Name', displayName: $scope.LabelName('UOM', 'QuoteLine'), width: 200 },
                { name: 'PriceTerm.PriceTermName', displayName: $scope.LabelName('PriceTerm', 'QuoteLine'), width: 200 },
                { name: 'PartCost', displayName: $scope.LabelName('PartCost', 'QuoteLine'), width: 200 },
                { name: 'ProcessCost', displayName: $scope.LabelName('ProcessCost', 'QuoteLine'), width: 200 },
                { name: 'MarkupPercentage', displayName: $scope.LabelName('MarkupPercentage', 'QuoteLine'), width: 200 },
                { name: 'SalesCostPC', displayName: $scope.LabelName('SalesCostPC', 'QuoteLine'), width: 200 },
                { name: 'FreightPC', displayName: $scope.LabelName('FreightPC', 'QuoteLine'), width: 200 },
                { name: 'InsurancePC', displayName: $scope.LabelName('InsurancePC', 'QuoteLine'), width: 200 },
                { name: 'PackingPC', displayName: $scope.LabelName('PackingPC', 'QuoteLine'), width: 200 },
                { name: 'WarehousePC', displayName: $scope.LabelName('WarehousePC', 'QuoteLine'), width: 200 },
                { name: 'QuoteLineTotalCost', displayName: $scope.LabelName('QuoteLineTotalCost', 'QuoteLine'), width: 200 },
                { name: 'PackingInstruction', displayName: $scope.LabelName('PackingInstruction', 'QuoteLine'), width: 200 },
                { name: 'InsertedByName', displayName: $scope.LabelName('InsertedBy', 'QuoteLine'), width: 200 },
                { name: 'InsertedAt', displayName: $scope.LabelName('InsertedAt', 'QuoteLine'), width: 200, cellFilter: 'date:\'yyyy-MM-dd\'' },
                { name: 'UpdatedByName', displayName: $scope.LabelName('UpdatedBy', 'QuoteLine'), width: 200 },
                { name: 'UpdatedAt', width: 200, displayName: $scope.LabelName('UpdatedAt', 'QuoteLine'), cellFilter: 'date:\'yyyy-MM-dd\'' },
        ];

        LoadData();
    });

    $scope.LabelName = function (fieldName, tableName) {
        if ($scope.pageConfig) {
            var language = $scope.pageConfig.filter(function (obj) {
                if (obj.TableFieldName === fieldName && obj.TableName === tableName)
                    return obj;
            })[0];

            if ($rootScope.UserDetail && $rootScope.UserDetail.Language.toLowerCase() == 'Chinese'.toLowerCase()) {
                return language.CustomFieldNameForChinese;
            }
            return language.CustomFieldNameForEnglish;
        }
    };

    $scope.filterQuoteValue = '';

    $scope.quoteStatus = 'Open';

    $scope.divForm = false;

    $scope.ShowQuotes = function (quoteStatus) {
        $scope.quoteStatus = quoteStatus;
        $scope.ugQuote.data = [];
        LoadData();
    };

    function LoadData() {
        SeaOttersSvc.GetQuoteListByUserID(paginationOptions.pageNumber, paginationOptions.pageSize, $scope.filterQuoteValue, $scope.quoteStatus).then(function (data) {
            $scope.ugQuote.totalItems = data.data.Results.TotalRecords;
            $scope.ugQuote.data = data.data.Results.Data;
        });
    };

    function RemoveActiveClass() {
        $('#liquoteLine').addClass('active');
        $('#liquoteBOM').removeClass('active');
        $('#liquoteProcess').removeClass('active');
        $('#liquoteTax').removeClass('active');
        $('#liquoteFreight').removeClass('active');
        $('#liquoteWarehouse').removeClass('active');
        $('#liquoteInsurance').removeClass('active');
        $('#liquotePacking').removeClass('active');
        $('#liquoteSalesCost').removeClass('active');

        $('#quoteLine').addClass('active');
        $('#quoteBOM').removeClass('active');
        $('#quoteProcess').removeClass('active');
        $('#quoteTaxes').removeClass('active');
        $('#quoteFreight').removeClass('active');
        $('#quoteWarehouse').removeClass('active');
        $('#quoteInsurance').removeClass('active');
        $('#quotePacking').removeClass('active');
        $('#quoteSalesCost').removeClass('active');

    };

    function LoadMasters() {
        SeaOttersSvc.GetAllTaxHeadsByUserID().then(function (data) {
            $scope.taxHeadsList = data.data.Results;
        });
        SeaOttersSvc.GetAllQuoteStatusUserID().then(function (data) {
            $scope.quoteStatusList = data.data.Results;
        });
        SeaOttersSvc.GetUOMListByUserID().then(function (data) {
            $scope.UOMList = data.data.Results;
        });
        SeaOttersSvc.GetSalesCostList().then(function (data) {
            $scope.salesCostList = data.data.Results;
        });
        SeaOttersSvc.GetPackingList().then(function (data) {
            $scope.packingList = data.data.Results;
        });
        SeaOttersSvc.GetSalesCostList().then(function (data) {
            $scope.SalesCostList = data.data.Results;
        });
        SeaOttersSvc.GetFreightList().then(function (data) {
            $scope.freightList = data.data.Results;
        });
        SeaOttersSvc.GetInsuranceList().then(function (data) {
            $scope.insuranceList = data.data.Results;
        });
        SeaOttersSvc.GetWarehouseList().then(function (data) {
            $scope.warehouseList = data.data.Results;
        });
        SeaOttersSvc.GetPriceTermList().then(function (data) {
            $scope.priceTermList = data.data.Results;
        });
        SeaOttersSvc.GetAllCurrencyList().then(function (data) {
            $scope.currencyList = data.data.Results;
        });
    };

    function CalculateQuoteLineTotals(quoteLine) {

        var notFoundCostGroup = [];

        var totalPartCost = 0;
        for (var i = 0; i < $scope.quote.QuoteLineBOMPartList.length; i++) {
            if ($scope.quote.QuoteLineBOMPartList[i].Part.PartNumber === quoteLine.Part.PartNumber) {
                totalPartCost = Number(totalPartCost) + Number($scope.quote.QuoteLineBOMPartList[i].PartStandardCost * Number($scope.quote.QuoteLineBOMPartList[i].PartAverageQty));
            }
        }

        var totalProcessCost = 0;
        var totalProcessPrice = 0;
        for (var i = 0; i < $scope.quote.QuoteLineProcessList.length; i++) {
            if ($scope.quote.QuoteLineProcessList[i].Part.PartNumber === quoteLine.Part.PartNumber) {
                $scope.quote.QuoteLineProcessList[i].ProcessCost = $scope.quote.QuoteLineProcessList[i].ProcessPrice * $scope.quote.QuoteLineProcessList[i].ProcessQuantity;
                totalProcessCost = Number(totalProcessCost) + Number($scope.quote.QuoteLineProcessList[i].ProcessCost);
                totalProcessPrice = Number(totalProcessPrice) + Number($scope.quote.QuoteLineProcessList[i].ProcessPrice);
            }
        }

        var totalTaxPC = 0;
        for (var j = 0; j < $scope.quote.QuoteLineTaxHeadsList.length; j++) {
            var quoteLineTaxHeads = $scope.quote.QuoteLineTaxHeadsList[j];
            if (quoteLineTaxHeads.Part.PartNumber === quoteLine.Part.PartNumber) {
                totalTaxPC = Number(totalTaxPC) + Number(quoteLineTaxHeads.TaxHeads.TAXPC);
            }
        }

        var totalSalesCost = 0;
        var totalSalesCostMultiplier = 0;
        for (var i = 0; i < $scope.quote.QuoteLineSalesCostList.length; i++) {
            if ($scope.quote.QuoteLineSalesCostList[i].Part.PartNumber === quoteLine.Part.PartNumber) {
                totalSalesCost = Number(totalSalesCost) + Number($scope.quote.QuoteLineSalesCostList[i].SalesCostPC);
                totalSalesCostMultiplier = Number(totalSalesCostMultiplier) + Number($scope.quote.QuoteLineSalesCostList[i].SalesCost.SalesCostMultiplierValue);
            }
        }

        var totalFreight = 0;
        var totalFreightMultiplier = 0;
        for (var i = 0; i < $scope.quote.QuoteLineFreightList.length; i++) {
            if ($scope.quote.QuoteLineFreightList[i].Part.PartNumber === quoteLine.Part.PartNumber) {
                totalFreight = Number(totalFreight) + Number($scope.quote.QuoteLineFreightList[i].FreightPC);
                totalFreightMultiplier = Number(totalFreightMultiplier) + Number($scope.quote.QuoteLineFreightList[i].Freight.FreightCostMultiplierValue);
            }
        }

        var totalWarehouse = 0;
        var totalWarehouseMultiplier = 0;
        for (var i = 0; i < $scope.quote.QuoteLineWarehouseList.length; i++) {
            if ($scope.quote.QuoteLineWarehouseList[i].Part.PartNumber === quoteLine.Part.PartNumber) {
                totalWarehouse = Number(totalWarehouse) + Number($scope.quote.QuoteLineWarehouseList[i].WarehousePC);
                totalWarehouseMultiplier = Number(totalWarehouseMultiplier) + Number($scope.quote.QuoteLineWarehouseList[i].Warehouse.WarehouseCostMultiplierValue);
            }
        }

        var totalInsurance = 0;
        var totalInsuranceMultiplier = 0;
        for (var i = 0; i < $scope.quote.QuoteLineInsuranceList.length; i++) {
            if ($scope.quote.QuoteLineInsuranceList[i].Part.PartNumber === quoteLine.Part.PartNumber) {
                totalInsurance = Number(totalInsurance) + Number($scope.quote.QuoteLineInsuranceList[i].InsurancePC);
                totalInsuranceMultiplier = Number(totalInsuranceMultiplier) + Number($scope.quote.QuoteLineInsuranceList[i].Insurance.InsuranceCostMultiplierValue);
            }
        }

        var totalPacking = 0;
        var totalPackingMultiplier = 0;
        for (var i = 0; i < $scope.quote.QuoteLinePackingList.length; i++) {
            if ($scope.quote.QuoteLinePackingList[i].Part.PartNumber === quoteLine.Part.PartNumber) {
                totalPacking = Number(totalPacking) + Number($scope.quote.QuoteLinePackingList[i].PackingPC);
                totalPackingMultiplier = Number(totalPackingMultiplier) + Number($scope.quote.QuoteLinePackingList[i].Packing.PackingCostMultiplierValue);
            }
        }

        quoteLine.ProcessCost = totalProcessCost * quoteLine.Quantity;
        quoteLine.PartCost = totalPartCost * quoteLine.Quantity;
        quoteLine.TaxAmount = (Number(totalPartCost) + Number(totalProcessCost)) * (Number(totalTaxPC) / 100);
        quoteLine.SalesCostPC = totalSalesCost * totalSalesCostMultiplier * quoteLine.Quantity * quoteLine.Part.AdditionalUOMValue;
        quoteLine.FreightPC = totalFreight * totalFreightMultiplier * quoteLine.Quantity * quoteLine.Part.AdditionalUOMValue;
        quoteLine.WarehousePC = totalWarehouse * totalWarehouseMultiplier * quoteLine.Quantity * quoteLine.Part.AdditionalUOMValue;
        quoteLine.InsurancePC = totalInsurance * totalInsuranceMultiplier * quoteLine.Quantity * quoteLine.Part.AdditionalUOMValue;
        quoteLine.PackingPC = totalPacking * totalPackingMultiplier * quoteLine.Quantity * quoteLine.Part.AdditionalUOMValue;

        var formula = quoteLine.PriceTerm.Formula;

        for (var i = 0; i < quoteLine.CostGroupList.length; i++) {

            var costGroup = quoteLine.CostGroupList[i];

            if (costGroup.TableName === "Quote" && costGroup.FieldName === "CurrencyExchangeRate") {
                formula = formula.replace(new RegExp("\\" + costGroup.CostCode + "\\b", 'g'), Number($scope.quote.Currency.CurrencyExchangeRate));
            }
            if (costGroup.TableName === "QuoteLine" && costGroup.FieldName === "MarkupPercentage") {
                formula = formula.replace(new RegExp("\\" + costGroup.CostCode + "\\b", 'g'), Number(quoteLine.MarkupPercentage / 100));
            }
            if (costGroup.TableName === "QuoteLine" && costGroup.FieldName === "PartCost") {
                formula = formula.replace(new RegExp("\\" + costGroup.CostCode + "\\b", 'g'), Number(quoteLine.PartCost));
            }
            if (costGroup.TableName === "QuoteLine" && costGroup.FieldName === "ProcessCost") {
                formula = formula.replace(new RegExp("\\" + costGroup.CostCode + "\\b", 'g'), Number(quoteLine.ProcessCost));
            }
            if (costGroup.TableName === "QuoteLineTaxHeads") {
                if ($scope.quote.QuoteLineTaxHeadsList.length > 0) {
                    var isFound = false;
                    for (var j = 0; j < $scope.quote.QuoteLineTaxHeadsList.length; j++) {
                        var quoteLineTaxHeads = $scope.quote.QuoteLineTaxHeadsList[j];
                        if (quoteLineTaxHeads.Part.PartNumber === quoteLine.Part.PartNumber && costGroup.CostCode === quoteLineTaxHeads.TaxHeads.TAXCode) {
                            isFound = true;
                            break;
                        }
                    }
                    if (isFound) {
                        formula = formula.replace(new RegExp("\\" + costGroup.CostCode + "\\b", 'g'), Number(quoteLineTaxHeads.TaxHeads.TAXPC/100));
                    }
                    else {
                        formula = formula.replace(new RegExp("\\" + costGroup.CostCode + "\\b", 'g'), 0);
                        notFoundCostGroup.push(costGroup);
                    }
                }
                else {
                    formula = formula.replace(new RegExp("\\" + costGroup.CostCode + "\\b", 'g'), 0);
                    notFoundCostGroup.push(costGroup);
                }
            }
            if (costGroup.TableName === "QuoteLineSalesCost") {
                if ($scope.quote.QuoteLineSalesCostList.length > 0) {
                    var isFound = false;
                    for (var k = 0; k < $scope.quote.QuoteLineSalesCostList.length; k++) {
                        var salesCost = $scope.quote.QuoteLineSalesCostList[k];
                        if (salesCost.Part.PartNumber === quoteLine.Part.PartNumber && costGroup.CostCode === salesCost.SalesCost.SaleCostCode) {
                            isFound = true;
                            break;
                        }
                    }
                    if (isFound) {
                        formula = formula.replace(new RegExp("\\" + costGroup.CostCode + "\\b", 'g'), Number(salesCost.SalesCostPC));
                    }
                    else {
                        formula = formula.replace(new RegExp("\\" + costGroup.CostCode + "\\b", 'g'), 0);
                        notFoundCostGroup.push(costGroup);
                    }
                }
                else {
                    formula = formula.replace(new RegExp("\\" + costGroup.CostCode + "\\b", 'g'), 0);
                    notFoundCostGroup.push(costGroup);
                }
            }
            if (costGroup.TableName === "QuoteLineFreight") {
                if ($scope.quote.QuoteLineFreightList.length > 0) {
                    var isFound = false;
                    for (var l = 0; l < $scope.quote.QuoteLineFreightList.length; l++) {
                        var freight = $scope.quote.QuoteLineFreightList[l];
                        if (freight.Part.PartNumber === quoteLine.Part.PartNumber && costGroup.CostCode === freight.Freight.FreightCode) {
                            isFound = true;
                            break;
                        }
                    }
                    if (isFound) {
                        formula = formula.replace(new RegExp("\\" + costGroup.CostCode + "\\b", 'g'), Number(freight.FreightPC));
                    }
                    else {
                        formula = formula.replace(new RegExp("\\" + costGroup.CostCode + "\\b", 'g'), 0);
                        notFoundCostGroup.push(costGroup);
                    }
                }
                else {
                    formula = formula.replace(new RegExp("\\" + costGroup.CostCode + "\\b", 'g'), 0);
                    notFoundCostGroup.push(costGroup);
                }
            }
            if (costGroup.TableName === "QuoteLineInsurance") {
                if ($scope.quote.QuoteLineInsuranceList.length > 0) {
                    var isFound = false;
                    for (var m = 0; m < $scope.quote.QuoteLineInsuranceList.length; m++) {
                        var insurance = $scope.quote.QuoteLineInsuranceList[m];
                        if (insurance.Part.PartNumber === quoteLine.Part.PartNumber && costGroup.CostCode === insurance.Insurance.InsuranceCode) {
                            isFound = true;
                            break;
                        }
                    }
                    if (isFound) {
                        formula = formula.replace(new RegExp("\\" + costGroup.CostCode + "\\b", 'g'), Number(insurance.InsurancePC));
                    }
                    else {
                        formula = formula.replace(new RegExp("\\" + costGroup.CostCode + "\\b", 'g'), 0);
                        notFoundCostGroup.push(costGroup);
                    }
                }
                else {
                    formula = formula.replace(new RegExp("\\" + costGroup.CostCode + "\\b", 'g'), 0);
                    notFoundCostGroup.push(costGroup);
                }
            }
            if (costGroup.TableName === "QuoteLinePacking") {
                if ($scope.quote.QuoteLinePackingList.length > 0) {
                    var isFound = false;
                    for (var n = 0; n < $scope.quote.QuoteLinePackingList.length; n++) {
                        var packing = $scope.quote.QuoteLinePackingList[n];
                        if (packing.Part.PartNumber === quoteLine.Part.PartNumber && costGroup.CostCode === packing.Packing.PackingCode) {
                            isFound = true;
                            break;
                        }
                    }
                    if (isFound) {
                        formula = formula.replace(new RegExp("\\" + costGroup.CostCode + "\\b", 'g'), Number(packing.PackingPC));
                    }
                    else {
                        formula = formula.replace(new RegExp("\\" + costGroup.CostCode + "\\b", 'g'), 0);
                        notFoundCostGroup.push(costGroup);
                    }
                }
                else {
                    formula = formula.replace(new RegExp("\\" + costGroup.CostCode + "\\b", 'g'), 0);
                    notFoundCostGroup.push(costGroup);
                }
            }
            if (costGroup.TableName === "QuoteLineWarehouse") {
                if ($scope.quote.QuoteLineWarehouseList.length > 0) {
                    var isFound = false;
                    for (var o = 0; o < $scope.quote.QuoteLineWarehouseList.length; o++) {
                        var warehouse = $scope.quote.QuoteLineWarehouseList[o];
                        if (warehouse.Part.PartNumber === quoteLine.Part.PartNumber && costGroup.CostCode === warehouse.Warehouse.WarehouseCode) {
                            isFound = true;
                            break;
                        }
                    }
                    if (isFound) {
                        formula = formula.replace(new RegExp("\\" + costGroup.CostCode + "\\b", 'g'), Number(warehouse.WarehousePC));
                    }
                    else {
                        formula = formula.replace(new RegExp("\\" + costGroup.CostCode + "\\b", 'g'), 0);
                        notFoundCostGroup.push(costGroup);
                    }
                }
                else {
                    formula = formula.replace(new RegExp("\\" + costGroup.CostCode + "\\b", 'g'), 0);
                    notFoundCostGroup.push(costGroup);
                }
            }
        }
        quoteLine.QuoteLineTotalCost = eval(formula);

        $scope.quote.QuoteLineList.filter(function (obj) {
            if (obj.Part.PartNumber === quoteLine.Part.PartNumber) {
                obj.ProcessCost = quoteLine.ProcessCost;
                obj.PartCost = quoteLine.PartCost;
                obj.TaxAmount = quoteLine.TaxAmount;
                obj.SalesCostPC = quoteLine.SalesCostPC;
                obj.FreightPC = quoteLine.FreightPC;
                obj.WarehousePC = quoteLine.WarehousePC;
                obj.InsurancePC = quoteLine.InsurancePC;
                obj.PackingPC = quoteLine.PackingPC;
                obj.QuoteLineTotalCost = Number(Number(quoteLine.QuoteLineTotalCost).toFixed(2));
                if (obj.QuoteLineID != 0)
                    obj.IsUpdated = true;
            }
        });
    };

    function CalculateQuoteTotals() {
        $scope.quote.TotalQuoteAmount = 0;
        for (var i = 0; i < $scope.quote.QuoteLineList.length; i++) {
            var quoteLine = $scope.quote.QuoteLineList[i];
            if (!quoteLine.IsDeleted) {
                $scope.quote.TotalQuoteAmount = Number(Number($scope.quote.TotalQuoteAmount).toFixed(2)) + Number(Number(quoteLine.QuoteLineTotalCost).toFixed(2));
            }
        }
    };

    $scope.FilterQuote = function () {
        paginationOptions.pageNumber = 1;
        paginationOptions.pageSize = 20;
        SeaOttersSvc.GetQuoteListByUserID(paginationOptions.pageNumber, paginationOptions.pageSize, $scope.filterQuoteValue, $scope.quoteStatus).then(function (data) {
            $scope.ugQuote.totalItems = data.data.Results.TotalRecords;
            $scope.ugQuote.data = data.data.Results.Data;
        });
    };

    $scope.ugQuote.onRegisterApi = function (gridApi) {
        $scope.quoteGridAPI = gridApi;
        gridApi.pagination.on.paginationChanged($scope, function (pageNumber, pageSize) {
            paginationOptions.pageNumber = pageNumber;
            paginationOptions.pageSize = pageSize;
            LoadData();
        });
    };

    $scope.AddQuote = function () {
        $scope.quote = {
            QuoteID: 0, QuoteNumber: 'TBG', QuoteDate: new Date(),
            QuoteStatus: { QuoteStatusID: 3, QuoteStatus: 'New' },
            Customer: { CustomerID: null, CustomerName: null },
            Currency: { ID: null, CurrencyCode: null, CurrencyExchangeRate: 0 },
            CustomerDeliveryAddress: { CustomerAddressID: null },
            DeliveryTo: null, LeadTime: null, RequestedComments: null, InquiryDate: null,
            RequestedDelvDate: null,
            TotalQuoteAmount: 0, TotalGrossAmount: 0,
            IsActive: true, QuoteLineList: [],
            QuoteLineBOMPartList: [], QuoteLineProcessList: [], QuoteLineTaxHeadsList: [], QuoteLineFreightList: [],
            QuoteLineWarehouseList: [], QuoteLineInsuranceList: [], QuoteLineSalesCostList: [], QuoteLinePackingList: []
        };
        LoadMasters();
        $scope.filteredQuoteLineBOMPart = [];
        $scope.ugQuoteLine.data = [];
        RemoveActiveClass();
        $scope.divForm = true;
        $scope.quoteApprovalAction = true;
    };

    $scope.EditQuote = function () {
        var selectedquote = $scope.quoteGridAPI.selection.getSelectedRows();
        if (selectedquote.length > 0) {
            var ID = selectedquote[0].QuoteID;
            $scope.MainQuoteID = ID;
            $scope.MainQuoteStatusID = selectedquote[0].QuoteStatusID;
            $scope.quoteApprovalAction = true;
            $scope.quoteApprovalButton = false;
            $scope.gridMultiSelection = false;
            if ($scope.MainQuoteStatusID == 4) {
                $scope.quoteApprovalButton = false;
                $scope.quoteApprovalAction = true;
            }
            else if ($scope.MainQuoteStatusID == 5) {
                $scope.quoteApprovalButton = true;
                $scope.quoteApprovalAction = false;
                $scope.gridMultiSelection = true;

            }
            else if ($scope.MainQuoteStatusID > 5) {
                $scope.quoteApprovalButton = false;
                $scope.quoteApprovalAction = true;
            }
            SeaOttersSvc.GetQuoteDetailsByQuoteID(ID).then(function (data) {
                $scope.quote = data.data.Results;
                if ($scope.MainQuoteStatusID == 5) {
                    $scope.ugQuoteLine.enableFullRowSelection = !$scope.gridMultiSelection;
                    $scope.ugQuoteLine.multiSelect = $scope.gridMultiSelection;
                }
                for (var i = 0; i < $scope.quote.QuoteLineList.length; i++) {
                    var quoteLine = $scope.quote.QuoteLineList[i];

                    SeaOttersSvc.GetCostGroupDetailsByPriceTermID(quoteLine.PriceTerm.PriceTermID).then(function (data) {
                        quoteLine.CostGroupList = data.data.Results;
                    });
                }
                $scope.ugQuoteLine.data = $scope.quote.QuoteLineList;
            });
            LoadMasters();
            RemoveActiveClass();
            $scope.divForm = true;
        }
        else {
            SeaOttersSvc.ShowAlert(17, 1, [{ key: '[action]', value: 'edit' }]);
        }
        $scope.quoteGridAPI.selection.clearSelectedRows();
    };

    $scope.DeleteQuote = function () {
        var selectedQuote = $scope.quoteGridAPI.selection.getSelectedRows();
        if (selectedQuote.length > 0) {
            var ID = selectedQuote[0].QuoteID;
            SeaOttersSvc.DeleteQuote(ID).then(function (data) {
                if (data.data.Status == true) {
                    SeaOttersSvc.ShowAlert(data.data.MessageId, 3, [{ key: '[Data]', value: 'Quote' }]);
                    LoadData();
                }
                else {
                    SeaOttersSvc.ShowAlert(data.data.MessageId, 0, {});
                }
            });
        }
        else {
            SeaOttersSvc.ShowAlert(17, 1, [{ key: '[action]', value: 'delete' }]);
        }
        $scope.quoteGridAPI.selection.clearSelectedRows();
    };

    $scope.SaveQuote = function () {
        $scope.quote.QuoteDate = $('#txtQuoteDate').val();
        $scope.quote.InquiryDate = $('#txtInquiryDate').val();
        $scope.quote.RequestedDelvDate = $('#txtRequestedDelvDate').val();

        if ($scope.quote.QuoteLineList != null && $scope.quote.QuoteLineList.length > 0) {
            var count = 0;
            for (var i = 0; i < $scope.quote.QuoteLineList.length; i++) {
                if ($scope.quote.QuoteLineList[i].IsDeleted == false) {
                    count++;
                    break;
                }
            }
            if (count > 0) {

                for (var i = 0; i < $scope.quote.QuoteLineList.length; i++) {
                    if ($scope.quote.QuoteLineList[i].IsDeleted == false) {
                        CalculateQuoteLineTotals($scope.quote.QuoteLineList[i]);
                    }
                }
                CalculateQuoteTotals();

                SeaOttersSvc.SaveQuote($scope.quote).then(function (data) {
                    if (data.data.Status == true) {
                        SeaOttersSvc.ShowAlert(data.data.MessageId, 3, [{ key: '[Data]', value: 'Quote' }]);
                        LoadData();
                        $scope.divForm = false;
                    }
                    else {
                        SeaOttersSvc.ShowAlert(data.data.MessageId, 0, {});
                    }
                });
            }
            else {
                SeaOttersSvc.ShowAlert(18, 0, {});
            }
        }
        else {
            SeaOttersSvc.ShowAlert(18, 0, {});
        }
    };

    $scope.QuoteApproveReject = function (isapprove) {
        $scope.approvalQuoteLineIDs = '';
        var cnt = 0;
        var selectedQuoteLine = $scope.quoteLineGridAPI.selection.getSelectedRows();
        if (selectedQuoteLine.length > 0) {
            for (var i = 0; i < selectedQuoteLine.length; i++) {
                if ($scope.approvalQuoteLineIDs == '')
                    $scope.approvalQuoteLineIDs = selectedQuoteLine[i].QuoteLineID;
                else
                    $scope.approvalQuoteLineIDs = $scope.approvalQuoteLineIDs + ',' + selectedQuoteLine[i].QuoteLineID;
                cnt++;
            }
        }
        var param =
            {
                quoteID: $scope.MainQuoteID,
                isApproved: isapprove,
                ApprovalComment: $scope.quote.ApprovalComment,
                approvalQuoteLineIDs: $scope.approvalQuoteLineIDs,
                lineIds: cnt,
            };
        SeaOttersSvc.UpdateQuoteApprovals(param).then(function (data) {
            SeaOttersSvc.ShowAlert(data.data.MessageId, 3, [{ key: '[Data]', value: 'Quote' }]);
            $scope.quoteApprovalButton = false;
            $scope.quoteApprovalAction = false;
            LoadData();
            $scope.divForm = false;
        });
    };

    $scope.ugQuoteLine.onRegisterApi = function (gridApi) {
        $scope.quoteLineGridAPI = gridApi;
    };

    var QuoteLineCtrl = function ($scope, $modalInstance, pageConfig, customerID, userLanguage, SeaOttersSvc, quoteLine, priceTermList) {

        $scope.customerID = customerID;
        $scope.userLanguage = userLanguage;
        $scope.pageConfig = pageConfig;
        $scope.priceTermList = priceTermList;

        if (quoteLine != null) {
            $scope.quoteLine = {
                $$hashKey: quoteLine.$$hashKey,
                QuoteID: quoteLine.QuoteID, QuoteLineID: quoteLine.QuoteLineID,
                Part: quoteLine.Part,
                CustomerPart: quoteLine.CustomerPart,
                Quantity: quoteLine.Quantity, ExtendedPrice: quoteLine.ExtendedPrice, DeliverDate: quoteLine.DeliverDate, SupplierName: quoteLine.SupplierName,
                ExpirationDate: quoteLine.ExpirationDate == null ? new Date() : quoteLine.ExpirationDate,
                PackingInstruction: quoteLine.PackingInstruction, CustomerTargetCost: quoteLine.CustomerTargetCost, PartCost: quoteLine.PartCost,
                ProcessCost: quoteLine.ProcessCost, TaxAmount: quoteLine.TaxAmount, QuoteLineTotalCost: quoteLine.QuoteLineTotalCost, UnitPrice: quoteLine.UnitPrice,
                PriceTerm: quoteLine.PriceTerm,
                SalesCostPC: quoteLine.SalesCostPC, FreightPC: quoteLine.FreightPC, WarehousePC: quoteLine.WarehousePC, InsurancePC: quoteLine.InsurancePC,
                PackingPC: quoteLine.PackingPC, MarkupPercentage: quoteLine.MarkupPercentage, OfferPrice: quoteLine.OfferPrice,
                IsDeleted: quoteLine.IsDeleted
            };
        }
        else {
            $scope.quoteLine = {
                QuoteID: 0, QuoteLineID: 0,
                Part: {
                    PartID: null, PartNumber: null, UOM: { Name: null }, AdditionalUOMValue: 0,
                    PartDescription: null, PartType: { ID: null, Type: null }, PartFamily: { PartFamilyName: null }
                },
                CustomerPart: { CustomerPartNumber: null },
                Quantity: 0, ExtendedPrice: 0, DeliverDate: new Date(), SupplierName: null,
                ExpirationDate: new Date(), CustomerTargetCost: 0, PartCost: 0,
                ProcessCost: 0, TaxAmount: 0, QuoteLineTotalCost: 0, PackingInstruction: null, UnitPrice: 0, IsDeleted: false,
                PriceTerm: { PriceTermID: null, PriceTermName: null, Formula: null },
                SalesCostPC: 0, FreightPC: 0, WarehousePC: 0, InsurancePC: 0, PackingPC: 0, MarkupPercentage: 0, OfferPrice: 0
            };
        }

        $scope.LabelName = function (fieldName, tableName) {
            if ($scope.pageConfig) {
                var language = $scope.pageConfig.filter(function (obj) {
                    if (obj.TableFieldName === fieldName && obj.TableName === tableName)
                        return obj;
                })[0];

                if ($scope.userLanguage.toLowerCase() == 'Chinese'.toLowerCase()) {
                    return language.CustomFieldNameForChinese;
                }
                return language.CustomFieldNameForEnglish;
            }
        };

        $scope.ok = function () {
            $modalInstance.close($scope.quoteLine);
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

        $scope.GetAllPartList = function (val) {
            if ($scope.customerID == null)
                $scope.customerID = 0;
            return SeaOttersSvc.GetAllPartDetails($scope.customerID, val).then(function (data) {
                var partList = [];
                angular.forEach(data.data.Results.Data, function (item) {
                    partList.push(item);
                });
                return partList;
            });
        };

        $scope.onSelect = function ($item, $model, $label) {
            $scope.quoteLine.Part.PartDescription = $item.PartDescription;
            $scope.quoteLine.Part.PartFamily.PartFamilyName = $item.PartFamilyName;
            $scope.quoteLine.Part.PartID = $item.PartID;
            $scope.quoteLine.Part.PartNumber = $item.PartNumber;
            $scope.quoteLine.Part.AdditionalUOMValue = $item.AdditionalUOMValue;
            $scope.quoteLine.Part.PartType.Type = $item.PartType;
            $scope.quoteLine.Part.StandardPrice = $item.StandardPrice;
            $scope.quoteLine.Part.UOM.Name = $item.UOM;
            $scope.quoteLine.CustomerPart.CustomerPartNumber = $item.CustomerPartName;
        };
    };

    $scope.AddQuoteLine = function () {

        var modalInstance = SeaOttersSvc.ShowQuoteLineModal($scope.pageConfig, $scope.quote.Customer.CustomerID, $rootScope.UserDetail.Language, SeaOttersSvc, null, QuoteLineCtrl, $scope.priceTermList);

        modalInstance.result.then(function (quoteLine) {

            var isFound = false;
            for (i = 0; i < $scope.quote.QuoteLineList.length; i++) {
                if ($scope.quote.QuoteLineList[i].Part.PartNumber === quoteLine.Part.PartNumber) {
                    isFound = true;
                    break;
                }
            }
            if (!isFound) {

                SeaOttersSvc.GetCostGroupDetailsByPriceTermID(quoteLine.PriceTerm.PriceTermID).then(function (data) {

                    quoteLine.CostGroupList = data.data.Results;

                    $scope.quote.QuoteLineList.push(quoteLine);

                    $scope.ugQuoteLine.data = $scope.quote.QuoteLineList;

                    SeaOttersSvc.GetAllSavedBOMedPartsByPartID(quoteLine.Part.PartID).then(function (data) {
                        var ctr = $scope.quote.QuoteLineBOMPartList.length;
                        var bomParts = data.data.Results.Data;
                        for (var i = 0; i < bomParts.length; i++) {
                            ctr += 1;
                            var quoteBOM = {
                                QuoteLineBOMPartID: ctr,
                                Part: {
                                    PartNumber: quoteLine.Part.PartNumber,
                                    PartID: quoteLine.Part.PartID,
                                    StandardPrice: quoteLine.Part.StandardPrice
                                },
                                BOMPart: {
                                    PartNumber: bomParts[i].PartNumber,
                                    PartFamily: { PartFamilyName: bomParts[i].PartFamilyName },
                                    PartType: { Type: bomParts[i].PartTypeName },
                                    UOM: { Name: bomParts[i].UOMName },
                                    PartID: bomParts[i].PartID
                                },
                                PartStandardCost: bomParts[i].StandardPrice, PartAverageQty: bomParts[i].AverageQtyPer
                            };
                            $scope.quote.QuoteLineBOMPartList.push(quoteBOM);
                        }

                        CalculateQuoteLineTotals(quoteLine);
                        CalculateQuoteTotals();
                    });

                    SeaOttersSvc.GetAllSavedBOMProcessByPartID(quoteLine.Part.PartID).then(function (data) {
                        var ctr = $scope.quote.QuoteLineProcessList.length;
                        var quoteProcesses = data.data.Results.Data;
                        for (var i = 0; i < quoteProcesses.length; i++) {
                            ctr += 1;

                            var quoteProcess =
                                    {
                                        QuoteLineProcessID: ctr,
                                        Part: { PartID: quoteProcesses[i].PartID, PartNumber: quoteProcesses[i].PartNumber, StandardPrice: quoteProcesses[i].StandardPrice },
                                        Process: { ID: quoteProcesses[i].ProcessID, StatusName: quoteProcesses[i].ProcessName, },
                                        ProcessQuantity: quoteProcesses[i].ProcessQuantity,
                                        ProcessPrice: quoteProcesses[i].ProcessPrice,
                                        ProcessCost: quoteProcesses[i].ProcessCost,
                                        UOM: { ID: quoteProcesses[i].UOMID, Name: quoteProcesses[i].UOM },
                                    };
                            $scope.quote.QuoteLineProcessList.push(quoteProcess);
                        }

                        CalculateQuoteLineTotals(quoteLine);
                        CalculateQuoteTotals();
                    });

                });
            }
        });
    };

    $scope.EditQuoteLine = function () {
        var selectedQuoteLine = $scope.quoteLineGridAPI.selection.getSelectedRows();
        if (selectedQuoteLine.length > 0) {

            var modalInstance = SeaOttersSvc.ShowQuoteLineModal($scope.pageConfig, $scope.quote.Customer.CustomerID, $rootScope.UserDetail.Language, SeaOttersSvc, selectedQuoteLine[0], QuoteLineCtrl, $scope.priceTermList);

            modalInstance.result.then(function (quoteLine) {
                if (quoteLine.QuoteLineID != null && quoteLine.QuoteLineID != undefined && quoteLine.QuoteLineID != 0) {
                    $scope.quote.QuoteLineList.filter(function (obj) {
                        if (obj.QuoteLineID === quoteLine.QuoteLineID) {
                            $scope.quote.QuoteLineList.splice($scope.quote.QuoteLineList.indexOf(obj), 1);
                            quoteLine.$$hashKey = quoteLine.$$hashKey + '1';
                            quoteLine.IsUpdated = true;
                            $scope.quote.QuoteLineList.push(quoteLine);
                        }
                    });
                }
                else {
                    $scope.quote.QuoteLineList.filter(function (obj) {
                        if (obj.$$hashKey === quoteLine.$$hashKey) {
                            $scope.quote.QuoteLineList.splice($scope.quote.QuoteLineList.indexOf(obj), 1);
                            quoteLine.$$hashKey = quoteLine.$$hashKey + '1';
                            $scope.quote.QuoteLineList.push(quoteLine);
                        }
                    });
                }

                SeaOttersSvc.GetCostGroupDetailsByPriceTermID(quoteLine.PriceTerm.PriceTermID).then(function (data) {
                    quoteLine.CostGroupList = data.data.Results;
                    CalculateQuoteLineTotals(quoteLine);
                    CalculateQuoteTotals();
                });
            });
        }
        else {
            SeaOttersSvc.ShowAlert(17, 1, [{ key: '[action]', value: 'edit' }]);
        }
        $scope.quoteLineGridAPI.selection.clearSelectedRows();
    };

    $scope.DeleteQuoteLine = function () {
        var selectedQuoteLine = $scope.quoteLineGridAPI.selection.getSelectedRows();
        if (selectedQuoteLine.length > 0) {
            var quoteLine = selectedQuoteLine[0];

            if (quoteLine.QuoteLineID != null && quoteLine.QuoteLineID != undefined && quoteLine.QuoteLineID != 0) {
                $scope.quote.QuoteLineList.filter(function (obj) {
                    if (obj.QuoteLineID === quoteLine.QuoteLineID) {
                        $scope.quote.QuoteLineList.splice($scope.quote.QuoteLineList.indexOf(obj), 1);
                        quoteLine.IsDeleted = true;
                        $scope.quote.QuoteLineList.push(quoteLine);
                    }
                });
            }
            else {
                $scope.quote.QuoteLineList.filter(function (obj) {
                    if (obj.$$hashKey === quoteLine.$$hashKey) {
                        $scope.quote.QuoteLineList.splice($scope.quote.QuoteLineList.indexOf(obj), 1);
                    }
                });
            }

            var quoteLineProcessList = $scope.quote.QuoteLineProcessList.filter(function (obj) {
                return (obj.Part.PartNumber !== quoteLine.Part.PartNumber);
            });

            $scope.quote.QuoteLineProcessList = quoteLineProcessList;

            var quoteLineBOMPartList = $scope.quote.QuoteLineBOMPartList.filter(function (obj) {
                return (obj.Part.PartNumber !== quoteLine.Part.PartNumber);
            });

            $scope.quote.QuoteLineBOMPartList = quoteLineBOMPartList;

            var quoteLineTaxHeadsList = $scope.quote.QuoteLineTaxHeadsList.filter(function (obj) {
                return (obj.Part.PartNumber !== quoteLine.Part.PartNumber);
            });

            $scope.quote.QuoteLineTaxHeadsList = quoteLineTaxHeadsList;

            CalculateQuoteLineTotals(quoteLine);
            CalculateQuoteTotals();
        }
        else {
            SeaOttersSvc.ShowAlert(17, 1, [{ key: '[action]', value: 'delete' }]);
        }
        $scope.quoteLineGridAPI.selection.clearSelectedRows();
    };

    var CustomerCtrl = function ($scope, $modalInstance, pageConfig, userLanguage, SeaOttersSvc) {

        $scope.pageConfig = pageConfig;

        $scope.userLanguage = userLanguage;

        $scope.filterCustomerValue = null;

        $scope.ugCustomers = {
            enableFullRowSelection: true,
            enableRowHeaderSelection: true,
            multiSelect: false,
            paginationPageSize: 5,
            useExternalPagination: true,
            columnDefs: [
                { name: 'CustomerID', displayName: 'ID', visible: false, enableHiding: false },
                { name: 'CustomerCode', displayName: 'Code', width: 160 },
                { name: 'CustomerName', displayName: 'Name', width: 160 },
                { name: 'MainPhone', displayName: 'MainPhone', width: 130 },
                { name: 'Fax', displayName: 'Fax', width: 100 },
            ]
        };

        var paginationOptions = {
            pageNumber: 1,
            pageSize: 5,
            sort: null
        };

        $scope.LabelName = function (fieldName, tableName) {
            if ($scope.pageConfig) {
                var language = $scope.pageConfig.filter(function (obj) {
                    if (obj.TableFieldName === fieldName && obj.TableName === tableName)
                        return obj;
                })[0];

                if ($scope.userLanguage.toLowerCase() == 'Chinese'.toLowerCase()) {
                    return language.CustomFieldNameForChinese;
                }
                return language.CustomFieldNameForEnglish;
            }
        };

        $scope.ugCustomers.columnDefs = [
                { name: 'CustomerID', displayName: 'ID', visible: false, enableHiding: false },
                { name: 'CustomerCode', displayName: $scope.LabelName('Code', 'Quote'), width: 160 },
                { name: 'CustomerName', displayName: $scope.LabelName('Name', 'Quote'), width: 160 },
                { name: 'MainPhone', displayName: $scope.LabelName('MainPhone', 'Quote'), width: 130 },
                { name: 'Fax', displayName: $scope.LabelName('Fax', 'Quote'), width: 100 },
        ];
        $scope.filterCustomerValue = '';
        GetAllCustomers();
        $scope.FilterCustomer = function (filterCustomerValue) {
            $scope.filterCustomerValue = filterCustomerValue;
            GetAllCustomers();
        };

        function GetAllCustomers() {
            SeaOttersSvc.GetAllCustomersByUserID(paginationOptions.pageNumber, paginationOptions.pageSize, $scope.filterCustomerValue).then(function (data) {
                $scope.ugCustomers.totalItems = data.data.Results.TotalRecords;
                $scope.ugCustomers.data = data.data.Results.Data;
            });
        };

        $scope.ugCustomers.onRegisterApi = function (gridApi) {
            $scope.customerGridAPI = gridApi;
            gridApi.pagination.on.paginationChanged($scope, function (pageNumber, pageSize) {
                paginationOptions.pageNumber = pageNumber;
                paginationOptions.pageSize = pageSize;
                GetAllCustomers();
            });
        };

        $scope.ok = function () {
            var selectedCustomer = $scope.customerGridAPI.selection.getSelectedRows();
            if (selectedCustomer.length > 0) {
                $modalInstance.close(selectedCustomer[0]);
            }
            else {
                SeaOttersSvc.ShowAlert(17, 1, [{ key: '[action]', value: 'add' }]);
            }
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    };

    $scope.ShowCustomer = function () {
        var modalInstance = SeaOttersSvc.ShowCustomerModal($scope.pageConfig, $rootScope.UserDetail.Language, SeaOttersSvc, CustomerCtrl);
        modalInstance.result.then(function (customer) {
            $scope.quote.Customer = customer;
            $scope.quote.CustomerDeliveryAddress.CustomerAddressID = customer.CustomerAddressID;
            $scope.quote.DeliveryTo = customer.DeliveryTo;
        });
    };

    $scope.ShowQuoteLineProcess = function () {
        var selectedQuoteLine = $scope.quoteLineGridAPI.selection.getSelectedRows();
        if (selectedQuoteLine != '') {
            $scope.QuoteLineID = selectedQuoteLine[0].QuoteLineID;

            var qlPartID = selectedQuoteLine[0].Part.PartID;
            var existingquoteLineProcess = $scope.quote.QuoteLineProcessList;
            $scope.filteredQuoteLineProcess = [];
            if (qlPartID != 0) {
                $.each(existingquoteLineProcess, function (key, value) {
                    if (value.Part.PartID === qlPartID)
                        $scope.filteredQuoteLineProcess.push(value);
                });
            }
            else {
                $scope.filteredQuoteLineProcess = [];
            }
        }
        else {
            $scope.filteredQuoteLineProcess = [];
            SeaOttersSvc.ShowAlert(17, 1, [{ key: '[action]', value: 'add' }]);
        }
    };

    var QuoteLineProcessCtrl = function ($scope, $modalInstance, pageConfig, UOMList, unsavedBOMProcesses, partID, partNumber, userLanguage) {
        $scope.UOMList = UOMList;
        $scope.PartNumber = partNumber;
        $scope.PartID = partID;
        $scope.pageConfig = pageConfig;
        $scope.unsavedBOMProcesses = unsavedBOMProcesses;
        $scope.userLanguage = userLanguage;
        $scope.selectedUnPartProcess = [];

        $scope.filterProcessName = "";

        $scope.LabelName = function (fieldName, tableName) {
            if ($scope.pageConfig) {
                var language = $scope.pageConfig.filter(function (obj) {
                    if (obj.TableFieldName === fieldName && obj.TableName === tableName)
                        return obj;
                })[0];

                if ($scope.userLanguage.toLowerCase() == 'Chinese'.toLowerCase()) {
                    return language.CustomFieldNameForChinese;
                }
                return language.CustomFieldNameForEnglish;
            }
        };

        $scope.SaveUnBOMProcess = function () {
            $('input:checkbox[name=chkDeleteBOMProcessAdd]').each(function () {
                if ($(this).is(':checked')) {
                    var chkID = $(this).val();
                    var param =
                        {
                            Part: { PartID: $scope.PartID, PartNumber: $scope.PartNumber },
                            Process: { ID: chkID, StatusName: $('#txtProcessName' + chkID)[0].innerHTML },
                            UOM: { ID: $('#cmbUOM' + chkID).val(), Name: $('#cmbUOM' + chkID + ' option:selected').text() },
                            ProcessQuantity: $('#txtProcessQuantity' + chkID).val(),
                            ProcessPrice: $('#txtProcessPrice' + chkID).val(),
                            ProcessCost: $('#txtProcessQuantity' + chkID).val() * $('#txtProcessPrice' + chkID).val(),
                        };
                    $scope.selectedUnPartProcess.push(param);
                }
            });
            if ($scope.selectedUnPartProcess.length != 0) {
                $modalInstance.close($scope.selectedUnPartProcess);
            }
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    };

    $scope.AddQuoteLineProcess = function () {
        var selectedQuoteLine = $scope.quoteLineGridAPI.selection.getSelectedRows();
        if (selectedQuoteLine.length > 0 && selectedQuoteLine[0].IsDeleted == false) {
            SeaOttersSvc.GetAllUnBOMProcessForQuote(selectedQuoteLine[0].QuoteLineID, selectedQuoteLine[0].Part.PartID).then(function (data) {

                $scope.unsavedBOMProcesses = data.data.Results.Data;

                var modalInstance = SeaOttersSvc.ShowQuoteLineProcessModal($scope.pageConfig, $scope.UOMList, $scope.unsavedBOMProcesses, selectedQuoteLine[0].Part.PartID, selectedQuoteLine[0].Part.PartNumber, $rootScope.UserDetail.Language, QuoteLineProcessCtrl);
                modalInstance.result.then(function (quoteLineProcesses) {

                    var ctr = $scope.quote.QuoteLineProcessList.length;
                    for (var i = 0; i < quoteLineProcesses.length; i++) {
                        var isFound = false;
                        for (j = 0; j < $scope.quote.QuoteLineProcessList.length; j++) {
                            var quoteLineProcess = $scope.quote.QuoteLineProcessList[j];
                            if (quoteLineProcess.Part.PartNumber === quoteLineProcesses[i].Part.PartNumber && Number(quoteLineProcess.Process.ID) === Number(quoteLineProcesses[i].Process.ID)) {
                                isFound = true;
                                break;
                            }
                        }
                        if (!isFound) {
                            ctr += 1;
                            quoteLineProcesses[i].QuoteLineProcessID = ctr;
                            $scope.filteredQuoteLineProcess.push(quoteLineProcesses[i]);
                            $scope.quote.QuoteLineProcessList.push(quoteLineProcesses[i]);
                        }
                    }
                    CalculateQuoteLineTotals(selectedQuoteLine[0]);
                    CalculateQuoteTotals();

                });
            });
        }
        else {
            SeaOttersSvc.ShowAlert(17, 1, [{ key: '[action]', value: 'edit' }]);
        }
        $scope.quoteLineProcessGridAPI.selection.clearSelectedRows();
    };

    $scope.DeleteQuoteLineProcess = function () {

        var selectedProcesses = [];

        $('input:checkbox[name=chkDeleteBOMProcessAdd]').each(function () {
            if ($(this).is(':checked')) {
                var selectedProcess = { QuoteLineProcessID: $(this).val() };
                selectedProcesses.push(selectedProcess);
            }
        });

        if (selectedProcesses.length != 0) {
            for (var i = 0; i < selectedProcesses.length; i++) {

                $scope.filteredQuoteLineProcess.filter(function (obj) {
                    if (obj.QuoteLineProcessID === Number(selectedProcesses[i].QuoteLineProcessID)) {
                        $scope.filteredQuoteLineProcess.splice($scope.filteredQuoteLineProcess.indexOf(obj), 1);
                    }
                });

                $scope.quote.QuoteLineProcessList.filter(function (obj) {
                    if (obj.QuoteLineProcessID === Number(selectedProcesses[i].QuoteLineProcessID)) {
                        $scope.quote.QuoteLineProcessList.splice($scope.quote.QuoteLineProcessList.indexOf(obj), 1);
                    }
                });
            }

            var selectedQuoteLine = $scope.quoteLineGridAPI.selection.getSelectedRows();
            if (selectedQuoteLine != '') {
                CalculateQuoteLineTotals(selectedQuoteLine[0]);
                CalculateQuoteTotals();
            }
        }
        else {
            SeaOttersSvc.ShowAlert(17, 1, [{ key: '[action]', value: 'delete' }]);
        }
    };

    $scope.ShowQuoteLineBOMPart = function () {
        var selectedQuoteLine = $scope.quoteLineGridAPI.selection.getSelectedRows();
        if (selectedQuoteLine != '') {
            var qlBOMPartID = selectedQuoteLine[0].Part.PartID;
            var existingquoteLineBP = $scope.quote.QuoteLineBOMPartList;
            $scope.filteredQuoteLineBOMPart = [];
            if (qlBOMPartID != 0) {
                $.each(existingquoteLineBP, function (key, value) {
                    if (value.Part.PartID === qlBOMPartID)
                        $scope.filteredQuoteLineBOMPart.push(value);
                });
            }
            else {
                $scope.filteredQuoteLineBOMPart = [];
            }
        }
        else {
            $scope.filteredQuoteLineBOMPart = [];
            SeaOttersSvc.ShowAlert(17, 1, [{ key: '[action]', value: 'add' }]);
        }
    };

    var UnSavedBOMPartsCtrl = function ($scope, $modalInstance, pageConfig, unsavedbomParts, bompartsCombo, SelectedPart) {
        $scope.pageConfig = pageConfig;
        $scope.unsavedbomParts = unsavedbomParts;
        $scope.bompartsCombo = bompartsCombo;
        $scope.SelectedPart = SelectedPart;
        $scope.selectedBOMs = [];

        $scope.filterUnSavedBOMPart = '';

        $scope.LabelName = function (fieldName, tableName) {
            if ($scope.pageConfig) {
                var language = $scope.pageConfig.filter(function (obj) {
                    if (obj.TableFieldName === fieldName && obj.TableName === tableName)
                        return obj;
                })[0];

                if ($rootScope.UserDetail && $rootScope.UserDetail.Language.toLowerCase() == 'Chinese'.toLowerCase()) {
                    return language.CustomFieldNameForChinese;
                }
                return language.CustomFieldNameForEnglish;
            }
        };

        $scope.SaveUnBOMPart = function () {
            $('input:checkbox[name=chkBOMPartAdd]').each(function () {
                if ($(this).is(':checked')) {
                    var chkID = $(this).val();
                    var param =
                        {
                            Part: { PartID: $scope.SelectedPart.PartID, PartNumber: $scope.SelectedPart.PartNumber, },
                            BOMPart: {
                                PartID: chkID,
                                PartNumber: $('#txtPartNumber' + chkID)[0].innerHTML,
                                PartFamily: { PartFamilyName: $('#txtPartFamilyName' + chkID)[0].innerHTML },
                                PartType: { Type: $('#txtPartTypeName' + chkID)[0].innerHTML },
                                UOM: { Name: $('#txtUOMName' + chkID)[0].innerHTML }
                            },
                            PartStandardCost: $('#txtStandardPrice' + chkID)[0].innerHTML,
                            PartAverageQty: $('#txtAverageQtyPer' + chkID).val()
                        };
                    $scope.selectedBOMs.push(param);
                }
            });
            if ($scope.selectedBOMs.length != 0) {
                $modalInstance.close($scope.selectedBOMs);
            }
        };
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    };

    $scope.AddQuoteLineBOM = function () {
        $scope.childRecord = true;
        var selectedQuoteLine = $scope.quoteLineGridAPI.selection.getSelectedRows();
        if (selectedQuoteLine.length > 0 && selectedQuoteLine[0].IsDeleted == false) {

            quoteLine = selectedQuoteLine[0];

            SeaOttersSvc.GetAllBOMedParts(1).then(function (data) {
                if (data.data.Results != null) {

                    $scope.bompartsCombo = data.data.Results.Data;

                    $scope.SelectedPart = { PartID: selectedQuoteLine[0].Part.PartID, PartNumber: selectedQuoteLine[0].Part.PartNumber };

                    SeaOttersSvc.GetAllQuoteLineUnBOMedParts(selectedQuoteLine[0].Part.PartID, selectedQuoteLine[0].QuoteLineID).then(function (data) {

                        if (data.data.Results != null) {
                            $scope.unsavedbomParts = data.data.Results.Data;
                            var modalInstance = SeaOttersSvc.ShowQuoteLineBOMPart($scope.pageConfig, UnSavedBOMPartsCtrl, $scope.unsavedbomParts, $scope.bompartsCombo, $scope.SelectedPart);
                            modalInstance.result.then(function (quoteLineBOMs) {

                                var ctr = $scope.quote.QuoteLineBOMPartList.length;

                                for (var i = 0; i < quoteLineBOMs.length; i++) {
                                    var isFound = false;
                                    for (j = 0; j < $scope.quote.QuoteLineBOMPartList.length; j++) {
                                        var quoteLineBOM = $scope.quote.QuoteLineBOMPartList[j];
                                        if (quoteLineBOM.Part.PartNumber === quoteLineBOMs[i].Part.PartNumber && Number(quoteLineBOM.BOMPart.PartID) === Number(quoteLineBOMs[i].BOMPart.PartID)) {
                                            isFound = true;
                                            break;
                                        }
                                    }
                                    if (!isFound) {
                                        ctr += 1;
                                        quoteLineBOMs[i].QuoteLineBOMPartID = ctr;
                                        $scope.filteredQuoteLineBOMPart.push(quoteLineBOMs[i]);
                                        $scope.quote.QuoteLineBOMPartList.push(quoteLineBOMs[i]);
                                    }
                                }
                                CalculateQuoteLineTotals(quoteLine);
                                CalculateQuoteTotals();
                            });
                        }
                        else {
                            SeaOttersSvc.ShowAlert(20, 0, {});
                        }
                    });
                }
                else {
                    SeaOttersSvc.ShowAlert(20, 0, {});
                }
            });

        } else {
            SeaOttersSvc.ShowAlert(17, 1, [{ key: '[action]', value: 'add' }]);
        }
    };

    $scope.DeleteQuoteLineBOM = function () {

        var selectedBOMParts = [];

        $('input:checkbox[name=chkDeleteBOMPartAdd]').each(function () {
            if ($(this).is(':checked')) {
                var selectedBOMPart = { QuoteLineBOMPartID: $(this).val() };
                selectedBOMParts.push(selectedBOMPart);
            }
        });

        if (selectedBOMParts.length != 0) {
            for (var i = 0; i < selectedBOMParts.length; i++) {

                $scope.filteredQuoteLineBOMPart.filter(function (obj) {
                    if (obj.QuoteLineBOMPartID === Number(selectedBOMParts[i].QuoteLineBOMPartID)) {
                        $scope.filteredQuoteLineBOMPart.splice($scope.filteredQuoteLineBOMPart.indexOf(obj), 1);
                    }
                });

                $scope.quote.QuoteLineBOMPartList.filter(function (obj) {
                    if (obj.QuoteLineBOMPartID === Number(selectedBOMParts[i].QuoteLineBOMPartID)) {
                        $scope.quote.QuoteLineBOMPartList.splice($scope.quote.QuoteLineBOMPartList.indexOf(obj), 1);
                    }
                });
            }

            var selectedQuoteLine = $scope.quoteLineGridAPI.selection.getSelectedRows();
            if (selectedQuoteLine.length > 0 && selectedQuoteLine[0].IsDeleted == false) {
                quoteLine = selectedQuoteLine[0];
                CalculateQuoteLineTotals(quoteLine);
                CalculateQuoteTotals();
            }
        }
        else {
            SeaOttersSvc.ShowAlert(17, 1, [{ key: '[action]', value: 'delete' }]);
        }
    };

    $scope.ShowQuoteLineTaxHeads = function () {
        var selectedQuoteLine = $scope.quoteLineGridAPI.selection.getSelectedRows();
        if (selectedQuoteLine != '') {
            $scope.QuoteLineID = selectedQuoteLine[0].QuoteLineID;

            var qlPartID = selectedQuoteLine[0].Part.PartID;
            var existingquoteLineTaxHeads = $scope.quote.QuoteLineTaxHeadsList;
            $scope.filteredQuoteLineTaxHeads = [];
            if (qlPartID != 0) {
                $.each(existingquoteLineTaxHeads, function (key, value) {
                    if (value.Part.PartID === qlPartID)
                        $scope.filteredQuoteLineTaxHeads.push(value);
                });
            }
            else {
                $scope.filteredQuoteLineTaxHeads = [];
            }
        }
        else {
            $scope.filteredQuoteLineTaxHeads = [];
            SeaOttersSvc.ShowAlert(17, 1, [{ key: '[action]', value: 'add' }]);
        }
    };

    var QuoteLineTaxesCtrl = function ($scope, $modalInstance, pageConfig, unsavedTaxes, partID, partNumber, userLanguage) {
        $scope.PartNumber = partNumber;
        $scope.PartID = partID;
        $scope.pageConfig = pageConfig;
        $scope.unsavedTaxes = unsavedTaxes;
        $scope.userLanguage = userLanguage;
        $scope.selectedTaxes = []

        $scope.LabelName = function (fieldName, tableName) {
            if ($scope.pageConfig) {
                var language = $scope.pageConfig.filter(function (obj) {
                    if (obj.TableFieldName === fieldName && obj.TableName === tableName)
                        return obj;
                })[0];

                if ($scope.userLanguage.toLowerCase() == 'Chinese'.toLowerCase()) {
                    return language.CustomFieldNameForChinese;
                }
                return language.CustomFieldNameForEnglish;
            }
        };

        $scope.SaveTaxes = function () {
            $('input:checkbox[name=chkDeleteBOMProcessAdd]').each(function () {
                if ($(this).is(':checked')) {
                    var chkID = $(this).val();
                    var param =
                        {
                            Part: { PartID: $scope.PartID, PartNumber: $scope.PartNumber, },
                            TaxHeads: {
                                TaxHeadsID: chkID,
                                TAXName: $('#txtTAXName' + chkID)[0].innerHTML,
                                TAXCode: $('#txtTAXCode' + chkID)[0].innerHTML,
                                TAXPC: $('#txtTAXPC' + chkID)[0].innerHTML
                            }
                        };
                    $scope.selectedTaxes.push(param);
                }
            });
            if ($scope.selectedTaxes.length != 0) {
                $modalInstance.close($scope.selectedTaxes);
            }
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    };

    $scope.AddQuoteLineTaxes = function () {
        var selectedQuoteLine = $scope.quoteLineGridAPI.selection.getSelectedRows();
        if (selectedQuoteLine.length > 0 && selectedQuoteLine[0].IsDeleted == false) {
            quoteLine = selectedQuoteLine[0];
            var modalInstance = SeaOttersSvc.ShowQuoteLineTaxesModal($scope.pageConfig, $scope.taxHeadsList, selectedQuoteLine[0].Part.PartID, selectedQuoteLine[0].Part.PartNumber, $rootScope.UserDetail.Language, QuoteLineTaxesCtrl);
            modalInstance.result.then(function (quoteLineTaxHeads) {

                var ctr = $scope.quote.QuoteLineTaxHeadsList.length;

                for (var i = 0; i < quoteLineTaxHeads.length; i++) {
                    var isFound = false;
                    for (j = 0; j < $scope.quote.QuoteLineTaxHeadsList.length; j++) {
                        var quoteLineTaxHead = $scope.quote.QuoteLineTaxHeadsList[j];
                        if (quoteLineTaxHead.Part.PartNumber === quoteLineTaxHeads[i].Part.PartNumber && Number(quoteLineTaxHead.TaxHeads.TaxHeadsID) === Number(quoteLineTaxHeads[i].TaxHeads.TaxHeadsID)) {
                            isFound = true;
                            break;
                        }
                    }
                    if (!isFound) {
                        ctr += 1;
                        quoteLineTaxHeads[i].QuoteLineTaxHeadsID = ctr;
                        $scope.filteredQuoteLineTaxHeads.push(quoteLineTaxHeads[i]);
                        $scope.quote.QuoteLineTaxHeadsList.push(quoteLineTaxHeads[i]);
                    }
                }
                CalculateQuoteLineTotals(quoteLine);
                CalculateQuoteTotals();
            });
        }
        else {
            SeaOttersSvc.ShowAlert(17, 1, [{ key: '[action]', value: 'edit' }]);
        }
        $scope.quoteLineProcessGridAPI.selection.clearSelectedRows();
    };

    $scope.DeleteQuoteLineTaxes = function () {

        var selectedTaxes = [];

        $('input:checkbox[name=chkDeleteTaxHeadsAdd]').each(function () {
            if ($(this).is(':checked')) {
                var selectedTax = { QuoteLineTaxHeadsID: $(this).val() };
                selectedTaxes.push(selectedTax);
            }
        });

        if (selectedTaxes.length != 0) {
            for (var i = 0; i < selectedTaxes.length; i++) {

                $scope.filteredQuoteLineTaxHeads.filter(function (obj) {
                    if (obj.QuoteLineTaxHeadsID === Number(selectedTaxes[i].QuoteLineTaxHeadsID)) {
                        $scope.filteredQuoteLineTaxHeads.splice($scope.filteredQuoteLineTaxHeads.indexOf(obj), 1);
                    }
                });

                $scope.quote.QuoteLineTaxHeadsList.filter(function (obj) {
                    if (obj.QuoteLineTaxHeadsID === Number(selectedTaxes[i].QuoteLineTaxHeadsID)) {
                        $scope.quote.QuoteLineTaxHeadsList.splice($scope.quote.QuoteLineTaxHeadsList.indexOf(obj), 1);
                    }
                });
            }

            var selectedQuoteLine = $scope.quoteLineGridAPI.selection.getSelectedRows();
            if (selectedQuoteLine.length > 0 && selectedQuoteLine[0].IsDeleted == false) {
                quoteLine = selectedQuoteLine[0];
                CalculateQuoteLineTotals(quoteLine);
                CalculateQuoteTotals();
            }
        }
        else {
            SeaOttersSvc.ShowAlert(17, 1, [{ key: '[action]', value: 'delete' }]);
        }
    };

    var QuoteLineFreightCtrl = function ($scope, $modalInstance, pageConfig, freightList, partID, partNumber, userLanguage) {
        $scope.PartNumber = partNumber;
        $scope.PartID = partID;
        $scope.pageConfig = pageConfig;
        $scope.freightList = freightList;
        $scope.userLanguage = userLanguage;

        $scope.selectedFreights = [];

        $scope.LabelName = function (fieldName, tableName) {
            if ($scope.pageConfig) {
                var language = $scope.pageConfig.filter(function (obj) {
                    if (obj.TableFieldName === fieldName && obj.TableName === tableName)
                        return obj;
                })[0];

                if ($scope.userLanguage.toLowerCase() == 'Chinese'.toLowerCase()) {
                    return language.CustomFieldNameForChinese;
                }
                return language.CustomFieldNameForEnglish;
            }
        };

        $scope.SaveFreight = function () {
            $('input:checkbox[name=chkDeleteBOMProcessAdd]').each(function () {
                if ($(this).is(':checked')) {
                    var chkID = $(this).val();
                    var param =
                        {
                            Part: { PartID: $scope.PartID, PartNumber: $scope.PartNumber, },
                            Freight: {
                                FreightID: chkID,
                                FreightCode: $('#txtFreightCode' + chkID)[0].innerHTML,
                                FreightName: $('#txtFreightName' + chkID)[0].innerHTML,
                                FreightCost: $('#txtFreightCost' + chkID)[0].innerHTML,
                                FreightCostMultiplierValue: $('#txtFreightCostMultiplierValue' + chkID)[0].innerHTML
                            },
                            FreightPC: $('#txtFreightPC' + chkID).val()
                        };
                    $scope.selectedFreights.push(param);
                }
            });
            if ($scope.selectedFreights.length != 0) {
                $modalInstance.close($scope.selectedFreights);
            }
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    };

    $scope.ShowQuoteLineFreights = function () {
        var selectedQuoteLine = $scope.quoteLineGridAPI.selection.getSelectedRows();
        if (selectedQuoteLine != '') {
            $scope.QuoteLineID = selectedQuoteLine[0].QuoteLineID;

            var qlPartID = selectedQuoteLine[0].Part.PartID;
            var existingquoteLineFreights = $scope.quote.QuoteLineFreightList;
            $scope.filteredQuoteLineFreights = [];
            if (qlPartID != 0) {
                $.each(existingquoteLineFreights, function (key, value) {
                    if (value.Part.PartID === qlPartID)
                        $scope.filteredQuoteLineFreights.push(value);
                });
            }
            else {
                $scope.filteredQuoteLineFreights = [];
            }
        }
        else {
            $scope.filteredQuoteLineFreights = [];
            SeaOttersSvc.ShowAlert(17, 1, [{ key: '[action]', value: 'add' }]);
        }
    };

    $scope.AddQuoteLineFreight = function () {
        var selectedQuoteLine = $scope.quoteLineGridAPI.selection.getSelectedRows();
        if (selectedQuoteLine.length > 0 && selectedQuoteLine[0].IsDeleted == false) {
            quoteLine = selectedQuoteLine[0];
            var modalInstance = SeaOttersSvc.ShowQuoteLineFreightModal($scope.pageConfig, $scope.freightList, selectedQuoteLine[0].Part.PartID, selectedQuoteLine[0].Part.PartNumber, $rootScope.UserDetail.Language, QuoteLineFreightCtrl);
            modalInstance.result.then(function (quoteLineFreights) {

                var ctr = $scope.quote.QuoteLineFreightList.length;
                for (var i = 0; i < quoteLineFreights.length; i++) {
                    var isFound = false;
                    for (j = 0; j < $scope.quote.QuoteLineFreightList.length; j++) {
                        var quoteLineFreight = $scope.quote.QuoteLineFreightList[j];
                        if (quoteLineFreight.Part.PartNumber === quoteLineFreights[i].Part.PartNumber && Number(quoteLineFreight.Freight.FreightID) === Number(quoteLineFreights[i].Freight.FreightID)) {
                            isFound = true;
                            break;
                        }
                    }
                    if (!isFound) {
                        ctr += 1;
                        quoteLineFreights[i].QuoteLineFreightID = ctr;
                        $scope.filteredQuoteLineFreights.push(quoteLineFreights[i]);
                        $scope.quote.QuoteLineFreightList.push(quoteLineFreights[i]);
                    }
                }
                CalculateQuoteLineTotals(quoteLine);
                CalculateQuoteTotals();
            });
        }
        else {
            SeaOttersSvc.ShowAlert(17, 1, [{ key: '[action]', value: 'edit' }]);
        }
        $scope.quoteLineProcessGridAPI.selection.clearSelectedRows();
    };

    $scope.DeleteQuoteLineFreight = function () {

        var selectedFreights = [];

        $('input:checkbox[name=chkDeleteFreightAdd]').each(function () {
            if ($(this).is(':checked')) {
                var selectedFreight = { QuoteLineFreightID: $(this).val() };
                selectedFreights.push(selectedFreight);
            }
        });

        if (selectedFreights.length != 0) {
            for (var i = 0; i < selectedFreights.length; i++) {

                $scope.filteredQuoteLineFreights.filter(function (obj) {
                    if (obj.QuoteLineFreightID === Number(selectedFreights[i].QuoteLineFreightID)) {
                        $scope.filteredQuoteLineFreights.splice($scope.filteredQuoteLineFreights.indexOf(obj), 1);
                    }
                });

                $scope.quote.QuoteLineFreightList.filter(function (obj) {
                    if (obj.QuoteLineFreightID === Number(selectedFreights[i].QuoteLineFreightID)) {
                        $scope.quote.QuoteLineFreightList.splice($scope.quote.QuoteLineFreightList.indexOf(obj), 1);
                    }
                });
            }

            var selectedQuoteLine = $scope.quoteLineGridAPI.selection.getSelectedRows();
            if (selectedQuoteLine.length > 0 && selectedQuoteLine[0].IsDeleted == false) {
                quoteLine = selectedQuoteLine[0];
                CalculateQuoteLineTotals(quoteLine);
                CalculateQuoteTotals();
            }
        }
        else {
            SeaOttersSvc.ShowAlert(17, 1, [{ key: '[action]', value: 'delete' }]);
        }
    };

    var QuoteLineWarehouseCtrl = function ($scope, $modalInstance, pageConfig, warehouseList, partID, partNumber, userLanguage) {
        $scope.PartNumber = partNumber;
        $scope.PartID = partID;
        $scope.pageConfig = pageConfig;
        $scope.warehouseList = warehouseList;
        $scope.userLanguage = userLanguage;

        $scope.selectedWarehouses = [];

        $scope.LabelName = function (fieldName, tableName) {
            if ($scope.pageConfig) {
                var language = $scope.pageConfig.filter(function (obj) {
                    if (obj.TableFieldName === fieldName && obj.TableName === tableName)
                        return obj;
                })[0];

                if ($scope.userLanguage.toLowerCase() == 'Chinese'.toLowerCase()) {
                    return language.CustomFieldNameForChinese;
                }
                return language.CustomFieldNameForEnglish;
            }
        };

        $scope.SaveWarehouses = function () {
            $('input:checkbox[name=chkDeleteBOMProcessAdd]').each(function () {
                if ($(this).is(':checked')) {
                    var chkID = $(this).val();
                    var param =
                        {
                            Part: { PartID: $scope.PartID, PartNumber: $scope.PartNumber, },
                            Warehouse: {
                                WarehouseID: chkID,
                                WarehouseCode: $('#txtWarehouseCode' + chkID)[0].innerHTML,
                                WarehouseName: $('#txtWarehouseName' + chkID)[0].innerHTML,
                                WarehouseCost: $('#txtWarehouseCost' + chkID)[0].innerHTML,
                                WarehouseCostMultiplierValue: $('#txtWarehouseCostMultiplierValue' + chkID)[0].innerHTML
                            },
                            WarehousePC: $('#txtWarehousePC' + chkID).val()
                        };
                    $scope.selectedWarehouses.push(param);
                }
            });
            if ($scope.selectedWarehouses.length != 0) {
                $modalInstance.close($scope.selectedWarehouses);
            }
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    };

    $scope.ShowQuoteLineWarehouses = function () {
        var selectedQuoteLine = $scope.quoteLineGridAPI.selection.getSelectedRows();
        if (selectedQuoteLine != '') {
            $scope.QuoteLineID = selectedQuoteLine[0].QuoteLineID;

            var qlPartID = selectedQuoteLine[0].Part.PartID;
            var existingquoteLineWarehouses = $scope.quote.QuoteLineWarehouseList;
            $scope.filteredQuoteLineWarehouses = [];
            if (qlPartID != 0) {
                $.each(existingquoteLineWarehouses, function (key, value) {
                    if (value.Part.PartID === qlPartID)
                        $scope.filteredQuoteLineWarehouses.push(value);
                });
            }
            else {
                $scope.filteredQuoteLineWarehouses = [];
            }
        }
        else {
            $scope.filteredQuoteLineWarehouses = [];
            SeaOttersSvc.ShowAlert(17, 1, [{ key: '[action]', value: 'add' }]);
        }
    };

    $scope.AddQuoteLineWarehouse = function () {
        var selectedQuoteLine = $scope.quoteLineGridAPI.selection.getSelectedRows();
        if (selectedQuoteLine.length > 0 && selectedQuoteLine[0].IsDeleted == false) {
            quoteLine = selectedQuoteLine[0];
            var modalInstance = SeaOttersSvc.ShowQuoteLineWarehouseModal($scope.pageConfig, $scope.warehouseList, selectedQuoteLine[0].Part.PartID, selectedQuoteLine[0].Part.PartNumber, $rootScope.UserDetail.Language, QuoteLineWarehouseCtrl);
            modalInstance.result.then(function (quoteLineWarehouses) {

                var ctr = $scope.quote.QuoteLineWarehouseList.length;
                for (var i = 0; i < quoteLineWarehouses.length; i++) {
                    var isFound = false;
                    for (j = 0; j < $scope.quote.QuoteLineWarehouseList.length; j++) {
                        var quoteLineWarehouse = $scope.quote.QuoteLineWarehouseList[j];
                        if (quoteLineWarehouse.Part.PartNumber === quoteLineWarehouses[i].Part.PartNumber && Number(quoteLineWarehouse.Warehouse.WarehouseID) === Number(quoteLineWarehouses[i].Warehouse.WarehouseID)) {
                            isFound = true;
                            break;
                        }
                    }
                    if (!isFound) {
                        ctr += 1;
                        quoteLineWarehouses[i].QuoteLineWarehouseID = ctr;
                        $scope.filteredQuoteLineWarehouses.push(quoteLineWarehouses[i]);
                        $scope.quote.QuoteLineWarehouseList.push(quoteLineWarehouses[i]);
                    }
                }
                CalculateQuoteLineTotals(quoteLine);
                CalculateQuoteTotals();
            });
        }
        else {
            SeaOttersSvc.ShowAlert(17, 1, [{ key: '[action]', value: 'edit' }]);
        }
        $scope.quoteLineProcessGridAPI.selection.clearSelectedRows();
    };

    $scope.DeleteQuoteLineWarehouse = function () {

        var selectedWarehouses = [];

        $('input:checkbox[name=chkDeleteWarehousesAdd]').each(function () {
            if ($(this).is(':checked')) {
                var selectedWarehouse = { QuoteLineWarehouseID: $(this).val() };
                selectedWarehouses.push(selectedWarehouse);
            }
        });

        if (selectedWarehouses.length != 0) {
            for (var i = 0; i < selectedWarehouses.length; i++) {

                $scope.filteredQuoteLineWarehouses.filter(function (obj) {
                    if (obj.QuoteLineWarehouseID === Number(selectedWarehouses[i].QuoteLineWarehouseID)) {
                        $scope.filteredQuoteLineWarehouses.splice($scope.filteredQuoteLineWarehouses.indexOf(obj), 1);
                    }
                });

                $scope.quote.QuoteLineWarehouseList.filter(function (obj) {
                    if (obj.QuoteLineWarehouseID === Number(selectedWarehouses[i].QuoteLineWarehouseID)) {
                        $scope.quote.QuoteLineWarehouseList.splice($scope.quote.QuoteLineWarehouseList.indexOf(obj), 1);
                    }
                });
            }


            var selectedQuoteLine = $scope.quoteLineGridAPI.selection.getSelectedRows();
            if (selectedQuoteLine.length > 0 && selectedQuoteLine[0].IsDeleted == false) {
                quoteLine = selectedQuoteLine[0];
                CalculateQuoteLineTotals(quoteLine);
                CalculateQuoteTotals();
            }
        }
        else {
            SeaOttersSvc.ShowAlert(17, 1, [{ key: '[action]', value: 'delete' }]);
        }
    };

    var QuoteLinePackingCtrl = function ($scope, $modalInstance, pageConfig, packingList, partID, partNumber, userLanguage) {
        $scope.PartNumber = partNumber;
        $scope.PartID = partID;
        $scope.pageConfig = pageConfig;
        $scope.packingList = packingList;
        $scope.userLanguage = userLanguage;

        $scope.selectedPackings = [];

        $scope.LabelName = function (fieldName, tableName) {
            if ($scope.pageConfig) {
                var language = $scope.pageConfig.filter(function (obj) {
                    if (obj.TableFieldName === fieldName && obj.TableName === tableName)
                        return obj;
                })[0];

                if ($scope.userLanguage.toLowerCase() == 'Chinese'.toLowerCase()) {
                    return language.CustomFieldNameForChinese;
                }
                return language.CustomFieldNameForEnglish;
            }
        };

        $scope.SavePacking = function () {
            $('input:checkbox[name=chkDeleteBOMProcessAdd]').each(function () {
                if ($(this).is(':checked')) {
                    var chkID = $(this).val();
                    var param =
                        {
                            Part: { PartID: $scope.PartID, PartNumber: $scope.PartNumber, },
                            Packing: {
                                PackingID: chkID,
                                PackingCode: $('#txtPackingCode' + chkID)[0].innerHTML,
                                PackingName: $('#txtPackingName' + chkID)[0].innerHTML,
                                PackingCost: $('#txtPackingCost' + chkID)[0].innerHTML,
                                PackingCostMultiplierValue: $('#txtPackingCostMultiplierValue' + chkID)[0].innerHTML
                            },
                            PackingPC: $('#txtPackingPC' + chkID).val()
                        };
                    $scope.selectedPackings.push(param);
                }
            });
            if ($scope.selectedPackings.length != 0) {
                $modalInstance.close($scope.selectedPackings);
            }
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    };

    $scope.ShowQuoteLinePackings = function () {
        var selectedQuoteLine = $scope.quoteLineGridAPI.selection.getSelectedRows();
        if (selectedQuoteLine != '') {
            $scope.QuoteLineID = selectedQuoteLine[0].QuoteLineID;

            var qlPartID = selectedQuoteLine[0].Part.PartID;
            var existingquoteLinePackings = $scope.quote.QuoteLinePackingList;
            $scope.filteredQuoteLinePackings = [];
            if (qlPartID != 0) {
                $.each(existingquoteLinePackings, function (key, value) {
                    if (value.Part.PartID === qlPartID)
                        $scope.filteredQuoteLinePackings.push(value);
                });
            }
            else {
                $scope.filteredQuoteLinePackings = [];
            }
        }
        else {
            $scope.filteredQuoteLinePackings = [];
            SeaOttersSvc.ShowAlert(17, 1, [{ key: '[action]', value: 'add' }]);
        }
    };

    $scope.AddQuoteLinePacking = function () {
        var selectedQuoteLine = $scope.quoteLineGridAPI.selection.getSelectedRows();

        if (selectedQuoteLine.length > 0 && selectedQuoteLine[0].IsDeleted == false) {
            quoteLine = selectedQuoteLine[0];
            var modalInstance = SeaOttersSvc.ShowQuoteLinePackingModal($scope.pageConfig, $scope.packingList, selectedQuoteLine[0].Part.PartID, selectedQuoteLine[0].Part.PartNumber, $rootScope.UserDetail.Language, QuoteLinePackingCtrl);
            modalInstance.result.then(function (quoteLinePackings) {

                var ctr = $scope.quote.QuoteLinePackingList.length;
                for (var i = 0; i < quoteLinePackings.length; i++) {
                    var isFound = false;
                    for (j = 0; j < $scope.quote.QuoteLinePackingList.length; j++) {
                        var quoteLinePacking = $scope.quote.QuoteLinePackingList[j];
                        if (quoteLinePacking.Part.PartNumber === quoteLinePackings[i].Part.PartNumber && Number(quoteLinePacking.Packing.PackingID) === Number(quoteLinePackings[i].Packing.PackingID)) {
                            isFound = true;
                            break;
                        }
                    }
                    if (!isFound) {
                        ctr += 1;
                        quoteLinePackings[i].QuoteLinePackingID = ctr;
                        $scope.filteredQuoteLinePackings.push(quoteLinePackings[i]);
                        $scope.quote.QuoteLinePackingList.push(quoteLinePackings[i]);
                    }
                }
                CalculateQuoteLineTotals(quoteLine);
                CalculateQuoteTotals();
            });
        }
        else {
            SeaOttersSvc.ShowAlert(17, 1, [{ key: '[action]', value: 'edit' }]);
        }
        $scope.quoteLineProcessGridAPI.selection.clearSelectedRows();
    };

    $scope.DeleteQuoteLinePacking = function () {

        var selectedPackings = [];

        $('input:checkbox[name=chkDeletePackingsAdd]').each(function () {
            if ($(this).is(':checked')) {
                var selectedPacking = { QuoteLinePackingID: $(this).val() };
                selectedPackings.push(selectedPacking);
            }
        });

        if (selectedPackings.length != 0) {
            for (var i = 0; i < selectedPackings.length; i++) {

                $scope.filteredQuoteLinePackings.filter(function (obj) {
                    if (obj.QuoteLinePackingID === Number(selectedPackings[i].QuoteLinePackingID)) {
                        $scope.filteredQuoteLinePackings.splice($scope.filteredQuoteLinePackings.indexOf(obj), 1);
                    }
                });

                $scope.quote.QuoteLinePackingList.filter(function (obj) {
                    if (obj.QuoteLinePackingID === Number(selectedPackings[i].QuoteLinePackingID)) {
                        $scope.quote.QuoteLinePackingList.splice($scope.quote.QuoteLinePackingList.indexOf(obj), 1);
                    }
                });
            }

            var selectedQuoteLine = $scope.quoteLineGridAPI.selection.getSelectedRows();
            if (selectedQuoteLine.length > 0 && selectedQuoteLine[0].IsDeleted == false) {
                quoteLine = selectedQuoteLine[0];
                CalculateQuoteLineTotals(quoteLine);
                CalculateQuoteTotals();
            }
        }
        else {
            SeaOttersSvc.ShowAlert(17, 1, [{ key: '[action]', value: 'delete' }]);
        }
    };

    var QuoteLineInsuranceCtrl = function ($scope, $modalInstance, pageConfig, insuranceList, partID, partNumber, userLanguage) {
        $scope.PartNumber = partNumber;
        $scope.PartID = partID;
        $scope.pageConfig = pageConfig;
        $scope.insuranceList = insuranceList;
        $scope.userLanguage = userLanguage;

        $scope.selectedInsurances = [];

        $scope.LabelName = function (fieldName, tableName) {
            if ($scope.pageConfig) {
                var language = $scope.pageConfig.filter(function (obj) {
                    if (obj.TableFieldName === fieldName && obj.TableName === tableName)
                        return obj;
                })[0];

                if ($scope.userLanguage.toLowerCase() == 'Chinese'.toLowerCase()) {
                    return language.CustomFieldNameForChinese;
                }
                return language.CustomFieldNameForEnglish;
            }
        };

        $scope.SaveInsurances = function () {
            $('input:checkbox[name=chkDeleteBOMProcessAdd]').each(function () {
                if ($(this).is(':checked')) {
                    var chkID = $(this).val();
                    var param =
                        {
                            Part: { PartID: $scope.PartID, PartNumber: $scope.PartNumber, },
                            Insurance: {
                                InsuranceID: chkID,
                                InsuranceCode: $('#txtInsuranceCode' + chkID)[0].innerHTML,
                                InsuranceName: $('#txtInsuranceName' + chkID)[0].innerHTML,
                                InsuranceCost: $('#txtInsuranceCost' + chkID)[0].innerHTML,
                                InsuranceCostMultiplierValue: $('#txtInsuranceCostMultiplierValue' + chkID)[0].innerHTML
                            },
                            InsurancePC: $('#txtInsurancePC' + chkID).val()
                        };
                    $scope.selectedInsurances.push(param);
                }
            });
            if ($scope.selectedInsurances.length != 0) {
                $modalInstance.close($scope.selectedInsurances);
            }
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    };

    $scope.ShowQuoteLineInsurances = function () {
        var selectedQuoteLine = $scope.quoteLineGridAPI.selection.getSelectedRows();
        if (selectedQuoteLine != '') {
            $scope.QuoteLineID = selectedQuoteLine[0].QuoteLineID;

            var qlPartID = selectedQuoteLine[0].Part.PartID;
            var existingquoteLineInsurances = $scope.quote.QuoteLineInsuranceList;
            $scope.filteredQuoteLineInsurances = [];
            if (qlPartID != 0) {
                $.each(existingquoteLineInsurances, function (key, value) {
                    if (value.Part.PartID === qlPartID)
                        $scope.filteredQuoteLineInsurances.push(value);
                });
            }
            else {
                $scope.filteredQuoteLineInsurances = [];
            }
        }
        else {
            $scope.filteredQuoteLineInsurances = [];
            SeaOttersSvc.ShowAlert(17, 1, [{ key: '[action]', value: 'add' }]);
        }
    };

    $scope.AddQuoteLineInsurance = function () {
        var selectedQuoteLine = $scope.quoteLineGridAPI.selection.getSelectedRows();
        if (selectedQuoteLine.length > 0 && selectedQuoteLine[0].IsDeleted == false) {
            quoteLine = selectedQuoteLine[0];
            var modalInstance = SeaOttersSvc.ShowQuoteLineInsuranceModal($scope.pageConfig, $scope.insuranceList, selectedQuoteLine[0].Part.PartID, selectedQuoteLine[0].Part.PartNumber, $rootScope.UserDetail.Language, QuoteLineInsuranceCtrl);
            modalInstance.result.then(function (quoteLineInsurances) {

                var ctr = $scope.quote.QuoteLineInsuranceList.length;
                for (var i = 0; i < quoteLineInsurances.length; i++) {
                    var isFound = false;
                    for (j = 0; j < $scope.quote.QuoteLineInsuranceList.length; j++) {
                        var quoteLineInsurance = $scope.quote.QuoteLineInsuranceList[j];
                        if (quoteLineInsurance.Part.PartNumber === quoteLineInsurances[i].Part.PartNumber && Number(quoteLineInsurance.Insurance.InsuranceID) === Number(quoteLineInsurances[i].Insurance.InsuranceID)) {
                            isFound = true;
                            break;
                        }
                    }
                    if (!isFound) {
                        ctr += 1;
                        quoteLineInsurances[i].QuoteLineInsuranceID = ctr;
                        $scope.filteredQuoteLineInsurances.push(quoteLineInsurances[i]);
                        $scope.quote.QuoteLineInsuranceList.push(quoteLineInsurances[i]);
                    }
                }
                CalculateQuoteLineTotals(quoteLine);
                CalculateQuoteTotals();
            });
        }
        else {
            SeaOttersSvc.ShowAlert(17, 1, [{ key: '[action]', value: 'edit' }]);
        }
        $scope.quoteLineProcessGridAPI.selection.clearSelectedRows();
    };

    $scope.DeleteQuoteLineInsurance = function () {

        var selectedInsurances = [];

        $('input:checkbox[name=chkDeleteInsurancesAdd]').each(function () {
            if ($(this).is(':checked')) {
                var selectedInsurance = { QuoteLineInsuranceID: $(this).val() };
                selectedInsurances.push(selectedInsurance);
            }
        });

        if (selectedInsurances.length != 0) {
            for (var i = 0; i < selectedInsurances.length; i++) {

                $scope.filteredQuoteLineInsurances.filter(function (obj) {
                    if (obj.QuoteLineInsuranceID === Number(selectedInsurances[i].QuoteLineInsuranceID)) {
                        $scope.filteredQuoteLineInsurances.splice($scope.filteredQuoteLineInsurances.indexOf(obj), 1);
                    }
                });

                $scope.quote.QuoteLineInsuranceList.filter(function (obj) {
                    if (obj.QuoteLineInsuranceID === Number(selectedInsurances[i].QuoteLineInsuranceID)) {
                        $scope.quote.QuoteLineInsuranceList.splice($scope.quote.QuoteLineInsuranceList.indexOf(obj), 1);
                    }
                });
            }

            var selectedQuoteLine = $scope.quoteLineGridAPI.selection.getSelectedRows();
            if (selectedQuoteLine.length > 0 && selectedQuoteLine[0].IsDeleted == false) {
                quoteLine = selectedQuoteLine[0];
                CalculateQuoteLineTotals(quoteLine);
                CalculateQuoteTotals();
            }
        }
        else {
            SeaOttersSvc.ShowAlert(17, 1, [{ key: '[action]', value: 'delete' }]);
        }
    };

    var QuoteLineSalesCostCtrl = function ($scope, $modalInstance, pageConfig, salesCostList, partID, partNumber, userLanguage) {
        $scope.PartNumber = partNumber;
        $scope.PartID = partID;
        $scope.pageConfig = pageConfig;
        $scope.salesCostList = salesCostList;
        $scope.userLanguage = userLanguage;

        $scope.selectedSalesCosts = [];

        $scope.LabelName = function (fieldName, tableName) {
            if ($scope.pageConfig) {
                var language = $scope.pageConfig.filter(function (obj) {
                    if (obj.TableFieldName === fieldName && obj.TableName === tableName)
                        return obj;
                })[0];

                if ($scope.userLanguage.toLowerCase() == 'Chinese'.toLowerCase()) {
                    return language.CustomFieldNameForChinese;
                }
                return language.CustomFieldNameForEnglish;
            }
        };

        $scope.SaveSalesCost = function () {
            $('input:checkbox[name=chkDeleteBOMProcessAdd]').each(function () {
                if ($(this).is(':checked')) {
                    var chkID = $(this).val();
                    var param =
                        {
                            Part: { PartID: $scope.PartID, PartNumber: $scope.PartNumber, },
                            SalesCost: {
                                SalesCostID: chkID,
                                SaleCostCode: $('#txtSaleCostCode' + chkID)[0].innerHTML,
                                SaleCostName: $('#txtSaleCostName' + chkID)[0].innerHTML,
                                SaleCost: $('#txtSaleCost' + chkID)[0].innerHTML,
                                SalesCostMultiplierValue: $('#txtSalesCostMultiplierValue' + chkID)[0].innerHTML
                            },
                            SalesCostPC: $('#txtSalesCostPC' + chkID).val()
                        };
                    $scope.selectedSalesCosts.push(param);
                }
            });
            if ($scope.selectedSalesCosts.length != 0) {
                $modalInstance.close($scope.selectedSalesCosts);
            }
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    };

    $scope.ShowQuoteLineSalesCosts = function () {
        var selectedQuoteLine = $scope.quoteLineGridAPI.selection.getSelectedRows();
        if (selectedQuoteLine != '') {
            $scope.QuoteLineID = selectedQuoteLine[0].QuoteLineID;

            var qlPartID = selectedQuoteLine[0].Part.PartID;
            var existingquoteLineSalesCosts = $scope.quote.QuoteLineSalesCostList;
            $scope.filteredQuoteLineSalesCosts = [];
            if (qlPartID != 0) {
                $.each(existingquoteLineSalesCosts, function (key, value) {
                    if (value.Part.PartID === qlPartID)
                        $scope.filteredQuoteLineSalesCosts.push(value);
                });
            }
            else {
                $scope.filteredQuoteLineSalesCosts = [];
            }
        }
        else {
            $scope.filteredQuoteLineSalesCosts = [];
            SeaOttersSvc.ShowAlert(17, 1, [{ key: '[action]', value: 'add' }]);
        }
    };

    $scope.AddQuoteLineSalesCost = function () {
        var selectedQuoteLine = $scope.quoteLineGridAPI.selection.getSelectedRows();
        if (selectedQuoteLine.length > 0 && selectedQuoteLine[0].IsDeleted == false) {
            quoteLine = selectedQuoteLine[0];
            var modalInstance = SeaOttersSvc.ShowQuoteLineSalesCostModal($scope.pageConfig, $scope.salesCostList, selectedQuoteLine[0].Part.PartID, selectedQuoteLine[0].Part.PartNumber, $rootScope.UserDetail.Language, QuoteLineSalesCostCtrl);
            modalInstance.result.then(function (quoteLineSalesCosts) {

                var ctr = $scope.quote.QuoteLineSalesCostList.length;
                for (var i = 0; i < quoteLineSalesCosts.length; i++) {
                    var isFound = false;
                    for (j = 0; j < $scope.quote.QuoteLineSalesCostList.length; j++) {
                        var quoteLineSalesCost = $scope.quote.QuoteLineSalesCostList[j];
                        if (quoteLineSalesCost.Part.PartNumber === quoteLineSalesCosts[i].Part.PartNumber && Number(quoteLineSalesCost.SalesCost.SalesCostID) === Number(quoteLineSalesCosts[i].SalesCost.SalesCostID)) {
                            isFound = true;
                            break;
                        }
                    }
                    if (!isFound) {
                        ctr += 1;
                        quoteLineSalesCosts[i].QuoteLineSalesCostID = ctr;
                        $scope.filteredQuoteLineSalesCosts.push(quoteLineSalesCosts[i]);
                        $scope.quote.QuoteLineSalesCostList.push(quoteLineSalesCosts[i]);
                    }
                }
                CalculateQuoteLineTotals(quoteLine);
                CalculateQuoteTotals();
            });
        }
        else {
            SeaOttersSvc.ShowAlert(17, 1, [{ key: '[action]', value: 'edit' }]);
        }
        $scope.quoteLineProcessGridAPI.selection.clearSelectedRows();
    };

    $scope.DeleteQuoteLineSalesCost = function () {

        var selectedSalesCosts = [];

        $('input:checkbox[name=chkDeleteSalesCostAdd]').each(function () {
            if ($(this).is(':checked')) {
                var selectedSalesCost = { QuoteLineSalesCostID: $(this).val() };
                selectedSalesCosts.push(selectedSalesCost);
            }
        });

        if (selectedSalesCosts.length != 0) {
            for (var i = 0; i < selectedSalesCosts.length; i++) {

                $scope.filteredQuoteLineSalesCosts.filter(function (obj) {
                    if (obj.QuoteLineSalesCostID === Number(selectedSalesCosts[i].QuoteLineSalesCostID)) {
                        $scope.filteredQuoteLineSalesCosts.splice($scope.filteredQuoteLineSalesCosts.indexOf(obj), 1);
                    }
                });

                $scope.quote.QuoteLineSalesCostList.filter(function (obj) {
                    if (obj.QuoteLineSalesCostID === Number(selectedSalesCosts[i].QuoteLineSalesCostID)) {
                        $scope.quote.QuoteLineSalesCostList.splice($scope.quote.QuoteLineSalesCostList.indexOf(obj), 1);
                    }
                });
            }

            var selectedQuoteLine = $scope.quoteLineGridAPI.selection.getSelectedRows();
            if (selectedQuoteLine.length > 0 && selectedQuoteLine[0].IsDeleted == false) {
                quoteLine = selectedQuoteLine[0];
                CalculateQuoteLineTotals(quoteLine);
                CalculateQuoteTotals();
            }
        }
        else {
            SeaOttersSvc.ShowAlert(17, 1, [{ key: '[action]', value: 'delete' }]);
        }
    };
})
.controller('taxheadCtrl', function ($state, $scope, SeaOttersSvc, $rootScope) {
    if (!SeaOttersSvc.IsValidUser()) {
        $state.go('login');
        return;
    }

    SeaOttersSvc.UserRolePermission('TaxHead').then(function (data) {
        $scope.userRolePermission = data.data.Results;
        if ($scope.userRolePermission == null || $scope.userRolePermission[0].Access == 0) {
            SeaOttersSvc.ShowAlert(-1, 0, {});
        }
    });

    $scope.divForm = false;

    SeaOttersSvc.GetTaxHeadList().then(function (data) {
        $scope.ugTaxHeads.data = data.data.Results;
    });

    $scope.ugTaxHeads = {
        enableFullRowSelection: true,
        enableFiltering: true,
        multiSelect: false,
        enableRowHeaderSelection: true,
        paginationPageSizes: [10, 20, 30, 40, 50, 100, 500],
        paginationPageSize: 20,
        enableGridMenu: true,
        exporterCsvFilename: 'TaxHead.csv',
        exporterPdfDefaultStyle: { fontSize: 9 },
        exporterPdfTableStyle: { margin: [30, 30, 30, 30] },
        exporterPdfTableHeaderStyle: { fontSize: 10, bold: true, italics: true, color: '#2A3F54' },
        exporterPdfHeader: { text: "Tax Head Details", style: 'headerStyle' },
        exporterPdfFooter: function (currentPage, pageCount) {
            return { text: currentPage.toString() + ' of ' + pageCount.toString(), style: 'footerStyle' };
        },
        exporterPdfCustomFormatter: function (docDefinition) {
            docDefinition.styles.headerStyle = { fontSize: 22, bold: true };
            docDefinition.styles.footerStyle = { fontSize: 10, bold: true };
            return docDefinition;
        },
        exporterPdfOrientation: 'landscape',
        exporterPdfPageSize: 'A4',
        exporterPdfMaxGridWidth: 500,
        exporterCsvLinkElement: angular.element(document.querySelectorAll(".custom-csv-link-location")),
    };

    SeaOttersSvc.GetPageDetailsByPageName('TaxHead').then(function (data) {
        $scope.pageConfig = data.data.Results;
        $scope.ugTaxHeads = {
            columnDefs: [
              { name: 'TaxHeadsID', displayName: 'ID', visible: false, enableHiding: false },
              { name: 'TAXCode', displayName: $scope.LabelName('TAXCode', 'TaxHeads'), width: 100 },
              { name: 'TAXName', displayName: $scope.LabelName('TAXName', 'TaxHeads'), width: 200 },
              { name: 'TAXPC', displayName: $scope.LabelName('TAXPC', 'TaxHeads'), width: 100 },
              { name: 'InsertedByName', displayName: $scope.LabelName('InsertedBy', 'TaxHeads'), width: 150 },
              { name: 'InsertedAt', width: 150, displayName: $scope.LabelName('InsertedAt', 'TaxHeads'), cellFilter: 'date:\'yyyy-MM-dd\'' },
              { name: 'UpdatedByName', displayName: $scope.LabelName('UpdatedBy', 'TaxHeads'), width: 150 },
              { name: 'UpdatedAt', width: 150, displayName: $scope.LabelName('UpdatedAt', 'TaxHeads'), cellFilter: 'date:\'yyyy-MM-dd\'' },
            ],
        }
        SeaOttersSvc.GetTaxHeadList().then(function (data) {
            $scope.ugTaxHeads.data = data.data.Results;
        });
    });


    $scope.LabelName = function (fieldName, tableName) {
        if ($scope.pageConfig) {
            var language = $scope.pageConfig.filter(function (obj) {
                if (obj.TableFieldName === fieldName && obj.TableName === tableName)
                    return obj;
            })[0];

            if ($rootScope.UserDetail && $rootScope.UserDetail.Language.toLowerCase() == 'Chinese'.toLowerCase()) {
                return language.CustomFieldNameForChinese;
            }
            return language.CustomFieldNameForEnglish;
        }
    };

    $scope.FilterTaxHead = function () {
        $scope.taxHeadGridApi.grid.refresh();
    };

    $scope.ugTaxHeads.onRegisterApi = function (gridApi) {
        $scope.taxHeadGridApi = gridApi;
        $scope.taxHeadGridApi.grid.registerRowsProcessor($scope.singleFilter, 200);
    };

    $scope.singleFilter = function (renderableRows) {
        var matcher = new RegExp($scope.filterTaxHeadValue, 'i');
        renderableRows.forEach(function (row) {
            var match = false;
            ['TAXCode', 'TAXName'].forEach(function (field) {
                if (row.entity[field].match(matcher)) {
                    match = true;
                }
            });
            if (!match) {
                row.visible = false;
            }
        });
        return renderableRows;
    }

    $scope.AddTH = function () {
        $scope.taxHead = {
            TaxHeadsID: 0, TAXCode: null, TAXName: null, TAXPC: null
        };
        $scope.divView = false;
        $scope.divForm = true;
    };

    $scope.EditTH = function () {
        //debugger;
        var selectedTH = $scope.taxHeadGridApi.selection.getSelectedRows();
        var recordCount = selectedTH.length;
        if (recordCount > 0) {
            var taxHeadID = selectedTH[0].TaxHeadsID;
            SeaOttersSvc.GetTaxHeadDetailsByTHID(taxHeadID).then(function (data) {
                //debugger;
                $scope.taxHead = data.data.Results;
            });
            $scope.divForm = true;
        }
        else {
            SeaOttersSvc.ShowAlert(17, 1, [{ key: '[action]', value: 'edit' }]);
        }
        $scope.taxHeadGridApi.selection.clearSelectedRows();
    };

    $scope.DeleteTH = function () {
        var selectedTH = $scope.taxHeadGridApi.selection.getSelectedRows();
        var recordCount = selectedTH.length;
        SeaOttersSvc.ShowLoadingWheel(true);
        if (recordCount > 0) {
            var taxHeadID = selectedTH[0].TaxHeadsID;
            //alert("WIP");
            SeaOttersSvc.DeleteTaxHead(taxHeadID).then(function (data) {
                SeaOttersSvc.ShowLoadingWheel(false);
                if (data.data.Status == true) {
                    SeaOttersSvc.ShowAlert(data.data.MessageId, 3, [{ key: '[Data]', value: 'Tax Head' }]);
                    SeaOttersSvc.GetTaxHeadList().then(function (data) {
                        $scope.ugTaxHeads.data = data.data.Results;
                    });
                }
                else {
                    SeaOttersSvc.ShowAlert(data.data.MessageId, 0, {});
                }
            });
        }
        else {
            SeaOttersSvc.ShowLoadingWheel(false);
            SeaOttersSvc.ShowAlert(17, 1, [{ key: '[action]', value: 'delete' }]);
        }
        $scope.taxHeadGridApi.selection.clearSelectedRows();
    };

    $scope.SaveTaxHead = function () {
        SeaOttersSvc.ShowLoadingWheel(true);
        //debugger;
        SeaOttersSvc.SaveTaxHead($scope.taxHead).then(function (data) {
            SeaOttersSvc.ShowLoadingWheel(false);
            if (data.data.Status == true) {
                SeaOttersSvc.ShowAlert(4, 3, [{ key: '[Data]', value: 'Tax Head' }]);
                SeaOttersSvc.GetTaxHeadList().then(function (data) {
                    $scope.ugTaxHeads.data = data.data.Results;
                    $scope.divView = true;
                    $scope.divForm = false;
                });
            } else {
                SeaOttersSvc.ShowAlert(data.data.MessageId, 0, {});
            }
        });
    };
})
.controller('quotestatusCtrl', function ($state, $scope, SeaOttersSvc, $rootScope) {
    if (!SeaOttersSvc.IsValidUser()) {
        $state.go('login');
        return;
    }

    SeaOttersSvc.UserRolePermission('QuoteStatus').then(function (data) {
        $scope.userRolePermission = data.data.Results;
        if ($scope.userRolePermission == null || $scope.userRolePermission[0].Access == 0) {
            SeaOttersSvc.ShowAlert(-1, 0, {});
        }
    });

    $scope.divForm = false;

    SeaOttersSvc.GetQuoteStatusList().then(function (data) {
        $scope.ugQuoteStatus.data = data.data.Results;
    });

    $scope.ugQuoteStatus = {
        enableFullRowSelection: true,
        enableFiltering: true,
        multiSelect: false,
        enableRowHeaderSelection: true,
        paginationPageSizes: [10, 20, 30, 40, 50, 100, 500],
        paginationPageSize: 20,
        enableGridMenu: true,
        exporterCsvFilename: 'QuoteStatus.csv',
        exporterPdfDefaultStyle: { fontSize: 9 },
        exporterPdfTableStyle: { margin: [30, 30, 30, 30] },
        exporterPdfTableHeaderStyle: { fontSize: 10, bold: true, italics: true, color: '#2A3F54' },
        exporterPdfHeader: { text: "Quote Status Details", style: 'headerStyle' },
        exporterPdfFooter: function (currentPage, pageCount) {
            return { text: currentPage.toString() + ' of ' + pageCount.toString(), style: 'footerStyle' };
        },
        exporterPdfCustomFormatter: function (docDefinition) {
            docDefinition.styles.headerStyle = { fontSize: 22, bold: true };
            docDefinition.styles.footerStyle = { fontSize: 10, bold: true };
            return docDefinition;
        },
        exporterPdfOrientation: 'landscape',
        exporterPdfPageSize: 'A4',
        exporterPdfMaxGridWidth: 500,
        exporterCsvLinkElement: angular.element(document.querySelectorAll(".custom-csv-link-location")),
    };

    SeaOttersSvc.GetPageDetailsByPageName('QuoteStatus').then(function (data) {
        $scope.pageConfig = data.data.Results;
        $scope.ugQuoteStatus = {
            columnDefs: [
              { name: 'QuoteStatusID', displayName: 'ID', visible: false, enableHiding: false },
              { name: 'QuoteStatus', displayName: $scope.LabelName('QuoteStatus', 'QuoteStatus'), width: 250 },
              { name: 'InsertedByName', displayName: $scope.LabelName('InsertedBy', 'QuoteStatus'), width: 175 },
              { name: 'InsertedAt', width: 165, displayName: $scope.LabelName('InsertedAt', 'QuoteStatus'), cellFilter: 'date:\'yyyy-MM-dd\'' },
              { name: 'UpdatedByName', displayName: $scope.LabelName('UpdatedBy', 'QuoteStatus'), width: 175 },
              { name: 'UpdatedAt', width: 165, displayName: $scope.LabelName('UpdatedAt', 'QuoteStatus'), cellFilter: 'date:\'yyyy-MM-dd\'' },
            ],
        }
        SeaOttersSvc.GetQuoteStatusList().then(function (data) {
            $scope.ugQuoteStatus.data = data.data.Results;
        });
    });

    $scope.LabelName = function (fieldName, tableName) {
        if ($scope.pageConfig) {
            var language = $scope.pageConfig.filter(function (obj) {
                if (obj.TableFieldName === fieldName && obj.TableName === tableName)
                    return obj;
            })[0];

            if ($rootScope.UserDetail && $rootScope.UserDetail.Language.toLowerCase() == 'Chinese'.toLowerCase()) {
                return language.CustomFieldNameForChinese;
            }
            return language.CustomFieldNameForEnglish;
        }
    };

    $scope.FilterQuoteStatus = function () {
        $scope.quoteStatusGridApi.grid.refresh();
    };

    $scope.ugQuoteStatus.onRegisterApi = function (gridApi) {
        $scope.quoteStatusGridApi = gridApi;
        $scope.quoteStatusGridApi.grid.registerRowsProcessor($scope.singleFilter, 200);
    };

    $scope.singleFilter = function (renderableRows) {
        var matcher = new RegExp($scope.filterQuoteStatusValue, 'i');
        renderableRows.forEach(function (row) {
            var match = false;
            ['QuoteStatus'].forEach(function (field) {
                if (row.entity[field].match(matcher)) {
                    match = true;
                }
            });
            if (!match) {
                row.visible = false;
            }
        });
        return renderableRows;
    }

    $scope.AddQS = function () {
        $scope.quoteStatus = {
            QuoteStatusID: 0, QuoteStatus: null
        };
        $scope.divView = false;
        $scope.divForm = true;
    };

    $scope.EditQS = function () {
        //debugger;
        var selectedQS = $scope.quoteStatusGridApi.selection.getSelectedRows();
        var recordCount = selectedQS.length;
        if (recordCount > 0) {
            var qsID = selectedQS[0].QuoteStatusID;
            SeaOttersSvc.GetQuoteStatusDetailByID(qsID).then(function (data) {
                //debugger;
                $scope.quoteStatus = data.data.Results;
            });
            $scope.divForm = true;
        }
        else {
            SeaOttersSvc.ShowAlert(17, 1, [{ key: '[action]', value: 'edit' }]);
        }
        $scope.quoteStatusGridApi.selection.clearSelectedRows();
    };

    $scope.DeleteQS = function () {
        //debugger;
        var selectedQS = $scope.quoteStatusGridApi.selection.getSelectedRows();
        var recordCount = selectedQS.length;
        SeaOttersSvc.ShowLoadingWheel(true);
        if (recordCount > 0) {
            var qsID = selectedQS[0].QuoteStatusID;
            //alert("WIP");
            //debugger;
            SeaOttersSvc.DeleteQuoteStatus(qsID).then(function (data) {
                SeaOttersSvc.ShowLoadingWheel(false);
                if (data.data.Status == true) {
                    SeaOttersSvc.ShowAlert(data.data.MessageId, 3, [{ key: '[Data]', value: 'Quote Status' }]);
                    SeaOttersSvc.GetQuoteStatusList().then(function (data) {
                        $scope.ugQuoteStatus.data = data.data.Results;
                    });
                }
                else {
                    SeaOttersSvc.ShowAlert(data.data.MessageId, 0, {});
                }
            });
        }
        else {
            SeaOttersSvc.ShowLoadingWheel(false);
            SeaOttersSvc.ShowAlert(17, 1, [{ key: '[action]', value: 'delete' }]);
        }
        $scope.quoteStatusGridApi.selection.clearSelectedRows();
    };

    $scope.SaveQuoteStatus = function () {
        SeaOttersSvc.ShowLoadingWheel(true);
        //debugger;
        SeaOttersSvc.SaveQuoteStatus($scope.quoteStatus).then(function (data) {
            SeaOttersSvc.ShowLoadingWheel(false);
            if (data.data.Status == true) {
                SeaOttersSvc.ShowAlert(4, 3, [{ key: '[Data]', value: 'Quote Status' }]);
                SeaOttersSvc.GetQuoteStatusList().then(function (data) {
                    $scope.ugQuoteStatus.data = data.data.Results;
                    $scope.divView = true;
                    $scope.divForm = false;
                });
            } else {
                SeaOttersSvc.ShowAlert(data.data.MessageId, 0, {});
            }
        });
    };
})
.controller('notificationtemplateCtrl', function ($state, $scope, $http, SeaOttersSvc, $modal, $rootScope) {

    if (!SeaOttersSvc.IsValidUser()) {
        $state.go('login');
        return;
    }

    SeaOttersSvc.UserRolePermission('Notification').then(function (data) {
        $scope.userRolePermission = data.data.Results;
        if ($scope.userRolePermission[0].Access == 0) {
            SeaOttersSvc.ShowAlert(-1, 0, {});
        }
    });

    var paginationOptions = {
        pageNumber: 1,
        pageSize: 20,
        sort: null
    };

    $scope.ugNotification = {
        enableFullRowSelection: true,
        enableFiltering: true,
        useExternalPagination: true,
        multiSelect: false,
        enableRowHeaderSelection: true,
        paginationPageSizes: [10, 20, 30, 40, 50, 100, 500],
        paginationPageSize: 20,
        columnDefs: [
        { name: 'ID', displayName: 'ID', visible: false, enableHiding: false },
        { name: 'LanguageName', displayName: 'Language', width: 150 },
        { name: 'TemplateCode', displayName: 'Code', width: 150 },
        { name: 'TemplateName', displayName: 'Name', width: 200 },
        { name: 'InsertedByName', displayName: 'Inserted By', width: 200 },
        { name: 'InsertedAt', cellFilter: 'date:\'yyyy-MM-dd\'', width: 200 },
        { name: 'UpdatedByName', displayName: 'Updated By', width: 200 },
        { name: 'UpdatedAt', cellFilter: 'date:\'yyyy-MM-dd\'', width: 200 },
        ],
        enableGridMenu: true,
        exporterCsvFilename: 'Notification.csv',
        exporterPdfDefaultStyle: { fontSize: 9 },
        exporterPdfTableStyle: { margin: [30, 30, 30, 30] },
        exporterPdfTableHeaderStyle: { fontSize: 10, bold: true, italics: true, color: '#2A3F54' },
        exporterPdfHeader: { text: "Notification Details", style: 'headerStyle' },
        exporterPdfFooter: function (currentPage, pageCount) {
            return { text: currentPage.toString() + ' of ' + pageCount.toString(), style: 'footerStyle' };
        },
        exporterPdfCustomFormatter: function (docDefinition) {
            docDefinition.styles.headerStyle = { fontSize: 22, bold: true };
            docDefinition.styles.footerStyle = { fontSize: 10, bold: true };
            return docDefinition;
        },
        exporterPdfOrientation: 'landscape',
        exporterPdfPageSize: 'A4',
        exporterPdfMaxGridWidth: 500,
        exporterCsvLinkElement: angular.element(document.querySelectorAll(".custom-csv-link-location")),
    };

    SeaOttersSvc.GetPageDetailsByPageName('Notification').then(function (data) {
        $scope.pageConfig = data.data.Results;

        $scope.ugNotification.columnDefs = [
                //{ name: 'ID', displayName: 'ID', visible: false, enableHiding: false },
                //{ name: 'Name', displayName: $scope.LabelName('Name', 'UOM'), width: 430 },
                //{ name: 'InsertedByName', displayName: $scope.LabelName('InsertedBy', 'UOM'), width: 200 },
                //{ name: 'InsertedAt', displayName: $scope.LabelName('InsertedAt', 'UOM'), cellFilter: 'date:\'yyyy-MM-dd\'', width: 200 },
                //{ name: 'UpdatedByName', displayName: $scope.LabelName('UpdatedBy', 'UOM'), width: 200 },
                //{ name: 'UpdatedAt', displayName: $scope.LabelName('UpdatedAt', 'UOM'), cellFilter: 'date:\'yyyy-MM-dd\'', width: 200 },
                //{ name: 'IsActive', displayName: $scope.LabelName('IsActive', 'UOM'), width: 100 },


                   { name: 'ID', displayName: 'ID', visible: false, enableHiding: false },
        { name: 'LanguageName', displayName: $scope.LabelName('LanguageID', 'Notification'), width: 150 },
        { name: 'TemplateCode', displayName: $scope.LabelName('TemplateCode', 'Notification'), width: 150 },
        { name: 'TemplateName', displayName: $scope.LabelName('TemplateName', 'Notification'), width: 275 },
        { name: 'InsertedByName', displayName: $scope.LabelName('InsertedBy', 'Notification'), width: 125 },
        { name: 'InsertedAt', cellFilter: 'date:\'yyyy-MM-dd\'', displayName: $scope.LabelName('InsertedAt', 'Notification'), width: 125 },
        { name: 'UpdatedByName', displayName: $scope.LabelName('UpdatedBy', 'Notification'), width: 125 },
        { name: 'UpdatedAt', cellFilter: 'date:\'yyyy-MM-dd\'', displayName: $scope.LabelName('UpdatedAt', 'Notification'), width: 125 },
        ];

        LoadData();

    });

    $scope.LabelName = function (fieldName, tableName) {
        if ($scope.pageConfig) {
            var language = $scope.pageConfig.filter(function (obj) {
                if (obj.TableFieldName === fieldName && obj.TableName === tableName)
                    return obj;
            })[0];

            if ($rootScope.UserDetail && $rootScope.UserDetail.Language.toLowerCase() == 'Chinese'.toLowerCase()) {
                return language.CustomFieldNameForChinese;
            }
            return language.CustomFieldNameForEnglish;
        }
    };

    $scope.divForm = false;

    $scope.filterNotificationValue = '';

    function LoadData() {
        SeaOttersSvc.GetNotificationTemplateList(paginationOptions.pageNumber, paginationOptions.pageSize, $scope.filterNotificationValue).then(function (data) {
            $scope.ugNotification.totalItems = data.data.Results.TotalRecords;
            $scope.ugNotification.data = data.data.Results.Data;
        });
    };

    function LoadMasters() {
        SeaOttersSvc.GetLanguageList().then(function (data) {
            $scope.languages = data.data.Results;
        });
        SeaOttersSvc.GetMessagingKeyValueList().then(function (data) {
            //debugger;
            $scope.messageKeyValueList = data.data.Results;
        });
    };

    $scope.highlightBG = function (tblTd, color) {
        $('.tblTDClass').css('background-color', '');
        $('#' + tblTd).css('background-color', color);
    };

    $scope.FilterNotification = function () {
        paginationOptions.pageNumber = 1;
        paginationOptions.pageSize = 20;
        LoadData();
    };

    $scope.ugNotification.onRegisterApi = function (gridApi) {
        $scope.notificationGridAPI = gridApi;
        gridApi.pagination.on.paginationChanged($scope, function (pageNumber, pageSize) {
            paginationOptions.pageNumber = pageNumber;
            paginationOptions.pageSize = pageSize;
            LoadData();
        });
    };

    $scope.AddNotification = function () {
        LoadMasters();
        $scope.notification = {
            NotificationTemplateID: 0, TemplateName: null, TemplateCode: null, TemplateSubject: null, TemplateBody: null, Language: { LanguageID: null, LanguageName: null },
        };
        $scope.divForm = true;
    };

    $scope.EditNotification = function () {
        var selectedNOTIFY = $scope.notificationGridAPI.selection.getSelectedRows();
        if (selectedNOTIFY.length > 0) {
            LoadMasters();
            var ID = selectedNOTIFY[0].NotificationTemplateID;
            SeaOttersSvc.GetNotificationTemplateByID(ID).then(function (data) {
                $scope.notification = data.data.Results;
            });
            $scope.divForm = true;
        }
        else {
            SeaOttersSvc.ShowAlert(17, 1, [{ key: '[action]', value: 'edit' }]);
        }
        $scope.notificationGridAPI.selection.clearSelectedRows();
    };

    $scope.DeleteNotification = function () {
        var selectedNOTIFY = $scope.notificationGridAPI.selection.getSelectedRows();
        if (selectedNOTIFY.length > 0) {
            var ID = selectedNOTIFY[0].NotificationTemplateID;
            SeaOttersSvc.DeleteNotificationTemplate(ID).then(function (data) {
                if (data.data.Status == true) {
                    SeaOttersSvc.ShowAlert(data.data.MessageId, 3, [{ key: '[Data]', value: 'Notification' }]);
                    LoadData();
                }
                else {
                    SeaOttersSvc.ShowAlert(data.data.MessageId, 0, {});
                }
            });
        }
        else {
            SeaOttersSvc.ShowAlert(17, 1, [{ key: '[action]', value: 'delete' }]);
        }
        $scope.notificationGridAPI.selection.clearSelectedRows();
    };

    $scope.SaveNotification = function () {
        SeaOttersSvc.SaveNotificationTemplate($scope.notification).then(function (data) {
            if (data.data.Status == true) {
                SeaOttersSvc.ShowAlert(data.data.MessageId, 3, [{ key: '[Data]', value: 'Notification' }]);
                LoadData();
                $scope.divForm = false;
            }
            else {
                SeaOttersSvc.ShowAlert(data.data.MessageId, 0, {});
            }
        });
    };
})
.controller('offerstatusCtrl', function ($state, $scope, SeaOttersSvc, $rootScope) {
    if (!SeaOttersSvc.IsValidUser()) {
        $state.go('login');
        return;
    }

    SeaOttersSvc.UserRolePermission('OfferStatus').then(function (data) {
        $scope.userRolePermission = data.data.Results;
        if ($scope.userRolePermission == null || $scope.userRolePermission[0].Access == 0) {
            SeaOttersSvc.ShowAlert(-1, 0, {});
        }
    });

    $scope.divForm = false;

    SeaOttersSvc.GetOfferStatusList().then(function (data) {
        $scope.ugOfferStatus.data = data.data.Results;
    });

    $scope.ugOfferStatus = {
        enableFullRowSelection: true,
        enableFiltering: true,
        multiSelect: false,
        enableRowHeaderSelection: true,
        paginationPageSizes: [10, 20, 30, 40, 50, 100, 500],
        paginationPageSize: 20,
        enableGridMenu: true,
        exporterCsvFilename: 'OfferStatus.csv',
        exporterPdfDefaultStyle: { fontSize: 9 },
        exporterPdfTableStyle: { margin: [30, 30, 30, 30] },
        exporterPdfTableHeaderStyle: { fontSize: 10, bold: true, italics: true, color: '#2A3F54' },
        exporterPdfHeader: { text: "Offer Status Details", style: 'headerStyle' },
        exporterPdfFooter: function (currentPage, pageCount) {
            return { text: currentPage.toString() + ' of ' + pageCount.toString(), style: 'footerStyle' };
        },
        exporterPdfCustomFormatter: function (docDefinition) {
            docDefinition.styles.headerStyle = { fontSize: 22, bold: true };
            docDefinition.styles.footerStyle = { fontSize: 10, bold: true };
            return docDefinition;
        },
        exporterPdfOrientation: 'landscape',
        exporterPdfPageSize: 'A4',
        exporterPdfMaxGridWidth: 500,
        exporterCsvLinkElement: angular.element(document.querySelectorAll(".custom-csv-link-location")),
    };

    SeaOttersSvc.GetPageDetailsByPageName('OfferStatus').then(function (data) {
        $scope.pageConfig = data.data.Results;
        $scope.ugOfferStatus = {
            columnDefs: [
              { name: 'OfferStatusID', displayName: 'ID', visible: false, enableHiding: false },
              { name: 'OfferStatus', displayName: $scope.LabelName('OfferStatus', 'OfferStatus'), width: 250 },
              { name: 'InsertedByName', displayName: $scope.LabelName('InsertedBy', 'OfferStatus'), width: 175 },
              { name: 'InsertedAt', width: 165, displayName: $scope.LabelName('InsertedAt', 'OfferStatus'), cellFilter: 'date:\'yyyy-MM-dd\'' },
              { name: 'UpdatedByName', displayName: $scope.LabelName('UpdatedBy', 'OfferStatus'), width: 175 },
              { name: 'UpdatedAt', width: 165, displayName: $scope.LabelName('UpdatedAt', 'OfferStatus'), cellFilter: 'date:\'yyyy-MM-dd\'' },
            ],
        }
        SeaOttersSvc.GetOfferStatusList().then(function (data) {
            $scope.ugOfferStatus.data = data.data.Results;
        });
    });

    $scope.LabelName = function (fieldName, tableName) {
        if ($scope.pageConfig) {
            var language = $scope.pageConfig.filter(function (obj) {
                if (obj.TableFieldName === fieldName && obj.TableName === tableName)
                    return obj;
            })[0];

            if ($rootScope.UserDetail && $rootScope.UserDetail.Language.toLowerCase() == 'Chinese'.toLowerCase()) {
                return language.CustomFieldNameForChinese;
            }
            return language.CustomFieldNameForEnglish;
        }
    };

    $scope.FilterOfferStatus = function () {
        $scope.OfferStatusGridApi.grid.refresh();
    };

    $scope.ugOfferStatus.onRegisterApi = function (gridApi) {
        $scope.OfferStatusGridApi = gridApi;
        $scope.OfferStatusGridApi.grid.registerRowsProcessor($scope.singleFilter, 200);
    };

    $scope.singleFilter = function (renderableRows) {
        var matcher = new RegExp($scope.filterOfferStatusValue, 'i');
        renderableRows.forEach(function (row) {
            var match = false;
            ['OfferStatus'].forEach(function (field) {
                if (row.entity[field].match(matcher)) {
                    match = true;
                }
            });
            if (!match) {
                row.visible = false;
            }
        });
        return renderableRows;
    }

    $scope.AddOS = function () {
        $scope.offerStatus = {
            OfferStatusID: 0, OfferStatus: null
        };
        $scope.divView = false;
        $scope.divForm = true;
    };

    $scope.EditOS = function () {
        //debugger;
        var selectedQS = $scope.OfferStatusGridApi.selection.getSelectedRows();
        var recordCount = selectedQS.length;
        if (recordCount > 0) {
            var qsID = selectedQS[0].OfferStatusID;
            SeaOttersSvc.GetOfferStatusDetailByID(qsID).then(function (data) {
                //debugger;
                $scope.offerStatus = data.data.Results;
            });
            $scope.divForm = true;
        }
        else {
            SeaOttersSvc.ShowAlert(17, 1, [{ key: '[action]', value: 'edit' }]);
        }
        $scope.OfferStatusGridApi.selection.clearSelectedRows();
    };

    $scope.DeleteOS = function () {
        //debugger;
        var selectedQS = $scope.OfferStatusGridApi.selection.getSelectedRows();
        var recordCount = selectedQS.length;
        SeaOttersSvc.ShowLoadingWheel(true);
        if (recordCount > 0) {
            var qsID = selectedQS[0].OfferStatusID;
            //alert("WIP");
            //debugger;
            SeaOttersSvc.DeleteOfferStatus(qsID).then(function (data) {
                SeaOttersSvc.ShowLoadingWheel(false);
                if (data.data.Status == true) {
                    SeaOttersSvc.ShowAlert(data.data.MessageId, 3, [{ key: '[Data]', value: 'Offer Status' }]);
                    SeaOttersSvc.GetOfferStatusList().then(function (data) {
                        $scope.ugOfferStatus.data = data.data.Results;
                    });
                }
                else {
                    SeaOttersSvc.ShowAlert(data.data.MessageId, 0, {});
                }
            });
        }
        else {
            SeaOttersSvc.ShowLoadingWheel(false);
            SeaOttersSvc.ShowAlert(17, 1, [{ key: '[action]', value: 'delete' }]);
        }
        $scope.quoteStatusGridApi.selection.clearSelectedRows();
    };

    $scope.SaveOfferStatus = function () {
        SeaOttersSvc.ShowLoadingWheel(true);
        //debugger;
        SeaOttersSvc.SaveOfferStatus($scope.offerStatus).then(function (data) {
            SeaOttersSvc.ShowLoadingWheel(false);
            if (data.data.Status == true) {
                SeaOttersSvc.ShowAlert(4, 3, [{ key: '[Data]', value: 'Offer Status' }]);
                SeaOttersSvc.GetOfferStatusList().then(function (data) {
                    $scope.ugOfferStatus.data = data.data.Results;
                    $scope.divView = true;
                    $scope.divForm = false;
                });
            } else {
                SeaOttersSvc.ShowAlert(data.data.MessageId, 0, {});
            }
        });
    };
})
.controller('priceTermCtrl', function ($state, $scope, SeaOttersSvc, $rootScope) {
    if (!SeaOttersSvc.IsValidUser()) {
        $state.go('login');
        return;
    }

    SeaOttersSvc.UserRolePermission('PriceTerm').then(function (data) {
        $scope.userRolePermission = data.data.Results;
        if ($scope.userRolePermission == null || $scope.userRolePermission[0].Access == 0) {
            SeaOttersSvc.ShowAlert(-1, 0, {});
        }
    });

    $scope.divForm = false;

    SeaOttersSvc.GetAllPriceTermList().then(function (data) {
        $scope.ugPriceTerm.data = data.data.Results;
    });

    $scope.ugPriceTerm = {
        enableFullRowSelection: true,
        enableFiltering: true,
        multiSelect: false,
        enableRowHeaderSelection: true,
        paginationPageSizes: [10, 20, 30, 40, 50, 100, 500],
        paginationPageSize: 20,

        enableGridMenu: true,
        exporterCsvFilename: 'PriceTerm.csv',
        exporterPdfDefaultStyle: { fontSize: 9 },
        exporterPdfTableStyle: { margin: [30, 30, 30, 30] },
        exporterPdfTableHeaderStyle: { fontSize: 10, bold: true, italics: true, color: '#2A3F54' },
        exporterPdfHeader: { text: "PriceTerm Details", style: 'headerStyle' },
        exporterPdfFooter: function (currentPage, pageCount) {
            return { text: currentPage.toString() + ' of ' + pageCount.toString(), style: 'footerStyle' };
        },
        exporterPdfCustomFormatter: function (docDefinition) {
            docDefinition.styles.headerStyle = { fontSize: 22, bold: true };
            docDefinition.styles.footerStyle = { fontSize: 10, bold: true };
            return docDefinition;
        },
        exporterPdfOrientation: 'landscape',
        exporterPdfPageSize: 'A4',
        exporterPdfMaxGridWidth: 500,
        exporterCsvLinkElement: angular.element(document.querySelectorAll(".custom-csv-link-location")),
    };

    $scope.ugCostGroup = {
        enableFullRowSelection: false,
        enableRowHeaderSelection: true,
        multiSelect: true,
        enableRowHeaderSelection: true,
        paginationPageSizes: [10, 20, 30, 40, 50, 100, 500],
        paginationPageSize: 20,
        enableGridMenu: true,
        exporterCsvFilename: 'CostGroup.csv',
        exporterPdfDefaultStyle: { fontSize: 9 },
        exporterPdfTableStyle: { margin: [30, 30, 30, 30] },
        exporterPdfTableHeaderStyle: { fontSize: 10, bold: true, italics: true, color: '#2A3F54' },
        exporterPdfHeader: { text: "CostGroup Details", style: 'headerStyle' },
        exporterPdfFooter: function (currentPage, pageCount) {
            return { text: currentPage.toString() + ' of ' + pageCount.toString(), style: 'footerStyle' };
        },
        exporterPdfCustomFormatter: function (docDefinition) {
            docDefinition.styles.headerStyle = { fontSize: 22, bold: true };
            docDefinition.styles.footerStyle = { fontSize: 10, bold: true };
            return docDefinition;
        },
        exporterPdfOrientation: 'landscape',
        exporterPdfPageSize: 'A4',
        exporterPdfMaxGridWidth: 500,
        exporterCsvLinkElement: angular.element(document.querySelectorAll(".custom-csv-link-location")),
    };
    $scope.ugMathSymbol = {
        enableFullRowSelection: true,
        enableFiltering: true,
        multiSelect: false,
        enableRowHeaderSelection: true,
        paginationPageSizes: [10, 20, 30, 40, 50, 100, 500],
        paginationPageSize: 20,
        enableGridMenu: true,
        exporterCsvFilename: 'MathematicalSymbol.csv',
        exporterPdfDefaultStyle: { fontSize: 9 },
        exporterPdfTableStyle: { margin: [30, 30, 30, 30] },
        exporterPdfTableHeaderStyle: { fontSize: 10, bold: true, italics: true, color: '#2A3F54' },
        exporterPdfHeader: { text: "MathematicalSymbol Details", style: 'headerStyle' },
        exporterPdfFooter: function (currentPage, pageCount) {
            return { text: currentPage.toString() + ' of ' + pageCount.toString(), style: 'footerStyle' };
        },
        exporterPdfCustomFormatter: function (docDefinition) {
            docDefinition.styles.headerStyle = { fontSize: 22, bold: true };
            docDefinition.styles.footerStyle = { fontSize: 10, bold: true };
            return docDefinition;
        },
        exporterPdfOrientation: 'landscape',
        exporterPdfPageSize: 'A4',
        exporterPdfMaxGridWidth: 500,
        exporterCsvLinkElement: angular.element(document.querySelectorAll(".custom-csv-link-location")),
    };


    SeaOttersSvc.GetPageDetailsByPageName('PriceTerm,CostGroup,MathematicalSymbol').then(function (data) {
        $scope.pageConfig = data.data.Results;
        $scope.ugPriceTerm = {
            columnDefs: [
             { name: 'PriceTermID', displayName: 'ID', visible: false, enableHiding: false },
             { name: 'PriceTermCode', displayName: $scope.LabelName('PriceTermCode', 'PriceTerm'), width: 200 },
             { name: 'PriceTermName', displayName: $scope.LabelName('PriceTermName', 'PriceTerm'), width: 200 },
             { name: 'Formula', displayName: $scope.LabelName('Formula', 'PriceTerm'), width: 200 },
             { name: 'PriceTermMultiplierValue', displayName: $scope.LabelName('PriceTermMultiplierValue', 'PriceTerm'), width: 200 },
             { name: 'InsertedByName', displayName: $scope.LabelName('InsertedBy', 'PriceTerm'), width: 200 },
             { name: 'InsertedAt', width: 200, displayName: $scope.LabelName('InsertedAt', 'PriceTerm'), cellFilter: 'date:\'yyyy-MM-dd\'' },
             { name: 'UpdatedByName', displayName: $scope.LabelName('UpdatedBy', 'PriceTerm'), width: 200 },
             { name: 'UpdatedAt', width: 200, displayName: $scope.LabelName('UpdatedAt', 'PriceTerm'), cellFilter: 'date:\'yyyy-MM-dd\'' },
            ],
        }
        $scope.ugCostGroup = {
            columnDefs: [
             { name: 'ID', displayName: 'ID', visible: false, enableHiding: false },
             { name: 'CostCode', displayName: $scope.LabelName('CostCode', 'CostGroup'), width: 100 },
             { name: 'TableName', displayName: $scope.LabelName('TableName', 'CostGroup'), width: 200 },
             { name: 'FieldName', displayName: $scope.LabelName('FieldName', 'CostGroup'), width: 200 },
             { name: 'Description', displayName: $scope.LabelName('Description', 'CostGroup'), width: 200 },
            ],
        }
        $scope.ugMathSymbol = {
            columnDefs: [
             { name: 'ID', displayName: 'ID', visible: false, enableHiding: false },
             { name: 'Symbol', displayName: $scope.LabelName('Symbol', 'MathematicalSymbol'), width: 100 },
             { name: 'SymbolName', displayName: $scope.LabelName('SymbolName', 'MathematicalSymbol'), width: 300 },
             { name: 'SymbolMeaning', displayName: $scope.LabelName('SymbolMeaning', 'MathematicalSymbol'), width: 300 },
            ],
        }
        SeaOttersSvc.GetAllPriceTermList().then(function (data) {
            $scope.ugPriceTerm.data = data.data.Results;
        });
        SeaOttersSvc.GetAllCostGroupByUserID().then(function (data) {
            $scope.ugCostGroup.data = data.data.Results;
        });
        SeaOttersSvc.GetAllMathematicalSymbol().then(function (data) {
            $scope.ugMathSymbol.data = data.data.Results;
        });
    });

    $scope.LabelName = function (fieldName, tableName) {
        if ($scope.pageConfig) {
            var language = $scope.pageConfig.filter(function (obj) {
                if (obj.TableFieldName === fieldName && obj.TableName === tableName)
                    return obj;
            })[0];

            if ($rootScope.UserDetail && $rootScope.UserDetail.Language.toLowerCase() == 'Chinese'.toLowerCase()) {
                return language.CustomFieldNameForChinese;
            }
            return language.CustomFieldNameForEnglish;
        }
    };

    $scope.FilterPriceTerm = function () {
        $scope.PriceTermGridApi.grid.refresh();
    };

    $scope.ugPriceTerm.onRegisterApi = function (gridApi) {
        $scope.PriceTermGridApi = gridApi;
        $scope.PriceTermGridApi.grid.registerRowsProcessor($scope.singleFilter, 200);
    };

    $scope.singleFilter = function (renderableRows) {
        var matcher = new RegExp($scope.filterPriceTermValue, 'i');
        renderableRows.forEach(function (row) {
            var match = false;
            ['PriceTermCode', 'PriceTermName'].forEach(function (field) {
                if (row.entity[field].match(matcher)) {
                    match = true;
                }
            });
            if (!match) {
                row.visible = false;
            }
        });
        return renderableRows;
    }

    $scope.AddPriceTerm = function () {
        $scope.priceTerm = {
            PriceTermID: 0, PriceTermCode: null, PriceTermName: null, Description: null, Formula: null, PriceTermMultiplierValue: 1
        };
        $scope.divView = false;
        $scope.divForm = true;
    };

    $scope.EditPriceTerm = function () {
        //debugger;
        var selectedPriceTerm = $scope.PriceTermGridApi.selection.getSelectedRows();
        var recordCount = selectedPriceTerm.length;
        if (recordCount > 0) {
            var PriceTermID = selectedPriceTerm[0].PriceTermID;
            SeaOttersSvc.GetPriceTermByID(PriceTermID).then(function (data) {
                $scope.priceTerm = data.data.Results;
            });
            $scope.divForm = true;
        }
        else {
            SeaOttersSvc.ShowAlert(17, 1, [{ key: '[action]', value: 'edit' }]);
        }
        $scope.PriceTermGridApi.selection.clearSelectedRows();
    };

    $scope.DeletePriceTerm = function () {
        var selectedPriceTerm = $scope.PriceTermGridApi.selection.getSelectedRows();
        var recordCount = selectedPriceTerm.length;
        SeaOttersSvc.ShowLoadingWheel(true);
        if (recordCount > 0) {
            var PriceTermID = selectedPriceTerm[0].PriceTermID;
            SeaOttersSvc.DeletePriceTerm(PriceTermID).then(function (data) {
                SeaOttersSvc.ShowLoadingWheel(false);
                // debugger;
                if (data.data.Status == true) {
                    SeaOttersSvc.ShowAlert(data.data.MessageId, 3, [{ key: '[Data]', value: 'PriceTerm' }]);
                    SeaOttersSvc.GetAllPriceTermList().then(function (data) {
                        $scope.ugPriceTerm.data = data.data.Results;
                    });
                }
                else {
                    SeaOttersSvc.ShowAlert(data.data.MessageId, 0, {});
                }
            });
        }
        else {
            SeaOttersSvc.ShowAlert(17, 1, [{ key: '[action]', value: 'delete' }]);
        }
        $scope.PriceTermGridApi.selection.clearSelectedRows();
    };

    $scope.SavePriceTerm = function () {
        SeaOttersSvc.ShowLoadingWheel(true);
        //debugger;
        SeaOttersSvc.SavePriceTerm($scope.priceTerm).then(function (data) {
            //alert('Data Saved Successfully!!!');
            if (data.data.Status == 1) {
                SeaOttersSvc.ShowAlert(4, 3, [{ key: '[Data]', value: 'PriceTerm' }]);
                SeaOttersSvc.ShowLoadingWheel(false);
                SeaOttersSvc.GetAllPriceTermList().then(function (data) {
                    $scope.ugPriceTerm.data = data.data.Results;
                    $scope.divView = true;
                    $scope.divForm = false;
                });
            }
            else {
                SeaOttersSvc.ShowLoadingWheel(false);
                SeaOttersSvc.ShowAlert(data.data.MessageId, 0, {});
                return;
            }
        });
    };
})
.controller('salescostCtrl', function ($state, $scope, SeaOttersSvc, $rootScope) {
    if (!SeaOttersSvc.IsValidUser()) {
        $state.go('login');
        return;
    }

    SeaOttersSvc.UserRolePermission('SalesCost').then(function (data) {
        $scope.userRolePermission = data.data.Results;
        if ($scope.userRolePermission == null || $scope.userRolePermission[0].Access == 0) {
            SeaOttersSvc.ShowAlert(-1, 0, {});
        }
    });

    $scope.divForm = false;

    SeaOttersSvc.GetAllSalesCostsList().then(function (data) {
        $scope.ugSaleCosts.data = data.data.Results;
    });

    $scope.ugSaleCosts = {
        enableFullRowSelection: true,
        enableFiltering: true,
        multiSelect: false,
        enableRowHeaderSelection: true,
        paginationPageSizes: [10, 20, 30, 40, 50, 100, 500],
        paginationPageSize: 20,

        enableGridMenu: true,
        exporterCsvFilename: 'SalesCost.csv',
        exporterPdfDefaultStyle: { fontSize: 9 },
        exporterPdfTableStyle: { margin: [30, 30, 30, 30] },
        exporterPdfTableHeaderStyle: { fontSize: 10, bold: true, italics: true, color: '#2A3F54' },
        exporterPdfHeader: { text: "SalesCost Details", style: 'headerStyle' },
        exporterPdfFooter: function (currentPage, pageCount) {
            return { text: currentPage.toString() + ' of ' + pageCount.toString(), style: 'footerStyle' };
        },
        exporterPdfCustomFormatter: function (docDefinition) {
            docDefinition.styles.headerStyle = { fontSize: 22, bold: true };
            docDefinition.styles.footerStyle = { fontSize: 10, bold: true };
            return docDefinition;
        },
        exporterPdfOrientation: 'landscape',
        exporterPdfPageSize: 'A4',
        exporterPdfMaxGridWidth: 500,
        exporterCsvLinkElement: angular.element(document.querySelectorAll(".custom-csv-link-location")),
    };

    SeaOttersSvc.GetPageDetailsByPageName('SalesCost').then(function (data) {
        $scope.pageConfig = data.data.Results;
        $scope.ugSaleCosts = {
            columnDefs: [
             { name: 'SalesCostID', displayName: 'ID', visible: false, enableHiding: false },
             { name: 'SaleCostCode', displayName: $scope.LabelName('SaleCostCode', 'SalesCost'), width: 200 },
             { name: 'SaleCostName', displayName: $scope.LabelName('SaleCostName', 'SalesCost'), width: 200 },
             { name: 'SaleCost', displayName: $scope.LabelName('SaleCost', 'SalesCost'), width: 200 },
             { name: 'SalesCostMultiplierValue', displayName: $scope.LabelName('SalesCostMultiplierValue', 'SalesCost'), width: 200 },
             { name: 'InsertedByName', displayName: $scope.LabelName('InsertedBy', 'SalesCost'), width: 200 },
             { name: 'InsertedAt', width: 200, displayName: $scope.LabelName('InsertedAt', 'SalesCost'), cellFilter: 'date:\'yyyy-MM-dd\'' },
             { name: 'UpdatedByName', displayName: $scope.LabelName('UpdatedBy', 'SalesCost'), width: 200 },
             { name: 'UpdatedAt', width: 200, displayName: $scope.LabelName('UpdatedAt', 'SalesCost'), cellFilter: 'date:\'yyyy-MM-dd\'' },
            ],
        }
        SeaOttersSvc.GetAllSalesCostsList().then(function (data) {
            $scope.ugSaleCosts.data = data.data.Results;
        });
    });

    $scope.LabelName = function (fieldName, tableName) {
        if ($scope.pageConfig) {
            var language = $scope.pageConfig.filter(function (obj) {
                if (obj.TableFieldName === fieldName && obj.TableName === tableName)
                    return obj;
            })[0];

            if ($rootScope.UserDetail && $rootScope.UserDetail.Language.toLowerCase() == 'Chinese'.toLowerCase()) {
                return language.CustomFieldNameForChinese;
            }
            return language.CustomFieldNameForEnglish;
        }
    };

    $scope.FilterSaleCost = function () {
        $scope.SaleCostGridApi.grid.refresh();
    };

    $scope.ugSaleCosts.onRegisterApi = function (gridApi) {
        $scope.SaleCostGridApi = gridApi;
        $scope.SaleCostGridApi.grid.registerRowsProcessor($scope.singleFilter, 200);
    };

    $scope.singleFilter = function (renderableRows) {
        var matcher = new RegExp($scope.filterSaleCostValue, 'i');
        renderableRows.forEach(function (row) {
            var match = false;
            ['SaleCostCode', 'SaleCostName'].forEach(function (field) {
                if (row.entity[field].match(matcher)) {
                    match = true;
                }
            });
            if (!match) {
                row.visible = false;
            }
        });
        return renderableRows;
    }

    $scope.AddSaleCost = function () {
        $scope.saleCost = {
            SalesCostID: 0, SaleCostCode: null, SaleCostName: null, Description: null, SaleCost: null, SalesCostMultiplierValue: 1
        };
        $scope.divView = false;
        $scope.divForm = true;
    };

    $scope.EditSaleCost = function () {
        //debugger;
        var selectedSaleCost = $scope.SaleCostGridApi.selection.getSelectedRows();
        var recordCount = selectedSaleCost.length;
        if (recordCount > 0) {
            var SaleCostID = selectedSaleCost[0].SalesCostID;
            SeaOttersSvc.GetSalesCostsByID(SaleCostID).then(function (data) {
                $scope.saleCost = data.data.Results;
            });
            $scope.divForm = true;
        }
        else {
            SeaOttersSvc.ShowAlert(17, 1, [{ key: '[action]', value: 'edit' }]);
        }
        $scope.SaleCostGridApi.selection.clearSelectedRows();
    };

    $scope.DeleteSaleCost = function () {
        var selectedSaleCost = $scope.SaleCostGridApi.selection.getSelectedRows();
        var recordCount = selectedSaleCost.length;
        SeaOttersSvc.ShowLoadingWheel(true);
        if (recordCount > 0) {
            var SaleCostID = selectedSaleCost[0].SalesCostID;
            SeaOttersSvc.DeleteSalesCosts(SaleCostID).then(function (data) {
                SeaOttersSvc.ShowLoadingWheel(false);
                // debugger;
                if (data.data.Status == true) {
                    SeaOttersSvc.ShowAlert(data.data.MessageId, 3, [{ key: '[Data]', value: 'Sales Cost' }]);
                    SeaOttersSvc.GetAllSalesCostsList().then(function (data) {
                        $scope.ugSaleCosts.data = data.data.Results;
                    });
                }
                else {
                    SeaOttersSvc.ShowAlert(data.data.MessageId, 0, {});
                }
            });
        }
        else {
            SeaOttersSvc.ShowAlert(17, 1, [{ key: '[action]', value: 'delete' }]);
        }
        $scope.SaleCostGridApi.selection.clearSelectedRows();
    };

    $scope.SaveSaleCost = function () {
        SeaOttersSvc.ShowLoadingWheel(true);
        //debugger;
        SeaOttersSvc.SaveSalesCosts($scope.saleCost).then(function (data) {
            //alert('Data Saved Successfully!!!');
            if (data.data.Status == 1) {
                SeaOttersSvc.ShowAlert(4, 3, [{ key: '[Data]', value: 'Sales Cost' }]);
                SeaOttersSvc.ShowLoadingWheel(false);
                SeaOttersSvc.GetAllSalesCostsList().then(function (data) {
                    $scope.ugSaleCosts.data = data.data.Results;
                    $scope.divView = true;
                    $scope.divForm = false;
                });
            }
            else {
                SeaOttersSvc.ShowLoadingWheel(false);
                SeaOttersSvc.ShowAlert(data.data.MessageId, 0, {});
                return;
            }
        });
    };
})
.controller('freightCtrl', function ($state, $scope, SeaOttersSvc, $rootScope) {
    if (!SeaOttersSvc.IsValidUser()) {
        $state.go('login');
        return;
    }

    SeaOttersSvc.UserRolePermission('Freight').then(function (data) {
        $scope.userRolePermission = data.data.Results;
        if ($scope.userRolePermission == null || $scope.userRolePermission[0].Access == 0) {
            SeaOttersSvc.ShowAlert(-1, 0, {});
        }
    });

    $scope.divForm = false;

    SeaOttersSvc.GetAllFreightList().then(function (data) {
        $scope.ugFreights.data = data.data.Results;
    });

    $scope.ugFreights = {
        enableFullRowSelection: true,
        enableFiltering: true,
        multiSelect: false,
        enableRowHeaderSelection: true,
        paginationPageSizes: [10, 20, 30, 40, 50, 100, 500],
        paginationPageSize: 20,

        enableGridMenu: true,
        exporterCsvFilename: 'Freight.csv',
        exporterPdfDefaultStyle: { fontSize: 9 },
        exporterPdfTableStyle: { margin: [30, 30, 30, 30] },
        exporterPdfTableHeaderStyle: { fontSize: 10, bold: true, italics: true, color: '#2A3F54' },
        exporterPdfHeader: { text: "Freight Details", style: 'headerStyle' },
        exporterPdfFooter: function (currentPage, pageCount) {
            return { text: currentPage.toString() + ' of ' + pageCount.toString(), style: 'footerStyle' };
        },
        exporterPdfCustomFormatter: function (docDefinition) {
            docDefinition.styles.headerStyle = { fontSize: 22, bold: true };
            docDefinition.styles.footerStyle = { fontSize: 10, bold: true };
            return docDefinition;
        },
        exporterPdfOrientation: 'landscape',
        exporterPdfPageSize: 'A4',
        exporterPdfMaxGridWidth: 500,
        exporterCsvLinkElement: angular.element(document.querySelectorAll(".custom-csv-link-location")),
    };

    SeaOttersSvc.GetPageDetailsByPageName('Freight').then(function (data) {
        $scope.pageConfig = data.data.Results;
        $scope.ugFreights = {
            columnDefs: [
             { name: 'FreightID', displayName: 'ID', visible: false, enableHiding: false },
             { name: 'FreightCode', displayName: $scope.LabelName('FreightCode', 'Freight'), width: 200 },
             { name: 'FreightName', displayName: $scope.LabelName('FreightName', 'Freight'), width: 200 },
             { name: 'FreightCost', displayName: $scope.LabelName('FreightCost', 'Freight'), width: 200 },
             { name: 'FreightCostMultiplierValue', displayName: $scope.LabelName('FreightCostMultiplierValue', 'Freight'), width: 200 },
             { name: 'InsertedByName', displayName: $scope.LabelName('InsertedBy', 'Freight'), width: 200 },
             { name: 'InsertedAt', width: 200, displayName: $scope.LabelName('InsertedAt', 'Freight'), cellFilter: 'date:\'yyyy-MM-dd\'' },
             { name: 'UpdatedByName', displayName: $scope.LabelName('UpdatedBy', 'Freight'), width: 200 },
             { name: 'UpdatedAt', width: 200, displayName: $scope.LabelName('UpdatedAt', 'Freight'), cellFilter: 'date:\'yyyy-MM-dd\'' },
            ],
        }
        SeaOttersSvc.GetAllFreightList().then(function (data) {
            $scope.ugFreights.data = data.data.Results;
        });
    });

    $scope.LabelName = function (fieldName, tableName) {
        if ($scope.pageConfig) {
            var language = $scope.pageConfig.filter(function (obj) {
                if (obj.TableFieldName === fieldName && obj.TableName === tableName)
                    return obj;
            })[0];

            if ($rootScope.UserDetail && $rootScope.UserDetail.Language.toLowerCase() == 'Chinese'.toLowerCase()) {
                return language.CustomFieldNameForChinese;
            }
            return language.CustomFieldNameForEnglish;
        }
    };

    $scope.FilterFreight = function () {
        $scope.FreightGridApi.grid.refresh();
    };

    $scope.ugFreights.onRegisterApi = function (gridApi) {
        $scope.FreightGridApi = gridApi;
        $scope.FreightGridApi.grid.registerRowsProcessor($scope.singleFilter, 200);
    };

    $scope.singleFilter = function (renderableRows) {
        var matcher = new RegExp($scope.filterFreightValue, 'i');
        renderableRows.forEach(function (row) {
            var match = false;
            ['FreightCode', 'FreightName'].forEach(function (field) {
                if (row.entity[field].match(matcher)) {
                    match = true;
                }
            });
            if (!match) {
                row.visible = false;
            }
        });
        return renderableRows;
    }

    $scope.AddFreight = function () {
        $scope.freight = {
            FreightID: 0, FreightCode: null, FreightName: null, Description: null, FreightCost: null, FreightCostMultiplierValue: 1
        };
        $scope.divView = false;
        $scope.divForm = true;
    };

    $scope.EditFreight = function () {
        //debugger;
        var selectedFreight = $scope.FreightGridApi.selection.getSelectedRows();
        var recordCount = selectedFreight.length;
        if (recordCount > 0) {
            var freightID = selectedFreight[0].FreightID;
            SeaOttersSvc.GetFreightByID(freightID).then(function (data) {
                $scope.freight = data.data.Results;
            });
            $scope.divForm = true;
        }
        else {
            SeaOttersSvc.ShowAlert(17, 1, [{ key: '[action]', value: 'edit' }]);
        }
        $scope.FreightGridApi.selection.clearSelectedRows();
    };

    $scope.DeleteFreight = function () {
        var selectedFreight = $scope.FreightGridApi.selection.getSelectedRows();
        var recordCount = selectedFreight.length;
        SeaOttersSvc.ShowLoadingWheel(true);
        if (recordCount > 0) {
            var FreightID = selectedFreight[0].FreightID;
            SeaOttersSvc.DeleteFreight(FreightID).then(function (data) {
                SeaOttersSvc.ShowLoadingWheel(false);
                // debugger;
                if (data.data.Status == true) {
                    SeaOttersSvc.ShowAlert(data.data.MessageId, 3, [{ key: '[Data]', value: 'Freight' }]);
                    SeaOttersSvc.GetAllFreightList().then(function (data) {
                        $scope.ugFreights.data = data.data.Results;
                    });
                }
                else {
                    SeaOttersSvc.ShowAlert(data.data.MessageId, 0, {});
                }
            });
        }
        else {
            SeaOttersSvc.ShowAlert(17, 1, [{ key: '[action]', value: 'delete' }]);
        }
        $scope.FreightGridApi.selection.clearSelectedRows();
    };

    $scope.SaveFreight = function () {
        SeaOttersSvc.ShowLoadingWheel(true);
        //debugger;
        SeaOttersSvc.SaveFreight($scope.freight).then(function (data) {
            //alert('Data Saved Successfully!!!');
            if (data.data.Status == 1) {
                SeaOttersSvc.ShowAlert(4, 3, [{ key: '[Data]', value: 'Freight' }]);
                SeaOttersSvc.ShowLoadingWheel(false);
                SeaOttersSvc.GetAllFreightList().then(function (data) {
                    $scope.ugFreights.data = data.data.Results;
                    $scope.divView = true;
                    $scope.divForm = false;
                });
            }
            else {
                SeaOttersSvc.ShowLoadingWheel(false);
                SeaOttersSvc.ShowAlert(data.data.MessageId, 0, {});
                return;
            }
        });

    };
})
.controller('packingCtrl', function ($state, $scope, SeaOttersSvc, $rootScope) {
    if (!SeaOttersSvc.IsValidUser()) {
        $state.go('login');
        return;
    }

    SeaOttersSvc.UserRolePermission('Packing').then(function (data) {
        $scope.userRolePermission = data.data.Results;
        if ($scope.userRolePermission == null || $scope.userRolePermission[0].Access == 0) {
            SeaOttersSvc.ShowAlert(-1, 0, {});
        }
    });

    $scope.divForm = false;

    SeaOttersSvc.GetAllPackingList().then(function (data) {
        $scope.ugPackings.data = data.data.Results;
    });

    $scope.ugPackings = {
        enableFullRowSelection: true,
        enableFiltering: true,
        multiSelect: false,
        enableRowHeaderSelection: true,
        paginationPageSizes: [10, 20, 30, 40, 50, 100, 500],
        paginationPageSize: 20,

        enableGridMenu: true,
        exporterCsvFilename: 'Packing.csv',
        exporterPdfDefaultStyle: { fontSize: 9 },
        exporterPdfTableStyle: { margin: [30, 30, 30, 30] },
        exporterPdfTableHeaderStyle: { fontSize: 10, bold: true, italics: true, color: '#2A3F54' },
        exporterPdfHeader: { text: "Packing Details", style: 'headerStyle' },
        exporterPdfFooter: function (currentPage, pageCount) {
            return { text: currentPage.toString() + ' of ' + pageCount.toString(), style: 'footerStyle' };
        },
        exporterPdfCustomFormatter: function (docDefinition) {
            docDefinition.styles.headerStyle = { fontSize: 22, bold: true };
            docDefinition.styles.footerStyle = { fontSize: 10, bold: true };
            return docDefinition;
        },
        exporterPdfOrientation: 'landscape',
        exporterPdfPageSize: 'A4',
        exporterPdfMaxGridWidth: 500,
        exporterCsvLinkElement: angular.element(document.querySelectorAll(".custom-csv-link-location")),
    };

    SeaOttersSvc.GetPageDetailsByPageName('Packing').then(function (data) {
        $scope.pageConfig = data.data.Results;
        $scope.ugPackings = {
            columnDefs: [
             { name: 'PackingID', displayName: 'ID', visible: false, enableHiding: false },
             { name: 'PackingCode', displayName: $scope.LabelName('PackingCode', 'Packing'), width: 200 },
             { name: 'PackingName', displayName: $scope.LabelName('PackingName', 'Packing'), width: 200 },
             { name: 'PackingCost', displayName: $scope.LabelName('PackingCost', 'Packing'), width: 200 },
             { name: 'PackingCostMultiplierValue', displayName: $scope.LabelName('PackingCostMultiplierValue', 'Packing'), width: 200 },
             { name: 'InsertedByName', displayName: $scope.LabelName('InsertedBy', 'Packing'), width: 200 },
             { name: 'InsertedAt', width: 200, displayName: $scope.LabelName('InsertedAt', 'Packing'), cellFilter: 'date:\'yyyy-MM-dd\'' },
             { name: 'UpdatedByName', displayName: $scope.LabelName('UpdatedBy', 'Packing'), width: 200 },
             { name: 'UpdatedAt', width: 200, displayName: $scope.LabelName('UpdatedAt', 'Packing'), cellFilter: 'date:\'yyyy-MM-dd\'' },
            ],
        }
        SeaOttersSvc.GetAllPackingList().then(function (data) {
            $scope.ugPackings.data = data.data.Results;
        });
    });

    $scope.LabelName = function (fieldName, tableName) {
        if ($scope.pageConfig) {
            var language = $scope.pageConfig.filter(function (obj) {
                if (obj.TableFieldName === fieldName && obj.TableName === tableName)
                    return obj;
            })[0];

            if ($rootScope.UserDetail && $rootScope.UserDetail.Language.toLowerCase() == 'Chinese'.toLowerCase()) {
                return language.CustomFieldNameForChinese;
            }
            return language.CustomFieldNameForEnglish;
        }
    };

    $scope.FilterPacking = function () {
        $scope.packingGridApi.grid.refresh();
    };

    $scope.ugPackings.onRegisterApi = function (gridApi) {
        $scope.packingGridApi = gridApi;
        $scope.packingGridApi.grid.registerRowsProcessor($scope.singleFilter, 200);
    };

    $scope.singleFilter = function (renderableRows) {
        var matcher = new RegExp($scope.filterPackingValue, 'i');
        renderableRows.forEach(function (row) {
            var match = false;
            ['PackingCode', 'PackingName'].forEach(function (field) {
                if (row.entity[field].match(matcher)) {
                    match = true;
                }
            });
            if (!match) {
                row.visible = false;
            }
        });
        return renderableRows;
    }

    $scope.AddPacking = function () {
        $scope.packing = {
            PackingID: 0, PackingCode: null, PackingName: null, Description: null, PackingCost: null, PackingCostMultiplierValue: 1
        };
        $scope.divView = false;
        $scope.divForm = true;
    };

    $scope.EditPacking = function () {
        //debugger;
        var selectedPacking = $scope.packingGridApi.selection.getSelectedRows();
        var recordCount = selectedPacking.length;
        if (recordCount > 0) {
            var packingID = selectedPacking[0].PackingID;
            SeaOttersSvc.GetPackingByID(packingID).then(function (data) {
                $scope.packing = data.data.Results;
            });
            $scope.divForm = true;
        }
        else {
            SeaOttersSvc.ShowAlert(17, 1, [{ key: '[action]', value: 'edit' }]);
        }
        $scope.packingGridApi.selection.clearSelectedRows();
    };

    $scope.DeletePacking = function () {
        var selectedPacking = $scope.packingGridApi.selection.getSelectedRows();
        var recordCount = selectedPacking.length;
        SeaOttersSvc.ShowLoadingWheel(true);
        if (recordCount > 0) {
            var PackingID = selectedPacking[0].PackingID;
            SeaOttersSvc.DeletePacking(PackingID).then(function (data) {
                SeaOttersSvc.ShowLoadingWheel(false);
                // debugger;
                if (data.data.Status == true) {
                    SeaOttersSvc.ShowAlert(data.data.MessageId, 3, [{ key: '[Data]', value: 'Packing' }]);
                    SeaOttersSvc.GetAllPackingList().then(function (data) {
                        $scope.ugPackings.data = data.data.Results;
                    });
                }
                else {
                    SeaOttersSvc.ShowAlert(data.data.MessageId, 0, {});
                }
            });
        }
        else {
            SeaOttersSvc.ShowAlert(17, 1, [{ key: '[action]', value: 'delete' }]);
        }
        $scope.packingGridApi.selection.clearSelectedRows();
    };

    $scope.SavePacking = function () {
        SeaOttersSvc.ShowLoadingWheel(true);
        //debugger;
        SeaOttersSvc.SavePacking($scope.packing).then(function (data) {
            if (data.data.Status == 1) {
                //alert('Data Saved Successfully!!!');
                SeaOttersSvc.ShowAlert(4, 3, [{ key: '[Data]', value: 'Packing' }]);
                SeaOttersSvc.ShowLoadingWheel(false);
                SeaOttersSvc.GetAllPackingList().then(function (data) {
                    $scope.ugPackings.data = data.data.Results;
                    $scope.divView = true;
                    $scope.divForm = false;
                });
            }
            else {
                SeaOttersSvc.ShowLoadingWheel(false);
                SeaOttersSvc.ShowAlert(data.data.MessageId, 0, {});
                return;
            }
        });
    };
})
.controller('insuranceCtrl', function ($state, $scope, SeaOttersSvc, $rootScope) {
    if (!SeaOttersSvc.IsValidUser()) {
        $state.go('login');
        return;
    }

    SeaOttersSvc.UserRolePermission('Insurance').then(function (data) {
        $scope.userRolePermission = data.data.Results;
        if ($scope.userRolePermission == null || $scope.userRolePermission[0].Access == 0) {
            SeaOttersSvc.ShowAlert(-1, 0, {});
        }
    });

    $scope.divForm = false;

    SeaOttersSvc.GetAllInsuranceList().then(function (data) {
        $scope.ugInsurances.data = data.data.Results;
    });

    $scope.ugInsurances = {
        enableFullRowSelection: true,
        enableFiltering: true,
        multiSelect: false,
        enableRowHeaderSelection: true,
        paginationPageSizes: [10, 20, 30, 40, 50, 100, 500],
        paginationPageSize: 20,

        enableGridMenu: true,
        exporterCsvFilename: 'Insurance.csv',
        exporterPdfDefaultStyle: { fontSize: 9 },
        exporterPdfTableStyle: { margin: [30, 30, 30, 30] },
        exporterPdfTableHeaderStyle: { fontSize: 10, bold: true, italics: true, color: '#2A3F54' },
        exporterPdfHeader: { text: "Insurance Details", style: 'headerStyle' },
        exporterPdfFooter: function (currentPage, pageCount) {
            return { text: currentPage.toString() + ' of ' + pageCount.toString(), style: 'footerStyle' };
        },
        exporterPdfCustomFormatter: function (docDefinition) {
            docDefinition.styles.headerStyle = { fontSize: 22, bold: true };
            docDefinition.styles.footerStyle = { fontSize: 10, bold: true };
            return docDefinition;
        },
        exporterPdfOrientation: 'landscape',
        exporterPdfPageSize: 'A4',
        exporterPdfMaxGridWidth: 500,
        exporterCsvLinkElement: angular.element(document.querySelectorAll(".custom-csv-link-location")),
    };

    SeaOttersSvc.GetPageDetailsByPageName('Insurance').then(function (data) {
        $scope.pageConfig = data.data.Results;
        $scope.ugInsurances = {
            columnDefs: [
             { name: 'InsuranceID', displayName: 'ID', visible: false, enableHiding: false },
             { name: 'InsuranceCode', displayName: $scope.LabelName('InsuranceCode', 'Insurance'), width: 200 },
             { name: 'InsuranceName', displayName: $scope.LabelName('InsuranceName', 'Insurance'), width: 200 },
             { name: 'InsuranceCost', displayName: $scope.LabelName('InsuranceCost', 'Insurance'), width: 200 },
             { name: 'InsuranceCostMultiplierValue', displayName: $scope.LabelName('InsuranceCostMultiplierValue', 'Insurance'), width: 200 },
             { name: 'InsertedByName', displayName: $scope.LabelName('InsertedBy', 'Insurance'), width: 200 },
             { name: 'InsertedAt', width: 200, displayName: $scope.LabelName('InsertedAt', 'Insurance'), cellFilter: 'date:\'yyyy-MM-dd\'' },
             { name: 'UpdatedByName', displayName: $scope.LabelName('UpdatedBy', 'Insurance'), width: 200 },
             { name: 'UpdatedAt', width: 200, displayName: $scope.LabelName('UpdatedAt', 'Insurance'), cellFilter: 'date:\'yyyy-MM-dd\'' },
            ],
        }
        SeaOttersSvc.GetAllInsuranceList().then(function (data) {
            $scope.ugInsurances.data = data.data.Results;
        });
    });

    $scope.LabelName = function (fieldName, tableName) {
        if ($scope.pageConfig) {
            var language = $scope.pageConfig.filter(function (obj) {
                if (obj.TableFieldName === fieldName && obj.TableName === tableName)
                    return obj;
            })[0];

            if ($rootScope.UserDetail && $rootScope.UserDetail.Language.toLowerCase() == 'Chinese'.toLowerCase()) {
                return language.CustomFieldNameForChinese;
            }
            return language.CustomFieldNameForEnglish;
        }
    };

    $scope.FilterInsurance = function () {
        $scope.insuranceGridApi.grid.refresh();
    };

    $scope.ugInsurances.onRegisterApi = function (gridApi) {
        $scope.insuranceGridApi = gridApi;
        $scope.insuranceGridApi.grid.registerRowsProcessor($scope.singleFilter, 200);
    };

    $scope.singleFilter = function (renderableRows) {
        var matcher = new RegExp($scope.filterInsuranceValue, 'i');
        renderableRows.forEach(function (row) {
            var match = false;
            ['InsuranceCode', 'InsuranceName'].forEach(function (field) {
                if (row.entity[field].match(matcher)) {
                    match = true;
                }
            });
            if (!match) {
                row.visible = false;
            }
        });
        return renderableRows;
    }

    $scope.AddIN = function () {
        $scope.insurance = {
            InsuranceID: 0, InsuranceCode: null, InsuranceName: null, Description: null, InsuranceCost: null, InsuranceCostMultiplierValue: 1
        };
        $scope.divView = false;
        $scope.divForm = true;
    };

    $scope.EditIN = function () {
        //debugger;
        var selectedIN = $scope.insuranceGridApi.selection.getSelectedRows();
        var recordCount = selectedIN.length;
        if (recordCount > 0) {
            var insuranceID = selectedIN[0].InsuranceID;
            SeaOttersSvc.GetInsuranceByID(insuranceID).then(function (data) {
                $scope.insurance = data.data.Results;
            });
            $scope.divForm = true;
        }
        else {
            SeaOttersSvc.ShowAlert(17, 1, [{ key: '[action]', value: 'edit' }]);
        }
        $scope.insuranceGridApi.selection.clearSelectedRows();
    };

    $scope.DeleteIN = function () {
        var selectedIN = $scope.insuranceGridApi.selection.getSelectedRows();
        var recordCount = selectedIN.length;
        SeaOttersSvc.ShowLoadingWheel(true);
        if (recordCount > 0) {
            var InsuranceID = selectedIN[0].InsuranceID;
            SeaOttersSvc.DeleteInsurance(InsuranceID).then(function (data) {
                SeaOttersSvc.ShowLoadingWheel(false);
                // debugger;
                if (data.data.Status == true) {
                    SeaOttersSvc.ShowAlert(data.data.MessageId, 3, [{ key: '[Data]', value: 'Insurance' }]);
                    SeaOttersSvc.GetAllInsuranceList().then(function (data) {
                        $scope.ugInsurances.data = data.data.Results;
                    });
                }
                else {
                    SeaOttersSvc.ShowAlert(data.data.MessageId, 0, {});
                }
            });
        }
        else {
            SeaOttersSvc.ShowAlert(17, 1, [{ key: '[action]', value: 'delete' }]);
        }
        $scope.insuranceGridApi.selection.clearSelectedRows();
    };

    $scope.SaveInsurance = function () {
        SeaOttersSvc.ShowLoadingWheel(true);
        //debugger;
        SeaOttersSvc.SaveInsurance($scope.insurance).then(function (data) {
            //alert('Data Saved Successfully!!!');
            if (data.data.Status == 1) {
                SeaOttersSvc.ShowAlert(4, 3, [{ key: '[Data]', value: 'Insurance' }]);
                SeaOttersSvc.ShowLoadingWheel(false);
                SeaOttersSvc.GetAllInsuranceList().then(function (data) {
                    $scope.ugInsurances.data = data.data.Results;
                    $scope.divView = true;
                    $scope.divForm = false;
                });
            }
            else {
                SeaOttersSvc.ShowLoadingWheel(false);
                SeaOttersSvc.ShowAlert(data.data.MessageId, 0, {});
                return;
            }
        });
    };
})
.controller('warehouseCtrl', function ($state, $scope, SeaOttersSvc, $rootScope) {
    if (!SeaOttersSvc.IsValidUser()) {
        $state.go('login');
        return;
    }

    SeaOttersSvc.UserRolePermission('Warehouse').then(function (data) {
        $scope.userRolePermission = data.data.Results;
        if ($scope.userRolePermission == null || $scope.userRolePermission[0].Access == 0) {
            SeaOttersSvc.ShowAlert(-1, 0, {});
        }
    });

    $scope.divForm = false;

    SeaOttersSvc.GetAllWarehouseList().then(function (data) {
        $scope.ugWarehouses.data = data.data.Results;
    });

    $scope.ugWarehouses = {
        enableFullRowSelection: true,
        enableFiltering: true,
        multiSelect: false,
        enableRowHeaderSelection: true,
        paginationPageSizes: [10, 20, 30, 40, 50, 100, 500],
        paginationPageSize: 20,

        enableGridMenu: true,
        exporterCsvFilename: 'Warehouse.csv',
        exporterPdfDefaultStyle: { fontSize: 9 },
        exporterPdfTableStyle: { margin: [30, 30, 30, 30] },
        exporterPdfTableHeaderStyle: { fontSize: 10, bold: true, italics: true, color: '#2A3F54' },
        exporterPdfHeader: { text: "Warehouse Details", style: 'headerStyle' },
        exporterPdfFooter: function (currentPage, pageCount) {
            return { text: currentPage.toString() + ' of ' + pageCount.toString(), style: 'footerStyle' };
        },
        exporterPdfCustomFormatter: function (docDefinition) {
            docDefinition.styles.headerStyle = { fontSize: 22, bold: true };
            docDefinition.styles.footerStyle = { fontSize: 10, bold: true };
            return docDefinition;
        },
        exporterPdfOrientation: 'landscape',
        exporterPdfPageSize: 'A4',
        exporterPdfMaxGridWidth: 500,
        exporterCsvLinkElement: angular.element(document.querySelectorAll(".custom-csv-link-location")),
    };

    SeaOttersSvc.GetPageDetailsByPageName('Warehouse').then(function (data) {
        $scope.pageConfig = data.data.Results;
        $scope.ugWarehouses = {
            columnDefs: [
             { name: 'WarehouseID', displayName: 'ID', visible: false, enableHiding: false },
             { name: 'WarehouseCode', displayName: $scope.LabelName('WarehouseCode', 'Warehouse'), width: 200 },
             { name: 'WarehouseName', displayName: $scope.LabelName('WarehouseName', 'Warehouse'), width: 200 },
             { name: 'WarehouseCost', displayName: $scope.LabelName('WarehouseCost', 'Warehouse'), width: 200 },
              { name: 'WarehouseCostMultiplierValue', displayName: $scope.LabelName('WarehouseCostMultiplierValue', 'Warehouse'), width: 200 },
             { name: 'InsertedByName', displayName: $scope.LabelName('InsertedBy', 'Warehouse'), width: 200 },
             { name: 'InsertedAt', width: 200, displayName: $scope.LabelName('InsertedAt', 'Warehouse'), cellFilter: 'date:\'yyyy-MM-dd\'' },
             { name: 'UpdatedByName', displayName: $scope.LabelName('UpdatedBy', 'Warehouse'), width: 200 },
             { name: 'UpdatedAt', width: 200, displayName: $scope.LabelName('UpdatedAt', 'Warehouse'), cellFilter: 'date:\'yyyy-MM-dd\'' },
            ],
        }
        SeaOttersSvc.GetAllWarehouseList().then(function (data) {
            $scope.ugWarehouses.data = data.data.Results;
        });
    });

    $scope.LabelName = function (fieldName, tableName) {
        if ($scope.pageConfig) {
            var language = $scope.pageConfig.filter(function (obj) {
                if (obj.TableFieldName === fieldName && obj.TableName === tableName)
                    return obj;
            })[0];

            if ($rootScope.UserDetail && $rootScope.UserDetail.Language.toLowerCase() == 'Chinese'.toLowerCase()) {
                return language.CustomFieldNameForChinese;
            }
            return language.CustomFieldNameForEnglish;
        }
    };

    $scope.FilterWarehouse = function () {
        $scope.warehouseGridApi.grid.refresh();
    };

    $scope.ugWarehouses.onRegisterApi = function (gridApi) {
        $scope.warehouseGridApi = gridApi;
        $scope.warehouseGridApi.grid.registerRowsProcessor($scope.singleFilter, 200);
    };

    $scope.singleFilter = function (renderableRows) {
        var matcher = new RegExp($scope.filterWarehouseValue, 'i');
        renderableRows.forEach(function (row) {
            var match = false;
            ['WarehouseCode', 'WarehouseName'].forEach(function (field) {
                if (row.entity[field].match(matcher)) {
                    match = true;
                }
            });
            if (!match) {
                row.visible = false;
            }
        });
        return renderableRows;
    }

    $scope.AddWR = function () {
        $scope.warehouse = {
            WarehouseID: 0, WarehouseCode: null, WarehouseName: null, Description: null, WarehouseCost: null, WarehouseCostMultiplierValue: 1
        };
        $scope.divView = false;
        $scope.divForm = true;
    };

    $scope.EditWR = function () {
        //debugger;
        var selectedWR = $scope.warehouseGridApi.selection.getSelectedRows();
        var recordCount = selectedWR.length;
        if (recordCount > 0) {
            var warehouseID = selectedWR[0].WarehouseID;
            SeaOttersSvc.GetWarehouseByID(warehouseID).then(function (data) {
                $scope.warehouse = data.data.Results;
            });
            $scope.divForm = true;
        }
        else {
            SeaOttersSvc.ShowAlert(17, 1, [{ key: '[action]', value: 'edit' }]);
        }
        $scope.warehouseGridApi.selection.clearSelectedRows();
    };

    $scope.DeleteWR = function () {
        var selectedWR = $scope.warehouseGridApi.selection.getSelectedRows();
        var recordCount = selectedWR.length;
        SeaOttersSvc.ShowLoadingWheel(true);
        if (recordCount > 0) {
            var warehouseID = selectedWR[0].WarehouseID;
            SeaOttersSvc.DeleteWarehouse(warehouseID).then(function (data) {
                SeaOttersSvc.ShowLoadingWheel(false);
                // debugger;
                if (data.data.Status == true) {
                    SeaOttersSvc.ShowAlert(data.data.MessageId, 3, [{ key: '[Data]', value: 'Warehouse' }]);
                    SeaOttersSvc.GetAllWarehouseList().then(function (data) {
                        $scope.ugWarehouses.data = data.data.Results;
                    });
                }
                else {
                    SeaOttersSvc.ShowAlert(data.data.MessageId, 0, {});
                }
            });
        }
        else {
            SeaOttersSvc.ShowAlert(17, 1, [{ key: '[action]', value: 'delete' }]);
        }
        $scope.warehouseGridApi.selection.clearSelectedRows();
    };

    $scope.SaveWarehouse = function () {
        SeaOttersSvc.ShowLoadingWheel(true);
        SeaOttersSvc.SaveWarehouse($scope.warehouse).then(function (data) {
            //alert('Data Saved Successfully!!!');
            if (data.data.Status == 1) {
                SeaOttersSvc.ShowAlert(4, 3, [{ key: '[Data]', value: 'Warehouse' }]);
                SeaOttersSvc.ShowLoadingWheel(false);
                SeaOttersSvc.GetAllWarehouseList().then(function (data) {
                    $scope.ugWarehouses.data = data.data.Results;
                    $scope.divView = true;
                    $scope.divForm = false;
                });
            }
            else {
                SeaOttersSvc.ShowLoadingWheel(false);
                SeaOttersSvc.ShowAlert(data.data.MessageId, 0, {});
                return;
            }
        });
    };
})
.controller('additionalUOMCtrl', function ($state, $scope, $http, SeaOttersSvc, $modal, $rootScope) {

    if (!SeaOttersSvc.IsValidUser()) {
        $state.go('login');
        return;
    }

    SeaOttersSvc.UserRolePermission('AdditionalUOM').then(function (data) {
        $scope.userRolePermission = data.data.Results;
        if ($scope.userRolePermission[0].Access == 0) {
            SeaOttersSvc.ShowAlert(-1, 0, {});
        }
    });

    var paginationOptions = {
        pageNumber: 1,
        pageSize: 20,
        sort: null
    };

    $scope.ugAdditionalUOM = {
        enableFullRowSelection: true,
        enableFiltering: true,
        useExternalPagination: true,
        multiSelect: false,
        enableRowHeaderSelection: true,
        paginationPageSizes: [10, 20, 30, 40, 50, 100, 500],
        paginationPageSize: 20,
        columnDefs: [
        { name: 'ID', displayName: 'ID', visible: false, enableHiding: false },
        { name: 'UOMName', displayName: 'Name', width: 200 },
        { name: 'InsertedByName', displayName: 'Inserted By', width: 200 },
        { name: 'InsertedAt', cellFilter: 'date:\'yyyy-MM-dd\'', width: 200 },
        { name: 'UpdatedByName', displayName: 'Updated By', width: 200 },
        { name: 'UpdatedAt', cellFilter: 'date:\'yyyy-MM-dd\'', width: 200 },
        { name: 'IsActive', width: 100 },
        ],
        enableGridMenu: true,
        exporterCsvFilename: 'Additionaluom.csv',
        exporterPdfDefaultStyle: { fontSize: 9 },
        exporterPdfTableStyle: { margin: [30, 30, 30, 30] },
        exporterPdfTableHeaderStyle: { fontSize: 10, bold: true, italics: true, color: '#2A3F54' },
        exporterPdfHeader: { text: "Additional UOM Details", style: 'headerStyle' },
        exporterPdfFooter: function (currentPage, pageCount) {
            return { text: currentPage.toString() + ' of ' + pageCount.toString(), style: 'footerStyle' };
        },
        exporterPdfCustomFormatter: function (docDefinition) {
            docDefinition.styles.headerStyle = { fontSize: 22, bold: true };
            docDefinition.styles.footerStyle = { fontSize: 10, bold: true };
            return docDefinition;
        },
        exporterPdfOrientation: 'landscape',
        exporterPdfPageSize: 'A4',
        exporterPdfMaxGridWidth: 500,
        exporterCsvLinkElement: angular.element(document.querySelectorAll(".custom-csv-link-location")),
    };

    SeaOttersSvc.GetPageDetailsByPageName('AdditionalUOM').then(function (data) {
        $scope.pageConfig = data.data.Results;

        $scope.ugAdditionalUOM.columnDefs = [
                { name: 'ID', displayName: 'ID', visible: false, enableHiding: false },
                { name: 'UOMName', displayName: $scope.LabelName('UOMName', 'AdditionalUOM'), width: 430 },
                { name: 'InsertedByName', displayName: $scope.LabelName('InsertedBy', 'AdditionalUOM'), width: 200 },
                { name: 'InsertedAt', displayName: $scope.LabelName('InsertedAt', 'AdditionalUOM'), cellFilter: 'date:\'yyyy-MM-dd\'', width: 200 },
                { name: 'UpdatedByName', displayName: $scope.LabelName('UpdatedBy', 'AdditionalUOM'), width: 200 },
                { name: 'UpdatedAt', displayName: $scope.LabelName('UpdatedAt', 'AdditionalUOM'), cellFilter: 'date:\'yyyy-MM-dd\'', width: 200 },
                { name: 'IsActive', displayName: $scope.LabelName('IsActive', 'AdditionalUOM'), width: 100 },
        ];

        LoadData();

    });

    $scope.LabelName = function (fieldName, tableName) {
        if ($scope.pageConfig) {
            var language = $scope.pageConfig.filter(function (obj) {
                if (obj.TableFieldName === fieldName && obj.TableName === tableName)
                    return obj;
            })[0];

            if ($rootScope.UserDetail && $rootScope.UserDetail.Language.toLowerCase() == 'Chinese'.toLowerCase()) {
                return language.CustomFieldNameForChinese;
            }
            return language.CustomFieldNameForEnglish;
        }
    };

    $scope.divForm = false;

    $scope.filterAdditionalUOMValue = '';

    function LoadData() {
        SeaOttersSvc.GetAdditionalUOMListByID(paginationOptions.pageNumber, paginationOptions.pageSize, $scope.filterAdditionalUOMValue).then(function (data) {
            $scope.ugAdditionalUOM.totalItems = data.data.Results.TotalRecords;
            $scope.ugAdditionalUOM.data = data.data.Results.Data;
        });
    };

    $scope.FilterAdditionalUOM = function () {
        paginationOptions.pageNumber = 1;
        paginationOptions.pageSize = 20;
        LoadData();
    };

    $scope.ugAdditionalUOM.onRegisterApi = function (gridApi) {
        $scope.AdditionaluomGridAPI = gridApi;
        gridApi.pagination.on.paginationChanged($scope, function (pageNumber, pageSize) {
            paginationOptions.pageNumber = pageNumber;
            paginationOptions.pageSize = pageSize;
            LoadData();
        });
    };

    $scope.AddAdditionalUOM = function () {
        $scope.additionaluom = {
            ID: 0, UOMName: null, IsActive: true,
        };
        $scope.divForm = true;
    };

    $scope.EditAdditionalUOM = function () {
        var selectedUOM = $scope.AdditionaluomGridAPI.selection.getSelectedRows();
        if (selectedUOM.length > 0) {
            var ID = selectedUOM[0].ID;
            SeaOttersSvc.GetAdditionalUOMDetailsByID(ID).then(function (data) {
                $scope.additionaluom = data.data.Results;
            });
            $scope.divForm = true;
        }
        else {
            SeaOttersSvc.ShowAlert(17, 1, [{ key: '[action]', value: 'edit' }]);
        }
        $scope.AdditionaluomGridAPI.selection.clearSelectedRows();
    };

    $scope.DeleteAdditionalUOM = function () {
        var selectedUOM = $scope.AdditionaluomGridAPI.selection.getSelectedRows();
        if (selectedUOM.length > 0) {
            var ID = selectedUOM[0].ID;
            SeaOttersSvc.DeleteAdditionalUOM(ID).then(function (data) {
                if (data.data.Status == true) {
                    SeaOttersSvc.ShowAlert(data.data.MessageId, 3, [{ key: '[Data]', value: 'Additional UOM' }]);
                    LoadData();
                }
                else {
                    SeaOttersSvc.ShowAlert(data.data.MessageId, 0, {});
                }
            });
        }
        else {
            SeaOttersSvc.ShowAlert(17, 1, [{ key: '[action]', value: 'delete' }]);
        }
        $scope.AdditionaluomGridAPI.selection.clearSelectedRows();
    };

    $scope.SaveAdditionalUOM = function () {
        SeaOttersSvc.SaveAdditionalUOM($scope.additionaluom).then(function (data) {
            if (data.data.Status == true) {
                SeaOttersSvc.ShowAlert(data.data.MessageId, 3, [{ key: '[Data]', value: 'Additional UOM' }]);
                LoadData();
                $scope.divForm = false;
            }
            else {
                SeaOttersSvc.ShowAlert(data.data.MessageId, 0, {});
            }
        });
    };
});