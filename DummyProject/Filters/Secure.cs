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
using System.Security.Claims;
using System.Configuration;
using System.Web.Script.Serialization;
using System.Collections;

namespace DummyProject.Filters
{
    public class Secure : AuthorizationFilterAttribute
    {
        public override void OnAuthorization(HttpActionContext actionContext)
        {

            //HttpResponseMessage errorResponse = null;
            var request = actionContext.Request;
            try
            {
                IEnumerable<string> authHeaderValues;
                request.Headers.TryGetValues("Authorization", out authHeaderValues);
             


                if (authHeaderValues == null)
                {
                    Result outResult = new Result
                    {
                        Status = Convert.ToString((int)HttpStatusCode.Unauthorized),
                        MessageId = -1
                    };
                    actionContext.Response = actionContext.Request.CreateResponse(HttpStatusCode.Unauthorized, outResult);
                }
                var bearerToken = authHeaderValues.ElementAt(0);
                var token = bearerToken.StartsWith("Bearer ") ? bearerToken.Substring(7) : bearerToken;

                //var secret = ConfigurationManager.AppSettings.Get("jwtKey");
                var secret = ConfigurationManager.AppSettings.Get("JWTsecret");

                Thread.CurrentPrincipal = ValidateToken(
                    token,
                    secret,
                    true
                    );

                if (HttpContext.Current != null)
                {
                    HttpContext.Current.User = Thread.CurrentPrincipal;
                }
            }
            catch (SignatureVerificationException ex)
            {
                Result outResult = new Result
                {
                    Status = Convert.ToString((int)HttpStatusCode.Unauthorized),
                    MessageId = -1,
                    errormsg= ex.Message
                };
                actionContext.Response = actionContext.Request.CreateResponse(HttpStatusCode.Unauthorized, outResult);
            }
            catch (Exception ex)
            {
                Result outResult = new Result
                {
                    Status = Convert.ToString((int)HttpStatusCode.Unauthorized),
                    MessageId = -1,
                    errormsg = ex.Message
                };
                actionContext.Response = actionContext.Request.CreateResponse(HttpStatusCode.Unauthorized, outResult);
            }
            //Result outResult1 = new Result
            //{
            //    Status = Convert.ToString((int)HttpStatusCode.OK),
            //    MessageId = 1
            //};
            //actionContext.Response = actionContext.Request.CreateResponse(HttpStatusCode.OK, outResult1);


            //var authorizeHeader = actionContext.Request.Headers.Authorization;
            //if (authorizeHeader == null && authorizeHeader != null && String.IsNullOrEmpty(authorizeHeader.Parameter) == false)
            //{
            //    UserBAL objUserBLL = new UserBAL();
            //    var existingToken = objUserBLL.GetUserDetailsByTokenID(authorizeHeader.Parameter);
            //    if (existingToken != null)
            //    {
            //        var principal = new GenericPrincipal((new GenericIdentity(existingToken.UserID.ToString())),
            //                                                        (new[] { existingToken.RoleID.ToString() }));
            //        Thread.CurrentPrincipal = principal;
            //        if (HttpContext.Current != null)
            //            HttpContext.Current.User = principal;
            //        return;
            //    }
            //}
            //Result outResult = new Result
            //{
            //    Status = Convert.ToString((int)HttpStatusCode.Unauthorized),
            //    MessageId = -1
            //};
            //actionContext.Response = actionContext.Request.CreateResponse(HttpStatusCode.OK, outResult);
        }

        private static ClaimsPrincipal ValidateToken(string token, string secret, bool checkExpiration)
        {
            var jsonSerializer = new JavaScriptSerializer();
            var payloadJson = JsonWebToken.Decode(token, secret);
            var payloadData = jsonSerializer.Deserialize<Dictionary<string, object>>(payloadJson);


            object exp;
            if (payloadData != null && (checkExpiration && payloadData.TryGetValue("exp", out exp)))
            {
                var validTo = FromUnixTime(long.Parse(exp.ToString()));
                if (DateTime.Compare(validTo, DateTime.UtcNow) <= 0)
                {
                    throw new Exception(
                        string.Format("Token is expired. Expiration: '{0}'. Current: '{1}'", validTo, DateTime.UtcNow));
                }
            }

            var subject = new ClaimsIdentity("Federation", ClaimTypes.Name, ClaimTypes.Role);

            var claims = new List<Claim>();

            if (payloadData != null)
                foreach (var pair in payloadData)
                {
                    var claimType = pair.Key;

                    var source = pair.Value as ArrayList;

                    if (source != null)
                    {
                        claims.AddRange(from object item in source
                                        select new Claim(claimType, item.ToString(), ClaimValueTypes.String));

                        continue;
                    }

                    switch (pair.Key)
                    {
                        case "name":
                            claims.Add(new Claim(ClaimTypes.Name, pair.Value.ToString(), ClaimValueTypes.String));
                            break;
                        case "surname":
                            claims.Add(new Claim(ClaimTypes.Surname, pair.Value.ToString(), ClaimValueTypes.String));
                            break;
                        case "email":
                            claims.Add(new Claim(ClaimTypes.Email, pair.Value.ToString(), ClaimValueTypes.Email));
                            break;
                        case "role":
                            claims.Add(new Claim(ClaimTypes.Role, pair.Value.ToString(), ClaimValueTypes.String));
                            break;
                        case "userId":
                            claims.Add(new Claim(ClaimTypes.UserData, pair.Value.ToString(), ClaimValueTypes.Integer));
                            break;
                        default:
                            claims.Add(new Claim(claimType, pair.Value.ToString(), ClaimValueTypes.String));
                            break;
                    }
                }

            subject.AddClaims(claims);
            return new ClaimsPrincipal(subject);
        }

        private static DateTime FromUnixTime(long unixTime)
        {
            var epoch = new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc);
            return epoch.AddSeconds(unixTime);
        }
    }
}