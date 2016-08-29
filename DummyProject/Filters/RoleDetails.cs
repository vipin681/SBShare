using DummyProjectBAL;
using DummyProjectStateClass;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Security.Principal;
using System.Threading;
using System.Web;
using System.Web.Http;
using System.Web.Http.Controllers;

namespace DummyProject.Filters
{
    public class RoleDetails : AuthorizeAttribute
    {
        public string UserRole { get; set; }

        //public override void OnAuthorization(HttpActionContext actionContext)
        //{
        //    var isAuthorized = base.IsAuthorized(actionContext);
        //       // base.AuthorizeCore(httpContext);
        //    if (!isAuthorized)
        //    {
        //        return;

        //       // return false;
        //    }
        //    string CurrentUserRole = "Admin";
        //    if (this.UserRole.Contains(CurrentUserRole))
        //    {

        //     return  ;
        //    }
        //    else
        //    {
        //       // return false;
        //    }
        //    // base.OnAuthorization(actionContext);
        //}
        public override void OnAuthorization(HttpActionContext actionContext)
        {
            var authorizeHeader = actionContext.Request.Headers.Authorization;
            //var authorizeHeader = actionContext.Request.Headers.Authorization;
            //if (authorizeHeader != null && String.IsNullOrEmpty(authorizeHeader.Parameter) == false)
            //{
            UserBAL objUserBLL = new UserBAL();
            // UserBLL objUserBLL = new UserBLL();
            var existingToken = objUserBLL.GetAuthorizeRole();
            if (existingToken != null)
            {
                // var Data = existingToken.description;
                var Role = existingToken.description;
                var principal = new GenericPrincipal((new GenericIdentity(existingToken.roleid.ToString())),
                                                                (new[] { existingToken.description.ToString() }));
             
                Thread.CurrentPrincipal = principal;
                if (HttpContext.Current != null)
                    HttpContext.Current.User = principal;
                return;
            }
            //   }
            Result outResult = new Result
            {
                status = false,
                MessageId = -1
            };
            actionContext.Response = actionContext.Request.CreateResponse(HttpStatusCode.OK, outResult);
        }

   


        
    }
}