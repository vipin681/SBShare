﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;
using System.Web.Mvc;
using System.Web.Http.Filters;
using System.Web.Http.Controllers;
using System.Security.Principal;
using DummyProjectBAL;
using System.Threading;
using DummyProjectStateClass;
using System.Net;
using System.Net.Http;
using System.Web.Security;
using System.Diagnostics;
namespace System.Web.Mvc
{
   
    public class CustomAuthorizeAttribute:AuthorizeAttribute
    {
        public string UserRole { get; set; }

        protected override bool AuthorizeCore(HttpContextBase httpContext)
        {
            UserBAL obj = new UserBAL();
            var role = obj.GetAuthorizeRole();
            string CurrentUserRole = role.description;
            //       // UserBLL objUserBLL = new UserBLL();

            //        var role = objUserBLL.GetAuthorizeRole();
            //        if (role != null)
            //        {
            if (this.UserRole.Contains(CurrentUserRole))
            {

                return true;
            }
            else
            {
                return false;
            }
            return base.AuthorizeCore(httpContext);
        }

        //public override bool AuthorizeCore(HttpContextBase httpContext)
        //{
        //    var isAuthorized = base.AuthorizeCore(httpContext);
        //    if (!isAuthorized)
        //    {

        //        return false;
        //    }
        //    string CurrentUserRole = "Admin";
        //    if (this.UserRole.Contains(CurrentUserRole))
        //    {

        //        return true;
        //    }
        //    else
        //    {
        //        return false; 
        //    }


        //}
        //public override void OnAuthorization(HttpActionContext actionContext)
        //{
        //    //var authorizeHeader = actionContext.Request.Headers.Authorization;
        //    //if (authorizeHeader != null && String.IsNullOrEmpty(authorizeHeader.Parameter) == false)
        //    //{
        //        UserBAL objUserBLL = new UserBAL();
        //       // UserBLL objUserBLL = new UserBLL();

        //        var role = objUserBLL.GetAuthorizeRole();
        //        if (role != null)
        //        {
        //            var principal = new GenericPrincipal((new GenericIdentity(role.description.ToString())),
        //                                                            (new[] { role.roleid.ToString() }));



        //            Thread.CurrentPrincipal = principal;
        //            if (HttpContext.Current != null)
        //                HttpContext.Current.User = principal;
        //            return;
        //        }
        //   // }
        //    Result outResult = new Result
        //    {
        //        status = false,
        //        MessageId = -1
        //    };
        //    actionContext.Response = actionContext.Request.CreateResponse(HttpStatusCode.OK, outResult);

        //    //try
        //    //{

        //    //    UserBAL objUserBLL = new UserBAL();
        //    //  var status = objUserBLL.GetAuthorizeRole();



        //    //var principal = new GenericPrincipal((new GenericIdentity(existingToken.UserID.ToString())),
        //    //                                                                   (new[] { existingToken.RoleID.ToString() }));
        //    //Thread.CurrentPrincipal = principal;
        //    //if (HttpContext.Current != null)
        //    //    HttpContext.Current.User = principal;
        //    //return;




        //    //    if (status !=null)
        //    //    {
        //    //        Result outResult = new Result
        //    //        {
        //    //            Status = Convert.ToString((int)HttpStatusCode.Unauthorized),
        //    //            MessageId = 0,
        //    //            errormsg = "Role don't have access to this api"
        //    //        };
        //    //        actionContext.Response = actionContext.Request.CreateResponse(HttpStatusCode.Unauthorized, outResult);
        //    //        return;
        //    //    }

        //    //    if (HttpContext.Current != null)
        //    //    {
        //    //        HttpContext.Current.User = Thread.CurrentPrincipal;
        //    //    }
        //    //}
        //    //catch (SignatureVerificationException ex)
        //    //{
        //    //    Result outResult = new Result
        //    //    {
        //    //        Status = Convert.ToString((int)HttpStatusCode.Unauthorized),
        //    //        MessageId = -1,
        //    //        errormsg = ex.Message
        //    //    };
        //    //    actionContext.Response = actionContext.Request.CreateResponse(HttpStatusCode.Unauthorized, outResult);
        //    //}
        //    //catch (Exception ex)
        //    //{
        //    //    Result outResult = new Result
        //    //    {
        //    //        Status = Convert.ToString((int)HttpStatusCode.Unauthorized),
        //    //        MessageId = -1,
        //    //        errormsg = ex.Message
        //    //    };
        //    //    actionContext.Response = actionContext.Request.CreateResponse(HttpStatusCode.Unauthorized, outResult);
        //    //}

        //}





    }


      

    }
//}