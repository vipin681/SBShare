using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
//using System.Web;
using System.Web.Http.Cors;
using DummyProjectStateClass;
using DummyProjectBAL;
//using DummyProject.CustomFilters;
using System.Net.Http.Headers;
using System.Data.SqlClient;
using DummyProject.Filters;
using NLog;
using System.Web.Http.Description;
using DummyProject;
using StackExchange.Redis;
using System.Text;
using RedisConnectionTest;
using DummyProjectDAL;
using Newtonsoft.Json;
using System.Configuration;

namespace DummyProject.Controllers
{
    /// <summary>
    /// APIs for Crud operation on user and Login page
    /// </summary>

    [EnableCors(origins: "*", headers: " *", methods: "*", SupportsCredentials = true)]
    public class UserController : ApiController
    {
        private static Logger logger = LogManager.GetCurrentClassLogger();
        Exception e = new Exception();

        #region CheckLogin
        /// <summary>
        /// check is user a valid user in Login page
        /// </summary>
        /// <param name="emailaddress">
        /// Enter emailaddress for login</param>
        ///  <param name="Password">
        /// Enter Password for login</param>
        ///  <param name="clientid">
        /// Enter clientid for login eg. 20 for virginia</param>
        /// <returns></returns>
        [HttpPost]
        [AllowAnonymous]
        public HttpResponseMessage CheckLogin(string emailaddress, string Password, int clientid)
        {
            logger.Debug("Login API started");
            HttpResponseMessage response;
            Result objResult = null;
            TokenDetails tokenclass = new TokenDetails();
            UserDetails userdetails = new UserDetails();
            UserBAL objUserBLL = new UserBAL();
            string token = "";
            logger.Debug("cheking expiry from cache started");
            if (CommonFunctions.IsKeyexistsinRedis(Convert.ToString(clientid) + "_" + emailaddress + "_tokendetails"))
            {
                logger.Debug("cache not existed and IsValidUser_BAL started");
                objResult = objUserBLL.IsValidUser(emailaddress, Password, clientid, out token);
                if (token != "")
                {
                    logger.Debug("IsValidUser_BAL finished and creating redis key for token");
                    #region create token  Redis
                    tokenclass.token = token;
                    tokenclass.expirydate = CommonFunctions.expiryafteraddingseconds(Convert.ToInt32(ConfigurationManager.AppSettings["AuthTokenExpiry"]));
                    tokenclass.userid = objResult.UserID;
                    tokenclass.encryptedpassword = Password;
                    CommonFunctions.CreateRedisKeyValue(Convert.ToString(clientid) + "_" + emailaddress + "_tokendetails", JsonConvert.SerializeObject(tokenclass));
                    #endregion

                    objResult.Status = Convert.ToString((int)HttpStatusCode.OK);
                }
                if (objResult != null && objResult.Status == Convert.ToString((int)HttpStatusCode.OK))
                {
                    response = Request.CreateResponse(HttpStatusCode.OK, objResult);
                    response.Headers.Add("Authorization", token);
                }
                else
                {
                    response = Request.CreateResponse(HttpStatusCode.NotFound, "Data Empty!");
                }
            }
            else
            {
                logger.Debug("ReturnUserProfileCache1 starting ");
                tokenclass = CommonFunctions.ReturnUserProfileCache1(Convert.ToString(clientid) + "_" + emailaddress + "_tokendetails", Password);
                if (tokenclass.encryptedpassword != "")
                {
                    tokenclass.token = tokenclass.token;
                    tokenclass.expirydate = CommonFunctions.expiryafteraddingseconds(Convert.ToInt32(ConfigurationManager.AppSettings["AuthTokenExpiry"]));
                    CommonFunctions.CreateRedisKeyValue(Convert.ToString(clientid) + "_" + emailaddress + "_tokendetails", JsonConvert.SerializeObject(tokenclass));
                    logger.Debug("Redis Replaced with new expiry date");
                    objResult = new Result();
                    objResult.Status = Convert.ToString((int)HttpStatusCode.OK);
                    response = Request.CreateResponse(HttpStatusCode.OK, objResult);
                    response.Headers.Add("Authorization", tokenclass.token);
                }
                else
                {
                    response = Request.CreateResponse(HttpStatusCode.Unauthorized, "Invalid credentials");
                }
            }
            logger.Debug("Login API finished");
            return response;
        }
        #endregion

