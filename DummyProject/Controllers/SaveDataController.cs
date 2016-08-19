using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using NLog;
using DummyProject.Models;
namespace DummyProject.Controllers
{
    public class SaveDataController : Controller
    {
        Logger logger = LogManager.GetLogger("databaseLogger");
        // GET: SaveData
        public ActionResult Index()
        {
           

            return View();
        }
        public ActionResult Registration()
        {

            return View();
        }
        public ActionResult DashBoard()
        {

            return View();
        }
        public ActionResult Menu()
        {

            return View();

        }
        //[HttpPost]
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
                Logger logger = LogManager.GetCurrentClassLogger();
               // Logger logger = LogManager.GetLogger("databaseLogger");
                logger.ErrorException("Error occured in Login controller", ex);
                //logger.Error(ex);  
            }
            return View();
        }

    }
}