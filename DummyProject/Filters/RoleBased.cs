using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using System.Web.Http.Controllers;
using System.Web.Mvc;
namespace DummyProject.Filters
{
    public class RoleBased : System.Web.Http.AuthorizeAttribute
    {
        public string View { get; set; }
        public RoleBased()
        {
            View = "AuthorizeFailed";
        }
        public override void OnAuthorization(AuthorizationContext filterContext)
        {
            base.OnAuthorization(filterContext);
            IsUserAuthorized(filterContext);
        }

    }
}