        #region LogOut
        /// <summary>
        /// LogOut User
        /// </summary>
        ///  /// <param name="emailaddress">
        /// Enter emailaddress for specific user</param>
        /// <param name="clientid">
        /// Enter client ID for specific user eg. 20 for Virginia</param>
        /// <returns></returns>
        [AllowAnonymous]
        [HttpPost]
        public HttpResponseMessage LogOut(string emailaddress, int clientid)
        {
            logger.Debug("Logout API started");
            Result objResult = new Result();
            HttpResponseMessage response;
            CommonFunctions.DeleteKeyinRedis(Convert.ToString(clientid) + "_" + emailaddress + "_tokendetails");
            objResult.Status = Convert.ToString((int)HttpStatusCode.OK);
            response = Request.CreateResponse(HttpStatusCode.OK, objResult);
            logger.Debug("Logout API finished");
            return response;
        }
        #endregion

        #region Get User
        /// <summary>
        /// Get all the user list
        /// </summary>
        ///  <param name="clientid">
        /// Enter clientid for login eg. 20 for virginia</param>
        /// <returns></returns>
        [HttpGet]
        [Secure]
        public HttpResponseMessage GetUserList(int clientid)
        {
            StringBuilder sb = new StringBuilder();
            logger.Debug("get all users started");
            HttpResponseMessage response = new HttpResponseMessage();
            Result objResult = new Result();
            UserBAL userBAL = new UserBAL();
            try
            {
                logger.Debug("GetUserList DAL started");
                objResult = userBAL.GetUserList(clientid);
                logger.Debug("GetUserList DAL finished");
                if (objResult != null || objResult.Results != "")
                {
                    objResult.Status = Convert.ToString((int)HttpStatusCode.OK);
                    objResult.errormsg = "";
                    response = Request.CreateResponse(HttpStatusCode.OK, objResult);
                }
                else
                {
                    objResult.Status = Convert.ToString((int)HttpStatusCode.NotFound);
                    objResult.errormsg = "Data Empty!";
                    response = Request.CreateResponse(HttpStatusCode.NotFound, "Data Empty!");
                }

            }
            catch (Exception ex)
            {

                logger.ErrorException("Data Empty", ex);

            }

            logger.Debug("get all users finished");
            return response;
        }
        #endregion

        #region Get User by id
        /// <summary>
        /// Get all the user list by id
        /// </summary>
        /// <param name="ID">
        /// Enter corresponding Userid to search for specific user</param>
        /// <param name="clientid">
        /// Enter corresponding clientid to search for specific user eg. 20 for virginia</param>
        /// <returns></returns>
        [HttpGet]
        [Secure]
        public HttpResponseMessage GetUserById(int ID, int clientid)
        {
            logger.Debug("get all user by id started");
            HttpResponseMessage response = new HttpResponseMessage();
            Result objResult = null;
            UserBAL userBAL = new UserBAL();

            logger.Debug("GetUserDetailsByID BAL started");
            objResult = userBAL.GetUserDetailsByID(ID, clientid);
            logger.Debug("GetUserDetailsByID BAL ended");
            CommonFunctions.CreateRedisKeyValue(Convert.ToString(clientid) + "_" + ID.ToString() + "_userdetails", JsonConvert.SerializeObject(objResult.Results));
            try
            {
                if (objResult != null)
                {
                    objResult.Status = Convert.ToString((int)HttpStatusCode.OK);
                    objResult.errormsg = "";
                    response = Request.CreateResponse(HttpStatusCode.OK, objResult);
                }
                else
                {
                    objResult.Status = Convert.ToString((int)HttpStatusCode.NotFound);
                    objResult.errormsg = "Data Empty!";
                    response = Request.CreateResponse(HttpStatusCode.NotFound, "Data Empty!");
                }
            }
            catch (Exception ex)
            {
                logger.ErrorException("Data Empty", ex);

            }
            logger.Debug("get all user by id finished");
            return response;
        }
        #endregion

