using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace DummyProject.Controllers
{
    public class SaveDataController : Controller
    {
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
    }
}