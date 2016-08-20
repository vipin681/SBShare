using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http.Controllers;
using System.Web.Http.Filters;
using DummyProjectBAL;
using DummyProjectStateClass;
using System.Security.Principal;
using System.Net;
using System.Threading;
using System.Net.Http;

namespace DummyProject.Filters
{
    public class Secure : AuthorizationFilterAttribute
    {
        public override void OnAuthorization(HttpActionContext actionContext)
        {
            var authorizeHeader = actionContext.Request.Headers.Authorization;
            //if (authorizeHeader == null && authorizeHeader != null&& String.IsNullOrEmpty(authorizeHeader.Parameter)== false)
            //{
                UserBAL objUserBLL = new UserBAL();
              //  var existingToken = objUserBLL.GetUserDetailsByTokenID(authorizeHeader.Parameter);
            var existingToken = objUserBLL.GetUserDetailsByTokenID("4A9636B0-21A0-4ECA-9775-A7C55A06D56C");
            if (existingToken != null)
                {
                    var principal = new GenericPrincipal((new GenericIdentity(existingToken.UserID.ToString())),
                                                                    (new[] { existingToken.RoleID.ToString() }));
                    Thread.CurrentPrincipal = principal;
                    if (HttpContext.Current != null)
                        HttpContext.Current.User = principal;
                    return;
                }
            }
            Result outResult = new Result
            {
                Status = Convert.ToString((int)HttpStatusCode.Unauthorized),
                MessageId = -1
            };
          //  actionContext.Response = actionContext.Request.CreateResponse(HttpStatusCode.OK, outResult);
        }
    }
//}