        #region Search
        /// <summary>
        /// Search user on basis of First name,LastName,workerid  and emailid
        /// </summary> 
        /// <param name="searchbar">
        /// Enter any string to filter on basis of First name,LastName,workerid  and emailid</param>
        /// /// <param name="clientid">
        /// Enter any clientid eg. 20 for virginia</param>
        /// <returns></returns>
        [HttpGet]
        [Secure]
        public HttpResponseMessage GetSearchResult(string searchbar, int clientid)
        {
            logger.Debug("SearchResult function started for searching");
            HttpResponseMessage response = new HttpResponseMessage();
            Result objResult = null;
            UserBAL userBAL = new UserBAL();
            try
            {
                logger.Debug("GetUserDetailsByID BAL started");
                objResult = userBAL.GetUserDetailsBysearch(searchbar, clientid);
                logger.Debug("GetUserDetailsBysearch BAL ended");
                if (objResult.Results != null)
                {
                    objResult.Status = Convert.ToString((int)HttpStatusCode.OK);
                    objResult.errormsg = "";
                    response = Request.CreateResponse(HttpStatusCode.OK, objResult);
                }
                else
                {
                    objResult.Status = Convert.ToString((int)HttpStatusCode.NotFound);
                    objResult.errormsg = "Data Empty!";
                    response = Request.CreateResponse(HttpStatusCode.NotFound, "Data Empty!");
                }
            }
            catch (Exception e)
            {

                logger.ErrorException("Data Empty", e);

            }
            logger.Debug("SearchResult function finished for searching");
            return response;
        }

        #endregion

        #region Submit\post user

        /// <summary>
        /// Submit the new user data
        /// </summary>
        /// <param name="user">
        /// id should be zero,
        /// client id should be present client eg.20,
        /// location id should be present client eg.2,
        /// role should be present role eg.1</param>
        /// <returns>A value</returns>
        [HttpPost]
        [AllowAnonymous]
        public HttpResponseMessage SaveUserDetails(UserDetails user)
        {
            logger.Info("Debug Started");
            //logger.Debug("Submit user started");
            HttpResponseMessage response;
            Result objResult = null;
            HttpClient client = new HttpClient();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            // Int64 userID = Int64.Parse(User.Identity.Name);
            UserBAL userBLL = new UserBAL();

            // user.InsertedBy = ID;
            try
            {
                if (user.userid == 0)
                {
                    logger.Debug("InsertUser BAL started");
                    objResult = userBLL.InsertUser(user);
                    logger.Debug("InsertUser BAL ended");
                    
                }
                else
                {
                    logger.Debug("UpdateUser BAL started");
                    objResult = userBLL.UpdateUser(user);
                    logger.Debug("UpdateUser BAL ended");
                }

            }
            catch (Exception e)

            {
                logger.ErrorException("Data Empty", e);

            }



            if (objResult != null)
            {
                objResult.Status = Convert.ToString((int)HttpStatusCode.OK);
                objResult.errormsg = "";
                response = Request.CreateResponse(HttpStatusCode.OK, objResult);
            }
            else
            {
                objResult = new Result();
                objResult.Status = Convert.ToString((int)HttpStatusCode.NotFound);
                response = Request.CreateResponse(HttpStatusCode.NotFound, "Data Empty!");
            }
            logger.Debug("Submit user ended");
            return response;
        }
        #endregion

        #region Edit\post user
        /// <summary>
        /// Edit the Existing user data
        /// </summary>
        /// <param name="user">
        /// id should be a existing userid,
        /// client id should be present client eg.20,
        /// location id should be present client eg.2,
        /// role should be present role eg.1</param>
        /// <returns>A value</returns>
        [HttpPut]
        [Secure]
        public HttpResponseMessage EditUserDetails(UserDetails user)
        {
            logger.Debug("Edit user started");
            HttpResponseMessage response;
            Result objResult = null;
            HttpClient client = new HttpClient();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            // Int64 userID = Int64.Parse(User.Identity.Name);
            UserBAL userBLL = new UserBAL();
            try
            {

                if (user.userid == 0)
                {
                    objResult = new Result();
                    objResult.Status = Convert.ToString((int)HttpStatusCode.NotFound);
                    objResult.errormsg = "Data not found";
                    response = Request.CreateResponse(HttpStatusCode.NotFound, objResult);
                }
                else
                {
                    logger.Debug("UpdateUser BAL started");
                    objResult = userBLL.UpdateUser(user);
                    logger.Debug("UpdateUser BAL finished");
                }
            }
            catch (Exception e)
            {
                logger.ErrorException("Data Empty", e);

            }
            if (objResult != null)
            {
                objResult.Status = Convert.ToString((int)HttpStatusCode.OK);
                objResult.errormsg = "";
                response = Request.CreateResponse(HttpStatusCode.OK, objResult);
            }
            else
            {
                objResult = new Result();
                objResult.Status = Convert.ToString((int)HttpStatusCode.NotFound);
                objResult.errormsg = "Data Empty!";
                response = Request.CreateResponse(HttpStatusCode.NotFound, "Data Empty!");
            }

            logger.Debug("Edit user finished");
            return response;
        }

