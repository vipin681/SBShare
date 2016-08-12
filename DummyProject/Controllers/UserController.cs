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
        [HttpPost]
        public HttpResponseMessage SaveUserDetails(UserDetails user)
        {
            HttpResponseMessage response;
            Result objResult = null;
            HttpClient client = new HttpClient();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            // Int64 userID = Int64.Parse(User.Identity.Name);
            UserBAL userBLL = new UserBAL();
            try
            {
                if (user.ID == 0)
                {

                    objResult = userBLL.InsertUser(user);
                }

            }
            catch (Exception ex)
            {
                logger.ErrorException("Error Occured", ex);
                // throw;
            }
            if (user.ID == 0)
            {
                // user.InsertedBy = ID;
                objResult = userBLL.InsertUser(user);
            }
            else
            {
                // user.UpdatedBy = userID;
                objResult = userBLL.UpdateUser(user);
            }
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
        [Secure]
        public HttpResponseMessage GetUserDetailsByID(int ID)
        {
            HttpResponseMessage response;
            Result objResult = null;
            UserBAL userBAL = new UserBAL();
            objResult = userBAL.GetUserDetailsByID(ID);
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
        // [NotImplExceptionFilterAttribute]
        [Secure]
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
        //[OnExceptionHandler]

       
        public HttpResponseMessage CheckLogin(string UserName, string Password)
        {
            logger.Debug("Debug Level");
            HttpResponseMessage response;
            Result objResult = null;
            UserBAL objUserBLL = new UserBAL();
            objResult = objUserBLL.IsValidUser(UserName, Password);
            if (objResult != null)
            {
                logger.Debug("Debug Level");
                Exception e = new Exception();
                logger.ErrorException("Data  Found",e);
                response = Request.CreateResponse(HttpStatusCode.OK, objResult);
            }
            else
            {
                Exception e = new Exception();
                logger.ErrorException("Data Empty", e);
                response = Request.CreateResponse(HttpStatusCode.OK, "Data Empty!");
            }
            return response;
          


            // HttpResponseMessage response;
            // Result objResult = null;
            // UserBAL objUserBLL = new UserBAL();
            // try
            // {
            //     objResult = objUserBLL.IsValidUser(UserName, Password);
            //     logger.Debug("No");
            // }
            // catch (Exception ex)
            // {  

            // logger.ErrorException("Error Occured", ex);


            // }
            // if (objResult != null)
            // {
            //     response = Request.CreateResponse(HttpStatusCode.OK, objResult);

            // }
            // else
            // {
            //     response = Request.CreateResponse(HttpStatusCode.OK, "Data Empty!");
            // }
            // return response;
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
       // [Secure]
        public HttpResponseMessage GetUserList()
        {
            HttpResponseMessage response;
            Result objResult = null;
            UserBAL userBAL = new UserBAL();
            objResult = userBAL.GetUserList();
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
        [Secure]
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
        [HttpGet]
        public HttpResponseMessage GetMenuCRUDSelect(string menuID, string menuName)
        {
            HttpResponseMessage response;
            Result objResult = null;
            UserBAL userBAL = new UserBAL();
            objResult = userBAL.GetMenuCRUDSelect(menuID, menuName);
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
        public HttpResponseMessage getUserRoleDetails(string UserRole)
        {
            HttpResponseMessage response;
            Result objResult = null;
            UserBAL userBAL = new UserBAL();
            objResult = userBAL.getUserRoleDetails(UserRole);
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
        [HttpPost]
        public HttpResponseMessage insertMenu(UserDetails user)
        {
            HttpResponseMessage response;
            Result objResult = null;
            HttpClient client = new HttpClient();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            // Int64 userID = Int64.Parse(User.Identity.Name);
            UserBAL userBLL = new UserBAL();
            if (user.ID == 0)
            {
                // user.InsertedBy = ID;
                objResult = userBLL.insertMenu(user);
            }
            else
            {
                // user.UpdatedBy = userID;
                objResult = userBLL.UpdateUser(user);
            }
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
    }
}
