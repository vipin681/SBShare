// <reference path="../templates/QuoteLine.html" />
//var baseUrl = 'http://seaotters.cloudapp.net:8080/';
var baseUrl = 'http://localhost:51122/';

var app = angular.module('SeaOttersApp', ['SeaOttersCtrl'])

.run(function ($rootScope, $http) {
    $http.get(baseUrl + 'api/SeaOtters/DialogMessages').success(function (data) {
        if (data.Status === true) {
            $rootScope.Messages = data.Results;
        }
    }).error(function (err) {
        $rootScope.Messages = [];
    });
})
.config(function ($stateProvider, $urlRouterProvider, $locationProvider) {
    $stateProvider.state('home', { abstract: true, templateUrl: 'templates/home.html', controller: 'homeCtrl' })
    .state('login', { url: '/login', templateUrl: 'templates/login.html', controller: 'loginCtrl' })
    .state('home.reports', { url: '/reports', templateUrl: 'templates/reports.html', controller: 'reportsCtrl' })
    .state('home.customers', { url: '/customers', templateUrl: 'templates/customers.html', controller: 'customersCtrl' })
    .state('home.vendors', { url: '/vendors', templateUrl: 'templates/vendors.html', controller: 'vendorsCtrl' })
    .state('home.vendorTypes', { url: '/vendortypes', templateUrl: 'templates/vendortype.html', controller: 'vendorTypesCtrl' })
    .state('home.accounts', { url: '/accounts', templateUrl: 'templates/account.html', controller: 'accountCtrl' })
    .state('home.sales', { url: '/sales', templateUrl: 'templates/sales.html', controller: 'salesCtrl' })
    .state('home.factoryowners', { url: '/factoryowners', templateUrl: 'templates/factoryowners.html', controller: 'factoryOwnerCtrl' })
    .state('home.partfamily', { url: '/partfamily', templateUrl: 'templates/partfamily.html', controller: 'partfamilyCtrl' })
    .state('home.factory', { url: '/factory', templateUrl: 'templates/factory.html', controller: 'factoryCtrl' })
    .state('home.roletype', { url: '/roletype', templateUrl: 'templates/roletype.html', controller: 'roletypeCtrl' })
    .state('home.country', { url: '/country', templateUrl: 'templates/country.html', controller: 'countryCtrl' })
    .state('home.timezone', { url: '/timezone', templateUrl: 'templates/timezone.html', controller: 'timezoneCtrl' })
    .state('home.language', { url: '/language', templateUrl: 'templates/language.html', controller: 'languageCtrl' })
    .state('home.permission', { url: '/permission', templateUrl: 'templates/permission.html', controller: 'permissionCtrl' })
    .state('home.equipment', { url: '/equipment', templateUrl: 'templates/equipment.html', controller: 'equipmentCtrl' })
    .state('home.addressTypes', { url: '/addresstypes', templateUrl: 'templates/addresstype.html', controller: 'addressTypesCtrl' })
    .state('home.equipmentCategory', { url: '/equipmentCategory', templateUrl: 'templates/equipmentCategory.html', controller: 'equipmentCategoryCtrl' })
    .state('home.users', { url: '/users', templateUrl: 'templates/users.html', controller: 'usersCtrl' })
    .state('home.searchs', { url: '/searchs', templateUrl: 'templates/search.html', controller: 'searchCtrl' })
    .state('home.uom', { url: '/uom', templateUrl: 'templates/uom.html', controller: 'uomCtrl' })
    .state('home.parttype', { url: '/parttype', templateUrl: 'templates/parttype.html', controller: 'partTypeCtrl' })
    .state('home.partmaster', { url: '/partmaster', templateUrl: 'templates/partmaster.html', controller: 'partMasterCtrl' })
    .state('home.statusgroup', { url: '/statusgroup', templateUrl: 'templates/statusgroup.html', controller: 'statusGroupCtrl' })
    .state('home.pageConfigs', { url: '/pageConfigs', templateUrl: 'templates/pageConfig.html', controller: 'pageConfigCtrl' })
    .state('home.bomparts', { url: '/bomparts', templateUrl: 'templates/bomparts.html', controller: 'bompartCtrl' })
    .state('home.quote', { url: '/quote', templateUrl: 'templates/quote.html', controller: 'quoteCtrl' })
    .state('home.taxhead', { url: '/taxhead', templateUrl: 'templates/taxhead.html', controller: 'taxheadCtrl' })
    .state('home.quotestatus', { url: '/quotestatus', templateUrl: 'templates/quotestatus.html', controller: 'quotestatusCtrl' })
    .state('home.notificationtemplate', { url: '/notificationtemplate', templateUrl: 'templates/notificationtemplate.html', controller: 'notificationtemplateCtrl' })
    .state('home.offerstatus', { url: '/offerstatus', templateUrl: 'templates/offerstatus.html', controller: 'offerstatusCtrl' })
    .state('home.priceTerm', { url: '/priceTerm', templateUrl: 'templates/priceTerm.html', controller: 'priceTermCtrl' })
    .state('home.salescost', { url: '/salescost', templateUrl: 'templates/salescost.html', controller: 'salescostCtrl' })
    .state('home.freight', { url: '/freight', templateUrl: 'templates/freight.html', controller: 'freightCtrl' })
    .state('home.packing', { url: '/packing', templateUrl: 'templates/packing.html', controller: 'packingCtrl' })
    .state('home.insurance', { url: '/insurance', templateUrl: 'templates/insurance.html', controller: 'insuranceCtrl' })
    .state('home.warehouse', { url: '/warehouse', templateUrl: 'templates/warehouse.html', controller: 'warehouseCtrl' })
    .state('home.additionalUOM', { url: '/additionalUOM', templateUrl: 'templates/additionalUOM.html', controller: 'additionalUOMCtrl' })
    ;
    //$locationProvider.html5Mode(true);
    $urlRouterProvider.otherwise("/login");
})
.factory("SeaOttersSvc", ['$http', '$state', '$modal', '$rootScope', function ($http, $state, $modal, $rootScope) {
    function Toast(type, css, preventDuplicates) {
        this.type = type;
        this.css = css;
        this.preventDuplicates = true;
    }
    var toasts = [
        new Toast('error', 'toast-bottom-full-width'),
        new Toast('info', 'toast-bottom-full-width'),
        new Toast('warning', 'toast-bottom-full-width'),
        new Toast('success', 'toast-bottom-full-width'),
    ];
    function ShowAlertMessage(msg, no, whitner) {

        var showMessage = null;

        if (msg === -1) {
            $rootScope.UserDetail = null;
            $rootScope.UserMenuList = null;
            $state.go('login');
            return;
        }
        else if (msg === 0) {
            return;
        }

        if ($rootScope.Messages != undefined) {

            var message = $rootScope.Messages.filter(function (obj) {
                return obj.Id === msg;
            })[0];

            showMessage = { Id: message.MessageId, Message: message.Message };
        }

        if (showMessage == null) {
            showMessage = { Id: 0, Message: 'Message file is not updated, Kindly check !!' };
            no = 2;
        }
        for (i = 0; i < whitner.length; i++) {
            showMessage.Message = showMessage.Message.replace(whitner[i].key, whitner[i].value);
        }

        var t = toasts[no];
        toastr.options.positionClass = t.css;
        toastr.options.preventDuplicates = t.preventDuplicates;
        toastr[t.type](showMessage.Message);
    };
    function loadingwheel(bool) {

        var html = "";
        if (bool) {
            html += "<div id='mask'></div>";
            html += "<div class='loadingwheel'>";
            html += "<i class=\"fa fa-cog fa-spin\" style=\"font-size:50px;color:#2a3f54;\"></i>";
            html += "</div>";

            $("#loadingwheel").html(html);
        }
        else {
            $("#loadingwheel").html("");
        }
    };
    return {
        ShowAlert: function (msg, no, whitner) {
            ShowAlertMessage(msg, no, whitner);
        },
        ShowLoadingWheel: function (bool) {
            loadingwheel(bool);
        },
        GetMenuListByUserID: function () {
            loadingwheel(true);
            return $http.get(baseUrl + 'api/SeaOtters/UserMenu').success(function (data) {
                loadingwheel(false);
                if (data.Status === true) {
                    return data.Results;
                } else {
                    ShowAlertMessage(data.MessageId, 0, {});
                }
            }).error(function (err) {
                loadingwheel(false);
            });
        },
        GetSystemConfigByUserID: function () {
            loadingwheel(true);
            return $http.get(baseUrl + 'api/SeaOtters/SystemConfig').success(function (data) {
                loadingwheel(false);
                if (data.Status === true) {
                    return data.Results;
                } else {
                    ShowAlertMessage(data.MessageId, 0, {});
                }
            }).error(function (err) {
                loadingwheel(false);
            });
        },
        GetCustomerListByUserID: function (pageNumber, pageSize, keyword) {
            loadingwheel(true);
            return $http.get(baseUrl + 'api/SeaOtters/Customers?pageNumber=' + pageNumber + '&pageSize=' + pageSize + '&keyword=' + keyword).success(function (data) {
                loadingwheel(false);
                if (data.Status === true) {
                    return data.Results;
                } else {
                    ShowAlertMessage(data.MessageId, 0, [{ key: '[Data]', value: 'Customer' }]);
                }
            }).error(function (err) {
                loadingwheel(false);
            });
        },
        SaveCustomer: function (customer) {
            loadingwheel(true);
            return $http({
                url: baseUrl + 'api/SeaOtters/Customer',
                method: 'POST',
                data: customer
            }).success(function (data) {
                loadingwheel(false);
                if (data.Status === true) {
                    return data.Results;
                }
                else {
                    ShowAlertMessage(data.MessageId == 5 ? 1 : data.MessageId, 0, [{ key: '[Data]', value: data.MessageId == 1 ? 'Account' : 'Customer' }]);
                }
            }).error(function (err) {
                loadingwheel(false);
            });
        },
        DeleteCustomer: function (customerID) {
            loadingwheel(true);
            return $http.post(baseUrl + 'api/SeaOtters/Customers/' + customerID + '/Delete').success(function (data) {
                loadingwheel(false);
                if (data.Status === true) {
                    return data.Results;
                } else {
                    ShowAlertMessage(data.MessageId, 0, [{ key: '[Data]', value: 'Customer' }]);
                }
            }).error(function (err) {
                loadingwheel(false);
            });
        },
        GetCustomerDetailsByCustomerID: function (customerID) {
            loadingwheel(true);
            return $http.get(baseUrl + 'api/SeaOtters/Customers/' + customerID).success(function (data) {
                loadingwheel(false);
                if (data.Status === true) {
                    return data.Results;
                } else {
                    ShowAlertMessage(data.MessageId, 0, [{ key: '[Data]', value: 'Customer' }]);
                }
            }).error(function (err) {
                loadingwheel(false);
            });
        },
        IsValidUser: function () {
            var user = $rootScope.UserDetail;
            if (user) {
                return true
            }
            else {
                return false;
            }
        },
        GetVendorTypeList: function () {
            return $http.get(baseUrl + 'api/SeaOtters/VendorTypes').success(function (data) {
                return data.Results;
            });
        },
        GetAccountList: function () {
            return $http.get(baseUrl + 'api/SeaOtters/Accounts').success(function (data) {
                return data.Results;
            });
        },
        GetFactoryOwnerList: function (pageNumber, pageSize, keyword) {
            return $http.get(baseUrl + 'api/SeaOtters/FactoryOwners?pageNumber=' + pageNumber + '&pageSize=' + pageSize + '&Keyword=' + keyword).success(function (data) {
                if (data.Status === true) {
                    return data.Results;
                } else {
                    //ShowAlertMessage(data.MessageId, 0, [{ key: '[Data]', value: 'Vendor' }]);
                }
            }).error(function (err) {
                loadingwheel(false);
            });
        },

        SaveFactoryOwner: function (factoryOwner) {
            return $http({
                url: baseUrl + 'api/SeaOtters/FactoryOwner',
                method: 'POST',
                data: factoryOwner
            }).success(function (data) {
                return data.Results;
            });
        },
        SaveVendorType: function (vendorType) {
            return $http({
                url: baseUrl + 'api/SeaOtters/VendorType',
                method: 'POST',
                data: vendorType
            }).success(function (data) {
                return data.Results;
            });
        },
        GetPartFamilyList: function () {
            return $http.get(baseUrl + 'api/SeaOtters/PartFamilies').success(function (data) {
                return data.Results;
            });
        },
        GetCostGroupDetailsByPriceTermID: function (priceTermID) {
            return $http.get(baseUrl + 'api/SeaOtters/CostGroups/' + priceTermID).success(function (data) {
                return data.Results;
            });
        },
        SavePartFamily: function (partfamily) {
            return $http({
                url: baseUrl + 'api/SeaOtters/PartFamily',
                method: 'POST',
                data: partfamily
            }).success(function (data) {
                return data.Results;
            });
        },
        SaveAccount: function (account) {
            return $http({
                url: baseUrl + 'api/SeaOtters/Account',
                method: 'POST',
                data: account
            }).success(function (data) {
                return data.Results;
            });
        },
        GetCountryList: function () {
            return $http.get(baseUrl + 'api/SeaOtters/Countries').success(function (data) {
                return data.Results;
            });
        },
        GetAllCurrencyList: function () {
            return $http.get(baseUrl + 'api/SeaOtters/Currencies').success(function (data) {
                return data.Results;
            });
        },
        GetAddressTypeDataList: function () {
            return $http.get(baseUrl + 'api/SeaOtters/AddressTypes').success(function (data) {
                return data.Results;
            });
        },
        ShowCustomerAddressModal: function (addressTypes, countries, customerAddress, pageConfig, userLanguage, AddressDetailsCtrl) {
            var modalInstance = $modal.open({
                templateUrl: 'AddressDetails.html',
                controller: AddressDetailsCtrl,
                resolve: {
                    countries: function () {
                        return countries;
                    },
                    addressTypes: function () {
                        return addressTypes;
                    },
                    customerAddress: function () {
                        return customerAddress;
                    },
                    pageConfig: function () {
                        return pageConfig;
                    },
                    userLanguage: function () { return userLanguage; }

                }
            });
            return modalInstance;
        },
        ShowCustomerContactModal: function (countries, customerContact, pageConfig, userLanguage, ContactDetailsCtrl) {
            var modalInstance = $modal.open({
                templateUrl: 'ContactDetails.html',
                controller: ContactDetailsCtrl,
                resolve: {
                    countries: function () {
                        return countries;
                    },
                    customerContact: function () {
                        return customerContact;
                    },
                    pageConfig: function () {
                        return pageConfig;
                    },
                    userLanguage: function () { return userLanguage; }
                }
            });
            return modalInstance;
        },
        GetVendorTypeDetailsByVTID: function (vendorTypeID) {
            return $http.get(baseUrl + 'api/SeaOtters/VendorTypes/' + vendorTypeID).success(function (data) {
                return data.Results;
            });
        },
        GetPartFamilyDetailsByPFID: function (partfamilyID) {
            return $http.get(baseUrl + 'api/SeaOtters/PartFamilies/' + partfamilyID).success(function (data) {
                return data.Results;
            });
        },
        GetFactoryOwnerDetailsByFOID: function (factoryOwnerID) {
            return $http.get(baseUrl + 'api/SeaOtters/FactoryOwners/' + factoryOwnerID).success(function (data) {
                return data.Results;
            });
        },
        GetAccountDetailsByAID: function (accountID) {
            return $http.get(baseUrl + 'api/SeaOtters/Accounts/' + accountID).success(function (data) {
                return data.Results;
            });
        },
        GetFactoryList: function (pageNumber, pageSize, keyword) {
            return $http.get(baseUrl + 'api/SeaOtters/Factorys?pageNumber=' + pageNumber + '&pageSize=' + pageSize + '&Keyword=' + keyword).success(function (data) {
                if (data.Status === true) {
                    return data.Results;
                } else {
                    ShowAlertMessage(data.MessageId, 0, [{ key: '[Data]', value: 'Factory' }]);
                }
            }).error(function (err) {
                loadingwheel(false);
            });
        },
        GetAllFactoryList: function () {
            return $http.get(baseUrl + 'api/SeaOtters/Factories').success(function (data) {
                return data.Results;
            });
        },
        GetFactoryDetailsByID: function (FactoryID) {
            //alert(factoryID);

            return $http.get(baseUrl + 'api/SeaOtters/Factorys/' + FactoryID).success(function (data) {

                return data.Results;
            });
        },
        SaveFactory: function (factory) {

            return $http({
                url: baseUrl + 'api/SeaOtters/Factory',
                method: 'POST',
                data: factory
            }).success(function (data) {
                return data.Results;
            });
        },
        DeleteVendorType: function (vendorTypeID) {
            return $http.post(baseUrl + 'api/SeaOtters/VendorTypes/' + vendorTypeID + '/Delete').success(function (data) {
                return data.Results;
            });
        },
        DeleteFactoryOwner: function (factoryOwnerID) {
            return $http.post(baseUrl + 'api/SeaOtters/FactoryOwners/' + factoryOwnerID + '/Delete').success(function (data) {
                return data.Results;
            });
        },
        DeleteFactory: function (FactoryID) {
            return $http.post(baseUrl + 'api/SeaOtters/Factorys/' + FactoryID + '/Delete').success(function (data) {
                return data.Results;
            });
        },
        GetRoleTypeList: function () {
            return $http.get(baseUrl + 'api/SeaOtters/RoleTypes').success(function (data) {
                return data.Results;
            });
        },
        GetRoleTypeDetailsByRTID: function (roleTypeID) {
            return $http.get(baseUrl + 'api/SeaOtters/RoleTypes/' + roleTypeID).success(function (data) {
                return data.Results;
            });
        },
        SaveRoleType: function (roleType) {
            return $http({
                url: baseUrl + 'api/SeaOtters/RoleType',
                method: 'POST',
                data: roleType
            }).success(function (data) {
                return data.Results;
            });
        },
        DeleteRoleType: function (roleTypeID) {
            return $http.post(baseUrl + 'api/SeaOtters/RoleTypes/' + roleTypeID + '/Delete').success(function (data) {
                return data.Results;
            });
        },
        DeletePartFamily: function (partfamilyID) {
            return $http.post(baseUrl + 'api/SeaOtters/PartFamilies/' + partfamilyID + '/Delete').success(function (data) {
                return data.Results;
            });
        },
        GetAllCountry: function () {
            return $http.get(baseUrl + 'api/SeaOtters/AllCountries').success(function (data) {
                return data.Results;
            });
        },
        GetTimeZoneList: function () {
            return $http.get(baseUrl + 'api/SeaOtters/Timezones').success(function (data) {
                return data.Results;
            });
        },
        GetLanguageList: function () {
            return $http.get(baseUrl + 'api/SeaOtters/Languages').success(function (data) {
                return data.Results;
            });
        },
        GetVendorListByUserID: function (pageNumber, pageSize, keyword) {
            loadingwheel(true);
            return $http.get(baseUrl + 'api/SeaOtters/Vendors?pageNumber=' + pageNumber + '&pageSize=' + pageSize + '&Keyword=' + keyword).success(function (data) {
                loadingwheel(false);
                if (data.Status === true) {
                    return data.Results;
                } else {
                    //ShowAlertMessage(data.MessageId, 0, [{ key: '[Data]', value: 'Vendor' }]);
                }
            }).error(function (err) {
                loadingwheel(false);
            });
        },
        SaveVendor: function (vendor) {
            loadingwheel(true);
            return $http({
                url: baseUrl + 'api/SeaOtters/Vendor',
                method: 'POST',
                data: vendor
            }).success(function (data) {
                loadingwheel(false);
                if (data.Status === true) {
                    return data.Results;
                }
                else {
                    ShowAlertMessage(data.MessageId == 5 ? 1 : data.MessageId, 0, [{ key: '[Data]', value: data.MessageId == 1 ? 'Account' : 'Vendor' }]);
                }
            }).error(function (err) {
                loadingwheel(false);
            });
        },
        DeleteVendor: function (vendorID) {
            loadingwheel(true);
            return $http.post(baseUrl + 'api/SeaOtters/Vendors/' + vendorID + '/Delete').success(function (data) {
                loadingwheel(false);
                if (data.Status === true) {
                    return data.Results;
                } else {
                    ShowAlertMessage(data.MessageId, 0, [{ key: '[Data]', value: 'Vendor' }]);
                }
            }).error(function (err) {
                loadingwheel(false);
            });
        },
        GetVendorDetailsByVendorID: function (vendorID) {
            loadingwheel(true);
            return $http.get(baseUrl + 'api/SeaOtters/Vendors/' + vendorID).success(function (data) {
                loadingwheel(false);
                if (data.Status === true) {
                    return data.Results;
                } else {
                    //ShowAlertMessage(data.MessageId, 0, [{ key: '[Data]', value: 'Vendor' }]);
                }
            }).error(function (err) {
                loadingwheel(false);
            });
        },
        ShowVendorAddressModal: function (addressTypes, countries, vendorAddress, pageConfig, userLanguage, AddressDetailsCtrl) {
            var modalInstance = $modal.open({
                templateUrl: 'AddressDetails.html',
                controller: AddressDetailsCtrl,
                resolve: {
                    countries: function () {
                        return countries;
                    },
                    addressTypes: function () {
                        return addressTypes;
                    },
                    vendorAddress: function () { return vendorAddress; },
                    pageConfig: function () { return pageConfig; },
                    userLanguage: function () { return userLanguage; }
                }
            });
            return modalInstance;
        },
        ShowVendorContactModal: function (countries, vendorContact, pageConfig, userLanguage, ContactDetailsCtrl) {
            var modalInstance = $modal.open({
                templateUrl: 'ContactDetails.html',
                controller: ContactDetailsCtrl,
                resolve: {
                    countries: function () {
                        return countries;
                    },
                    vendorContact: function () {
                        return vendorContact;
                    },
                    pageConfig: function () {
                        return pageConfig;
                    },
                    userLanguage: function () { return userLanguage; }
                }
            });
            return modalInstance;
        },

        GetEquipmentCategoryList: function () {
            return $http.get(baseUrl + 'api/SeaOtters/EquipmentCategorys').success(function (data) {
                return data.Results;
            });
        },
        GetEquipmentCategoryDetailsByID: function (equipmentCategoryID) {

            return $http.get(baseUrl + 'api/SeaOtters/EquipmentCategorys/' + equipmentCategoryID).success(function (data) {
                //
                return data.Results;
            });
        },
        SaveEquipmentCategory: function (equipmentCategory) {

            return $http({
                url: baseUrl + 'api/SeaOtters/EquipmentCategory',
                method: 'POST',
                data: equipmentCategory
            }).success(function (data) {
                return data.Results;
            });
        },
        DeleteEquipmentCategory: function (equipmentCategoryID) {
            return $http.post(baseUrl + 'api/SeaOtters/EquipmentCategorys/' + equipmentCategoryID + '/Delete').success(function (data) {
                return data.Results;
            });
        },
        GetEquipmentList: function (pageNumber, pageSize, keyword) {
            return $http.get(baseUrl + 'api/SeaOtters/Equipments?pageNumber=' + pageNumber + '&pageSize=' + pageSize + '&Keyword=' + keyword).success(function (data) {
                if (data.Status === true) {
                    return data.Results;
                } else {
                    ShowAlertMessage(data.MessageId, 0, [{ key: '[Data]', value: 'Equipments' }]);
                }
            }).error(function (err) {
                loadingwheel(false);
            });
        },
        GetEquipmentDetailByID: function (equipmentID) {
            return $http.get(baseUrl + 'api/SeaOtters/Equipments/' + equipmentID).success(function (data) {
                return data.Results;
            });
        },
        SaveEquipment: function (equipment) {

            return $http({
                url: baseUrl + 'api/SeaOtters/Equipment',
                method: 'POST',
                data: equipment
            }).success(function (data) {
                return data.Results;
            });
        },
        DeleteEquipment: function (equipmentID) {
            return $http.post(baseUrl + 'api/SeaOtters/Equipments/' + equipmentID + '/Delete').success(function (data) {
                return data.Results;
            });
        },

        GetUserListByUserID: function (pageNumber, pageSize, keyword) {
            loadingwheel(true);
            return $http.get(baseUrl + 'api/SeaOtters/Users?pageNumber=' + pageNumber + '&pageSize=' + pageSize + '&Keyword=' + keyword).success(function (data) {
                loadingwheel(false);
                if (data.Status === true) {
                    return data.Results;
                } else {
                    ShowAlertMessage(data.MessageId, 0, [{ key: '[Data]', value: 'User' }]);
                }
            }).error(function (err) {
                loadingwheel(false);
            });
        },
        SaveUser: function (user) {
            loadingwheel(true);
            return $http({
                url: baseUrl + 'api/SeaOtters/User',
                method: 'POST',
                data: user
            }).success(function (data) {
                loadingwheel(false);
                if (data.Status === true) {
                    return data.Results;
                }
                else {
                    ShowAlertMessage(data.MessageId == 5 ? 1 : data.MessageId, 0, [{ key: '[Data]', value: data.MessageId == 1 ? 'Account' : 'User' }]);
                }
            }).error(function (err) {
                loadingwheel(false);
            });
        },
        DeleteUser: function (userID) {
            loadingwheel(true);
            return $http.post(baseUrl + 'api/SeaOtters/Users/' + userID + '/Delete').success(function (data) {
                loadingwheel(false);
                if (data.Status === true) {
                    return data.Results;
                } else {
                    ShowAlertMessage(data.MessageId, 0, [{ key: '[Data]', value: 'User' }]);
                }
            }).error(function (err) {
                loadingwheel(false);
            });
        },
        GetUserDetailsByUserID: function (userID) {
            loadingwheel(true);
            return $http.get(baseUrl + 'api/SeaOtters/Users/' + userID).success(function (data) {
                loadingwheel(false);
                if (data.Status === true) {
                    return data.Results;
                } else {
                    ShowAlertMessage(data.MessageId, 0, [{ key: '[Data]', value: 'User' }]);
                }
            }).error(function (err) {
                loadingwheel(false);
            });
        },
        ShowRoleModal: function (userRoleAccessMap, roleTypes, pageConfig, userLanguage, RoleDetailsCtrl) {
            var modalInstance = $modal.open({
                templateUrl: 'RoleDetails.html',
                controller: RoleDetailsCtrl,
                resolve: {
                    roleTypes: function () {
                        return roleTypes;
                    },
                    pageConfig: function () {
                        return pageConfig;
                    },
                    userLanguage: function () {
                        return userLanguage;
                    },
                    userRoleAccessMap: function () { return userRoleAccessMap; }
                }
            });
            return modalInstance;
        },
        ShowPasswordModal: function (PasswordDetailsCtrl) {
            var modalInstance = $modal.open({
                templateUrl: 'PasswordDetails.html',
                controller: PasswordDetailsCtrl
            });
            return modalInstance;
        },


        GetAllPageFunctionsByRoleID: function (roleTypeID) {
            return $http.get(baseUrl + 'api/SeaOtters/RolePermissions/' + roleTypeID).success(function (data) {
                return data.Results;
            });
        },
        SaveRolePermission: function (Updated) {

            return $http({
                url: baseUrl + 'api/SeaOtters/RolePermission',
                method: 'POST',
                data: Updated
                //data: $.param(Updated),
            }).success(function (data) {
                return data.Results;
            });
        },

        GetAddressTypeList: function () {
            return $http.get(baseUrl + 'api/SeaOtters/AddTypes').success(function (data) {
                return data.Results;
            });
        },
        DeleteAddressType: function (addressTypeID) {
            return $http.post(baseUrl + 'api/SeaOtters/AddTypes/' + addressTypeID + '/Delete').success(function (data) {
                return data.Results;
            });
        },
        SaveAddressType: function (addressType) {
            return $http({
                url: baseUrl + 'api/SeaOtters/AddType',
                method: 'POST',
                data: addressType
            }).success(function (data) {
                return data.Results;
            });
        },
        GetAddressTypeDetailsByVTID: function (addressTypeID) {
            return $http.get(baseUrl + 'api/SeaOtters/AddTypes/' + addressTypeID).success(function (data) {
                return data.Results;
            });
        },

        UserRolePermission: function (pageName) {
            loadingwheel(true);
            return $http.get(baseUrl + 'api/SeaOtters/UserRolePermission?pageName=' + pageName).success(function (data) {
                loadingwheel(false);
                if (data.Status === true) {
                    return data.Results;
                }
            }).error(function (err) {
                loadingwheel(false);
            });
        },

        SearchList: function () {
            var seachV = '';
            return $http.get(baseUrl + 'api/SeaOtters/GlobalSearch').success(function (data) {
                return data.Results;
            });
        },

        GetPageDetailsByPageName: function (pageName) {
            loadingwheel(true);
            return $http.get(baseUrl + 'api/SeaOtters/GetPageDetail?pageName=' + pageName).success(function (data) {
                loadingwheel(false);
                if (data.Status === true) {
                    return data.Results;
                }
                else {
                    ShowAlertMessage(data.MessageId, 0, [{ key: '[Data]', value: 'Page Details' }]);
                }
            }).error(function (err) {
                loadingwheel(false);
            });
        },

        GetAllFactoryOwnerList: function () {
            return $http.get(baseUrl + 'api/SeaOtters/AllFactoryOwners').success(function (data) {
                return data.Results;
            });
        },

        GetSystemPageList: function (pageNumber, pageSize, keyword) {
            return $http.get(baseUrl + 'api/SeaOtters/GetSystemPages?pageNumber=' + pageNumber + '&pageSize=' + pageSize + '&Keyword=' + keyword).success(function (data) {
                if (data.Status === true) {
                    return data.Results;
                } else {
                    //ShowAlertMessage(data.MessageId, 0, [{ key: '[Data]', value: 'Vendor' }]);
                }
            }).error(function (err) {
                loadingwheel(false);
            });
        },

        SavePageConfig: function (pageConfig) {
            return $http({
                url: baseUrl + 'api/SeaOtters/PageConfigs',
                method: 'POST',
                data: pageConfig
            }).success(function (data) {
                return data.Results;
            });
        },

        SaveUOM: function (uom) {
            loadingwheel(true);
            return $http({
                url: baseUrl + 'api/SeaOtters/UOM',
                method: 'POST',
                data: uom
            }).success(function (data) {
                loadingwheel(false);
                if (data.Status === true) {
                    return data.Results;
                }
                else {
                    ShowAlertMessage(data.MessageId == 5 ? 1 : data.MessageId, 0, [{ key: '[Data]', value: data.MessageId == 1 ? 'Account' : 'UOM' }]);
                }
            }).error(function (err) {
                loadingwheel(false);
            });
        },
        GetUOMListByID: function (pageNumber, pageSize, keyword) {
            loadingwheel(true);
            return $http.get(baseUrl + 'api/SeaOtters/UOMs?pageNumber=' + pageNumber + '&pageSize=' + pageSize + '&Keyword=' + keyword).success(function (data) {
                loadingwheel(false);
                if (data.Status === true) {
                    return data.Results;
                } else {
                    ShowAlertMessage(data.MessageId, 0, [{ key: '[Data]', value: 'UOM' }]);
                }
            }).error(function (err) {
                loadingwheel(false);
            });
        },
        GetUOMDetailsByID: function (ID) {
            loadingwheel(true);
            return $http.get(baseUrl + 'api/SeaOtters/UOMs/' + ID).success(function (data) {
                loadingwheel(false);
                if (data.Status === true) {
                    return data.Results;
                } else {
                    ShowAlertMessage(data.MessageId, 0, [{ key: '[Data]', value: 'UOM' }]);
                }
            }).error(function (err) {
                loadingwheel(false);
            });
        },
        DeleteUOM: function (ID) {
            loadingwheel(true);
            return $http.post(baseUrl + 'api/SeaOtters/UOM/' + ID + '/Delete').success(function (data) {
                loadingwheel(false);
                if (data.Status === true) {
                    return data.Results;
                } else {
                    ShowAlertMessage(data.MessageId, 0, [{ key: '[Data]', value: 'UOM' }]);
                }
            }).error(function (err) {
                loadingwheel(false);
            });
        },

        SavePartType: function (parttype) {
            loadingwheel(true);
            return $http({
                url: baseUrl + 'api/SeaOtters/PartType',
                method: 'POST',
                data: parttype
            }).success(function (data) {
                loadingwheel(false);
                if (data.Status === true) {
                    return data.Results;
                }
                else {
                    ShowAlertMessage(data.MessageId == 5 ? 1 : data.MessageId, 0, [{ key: '[Data]', value: data.MessageId == 1 ? 'Account' : 'PartType' }]);
                }
            }).error(function (err) {
                loadingwheel(false);
            });
        },
        GetPartTypeListByID: function (pageNumber, pageSize, keyword) {
            loadingwheel(true);
            return $http.get(baseUrl + 'api/SeaOtters/PartTypes?pageNumber=' + pageNumber + '&pageSize=' + pageSize + '&Keyword=' + keyword).success(function (data) {
                loadingwheel(false);
                if (data.Status === true) {
                    return data.Results;
                } else {
                    ShowAlertMessage(data.MessageId, 0, [{ key: '[Data]', value: 'PartType' }]);
                }
            }).error(function (err) {
                loadingwheel(false);
            });
        },
        GetPartTypeDetailsByID: function (ID) {
            loadingwheel(true);
            return $http.get(baseUrl + 'api/SeaOtters/PartTypes/' + ID).success(function (data) {
                loadingwheel(false);
                if (data.Status === true) {
                    return data.Results;
                } else {
                    ShowAlertMessage(data.MessageId, 0, [{ key: '[Data]', value: 'PartType' }]);
                }
            }).error(function (err) {
                loadingwheel(false);
            });
        },
        DeletePartType: function (ID) {
            loadingwheel(true);
            return $http.post(baseUrl + 'api/SeaOtters/PartType/' + ID + '/Delete').success(function (data) {
                loadingwheel(false);
                if (data.Status === true) {
                    return data.Results;
                } else {
                    ShowAlertMessage(data.MessageId, 0, [{ key: '[Data]', value: 'PartType' }]);
                }
            }).error(function (err) {
                loadingwheel(false);
            });
        },
        GetPartTypeList: function () {
            return $http.get(baseUrl + 'api/SeaOtters/PartTypeList').success(function (data) {
                return data.Results;
            });
        },

        SavePartMaster: function (partmaster) {
            loadingwheel(true);
            return $http({
                url: baseUrl + 'api/SeaOtters/PartMaster',
                method: 'POST',
                data: partmaster
            }).success(function (data) {
                loadingwheel(false);
                if (data.Status === true) {
                    return data.Results;
                }
                else {
                    ShowAlertMessage(data.MessageId == 5 ? 1 : data.MessageId, 0, [{ key: '[Data]', value: data.MessageId == 1 ? 'Account' : 'PartMaster' }]);
                }
            }).error(function (err) {
                loadingwheel(false);
            });
        },
        GetPartMasterListByID: function (pageNumber, pageSize, keyword) {
            loadingwheel(true);
            return $http.get(baseUrl + 'api/SeaOtters/PartMasters?pageNumber=' + pageNumber + '&pageSize=' + pageSize + '&Keyword=' + keyword).success(function (data) {
                loadingwheel(false);
                if (data.Status === true) {
                    return data.Results;
                } else {
                    ShowAlertMessage(data.MessageId, 0, [{ key: '[Data]', value: 'PartMaster' }]);
                }
            }).error(function (err) {
                loadingwheel(false);
            });
        },
        GetPartMasterDetailsByID: function (ID) {
            loadingwheel(true);
            return $http.get(baseUrl + 'api/SeaOtters/PartMasters/' + ID).success(function (data) {
                loadingwheel(false);
                if (data.Status === true) {
                    return data.Results;
                } else {
                    ShowAlertMessage(data.MessageId, 0, [{ key: '[Data]', value: 'PartMaster' }]);
                }
            }).error(function (err) {
                loadingwheel(false);
            });
        },
        DeletePartMaster: function (ID) {
            loadingwheel(true);
            return $http.post(baseUrl + 'api/SeaOtters/PartMaster/' + ID + '/Delete').success(function (data) {
                loadingwheel(false);
                if (data.Status === true) {
                    return data.Results;
                } else {
                    ShowAlertMessage(data.MessageId, 0, [{ key: '[Data]', value: 'PartMaster' }]);
                }
            }).error(function (err) {
                loadingwheel(false);
            });
        },
        GetUOMListByUserID: function () {
            return $http.get(baseUrl + 'api/SeaOtters/UOMList').success(function (data) {
                return data.Results;
            });
        },

        SaveStatusGroup: function (statusGroup) {
            loadingwheel(true);
            return $http({
                url: baseUrl + 'api/SeaOtters/StatusGroup',
                method: 'POST',
                data: statusGroup
            }).success(function (data) {
                loadingwheel(false);
                if (data.Status === true) {
                    return data.Results;
                }
                else {
                    ShowAlertMessage(data.MessageId == 5 ? 1 : data.MessageId, 0, [{ key: '[Data]', value: data.MessageId == 1 ? 'Account' : 'StatusGroup' }]);
                }
            }).error(function (err) {
                loadingwheel(false);
            });
        },
        GetStatusGroupListByUserID: function (pageNumber, pageSize, keyword) {
            loadingwheel(true);
            return $http.get(baseUrl + 'api/SeaOtters/StatusGroups?pageNumber=' + pageNumber + '&pageSize=' + pageSize + '&Keyword=' + keyword).success(function (data) {
                loadingwheel(false);
                if (data.Status === true) {
                    return data.Results;
                } else {
                    ShowAlertMessage(data.MessageId, 0, [{ key: '[Data]', value: 'StatusGroup' }]);
                }
            }).error(function (err) {
                loadingwheel(false);
            });
        },
        GetStatusGroupDetailsByID: function (ID) {
            loadingwheel(true);
            return $http.get(baseUrl + 'api/SeaOtters/StatusGroups/' + ID).success(function (data) {
                loadingwheel(false);
                if (data.Status === true) {
                    return data.Results;
                } else {
                    ShowAlertMessage(data.MessageId, 0, [{ key: '[Data]', value: 'StatusGroup' }]);
                }
            }).error(function (err) {
                loadingwheel(false);
            });
        },
        DeleteStatusGroup: function (ID) {
            loadingwheel(true);
            return $http.post(baseUrl + 'api/SeaOtters/StatusGroup/' + ID + '/Delete').success(function (data) {
                loadingwheel(false);
                if (data.Status === true) {
                    return data.Results;
                } else {
                    ShowAlertMessage(data.MessageId, 0, [{ key: '[Data]', value: 'StatusGroup' }]);
                }
            }).error(function (err) {
                loadingwheel(false);
            });
        },
        GetAllBOMedParts: function (type) {
            loadingwheel(true);
            return $http.get(baseUrl + 'api/SeaOtters/AllBOMedParts?type=' + type).success(function (data) {
                loadingwheel(false);
                if (data.Status === true) {
                    return data.Results;
                }
                else {
                    //ShowAlertMessage(data.MessageId, 0, [{ key: '[Data]', value: 'BOM Parts' }]);
                }
            }).error(function (err) {
                loadingwheel(false);
            });
        },
        GetAllSavedBOMedParts: function () {
            loadingwheel(true);
            return $http.get(baseUrl + 'api/SeaOtters/AllSavedBOMedParts').success(function (data) {
                loadingwheel(false);
                if (data.Status === true) {
                    return data.Results;
                }
                else {
                    //ShowAlertMessage(data.MessageId, 0, [{ key: '[Data]', value: 'BOM Parts' }]);
                }
            }).error(function (err) {
                loadingwheel(false);
            });
        },
        GetAllSavedBOMedPartsByPartID: function (partID, filterSavedBOMPart) {
            loadingwheel(true);
            return $http.get(baseUrl + 'api/SeaOtters/AllSavedBOMedPartsByPartID?partID=' + partID + '&filterSavedBOMPart=' + filterSavedBOMPart).success(function (data) {
                loadingwheel(false);
                if (data.Status === true) {
                    return data.Results;
                }
                else {
                    //ShowAlertMessage(data.MessageId, 0, [{ key: '[Data]', value: 'BOM Parts' }]);
                }
            }).error(function (err) {
                loadingwheel(false);
            });
        },
        GetAllSavedBOMProcessByPartID: function (partID) {
            loadingwheel(true);
            return $http.get(baseUrl + 'api/SeaOtters/AllSavedBOMProcessByPartID?partID=' + partID).success(function (data) {
                loadingwheel(false);
                if (data.Status === true) {
                    return data.Results;
                }
                else {
                    //ShowAlertMessage(data.MessageId, 0, [{ key: '[Data]', value: 'BOM Parts' }]);
                }
            }).error(function (err) {
                loadingwheel(false);
            });
        },
        GetAllUnBOMedParts: function (partID, filterUnSavedBOMPart) {
            loadingwheel(true);
            return $http.get(baseUrl + 'api/SeaOtters/AllUnBOMedParts?partID=' + partID + '&filterUnSavedBOMPart=' + filterUnSavedBOMPart).success(function (data) {
                loadingwheel(false);
                if (data.Status === true) {
                    return data.Results;
                }
                else {
                    //ShowAlertMessage(data.MessageId, 0, [{ key: '[Data]', value: 'BOM Parts' }]);
                }
            }).error(function (err) {
                loadingwheel(false);
            });
        },

        ShowPartBOMPart: function (pageConfig, UnSavedBOMPartsCtrl, unsavedbomParts, partID, bompartsCombo, SelectedPart, childRecord) {
            var modalInstance = $modal.open({
                templateUrl: 'UnSavedBOMPart.html',
                controller: UnSavedBOMPartsCtrl,
                resolve: {
                    pageConfig: function () {
                        return pageConfig;
                    },
                    unsavedbomParts: function () {
                        return unsavedbomParts;
                    },
                    partID: function () {
                        return partID;
                    },
                    bompartsCombo: function () {
                        return bompartsCombo;
                    },
                    SelectedPart: function () {
                        return SelectedPart;
                    },
                    childRecord: function () {
                        return childRecord;
                    }
                }
            });
            return modalInstance;
        },

        GetAllCustomersByUserID: function (pageNumber, pageSize, keyword) {
            loadingwheel(true);
            return $http.get(baseUrl + 'api/SeaOtters/AllCustomers?pageNumber=' + pageNumber + '&pageSize=' + pageSize + '&keyword=' + keyword).success(function (data) {
                loadingwheel(false);
                if (data.Status === true) {
                    return data.Results;
                } else {
                    ShowAlertMessage(data.MessageId, 0, [{ key: '[Data]', value: 'Customer' }]);
                }
            }).error(function (err) {
                loadingwheel(false);
            });
        },
        GetAllPartDetails: function (customerID, keyword) {
            loadingwheel(true);
            return $http.get(baseUrl + 'api/SeaOtters/PartDetails?customerID=' + customerID + '&keyword=' + keyword).success(function (data) {
                loadingwheel(false);
                if (data.Status === true) {
                    return data.Results;
                } else {
                    ShowAlertMessage(data.MessageId, 0, [{ key: '[Data]', value: 'Part' }]);
                }
            }).error(function (err) {
                loadingwheel(false);
            });
        },

        GetAllTaxHeadsByUserID: function () {
            loadingwheel(true);
            return $http.get(baseUrl + 'api/SeaOtters/AllTaxHeads').success(function (data) {
                loadingwheel(false);
                if (data.Status === true) {
                    return data.Results;
                } else {
                    ShowAlertMessage(data.MessageId, 0, [{ key: '[Data]', value: 'Tax Heads' }]);
                }
            }).error(function (err) {
                loadingwheel(false);
            });
        },
        GetAllQuoteStatusUserID: function () {
            loadingwheel(true);
            return $http.get(baseUrl + 'api/SeaOtters/AllQuoteStatus').success(function (data) {
                loadingwheel(false);
                if (data.Status === true) {
                    return data.Results;
                } else {
                    ShowAlertMessage(data.MessageId, 0, [{ key: '[Data]', value: 'Quote Status' }]);
                }
            }).error(function (err) {
                loadingwheel(false);
            });
        },

        GetAllCustomerPartsByUserID: function () {
            loadingwheel(true);
            return $http.get(baseUrl + 'api/SeaOtters/AllCustomerParts').success(function (data) {
                loadingwheel(false);
                if (data.Status === true) {
                    return data.Results;
                } else {
                    ShowAlertMessage(data.MessageId, 0, [{ key: '[Data]', value: 'Customer Number' }]);
                }
            }).error(function (err) {
                loadingwheel(false);
            });
        },

        SaveQuote: function (quote) {
            loadingwheel(true);
            return $http({
                url: baseUrl + 'api/SeaOtters/Quote',
                method: 'POST',
                data: quote
            }).success(function (data) {
                loadingwheel(false);
                if (data.Status === true) {
                    return data.Results;
                }
                else {
                    ShowAlertMessage(data.MessageId == 5 ? 1 : data.MessageId, 0, [{ key: '[Data]', value: data.MessageId == 1 ? 'Account' : 'Quote' }]);
                }
            }).error(function (err) {
                loadingwheel(false);
            });
        },
        DeleteQuote: function (quoteID) {
            loadingwheel(true);
            return $http.post(baseUrl + 'api/SeaOtters/Quotes/' + quoteID + '/Delete').success(function (data) {
                loadingwheel(false);
                if (data.Status === true) {
                    return data.Results;
                } else {
                    ShowAlertMessage(data.MessageId, 0, [{ key: '[Data]', value: 'Quote' }]);
                }
            }).error(function (err) {
                loadingwheel(false);
            });
        },
        GetQuoteListByUserID: function (pageNumber, pageSize, keyword, quoteStatus) {
            loadingwheel(true);
            return $http.get(baseUrl + 'api/SeaOtters/Quotes?pageNumber=' + pageNumber + '&pageSize=' + pageSize + '&keyword=' + keyword + '&quoteStatus=' + quoteStatus).success(function (data) {
                loadingwheel(false);
                if (data.Status === true) {
                    return data.Results;
                } else {
                    ShowAlertMessage(data.MessageId, 0, [{ key: '[Data]', value: 'Quote' }]);
                }
            }).error(function (err) {
                loadingwheel(false);
            });
        },
        GetQuoteDetailsByQuoteID: function (quoteID) {
            loadingwheel(true);
            return $http.get(baseUrl + 'api/SeaOtters/Quotes/' + quoteID).success(function (data) {
                loadingwheel(false);
                if (data.Status === true) {
                    return data.Results;
                } else {
                    ShowAlertMessage(data.MessageId, 0, [{ key: '[Data]', value: 'Quote' }]);
                }
            }).error(function (err) {
                loadingwheel(false);
            });
        },
        GetAllUnBOMProcessForQuote: function (quoteLineID, partID) {
            loadingwheel(true);
            return $http.get(baseUrl + 'api/SeaOtters/AllUnBOMProcessesForQuote?quoteLineID=' + quoteLineID + '&partID=' + partID).success(function (data) {
                loadingwheel(false);
                if (data.Status === true) {
                    return data.Results;
                }
                else {
                    ShowAlertMessage(data.MessageId, 0, [{ key: '[Data]', value: 'BOM Process' }]);
                }
            }).error(function (err) {
                loadingwheel(false);
            });
        },
        ShowQuoteLineModal: function (pageConfig, customerID, userLanguage, SeaOttersSvc, quoteLine, QuoteLineCtrl, priceTermList) {
            var modalInstance = $modal.open({
                templateUrl: '../templates/QuoteLine.html',
                size: 'lg',
                controller: QuoteLineCtrl,
                resolve: {
                    pageConfig: function () {
                        return pageConfig;
                    },
                    customerID: function () {
                        return customerID;
                    },
                    userLanguage: function () {
                        return userLanguage;
                    },
                    SeaOttersSvc: function () {
                        return SeaOttersSvc;
                    },
                    quoteLine: function () {
                        return quoteLine;
                    },
                    priceTermList: function () {
                        return priceTermList;
                    }
                }
            });
            return modalInstance;
        },
        ShowCustomerModal: function (pageConfig, userLanguage, SeaOttersSvc, CustomerCtrl) {
            var modalInstance = $modal.open({
                templateUrl: 'CustomerSearch.html',
                controller: CustomerCtrl,
                resolve: {
                    pageConfig: function () {
                        return pageConfig;
                    },
                    userLanguage: function () {
                        return userLanguage;
                    },
                    SeaOttersSvc: function () {
                        return SeaOttersSvc;
                    }
                }
            });
            return modalInstance;
        },
        ShowQuoteLineProcessModal: function (pageConfig, UOMList, unsavedBOMProcesses, partID, partNumber, userLanguage, QuoteLineProcessCtrl) {
            var modalInstance = $modal.open({
                templateUrl: 'QuoteLineProcess.html',
                controller: QuoteLineProcessCtrl,
                size: 'lg',
                resolve: {
                    pageConfig: function () {
                        return pageConfig;
                    },
                    UOMList: function () {
                        return UOMList;
                    },
                    unsavedBOMProcesses: function () {
                        return unsavedBOMProcesses;
                    },
                    partID: function () {
                        return partID;
                    },
                    partNumber: function () {
                        return partNumber;
                    },
                    userLanguage: function () {
                        return userLanguage;
                    },
                }
            });
            return modalInstance;
        },
        ShowQuoteLineBOMPartModal: function (pageConfig, userLanguage, quoteLineBOM, QuoteLineBOMPartCtrl) {
            var modalInstance = $modal.open({
                templateUrl: 'QuoteLineBOMPart',
                controller: QuoteLineBOMPartCtrl,
                resolve: {
                    pageConfig: function () {
                        return pageConfig;
                    },
                    userLanguage: function () {
                        return userLanguage;
                    },
                    quoteLineBOM: function () {
                        return quoteLineBOM;
                    }
                }
            });
            return modalInstance;
        },
        ShowQuoteLineTaxesModal: function (pageConfig, unsavedTaxes, partID, partNumber, userLanguage, QuoteLineTaxesCtrl) {
            var modalInstance = $modal.open({
                templateUrl: 'QuoteLineTaxes.html',
                controller: QuoteLineTaxesCtrl,
                size: 'lg',
                resolve: {
                    pageConfig: function () {
                        return pageConfig;
                    },
                    unsavedTaxes: function () {
                        return unsavedTaxes;
                    },
                    partID: function () {
                        return partID;
                    },
                    partNumber: function () {
                        return partNumber;
                    },
                    userLanguage: function () {
                        return userLanguage;
                    },
                }
            });
            return modalInstance;
        },
        ShowQuoteLinePackingModal: function (pageConfig, packingList, partID, partNumber, userLanguage, QuoteLinePackingCtrl) {
            var modalInstance = $modal.open({
                templateUrl: 'QuoteLinePacking.html',
                controller: QuoteLinePackingCtrl,
                size: 'lg',
                resolve: {
                    pageConfig: function () {
                        return pageConfig;
                    },
                    packingList: function () {
                        return packingList;
                    },
                    partID: function () {
                        return partID;
                    },
                    partNumber: function () {
                        return partNumber;
                    },
                    userLanguage: function () {
                        return userLanguage;
                    },
                }
            });
            return modalInstance;
        },
        ShowQuoteLineSalesCostModal: function (pageConfig, salesCostList, partID, partNumber, userLanguage, QuoteLineSalesCostCtrl) {
            var modalInstance = $modal.open({
                templateUrl: 'QuoteLineSalesCost.html',
                controller: QuoteLineSalesCostCtrl,
                size: 'lg',
                resolve: {
                    pageConfig: function () {
                        return pageConfig;
                    },
                    salesCostList: function () {
                        return salesCostList;
                    },
                    partID: function () {
                        return partID;
                    },
                    partNumber: function () {
                        return partNumber;
                    },
                    userLanguage: function () {
                        return userLanguage;
                    },
                }
            });
            return modalInstance;
        },
        ShowQuoteLineFreightModal: function (pageConfig, freightList, partID, partNumber, userLanguage, QuoteLineFreightCtrl) {
            var modalInstance = $modal.open({
                templateUrl: 'QuoteLineFreight.html',
                controller: QuoteLineFreightCtrl,
                size: 'lg',
                resolve: {
                    pageConfig: function () {
                        return pageConfig;
                    },
                    freightList: function () {
                        return freightList;
                    },
                    partID: function () {
                        return partID;
                    },
                    partNumber: function () {
                        return partNumber;
                    },
                    userLanguage: function () {
                        return userLanguage;
                    },
                }
            });
            return modalInstance;
        },
        ShowQuoteLineInsuranceModal: function (pageConfig, insuranceList, partID, partNumber, userLanguage, QuoteLineInsuranceCtrl) {
            var modalInstance = $modal.open({
                templateUrl: 'QuoteLineInsurance.html',
                controller: QuoteLineInsuranceCtrl,
                size: 'lg',
                resolve: {
                    pageConfig: function () {
                        return pageConfig;
                    },
                    insuranceList: function () {
                        return insuranceList;
                    },
                    partID: function () {
                        return partID;
                    },
                    partNumber: function () {
                        return partNumber;
                    },
                    userLanguage: function () {
                        return userLanguage;
                    },
                }
            });
            return modalInstance;
        },
        ShowQuoteLineWarehouseModal: function (pageConfig, warehouseList, partID, partNumber, userLanguage, QuoteLineWarehouseCtrl) {
            var modalInstance = $modal.open({
                templateUrl: 'QuoteLineWarehouse.html',
                controller: QuoteLineWarehouseCtrl,
                size: 'lg',
                resolve: {
                    pageConfig: function () {
                        return pageConfig;
                    },
                    warehouseList: function () {
                        return warehouseList;
                    },
                    partID: function () {
                        return partID;
                    },
                    partNumber: function () {
                        return partNumber;
                    },
                    userLanguage: function () {
                        return userLanguage;
                    },
                }
            });
            return modalInstance;
        },

        GetAllSavedBOMedProcessByPartID: function (partID) {
            loadingwheel(true);
            return $http.get(baseUrl + 'api/SeaOtters/AllSavedBOMedProcessByPartID?partID=' + partID).success(function (data) {
                loadingwheel(false);
                if (data.Status === true) {
                    return data.Results;
                }
                else {
                    //ShowAlertMessage(data.MessageId, 0, [{ key: '[Data]', value: 'BOM Process' }]);
                }
            }).error(function (err) {
                loadingwheel(false);
            });
        },
        GetAllUnBOMedProcess: function (partID) {
            loadingwheel(true);
            return $http.get(baseUrl + 'api/SeaOtters/AllUnBOMedProcess?partID=' + partID).success(function (data) {
                loadingwheel(false);
                if (data.Status === true) {
                    return data.Results;
                }
                else {
                    //ShowAlertMessage(data.MessageId, 0, [{ key: '[Data]', value: 'BOM Process' }]);
                }
            }).error(function (err) {
                loadingwheel(false);
            });
        },
        UpdateBOMProcess: function (Updated) {

            return $http({
                url: baseUrl + 'api/SeaOtters/UpdateBOMProcess',
                method: 'POST',
                data: Updated
                //data: $.param(Updated),
            }).success(function (data) {
                return data.Results;
            });
        },
        ShowPartBOMProcess: function (pageConfig, UnSavedBOMProcessCtrl, unsavedbomProcesses, partID, PartNumber, UOMList) {
            var modalInstance = $modal.open({
                templateUrl: 'UnSavedBOMProcess.html',
                controller: UnSavedBOMProcessCtrl,
                resolve: {
                    pageConfig: function () {
                        return pageConfig;
                    },
                    unsavedbomProcesses: function () {
                        return unsavedbomProcesses;
                    },
                    partID: function () {
                        return partID;
                    },
                    PartNumber: function () {
                        return PartNumber;
                    },
                    UOMList: function () {
                        return UOMList;
                    }
                }
            });
            return modalInstance;
        },
        InsertBOMProcess: function (Updated) {

            return $http({
                url: baseUrl + 'api/SeaOtters/InsertBOMProcesssaved',
                method: 'POST',
                data: Updated
                //data: $.param(Updated),
            }).success(function (data) {
                return data.Results;
            });
        },
        UpdateBOMPart: function (Updated) {

            return $http({
                url: baseUrl + 'api/SeaOtters/UpdateBOMPartSaved',
                method: 'POST',
                data: Updated
                //data: $.param(Updated),
            }).success(function (data) {
                return data.Results;
            });
        },
        DeleteBOMPart: function (Updated) {

            return $http({
                url: baseUrl + 'api/SeaOtters/DeleteBOMPartSaved',
                method: 'POST',
                data: Updated
                //data: $.param(Updated),
            }).success(function (data) {
                return data.Results;
            });
        },
        DeleteBOMProcess: function (Updated) {

            return $http({
                url: baseUrl + 'api/SeaOtters/DeleteBOMProcessSaved',
                method: 'POST',
                data: Updated
                //data: $.param(Updated),
            }).success(function (data) {
                return data.Results;
            });
        },
        InsertBOMPart: function (Updated) {

            return $http({
                url: baseUrl + 'api/SeaOtters/InsertBOMPartSaved',
                method: 'POST',
                data: Updated
                //data: $.param(Updated),
            }).success(function (data) {
                return data.Results;
            });
        },

        GetTaxHeadList: function () {
            return $http.get(baseUrl + 'api/SeaOtters/TaxHeads').success(function (data) {
                return data.Results;
            });
        },
        GetTaxHeadDetailsByTHID: function (taxHeadID) {
            return $http.get(baseUrl + 'api/SeaOtters/TaxHeads/' + taxHeadID).success(function (data) {
                return data.Results;
            });
        },
        DeleteTaxHead: function (taxHeadID) {
            return $http.post(baseUrl + 'api/SeaOtters/TaxHeads/' + taxHeadID + '/Delete').success(function (data) {
                return data.Results;
            });
        },
        SaveTaxHead: function (taxHead) {
            return $http({
                url: baseUrl + 'api/SeaOtters/TaxHead',
                method: 'POST',
                data: taxHead
            }).success(function (data) {
                return data.Results;
            });
        },

        GetQuoteStatusList: function () {
            return $http.get(baseUrl + 'api/SeaOtters/QuoteStatuses').success(function (data) {
                return data.Results;
            });
        },
        GetQuoteStatusDetailByID: function (qsID) {
            return $http.get(baseUrl + 'api/SeaOtters/QuoteStatuses/' + qsID).success(function (data) {
                return data.Results;
            });
        },
        DeleteQuoteStatus: function (quoteStatusID) {
            return $http.post(baseUrl + 'api/SeaOtters/QuoteStatuses/' + quoteStatusID + '/Delete').success(function (data) {
                return data.Results;
            });
        },
        SaveQuoteStatus: function (qs) {
            return $http({
                url: baseUrl + 'api/SeaOtters/QuoteStatus',
                method: 'POST',
                data: qs
            }).success(function (data) {
                return data.Results;
            });
        },
        GetDialogMessage: function () {
            //loadingwheel(true);
            return $http.get(baseUrl + 'api/SeaOtters/DialogMessages').success(function (data) {
                //loadingwheel(false);
                alert(data.Results);

                if (data.Status === true) {
                    return data.Results;
                }
            }).error(function (err) {

                //loadingwheel(false);
            });
        },
        GetParentPartTypeList: function () {
            return $http.get(baseUrl + 'api/SeaOtters/ParentPartTypeList').success(function (data) {
                return data.Results;
            });
        },
        SavePartMasterDocument: function (partDoc) {
            debugger;
            loadingwheel(true);
            return $http({
                url: baseUrl + 'api/SeaOtters/PartMasterDocument',
                method: 'POST',
                data: partDoc
            }).success(function (data) {
                loadingwheel(false);
                if (data.Status === true) {
                    return data.Results;
                }
                else {
                    ShowAlertMessage(data.MessageId == 5 ? 1 : data.MessageId, 0, [{ key: '[Data]', value: data.MessageId == 1 ? 'Account' : 'PartMaster' }]);
                }
            }).error(function (err) {
                loadingwheel(false);
            });
        },
        GetPartMasterDocumentListByPartID: function (partID) {
            return $http.get(baseUrl + 'api/SeaOtters/PartMasterDocuments/' + partID).success(function (data) {
                return data.Results;
            });
        },
        ShowQuoteLineBOMPart: function (pageConfig, UnSavedBOMPartsCtrl, unsavedbomParts, bompartsCombo, SelectedPart) {
            var modalInstance = $modal.open({
                templateUrl: 'UnSavedBOMPart.html',
                controller: UnSavedBOMPartsCtrl,
                size: 'lg',
                resolve: {
                    pageConfig: function () {
                        return pageConfig;
                    },
                    unsavedbomParts: function () {
                        return unsavedbomParts;
                    },
                    bompartsCombo: function () {
                        return bompartsCombo;
                    },
                    SelectedPart: function () {
                        return SelectedPart;
                    }
                }
            });
            return modalInstance;
        },
        InsertQuoteLineBOMPart: function (Updated) {
            return $http({
                url: baseUrl + 'api/SeaOtters/InsertQuoteLineBOMParts',
                method: 'POST',
                data: Updated
                //data: $.param(Updated),
            }).success(function (data) {
                return data.Results;
            });
        },
        GetAllQuoteLineUnBOMedParts: function (partID, quoteLineID) {
            loadingwheel(true);
            return $http.get(baseUrl + 'api/SeaOtters/AllQuoteLineUnBOMedParts?partID=' + partID + '&quoteLineID=' + quoteLineID).success(function (data) {
                loadingwheel(false);
                if (data.Status === true) {
                    return data.Results;
                }
                else {
                    //ShowAlertMessage(data.MessageId, 0, [{ key: '[Data]', value: 'BOM Parts' }]);
                }
            }).error(function (err) {
                loadingwheel(false);
            });
        },
        UpdateQuoteApprovals: function (param) {
            loadingwheel(true);
            return $http({
                url: baseUrl + 'api/SeaOtters/UpdateQuoteApprovals',
                method: 'POST',
                data: param
            }).success(function (data) {
                return data.Results;
            });

        },


        SaveNotificationTemplate: function (nt) {
            loadingwheel(true);
            return $http({
                url: baseUrl + 'api/SeaOtters/NotificationTemplate',
                method: 'POST',
                data: nt
            }).success(function (data) {
                loadingwheel(false);
                if (data.Status === true) {
                    return data.Results;
                }
                else {
                    ShowAlertMessage(data.MessageId == 5 ? 1 : data.MessageId, 0, [{ key: '[Data]', value: data.MessageId == 1 ? 'Account' : 'Notification Template' }]);
                }
            }).error(function (err) {
                loadingwheel(false);
            });
        },
        GetNotificationTemplateList: function (pageNumber, pageSize, keyword) {
            loadingwheel(true);
            return $http.get(baseUrl + 'api/SeaOtters/NotificationTemplates?pageNumber=' + pageNumber + '&pageSize=' + pageSize + '&Keyword=' + keyword).success(function (data) {
                loadingwheel(false);
                if (data.Status === true) {
                    return data.Results;
                } else {
                    ShowAlertMessage(data.MessageId, 0, [{ key: '[Data]', value: 'Notification Templates' }]);
                }
            }).error(function (err) {
                loadingwheel(false);
            });
        },
        GetNotificationTemplateByID: function (notificationID) {
            loadingwheel(true);
            return $http.get(baseUrl + 'api/SeaOtters/NotificationTemplates/' + notificationID).success(function (data) {
                loadingwheel(false);
                if (data.Status === true) {
                    return data.Results;
                } else {
                    ShowAlertMessage(data.MessageId, 0, [{ key: '[Data]', value: 'Notification Templates' }]);
                }
            }).error(function (err) {
                loadingwheel(false);
            });
        },
        DeleteNotificationTemplate: function (notificationID) {
            loadingwheel(true);
            return $http.post(baseUrl + 'api/SeaOtters/NotificationTemplates/' + notificationID + '/Delete').success(function (data) {
                loadingwheel(false);
                if (data.Status === true) {
                    return data.Results;
                } else {
                    ShowAlertMessage(data.MessageId, 0, [{ key: '[Data]', value: 'Notification Templates' }]);
                }
            }).error(function (err) {
                loadingwheel(false);
            });
        },

        GetMessagingKeyValueList: function () {
            return $http.get(baseUrl + 'api/SeaOtters/MessagingKeyValues').success(function (data) {
                return data.Results;
            });
        },

        GetAllOfferStatus: function () {
            loadingwheel(true);
            return $http.get(baseUrl + 'api/SeaOtters/AllOfferStatus').success(function (data) {
                loadingwheel(false);
                if (data.Status === true) {
                    return data.Results;
                } else {
                    ShowAlertMessage(data.MessageId, 0, [{ key: '[Data]', value: 'Offer Status' }]);
                }
            }).error(function (err) {
                loadingwheel(false);
            });
        },
        GetOfferStatusList: function () {
            return $http.get(baseUrl + 'api/SeaOtters/OfferStatuses').success(function (data) {
                return data.Results;
            });
        },
        GetOfferStatusDetailByID: function (offerStatusID) {
            return $http.get(baseUrl + 'api/SeaOtters/OfferStatuses/' + offerStatusID).success(function (data) {
                return data.Results;
            });
        },
        DeleteOfferStatus: function (offerStatusID) {
            return $http.post(baseUrl + 'api/SeaOtters/OfferStatuses/' + offerStatusID + '/Delete').success(function (data) {
                return data.Results;
            });
        },
        SaveOfferStatus: function (qs) {
            return $http({
                url: baseUrl + 'api/SeaOtters/OfferStatus',
                method: 'POST',
                data: qs
            }).success(function (data) {
                return data.Results;
            });
        },

        DeletePartDocument: function (selectedPartDocID) {
            return $http({
                url: baseUrl + 'api/SeaOtters/DeletePartDocuments',
                method: 'POST',
                data: selectedPartDocID
            }).success(function (data) {
                return data.Results;
            });
        },
        GeneratePartNumberBarCode: function (partNumber) {
            return $http.get(baseUrl + 'api/SeaOtters/GenerateBarCode?partNumber=' + partNumber).success(function (data) {
                return data.Results;
            });
        },
        GetAllAlternatePart: function (partID, savedPart, filterSavedAlternatePart) {
            loadingwheel(true);
            return $http.get(baseUrl + 'api/SeaOtters/GetAllAlternatePart?partID=' + partID + '&savedPart=' + savedPart + '&filterSavedAlternatePart=' + filterSavedAlternatePart).success(function (data) {
                loadingwheel(false);
                if (data.Status === true) {
                    return data.Results;
                } else {
                    //ShowAlertMessage(data.MessageId, 0, [{ key: '[Data]', value: 'Part' }]);
                }
            }).error(function (err) {
                loadingwheel(false);
            });
        },

        GetPriceTermList: function () {
            return $http.get(baseUrl + 'api/SeaOtters/PriceTerms').success(function (data) {
                return data.Results;
            });
        },
        GetSalesCostList: function () {
            return $http.get(baseUrl + 'api/SeaOtters/SalesCosts').success(function (data) {
                return data.Results;
            });
        },
        GetFreightList: function () {
            return $http.get(baseUrl + 'api/SeaOtters/Freights').success(function (data) {
                return data.Results;
            });
        },
        GetInsuranceList: function () {
            return $http.get(baseUrl + 'api/SeaOtters/Insurances').success(function (data) {
                return data.Results;
            });
        },
        GetPackingList: function () {
            return $http.get(baseUrl + 'api/SeaOtters/Packings').success(function (data) {
                return data.Results;
            });
        },
        GetWarehouseList: function () {
            return $http.get(baseUrl + 'api/SeaOtters/Warehouses').success(function (data) {
                return data.Results;
            });
        },


        GetAllPackingList: function () {
            return $http.get(baseUrl + 'api/SeaOtters/Packinges').success(function (data) {
                return data.Results;
            });
        },
        GetPackingByID: function (PackingID) {
            return $http.get(baseUrl + 'api/SeaOtters/Packinges/' + PackingID).success(function (data) {
                return data.Results;
            });
        },
        SavePacking: function (Packing) {
            return $http({
                url: baseUrl + 'api/SeaOtters/Packing',
                method: 'POST',
                data: Packing
            }).success(function (data) {
                return data.Results;
            });
        },
        DeletePacking: function (PackingID) {
            return $http.post(baseUrl + 'api/SeaOtters/Packinges/' + PackingID + '/Delete').success(function (data) {
                return data.Results;
            });
        },

        GetAllFreightList: function () {
            return $http.get(baseUrl + 'api/SeaOtters/Freightes').success(function (data) {
                return data.Results;
            });
        },
        GetFreightByID: function (FreightID) {
            return $http.get(baseUrl + 'api/SeaOtters/Freightes/' + FreightID).success(function (data) {
                return data.Results;
            });
        },
        SaveFreight: function (Freight) {
            return $http({
                url: baseUrl + 'api/SeaOtters/Freight',
                method: 'POST',
                data: Freight
            }).success(function (data) {
                return data.Results;
            });
        },
        DeleteFreight: function (FreightID) {
            return $http.post(baseUrl + 'api/SeaOtters/Freightes/' + FreightID + '/Delete').success(function (data) {
                return data.Results;
            });
        },

        GetAllInsuranceList: function () {
            return $http.get(baseUrl + 'api/SeaOtters/Insurancees').success(function (data) {
                return data.Results;
            });
        },
        GetInsuranceByID: function (InsuranceID) {
            return $http.get(baseUrl + 'api/SeaOtters/Insurancees/' + InsuranceID).success(function (data) {
                return data.Results;
            });
        },
        SaveInsurance: function (Insurance) {
            //debugger;
            return $http({
                url: baseUrl + 'api/SeaOtters/Insurance',
                method: 'POST',
                data: Insurance
            }).success(function (data) {
                return data.Results;
            });
        },
        DeleteInsurance: function (InsuranceID) {
            return $http.post(baseUrl + 'api/SeaOtters/Insurancees/' + InsuranceID + '/Delete').success(function (data) {
                return data.Results;
            });
        },

        GetAllPriceTermList: function () {
            return $http.get(baseUrl + 'api/SeaOtters/PriceTermes').success(function (data) {
                return data.Results;
            });
        },
        GetPriceTermByID: function (PriceTermID) {
            return $http.get(baseUrl + 'api/SeaOtters/PriceTermes/' + PriceTermID).success(function (data) {
                return data.Results;
            });
        },
        SavePriceTerm: function (priceTerm) {
            return $http({
                url: baseUrl + 'api/SeaOtters/PriceTerm',
                method: 'POST',
                data: priceTerm
            }).success(function (data) {
                return data.Results;
            });
        },
        DeletePriceTerm: function (priceTermID) {
            return $http.post(baseUrl + 'api/SeaOtters/PriceTermes/' + priceTermID + '/Delete').success(function (data) {
                return data.Results;
            });
        },

        GetAllWarehouseList: function () {
            return $http.get(baseUrl + 'api/SeaOtters/Warehousees').success(function (data) {
                return data.Results;
            });
        },
        GetWarehouseByID: function (WarehouseID) {
            return $http.get(baseUrl + 'api/SeaOtters/Warehousees/' + WarehouseID).success(function (data) {
                return data.Results;
            });
        },
        SaveWarehouse: function (Warehouse) {
            return $http({
                url: baseUrl + 'api/SeaOtters/Warehouse',
                method: 'POST',
                data: Warehouse
            }).success(function (data) {
                return data.Results;
            });
        },
        DeleteWarehouse: function (WarehouseID) {
            return $http.post(baseUrl + 'api/SeaOtters/Warehousees/' + WarehouseID + '/Delete').success(function (data) {
                return data.Results;
            });
        },

        GetAllSalesCostsList: function () {
            return $http.get(baseUrl + 'api/SeaOtters/SalesCostses').success(function (data) {
                return data.Results;
            });
        },
        GetSalesCostsByID: function (SalesCostsID) {
            return $http.get(baseUrl + 'api/SeaOtters/SalesCostses/' + SalesCostsID).success(function (data) {
                return data.Results;
            });
        },
        SaveSalesCosts: function (SalesCosts) {
            return $http({
                url: baseUrl + 'api/SeaOtters/SalesCosts',
                method: 'POST',
                data: SalesCosts
            }).success(function (data) {
                return data.Results;
            });
        },
        DeleteSalesCosts: function (SalesCostsID) {
            return $http.post(baseUrl + 'api/SeaOtters/SalesCostses/' + SalesCostsID + '/Delete').success(function (data) {
                return data.Results;
            });
        },

        GetAdditionalUOMListByPartID: function (partID, savedUOM) {
            loadingwheel(true);
            return $http.get(baseUrl + 'api/SeaOtters/AdditionalUOMListByPartID?partID=' + partID + '&savedUOM=' + savedUOM).success(function (data) {
                loadingwheel(false);
                if (data.Status === true) {
                    return data.Results;
                }
                else {
                    //ShowAlertMessage(data.MessageId, 0, [{ key: '[Data]', value: 'BOM Process' }]);
                }
            }).error(function (err) {
                loadingwheel(false);
            });
        },
        ShowPartAddUOM: function (pageConfig, UnSavedAddUOM, unsavedAdditionalPartMap, partID) {
            var modalInstance = $modal.open({
                templateUrl: 'UnSavedAddUOM.html',
                controller: UnSavedAddUOM,
                resolve: {
                    pageConfig: function () {
                        return pageConfig;
                    },
                    unsavedAdditionalPartMap: function () {
                        return unsavedAdditionalPartMap;
                    },
                    partID: function () {
                        return partID;
                    }
                }
            });
            return modalInstance;
        },
        InsertPartAddUOM: function (Updated) {

            return $http({
                url: baseUrl + 'api/SeaOtters/InsertPartAddUOM',
                method: 'POST',
                data: Updated
                //data: $.param(Updated),
            }).success(function (data) {
                return data.Results;
            });
        },
        DeleteAddUOMPart: function (Updated) {
            return $http({
                url: baseUrl + 'api/SeaOtters/DeleteAddUOMPart',
                method: 'POST',
                data: Updated
                //data: $.param(Updated),
            }).success(function (data) {
                return data.Results;
            });
        },

        SaveAdditionalUOM: function (uom) {
            loadingwheel(true);
            return $http({
                url: baseUrl + 'api/SeaOtters/AdditionalUOM',
                method: 'POST',
                data: uom
            }).success(function (data) {
                loadingwheel(false);
                if (data.Status === true) {
                    return data.Results;
                }
                else {
                    ShowAlertMessage(data.MessageId == 5 ? 1 : data.MessageId, 0, [{ key: '[Data]', value: data.MessageId == 1 ? 'Account' : 'Additional UOM' }]);
                }
            }).error(function (err) {
                loadingwheel(false);
            });
        },
        GetAdditionalUOMListByID: function (pageNumber, pageSize, keyword) {
            loadingwheel(true);
            return $http.get(baseUrl + 'api/SeaOtters/AdditionalUOMs?pageNumber=' + pageNumber + '&pageSize=' + pageSize + '&Keyword=' + keyword).success(function (data) {
                loadingwheel(false);
                if (data.Status === true) {
                    return data.Results;
                } else {
                    ShowAlertMessage(data.MessageId, 0, [{ key: '[Data]', value: 'Additional UOM' }]);
                }
            }).error(function (err) {
                loadingwheel(false);
            });
        },
        GetAdditionalUOMDetailsByID: function (ID) {
            loadingwheel(true);
            return $http.get(baseUrl + 'api/SeaOtters/AdditionalUOMs/' + ID).success(function (data) {
                loadingwheel(false);
                if (data.Status === true) {
                    return data.Results;
                } else {
                    ShowAlertMessage(data.MessageId, 0, [{ key: '[Data]', value: 'Additional UOM' }]);
                }
            }).error(function (err) {
                loadingwheel(false);
            });
        },
        DeleteAdditionalUOM: function (ID) {
            loadingwheel(true);
            return $http.post(baseUrl + 'api/SeaOtters/AdditionalUOM/' + ID + '/Delete').success(function (data) {
                loadingwheel(false);
                if (data.Status === true) {
                    return data.Results;
                } else {
                    ShowAlertMessage(data.MessageId, 0, [{ key: '[Data]', value: 'Additional UOM' }]);
                }
            }).error(function (err) {
                loadingwheel(false);
            });
        },

        GetAllCostGroupByUserID: function () {
            return $http.get(baseUrl + 'api/SeaOtters/CostGroups').success(function (data) {
                return data.Results;
            });
        },
        GetAllMathematicalSymbol: function () {
            return $http.get(baseUrl + 'api/SeaOtters/MathematicalSymbols').success(function (data) {
                return data.Results;
            });
        },

        DeleteAlternatePart: function (selectedDeletedAlternateID) {
            return $http({
                url: baseUrl + 'api/SeaOtters/DeleteAlternatePart',
                method: 'POST',
                data: selectedDeletedAlternateID
                //data: $.param(Updated),
            }).success(function (data) {
                return data.Results;
            });
        },
        ShowPartAddAlternatePart: function (pageConfig, UnAlternatePart, unalternatePart, partID) {
            var modalInstance = $modal.open({
                templateUrl: 'UnAlternatePart.html',
                controller: UnAlternatePart,
                resolve: {
                    pageConfig: function () {
                        return pageConfig;
                    },
                    unalternatePart: function () {
                        return unalternatePart;
                    },
                    partID: function () {
                        return partID;
                    }
                }
            });
            return modalInstance;
        },
        InsertPartAddAlternatePart: function (param) {
            return $http({
                url: baseUrl + 'api/SeaOtters/InsertPartAddAlternatePart',
                method: 'POST',
                data: param
                //data: $.param(Updated),
            }).success(function (data) {
                return data.Results;
            });
        },
    };
}]);