        #endregion

        #region Update Password
        /// <summary>
        /// Update Password
        /// </summary>
        /// <param name="userPassword">
        /// Enter corresponding Userid,Password,modifiedby,modifieddate,clientid (eg. 20 for virginia )to change password for specific user</param>
        /// <returns></returns>
        /// <returns></returns>
        [HttpPost]
        [Secure]
        public HttpResponseMessage UpdatePassword(UpdateUserPassword userPassword)
        {
            logger.Info("Started");
            logger.Debug("Update  user started");
            HttpResponseMessage response = new HttpResponseMessage(); ;
            Result objResult = null;
            HttpClient client = new HttpClient();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            UserBAL userBLL = new UserBAL();
            try
            {
                logger.Debug("UpdateUserPassword BAL started");
                objResult = userBLL.UpdateUserPassword(userPassword);
                logger.Debug("UpdateUserPassword BAL finished");
                if (objResult.Results == 1)
                {
                    response = Request.CreateResponse(HttpStatusCode.OK, "Password updated successfully");
                }
                else
                {
                    response = Request.CreateResponse(HttpStatusCode.BadRequest, "Something went wrong");
                }
                return response;
            }
            catch (Exception ex)
            {
                logger.ErrorException("Data Empty", ex);
            }

            logger.Debug("update user finished");
            return response;
        }
        #endregion

        #region Get User Role
        /// <summary>
        /// Get Role List
        /// </summary>
        [HttpGet]
        [Secure]
        public HttpResponseMessage GetRole(int clientid)
        {
            logger.Debug("GetRole API started");
            HttpResponseMessage response;
            Result objResult = null;
            //  Int64 userID = Int64.Parse(User.Identity.Name);
            UserBAL objUserBAL = new UserBAL();
            logger.Debug("GetRole BAL finished");
            objResult = objUserBAL.GetRole(clientid);
            logger.Debug("GetRole BAL finished");
            if (objResult != null & objResult.Results != null)
            {
                objResult.Status = Convert.ToString((int)HttpStatusCode.OK);
                response = Request.CreateResponse(HttpStatusCode.OK, objResult);
            }
            else
            {
                objResult.Status = Convert.ToString((int)HttpStatusCode.NotFound);
                response = Request.CreateResponse(HttpStatusCode.OK, "Data Empty!");
            }
            logger.Debug("GetRole API finished");
            return response;
        }
        #endregion

        #region Change Theme 
        /// <summary>
        /// Update Theme
        /// </summary>
        /// <param name="themeid">
        /// Enter Theme Id to change</param>
        ///<param name="userid">
        /// Enter userid for specific user</param>
        /// ///<param name="clientid">
        /// Enter client id for specific user  eg. 20 for virginia</param>
        /// <returns></returns>
        [HttpPost]
        [Secure]
        public HttpResponseMessage ChangeTheme(int themeid, int userid,int clientid)
        {
            logger.Info("Change Theme API Started");
            logger.Debug("Change Theme API started");
            HttpResponseMessage response = new HttpResponseMessage(); ;
            Result objResult = null;
            HttpClient client = new HttpClient();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            UserBAL userBLL = new UserBAL();
            try
            {
                logger.Debug(" Change Theme BLL started");
                objResult = userBLL.ChangeTheme(themeid, userid, clientid);
                logger.Debug(" Change Theme BLL finished");
                response = Request.CreateResponse(HttpStatusCode.OK, "Theme successfully");
            }
            catch (Exception ex)
            {
                logger.ErrorException("Data Empty", ex);
            }

            logger.Debug("Change Theme API finished");
            logger.Info("Change Theme API finished");
            return response;
        }
        #endregion

       




























