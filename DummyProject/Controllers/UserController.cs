using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web;
using System.Web.Http.Cors;
using DummyProjectStateClass;
using DummyProjectBAL;
using DummyProject.CustomFilters;
using System.Net.Http.Headers;
using System.Data.SqlClient;
using DummyProject.Filters;
using NLog;
using System.Web.Http.Description;

namespace DummyProject.Controllers
{
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
        public HttpResponseMessage GetUserList()
        {
            logger.Debug("get all users started");
            HttpResponseMessage response = new HttpResponseMessage(); 
            Result objResult = null;
            UserBAL userBAL = new UserBAL();
            objResult = userBAL.GetUserList();
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
            catch (Exception)
            {
                Exception e = new Exception();
                logger.ErrorException("Data Empty", e);

            }
            logger.Debug("get all users finished");
            return response;
        }
        #endregion
        #region Update Password
        [HttpPost]
        public HttpResponseMessage UpdatePassword(UpdateUserPassword userPassword)
        {
            HttpResponseMessage response;
            Result objResult = null;
            HttpClient client = new HttpClient();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            UserBAL userBLL = new UserBAL();
            objResult = userBLL.UpdateUserPassword(userPassword);
            response = Request.CreateResponse(HttpStatusCode.OK, "Password updated successfully");
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
        public HttpResponseMessage GetUserById(int ID)
        {
            logger.Debug("get all user by id started");
            HttpResponseMessage response = new HttpResponseMessage();
            Result objResult = null;
            UserBAL userBAL = new UserBAL();
            objResult = userBAL.GetUserDetailsByID(ID);
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
            catch (Exception)
            {
                Exception e = new Exception();
                logger.ErrorException("Data Empty", e);

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
        public HttpResponseMessage SaveUserDetails(UserDetails user)
        {
            logger.Debug("Submit user started");
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
                    objResult = userBLL.InsertUser(user);

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

        #region all
        
        [ApiExplorerSettings(IgnoreApi = true)]
        [HttpGet]
        public HttpResponseMessage GetUserDetailsByID1(int ID)
        {
            HttpResponseMessage response;
            Result objResult = null;
            UserBAL userBAL = new UserBAL();
            objResult = userBAL.GetUserDetailsByID(ID);
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

        [ApiExplorerSettings(IgnoreApi = true)]
        [HttpPost]
        public HttpResponseMessage CheckLogin(string UserName, string Password)
        {
            HttpResponseMessage response;
            Result objResult = null;
            UserBAL objUserBLL = new UserBAL();
            objResult = objUserBLL.IsValidUser(UserName, Password);
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

        [ApiExplorerSettings(IgnoreApi = true)]
        [HttpGet]
        public HttpResponseMessage GetRole()
        {
            HttpResponseMessage response;
            Result objResult = null;
            //  Int64 userID = Int64.Parse(User.Identity.Name);
            UserBAL objUserBAL = new UserBAL();
            objResult = objUserBAL.GetRole();
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

        [ApiExplorerSettings(IgnoreApi = true)]
        [HttpGet]
        public HttpResponseMessage GetCountryList()
        {
            HttpResponseMessage response;
            Result objResult = null;

            UserBAL obj = new UserBAL();
            objResult = obj.GetCountryList();
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

        [ApiExplorerSettings(IgnoreApi = true)]
        [HttpGet]
        [OnExceptionHandler]
        public HttpResponseMessage GetStateList()
        {
            HttpResponseMessage response;
            Result objResult = null;
            UserBAL obj = new UserBAL();
            objResult = obj.GetStateList();
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

        [ApiExplorerSettings(IgnoreApi = true)]
        [HttpGet]
        public HttpResponseMessage GetItemDetails()
        {
            HttpResponseMessage response;
            Result objResult = null;
            //  Int64 userID = Int64.Parse(User.Identity.Name);
            UserBAL objUserBAL = new UserBAL();
            //objResult = objUserBAL.GetItemDetails(ItemName);
            objResult = objUserBAL.GetItemDetails();
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

        [ApiExplorerSettings(IgnoreApi = true)]
        [HttpGet]
        public HttpResponseMessage getMenubyUserRole(string UserRole)
        {
            HttpResponseMessage response;
            Result objResult = null;
            UserBAL userBAL = new UserBAL();
            objResult = userBAL.getMenubyUserRole(UserRole);
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




        #endregion
    }
}
