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
using DummyProject.CustomFilters;
using System.Net.Http.Headers;
using System.Data.SqlClient;
using DummyProject.Filters;
using NLog;
using System.Web.Http.Description;
using DummyProject;

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
        #region Get User
        /// <summary>
        /// Get all the user list
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        //[Secure]
        public HttpResponseMessage GetUserList(int clientid)
        {

            var re = Request;
            var headers = re.Headers;

            if (headers.Contains("Custom"))
            {
                string token = headers.GetValues("Custom").First();
            }



            logger.Debug("get all users started");
            HttpResponseMessage response = new HttpResponseMessage();
            Result objResult = new Result();
            UserBAL userBAL = new UserBAL();
        

            try
            {
                objResult.Results = userBAL.checkcache();
                //objResult.Results=
                if (objResult == null || objResult.Results == "" || objResult.Results == null)
                {
                    objResult = userBAL.GetUserList(clientid);
                    userBAL.setcache(objResult.Results);
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
                else
                {
                        objResult.Status = Convert.ToString((int)HttpStatusCode.OK);
                        objResult.errormsg = "";
                        response = Request.CreateResponse(HttpStatusCode.OK, objResult);
                    
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

        #region Update Password
        /// <summary>
        /// Update Password
        /// </summary>
        /// <param name="userPassword">
        /// Enter corresponding Userid,Password,modifiedby,modifieddate to change password for specific user</param>
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
                logger.Debug("BLL started");
                objResult = userBLL.UpdateUserPassword(userPassword);
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

        #region Get User by id
        /// <summary>
        /// Get all the user list by id
        /// </summary>
        /// <param name="ID">
        /// Enter corresponding Userid to search for specific user</param>
        /// <returns></returns>
        [HttpGet]
        [Secure]
        public HttpResponseMessage GetUserById(int ID, int clientid)
        {
            logger.Debug("get all user by id started");
            HttpResponseMessage response = new HttpResponseMessage();
            Result objResult = null;
            UserBAL userBAL = new UserBAL();
            objResult = userBAL.GetUserDetailsByID(ID, clientid);
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
        /// <returns></returns>
        [HttpGet]
        [Secure]
        public HttpResponseMessage GetSearchResult(string searchbar)
        {
            logger.Debug("SearchResult function started for searching");
            HttpResponseMessage response = new HttpResponseMessage();
            Result objResult = null;
            UserBAL userBAL = new UserBAL();
            try
            {
                objResult = userBAL.GetUserDetailsBysearch(searchbar);
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
        //  [Secure]
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
                    var level = LogLevel.Debug;
                    logger.Log(level, "BLL started");
                    objResult = userBLL.InsertUser(user);
                    objResult.token.ToString();


                }
                else
                {
                    // user.UpdatedBy = userID;
                    //Exception e = new Exception();
                    //logger.ErrorException("Data Empty", e);
                    objResult = userBLL.UpdateUser(user);
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
                    objResult = userBLL.UpdateUser(user);
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

        #region CheckLogin
        /// <summary>
        /// check is user a valid user in Login page
        /// </summary>
        /// <returns></returns>
        [HttpPost]
        [AllowAnonymous]
        public HttpResponseMessage CheckLogin(string emailaddress, string Password, int clientid)
        {
            HttpResponseMessage response;
            Result objResult = null;
            UserBAL objUserBLL = new UserBAL();
            objResult = objUserBLL.IsValidUser(emailaddress, Password, clientid);
            if (objResult != null && objResult.Results != null)
            {
                response = Request.CreateResponse(HttpStatusCode.OK, objResult);
            }
            else
            {
                response = Request.CreateResponse(HttpStatusCode.OK, "Data Empty!");
            }
            return response;
        }
        #endregion

        #region RefreshToken
        /// <summary>
        /// New token will be generated by providing a old valid token(Exp date will b extended)
        /// </summary>
        /// <returns></returns>
        [HttpPost]
        [Secure]
        public HttpResponseMessage RefreshToken(string OldToken)
        {
            HttpResponseMessage response;
            Result objResult = null;
            UserBAL objUserBLL = new UserBAL();
            objResult = objUserBLL.RefreshToken(OldToken);
            if (objResult != null)
            {
                response = Request.CreateResponse(HttpStatusCode.OK, objResult);
            }
            else
            {
                response = Request.CreateResponse(HttpStatusCode.BadRequest, "token is already expired");
            }
            return response;
        }
        #endregion

        #region Get User Role
        /// <summary>
        /// Get Role List
        /// </summary>
        [HttpGet]
        [Secure]
        public HttpResponseMessage GetRole()
        {
            HttpResponseMessage response;
            Result objResult = null;
            //  Int64 userID = Int64.Parse(User.Identity.Name);
            UserBAL objUserBAL = new UserBAL();
            objResult = objUserBAL.GetRole();
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
            return response;
        }
        #endregion

        #region Change Theme 
        /// <summary>
        /// Update Theme
        /// </summary>
        /// <param name="themeid">
        /// Enter Theme Id to change</param>
        /// /// <param name="userid">
        /// Enter userid for specific user</param>
        /// <returns></returns>
        [HttpPost]
        [Secure]
        public HttpResponseMessage ChangeTheme(int themeid, int userid)
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
                objResult = userBLL.ChangeTheme(themeid, userid);
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

        [HttpGet]
        //[Secure]
        public void setcache(string str)
        {
            UserBAL userBAL1 = new UserBAL();
            userBAL1.setcache(str);
        }

        [HttpGet]
        //[Secure]
        public string getcache(string str)
        {
            UserBAL userBAL1 = new UserBAL();
            return userBAL1.checkcache();

        }

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
            objResult = objUserBAL.GetUserListByID(keyword);
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