        #region all

        [ApiExplorerSettings(IgnoreApi = true)]
        [HttpGet]
        public HttpResponseMessage GetUserDetailsByID1(int ID, int clientid)
        {
            HttpResponseMessage response;
            Result objResult = null;
            UserBAL userBAL = new UserBAL();
            objResult = userBAL.GetUserDetailsByID(ID, clientid);
            if (objResult != null)
            {
                objResult.Status = Convert.ToString((int)HttpStatusCode.OK);
                objResult.errormsg = "";
                response = Request.CreateResponse(HttpStatusCode.OK, objResult);
            }
            else
            {
                objResult = new Result();
                objResult.Status = Convert.ToString((int)HttpStatusCode.NotFound);
                objResult.errormsg = "Data not found";
                response = Request.CreateResponse(HttpStatusCode.NotFound, objResult);

            }
            return response;
        }

        [ApiExplorerSettings(IgnoreApi = true)]
        [HttpGet]
        public HttpResponseMessage GetListByID(String keyword)
        {
            HttpResponseMessage response;
            Result objResult = null;
            //  Int64 userID = Int64.Parse(User.Identity.Name);
            UserBAL objUserBAL = new UserBAL();
           // objResult = objUserBAL.GetUserListByID(keyword);
            if (objResult != null)
            {
                response = Request.CreateResponse(HttpStatusCode.OK, objResult);
            }
            else
            {
                response = Request.CreateResponse(HttpStatusCode.OK, "Data Empty!");
            }
            return response;
        }





        //[ApiExplorerSettings(IgnoreApi = true)]
        //[HttpGet]
        //public HttpResponseMessage GetCountryList()
        //{
        //    HttpResponseMessage response;
        //    Result objResult = null;

        //    UserBAL obj = new UserBAL();
        //    objResult = obj.GetCountryList();
        //    if (objResult != null)
        //    {
        //        response = Request.CreateResponse(HttpStatusCode.OK, objResult);
        //    }
        //    else
        //    {
        //        response = Request.CreateResponse(HttpStatusCode.OK, "Data Empty!");
        //    }
        //    return response;
        //}

        //[ApiExplorerSettings(IgnoreApi = true)]
        //[HttpGet]
        //[OnExceptionHandler]
        //public HttpResponseMessage GetStateList()
        //{
        //    HttpResponseMessage response;
        //    Result objResult = null;
        //    UserBAL obj = new UserBAL();
        //    objResult = obj.GetStateList();
        //    if (objResult != null)
        //    {
        //        response = Request.CreateResponse(HttpStatusCode.OK, objResult);
        //    }
        //    else
        //    {
        //        response = Request.CreateResponse(HttpStatusCode.OK, "Data Empty!");
        //    }
        //    return response;
        //}


        [ApiExplorerSettings(IgnoreApi = true)]
        [HttpGet]
        public HttpResponseMessage UserLookup(String TypeHeadKeyword)
        {
            HttpResponseMessage response;
            Result objResult = null;
            //  Int64 userID = Int64.Parse(User.Identity.Name);
            UserBAL objUserBAL = new UserBAL();
            objResult = objUserBAL.UserLookup(TypeHeadKeyword);
            if (objResult != null)
            {
                response = Request.CreateResponse(HttpStatusCode.OK, objResult);
            }
            else
            {
                response = Request.CreateResponse(HttpStatusCode.OK, "Data Empty!");
            }
            return response;
        }


        //[HttpGet]
        //public HttpResponseMessage getUserRoleDetails(string UserRole)
        //{
        //    HttpResponseMessage response;
        //    Result objResult = null;
        //    UserBAL userBAL = new UserBAL();
        //    objResult = userBAL.getUserRoleDetails(UserRole);
        //    if (objResult != null)
        //    {
        //        response = Request.CreateResponse(HttpStatusCode.OK, objResult);
        //    }
        //    else
        //    {
        //        response = Request.CreateResponse(HttpStatusCode.OK, "Data Empty!");
        //    }
        //    return response;
        //}






        #endregion
    }
}
