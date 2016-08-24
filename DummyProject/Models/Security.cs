using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using DummyProjectBAL;

namespace DummyProject.Models
{
    public class Security:ActionFilterAttribute
    {
        public override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            if (HttpContext.Current.Session["UserEmail"] == null)
            {
                filterContext.Result = new RedirectResult("~/LogON/SignIN");
                return;
            }
            base.OnActionExecuting(filterContext);
        }
    }
    public class CustomSecurity : AuthorizeAttribute
    {
        protected override bool AuthorizeCore(HttpContextBase httpContext)
        {
            UserBAL obj = new UserBAL();
            string usertype = HttpContext.Current.Session["Admin"].ToString();
            if (usertype == this.Roles)
            {
                return true;
            }
            else
            {
                return false;
            }
          //var  type = obj.GetAuthorizeRole();
          // return base.AuthorizeCore(httpContext);
        }


    }
}