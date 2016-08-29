using System;
//using System.Collections.Generic;
using System.Linq;
using System.Web;
//using DummyProjectStateClass;
//using DummyProjectBAL;

namespace System.Web.Mvc
{
    public class CustomRole:AuthorizeAttribute
    {
        public string UserRole { get; set; }
        protected override bool AuthorizeCore(HttpContextBase httpContext)
        {

            var isAuthorized = base.AuthorizeCore(httpContext);
            if (!isAuthorized)
            {

                return false;
            }
            string CurrentUserRole = "Admin";
            if (this.UserRole.Contains(CurrentUserRole))
            {

                return true;
            }
            else
            {
                return false;
            }

            //    UserBAL obj = new UserBAL();
            //var role=obj.GetAuthorizeRole();
            //    string CurrentUserRole = role.description;
            //    //       // UserBLL objUserBLL = new UserBLL();

            //    //        var role = objUserBLL.GetAuthorizeRole();
            //    //        if (role != null)
            //    //        {
            //    if (this.UserRole.Contains(CurrentUserRole))
            //    {

            //        return true;
            //    }
            //    else
            //    {
            //        return false;
            //    }
            //    return base.AuthorizeCore(httpContext);
        }
        protected override void HandleUnauthorizedRequest(AuthorizationContext filterContext)
        {
            base.HandleUnauthorizedRequest(filterContext);
        }
    }
}