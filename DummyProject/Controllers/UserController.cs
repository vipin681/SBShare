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

            HttpResponseMessage response;
            Result objResult = null;
            UserBAL userBAL = new UserBAL();
            objResult = userBAL.GetUserList();
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
            HttpResponseMessage response;
            Result objResult = null;
            UserBAL userBAL = new UserBAL();
            objResult = userBAL.GetUserDetailsBysearch(searchbar);
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
                response = Request.CreateResponse(HttpStatusCode.OK, "Data Empty!");
            }
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
            logger.Debug("Debug Level");
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
                    Exception e = new Exception();
                    logger.ErrorException("Data Empty", e);
                }
                else
                {
                    // user.UpdatedBy = userID;
                    Exception e = new Exception();
                    logger.ErrorException("Data Empty", e);
                    objResult = userBLL.UpdateUser(user);
                }

            }
                catch (Exception)
                {
                Exception e = new Exception();
                logger.ErrorException("Data Empty", e);
                logger.Debug("User Logged in ");
                    logger.ErrorException("Data Empty", e);

                    
                }
               
              
           
            if (objResult != null)
            {
               
                logger.ErrorException("Data Empty", e);
                objResult.Status = Convert.ToString((int)HttpStatusCode.OK);
                objResult.errormsg = "";
                response = Request.CreateResponse(HttpStatusCode.OK, objResult);
            }
            else
            {
                objResult = new Result();
                objResult.Status = Convert.ToString((int)HttpStatusCode.NotFound);
                logger.ErrorException("Data Empty", e);
                response = Request.CreateResponse(HttpStatusCode.NotFound, "Data Empty!");
            }
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
            HttpResponseMessage response;
            Result objResult = null;
            HttpClient client = new HttpClient();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            // Int64 userID = Int64.Parse(User.Identity.Name);
            UserBAL userBLL = new UserBAL();
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
            return response;
        }

        #endregion

        #region all


        [HttpGet]

        /// <summary>
        /// Edit the Existing user data by userid
        /// </summary>
        /// <param name="ID">
        /// id should be a existing userid
        /// </param>
        /// <returns>User detail</returns>
        public HttpResponseMessage GetUserDetailsByID(int ID)
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
