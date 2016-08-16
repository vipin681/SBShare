using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using NLog;
namespace DummyProject.Controllers
{
    public class SaveDataController : Controller
    {
        Logger logger = LogManager.GetCurrentClassLogger();
        #region GetUser

        public ActionResult DashBoard()
        {

            return View();
        }

        #endregion



        // GET: SaveData
        public ActionResult Index()
        {
           
            return View();
        }
        public ActionResult Registration()
        {

            return View();
        }
       
        public ActionResult Menu()
        {

            return View();

        }
        public ActionResult UpdatePassword()
        {
            return View();
        }
        public ActionResult Login()
        {
            try
            {
                int x = 0;
                int y = 5;
                int z = y / x;
            }
            catch (Exception ex)
            {
                logger.ErrorException("Error occured in Login controller", ex);
                //logger.Error(ex);  
            }



            return View();
        }
    }
}