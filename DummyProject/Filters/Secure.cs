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
using static DummyProjectStateClass.EnumClass;
using DummyProjectDAL;

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
                #region check token exists
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
                    return;
                }
                #endregion

                var bearerToken = authHeaderValues.ElementAt(0);
                var token = bearerToken.StartsWith("Bearer ") ? bearerToken.Substring(7) : bearerToken;
                var secret = ConfigurationManager.AppSettings.Get("JWTsecret");
                Result objResult = null;
                TokenDetails objtokendetails = null;
                UserBAL objUserBLL = new UserBAL();

                #region check Expiry date from cache
                var jsonSerializer = new JavaScriptSerializer();
                var payloadJson = JsonWebToken.Decode(token, secret);
                var payloadData = jsonSerializer.Deserialize<Dictionary<string, object>>(payloadJson);
                object emailid;
                object clientidvar =0;
                object roleidvar=0;
                if (payloadData != null && (payloadData.TryGetValue("emailid", out emailid) && payloadData.TryGetValue("clientid", out clientidvar) && payloadData.TryGetValue("roleid", out roleidvar)))
                {
                    objtokendetails = CommonFunctions.ReturnTokenCache(Convert.ToString(clientidvar) + "_" + Convert.ToString(emailid) + "_tokendetails");
                    if (objResult.expirydate < DateTime.Now)
                    {
                        Result outResult = new Result
                        {
                            Status = Convert.ToString((int)HttpStatusCode.Unauthorized),
                            MessageId = 0,
                            errormsg = "Token Expired.Please Login again"
                        };
                        actionContext.Response = actionContext.Request.CreateResponse(HttpStatusCode.Unauthorized, outResult);
                        return;
                    }
                    else
                    {
                        objResult.expirydate = DateTime.Now.AddSeconds(Convert.ToInt32(ConfigurationManager.AppSettings.Get("cacheextendtime")));
                        objUserBLL.CreateUserProfileCache(objResult);
                    }

                }
                #endregion

                #region check Role authorization from db
               

                var apiname = actionContext.ControllerContext.RouteData.Values["action"];
                var APIID = (int)((APIName)Enum.Parse(typeof(APIName), Convert.ToString(apiname)));
               
                int status = objUserBLL.IsUserAuthorized(Convert.ToInt32(APIID), Convert.ToInt32(roleidvar), Convert.ToInt32(clientidvar));
                if (status == 0)
                {
                    Result outResult = new Result
                    {
                        Status = Convert.ToString((int)HttpStatusCode.Unauthorized),
                        MessageId = 0,
                        errormsg = "Role don't have access to this api"
                    };
                    actionContext.Response = actionContext.Request.CreateResponse(HttpStatusCode.Unauthorized, outResult);
                    return;
                }
                #endregion
                
                Thread.CurrentPrincipal = ValidateToken(token,secret,true);
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
     
        }

        private static ClaimsPrincipal ValidateToken(string token, string secret, bool checkExpiration)
        {
            //int roleid1 =0;
            //int clientid1 = 0;
            var jsonSerializer = new JavaScriptSerializer();
            var payloadJson = JsonWebToken.Decode(token, secret);
            var payloadData = jsonSerializer.Deserialize<Dictionary<string, object>>(payloadJson);
            
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
                        case "firstname":
                            claims.Add(new Claim(ClaimTypes.Name, pair.Value.ToString(), ClaimValueTypes.String));
                            break;
                        case "lastname":
                            claims.Add(new Claim(ClaimTypes.Surname, pair.Value.ToString(), ClaimValueTypes.String));
                            break;
                        case "emailid":
                            claims.Add(new Claim(ClaimTypes.Email, pair.Value.ToString(), ClaimValueTypes.Email));
                            break;
                        case "roleid":
                           // roleid1 = Convert.ToInt32(pair.Value);
                            claims.Add(new Claim(ClaimTypes.Role, pair.Value.ToString(), ClaimValueTypes.Integer));
                            break;
                        case "userid":
                            claims.Add(new Claim(ClaimTypes.UserData, pair.Value.ToString(), ClaimValueTypes.Integer));
                            break;
                        case "exp":
                            claims.Add(new Claim(ClaimTypes.Expiration, pair.Value.ToString(), ClaimValueTypes.String));
                            break;
                        case "clientid":
                           // clientid1 = Convert.ToInt32(pair.Value);
                            claims.Add(new Claim(ClaimTypes.GroupSid, pair.Value.ToString(), ClaimValueTypes.Integer));
                            break;
                            //default:
                            //     claims.Add(new Claim(claimType, pair.Value.ToString(), ClaimValueTypes.String));
                            //     break;
                    }
                }

            subject.AddClaims(claims);
            //roleid = roleid1;
            //clientid = clientid1;
            return new ClaimsPrincipal(subject);
        }

        private static DateTime FromUnixTime(long unixTime)
        {
            var epoch = new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc);
            return epoch.AddSeconds(unixTime);
        }
    }
}